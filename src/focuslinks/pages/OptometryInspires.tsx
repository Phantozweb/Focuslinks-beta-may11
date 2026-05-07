'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Heart, MessageCircle, Share2, Bookmark, BookmarkCheck,
  Send, Hash, Loader2, X, Lightbulb,
  HelpCircle, FlaskConical, Trophy, MessageSquare, Clock,
  AlertCircle, Plus, Trash2, Edit3, TrendingUp, Crown, Medal,
  ExternalLink, Flame, Users, BarChart3, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '../../context/NavigationContext';
import { useProfiles } from '../../hooks/useProfiles';
import SEO from '../components/SEO';

// ─── Types ───
interface InspireComment {
  id: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  sources?: string[];
}

interface InspirePost {
  id: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  authorType: 'professional' | 'student' | 'clinic';
  content: string;
  type: 'question' | 'insight' | 'case_study' | 'achievement' | 'discussion' | 'general';
  tags?: string[];
  likes: number;
  likedBy: string[];
  comments: InspireComment[];
  createdAt: string;
  parentId?: string;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  image?: string;
  totalLikes: number;
  totalPosts: number;
  rank: number;
}

type PostType = InspirePost['type'];
type SortOption = 'latest' | 'popular';
type FilterTab = 'all' | 'question' | 'insight' | 'case_study' | 'achievement' | 'discussion';

const POST_TYPES: { value: PostType; label: string; color: string; bg: string; darkBg: string; icon: React.ReactNode }[] = [
  { value: 'general', label: 'General', color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100', darkBg: 'dark:bg-slate-700', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { value: 'question', label: 'Question', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100', darkBg: 'dark:bg-amber-900/30', icon: <HelpCircle className="w-3.5 h-3.5" /> },
  { value: 'insight', label: 'Insight', color: 'text-teal-700 dark:text-teal-300', bg: 'bg-teal-100', darkBg: 'dark:bg-teal-900/30', icon: <Lightbulb className="w-3.5 h-3.5" /> },
  { value: 'case_study', label: 'Case Study', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-900/30', icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { value: 'achievement', label: 'Achievement', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100', darkBg: 'dark:bg-violet-900/30', icon: <Trophy className="w-3.5 h-3.5" /> },
  { value: 'discussion', label: 'Discussion', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100', darkBg: 'dark:bg-sky-900/30', icon: <MessageCircle className="w-3.5 h-3.5" /> },
];

const POST_TYPE_CONFIG = (type: PostType) => POST_TYPES.find(t => t.value === type) || POST_TYPES[0];

const AUTHOR_TYPE_BADGES: Record<string, { label: string; cls: string }> = {
  professional: { label: 'Pro', cls: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
  student: { label: 'Student', cls: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' },
  clinic: { label: 'Clinic', cls: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
};

const MAX_CHARS = 2000;
const POSTS_PER_PAGE = 8;

// ─── Helpers ───
function getBookmarkedInspireIds(): string[] {
  try {
    const stored = localStorage.getItem('fl_bookmarked_inspires');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveBookmarkedInspireIds(ids: string[]) {
  localStorage.setItem('fl_bookmarked_inspires', JSON.stringify(ids));
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function linkifyContent(text: string): React.ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('http')) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline break-all">
          {part}
        </a>
      );
    }
    // Handle hashtags
    const hashParts = part.split(/(#\w+)/g);
    return hashParts.map((hp, j) => {
      if (hp.startsWith('#')) {
        return (
          <span key={`${i}-${j}`} className="text-teal-600 dark:text-teal-400 font-medium cursor-pointer hover:underline">
            {hp}
          </span>
        );
      }
      return <span key={`${i}-${j}`}>{hp}</span>;
    });
  });
}

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Component ───
export default function OptometryInspires() {
  const [posts, setPosts] = useState<InspirePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getBookmarkedInspireIds);

  // Compose box state
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeContent, setComposeContent] = useState('');
  const [composeType, setComposeType] = useState<PostType>('general');
  const [composeTags, setComposeTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  // Comment/Reply state
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [commentSources, setCommentSources] = useState<string[]>([]);
  const [currentSource, setCurrentSource] = useState('');

  // Expanded replies
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Editing state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const composeRef = useRef<HTMLDivElement>(null);

  const { listProfiles, fetchListProfiles } = useProfiles();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchListProfiles();
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      try { setCurrentUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
  }, [fetchListProfiles]);

  useEffect(() => {
    fetchPosts();
  }, [activeFilter, sortOption]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('type', activeFilter === 'all' ? 'all' : activeFilter);
      params.set('sort', sortOption);
      const response = await fetch(`/api/inspires?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching inspire posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPublicProfile = useMemo(() => {
    if (!currentUser) return false;
    return listProfiles.some(p => p.membershipId === currentUser.membershipId && p.type !== 'membership_application');
  }, [currentUser, listProfiles]);

  const getAuthorType = useCallback((userId: string): 'professional' | 'student' | 'clinic' => {
    const profile = listProfiles.find(p => p.membershipId === userId);
    if (profile) {
      if (profile.type === 'student') return 'student';
      if (profile.title?.toLowerCase().includes('clinic')) return 'clinic';
    }
    return 'professional';
  }, [listProfiles]);

  const getAuthorImage = useCallback((userId: string): string | undefined => {
    const profile = listProfiles.find(p => p.membershipId === userId);
    return profile?.image;
  }, [listProfiles]);

  const getAuthorName = useCallback((userId: string): string => {
    const profile = listProfiles.find(p => p.membershipId === userId);
    return profile?.name || userId;
  }, [listProfiles]);

  // ─── Computed Data ───

  // Leaderboard: top 10 contributors by total likes
  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const userMap = new Map<string, { name: string; image?: string; totalLikes: number; totalPosts: number }>();

    posts.forEach(post => {
      const uid = post.userId;
      const existing = userMap.get(uid);
      if (existing) {
        existing.totalLikes += post.likes;
        existing.totalPosts += 1;
      } else {
        userMap.set(uid, {
          name: post.authorName || getAuthorName(uid),
          image: post.authorImage || getAuthorImage(uid),
          totalLikes: post.likes,
          totalPosts: 1,
        });
      }
    });

    return Array.from(userMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 10)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, [posts, getAuthorName, getAuthorImage]);

  // Top contributor
  const topContributor = leaderboard[0] || null;

  // Unique contributors count
  const uniqueContributors = useMemo(() => {
    const ids = new Set(posts.map(p => p.userId));
    return ids.size;
  }, [posts]);

  // Total knowledge (total comments)
  const totalKnowledge = useMemo(() => {
    return posts.reduce((sum, p) => sum + p.comments.length, 0);
  }, [posts]);

  // Trending posts (top 3 by likes)
  const trendingPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3);
  }, [posts]);

  // Popular tags
  const popularTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    posts.forEach(p => {
      p.tags?.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  // ─── Compose ───
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = currentTag.trim().replace(/^#/, '');
      if (tag && composeTags.length < 5 && !composeTags.includes(tag)) {
        setComposeTags([...composeTags, tag]);
        setCurrentTag('');
      }
    }
  };

  const handleComposeSubmit = async () => {
    if (!composeContent.trim() || !currentUser || !hasPublicProfile) return;
    setSubmitting(true);
    try {
      const authorType = getAuthorType(currentUser.membershipId);
      const authorImage = getAuthorImage(currentUser.membershipId);
      const response = await fetch('/api/inspires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.membershipId,
          authorName: currentUser.name || 'Anonymous',
          authorImage,
          authorType,
          content: composeContent.trim(),
          type: composeType,
          tags: composeTags,
        }),
      });
      if (!response.ok) throw new Error('Failed to create post');
      const data = await response.json();
      toast.success(composeType === 'question' ? 'Question posted!' : 'Post published!');
      setPosts([data.post, ...posts]);
      setComposeContent('');
      setComposeTags([]);
      setCurrentTag('');
      setComposeType('general');
      setComposeOpen(false);
    } catch {
      toast.error('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Like ───
  const handleLike = async (post: InspirePost) => {
    if (!currentUser) {
      toast.error('Please log in to like posts');
      return;
    }
    const wasLiked = post.likedBy.includes(currentUser.membershipId);

    // Optimistic update
    setPosts(posts.map(p => {
      if (p.id !== post.id) return p;
      return {
        ...p,
        likedBy: wasLiked ? p.likedBy.filter(uid => uid !== currentUser.membershipId) : [...p.likedBy, currentUser.membershipId],
        likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
      };
    }));

    try {
      await fetch(`/api/inspires/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', userId: currentUser.membershipId }),
      });
    } catch {
      // Revert on error
      setPosts(posts.map(p => {
        if (p.id !== post.id) return p;
        return post;
      }));
    }
  };

  // ─── Comment ───
  const handleAddSource = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const src = currentSource.trim();
      if (src && commentSources.length < 3) {
        // Add https:// if no protocol
        const formatted = src.match(/^https?:\/\//) ? src : `https://${src}`;
        setCommentSources([...commentSources, formatted]);
        setCurrentSource('');
      }
    }
  };

  const handleComment = async (post: InspirePost) => {
    if (!commentContent.trim() || !currentUser) return;

    const sourcesToSend = commentSources.length > 0 ? commentSources : undefined;

    const optimisticComment: InspireComment = {
      id: Date.now().toString(),
      userId: currentUser.membershipId,
      authorName: currentUser.name || 'Anonymous',
      authorImage: getAuthorImage(currentUser.membershipId),
      content: commentContent.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      sources: sourcesToSend,
    };

    setPosts(posts.map(p => {
      if (p.id !== post.id) return p;
      return { ...p, comments: [...p.comments, optimisticComment] };
    }));

    setCommentContent('');
    setCommentSources([]);
    setCurrentSource('');
    setCommentingOn(null);
    setReplyingTo(null);

    try {
      await fetch(`/api/inspires/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          userId: currentUser.membershipId,
          authorName: currentUser.name || 'Anonymous',
          authorImage: getAuthorImage(currentUser.membershipId),
          content: commentContent.trim(),
          sources: sourcesToSend,
        }),
      });
    } catch {
      toast.error('Failed to post comment');
      setPosts(posts);
    }
  };

  // ─── Bookmark ───
  const toggleBookmark = (postId: string) => {
    const newIds = bookmarkedIds.includes(postId)
      ? bookmarkedIds.filter(id => id !== postId)
      : [...bookmarkedIds, postId];
    setBookmarkedIds(newIds);
    saveBookmarkedInspireIds(newIds);
    if (!bookmarkedIds.includes(postId)) toast.success('Post bookmarked');
  };

  // ─── Share ───
  const handleShare = (post: InspirePost) => {
    const url = `${window.location.origin}/inspires/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  // ─── Delete ───
  const handleDelete = async (post: InspirePost) => {
    try {
      await fetch(`/api/inspires/${post.id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== post.id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  // ─── Edit ───
  const startEdit = (post: InspirePost) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditContent('');
  };

  const handleEditSubmit = async (post: InspirePost) => {
    try {
      await fetch(`/api/inspires/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      setPosts(posts.map(p => p.id === post.id ? { ...p, content: editContent } : p));
      setEditingPostId(null);
      setEditContent('');
      toast.success('Post updated');
    } catch {
      toast.error('Failed to update post');
    }
  };

  // ─── Toggle replies ───
  const toggleReplies = (postId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    return [...posts];
  }, [posts]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const filterTabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: posts.length },
    { key: 'question', label: 'Questions', count: posts.filter(p => p.type === 'question').length },
    { key: 'insight', label: 'Insights', count: posts.filter(p => p.type === 'insight').length },
    { key: 'case_study', label: 'Case Studies', count: posts.filter(p => p.type === 'case_study').length },
    { key: 'achievement', label: 'Achievements', count: posts.filter(p => p.type === 'achievement').length },
    { key: 'discussion', label: 'Discussions', count: posts.filter(p => p.type === 'discussion').length },
  ];

  // ─── Rank styling helpers ───
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300', ring: 'ring-2 ring-amber-300 dark:ring-amber-700' };
      case 2: return { bg: 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800', border: 'border-slate-300 dark:border-slate-600', icon: 'text-slate-400', badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300', ring: 'ring-2 ring-slate-300 dark:ring-slate-600' };
      case 3: return { bg: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-500', badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300', ring: 'ring-2 ring-orange-300 dark:ring-orange-700' };
      default: return { bg: 'bg-white dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', icon: 'text-slate-400', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-400', ring: '' };
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-amber-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-orange-500" />;
    return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-slate-400">{rank}</span>;
  };

  return (
    <>
      <SEO
        title="Optometry Inspires — Community"
        description="Share knowledge, ask questions, and inspire the optometry community. A space for professionals and students to connect."
        keywords="optometry community, clinical insights, case studies, eye care questions"
      />

      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-20 md:pb-12">
        {/* ─── Hero Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 dark:from-teal-900 dark:via-emerald-900 dark:to-teal-950"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/5 to-transparent rounded-full" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex items-start sm:items-center gap-4 mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Optometry Inspires</h1>
                <p className="text-teal-100 text-sm sm:text-base mt-1">Share knowledge, ask questions, inspire the community</p>
              </div>
              {topContributor && (
                <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10 shrink-0">
                  <Crown className="w-4 h-4 text-amber-300" />
                  <div>
                    <p className="text-[10px] text-teal-200 font-medium uppercase tracking-wider">Top Contributor</p>
                    <p className="text-sm font-bold text-white truncate max-w-[140px]">{topContributor.name}</p>
                  </div>
                </div>
              )}
            </div>

            {posts.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-5 text-sm">
                <div className="flex items-center gap-1.5 text-white/80">
                  <MessageSquare className="w-4 h-4 text-teal-200" />
                  <span className="font-bold text-white">{posts.length}</span> posts
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1.5 text-white/80">
                  <Users className="w-4 h-4 text-teal-200" />
                  <span className="font-bold text-white">{uniqueContributors}</span> contributors
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1.5 text-white/80">
                  <Lightbulb className="w-4 h-4 text-teal-200" />
                  <span className="font-bold text-white">{totalKnowledge}</span> knowledge shared
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── Mobile Leaderboard Strip ─── */}
        {leaderboard.length > 0 && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 px-4 py-2.5 overflow-x-auto scrollbar-hide">
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 whitespace-nowrap flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Leaders
              </span>
              {leaderboard.slice(0, 5).map(entry => (
                <div key={entry.userId} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 rounded-xl px-2.5 py-1.5 shrink-0">
                  {getRankIcon(entry.rank)}
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden">
                    {entry.image ? <img src={entry.image} alt="" className="w-full h-full object-cover" /> : getInitials(entry.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-900 dark:text-white max-w-[80px] truncate">{entry.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-gray-500">{entry.totalLikes} ❤️</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Main Content ─── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex gap-6">
            {/* ─── Left Column (Feed) ─── */}
            <div className="flex-1 min-w-0" style={{ maxWidth: 'calc(100% - 340px)' }}>
              <div className="lg:max-w-none max-w-2xl">

                {/* ─── Compose Box ─── */}
                {currentUser ? (
                  hasPublicProfile ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 mb-6 overflow-hidden"
                      ref={composeRef}
                    >
                      {/* Collapsed header */}
                      {!composeOpen && (
                        <button
                          onClick={() => setComposeOpen(true)}
                          className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                            {(currentUser.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-slate-400 dark:text-gray-500 text-sm">What&apos;s inspiring you today? Share an insight, ask a question...</p>
                          </div>
                          <Plus className="w-5 h-5 text-teal-500" />
                        </button>
                      )}

                      {/* Expanded compose */}
                      <AnimatePresence>
                        {composeOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-slate-100 dark:border-slate-700"
                          >
                            <div className="p-4">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                                  {(currentUser.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={composeContent}
                                    onChange={(e) => setComposeContent(e.target.value.slice(0, MAX_CHARS))}
                                    placeholder="What's inspiring you today? Share an insight, ask a question..."
                                    className="w-full bg-transparent border-none resize-none min-h-[100px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none"
                                    autoFocus
                                  />
                                </div>
                              </div>

                              {/* Post Type Selector */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                {POST_TYPES.map(pt => (
                                  <button
                                    key={pt.value}
                                    onClick={() => setComposeType(pt.value)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                      composeType === pt.value
                                        ? `${pt.bg} ${pt.darkBg} ${pt.color} ring-1 ring-current/20`
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                                  >
                                    {pt.icon}
                                    {pt.label}
                                  </button>
                                ))}
                              </div>

                              {/* Tags */}
                              <div className="mt-3 flex flex-wrap gap-2 items-center">
                                {composeTags.map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                                    #{tag}
                                    <button onClick={() => setComposeTags(composeTags.filter(t => t !== tag))} className="ml-1.5 text-teal-500 hover:text-teal-800 dark:hover:text-teal-200">&times;</button>
                                  </span>
                                ))}
                                {composeTags.length < 5 && (
                                  <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1">
                                    <Hash className="w-3 h-3 text-slate-400 dark:text-gray-500 mr-1" />
                                    <input
                                      type="text"
                                      value={currentTag}
                                      onChange={(e) => setCurrentTag(e.target.value)}
                                      onKeyDown={handleAddTag}
                                      placeholder="Add tag (Enter)"
                                      className="bg-transparent border-none p-0 text-xs focus:ring-0 w-24 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Footer */}
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs ${composeContent.length >= 1800 ? 'text-amber-500' : 'text-slate-400 dark:text-gray-500'} ${composeContent.length >= MAX_CHARS ? 'text-rose-500' : ''}`}>
                                    {composeContent.length}/{MAX_CHARS}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => { setComposeOpen(false); setComposeContent(''); setComposeTags([]); setComposeType('general'); }}
                                    className="px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleComposeSubmit}
                                    disabled={!composeContent.trim() || submitting}
                                    className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-full font-semibold text-sm hover:from-teal-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                  >
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
                                    Post
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50 p-5 mb-6 text-center">
                      <AlertCircle className="w-7 h-7 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                      <h3 className="text-base font-bold text-amber-900 dark:text-amber-200 mb-1">Create a Profile to Post</h3>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">You need a public directory profile to share with the community.</p>
                      <Link to="/dashboard" className="inline-block px-5 py-2 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors">
                        Go to Dashboard
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 text-center">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Join the Conversation</h3>
                    <p className="text-slate-600 dark:text-gray-400 text-sm mb-3">Log in to post, like, and comment.</p>
                    <Link to="/login" className="inline-block px-5 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-semibold text-sm hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
                      Log In
                    </Link>
                  </div>
                )}

                {/* ─── Sort Tabs (New / Trending) + Filter Tabs ─── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mb-5 space-y-3"
                >
                  {/* Sort Tabs */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                      {([
                        { key: 'latest' as SortOption, label: 'New', icon: <Clock className="w-3.5 h-3.5" /> },
                        { key: 'popular' as SortOption, label: 'Trending', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                      ]).map(option => (
                        <button
                          key={option.key}
                          onClick={() => { setSortOption(option.key); setVisibleCount(POSTS_PER_PAGE); }}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            sortOption === option.key
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm'
                              : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {option.icon}
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {/* Mobile sidebar toggle */}
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-gray-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      {sidebarOpen ? 'Hide' : 'More'}
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
                    {filterTabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => { setActiveFilter(tab.key); setVisibleCount(POSTS_PER_PAGE); }}
                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                          activeFilter === tab.key
                            ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20'
                            : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            activeFilter === tab.key
                              ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-400'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                        {activeFilter === tab.key && (
                          <motion.div
                            layoutId="inspireTabIndicator"
                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-teal-500 dark:bg-teal-400 rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* ─── Trending Banner ─── */}
                {sortOption === 'popular' && trendingPosts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-2xl border border-orange-200/80 dark:border-orange-800/50 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-bold text-orange-900 dark:text-orange-200">Trending Now</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {trendingPosts.map((post, idx) => {
                        const typeConfig = POST_TYPE_CONFIG(post.type);
                        return (
                          <div key={post.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 border border-orange-100 dark:border-orange-800/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 text-[10px] font-bold">{idx + 1}</span>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${typeConfig.bg} ${typeConfig.darkBg} ${typeConfig.color}`}>
                                {typeConfig.icon}
                                {typeConfig.label}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-800 dark:text-gray-200 line-clamp-2 mb-1.5">{post.content.slice(0, 100)}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-slate-500 dark:text-gray-400 truncate max-w-[120px]">{post.authorName}</span>
                              <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                                <Heart className="w-3 h-3" /> {post.likes}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ─── Mobile Sidebar (collapsible) ─── */}
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="md:hidden mb-6 space-y-4 overflow-hidden"
                    >
                      {/* Mobile Popular Tags */}
                      {popularTags.length > 0 && (
                        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-teal-500" />
                            Popular Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {popularTags.map(({ tag, count }) => (
                              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors">
                                #{tag}
                                <span className="text-[10px] text-slate-400">{count}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mobile Leaderboard */}
                      {leaderboard.length > 0 && (
                        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Top Contributors
                          </h3>
                          <div className="space-y-2">
                            {leaderboard.map(entry => {
                              const style = getRankStyle(entry.rank);
                              return (
                                <div key={entry.userId} className={`flex items-center gap-3 rounded-xl p-2.5 border ${style.bg} ${style.border}`}>
                                  {getRankIcon(entry.rank)}
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                    {entry.image ? <img src={entry.image} alt="" className="w-full h-full object-cover" /> : getInitials(entry.name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{entry.name}</p>
                                    <p className="text-[11px] text-slate-400 dark:text-gray-500">{entry.totalPosts} posts</p>
                                  </div>
                                  <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> {entry.totalLikes}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── Feed ─── */}
                {loading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  </div>
                ) : posts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700"
                      />
                      <div className="absolute inset-3 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
                        <Sparkles className="w-8 h-8 text-teal-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Be the first to inspire the community!</h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-4">Share an insight, ask a question, or celebrate an achievement.</p>
                    {currentUser && hasPublicProfile && (
                      <button
                        onClick={() => setComposeOpen(true)}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-emerald-700 transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Create First Post
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {visiblePosts.map((post) => {
                        const typeConfig = POST_TYPE_CONFIG(post.type);
                        const authorBadge = AUTHOR_TYPE_BADGES[post.authorType] || AUTHOR_TYPE_BADGES.professional;
                        const isLiked = currentUser ? post.likedBy.includes(currentUser.membershipId) : false;
                        const isBookmarked = bookmarkedIds.includes(post.id);
                        const isOwner = currentUser && post.userId === currentUser.membershipId;
                        const isEditing = editingPostId === post.id;
                        const showReplies = expandedReplies.has(post.id);
                        const sortedComments = [...post.comments].sort((a, b) => b.likes - a.likes);
                        const topComments = sortedComments.slice(0, 2);
                        const hiddenCount = post.comments.length - 2;

                        return (
                          <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            {/* Post Header */}
                            <div className="p-4 pb-0">
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0 text-sm overflow-hidden">
                                  {post.authorImage ? (
                                    <img src={post.authorImage} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(post.authorName || 'U')
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                      {post.authorName || getAuthorName(post.userId)}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${authorBadge.cls}`}>
                                      {authorBadge.label}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeConfig.bg} ${typeConfig.darkBg} ${typeConfig.color}`}>
                                      {typeConfig.icon}
                                      {typeConfig.label}
                                    </span>
                                    <span className="text-xs text-slate-400 dark:text-gray-500 ml-auto shrink-0 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(post.createdAt)}
                                    </span>
                                  </div>

                                  {/* Post owner actions */}
                                  {isOwner && !isEditing && (
                                    <div className="flex gap-1 mt-1">
                                      <button onClick={() => startEdit(post)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors rounded" title="Edit">
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => handleDelete(post)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors rounded" title="Delete">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Post Content */}
                            <div className="px-4 pt-3 pb-2">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value.slice(0, MAX_CHARS))}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm resize-none min-h-[80px] text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button onClick={cancelEdit} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                                    <button onClick={() => handleEditSubmit(post)} disabled={!editContent.trim()} className="px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors">Save</button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap break-words">
                                  {linkifyContent(post.content)}
                                </p>
                              )}
                            </div>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                                {post.tags.map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Question — Answer button */}
                            {post.type === 'question' && !isEditing && (
                              <div className="px-4 pb-3">
                                <button
                                  onClick={() => { setReplyingTo(post.id); setCommentingOn(post.id); setComposeOpen(false); }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                >
                                  <Lightbulb className="w-4 h-4" />
                                  Answer this question
                                  {post.comments.length > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                                      {post.comments.length}
                                    </span>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Inline Comments Preview */}
                            {post.comments.length > 0 && !isEditing && (
                              <div className="px-4 pb-2">
                                {topComments.map(comment => (
                                  <div key={comment.id} className="flex gap-2 py-2 border-t border-slate-100 dark:border-slate-700/50 first:border-t-0">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                      {comment.authorImage ? (
                                        <img src={comment.authorImage} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        getInitials(comment.authorName || 'U')
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{comment.authorName}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-gray-500">{formatDate(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5 line-clamp-2">{comment.content}</p>
                                      {/* Sources */}
                                      {comment.sources && comment.sources.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {comment.sources.map((src, si) => (
                                            <a
                                              key={si}
                                              href={src}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors max-w-[200px] truncate"
                                            >
                                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                              <span className="truncate">{src.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {post.comments.length > 2 && !showReplies && (
                                  <button
                                    onClick={() => toggleReplies(post.id)}
                                    className="w-full py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                                  >
                                    View all {post.comments.length} comments
                                  </button>
                                )}

                                {showReplies && post.comments.length > 2 && (
                                  <div className="space-y-0">
                                    {sortedComments.slice(2).map(comment => (
                                      <div key={comment.id} className="flex gap-2 py-2 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                                          {comment.authorImage ? (
                                            <img src={comment.authorImage} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            getInitials(comment.authorName || 'U')
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-900 dark:text-white">{comment.authorName}</span>
                                            <span className="text-[10px] text-slate-400 dark:text-gray-500">{formatDate(comment.createdAt)}</span>
                                          </div>
                                          <p className="text-xs text-slate-600 dark:text-gray-300 mt-0.5">{comment.content}</p>
                                          {/* Sources */}
                                          {comment.sources && comment.sources.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                              {comment.sources.map((src, si) => (
                                                <a
                                                  key={si}
                                                  href={src}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors max-w-[200px] truncate"
                                                >
                                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                                  <span className="truncate">{src.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      onClick={() => toggleReplies(post.id)}
                                      className="w-full py-1.5 text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-slate-700 transition-colors"
                                    >
                                      Show fewer comments
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Comment Input with Sources */}
                            {commentingOn === post.id && !isEditing && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="px-4 pb-3"
                              >
                                <div className="flex gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder={replyingTo === post.id && post.type === 'question' ? "Write your answer..." : "Write a comment..."}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleComment(post); }}
                                      />
                                      <button
                                        onClick={() => handleComment(post)}
                                        disabled={!commentContent.trim()}
                                        className="p-1.5 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition-colors disabled:opacity-40"
                                      >
                                        <Send className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => { setCommentingOn(null); setReplyingTo(null); setCommentContent(''); setCommentSources([]); setCurrentSource(''); }}
                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Source inputs */}
                                    <div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {commentSources.map((src, si) => (
                                          <span key={si} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 max-w-[200px]">
                                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                            <span className="truncate">{src.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                                            <button onClick={() => setCommentSources(commentSources.filter((_, i) => i !== si))} className="ml-0.5 text-teal-400 hover:text-teal-700 dark:hover:text-teal-200">&times;</button>
                                          </span>
                                        ))}
                                        {commentSources.length < 3 && (
                                          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full px-2.5 py-0.5 flex-1 min-w-[140px] max-w-full">
                                            <ExternalLink className="w-2.5 h-2.5 text-slate-400 dark:text-gray-500 mr-1 shrink-0" />
                                            <input
                                              type="text"
                                              value={currentSource}
                                              onChange={(e) => setCurrentSource(e.target.value)}
                                              onKeyDown={handleAddSource}
                                              placeholder="Add source URL (Enter)"
                                              className="bg-transparent border-none p-0 text-[10px] focus:ring-0 w-full text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">Optional: add up to 3 source URLs to support your answer</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Action Bar */}
                            {!isEditing && (
                              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-1">
                                  {/* Like */}
                                  <button
                                    onClick={() => handleLike(post)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] ${
                                      isLiked
                                        ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20'
                                        : 'text-slate-500 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                    }`}
                                  >
                                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                    {post.likes > 0 && <span>{post.likes}</span>}
                                  </button>

                                  {/* Comment */}
                                  <button
                                    onClick={() => { setCommentingOn(commentingOn === post.id ? null : post.id); setReplyingTo(post.id); setCommentSources([]); setCurrentSource(''); }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all min-h-[36px]"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    {post.comments.length > 0 && <span>{post.comments.length}</span>}
                                  </button>

                                  {/* Share */}
                                  <button
                                    onClick={() => handleShare(post)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all min-h-[36px]"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>

                                  {/* Bookmark */}
                                  <button
                                    onClick={() => toggleBookmark(post.id)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] ${
                                      isBookmarked
                                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                        : 'text-slate-500 dark:text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                    }`}
                                  >
                                    {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Load More */}
                    {hasMore && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
                          className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-teal-300 dark:hover:border-teal-800 transition-all"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right Sidebar (Desktop) ─── */}
            <div className="hidden md:block w-[320px] shrink-0">
              <div className="sticky top-24 space-y-5">
                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        Top Contributors
                      </h3>
                      <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">Ranked by total likes received</p>
                    </div>
                    <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
                      {leaderboard.map(entry => {
                        const style = getRankStyle(entry.rank);
                        return (
                          <div
                            key={entry.userId}
                            className={`flex items-center gap-3 rounded-xl p-2.5 border transition-all hover:shadow-sm ${style.bg} ${style.border} ${entry.rank <= 3 ? style.ring : ''}`}
                          >
                            <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                              {getRankIcon(entry.rank)}
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                              {entry.image ? <img src={entry.image} alt="" className="w-full h-full object-cover" /> : getInitials(entry.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{entry.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-gray-500">{entry.totalPosts} post{entry.totalPosts !== 1 ? 's' : ''}</p>
                            </div>
                            <span className="text-xs font-bold text-rose-500 flex items-center gap-1 shrink-0">
                              <Heart className="w-3 h-3" /> {entry.totalLikes}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Popular Tags */}
                {popularTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-teal-500" />
                        Popular Tags
                      </h3>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {popularTags.map(({ tag, count }) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer transition-colors"
                        >
                          #{tag}
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 bg-slate-200 dark:bg-slate-600 rounded-full px-1.5 py-0.5">{count}</span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Community Stats Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl border border-teal-200/60 dark:border-teal-800/40 p-4"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Community Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-3 text-center">
                      <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400">{posts.length}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">Total Posts</p>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-3 text-center">
                      <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400">{uniqueContributors}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">Contributors</p>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-3 text-center">
                      <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400">{posts.reduce((s, p) => s + p.likes, 0)}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">Total Likes</p>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-3 text-center">
                      <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400">{totalKnowledge}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">Answers</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
