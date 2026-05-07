'use client';
/**
 * Notification hooks with localStorage cache, TTL, and auto-polling.
 * Uses the /api/notifications API route for data fetching.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────

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

interface CacheEntry {
  data: NotificationItem[];
  fetchedAt: number;
}

// ─── Cache Constants ────────────────────────────────────────────────

const CACHE_KEY_PREFIX = 'fl_notif_cache_';
const CACHE_TTL_MS = 30_000; // 30 seconds
const POLL_INTERVAL_MS = 60_000; // 60 seconds

// ─── Cache Helpers ──────────────────────────────────────────────────

function getCache(userId: string): NotificationItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(userId: string, data: NotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry = { data, fetchedAt: Date.now() };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${userId}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

// ─── API Helper ─────────────────────────────────────────────────────

async function fetchFromAPI(userId: string): Promise<NotificationItem[]> {
  const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const json = await res.json();
  return json.notifications || [];
}

async function markReadAPI(userId: string, notificationId: string): Promise<boolean> {
  const res = await fetch('/api/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, notificationId }),
  });
  return res.ok;
}

async function markAllReadAPI(userId: string): Promise<boolean> {
  const res = await fetch('/api/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, markAll: true }),
  });
  return res.ok;
}

// ─── Hook: useNotifications ─────────────────────────────────────────

/**
 * Fetches notifications with localStorage cache + TTL.
 * Auto-polls every 60 seconds when userId is provided.
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  // Fetch notifications (cache-first, then API)
  const refresh = useCallback(async (forceRefresh = false) => {
    if (!userId) return;

    // Try cache first (unless forced)
    if (!forceRefresh) {
      const cached = getCache(userId);
      if (cached) {
        if (mountedRef.current) setNotifications(cached);
        return;
      }
    }

    if (mountedRef.current) setLoading(true);
    try {
      const data = await fetchFromAPI(userId);
      setCache(userId, data);
      if (mountedRef.current) {
        setNotifications(data);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      if (mountedRef.current) setError('Failed to fetch notifications');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [userId]);

  // Mark single notification as read (optimistic)
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));

    try {
      await markReadAPI(userId, notificationId);
      // Refresh to get latest state from server
      await refresh(true);
    } catch {
      // Revert on error
      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: false } : n)));
    }
  }, [userId, refresh]);

  // Mark all as read (optimistic)
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await markAllReadAPI(userId);
      await refresh(true);
    } catch {
      // Revert on error — just refresh
      await refresh(true);
    }
  }, [userId, refresh]);

  // Computed values
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initial load + auto-poll
  useEffect(() => {
    mountedRef.current = true;
    if (userId) {
      refresh();
      intervalRef.current = setInterval(() => {
        refresh(true); // Always force refresh on poll
      }, POLL_INTERVAL_MS);
    }
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId, refresh]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}

// ─── Hook: useUnreadCount ───────────────────────────────────────────

/**
 * Lightweight hook that only tracks unread notification count.
 * Uses localStorage cache + TTL, polls every 60 seconds.
 * Designed for Navbar use — minimal overhead.
 */
export function useUnreadCount(userId: string | undefined): number {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchCount = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      if (mountedRef.current) setCount(0);
      return;
    }

    // Try cache
    if (!forceRefresh) {
      const cached = getCache(userId);
      if (cached) {
        if (mountedRef.current) setCount(cached.filter(n => !n.read).length);
        return;
      }
    }

    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const json = await res.json();
      const notifs: NotificationItem[] = json.notifications || [];
      setCache(userId, notifs);
      if (mountedRef.current) setCount(notifs.filter(n => !n.read).length);
    } catch {
      // Silent fail — don't spam console
    }
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;
    intervalRef.current = setInterval(() => {
      fetchCount(true);
    }, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCount]);

  return count;
}

// ─── Helper: Create Notification (for client-side use) ──────────────

/**
 * Create a notification via the API. Used when liking/commenting on posts.
 */
export async function createNotification(params: {
  userId: string;
  type: string;
  fromUserId: string;
  message: string;
  link?: string;
  fromUser?: { name: string; membershipId?: string; image?: string };
  postId?: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch {
    return false;
  }
}
