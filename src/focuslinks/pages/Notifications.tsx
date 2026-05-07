'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BellOff, CheckCheck, UserPlus, MessageSquare,
  Heart, AtSign, UserMinus, Loader2, Eye, Clock,
  Handshake, X as XIcon, Info, PartyPopper
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { Link, useNavigate } from '../../context/NavigationContext';
import { useProfiles, generateSlug } from '../../hooks/useProfiles';
import { useNotifications } from '../../hooks/useNotifications';
import {
  acceptConnection,
  rejectConnection,
  NotificationItem,
  getNotificationTypeInfo,
  timeAgo,
  NotificationType,
} from '../../services/connectionsService';

// ─── Types ──────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread' | 'requests' | 'social';
type TimeGroup = 'Today' | 'Yesterday' | 'This Week' | 'Earlier';

interface FlUser {
  membershipId?: string;
  name?: string;
  email?: string;
  id?: string;
  avatar?: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────────

function getTimeGroup(timestamp: string): TimeGroup {
  const now = new Date();
  const date = new Date(timestamp);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  // This week: start from Monday (or Sunday based on locale)
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
  const weekStart = new Date(todayStart.getTime() - diffToMonday * 86400000);

  if (date >= todayStart) return 'Today';
  if (date >= yesterdayStart) return 'Yesterday';
  if (date >= weekStart) return 'This Week';
  return 'Earlier';
}

// Extended type icon map with system support
const typeIconMap: Record<string, React.ReactNode> = {
  connection_request: <UserPlus className="w-4 h-4" />,
  connection_accepted: <Handshake className="w-4 h-4" />,
  new_follower: <UserPlus className="w-4 h-4" />,
  follow: <UserPlus className="w-4 h-4" />,
  unfollow: <UserMinus className="w-4 h-4" />,
  like: <Heart className="w-4 h-4" />,
  post_like: <Heart className="w-4 h-4" />,
  comment: <MessageSquare className="w-4 h-4" />,
  post_comment: <MessageSquare className="w-4 h-4" />,
  mention: <AtSign className="w-4 h-4" />,
  system: <Info className="w-4 h-4" />,
};

const typeColorClass: Record<string, string> = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  slate: 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400',
  rose: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  teal: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
};

const typeBorderLeft: Record<string, string> = {
  connection_request: 'border-l-emerald-500',
  connection_accepted: 'border-l-blue-500',
  new_follower: 'border-l-purple-500',
  follow: 'border-l-purple-500',
  unfollow: 'border-l-slate-400',
  like: 'border-l-rose-500',
  post_like: 'border-l-rose-500',
  comment: 'border-l-amber-500',
  post_comment: 'border-l-amber-500',
  mention: 'border-l-teal-500',
  system: 'border-l-cyan-500',
};

// ─── Component ──────────────────────────────────────────────────────

export default function Notifications() {
  const [user, setUser] = useState<FlUser | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const navigate = useNavigate();
  const { listProfiles, fetchListProfiles } = useProfiles();

  // ── Load user from localStorage ──
  useEffect(() => {
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // ── Fetch profiles for name lookup ──
  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  // ── Use the notification hook for cached fetching + auto-poll ──
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications(user?.membershipId);

  // ── Profile lookup map ──
  const profileMap = useMemo(() => {
    const map = new Map<string, { name: string; image: string; membershipId: string }>();
    for (const p of listProfiles) {
      if (p.membershipId) {
        map.set(p.membershipId, {
          name: p.name || p.membershipId,
          image: p.image || '',
          membershipId: p.membershipId,
        });
      }
    }
    return map;
  }, [listProfiles]);

  // ── Computed values ──
  const requestCount = useMemo(
    () => notifications.filter(n => n.type === 'connection_request').length,
    [notifications]
  );
  const socialCount = useMemo(
    () => notifications.filter(n =>
      ['follow', 'like', 'comment', 'mention', 'connection_accepted', 'unfollow', 'new_follower', 'post_like', 'post_comment'].includes(n.type)
    ).length,
    [notifications]
  );
  const isAllRead = unreadCount === 0;

  // ── Filtered & grouped notifications ──
  const filteredNotifications = useMemo(() => {
    let items = [...notifications];
    switch (activeFilter) {
      case 'unread':
        items = items.filter(n => !n.read);
        break;
      case 'requests':
        items = items.filter(n => n.type === 'connection_request');
        break;
      case 'social':
        items = items.filter(n =>
          ['follow', 'like', 'comment', 'mention', 'connection_accepted', 'unfollow', 'new_follower', 'post_like', 'post_comment'].includes(n.type)
        );
        break;
    }
    return items;
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<TimeGroup, NotificationItem[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: [],
    };
    for (const notif of filteredNotifications) {
      const group = getTimeGroup(notif.timestamp);
      groups[group].push(notif);
    }
    return groups;
  }, [filteredNotifications]);

  // ── Handlers ──
  const handleMarkRead = useCallback(async (notifId: string) => {
    if (!user?.membershipId) return;
    const notif = notifications.find(n => n.id === notifId);
    if (!notif || notif.read) return;
    await markAsRead(notifId);
  }, [user?.membershipId, notifications, markAsRead]);

  const handleMarkAllRead = useCallback(async () => {
    if (!user?.membershipId) return;
    setMarkingAllRead(true);
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAllRead(false);
    }
  }, [user?.membershipId, markAllAsRead]);

  const handleAcceptConnection = useCallback(async (requesterUserId: string) => {
    if (!user?.membershipId || !user?.name) return;
    const notif = notifications.find(
      n => n.fromUserId === requesterUserId && n.type === 'connection_request'
    );
    if (!notif) return;
    setActionInProgress(notif.id);
    try {
      const ok = await acceptConnection(
        user.membershipId,
        requesterUserId,
        user.name
      );
      if (ok) {
        toast.success('Connection accepted!');
        await refresh();
        await fetchListProfiles();
      } else {
        toast.error('Failed to accept connection');
      }
    } catch {
      toast.error('Failed to accept connection');
    } finally {
      setActionInProgress(null);
    }
  }, [user?.membershipId, user?.name, notifications, refresh, fetchListProfiles]);

  const handleRejectConnection = useCallback(async (requesterUserId: string) => {
    if (!user?.membershipId) return;
    const notif = notifications.find(
      n => n.fromUserId === requesterUserId && n.type === 'connection_request'
    );
    if (!notif) return;
    setActionInProgress(notif.id);
    try {
      const ok = await rejectConnection(user.membershipId, requesterUserId);
      if (ok) {
        toast.success('Connection request declined');
        await refresh();
      } else {
        toast.error('Failed to decline connection');
      }
    } catch {
      toast.error('Failed to decline connection');
    } finally {
      setActionInProgress(null);
    }
  }, [user?.membershipId, notifications, refresh]);

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'requests', label: 'Requests', count: requestCount },
    { key: 'social', label: 'Social', count: socialCount },
  ];

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <>
    <SEO title="Notifications" description="View your notifications, connection requests, and updates from the FocusLinks community." keywords="notifications, alerts, community updates" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Page Heading */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Notifications
              </h1>
              {!isAllRead && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Mark All Read Button */}
          {!isAllRead && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllRead}
              disabled={markingAllRead}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-semibold text-sm border border-blue-100 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
            >
              {markingAllRead ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark All as Read
            </motion.button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide"
        >
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab.count}
              </span>
              {activeFilter === tab.key && (
                <motion.div
                  layoutId="activeNotifTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Content: Empty states or notification groups */}
        {notifications.length === 0 && activeFilter === 'all' ? (
          /* True empty state - no notifications at all */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-200 dark:border-emerald-800"
              />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                <PartyPopper className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              You&apos;re all caught up!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              No notifications yet. Start connecting with the FocusLinks community to see updates here.
            </p>
          </motion.div>
        ) : isAllRead && activeFilter === 'unread' ? (
          /* All-caught-up empty state for unread filter */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-200 dark:border-emerald-800"
              />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                <CheckCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              You&apos;re all caught up!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              No unread notifications. Check back later for new updates from the FocusLinks community.
            </p>
          </motion.div>
        ) : filteredNotifications.length === 0 ? (
          /* No-match empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700"
              />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <BellOff className="w-8 h-8 text-slate-300 dark:text-gray-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No notifications match the selected filter.
            </p>
          </motion.div>
        ) : (
          /* Notification groups */
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {(['Today', 'Yesterday', 'This Week', 'Earlier'] as TimeGroup[]).map((group, gi) =>
                groupedNotifications[group].length > 0 ? (
                  <motion.div
                    key={group}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: gi * 0.1 }}
                  >
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {group}
                    </h2>
                    <div className="space-y-2">
                      {groupedNotifications[group].map(notif => (
                        <NotificationCard
                          key={notif.id}
                          notif={notif}
                          profileMap={profileMap}
                          onMarkRead={handleMarkRead}
                          onAccept={handleAcceptConnection}
                          onReject={handleRejectConnection}
                          actionInProgress={actionInProgress}
                          markingAllRead={markingAllRead}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// ─── Notification Card ──────────────────────────────────────────────

function NotificationCard({
  notif,
  profileMap,
  onMarkRead,
  onAccept,
  onReject,
  actionInProgress,
  markingAllRead,
}: {
  notif: NotificationItem;
  profileMap: Map<string, { name: string; image: string; membershipId: string }>;
  onMarkRead: (id: string) => void;
  onAccept: (requesterUserId: string) => void;
  onReject: (requesterUserId: string) => void;
  actionInProgress: string | null;
  markingAllRead: boolean;
}) {
  const typeInfo = getNotificationTypeInfo(notif.type as NotificationType);
  const profile = profileMap.get(notif.fromUserId);
  const senderName = notif.type === 'system'
    ? 'FocusLinks'
    : (profile?.name || notif.fromUserId);
  const senderImage = profile?.image || '';
  const senderSlug = profile ? generateSlug(profile.name) : '';
  const icon = typeIconMap[notif.type] || <Bell className="w-4 h-4" />;
  const colorClass = typeColorClass[typeInfo.color] || typeColorClass.slate;
  const borderLeft = typeBorderLeft[notif.type] || 'border-l-slate-400';
  const isRequest = notif.type === 'connection_request';
  const isBusy = actionInProgress === notif.id;

  const handleClick = () => {
    if (!notif.read) onMarkRead(notif.id);
  };

  const profileLink = notif.type === 'system'
    ? (notif.link || '/')
    : (senderSlug ? `/user/${senderSlug}` : `/user/${notif.fromUserId}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      className={`group relative bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border-l-4 ${borderLeft} border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${
        notif.read ? '' : 'ring-1 ring-blue-100 dark:ring-blue-900/50'
      } ${markingAllRead ? 'opacity-50 scale-[0.98]' : ''}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Avatar / Icon */}
        <div className="shrink-0 mt-0.5">
          {notif.type === 'system' ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Eye className="w-4 h-4" />
            </div>
          ) : senderImage ? (
            <img
              src={senderImage}
              alt={senderName}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-slate-600"
            />
          ) : (
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={profileLink}
                  onClick={e => e.stopPropagation()}
                  className={`text-sm font-bold truncate hover:underline ${
                    notif.read
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {senderName}
                </Link>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    typeInfo.color === 'emerald'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : typeInfo.color === 'blue'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : typeInfo.color === 'purple'
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : typeInfo.color === 'rose'
                            ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                            : typeInfo.color === 'amber'
                              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              : typeInfo.color === 'teal'
                                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                                : typeInfo.color === 'cyan'
                                  ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {typeInfo.label}
                </span>
                {!notif.read && (
                  <motion.div
                    layoutId={`unread-dot-${notif.id}`}
                    className="w-2 h-2 rounded-full bg-blue-500 shrink-0"
                  />
                )}
              </div>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  notif.read
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {notif.message}
              </p>
            </div>
          </div>

          {/* Footer: timestamp + action buttons */}
          <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
            <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(notif.timestamp)}
            </span>

            {isRequest ? (
              /* Accept / Decline buttons for connection requests */
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isBusy}
                  onClick={e => {
                    e.stopPropagation();
                    onAccept(notif.fromUserId);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isBusy ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3 h-3" />
                  )}
                  Accept
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isBusy}
                  onClick={e => {
                    e.stopPropagation();
                    onReject(notif.fromUserId);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XIcon className="w-3 h-3" />
                  Decline
                </motion.button>
              </div>
            ) : notif.type === 'system' ? null : (
              /* View button for other notification types */
              <Link
                to={senderSlug ? `/user/${senderSlug}` : (notif.link || `/user/${notif.fromUserId}`)}
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <Eye className="w-3 h-3" />
                View
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
