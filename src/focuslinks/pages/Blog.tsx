'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from '../../context/NavigationContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Filter,
  Users,
  Mail,
  CheckCircle2,
  BookOpen,
  Flame,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

// ─── Types ──────────────────────────────────────────────────────────
interface ArticleFromAPI {
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
  comments: any[];
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
}

interface DisplayArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  views: number;
}

// ─── Helpers ────────────────────────────────────────────────────────
function estimateReadTime(content: string): string {
  if (!content) return '3 min read';
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getAuthorAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random_color&color=fff&size=80`;
}

function mapArticle(a: ArticleFromAPI): DisplayArticle {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || (a.content ? a.content.substring(0, 160) + '...' : ''),
    readTime: estimateReadTime(a.content),
    category: a.category || 'General',
    image: a.coverImage || '/blog-placeholder.jpg',
    author: {
      name: a.authorName || 'Anonymous',
      avatar: getAuthorAvatar(a.authorName || 'Anonymous'),
    },
    date: formatDate(a.createdAt),
    views: a.views || 0,
  };
}

// ─── Author Avatar ─────────────────────────────────────────────────
const authorColors = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-pink-600',
];

const AuthorAvatar = ({ name, avatarUrl }: { name: string; avatarUrl?: string }) => {
  const initial = name.charAt(0).toUpperCase();
  const colorIndex = name.length % authorColors.length;
  
  return (
    <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
      <div className={`w-full h-full rounded-full ${authorColors[colorIndex]} flex items-center justify-center text-white font-bold text-xs sm:text-sm border-2 border-white dark:border-slate-800 shadow-sm`}>
        {initial}
      </div>
      {avatarUrl && (
        <img 
          src={avatarUrl} 
          alt={name} 
          className="absolute inset-0 w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
};

// ─── Read Time Badge ───────────────────────────────────────────────
const ReadTimeBadge = ({ time }: { time: string }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold rounded-lg">
    <Clock className="w-3 h-3" />
    {time}
  </span>
);

// ─── Trending Badge ────────────────────────────────────────────────
const TrendingBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold rounded-full shadow-sm">
    <Flame className="w-2.5 h-2.5" />
    Trending
  </span>
);

// ─── Skeleton Blog Card ────────────────────────────────────────────
const SkeletonBlogCard = () => (
  <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800">
    <div className="h-56 animate-shimmer rounded-none" />
    <div className="p-8 flex flex-col flex-grow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-20 h-4 animate-shimmer rounded-full" />
        <div className="w-14 h-4 animate-shimmer rounded-full" />
      </div>
      <div className="w-full h-6 animate-shimmer rounded-lg mb-3" />
      <div className="w-3/4 h-6 animate-shimmer rounded-lg mb-6" />
      <div className="flex-1 space-y-2">
        <div className="w-full h-3 animate-shimmer rounded" />
        <div className="w-full h-3 animate-shimmer rounded" />
        <div className="w-2/3 h-3 animate-shimmer rounded" />
      </div>
      <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 animate-shimmer rounded-full" />
          <div className="w-16 h-3 animate-shimmer rounded" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Featured Card with Tilt ───────────────────────────────────────
const FeaturedTiltCard = ({ post }: { post: DisplayArticle }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  // Parse read time for progress bar
  const readMinutes = parseInt(post.readTime) || 5;
  const progressPercent = Math.min((readMinutes / 15) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-16"
    >
      <Link to={`/blog/${post.slug}`} className="group relative block">
        <div 
          ref={cardRef}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-800 tilt-card"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto overflow-hidden">
              {post.image && (
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              )}
              {(!post.image || post.image === '/blog-placeholder.jpg') && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg">
                  Featured Article
                </span>
                <TrendingBadge />
              </div>
              {/* Views badge */}
              <div className="absolute top-6 right-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                  <Eye className="w-3.5 h-3.5" />
                  {post.views.toLocaleString()} views
                </span>
              </div>
              {/* Read progress bar */}
              <div className="absolute bottom-0 left-0 right-0">
                <div 
                  className="read-progress-bar" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
                <ReadTimeBadge time={post.readTime} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                {post.title}
              </h2>
              <p className="text-slate-600 dark:text-gray-400 text-lg mb-8 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <AuthorAvatar name={post.author.name} avatarUrl={post.author.avatar} />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{post.date}</p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:translate-x-2 group-hover:scale-110 transition-all shadow-lg shadow-blue-600/20">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Newsletter CTA Section ────────────────────────────────────────
const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    toast.success('Thanks for subscribing! 🎉', {
      description: 'You\'ll receive the latest optometry insights in your inbox.',
      duration: 4000,
    });
    
    setEmail('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 mt-16"
    >
      {/* Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 py-16 sm:py-20 px-6 sm:px-8">
        {/* Decorative floating circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full float-circle-anim" />
          <div className="absolute top-1/4 -left-20 w-48 h-48 bg-white/5 rounded-full float-circle-anim float-circle-anim-delay-1" />
          <div className="absolute -bottom-12 right-1/4 w-40 h-40 bg-white/5 rounded-full float-circle-anim float-circle-anim-delay-2" />
          <div className="absolute top-12 right-1/3 w-24 h-24 bg-white/5 rounded-full float-circle-anim float-circle-anim-delay-3" />
          <div className="absolute bottom-8 -left-8 w-32 h-32 bg-indigo-500/10 rounded-full float-circle-anim" />
          <div className="absolute top-1/2 right-12 w-20 h-20 bg-blue-400/10 rounded-full float-circle-anim float-circle-anim-delay-2" />
        </div>
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
              <Mail className="w-7 h-7 text-white" />
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight"
          >
            Stay Updated
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-blue-100 text-base sm:text-lg mb-8 leading-relaxed max-w-lg mx-auto"
          >
            Get the latest optometry insights, clinical tips, and community news delivered to your inbox.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.25 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
          >
            <div className="relative flex-grow">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitted}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Subscribed!
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6"
          >
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Users className="w-4 h-4" />
              <span className="font-medium">Join 5,000+ subscribers</span>
            </div>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-blue-300/50" />
            <span className="text-blue-200/60 text-xs">No spam. Unsubscribe anytime.</span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

// ─── Main Blog Component ───────────────────────────────────────────
export default function Blog() {
  const [articles, setArticles] = useState<DisplayArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch published articles from API
  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles?action=list-published&limit=50');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();
        const mapped = (data.articles || []).map(mapArticle);
        setArticles(mapped);
      } catch (err) {
        console.error('Failed to load articles:', err);
        toast.error('Failed to load articles', {
          description: 'Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchArticles();
  }, []);

  // Dynamic categories from articles
  const categories = useMemo(() => {
    const cats = new Set(articles.map(a => a.category));
    return ['All', ...Array.from(cats)];
  }, [articles]);

  // Filter articles by search + category
  const filteredPosts = useMemo(() => {
    return articles.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  // Featured = most views
  const featuredPost = useMemo(() => {
    if (articles.length === 0) return null;
    return articles.reduce((best, current) => (current.views > best.views ? current : best), articles[0]);
  }, [articles]);

  // Top 2 posts get trending badges (by views)
  const trendingIds = useMemo(() => {
    const sorted = [...articles].sort((a, b) => b.views - a.views);
    return sorted.slice(0, 2).map(p => p.id);
  }, [articles]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-20">
      <SEO title="Optometry Blog" description="Latest articles on optometry, clinical cases, research updates, and professional development from the FocusLinks community." keywords="optometry blog, eye care articles, clinical cases, vision science research" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-6 border border-blue-100 dark:border-blue-800/30"
          >
            <BookOpen className="w-4 h-4" />
            Knowledge Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            Insights &{' '}
            <span className="text-gradient">
              Clinical Updates
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed"
          >
            Stay at the forefront of optometry with our curated articles on technology, clinical protocols, and practice management.
          </motion.p>
        </div>

        {/* Featured Post with tilt effect */}
        {featuredPost && !searchQuery && selectedCategory === 'All' && !isLoading && (
          <FeaturedTiltCard post={featuredPost} />
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          {/* Glass-morphism search bar */}
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-gray-500 dark:text-white"
            />
            {/* Animated search focus indicator */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full group-focus-within:w-2/3 transition-all duration-500" />
          </div>
          
          {/* Enhanced category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            <Filter className="w-4 h-4 text-slate-400 dark:text-gray-500 mr-2 shrink-0" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 hover-lift ${
                  selectedCategory === category 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 scale-105' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid / Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map(i => (
              <SkeletonBlogCard key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="wait">
                {filteredPosts.map((post, idx) => {
                  const readMinutes = parseInt(post.readTime) || 5;
                  const progressPercent = Math.min((readMinutes / 15) * 100, 100);
                  const isTrending = trendingIds.includes(post.id);
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      <Link to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 hover-glow">
                        <div className="relative h-56 overflow-hidden">
                          {post.image && post.image !== '/blog-placeholder.jpg' && (
                            <img 
                              src={post.image} 
                              alt={post.title} 
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          {(!post.image || post.image === '/blog-placeholder.jpg') && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                              <BookOpen className="w-12 h-12 text-white/20" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                              {post.category}
                            </span>
                            {isTrending && <TrendingBadge />}
                          </div>
                          {/* Views badge on image */}
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold rounded-full">
                              <Eye className="w-3 h-3" />
                              {post.views}
                            </span>
                          </div>
                          {/* Read time badge on image */}
                          <div className="absolute bottom-4 right-4">
                            <ReadTimeBadge time={post.readTime} />
                          </div>
                          {/* Read progress bar at bottom of image */}
                          <div className="absolute bottom-0 left-0 right-0">
                            <div 
                              className="read-progress-bar" 
                              style={{ width: `${progressPercent}%` }} 
                            />
                          </div>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 mb-4 text-slate-400 dark:text-gray-500 text-xs font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {post.date}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-slate-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AuthorAvatar name={post.author.name} avatarUrl={post.author.avatar} />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{post.author.name}</span>
                            </div>
                            <span className="text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                              Read More →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                  <Search className="w-10 h-10 text-slate-300 dark:text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No articles found</h3>
                <p className="text-slate-500 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}

        {/* Newsletter CTA */}
        <NewsletterCTA />
      </div>
    </div>
  );
}
