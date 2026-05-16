'use client';
import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from '../../context/NavigationContext';
import {
  User, Calendar, MapPin, Briefcase, Edit3, X, Loader2,
  CheckCircle2, Clock, AlertCircle, ExternalLink,
  MessageSquare, Heart, MessageCircle, BookOpen,
  Mail, Search, Beaker, CalendarDays, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfiles, generateSlug } from '../../hooks/useProfiles';
import { fetchGitHubJson, updateGitHubFile } from '../../services/githubService';
import { toast } from 'sonner';
import SEO from '../components/SEO';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
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
/*  Skeleton loader component                                          */
/* ------------------------------------------------------------------ */
function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-slate-700 ${className}`} />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 space-y-4">
      <SkeletonLine className="h-5 w-1/3" />
      <SkeletonLine className="h-3 w-2/3" />
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard Component                                                 */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPublicProfile, setIsEditingPublicProfile] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [publicProfileForm, setPublicProfileForm] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Community feed state
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const {
    listProfiles, submissions, loadingList: profilesLoading,
    updateUserProfile, fetchListProfiles
  } = useProfiles();

  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  // Auth gate + user data loading
  useEffect(() => {
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditForm(parsedUser);
      setIsLoading(false);

      const refreshUserData = async () => {
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Profile/Users/${parsedUser.membershipId}_userdata.json`
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
              setEditForm(mergedUser);
              localStorage.setItem('fl_user', JSON.stringify(mergedUser));
            }
          }
        } catch (err) {
          console.error('Failed to refresh user data:', err);
        }
      };
      refreshUserData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch community posts
  const fetchPosts = async () => {
    setFeedLoading(true);
    try {
      const response = await fetch('/api/github/fetch?path=Posts');
      if (!response.ok) {
        if (response.status === 404) { setPosts([]); return; }
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
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ------------------------------------------------------------------
  // Profile handlers
  // ------------------------------------------------------------------
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: user.membershipId, updates: editForm }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('fl_user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
        setUpdateSuccess(true);
        setTimeout(() => { setUpdateSuccess(false); setIsEditing(false); }, 2000);
      } else {
        toast.error('Failed to update profile: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePublicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await updateUserProfile(
        user.membershipId, user.name || user.fullName, publicProfileForm
      );
      if (success) {
        setUpdateSuccess(true);
        setTimeout(() => { setUpdateSuccess(false); setIsEditingPublicProfile(false); }, 2000);
      } else {
        toast.error('Failed to update public profile.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating public profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPublicProfileEdit = () => {
    if (userProfileStatus.profile) {
      setPublicProfileForm(userProfileStatus.profile);
      setIsEditingPublicProfile(true);
    }
  };

  // ------------------------------------------------------------------
  // Like handler (same logic as Feed.tsx)
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
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
    try {
      const updatedPost = { ...post, likes: newLikes };
      const filename = `Posts/${post.id}_${post.authorId}.json`;
      await updateGitHubFile(filename, updatedPost, `${hasLiked ? 'Unlike' : 'Like'} post ${post.id} by ${user.membershipId}`);
    } catch (error) {
      console.error('Error liking post:', error);
      setPosts(prev => prev.map(p => p.id === post.id ? post : p));
    }
  };

  // ------------------------------------------------------------------
  // Computed values
  // ------------------------------------------------------------------
  const userProfileStatus = useMemo(() => {
    if (!user || profilesLoading) return { hasProfile: false, submission: null, profile: null };
    const existingProfile = listProfiles.find(p => {
      if (p.type === 'membership_application') return false;
      if (p.membershipId === user.membershipId) return true;
      const pName = (p.name || '').toLowerCase();
      const uName = (user.name || user.fullName || '').toLowerCase();
      if (pName && uName && pName === uName) return true;
      return false;
    });
    if (existingProfile) return { hasProfile: true, profile: existingProfile, submission: null };
    const submission = submissions.find(s => s.membershipId === user.membershipId);
    return { hasProfile: false, profile: null, submission };
  }, [user, listProfiles, submissions, profilesLoading]);

  const getAuthorProfile = (membershipId: string) => {
    return listProfiles.find(p => p.membershipId === membershipId);
  };

  const formatPostTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Quick actions
  const quickActions = [
    { name: 'Create Post', icon: <MessageSquare className="w-5 h-5" />, gradient: 'from-violet-500 to-purple-600', path: '/feed', darkGrad: 'dark:from-violet-400 dark:to-purple-500' },
    { name: 'Find Profiles', icon: <Search className="w-5 h-5" />, gradient: 'from-blue-500 to-cyan-600', path: '/directory', darkGrad: 'dark:from-blue-400 dark:to-cyan-500' },
    { name: 'Browse Events', icon: <CalendarDays className="w-5 h-5" />, gradient: 'from-emerald-500 to-teal-600', path: '/events', darkGrad: 'dark:from-emerald-400 dark:to-teal-500' },
    { name: 'Read Blog', icon: <BookOpen className="w-5 h-5" />, gradient: 'from-amber-500 to-orange-600', path: '/blog', darkGrad: 'dark:from-amber-400 dark:to-orange-500' },
    { name: 'Use Labs', icon: <Beaker className="w-5 h-5" />, gradient: 'from-rose-500 to-pink-600', path: '/labs', darkGrad: 'dark:from-rose-400 dark:to-pink-500' },
    { name: 'View Messages', icon: <Mail className="w-5 h-5" />, gradient: 'from-sky-500 to-blue-600', path: '/messages', darkGrad: 'dark:from-sky-400 dark:to-blue-500' },
  ];

  // Greeting
  const userName = user ? (user.name || user.fullName || 'User') : 'User';
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  // Join date
  const joinDate = user ? new Date(user.timestamp) : new Date();
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const durationText = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : `${diffDays} day${diffDays > 1 ? 's' : ''}`;

  // ------------------------------------------------------------------
  // Loading skeleton
  // ------------------------------------------------------------------
  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SkeletonCard />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Show up to 5 recent posts on dashboard
  const recentPosts = posts.slice(0, 5);

  return (
    <>
    <SEO title="Dashboard" description="Your FocusLinks dashboard — manage your profile, view notifications, and access platform features." keywords="dashboard, profile management, optometry dashboard" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* -------------------------------------------------------- */}
        {/* Welcome Banner                                           */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-6 sm:p-8 mb-8 text-white relative overflow-hidden shadow-xl shadow-purple-900/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-fuchsia-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-purple-200 text-sm font-medium mb-1">{formattedDate}</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">{greeting}, {userName}!</h1>
              <p className="text-purple-200 text-sm">Your FocusLinks community dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              {userProfileStatus.hasProfile && (
                <Link
                  to={`/profile/${generateSlug(user.name || user.fullName)}`}
                  className="inline-flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl text-sm font-bold transition-all"
                >
                  <User className="w-4 h-4 mr-2" /> Visit My Profile
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/* Profile Completion Widget                                 */}
        {/* -------------------------------------------------------- */}
        {(() => {
          const completionItems = [
            { key: 'name', label: 'Add your name', done: !!(user.name || user.fullName), icon: User, action: () => setIsEditing(true) },
            { key: 'email', label: 'Add your email', done: !!user.email, icon: Mail, action: () => setIsEditing(true) },
            { key: 'role', label: 'Set your role', done: !!user.role, icon: Briefcase, action: () => setIsEditing(true) },
            { key: 'location', label: 'Add your location', done: !!(user.location || user.country), icon: MapPin, action: () => setIsEditing(true) },
            { key: 'photo', label: 'Add a profile photo', done: !!user.image, icon: User, action: () => navigate('/create-profile') },
            { key: 'publicProfile', label: 'Publish public profile', done: userProfileStatus.hasProfile, icon: ExternalLink, action: () => navigate('/create-profile') },
          ];
          const completed = completionItems.filter(i => i.done).length;
          const total = completionItems.length;
          const pct = Math.round((completed / total) * 100);
          const isComplete = pct === 100;

          if (isComplete) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-blue-100 dark:border-blue-900/50 mb-8 relative overflow-hidden"
            >
              {/* Decorative gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500" />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Publish your profile to connect with optometrists worldwide
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{pct}%</span>
                    <span className="text-xs text-gray-400 ml-1">complete</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500"
                />
              </div>

              {/* Completion items grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {completionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.key}
                      whileHover={item.done ? {} : { scale: 1.01 }}
                      whileTap={item.done ? {} : { scale: 0.99 }}
                      onClick={item.done ? undefined : item.action}
                      disabled={item.done}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        item.done
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 cursor-default'
                          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.done
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        {item.done ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${
                        item.done
                          ? 'text-emerald-700 dark:text-emerald-400 line-through'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.label}
                      </span>
                      {!item.done && (
                        <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* CTA */}
              {!userProfileStatus.hasProfile && (
                <Link
                  to="/create-profile"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 transition-all"
                >
                  Publish My Profile <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>
          );
        })()}

        {/* -------------------------------------------------------- */}
        {/* Quick Actions Grid                                        */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-8"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickActions.map((action, idx) => (
              <motion.div
                key={action.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
              >
                <Link
                  to={action.path}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-all group text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.gradient} ${action.darkGrad} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all`}>
                    {action.icon}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{action.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ====================================================== */}
          {/* Left Column: Community Feed                            */}
          {/* ====================================================== */}
          <div className="lg:col-span-2 space-y-8">

            {/* Community Feed Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Community Feed
                </h3>
                <Link
                  to="/feed"
                  className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  View Full Feed <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {feedLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse space-y-3 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700" />
                        <div className="flex-1 space-y-2">
                          <SkeletonLine className="h-4 w-32" />
                          <SkeletonLine className="h-3 w-16" />
                        </div>
                      </div>
                      <SkeletonLine className="h-4 w-full" />
                      <SkeletonLine className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : recentPosts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No posts yet</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Be the first to share something with the community!
                  </p>
                  <Link
                    to="/feed"
                    className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Create a Post
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {recentPosts.map(post => {
                      const author = getAuthorProfile(post.authorId);
                      const hasLiked = user && post.likes.includes(user.membershipId);
                      const isTrending = post.likes.length >= 5;

                      return (
                        <motion.div
                          key={post.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="rounded-2xl border border-gray-100 dark:border-slate-800 p-4 hover:shadow-md transition-all group"
                        >
                          {/* Post header */}
                          <div className="flex items-center gap-3 mb-3">
                            {author?.image ? (
                              <img src={author.image} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                                {(author?.name || post.authorId || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {author?.name || post.authorId}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatPostTime(post.timestamp)}</p>
                            </div>
                            {isTrending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                                🔥 Trending
                              </span>
                            )}
                          </div>

                          {/* Post content */}
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 whitespace-pre-wrap">
                            {post.content}
                          </p>

                          {/* Hashtags */}
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {post.hashtags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Post actions */}
                          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
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
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* View Full Feed link */}
                  <Link
                    to="/feed"
                    className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                  >
                    View Full Community Feed <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>

            {/* User Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50" />

              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-600/20 shrink-0">
                  {(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.fullName || 'User'}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit profile"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {user.role}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {user.location}, {user.country}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Membership ID</p>
                  <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">{user.membershipId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    {joinDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="text-gray-500 dark:text-gray-400">({durationText})</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ====================================================== */}
          {/* Right Column: Profile Status                            */}
          {/* ====================================================== */}
          <div className="space-y-8">

            {/* Public Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`rounded-3xl p-6 sm:p-8 shadow-sm border ${
                userProfileStatus.hasProfile
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
                  : userProfileStatus.submission
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50'
                    : 'bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 border-purple-100 dark:border-purple-900/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Public Directory Profile</h3>
                    {userProfileStatus.hasProfile && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                    {userProfileStatus.submission && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        userProfileStatus.submission.status === 'review'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                          : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                      }`}>
                        {userProfileStatus.submission.status === 'review' ? <Clock className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {userProfileStatus.submission.status === 'review' ? 'In Review' : 'Rejected'}
                      </span>
                    )}
                  </div>

                  {userProfileStatus.hasProfile ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your professional profile is live in the global directory.
                    </p>
                  ) : userProfileStatus.submission ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userProfileStatus.submission.status === 'review'
                        ? 'Your profile submission is being reviewed. This usually takes 24-48 hours.'
                        : 'Your submission was not approved. Please contact support.'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      List yourself in the global FocusLinks directory to connect with professionals.
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  {userProfileStatus.hasProfile ? (
                    <>
                      <Link
                        to={`/profile/${generateSlug(user.name || user.fullName)}`}
                        className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-emerald-600/20"
                      >
                        View Profile <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                      <button
                        onClick={openPublicProfileEdit}
                        className="inline-flex items-center justify-center px-6 py-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                      </button>
                    </>
                  ) : userProfileStatus.submission?.status === 'review' ? (
                    <div className="px-6 py-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl font-bold text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Pending Approval
                    </div>
                  ) : (
                    <Link
                      to="/create-profile"
                      className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-purple-600/20"
                    >
                      {userProfileStatus.submission?.status === 'rejected' ? 'Re-create Profile' : 'Create Public Profile'}
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* Edit Profile Modal                                       */}
      {/* -------------------------------------------------------- */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setIsEditing(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500 dark:text-gray-400" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                {updateSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /></div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Updated!</h4>
                    <p className="text-gray-600 dark:text-gray-400">Your changes have been saved successfully.</p>
                  </div>
                ) : (
                  <form id="edit-profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input type="email" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">WhatsApp</label>
                      <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={editForm.whatsapp || ''} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                      <input type="url" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={editForm.linkedin || ''} onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                        <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={editForm.role || ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Country</label>
                        <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={editForm.country || ''} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                    </div>
                  </form>
                )}
              </div>
              {!updateSuccess && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 shrink-0 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
                  <button type="submit" form="edit-profile-form" disabled={isSubmitting} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm transition-colors shadow-md flex items-center">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------- */}
      {/* Edit Public Profile Modal                                */}
      {/* -------------------------------------------------------- */}
      <AnimatePresence>
        {isEditingPublicProfile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setIsEditingPublicProfile(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Public Profile</h3>
                <button onClick={() => setIsEditingPublicProfile(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500 dark:text-gray-400" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                {updateSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /></div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Public Profile Updated!</h4>
                    <p className="text-gray-600 dark:text-gray-400">Your directory profile has been saved.</p>
                  </div>
                ) : (
                  <form id="edit-public-profile-form" onSubmit={handleUpdatePublicProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Title / Specialty</label>
                      <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={publicProfileForm.title || ''} onChange={(e) => setPublicProfileForm({ ...publicProfileForm, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={publicProfileForm.location || ''} onChange={(e) => setPublicProfileForm({ ...publicProfileForm, location: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none" value={publicProfileForm.description || ''} onChange={(e) => setPublicProfileForm({ ...publicProfileForm, description: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                      <input type="url" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={publicProfileForm.image || ''} onChange={(e) => setPublicProfileForm({ ...publicProfileForm, image: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                      <textarea rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none" value={publicProfileForm.bio || ''} onChange={(e) => setPublicProfileForm({ ...publicProfileForm, bio: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Skills (comma-separated)</label>
                      <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-gray-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-800 transition-all" value={publicProfileForm.skills?.join(', ') || ''} onChange={(e) => setPublicProfileForm({ ...publicProfileForm, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })} />
                    </div>
                  </form>
                )}
              </div>
              {!updateSuccess && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 shrink-0 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsEditingPublicProfile(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
                  <button type="submit" form="edit-public-profile-form" disabled={isSubmitting} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm transition-colors shadow-md flex items-center">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  </>
  );
}
