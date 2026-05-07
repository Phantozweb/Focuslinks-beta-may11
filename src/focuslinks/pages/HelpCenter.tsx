'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from '../../context/NavigationContext';
import {
  Search, Home, ChevronRight, ChevronDown, ArrowRight, ArrowLeft,
  BookOpen, User, Users, MapPin, Link2, MessageCircle, ShieldCheck,
  Wrench, Calendar, Briefcase, GraduationCap, Settings, HelpCircle,
  Headphones, ThumbsUp, ThumbsDown, Clock, Tag, Eye,
  Sparkles, Zap, FileText, ExternalLink, X, SearchIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import {
  helpArticles, helpCategories, getPopularArticles, getArticlesByCategory,
  getRelatedArticles, searchArticles, getCategoryInfo,
  type HelpArticle, type HelpCategory, type HelpCategoryInfo,
} from '../../data/helpCenterData';

/* ─── Icon mapping (string → component) ─── */
import {
  BookOpen as IBookOpen, User as IUser, Users as IUsers, MapPin as IMapPin,
  Link2 as ILink2, MessageCircle as IMessageCircle, ShieldCheck as IShieldCheck,
  Wrench as IWrench, Calendar as ICalendar, Briefcase as IBriefcase,
  GraduationCap as IGraduationCap, Settings as ISettings,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen: IBookOpen, User: IUser, Users: IUsers, MapPin: IMapPin,
  Link2: ILink2, MessageCircle: IMessageCircle, ShieldCheck: IShieldCheck,
  Wrench: IWrench, Calendar: ICalendar, Briefcase: IBriefcase,
  GraduationCap: IGraduationCap, Settings: ISettings,
};

function CategoryIcon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const Icon = iconMap[name];
  return Icon ? <Icon className={className} /> : <HelpCircle className={className} />;
}

/* ─── Quick-start steps for new users ─── */
const quickStartSteps = [
  { label: 'Create Profile', desc: 'Set up your professional identity', path: '/create-profile', icon: IUser },
  { label: 'Explore Feed', desc: 'See what the community is discussing', path: '/feed', icon: IUsers },
  { label: 'Try Labs Tools', desc: 'Use free AI clinical tools', path: '/labs', icon: IWrench },
  { label: 'Browse Events', desc: 'Join webinars and competitions', path: '/events', icon: ICalendar },
];

/* ─── FAQ data (compact) ─── */
const faqData = [
  { q: 'Is FocusLinks free?', a: 'Yes! All core features — networking, clinical Labs tools, community feed, events, job board, and marketplace — are completely free for eye care professionals and students.' },
  { q: 'Who can join FocusLinks?', a: 'Optometrists, ophthalmologists, optometry students, researchers, educators, and anyone passionate about advancing global eye care.' },
  { q: 'How do I reset my password?', a: 'Contact our support team at /contactus with your registered email. We\'ll help you reset your credentials within 24 hours.' },
  { q: 'Can I use FocusLinks on mobile?', a: 'Absolutely! FocusLinks is fully responsive and works great on mobile browsers. We also have a bottom navigation bar for easy mobile navigation.' },
  { q: 'How do I report inappropriate content?', a: 'Use the report feature on any post or contact us at /contactus. We review all reports promptly and take action as needed.' },
  { q: 'Is my data secure?', a: 'Yes. We use industry-standard security practices, encrypt data in transit, and never sell your personal information. Read our Privacy Policy at /privacy for details.' },
];

/* ─── Feedback helper (localStorage) ─── */
function getFeedback(articleId: string): 'yes' | 'no' | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem(`hc_fb_${articleId}`) as 'yes' | 'no') || null;
}
function setFeedback(articleId: string, value: 'yes' | 'no') {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`hc_fb_${articleId}`, value);
}

/* ─── Text highlight helper ─── */
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim();
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-700/60 rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Debounce hook ─── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState<HelpCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'yes' | 'no'>>(() => {
    if (typeof window === 'undefined') return {};
    const map: Record<string, 'yes' | 'no'> = {};
    helpArticles.forEach(a => {
      const fb = getFeedback(a.id);
      if (fb) map[a.id] = fb;
    });
    return map;
  });
  const searchRef = useRef<HTMLDivElement>(null);
  const articleTopRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 200);

  // Search results
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return null;
    return searchArticles(debouncedQuery);
  }, [debouncedQuery]);

  // Filtered articles by category
  const categoryArticles = useMemo(() => {
    if (selectedArticle) return [];
    if (activeCategory === 'all') return helpArticles;
    return getArticlesByCategory(activeCategory);
  }, [activeCategory, selectedArticle]);

  // Grouped search results by category
  const groupedResults = useMemo(() => {
    if (!searchResults) return null;
    const groups: Record<string, HelpArticle[]> = {};
    searchResults.forEach(a => {
      const cat = a.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(a);
    });
    return groups;
  }, [searchResults]);

  const popularArticles = useMemo(() => getPopularArticles(), []);

  // Close search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll to top when changing view
  const scrollToTop = useCallback(() => {
    articleTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleArticleClick = useCallback((article: HelpArticle) => {
    setSelectedArticle(article);
    setOpenMobileCategory(null);
    scrollToTop();
  }, [scrollToTop]);

  const handleBackToList = useCallback(() => {
    setSelectedArticle(null);
    scrollToTop();
  }, [scrollToTop]);

  const handleFeedback = useCallback((articleId: string, value: 'yes' | 'no') => {
    setFeedback(articleId, value);
    setFeedbackMap(prev => ({ ...prev, [articleId]: value }));
  }, []);

  const handleCategoryClick = useCallback((cat: HelpCategory | 'all') => {
    setActiveCategory(cat);
    setSelectedArticle(null);
    setSearchQuery('');
    scrollToTop();
  }, [scrollToTop]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <SEO title="Help Center" description="Get help with FocusLinks. Find answers to frequently asked questions and support resources." keywords="help center, FAQ, support, troubleshooting" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* ── Breadcrumbs ── */}
        <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
          <Link to="/" className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600" />
          {selectedArticle ? (
            <>
              <button onClick={handleBackToList} className="text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Help Center</button>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600" />
              <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">{selectedArticle.title}</span>
            </>
          ) : (
            <span className="text-slate-900 dark:text-white font-semibold">Help Center</span>
          )}
        </nav>

        <div ref={articleTopRef} />

        {/* ── Header ── */}
        {!selectedArticle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 relative"
          >
            <div className="absolute top-0 left-1/4 w-48 h-48 bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-teal-400/10 dark:bg-teal-600/10 rounded-full blur-[50px]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold mb-5 border border-emerald-200 dark:border-emerald-800/50">
                <Headphones className="w-4 h-4" />
                We&apos;re here to help
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Help Center
              </h1>
              <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                Your complete guide to FocusLinks — find answers, explore features, and get the most out of the platform.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative mb-8 z-50 max-w-2xl mx-auto"
          ref={searchRef}
        >
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 shadow-sm transition-colors">
            <div className="pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (selectedArticle) setSelectedArticle(null); }}
              className="flex-1 pl-3 pr-3 py-3.5 bg-transparent placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none text-base font-medium text-slate-900 dark:text-white"
              placeholder="Search help articles..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="pr-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          <AnimatePresence>
            {searchQuery && searchResults !== null && (
              <motion.div
                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[480px] overflow-y-auto"
              >
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-900 dark:text-white mb-1">No results found</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      Try different keywords or{' '}
                      <button onClick={() => setSearchQuery('')} className="text-emerald-600 hover:underline">browse categories</button>
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-3">Try: &quot;profile&quot;, &quot;OD-CAM&quot;, &quot;membership&quot;, &quot;events&quot;</p>
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Results</span>
                      <span className="text-xs text-slate-400 dark:text-gray-500">{searchResults.length} article{searchResults.length !== 1 ? 's' : ''}</span>
                    </div>
                    {groupedResults && Object.entries(groupedResults).map(([catId, articles]) => {
                      const catInfo = getCategoryInfo(catId as HelpCategory);
                      return (
                        <div key={catId} className="mb-2 last:mb-0">
                          <div className="px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            {catInfo?.title || catId}
                          </div>
                          {articles.slice(0, 4).map(article => (
                            <button
                              key={article.id}
                              onClick={() => { handleArticleClick(article); setSearchQuery(''); }}
                              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                            >
                              <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                <HighlightText text={article.title} query={debouncedQuery} />
                              </div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                <HighlightText text={article.content.slice(0, 120)} query={debouncedQuery} />
                              </p>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            ARTICLE DETAIL VIEW
            ══════════════════════════════════════════════════════════ */}
        {selectedArticle && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedArticle.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              {/* Back button */}
              <button
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Help Center
              </button>

              {/* Article card */}
              <article className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
                {/* Category badge */}
                {(() => {
                  const catInfo = getCategoryInfo(selectedArticle.category);
                  return catInfo ? (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        <CategoryIcon name={catInfo.icon} className="w-3.5 h-3.5" />
                        {catInfo.title}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500">
                        <Clock className="w-3 h-3" />
                        {Math.ceil(selectedArticle.content.length / 200)} min read
                      </span>
                    </div>
                  ) : null;
                })()}

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  {selectedArticle.title}
                </h1>

                {/* Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                  {selectedArticle.content.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return <div key={i} className="h-3" />;
                    if (trimmed.startsWith('•')) {
                      return (
                        <div key={i} className="flex gap-2 mb-1.5">
                          <span className="text-emerald-500 mt-1 shrink-0">•</span>
                          <span className="text-slate-700 dark:text-gray-300 text-[15px]">{trimmed.slice(1).trim()}</span>
                        </div>
                      );
                    }
                    if (/^\d+\.\s/.test(trimmed) || trimmed.startsWith('Step')) {
                      return <p key={i} className="font-semibold text-slate-800 dark:text-gray-200 mt-3 mb-1">{trimmed}</p>;
                    }
                    return <p key={i} className="text-slate-700 dark:text-gray-300 text-[15px] leading-relaxed mb-2">{trimmed}</p>;
                  })}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {selectedArticle.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Was this helpful? */}
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Was this article helpful?</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleFeedback(selectedArticle.id, 'yes')}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        feedbackMap[selectedArticle.id] === 'yes'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Yes
                    </button>
                    <button
                      onClick={() => handleFeedback(selectedArticle.id, 'no')}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        feedbackMap[selectedArticle.id] === 'no'
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-slate-600 hover:border-rose-300 hover:text-rose-600'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No
                    </button>
                    {feedbackMap[selectedArticle.id] && (
                      <span className="text-xs text-slate-400 dark:text-gray-500">Thanks for your feedback!</span>
                    )}
                  </div>
                </div>

                {/* Related articles */}
                {(() => {
                  const related = getRelatedArticles(selectedArticle);
                  if (related.length === 0) return null;
                  return (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Related Articles</h3>
                      <div className="space-y-2">
                        {related.map(r => (
                          <button
                            key={r.id}
                            onClick={() => handleArticleClick(r)}
                            className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                          >
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg shrink-0">
                              <CategoryIcon name={getCategoryInfo(r.category)?.icon || 'HelpCircle'} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                {r.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-gray-400">{getCategoryInfo(r.category)?.title}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </article>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ══════════════════════════════════════════════════════════
            MAIN LANDING / LIST VIEW (when no article selected)
            ══════════════════════════════════════════════════════════ */}
        {!selectedArticle && !searchQuery && (
          <>
            {/* ── Quick-Start Guide ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-10"
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">New to FocusLinks?</h2>
                  <span className="text-sm text-slate-500 dark:text-gray-400">Get started in 4 steps:</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickStartSteps.map((step, i) => (
                    <Link
                      key={i}
                      to={step.path}
                      className="flex flex-col items-center text-center p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-emerald-100 dark:border-emerald-800/30 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <step.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 mb-0.5">{step.label}</span>
                      <span className="text-[11px] text-slate-500 dark:text-gray-400">{step.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Popular Articles ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Popular Articles</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {popularArticles.map((article, i) => {
                  const catInfo = getCategoryInfo(article.category);
                  return (
                    <motion.button
                      key={article.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.04, duration: 0.3 }}
                      onClick={() => handleArticleClick(article)}
                      className="text-left p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                          <CategoryIcon name={catInfo?.icon || 'HelpCircle'} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            {catInfo?.title}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-gray-600 mt-0.5 group-hover:text-emerald-500 transition-colors shrink-0" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── FAQ Accordion ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
              </div>
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
                {faqData.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── Categories + Articles with Sidebar/Desktop / Accordion/Mobile ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Browse All Articles</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 shrink-0">
                  <div className="sticky top-24 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700/50">
                      <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider px-2">Categories</p>
                    </div>
                    <div className="max-h-[calc(100vh-240px)] overflow-y-auto p-1.5">
                      <button
                        onClick={() => handleCategoryClick('all')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          activeCategory === 'all'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                        }`}
                      >
                        <HelpCircle className="w-4 h-4" />
                        All Topics
                        <span className="ml-auto text-xs opacity-60">{helpArticles.length}</span>
                      </button>
                      {helpCategories.map(cat => {
                        const count = getArticlesByCategory(cat.id).length;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                              activeCategory === cat.id
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                            }`}
                          >
                            <CategoryIcon name={cat.icon} className="w-4 h-4" />
                            {cat.title}
                            <span className="ml-auto text-xs opacity-60">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                {/* Mobile Category Pills */}
                <div className="md:hidden">
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                    <button
                      onClick={() => handleCategoryClick('all')}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                        activeCategory === 'all'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      All ({helpArticles.length})
                    </button>
                    {helpCategories.map(cat => {
                      const count = getArticlesByCategory(cat.id).length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border flex items-center gap-1.5 ${
                            activeCategory === cat.id
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <CategoryIcon name={cat.icon} className="w-3 h-3" />
                          {cat.title} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Article List */}
                <div className="flex-1 min-w-0">
                  {/* Category Header */}
                  {activeCategory !== 'all' && (() => {
                    const catInfo = getCategoryInfo(activeCategory as HelpCategory);
                    return catInfo ? (
                      <div className="mb-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <CategoryIcon name={catInfo.icon} className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{catInfo.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{catInfo.description}</p>
                      </div>
                    ) : null;
                  })()}

                  {/* Mobile Accordion by Category */}
                  {activeCategory === 'all' && (
                    <div className="md:hidden space-y-3">
                      {helpCategories.map(cat => {
                        const articles = getArticlesByCategory(cat.id);
                        const isOpen = openMobileCategory === cat.id;
                        return (
                          <div key={cat.id} className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <button
                              onClick={() => setOpenMobileCategory(isOpen ? null : cat.id)}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                  <CategoryIcon name={cat.icon} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{cat.title}</span>
                                  <span className="text-xs text-slate-400 dark:text-gray-500 ml-2">{articles.length}</span>
                                </div>
                              </div>
                              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 space-y-1">
                                    {articles.map(article => (
                                      <button
                                        key={article.id}
                                        onClick={() => handleArticleClick(article)}
                                        className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                      >
                                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                          {article.title}
                                        </span>
                                        {article.popular && (
                                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold">Popular</span>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Desktop Article Cards (when category selected or all) */}
                  <div className={`${activeCategory === 'all' ? 'hidden md:block' : ''} space-y-2`}>
                    {categoryArticles.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-gray-400">No articles in this category yet.</p>
                      </div>
                    ) : (
                      categoryArticles.map((article, i) => {
                        const catInfo = getCategoryInfo(article.category);
                        return (
                          <motion.button
                            key={article.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.25 }}
                            onClick={() => handleArticleClick(article)}
                            className="w-full text-left flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all group"
                          >
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                              <CategoryIcon name={catInfo?.icon || 'HelpCircle'} className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                  {article.title}
                                </h3>
                                {article.popular && (
                                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                {article.content.slice(0, 100).replace(/\n/g, ' ')}...
                              </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 shrink-0">
                              {activeCategory === 'all' && catInfo && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-400">
                                  {catInfo.title}
                                </span>
                              )}
                              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors" />
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="mt-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Still Need Help?</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { title: 'Contact Us', desc: 'Reach our support team', path: '/contactus', icon: <Headphones className="w-5 h-5 text-sky-500" />, color: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/50' },
                  { title: 'Report a Bug', desc: 'Technical issues? Let us know', path: '/contactus', icon: <HelpCircle className="w-5 h-5 text-rose-500" />, color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50' },
                  { title: 'Request a Feature', desc: 'Suggest improvements', path: '/contactus', icon: <Sparkles className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50' },
                  { title: 'Community Feed', desc: 'Ask fellow professionals', path: '/feed', icon: <Users className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' },
                ].map((action, i) => (
                  <Link key={i} to={action.path} className={`block p-4 rounded-xl border ${action.color} hover:shadow-md hover:-translate-y-0.5 transition-all group`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5 group-hover:scale-110 transition-transform">{action.icon}</div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{action.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{action.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
