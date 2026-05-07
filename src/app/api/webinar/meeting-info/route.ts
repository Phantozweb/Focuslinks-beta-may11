import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const MEETING_INFO_PATH = 'Webinar/meeting-info.json';

// In-memory cache (2-minute TTL)
let cachedMeetingInfo: Record<string, string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

interface MeetingInfoData {
  meetingLink: string;
  meetingTime: string;
  meetingEndTime: string;
  platform: string;
  status: string;
  fallbackLink?: string;
  lastUpdated?: string;
  updatedBy?: string;
}

/**
 * GET — Fetch current meeting-info.json from GitHub.
 * Returns cached data if fresh, otherwise fetches via GitHub Contents API.
 */
export async function GET() {
  try {
    const now = Date.now();

    // Return cached data if fresh
    if (cachedMeetingInfo && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, data: cachedMeetingInfo, cached: true });
    }

    const GITHUB_PAT = process.env.GITHUB_PAT;
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MEETING_INFO_PATH}`;

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'FocusLinks-App',
    };
    if (GITHUB_PAT) {
      headers['Authorization'] = `token ${GITHUB_PAT}`;
    }

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { headers, cache: 'no-store', signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        data: null,
        error: `Meeting info not found on GitHub (status ${response.status}). The hardcoded fallback link will be used.`,
      });
    }

    const fileData = await response.json();
    const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const sanitized = decoded.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    const data = JSON.parse(sanitized) as MeetingInfoData;

    cachedMeetingInfo = data as unknown as Record<string, string>;
    cacheTimestamp = now;

    return NextResponse.json({ success: true, data, cached: false });
  } catch (error) {
    console.error('Error fetching meeting info:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch meeting info',
    });
  }
}

/**
 * POST — Create or update meeting-info.json on GitHub.
 * Used by admin to set/change the meeting link remotely.
 *
 * Body: {
 *   meetingLink: string,
 *   meetingTime: string,
 *   meetingEndTime: string,
 *   platform: string,
 *   status: string,
 *   updatedBy?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const GITHUB_PAT = process.env.GITHUB_PAT;

    if (!GITHUB_PAT) {
      return NextResponse.json(
        { success: false, error: 'GITHUB_PAT is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await request.json() as Partial<MeetingInfoData>;

    // Validate required fields
    if (!body.meetingLink || typeof body.meetingLink !== 'string') {
      return NextResponse.json(
        { success: false, error: 'meetingLink is required and must be a string.' },
        { status: 400 }
      );
    }

    // Build the meeting info object
    const meetingInfo: MeetingInfoData = {
      meetingLink: body.meetingLink.trim(),
      meetingTime: body.meetingTime || '2026-05-06T13:30:00Z',
      meetingEndTime: body.meetingEndTime || '2026-05-06T15:30:00Z',
      platform: body.platform || 'Google Meet',
      status: body.status || 'scheduled',
      fallbackLink: body.meetingLink.trim(),
      lastUpdated: new Date().toISOString(),
      updatedBy: body.updatedBy || 'admin',
    };

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MEETING_INFO_PATH}`;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FocusLinks-App',
      'Authorization': `token ${GITHUB_PAT}`,
    };

    // Check if file already exists (need SHA for update)
    let sha: string | undefined;
    const getResponse = await fetch(url, { headers });
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Create or update the file
    const contentStr = JSON.stringify(meetingInfo, null, 2);
    const encodedContent = Buffer.from(contentStr).toString('base64');

    const putResponse = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: sha
          ? `Update meeting info — link: ${meetingInfo.meetingLink}`
          : `Initialize meeting info — link: ${meetingInfo.meetingLink}`,
        content: encodedContent,
        sha,
      }),
    });

    if (!putResponse.ok) {
      const errorData = await putResponse.json();
      throw new Error(errorData.message || `GitHub API returned ${putResponse.status}`);
    }

    // Invalidate cache
    cachedMeetingInfo = meetingInfo as unknown as Record<string, string>;
    cacheTimestamp = Date.now();

    return NextResponse.json({
      success: true,
      message: sha ? 'Meeting info updated on GitHub' : 'Meeting info created on GitHub',
      data: meetingInfo,
    });
  } catch (error) {
    console.error('Error updating meeting info:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update meeting info on GitHub',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Remove meeting-info.json from GitHub (reset to hardcoded fallback).
 */
export async function DELETE() {
  try {
    const GITHUB_PAT = process.env.GITHUB_PAT;

    if (!GITHUB_PAT) {
      return NextResponse.json(
        { success: false, error: 'GITHUB_PAT is not configured.' },
        { status: 500 }
      );
    }

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MEETING_INFO_PATH}`;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FocusLinks-App',
      'Authorization': `token ${GITHUB_PAT}`,
    };

    // Get current file SHA
    const getResponse = await fetch(url, { headers });
    if (!getResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'File does not exist on GitHub.',
      });
    }

    const fileData = await getResponse.json();

    const deleteResponse = await fetch(url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        message: 'Delete meeting-info.json — reverting to hardcoded fallback link',
        sha: fileData.sha,
      }),
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(errorData.message || 'Failed to delete from GitHub');
    }

    // Invalidate cache
    cachedMeetingInfo = null;
    cacheTimestamp = 0;

    return NextResponse.json({
      success: true,
      message: 'Meeting info deleted from GitHub. Hardcoded fallback link will be used.',
    });
  } catch (error) {
    console.error('Error deleting meeting info:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    );
  }
}
