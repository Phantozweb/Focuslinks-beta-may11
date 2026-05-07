'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserPlus, Users, Send, UserCheck, X, MessageCircle,
  Link2, Link2Off, Loader2, MapPin, Clock, BadgeCheck,
  Inbox, UserMinus, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from '../../context/NavigationContext';
import {
  fetchConnections,
  fetchFollowing,
  acceptConnection,
  rejectConnection,
  cancelConnection,
  removeConnection,
  unfollowUser,
  getMutualConnections,
  timeAgo,
  ConnectionData,
  FollowEntry,
} from '../../services/connectionsService';
import SEO from '../components/SEO';
import { useProfiles, Profile } from '../../hooks/useProfiles';

type TabKey = 'requests' | 'connected' | 'sent' | 'following';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TAB_CONFIG: TabConfig[] = [
  { key: 'requests', label: 'Requests', icon: <Inbox className="w-4 h-4" /> },
  { key: 'connected', label: 'Connected', icon: <UserCheck className="w-4 h-4" /> },
  { key: 'sent', label: 'Sent', icon: <Send className="w-4 h-4" /> },
  { key: 'following', label: 'Following', icon: <UserPlus className="w-4 h-4" /> },
];

const AVATAR_GRADIENTS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-blue-500',
  'from-lime-500 to-green-500',
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function Avatar({ profile, name }: { profile?: Profile | null; name: string }) {
  const initials = getInitials(name);
  const gradient = getGradient(name);

  if (profile?.image && profile.image !== 'none') {
    return (
      <img
        src={profile.image}
        alt={name}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
        }}
        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
      <span className="text-white font-bold text-sm">{initials}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
        <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-1.5" />
        <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        <div className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const configs: Record<TabKey, { icon: React.ReactNode; title: string; description: string }> = {
    requests: {
      icon: <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600" />,
      title: 'No pending requests',
      description: 'When someone sends you a connection request, it will appear here.',
    },
    connected: {
      icon: <Link2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />,
      title: 'No connections yet',
      description: 'Accept connection requests to start building your network.',
    },
    sent: {
      icon: <Send className="w-10 h-10 text-slate-300 dark:text-slate-600" />,
      title: 'No sent requests',
      description: 'Connection requests you send will appear here until they are accepted.',
    },
    following: {
      icon: <UserPlus className="w-10 h-10 text-slate-300 dark:text-slate-600" />,
      title: 'Not following anyone',
      description: 'Follow other members to see their posts and activity in your feed.',
    },
  };

  const config = configs[tab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {config.icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{config.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{config.description}</p>
      {tab === 'connected' && (
        <Link
          to="/directory"
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
        >
          <Search className="w-4 h-4" />
          Find People
        </Link>
      )}
    </motion.div>
  );
}

function ConnectionCard({
  userId,
  timestamp,
  profile,
  tab,
  onAccept,
  onReject,
  onCancel,
  onDisconnect,
  onUnfollow,
  actionLoading,
}: {
  userId: string;
  timestamp: string;
  profile?: Profile | null;
  tab: TabKey;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onDisconnect: (id: string) => Promise<void>;
  onUnfollow: (id: string) => Promise<void>;
  actionLoading: string | null;
}) {
  const name = profile?.name || `User ${userId.slice(0, 8)}`;
  const title = profile?.title || '';
  const location = profile?.location || '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar profile={profile} name={name} />
          {tab === 'connected' && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                <UserCheck className="w-3 h-3 text-white" />
              </span>
            </div>
          )}
          {tab === 'sent' && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                <Clock className="w-3 h-3 text-white" />
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Link
              to={`/user/${userId}`}
              className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
            >
              {name}
            </Link>
            {profile?.verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
            )}
          </div>
          {title && (
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-0.5">{title}</p>
          )}
          <div className="flex items-center gap-3">
            {location && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(timestamp)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {tab === 'requests' && (
            <>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onAccept(userId)}
                disabled={actionLoading === userId}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading === userId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                Accept
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onReject(userId)}
                disabled={actionLoading === userId}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {actionLoading === userId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                Decline
              </motion.button>
            </>
          )}
          {tab === 'connected' && (
            <>
              <Link
                to="/messages"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl font-semibold text-xs transition-colors border border-blue-200 dark:border-blue-800/50"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Message
              </Link>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onDisconnect(userId)}
                disabled={actionLoading === userId}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-semibold text-xs transition-colors border border-gray-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 disabled:opacity-50"
              >
                {actionLoading === userId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Link2Off className="w-3.5 h-3.5" />
                )}
                Disconnect
              </motion.button>
            </>
          )}
          {tab === 'sent' && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onCancel(userId)}
              disabled={actionLoading === userId}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-semibold text-xs transition-colors border border-gray-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 disabled:opacity-50"
            >
              {actionLoading === userId ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              Cancel
            </motion.button>
          )}
          {tab === 'following' && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onUnfollow(userId)}
              disabled={actionLoading === userId}
              className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-semibold text-xs transition-colors border border-gray-200 dark:border-slate-600 hover:border-rose-200 dark:hover:border-rose-800 disabled:opacity-50"
            >
              {actionLoading === userId ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserMinus className="w-3.5 h-3.5" />
              )}
              Unfollow
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Connections() {
  const navigate = useNavigate();
  const { listProfiles, fetchListProfiles } = useProfiles();

  const [activeTab, setActiveTab] = useState<TabKey>('requests');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Data
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [followingList, setFollowingList] = useState<FollowEntry[]>([]);

  // Auth check
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('fl_user');
    if (!stored) {
      navigate('/login');
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (user?.membershipId) {
        setUserId(user.membershipId);
        setUserName(user.name || '');
      } else {
        navigate('/login');
      }
    } catch {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch profiles list for lookup
  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  // Fetch connections and following data
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [connData, followData] = await Promise.all([
        fetchConnections(userId),
        fetchFollowing(userId),
      ]);
      setConnectionData(connData);
      setFollowingList(followData || []);
    } catch (err) {
      console.error('Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Profile lookup helper
  const getProfile = useCallback(
    (id: string) => listProfiles.find((p) => p.membershipId === id),
    [listProfiles]
  );

  // Computed tab counts
  const requests = connectionData?.received.filter((c) => c.status === 'pending') || [];
  const mutualIds = connectionData ? getMutualConnections(connectionData) : [];
  const sentPending = connectionData?.sent.filter((c) => c.status === 'pending') || [];

  const tabCounts: Record<TabKey, number> = {
    requests: requests.length,
    connected: mutualIds.length,
    sent: sentPending.length,
    following: followingList.length,
  };

  // Tab-specific sorted lists
  const requestsSorted = [...requests].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const connectedSorted = [...mutualIds]
    .map((id) => {
      const sentEntry = connectionData?.sent.find(
        (c) => c.userId === id && c.status === 'accepted'
      );
      const recvEntry = connectionData?.received.find(
        (c) => c.userId === id && c.status === 'accepted'
      );
      const ts =
        (sentEntry?.timestamp || recvEntry?.timestamp || '');
      return { userId: id, timestamp: ts };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const sentSorted = [...sentPending].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const followingSorted = [...followingList].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Actions
  const handleAccept = async (targetId: string) => {
    if (!userId) return;
    setActionLoading(targetId);
    try {
      const ok = await acceptConnection(userId, targetId, userName);
      if (ok) {
        toast.success('Connection accepted!', {
          description: 'You are now connected.',
        });
        await loadData();
      } else {
        toast.error('Failed to accept connection');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (targetId: string) => {
    if (!userId) return;
    setActionLoading(targetId);
    try {
      const ok = await rejectConnection(userId, targetId);
      if (ok) {
        toast.info('Request declined');
        await loadData();
      } else {
        toast.error('Failed to decline request');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (targetId: string) => {
    if (!userId) return;
    setActionLoading(targetId);
    try {
      const ok = await cancelConnection(userId, targetId);
      if (ok) {
        toast.info('Request cancelled');
        await loadData();
      } else {
        toast.error('Failed to cancel request');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (targetId: string) => {
    if (!userId) return;
    setActionLoading(targetId);
    try {
      const ok = await removeConnection(userId, targetId);
      if (ok) {
        toast.info('Connection removed');
        await loadData();
      } else {
        toast.error('Failed to disconnect');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfollow = async (targetId: string) => {
    if (!userId) return;
    setActionLoading(targetId);
    try {
      const ok = await unfollowUser(userId, targetId);
      if (ok) {
        toast.info('Unfollowed successfully');
        await loadData();
      } else {
        toast.error('Failed to unfollow');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  // Auth gate
  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
    <SEO title="Connections" description="Manage your professional connections on FocusLinks. View sent and received connection requests." keywords="connections, networking, professional network" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Connections
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage your network and connections
            </p>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide"
        >
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {tabCounts[tab.key]}
              </span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeConnTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'requests' &&
                (requestsSorted.length === 0 ? (
                  <EmptyState tab="requests" />
                ) : (
                  <div className="space-y-3">
                    {requestsSorted.map((entry) => (
                      <ConnectionCard
                        key={entry.userId}
                        userId={entry.userId}
                        timestamp={entry.timestamp}
                        profile={getProfile(entry.userId)}
                        tab="requests"
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCancel={handleCancel}
                        onDisconnect={handleDisconnect}
                        onUnfollow={handleUnfollow}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                ))}

              {activeTab === 'connected' &&
                (connectedSorted.length === 0 ? (
                  <EmptyState tab="connected" />
                ) : (
                  <div className="space-y-3">
                    {connectedSorted.map((entry) => (
                      <ConnectionCard
                        key={entry.userId}
                        userId={entry.userId}
                        timestamp={entry.timestamp}
                        profile={getProfile(entry.userId)}
                        tab="connected"
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCancel={handleCancel}
                        onDisconnect={handleDisconnect}
                        onUnfollow={handleUnfollow}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                ))}

              {activeTab === 'sent' &&
                (sentSorted.length === 0 ? (
                  <EmptyState tab="sent" />
                ) : (
                  <div className="space-y-3">
                    {sentSorted.map((entry) => (
                      <ConnectionCard
                        key={entry.userId}
                        userId={entry.userId}
                        timestamp={entry.timestamp}
                        profile={getProfile(entry.userId)}
                        tab="sent"
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCancel={handleCancel}
                        onDisconnect={handleDisconnect}
                        onUnfollow={handleUnfollow}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                ))}

              {activeTab === 'following' &&
                (followingSorted.length === 0 ? (
                  <EmptyState tab="following" />
                ) : (
                  <div className="space-y-3">
                    {followingSorted.map((entry) => (
                      <ConnectionCard
                        key={entry.userId}
                        userId={entry.userId}
                        timestamp={entry.timestamp}
                        profile={getProfile(entry.userId)}
                        tab="following"
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onCancel={handleCancel}
                        onDisconnect={handleDisconnect}
                        onUnfollow={handleUnfollow}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  </>
  );
}
