'use client';

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from '../../context/NavigationContext';
import {
  Users,
  MessageSquare,
  Bookmark,
  Heart,
  MessageCircle,
  ArrowRight,
  PenSquare,
  Search,
  CalendarDays,
  FlaskConical,
  BookOpen,
  Mail,
  MapPin,
  BadgeCheck,
  Calendar,
  Hash,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfiles, generateSlug } from '../../hooks/useProfiles';
import { fetchGitHubJson, updateGitHubFile } from '../../services/githubService';
import { toast } from 'sonner';
import SEO from '../components/SEO';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Post {
  id: string;
  authorId: string;
  content: string;
  hashtags?: string[];
  timestamp: string;
  likes: string[];
  comments: { id: string; authorId: string; content: string; timestamp: string }[];
  images?: string[];
}

/* ------------------------------------------------------------------ */
/*  Skeleton Components                                                */
/* ------------------------------------------------------------------ */
function SkeletonPulse({ className = '' }: { className?: string }) {
  <SEO title="Home" description="Welcome to your FocusLinks home feed. Stay updated with the latest from your optometry network." keywords="home feed, dashboard, optometry network" />
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 ${className}`} />;
}

function SkeletonStatCard() {
  return (
    <div className="min-w-[140px] shrink-0 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800">
      <SkeletonPulse className="h-10 w-10 rounded-xl mb-3" />
      <SkeletonPulse className="h-6 w-20 mb-1" />
      <SkeletonPulse className="h-3 w-24" />
    </div>
  );
}

function SkeletonProfileCard() {
  return (
    <div className="min-w-[220px] max-w-[260px] shrink-0 snap-start bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
      <SkeletonPulse className="h-16 w-full" />
      <div className="px-4 pb-4">
        <SkeletonPulse className="w-14 h-14 rounded-full -mt-7 mb-2 border-2 border-white dark:border-slate-900" />
        <SkeletonPulse className="h-4 w-32 mb-1" />
        <SkeletonPulse className="h-3 w-24 mb-1" />
        <SkeletonPulse className="h-3 w-20 mb-3" />
        <SkeletonPulse className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonPostCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <SkeletonPulse className="h-3.5 w-28" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
      </div>
      <SkeletonPulse className="h-4 w-full" />
      <SkeletonPulse className="h-4 w-3/4" />
      <SkeletonPulse className="h-4 w-1/2" />
      <div className="flex gap-2">
        <SkeletonPulse className="h-5 w-14 rounded-full" />
        <SkeletonPulse className="h-5 w-18 rounded-full" />
      </div>
      <SkeletonPulse className="h-px w-full" />
      <div className="flex gap-4">
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-12" />
      </div>
    </div>
  );
}

function SkeletonQuickAction() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 flex flex-col items-center gap-3">
      <SkeletonPulse className="w-11 h-11 rounded-xl" />
      <SkeletonPulse className="h-4 w-16" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helper: format time ago                                            */
/* ------------------------------------------------------------------ */
function formatPostTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

/* ------------------------------------------------------------------ */
/*  Helper: get initials                                               */
/* ------------------------------------------------------------------ */
function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  return (parts[0] || '').charAt(0).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Compact Profile Card for horizontal scroll                         */
/* ------------------------------------------------------------------ */
function CompactProfileCard({ profile }: { profile: any }) {
  const gradients = [
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-sky-500',
    'from-fuchsia-400 to-purple-500',
  ];
  const gradientIdx = (profile.name || '').length % gradients.length;

  return (
    <Link
      to={`/profile/${generateSlug(profile.name)}`}
      className="group min-w-[220px] max-w-[260px] shrink-0 snap-start bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-purple-900/10 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Cover gradient */}
      <div className={`h-16 bg-gradient-to-r ${gradients[gradientIdx]} relative`}>
        <div className="absolute inset-0 bg-white/10" />
      </div>
      <div className="px-4 pb-4 relative">
        {/* Avatar overlapping cover */}
        <div className="relative -mt-7 mb-2 inline-block">
          {!profile.image || profile.image === 'none' ? (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm border-3 border-white dark:border-slate-900 shadow-md group-hover:scale-105 transition-transform">
              {getInitials(profile.name)}
            </div>
          ) : (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-14 h-14 rounded-full object-cover border-3 border-white dark:border-slate-900 shadow-md group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          )}
          {profile.verified && (
            <BadgeCheck className="absolute -bottom-0.5 -right-0.5 w-5 h-5 text-blue-500 bg-white dark:bg-slate-900 rounded-full drop-shadow-sm" fill="currentColor" stroke="white" />
          )}
        </div>
        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {profile.name}
        </h4>
        <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold truncate mt-0.5">
          {profile.title}
        </p>
        {profile.location && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {profile.location}
          </p>
        )}
        <div className="mt-3 w-full py-1.5 px-3 bg-gray-50 dark:bg-slate-950 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-gray-700 dark:text-gray-300 hover:text-violet-700 dark:hover:text-violet-300 font-semibold rounded-lg text-xs transition-all border border-gray-200 dark:border-slate-700 hover:border-violet-200 text-center">
          View Profile
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick Actions Grid                                                 */
/* ------------------------------------------------------------------ */
const quickActions = [
  { label: 'Create Post', icon: PenSquare, gradient: 'from-violet-500 to-purple-600', darkGrad: 'dark:from-violet-400 dark:to-purple-500', path: '/feed' },
  { label: 'Find Profiles', icon: Search, gradient: 'from-emerald-500 to-teal-600', darkGrad: 'dark:from-emerald-400 dark:to-teal-500', path: '/directory' },
  { label: 'Browse Events', icon: CalendarDays, gradient: 'from-rose-500 to-pink-600', darkGrad: 'dark:from-rose-400 dark:to-pink-500', path: '/events' },
  { label: 'Clinical Labs', icon: FlaskConical, gradient: 'from-amber-500 to-orange-600', darkGrad: 'dark:from-amber-400 dark:to-orange-500', path: '/labs' },
  { label: 'Read Articles', icon: BookOpen, gradient: 'from-cyan-500 to-sky-600', darkGrad: 'dark:from-cyan-400 dark:to-sky-500', path: '/blog' },
  { label: 'Messages', icon: Mail, gradient: 'from-fuchsia-500 to-purple-600', darkGrad: 'dark:from-fuchsia-400 dark:to-purple-500', path: '/messages' },
];

/* ------------------------------------------------------------------ */
/*  Main HomePage Component                                            */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profiles
  const { listProfiles, loadingList, fetchListProfiles } = useProfiles();

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  // Auth gate + user data loading
  useEffect(() => {
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Refresh user data from GitHub
        const refreshUserData = async () => {
          try {
            const response = await fetch(
              `https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Profile/Users/${parsedUser.membershipId}_userdata.json?t=${Date.now()}`
            );
            if (response.ok) {
              const latestUser = await response.json();
              if (latestUser) {
                const mergedUser = {
                  ...parsedUser,
                  ...latestUser,
                  email: latestUser.links?.email || latestUser.email || parsedUser.email,
                  linkedin: latestUser.links?.linkedin || latestUser.linkedin || parsedUser.linkedin,
                  whatsapp: latestUser.whatsapp || parsedUser.whatsapp,
                };
                setUser(mergedUser);
                localStorage.setItem('fl_user', JSON.stringify(mergedUser));
              }
            }
          } catch (err) {
            console.error('Failed to refresh user data:', err);
          }
        };
        refreshUserData();
      } catch {
        navigate('/login');
        return;
      }
      setIsLoading(false);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch profiles
  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  // Fetch community posts
  const fetchPosts = async () => {
    setFeedLoading(true);
    try {
      const response = await fetch('/api/github/fetch?path=Posts');
      if (!response.ok) {
        if (response.status === 404) {
          setPosts([]);
          return;
        }
        throw new Error('Failed to fetch posts directory');
      }
      const dirData = await response.json();
      const fetchedPosts: Post[] = [];
      if (Array.isArray(dirData)) {
        for (const file of dirData) {
          if (file.name && file.name.endsWith('.json')) {
            const postData = await fetchGitHubJson<Post>(`Posts/${file.name}`);
            if (postData && postData.id) {
              fetchedPosts.push({
                ...postData,
                likes: postData.likes || [],
                comments: postData.comments || [],
              });
            }
          }
        }
      }
      fetchedPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community feed');
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ------------------------------------------------------------------
  // Computed values
  // ------------------------------------------------------------------
  const userName = user ? (user.name || user.fullName || 'User') : 'User';
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const joinDate = user ? new Date(user.timestamp) : new Date();
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const durationText = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : `${diffDays} day${diffDays > 1 ? 's' : ''}`;

  // Stats
  const userPostsCount = useMemo(
    () => posts.filter(p => p.authorId === user?.membershipId).length,
    [posts, user?.membershipId]
  );

  const suggestedProfiles = useMemo(
    () =>
      listProfiles
        .filter(p => p.type !== 'membership_application' && p.membershipId !== user?.membershipId)
        .slice(0, 6),
    [listProfiles, user?.membershipId]
  );

  const recentPosts = posts.slice(0, 5);

  // Trending topics from hashtags
  const trendingTopics = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    posts.forEach(post => {
      if (post.hashtags) {
        post.hashtags.forEach(tag => {
          const lower = tag.toLowerCase();
          tagCounts[lower] = (tagCounts[lower] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }, [posts]);

  // Helper: get author profile
  const getAuthorProfile = (membershipId: string) => {
    return listProfiles.find(p => p.membershipId === membershipId);
  };

  // ------------------------------------------------------------------
  // Like handler
  // ------------------------------------------------------------------
  const handleLike = async (post: Post) => {
    if (!user) return;
    const hasLiked = post.likes.includes(user.membershipId);
    let newLikes = [...post.likes];
    if (hasLiked) {
      newLikes = newLikes.filter(id => id !== user.membershipId);
    } else {
      newLikes.push(user.membershipId);
    }
    // Optimistic update
    setPosts(prev => prev.map(p => (p.id === post.id ? { ...p, likes: newLikes } : p)));
    try {
      const updatedPost = { ...post, likes: newLikes };
      const filename = `Posts/${post.id}_${post.authorId}.json`;
      await updateGitHubFile(filename, updatedPost, `${hasLiked ? 'Unlike' : 'Like'} post ${post.id} by ${user.membershipId}`);
    } catch (error) {
      console.error('Error liking post:', error);
      setPosts(prev => prev.map(p => (p.id === post.id ? post : p)));
      toast.error('Failed to update like');
    }
  };

  // ------------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------------
  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Skeleton welcome banner */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6">
          <div className="animate-pulse bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-6 sm:p-8">
            <div className="h-4 w-48 bg-white/20 rounded mb-3" />
            <div className="h-8 w-72 bg-white/20 rounded mb-2" />
            <div className="h-4 w-40 bg-white/20 rounded" />
          </div>
        </div>

        {/* Skeleton stats */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-6">
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
            {[1, 2, 3, 4].map(i => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        </div>

        {/* Skeleton suggested profiles */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-8">
          <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
            {[1, 2, 3].map(i => (
              <SkeletonProfileCard key={i} />
            ))}
          </div>
        </div>

        {/* Skeleton feed */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-8 space-y-4">
          <div className="h-6 w-48 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          {[1, 2, 3].map(i => (
            <SkeletonPostCard key={i} />
          ))}
        </div>

        {/* Skeleton quick actions */}
        <div className="mx-4 sm:mx-6 lg:mx-8 mt-8">
          <div className="h-6 w-36 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonQuickAction key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Stat cards data
  // ------------------------------------------------------------------
  const stats = [
    {
      icon: <PenSquare className="w-5 h-5" />,
      value: userPostsCount,
      label: 'Your Posts',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      value: 0,
      label: 'Messages',
      gradient: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      icon: <Bookmark className="w-5 h-5" />,
      value: 0,
      label: 'Bookmarks',
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ============================================================ */}
        {/* Welcome Banner                                               */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 sm:mt-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-purple-900/20"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-fuchsia-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Date */}
            <p className="text-purple-200 text-sm font-medium mb-2">{formattedDate}</p>

            {/* Greeting */}
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1.5 leading-tight">
              {greeting}, {userName}!
            </h1>
            <p className="text-purple-200 text-sm mb-5">Welcome back to your FocusLinks community hub.</p>

            {/* Membership info row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                </div>
                <div>
                  <p className="text-[10px] text-purple-200 font-medium uppercase tracking-wider">Membership</p>
                  <p className="font-bold text-sm">{user.membershipId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-purple-200" />
                </div>
                <div>
                  <p className="text-[10px] text-purple-200 font-medium uppercase tracking-wider">Member Since</p>
                  <p className="font-bold text-sm">{durationText}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Quick Stats Row                                              */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6"
        >
          <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                className={`min-w-[140px] sm:min-w-[160px] shrink-0 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} text-white shadow-lg mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Suggested Profiles Section                                   */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Suggested Profiles
            </h2>
            <Link
              to="/directory"
              className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingList ? (
            <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {[1, 2, 3].map(i => (
                <SkeletonProfileCard key={i} />
              ))}
            </div>
          ) : suggestedProfiles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No profiles yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Check back soon for new community members.</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
              <AnimatePresence>
                {suggestedProfiles.map((profile, idx) => (
                  <motion.div
                    key={profile.membershipId || profile.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05 }}
                  >
                    <CompactProfileCard profile={profile} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ============================================================ */}
        {/* Recent Posts / Community Feed                                */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Community Feed
            </h2>
            <Link
              to="/feed"
              className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {feedLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <SkeletonPostCard key={i} />
              ))}
            </div>
          ) : recentPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No posts yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Be the first to share something with the community!
              </p>
              <Link
                to="/feed"
                className="inline-flex items-center px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md"
              >
                <PenSquare className="w-4 h-4 mr-2" /> Create a Post
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {recentPosts.map((post, idx) => {
                  const author = getAuthorProfile(post.authorId);
                  const hasLiked = user && post.likes.includes(user.membershipId);

                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 hover:shadow-md transition-all group"
                    >
                      {/* Post header */}
                      <div className="flex items-center gap-3 mb-3">
                        {author?.image && author.image !== 'none' ? (
                          <img
                            src={author.image}
                            alt={author.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {getInitials(author?.name || post.authorId || 'U')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {author?.name || post.authorId}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatPostTime(post.timestamp)}</p>
                        </div>
                        {post.likes.length >= 5 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold shrink-0">
                            <TrendingUp className="w-3 h-3" /> Trending
                          </span>
                        )}
                      </div>

                      {/* Post content */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap line-clamp-4">
                        {post.content}
                      </p>

                      {/* Images */}
                      {post.images && post.images.length > 0 && (
                        <div className="grid gap-2 mb-3 overflow-hidden rounded-xl">
                          {post.images.length === 1 ? (
                            <img src={post.images[0]} alt="Post image" className="w-full max-h-64 object-cover rounded-xl" />
                          ) : (
                            <div className={`grid ${post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
                              {post.images.slice(0, 4).map((img, i) => (
                                <img key={i} src={img} alt={`Post image ${i + 1}`} className="w-full h-32 object-cover rounded-xl" />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hashtags */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.hashtags.map(tag => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/explore?query=${encodeURIComponent(tag)}`)}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post actions */}
                      <div className="flex items-center gap-5 pt-2.5 border-t border-gray-100 dark:border-slate-800">
                        <button
                          onClick={() => handleLike(post)}
                          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                            hasLiked
                              ? 'text-rose-500'
                              : 'text-gray-500 dark:text-gray-400 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                          {post.likes.length > 0 && <span>{post.likes.length}</span>}
                        </button>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments.length > 0 && <span>{post.comments.length}</span>}
                        </span>
                        <Link
                          to={`/feed`}
                          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* View Full Feed link */}
              <Link
                to="/feed"
                className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
              >
                View Full Community Feed <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* ============================================================ */}
        {/* Quick Actions Grid                                            */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action, idx) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.04 }}
              >
                <Link
                  to={action.path}
                  className="flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group text-center"
                >
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.gradient} ${action.darkGrad} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                    <action.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Trending Topics                                               */}
        {/* ============================================================ */}
        {trendingTopics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 mb-6"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Trending Topics
            </h2>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 sm:p-5">
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, idx) => (
                  <motion.button
                    key={topic}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 + idx * 0.03 }}
                    onClick={() => navigate(`/explore?query=${encodeURIComponent(topic)}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900/50 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/50 dark:hover:to-purple-950/50 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <Hash className="w-3.5 h-3.5 text-violet-400" />
                    {topic}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
