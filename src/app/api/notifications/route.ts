import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

// ─── Types ───────────────────────────────────────────────────────────

interface NotificationItem {
  id: string;
  type: string;
  fromUserId: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  fromUser?: { name: string; membershipId?: string; image?: string };
  postId?: string;
}

// ─── Helper: GitHub API with PAT ────────────────────────────────────

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'FocusLinks-App',
  };
  const pat = process.env.GITHUB_PAT;
  if (pat) {
    headers['Authorization'] = `token ${pat}`;
  }
  return headers;
}

async function fetchNotificationsFromGitHub(userId: string): Promise<NotificationItem[]> {
  const rawUrl = `${RAW_BASE_URL}/Notifications/${userId}_notifications.json?t=${Date.now()}`;
  const res = await fetch(rawUrl, { cache: 'no-store' });
  if (!res.ok) return [];
  const text = await res.text();
  if (!text || !text.trim()) return [];
  const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  try {
    return JSON.parse(sanitized) as NotificationItem[];
  } catch {
    return [];
  }
}

async function saveNotificationsToGitHub(userId: string, notifications: NotificationItem[], message: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Notifications/${userId}_notifications.json`;
  const headers = getGitHubHeaders();

  // Get current SHA
  let sha: string | undefined;
  const getRes = await fetch(url, { headers });
  if (getRes.ok) {
    const fileData = await getRes.json();
    sha = fileData.sha;
  }

  const contentStr = JSON.stringify(notifications, null, 2);
  const encoded = Buffer.from(contentStr).toString('base64');

  const putRes = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: encoded, sha }),
  });

  return putRes.ok;
}

// ─── GET: Fetch notifications for a user ─────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const notifications = await fetchNotificationsFromGitHub(userId);
    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new notification ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, fromUserId, message, link, fromUser, postId } = body;

    if (!userId || !type || !fromUserId || !message) {
      return NextResponse.json(
        { error: 'userId, type, fromUserId, and message are required' },
        { status: 400 }
      );
    }

    // Fetch existing notifications
    const existing = await fetchNotificationsFromGitHub(userId);
    const list = [...existing];

    // Check for duplicate (same type + fromUserId in last 10 minutes)
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    const isDuplicate = list.some(
      n =>
        n.type === type &&
        n.fromUserId === fromUserId &&
        (postId ? n.postId === postId : !n.postId) &&
        new Date(n.timestamp).getTime() > tenMinAgo
    );

    if (isDuplicate) {
      return NextResponse.json({ success: true, skipped: true, message: 'Duplicate notification prevented' });
    }

    // Add new notification at the beginning
    const newNotification: NotificationItem = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      fromUserId,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      link: link || `/user/${fromUserId}`,
      fromUser: fromUser || undefined,
      postId: postId || undefined,
    };

    list.unshift(newNotification);

    // Keep only last 50 to avoid file bloat
    const trimmed = list.slice(0, 50);

    const ok = await saveNotificationsToGitHub(
      userId,
      trimmed,
      `Notification for ${userId}: ${type} from ${fromUserId}`
    );

    if (!ok) {
      return NextResponse.json({ error: 'Failed to save notification to GitHub' }, { status: 500 });
    }

    return NextResponse.json({ success: true, notification: newNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// ─── PUT: Mark notifications as read ─────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationId, markAll } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const existing = await fetchNotificationsFromGitHub(userId);
    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: true, message: 'No notifications found' });
    }

    let updatedCount = 0;

    if (markAll) {
      // Mark all as read
      existing.forEach(n => {
        if (!n.read) {
          n.read = true;
          updatedCount++;
        }
      });
    } else if (notificationId) {
      // Mark single notification as read
      const target = existing.find(n => n.id === notificationId);
      if (target && !target.read) {
        target.read = true;
        updatedCount = 1;
      }
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAll is required' },
        { status: 400 }
      );
    }

    const ok = await saveNotificationsToGitHub(
      userId,
      existing,
      `Mark ${updatedCount} notification(s) read for ${userId}`
    );

    if (!ok) {
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} notification(s) marked as read`,
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
