'use client';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Clock, ArrowRight, User, Search, Bookmark, BookmarkCheck, Share2, Eye, Star, TrendingUp, Sparkles, X, Heart, MessageSquare, PenSquare, Loader2 } from 'lucide-react';
import { useNavigate, Link } from '../../context/NavigationContext';
import { toast } from 'sonner';
import { motion, AnimatePresence, useInView } from 'motion/react';
import SEO from '../components/SEO';

/* ─── GitHub Article Interface ─── */
interface ArticleComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

interface GitHubArticle {
  id: string;
  slug: string;
  authorId: string;
  authorName: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage?: string;
  images: string[];
  likes: string[];
  comments: ArticleComment[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── No fallback static articles — fetch from API ─── */

/* ─── Unified display type ─── */
interface DisplayArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  createdAt: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  coverImage?: string;
  isGithub: boolean;
  readTime?: string;
}

function toDisplayArticle(a: GitHubArticle): DisplayArticle {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    authorName: a.authorName,
    createdAt: a.createdAt,
    views: a.views,
    likesCount: a.likes?.length ?? 0,
    commentsCount: a.comments?.length ?? 0,
    coverImage: a.coverImage,
    isGithub: true,
  };
}

/* ─── Category colors ─── */
const categoryColors: Record<string, string> = {
  Technology: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
  Clinical: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
  Research: 'bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50',
  Career: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  Practice: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
  Education: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50',
  General: 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50',
};

/* ─── Helpers ─── */
function estimateReadTime(content?: string): string {
  if (!content) return '5 min read';
  const words = content.split(/\s+/).length;
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

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/* ─── Bookmarks hook ─── */
function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('fl_article_bookmarks');
      if (stored) return new Set(JSON.parse(stored) as string[]);
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info('Bookmark removed');
      } else {
        next.add(id);
        toast.success('Article bookmarked!');
      }
      try {
        localStorage.setItem('fl_article_bookmarks', JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { bookmarks, toggleBookmark };
}

/* ─── Skeleton Loader ─── */
function ArticleCardSkeleton() {
  return (
    <>
    <SEO title="Articles" description="Browse and read optometry articles from the FocusLinks community." keywords="articles, optometry articles, eye care content" />
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="flex gap-2">
          <div className="h-6 w-12 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-6 w-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-6 w-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="h-6 w-full rounded bg-slate-200 dark:bg-slate-700 mb-2" />
      <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800 mb-4" />
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div>
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
            <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  </>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="mb-12">
      <div className="rounded-3xl bg-gradient-to-br from-slate-300 dark:from-slate-700 to-slate-400 dark:to-slate-800 p-8 md:p-12 animate-pulse">
        <div className="flex gap-3 mb-4">
          <div className="h-7 w-20 rounded-full bg-white/20" />
          <div className="h-7 w-24 rounded-full bg-white/20" />
        </div>
        <div className="h-10 w-3/4 rounded bg-white/20 mb-4" />
        <div className="space-y-2 mb-6 max-w-2xl">
          <div className="h-5 w-full rounded bg-white/10" />
          <div className="h-5 w-5/6 rounded bg-white/10" />
          <div className="h-5 w-2/3 rounded bg-white/10" />
        </div>
        <div className="flex gap-4 mb-6">
          <div className="h-5 w-32 rounded bg-white/10" />
          <div className="h-5 w-20 rounded bg-white/10" />
          <div className="h-5 w-24 rounded bg-white/10" />
        </div>
        <div className="h-10 w-44 rounded-xl bg-white/20" />
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Articles() {
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const featuredRefEl = useRef(null);
  const featuredInView = useInView(featuredRefEl, { once: true, margin: '-60px' });
  const gridRefEl = useRef(null);
  const gridInView = useInView(gridRefEl, { once: true, margin: '-40px' });
  const sidebarRefEl = useRef(null);
  const sidebarInView = useInView(sidebarRefEl, { once: true, margin: '-40px' });

  /* ─── Fetch articles from GitHub API ─── */
  useEffect(() => {
    async function fetchArticles() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/articles?action=list-published');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();

        if (data.articles && data.articles.length > 0) {
          const displayArticles = data.articles.map((a: GitHubArticle) => toDisplayArticle(a));
          setArticles(displayArticles);
          setIsUsingFallback(false);
        } else {
          // No GitHub articles — show empty state
          setArticles([]);
          setIsUsingFallback(false);
        }
      } catch (err) {
        console.error('Error fetching articles from GitHub:', err);
        setArticles([]);
        setIsUsingFallback(false);
      } finally {
        setIsLoading(false);
      }
    }

    // Check for logged-in user
    try {
      const storedUser = localStorage.getItem('fl_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore
    }

    fetchArticles();
  }, []);

  /* ─── Dynamic category filters ─── */
  const categoryFilters = useMemo(() => {
    const cats = Array.from(new Set(articles.map(a => a.category)));
    cats.sort();
    return ['All', ...cats];
  }, [articles]);

  /* ─── Filtering ─── */
  const filteredArticles = useMemo(() => {
    let result = articles;

    if (activeCategory !== 'All') {
      result = result.filter(a => a.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [searchQuery, activeCategory, articles]);

  const featuredArticle = useMemo(
    () => articles.length > 0
      ? [...articles].sort((a, b) => b.views - a.views)[0]
      : null,
    [articles]
  );

  const suggestedArticles = useMemo(
    () => {
      const featuredId = featuredArticle?.id;
      return articles
        .filter(a => a.id !== featuredId)
        .sort((a, b) => b.views - a.views)
        .slice(0, 3);
    },
    [articles, featuredArticle]
  );

  /* ─── Handlers ─── */
  const handleOpenArticle = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const handleShare = async (title: string, slug: string) => {
    const url = `${window.location.origin}/#/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(`${title} — ${url}`);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  /* ─── Animation variants ─── */
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-4 border border-blue-200 dark:border-blue-800/50">
            <Sparkles className="w-4 h-4" />
            Knowledge Hub
          </div>
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Articles & Insights
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-balance">
            Stay updated with the latest clinical research, practice management tips, and technology trends in optometry.
          </p>
          {/* Write Article button for logged-in users */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-5"
            >
              <Link
                to="/create-article"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <PenSquare className="w-4 h-4" />
                Write Article
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* ─── Search Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, topic, or author..."
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:border-blue-700 transition-all shadow-sm"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ─── Category Filter Pills ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ─── Loading State ─── */}
        {isLoading ? (
          <>
            <FeaturedSkeleton />
            <div className="flex gap-8">
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <ArticleCardSkeleton key={i} />
                  ))}
                </div>
              </div>
              <div className="hidden lg:block w-80 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
                    <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-700 mb-5" />
                    <div className="space-y-4">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800 mb-2" />
                            <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
                    <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
                    <div className="space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                          <div className="h-5 w-10 rounded bg-slate-200 dark:bg-slate-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ─── Featured Article ─── */}
            {featuredArticle && activeCategory === 'All' && !searchQuery && (
              <motion.div
                ref={featuredRefEl}
                initial={{ opacity: 0, y: 24 }}
                animate={featuredInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mb-12"
              >
                <div
                  className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 cursor-pointer group spotlight-hover"
                  onClick={() => handleOpenArticle(featuredArticle.slug)}
                >
                  {/* Cover image overlay if exists */}
                  {featuredArticle.coverImage && (
                    <div className="absolute inset-0">
                      <img
                        src={featuredArticle.coverImage}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover opacity-20"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-indigo-800/90" />
                    </div>
                  )}

                  <div className="relative z-10 p-8 md:p-12">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20">
                          <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                          Featured
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold rounded-full">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Most Read
                        </span>
                      </div>

                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-blue-100 transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-blue-100 text-base md:text-lg max-w-2xl mb-6 leading-relaxed line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-white">{featuredArticle.authorName}</span>
                        </div>
                        <span className="text-blue-200/60">|</span>
                        <span>{formatDate(featuredArticle.createdAt)}</span>
                        <span className="text-blue-200/60">|</span>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          {formatViews(featuredArticle.views)} views
                        </div>
                        {featuredArticle.likesCount > 0 && (
                          <>
                            <span className="text-blue-200/60">|</span>
                            <div className="flex items-center gap-1.5">
                              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
                              {featuredArticle.likesCount}
                            </div>
                          </>
                        )}
                        {featuredArticle.commentsCount > 0 && (
                          <>
                            <span className="text-blue-200/60">|</span>
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              {featuredArticle.commentsCount}
                            </div>
                          </>
                        )}
                      </div>

                      <motion.div
                        className="mt-6 inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold py-2.5 px-6 rounded-xl shadow-lg group-hover:bg-blue-50 dark:group-hover:bg-slate-700 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        Read Full Article
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── Main Content Area ─── */}
            <div className="flex gap-8">
              {/* ─── Article Grid ─── */}
              <div className="flex-1 min-w-0" ref={gridRefEl}>
                {/* Results count */}
                {searchQuery && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-slate-500 dark:text-gray-400 mb-4"
                  >
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
                    {activeCategory !== 'All' && ` in "${activeCategory}"`}
                  </motion.p>
                )}

                {filteredArticles.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No articles found</p>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">
                      {searchQuery || activeCategory !== 'All' ? 'Try adjusting your search or category filter' : 'Be the first to share your knowledge with the community'}
                    </p>
                    {!searchQuery && activeCategory === 'All' && (
                      <Link
                        to="/create-article"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
                      >
                        <PenSquare className="w-4 h-4" />
                        Write an Article
                      </Link>
                    )}
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredArticles
                      .filter(a => !(activeCategory === 'All' && !searchQuery && a.id === featuredArticle?.id))
                      .map((article, i) => (
                        <motion.div
                          key={article.id}
                          custom={i}
                          variants={cardVariants}
                          initial="hidden"
                          animate={gridInView ? 'visible' : 'hidden'}
                          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 flex flex-col relative overflow-hidden group spotlight-hover"
                        >
                          {/* Cover image */}
                          {article.coverImage && (
                            <div
                              className="h-44 bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden"
                              onClick={() => handleOpenArticle(article.slug)}
                            >
                              <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          )}

                          <div className="p-6 flex flex-col flex-1">
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-indigo-50 dark:to-indigo-950/30 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500" />

                            {/* Category + actions row */}
                            <div className="flex items-center justify-between mb-3">
                              <span className={`tag-pill border ${categoryColors[article.category] || categoryColors.General}`}>
                                {article.category}
                              </span>
                              <div className="flex items-center gap-1">
                                {/* View count badge */}
                                <span className="number-badge bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400">
                                  <Eye className="w-3 h-3" />
                                  {formatViews(article.views)}
                                </span>
                                {/* Likes */}
                                {article.likesCount > 0 && (
                                  <span className="number-badge bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400">
                                    <Heart className="w-3 h-3 fill-current" />
                                    {article.likesCount}
                                  </span>
                                )}
                                {/* Comments */}
                                {article.commentsCount > 0 && (
                                  <span className="number-badge bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400">
                                    <MessageSquare className="w-3 h-3" />
                                    {article.commentsCount}
                                  </span>
                                )}
                                {/* Bookmark */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(article.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  aria-label={bookmarks.has(article.id) ? 'Remove bookmark' : 'Bookmark article'}
                                >
                                  {bookmarks.has(article.id) ? (
                                    <BookmarkCheck className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                                  ) : (
                                    <Bookmark className="w-4.5 h-4.5 text-slate-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                                  )}
                                </button>
                                {/* Share */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(article.title, article.slug);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  aria-label="Share article"
                                >
                                  <Share2 className="w-4 h-4 text-slate-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                                </button>
                              </div>
                            </div>

                            {/* Title */}
                            <h3
                              className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer"
                              onClick={() => handleOpenArticle(article.slug)}
                            >
                              {article.title}
                            </h3>

                            {/* Excerpt */}
                            <p
                              className="text-slate-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed cursor-pointer"
                              onClick={() => handleOpenArticle(article.slug)}
                            >
                              {article.excerpt}
                            </p>

                            {/* Read time */}
                            <div className="flex items-center text-slate-400 dark:text-gray-500 text-xs font-medium mb-4">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {article.readTime || estimateReadTime()}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-gray-500 mr-3">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{article.authorName}</p>
                                  <p className="text-xs text-slate-500 dark:text-gray-400">{formatDate(article.createdAt)}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleOpenArticle(article.slug)}
                                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"
                                aria-label="Read article"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>

              {/* ─── Sidebar ─── */}
              <motion.aside
                ref={sidebarRefEl}
                initial={{ opacity: 0, x: 20 }}
                animate={sidebarInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden lg:block w-80 shrink-0"
              >
                <div className="sticky top-24 space-y-6">
                  {/* Articles You May Like */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">Articles You May Like</h3>
                    </div>
                    {suggestedArticles.length > 0 ? (
                      <div className="space-y-4">
                        {suggestedArticles.map((article, i) => (
                          <motion.button
                            key={article.id}
                            initial={{ opacity: 0, x: 12 }}
                            animate={sidebarInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                            onClick={() => handleOpenArticle(article.slug)}
                            className="w-full text-left group"
                          >
                            <div className="flex items-start gap-3">
                              <span className="number-badge bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                                  {article.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-gray-400">
                                  <span>{article.authorName}</span>
                                  <span className="text-slate-300 dark:text-gray-600">·</span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {formatViews(article.views)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {i < suggestedArticles.length - 1 && <div className="section-divider mt-4" />}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-gray-500 text-center py-4">
                        No suggested articles yet
                      </p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">Quick Stats</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-sm text-slate-600 dark:text-gray-400">Total Articles</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums counter-glow">{articles.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-sm text-slate-600 dark:text-gray-400">Total Views</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatViews(articles.reduce((sum, a) => sum + a.views, 0))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-sm text-slate-600 dark:text-gray-400">Categories</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{categoryFilters.length - 1}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-sm text-slate-600 dark:text-gray-400">Bookmarked</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">{bookmarks.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
