'use client';
/**
 * Service for managing connections, follows, and notifications on GitHub.
 * 
 * Data Architecture:
 * - Connections/{userId}_connections.json → { sent: [], received: [] }
 * - Connections/{userId}_following.json → [ { userId, timestamp } ]
 * - Notifications/{userId}_notifications.json → [ notification objects ]
 * 
 * Connection: One-sided request. Mutual when both accept each other.
 * Follow: Just watching someone's content in feed (one-way).
 */

import { fetchGitHubJson, updateGitHubFile } from './githubService';

// ─── Types ───────────────────────────────────────────────────────────

export interface ConnectionEntry {
  userId: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ConnectionData {
  sent: ConnectionEntry[];
  received: ConnectionEntry[];
}

export interface FollowEntry {
  userId: string;
  timestamp: string;
}

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'follow'
  | 'unfollow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'new_follower'
  | 'post_like'
  | 'post_comment'
  | 'system';

export interface NotificationItem {
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

// ─── Connection Helpers ─────────────────────────────────────────────

/**
 * Fetch connection data for a user from GitHub
 */
export async function fetchConnections(userId: string): Promise<ConnectionData | null> {
  return fetchGitHubJson<ConnectionData>(`Connections/${userId}_connections.json`);
}

/**
 * Fetch following list for a user from GitHub
 */
export async function fetchFollowing(userId: string): Promise<FollowEntry[] | null> {
  return fetchGitHubJson<FollowEntry[]>(`Connections/${userId}_following.json`);
}

/**
 * Fetch notifications for a user from GitHub
 */
export async function fetchNotifications(userId: string): Promise<NotificationItem[] | null> {
  return fetchGitHubJson<NotificationItem[]>(`Notifications/${userId}_notifications.json`);
}

/**
 * Fetch unread notification count for a user
 */
export async function fetchUnreadCount(userId: string): Promise<number> {
  const notifs = await fetchNotifications(userId);
  if (!notifs) return 0;
  return notifs.filter(n => !n.read).length;
}

// ─── Connection Actions ─────────────────────────────────────────────

/**
 * Send a connection request to another user
 */
export async function sendConnectionRequest(
  fromUserId: string,
  toUserId: string,
  fromName: string
): Promise<boolean> {
  // 1. Add to sender's sent list
  const senderConnections = await fetchConnections(fromUserId);
  const senderData: ConnectionData = senderConnections || { sent: [], received: [] };
  
  // Check if already sent or connected
  const existing = senderData.sent.find(c => c.userId === toUserId);
  if (existing) {
    if (existing.status === 'pending') return false; // Already pending
    if (existing.status === 'rejected') {
      // Allow re-sending after rejection
      existing.status = 'pending';
      existing.timestamp = new Date().toISOString();
    }
  } else {
    senderData.sent.push({
      userId: toUserId,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });
  }

  const ok1 = await updateGitHubFile(
    `Connections/${fromUserId}_connections.json`,
    senderData,
    `Connection request sent to ${toUserId} by ${fromUserId}`
  );
  if (!ok1) return false;

  // 2. Add to receiver's received list
  const receiverConnections = await fetchConnections(toUserId);
  const receiverData: ConnectionData = receiverConnections || { sent: [], received: [] };

  const existingReceived = receiverData.received.find(c => c.userId === fromUserId);
  if (existingReceived) {
    if (existingReceived.status === 'rejected') {
      existingReceived.status = 'pending';
      existingReceived.timestamp = new Date().toISOString();
    }
  } else {
    receiverData.received.push({
      userId: fromUserId,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });
  }

  const ok2 = await updateGitHubFile(
    `Connections/${toUserId}_connections.json`,
    receiverData,
    `Connection request received from ${fromUserId} for ${toUserId}`
  );

  // 3. Create notification for receiver
  if (ok2) {
    await addNotification(toUserId, {
      type: 'connection_request',
      fromUserId,
      message: `${fromName} wants to connect with you`,
      link: `/user/${fromUserId}`,
    });
  }

  return ok2;
}

/**
 * Accept a connection request
 */
export async function acceptConnection(
  acceptorUserId: string,
  requesterUserId: string,
  acceptorName: string
): Promise<boolean> {
  // 1. Update acceptor's received list
  const acceptorConnections = await fetchConnections(acceptorUserId);
  if (!acceptorConnections) return false;

  const request = acceptorConnections.received.find(c => c.userId === requesterUserId);
  if (!request || request.status !== 'pending') return false;
  request.status = 'accepted';

  const ok1 = await updateGitHubFile(
    `Connections/${acceptorUserId}_connections.json`,
    acceptorConnections,
    `Connection accepted from ${requesterUserId} by ${acceptorUserId}`
  );
  if (!ok1) return false;

  // 2. Update requester's sent list
  const requesterConnections = await fetchConnections(requesterUserId);
  if (requesterConnections) {
    const sent = requesterConnections.sent.find(c => c.userId === acceptorUserId);
    if (sent) sent.status = 'accepted';

    await updateGitHubFile(
      `Connections/${requesterUserId}_connections.json`,
      requesterConnections,
      `Connection accepted by ${acceptorUserId} for ${requesterUserId}`
    );
  }

  // 3. Notify the requester
  await addNotification(requesterUserId, {
    type: 'connection_accepted',
    fromUserId: acceptorUserId,
    message: `${acceptorName} accepted your connection request! You are now connected.`,
    link: `/user/${acceptorUserId}`,
  });

  return true;
}

/**
 * Reject a connection request
 */
export async function rejectConnection(
  rejectorUserId: string,
  requesterUserId: string
): Promise<boolean> {
  // 1. Update rejector's received list
  const rejectorConnections = await fetchConnections(rejectorUserId);
  if (!rejectorConnections) return false;

  const request = rejectorConnections.received.find(c => c.userId === requesterUserId);
  if (!request || request.status !== 'pending') return false;
  request.status = 'rejected';

  const ok1 = await updateGitHubFile(
    `Connections/${rejectorUserId}_connections.json`,
    rejectorConnections,
    `Connection rejected from ${requesterUserId} by ${rejectorUserId}`
  );
  if (!ok1) return false;

  // 2. Update requester's sent list
  const requesterConnections = await fetchConnections(requesterUserId);
  if (requesterConnections) {
    const sent = requesterConnections.sent.find(c => c.userId === rejectorUserId);
    if (sent) sent.status = 'rejected';

    await updateGitHubFile(
      `Connections/${requesterUserId}_connections.json`,
      requesterConnections,
      `Connection rejected by ${rejectorUserId} for ${requesterUserId}`
    );
  }

  return true;
}

/**
 * Cancel a sent connection request
 */
export async function cancelConnection(
  cancellerUserId: string,
  targetUserId: string
): Promise<boolean> {
  const cancellerConnections = await fetchConnections(cancellerUserId);
  if (!cancellerConnections) return false;

  cancellerConnections.sent = cancellerConnections.sent.filter(c => c.userId !== targetUserId);

  const ok1 = await updateGitHubFile(
    `Connections/${cancellerUserId}_connections.json`,
    cancellerConnections,
    `Connection cancelled to ${targetUserId} by ${cancellerUserId}`
  );
  if (!ok1) return false;

  // Also update target's received
  const targetConnections = await fetchConnections(targetUserId);
  if (targetConnections) {
    targetConnections.received = targetConnections.received.filter(c => c.userId !== cancellerUserId);
    await updateGitHubFile(
      `Connections/${targetUserId}_connections.json`,
      targetConnections,
      `Connection request removed from ${cancellerUserId} for ${targetUserId}`
    );
  }

  return true;
}

/**
 * Remove a connection (disconnect)
 */
export async function removeConnection(
  removerUserId: string,
  targetUserId: string
): Promise<boolean> {
  // Remove from both sides
  const removerConnections = await fetchConnections(removerUserId);
  if (removerConnections) {
    removerConnections.sent = removerConnections.sent.filter(
      c => !(c.userId === targetUserId && c.status === 'accepted')
    );
    removerConnections.received = removerConnections.received.filter(
      c => !(c.userId === targetUserId && c.status === 'accepted')
    );
    await updateGitHubFile(
      `Connections/${removerUserId}_connections.json`,
      removerConnections,
      `Disconnected from ${targetUserId} by ${removerUserId}`
    );
  }

  const targetConnections = await fetchConnections(targetUserId);
  if (targetConnections) {
    targetConnections.sent = targetConnections.sent.filter(
      c => !(c.userId === removerUserId && c.status === 'accepted')
    );
    targetConnections.received = targetConnections.received.filter(
      c => !(c.userId === removerUserId && c.status === 'accepted')
    );
    await updateGitHubFile(
      `Connections/${targetUserId}_connections.json`,
      targetConnections,
      `Disconnected from ${removerUserId} for ${targetUserId}`
    );
  }

  return true;
}

// ─── Connection Status Check ────────────────────────────────────────

export type ConnectionStatus = 
  | 'none'          // No relationship
  | 'pending_sent'  // Current user sent a request
  | 'pending_received' // Target sent a request to current user
  | 'connected'     // Mutual connection
  | 'rejected';     // Request was rejected

/**
 * Check the connection status between two users
 */
export async function getConnectionStatus(
  currentUserId: string,
  targetUserId: string
): Promise<ConnectionStatus> {
  if (currentUserId === targetUserId) return 'connected';

  const data = await fetchConnections(currentUserId);
  if (!data) return 'none';

  // Check sent
  const sent = data.sent.find(c => c.userId === targetUserId);
  if (sent) {
    if (sent.status === 'pending') return 'pending_sent';
    if (sent.status === 'accepted') return 'connected';
    if (sent.status === 'rejected') return 'rejected';
  }

  // Check received
  const received = data.received.find(c => c.userId === targetUserId);
  if (received) {
    if (received.status === 'pending') return 'pending_received';
    if (received.status === 'accepted') return 'connected';
    if (received.status === 'rejected') return 'rejected';
  }

  return 'none';
}

/**
 * Get list of mutual connection user IDs
 */
export function getMutualConnections(data: ConnectionData): string[] {
  const acceptedSent = data.sent.filter(c => c.status === 'accepted').map(c => c.userId);
  const acceptedReceived = data.received.filter(c => c.status === 'accepted').map(c => c.userId);
  // Union of accepted sent + received = all connections
  return [...new Set([...acceptedSent, ...acceptedReceived])];
}

// ─── Follow Actions ─────────────────────────────────────────────────

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  targetId: string,
  followerName: string
): Promise<boolean> {
  const following = await fetchFollowing(followerId);
  const list: FollowEntry[] = following || [];

  const already = list.find(f => f.userId === targetId);
  if (already) return true; // Already following

  list.push({ userId: targetId, timestamp: new Date().toISOString() });

  const ok = await updateGitHubFile(
    `Connections/${followerId}_following.json`,
    list,
    `${followerId} started following ${targetId}`
  );

  if (ok) {
    await addNotification(targetId, {
      type: 'follow',
      fromUserId: followerId,
      message: `${followerName} started following you`,
      link: `/user/${followerId}`,
    });
  }

  return ok;
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  targetId: string
): Promise<boolean> {
  const following = await fetchFollowing(followerId);
  if (!following) return false;

  const filtered = following.filter(f => f.userId !== targetId);
  if (filtered.length === following.length) return true; // Not following

  return updateGitHubFile(
    `Connections/${followerId}_following.json`,
    filtered,
    `${followerId} unfollowed ${targetId}`
  );
}

/**
 * Check if a user follows another
 */
export async function isFollowing(
  followerId: string,
  targetId: string
): Promise<boolean> {
  const following = await fetchFollowing(followerId);
  if (!following) return false;
  return following.some(f => f.userId === targetId);
}

/**
 * Get follower count (users who follow the given user)
 * This is expensive - counts from all connections files
 * For performance, we use a simpler approach: store in user data
 */
export function getFollowingCount(followingList: FollowEntry[] | null): number {
  return followingList?.length || 0;
}

// ─── Notification Actions ───────────────────────────────────────────

/**
 * Add a notification for a user
 */
export async function addNotification(
  targetUserId: string,
  notification: {
    type: NotificationType;
    fromUserId: string;
    message: string;
    link?: string;
  }
): Promise<boolean> {
  const notifications = await fetchNotifications(targetUserId);
  const list: NotificationItem[] = notifications || [];

  // Add new notification at the beginning
  list.unshift({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: notification.type,
    fromUserId: notification.fromUserId,
    message: notification.message,
    timestamp: new Date().toISOString(),
    read: false,
    link: notification.link,
  });

  // Keep only last 50 notifications to avoid file bloat
  const trimmed = list.slice(0, 50);

  return updateGitHubFile(
    `Notifications/${targetUserId}_notifications.json`,
    trimmed,
    `Notification for ${targetUserId}: ${notification.type}`
  );
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const notifications = await fetchNotifications(userId);
  if (!notifications) return false;

  const notif = notifications.find(n => n.id === notificationId);
  if (notif) notif.read = true;

  return updateGitHubFile(
    `Notifications/${userId}_notifications.json`,
    notifications,
    `Mark notification read for ${userId}`
  );
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  const notifications = await fetchNotifications(userId);
  if (!notifications) return true; // No notifications = success

  notifications.forEach(n => { n.read = true; });

  return updateGitHubFile(
    `Notifications/${userId}_notifications.json`,
    notifications,
    `Mark all notifications read for ${userId}`
  );
}

// ─── Feed Helpers ───────────────────────────────────────────────────

/**
 * Get all user IDs whose posts should appear in "Connections" feed
 * Includes: mutual connections + following
 */
export async function getFeedUserIds(currentUserId: string): Promise<string[]> {
  const [connections, following] = await Promise.all([
    fetchConnections(currentUserId),
    fetchFollowing(currentUserId),
  ]);

  const userIds = new Set<string>();

  if (connections) {
    getMutualConnections(connections).forEach(id => userIds.add(id));
  }

  if (following) {
    following.forEach(f => userIds.add(f.userId));
  }

  return Array.from(userIds);
}

// ─── Utility ────────────────────────────────────────────────────────

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  return date.toLocaleDateString();
}

export function getNotificationTypeInfo(type: string) {
  switch (type) {
    case 'connection_request':
      return { label: 'Connection Request', color: 'emerald' };
    case 'connection_accepted':
      return { label: 'Connected', color: 'blue' };
    case 'follow':
      return { label: 'New Follower', color: 'purple' };
    case 'new_follower':
      return { label: 'New Follower', color: 'purple' };
    case 'unfollow':
      return { label: 'Unfollowed', color: 'slate' };
    case 'like':
      return { label: 'Like', color: 'rose' };
    case 'post_like':
      return { label: 'Like', color: 'rose' };
    case 'comment':
      return { label: 'Comment', color: 'amber' };
    case 'post_comment':
      return { label: 'Comment', color: 'amber' };
    case 'mention':
      return { label: 'Mention', color: 'teal' };
    case 'system':
      return { label: 'System', color: 'cyan' };
    default:
      return { label: 'Notification', color: 'slate' };
  }
}
