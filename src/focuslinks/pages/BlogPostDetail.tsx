'use client';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link, useParams } from '../../context/NavigationContext';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Copy,
  Share2,
  MessageCircle as MessageCircleIcon,
  Send,
  Heart,
  Bookmark,
  UserPlus,
  ExternalLink,
  Check,
  ChevronDown,
  Hash,
  Loader2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

/* ─── Types ─── */
interface ArticleComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage?: string;
  images: string[];
  likes: string[];
  comments: ArticleComment[];
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
}

interface DisplayComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
}

/* ─── Helpers ─── */
function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoString;
  }
}

function timeAgo(isoString: string): string {
  try {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = now - then;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return formatDate(isoString);
  } catch {
    return isoString;
  }
}

function getAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random_color&color=fff&size=80`;
}

/* ─── Loading Skeleton ─── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-24 animate-pulse">
      {/* Progress bar skeleton */}
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700" />

      {/* Hero skeleton */}
      <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] w-full bg-slate-200 dark:bg-slate-800">
        <div className="absolute inset-0 flex flex-col justify-end pb-12 sm:pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="h-4 w-28 rounded-lg bg-white/20 mb-8" />
            <div className="flex items-center gap-4 mb-6">
              <div className="h-6 w-24 rounded-full bg-white/20" />
              <div className="h-4 w-20 rounded-lg bg-white/20" />
            </div>
            <div className="h-12 w-3/4 rounded-xl bg-white/20 mb-4" />
            <div className="h-12 w-1/2 rounded-xl bg-white/20 mb-8" />
            <div className="flex items-center gap-4 pt-8 border-t border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/20" />
              <div>
                <div className="h-4 w-32 rounded-lg bg-white/20 mb-2" />
                <div className="h-3 w-24 rounded-lg bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left sidebar skeleton */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* TOC skeleton */}
          <div className="lg:col-span-3">
            <div className="sticky top-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
              <div className="h-4 w-28 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-4 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
                ))}
              </div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="lg:col-span-6 space-y-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className={`rounded-lg bg-slate-100 dark:bg-slate-800 ${i % 3 === 0 ? 'h-4 w-3/4' : 'h-4 w-full'}`} />
            ))}
          </div>

          {/* Right sidebar skeleton */}
          <div className="lg:col-span-3 space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function BlogPostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const articleRef = useRef<HTMLDivElement>(null);

  /* ─── Article data state ─── */
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ membershipId?: string; name?: string } | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<DisplayComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showToc, setShowToc] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);
  const [copied, setCopied] = useState(false);

  /* ─── Scroll progress ─── */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const readingProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const unsub = readingProgress.on('change', (v) => setProgressPercent(Math.round(v)));
    return unsub;
  }, [readingProgress]);

  /* ─── Reset on slug change ─── */
  useEffect(() => {
    window.scrollTo(0, 0);
    setArticle(null);
    setIsLoading(true);
    setNotFound(false);
    setComments([]);
    setNewComment('');
    setIsLiked(false);
    setLikesCount(0);
    setRelatedPosts([]);
    setCopied(false);
  }, [slug]);

  /* ─── Fetch current user from localStorage ─── */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('fl_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser({
          membershipId: parsed.membershipId || parsed.id || '',
          name: parsed.name || parsed.fullName || '',
        });
      }
    } catch {
      // ignore
    }
  }, []);

  /* ─── Fetch article ─── */
  useEffect(() => {
    if (!slug) return;

    async function fetchArticle() {
      setIsLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/articles?action=get&slug=${encodeURIComponent(slug)}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch article');

        const data = await res.json();
        if (!data.article) {
          setNotFound(true);
          return;
        }

        const a = data.article as Article;
        setArticle(a);
        setIsLiked(a.likes.includes(currentUser?.membershipId || ''));
        setLikesCount(a.likes.length);

        // Convert API comments to display format
        const displayComments: DisplayComment[] = (a.comments || []).map((c) => ({
          id: c.id,
          author: c.authorName,
          avatar: getAvatarUrl(c.authorName),
          text: c.content,
          time: timeAgo(c.timestamp),
          likes: 0,
          liked: false,
        }));
        setComments(displayComments);

        // Increment views
        fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'increment-view', articleId: a.id }),
        }).catch(() => {});
      } catch (err) {
        console.error('Error fetching article:', err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  /* ─── Fetch related posts ─── */
  useEffect(() => {
    if (!article) return;

    async function fetchRelated() {
      try {
        const res = await fetch('/api/articles?action=list-published');
        if (!res.ok) return;
        const data = await res.json();
        const all = (data.articles || []) as Article[];
        const sameCategory = all.filter((p) => p.id !== article.id && p.category === article.category);
        const others = all.filter((p) => p.id !== article.id && p.category !== article.category);
        setRelatedPosts([...sameCategory, ...others].slice(0, 3));
      } catch {
        // ignore
      }
    }

    fetchRelated();
  }, [article]);

  /* ─── Extract headings for TOC ─── */
  const headings = useMemo(() => {
    if (!article) return [];
    const regex = /^(#{2,3})\s+(.+)$/gm;
    const items: { level: number; text: string; id: string }[] = [];
    let match;
    while ((match = regex.exec(article.content)) !== null) {
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      items.push({ level: match[1].length, text, id });
    }
    return items;
  }, [article]);

  const [activeHeading, setActiveHeading] = useState('');

  useEffect(() => {
    if (headings.length === 0) return;
    const handleScroll = () => {
      const elements = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
      if (elements.length === 0) return;
      let current = headings[0].id;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          current = el.id;
        }
      }
      setActiveHeading(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  /* ─── Handlers ─── */
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';
    switch (platform) {
      case 'Facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'Twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'LinkedIn':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    if (platform !== 'Copy Link') {
      toast.success('Opening share dialog...');
    }
  };

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  }, []);

  const handleSubscribe = () => {
    toast.success('Subscribed successfully!');
  };

  const handleLike = async () => {
    if (!article || !currentUser?.membershipId) {
      toast.error('Please log in to like articles');
      return;
    }

    // Optimistic update
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => prev + (newLiked ? 1 : -1));

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', articleId: article.id, membershipId: currentUser.membershipId }),
      });
      if (!res.ok) throw new Error('Failed to like');
      const data = await res.json();
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch {
      // Revert optimistic update
      setIsLiked(!newLiked);
      setLikesCount((prev) => prev + (newLiked ? -1 : 1));
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser?.membershipId) {
      toast.error('Please log in to comment');
      return;
    }
    if (!article) return;

    const commentText = newComment.trim();
    const userName = currentUser.name || 'Anonymous';

    // Optimistic add
    const optimisticComment: DisplayComment = {
      id: Date.now().toString(),
      author: userName,
      avatar: getAvatarUrl(userName),
      text: commentText,
      time: 'Just now',
      likes: 0,
      liked: false,
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment('');

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'comment',
          articleId: article.id,
          comment: {
            id: Date.now().toString(),
            authorId: currentUser.membershipId,
            authorName: userName,
            content: commentText,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      toast.success('Comment added!');
    } catch {
      // Remove optimistic comment
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setNewComment(commentText);
      toast.error('Failed to add comment');
    }
  };

  const handleLikeComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
      )
    );
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  /* ─── Not Found ─── */
  if (notFound) {
    return (
      <>
        <SEO title="Post Not Found" description="The article you are looking for could not be found." />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-slate-300 dark:text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Post Not Found</h1>
          <p className="text-slate-600 dark:text-gray-400 mb-8 text-center max-w-md">
            The article you&apos;re looking for might have been moved or deleted.
          </p>
          <Link
            to="/blog"
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Back to Blog
          </Link>
        </div>
      </>
    );
  }

  /* ─── Loading ─── */
  if (isLoading || !article) {
    return <LoadingSkeleton />;
  }

  const readTime = estimateReadTime(article.content);
  const authorAvatar = getAvatarUrl(article.authorName);
  const formattedDate = formatDate(article.createdAt);

  return (
    <>
      <SEO
        title={article.title}
        description={article.excerpt}
        keywords={article.tags.join(', ')}
        image={article.coverImage}
      />

      <div className="min-h-screen bg-white dark:bg-slate-900 pb-24">
        {/* Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 origin-left z-[100]"
          style={{ scaleX }}
        />

        {/* Hero Section */}
        <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] w-full overflow-hidden">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end pb-12 sm:pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm mb-8 transition-colors group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Insights
                </Link>
                <div className="flex items-center gap-4 mb-6">
                  <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                    {article.category}
                  </span>
                  <div className="flex items-center text-white/80 text-xs font-medium">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {readTime}
                  </div>
                  <div className="flex items-center text-white/60 text-xs font-medium">
                    <Eye className="w-4 h-4 mr-1.5" />
                    {article.views} views
                  </div>
                  {/* Reading progress percentage */}
                  <div className="hidden sm:flex items-center gap-2 text-white/60 text-xs font-medium">
                    <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-white/80 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span>{progressPercent}%</span>
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 sm:gap-10 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <img src={authorAvatar} alt={article.authorName} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/20 shadow-xl" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-white font-bold text-base sm:text-lg leading-none mb-1">{article.authorName}</p>
                      <p className="text-white/60 text-xs sm:text-sm font-medium">Author</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-400 text-red-400' : ''}`} />
                    {likesCount}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Sidebar Left: Social Share + TOC */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-32 flex flex-col items-center gap-6">
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest vertical-text mb-4">Share</span>
                <button onClick={() => handleShare('Facebook')} className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 group">
                  <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => handleShare('Twitter')} className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 group">
                  <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={() => handleShare('LinkedIn')} className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 group">
                  <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
                <button onClick={handleCopyLink} className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 transition-all flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 group">
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                </button>

                {/* Divider */}
                <div className="w-8 h-px bg-slate-200 dark:bg-slate-700 my-2" />

                {/* Reading progress ring */}
                <div className="relative w-12 h-12">
                  <svg className="-rotate-90 w-12 h-12" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 - (progressPercent / 100) * 2 * Math.PI * 20}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-gray-400">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Table of Contents - Sidebar */}
            {headings.length > 0 && (
              <div className="lg:col-span-3 order-first lg:order-none">
                <div className="sticky top-32">
                  <button
                    onClick={() => setShowToc(!showToc)}
                    className="w-full flex items-center justify-between mb-4 px-1 lg:hidden"
                  >
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-600" /> Table of Contents
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showToc ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showToc && (
                      <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:block overflow-hidden"
                      >
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 lg:p-6">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" /> On This Page
                          </h4>
                          <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
                            {headings.map((heading) => (
                              <button
                                key={heading.id}
                                onClick={() => scrollToHeading(heading.id)}
                                className={`block w-full text-left text-sm py-1.5 transition-all rounded-lg ${
                                  activeHeading === heading.id
                                    ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/30 pl-3'
                                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white pl-3'
                                } ${heading.level === 3 ? 'ml-4 text-xs' : ''}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeHeading === heading.id ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                  {heading.text}
                                </span>
                              </button>
                            ))}
                          </div>
                          {/* Mobile share buttons */}
                          <div className="flex gap-2 mt-5 pt-5 border-t border-slate-200 dark:border-slate-700 lg:hidden">
                            <button onClick={handleCopyLink} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Copy className="w-3.5 h-3.5" /> Copy
                            </button>
                            <button onClick={() => handleShare('Twitter')} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <Share2 className="w-3.5 h-3.5" /> Share
                            </button>
                          </div>
                        </div>
                      </motion.nav>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="lg:col-span-6" ref={articleRef}>
              {/* Enhanced typography styles */}
              <div className="prose prose-lg prose-slate max-w-none
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:leading-tight
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-snug
                prose-p:text-slate-600 dark:prose-p:text-gray-300 prose-p:leading-[1.8] prose-p:letter-wide
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-900 dark:prose-strong:text-white
                prose-blockquote:border-l-4 prose-blockquote:border-blue-600
                prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-slate-800
                prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl
                prose-blockquote:italic prose-blockquote:text-slate-700 dark:prose-blockquote:text-gray-300
                dark:prose-blockquote:border-slate-700
                prose-img:rounded-[2rem] prose-img:shadow-2xl
                dark:prose-li:text-gray-300 dark:prose-code:text-gray-300
                dark:prose-hr:border-slate-700
                prose-li:leading-[1.8]
              ">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>

              {/* Copy Link & Share & Like buttons */}
              <div className="mt-12 flex items-center gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleShare('Twitter')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-all"
                >
                  <Share2 className="w-4 h-4" /> Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
                    isLiked
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'} {likesCount > 0 && `(${likesCount})`}
                </motion.button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-gray-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-800 transition-all">
                  <Bookmark className="w-4 h-4" /> Save
                </button>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-gray-400 text-sm font-bold rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 transition-all cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author Card */}
              <div className="mt-12 p-8 sm:p-10 bg-gradient-to-br from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-800/80 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                <img src={authorAvatar} alt={article.authorName} className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl" referrerPolicy="no-referrer" />
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">{article.authorName}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 uppercase tracking-widest sm:self-center">
                      Author
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                    Contributing author on FocusLinks Insights. Sharing knowledge and expertise to help the community stay informed with the latest in optometry and eye care.
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                    <Link to="/directory" className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-200 dark:hover:border-blue-800">
                      View Profile <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button className="text-sm font-bold text-white flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/20">
                      <UserPlus className="w-3.5 h-3.5" /> Follow
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                  <MessageCircleIcon className="w-6 h-6 text-blue-600" />
                  Comments ({comments.length})
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-8">Join the discussion and share your thoughts.</p>

                {/* Add Comment Form */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 mb-8">
                  <div className="flex items-start gap-3">
                    <img src={getAvatarUrl(currentUser?.name || 'You')} alt="You" className="w-9 h-9 rounded-full object-cover shrink-0 mt-1" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={currentUser?.membershipId ? 'Share your thoughts on this article...' : 'Log in to comment...'}
                        disabled={!currentUser?.membershipId}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all min-h-[80px] disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={3}
                      />
                      <div className="flex justify-end mt-3">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || !currentUser?.membershipId}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-600/20"
                        >
                          <Send className="w-4 h-4" /> Post Comment
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircleIcon className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                      >
                        <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{comment.author}</span>
                            <span className="text-xs text-slate-400 dark:text-gray-500">{comment.time}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-3">{comment.text}</p>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                                comment.liked
                                  ? 'text-rose-500'
                                  : 'text-slate-400 dark:text-gray-500 hover:text-rose-500'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${comment.liked ? 'fill-current' : ''}`} />
                              {comment.likes > 0 && comment.likes}
                            </button>
                            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-gray-500 hover:text-blue-600 transition-colors">
                              <MessageCircleIcon className="w-3.5 h-3.5" /> Reply
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Right: Related Posts & Newsletter */}
            <div className="lg:col-span-3">
              <div className="sticky top-32 space-y-12">

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-600 rounded-full" />
                      Related Insights
                    </h3>
                    <div className="space-y-6">
                      {relatedPosts.map((related) => (
                        <Link key={related.id} to={`/blog/${related.slug}`} className="group block">
                          <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
                            {related.coverImage ? (
                              <img src={related.coverImage} alt={related.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 dark:from-slate-700 to-slate-300 dark:to-slate-600" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-blue-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                {related.category}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 left-2.5 right-2.5">
                              <p className="text-white text-xs font-medium flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {estimateReadTime(related.content)}
                              </p>
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1.5 text-sm">
                            {related.title}
                          </h4>
                          <div className="flex items-center gap-3 text-slate-400 dark:text-gray-500 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(related.createdAt)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-8 sm:p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-bl-full blur-2xl" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white mb-3 leading-tight">Join the FocusLinks Newsletter</h3>
                    <p className="text-slate-400 dark:text-gray-500 text-sm mb-6 leading-relaxed">Get the latest clinical updates and technology insights delivered straight to your inbox.</p>
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Your email address"
                        className="w-full px-5 py-3.5 bg-white/5 dark:bg-slate-900/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                      />
                      <button
                        onClick={handleSubscribe}
                        className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-sm"
                      >
                        Subscribe Now
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-5 text-center">
                      By subscribing, you agree to our Privacy Policy and Terms of Service.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 sm:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                Ready to elevate your clinical practice?
              </h2>
              <p className="text-blue-100 text-lg mb-12 leading-relaxed">
                Join thousands of eye care professionals worldwide and get access to exclusive tools, networking, and insights.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/membership" className="w-full sm:w-auto px-10 py-4 bg-white dark:bg-slate-900 text-blue-600 font-black rounded-2xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                  Join Network
                </Link>
                <Link to="/labs" className="w-full sm:w-auto px-10 py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-400 transition-all border border-blue-400/30 active:scale-95">
                  Explore Labs
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
