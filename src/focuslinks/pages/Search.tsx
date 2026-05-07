'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search as SearchIcon,
  Users,
  FileText,
  BookOpen,
  CalendarDays,
  FolderOpen,
  X,
  Clock,
  TrendingUp,
  MapPin,
  Heart,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Flame,
  Wrench,
  Command,
  Keyboard,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '../../context/NavigationContext';
import SEO from '../components/SEO';
import { globalSearchData } from '../../data/searchData';

// ── Types ───────────────────────────────────────────────────────────────────

type Category = 'all' | 'members' | 'posts' | 'articles' | 'events' | 'resources' | 'tools';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: 'members' | 'posts' | 'articles' | 'events' | 'resources' | 'tools';
  meta?: string;
  meta2?: string;
  icon: React.ReactNode;
  path: string;
  keywords?: string;
}

// ── No Mock Data — search uses GLOBAL_RESULTS from searchData.ts ──────────

// Type alias mapping for forgiving search (e.g. "tool" matches "Lab Tool", "people" matches "Profile")
const TYPE_ALIASES: Record<string, string[]> = {
  'profile': ['people', 'person', 'member', 'user', 'doctor', 'optometrist', 'practitioner'],
  'lab tool': ['tool', 'instrument', 'equipment', 'app', 'application', 'software'],
  'event': ['webinar', 'workshop', 'conference', 'meetup', 'seminar', 'competition'],
  'article': ['post', 'blog', 'story', 'write-up', 'publication', 'paper'],
  'page': ['section', 'area', 'tab', 'screen', 'view'],
  'topic': ['subject', 'condition', 'disease', 'disorder', 'concept', 'term'],
  'job': ['career', 'position', 'opening', 'role', 'employment', 'work', 'hiring'],
  'application': ['form', 'apply', 'signup', 'registration'],
};

// Map globalSearchData into our SearchResult format
const GLOBAL_RESULTS: SearchResult[] = globalSearchData.map((item) => {
  const typeLower = item.type.toLowerCase();
  let category: SearchResult['category'];
  switch (typeLower) {
    case 'profile':
      category = 'members';
      break;
    case 'event':
      category = 'events';
      break;
    case 'article':
      category = 'articles';
      break;
    case 'lab tool':
      category = 'tools';
      break;
    case 'job':
      category = 'resources';
      break;
    case 'application':
      category = 'resources';
      break;
    case 'page':
      category = 'resources';
      break;
    case 'topic':
      category = 'resources';
      break;
    default:
      category = 'resources';
  }
  return {
    id: item.id,
    title: item.title,
    subtitle: item.desc,
    category,
    meta: item.type,
    icon: item.icon,
    path: item.path,
    keywords: item.keywords,
  };
});

const ALL_MOCK_DATA: SearchResult[] = [
  ...GLOBAL_RESULTS,
];

const TRENDING_TOPICS: Array<{ label: string; count: number }> = [
  { label: 'Myopia', count: 2340 },
  { label: 'Contact Lens', count: 1890 },
  { label: 'Glaucoma', count: 1560 },
  { label: 'Orthokeratology', count: 1230 },
  { label: 'Pediatric', count: 980 },
  { label: 'Dry Eye', count: 870 },
  { label: 'Binocular Vision', count: 720 },
  { label: 'Cataract', count: 650 },
];

// ── Category Config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  all: { label: 'All', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-100 dark:bg-slate-800', borderColor: 'border-gray-200 dark:border-slate-700', icon: <SearchIcon className="w-4 h-4" /> },
  members: { label: 'Profiles', color: 'text-violet-700 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-900/40', borderColor: 'border-violet-200 dark:border-violet-800/50', icon: <Users className="w-4 h-4" /> },
  posts: { label: 'Articles', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/40', borderColor: 'border-blue-200 dark:border-blue-800/50', icon: <FileText className="w-4 h-4" /> },
  articles: { label: 'Articles', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/40', borderColor: 'border-emerald-200 dark:border-emerald-800/50', icon: <BookOpen className="w-4 h-4" /> },
  events: { label: 'Events', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/40', borderColor: 'border-amber-200 dark:border-amber-800/50', icon: <CalendarDays className="w-4 h-4" /> },
  tools: { label: 'Tools', color: 'text-cyan-700 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/40', borderColor: 'border-cyan-200 dark:border-cyan-800/50', icon: <Wrench className="w-4 h-4" /> },
  resources: { label: 'Resources', color: 'text-rose-700 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/40', borderColor: 'border-rose-200 dark:border-rose-800/50', icon: <FolderOpen className="w-4 h-4" /> },
};

const CATEGORY_BADGE: Record<string, { label: string; color: string; bgColor: string }> = {
  members: { label: 'Profile', color: 'text-violet-700 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-900/40' },
  posts: { label: 'Post', color: 'text-blue-700 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/40' },
  articles: { label: 'Article', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/40' },
  events: { label: 'Event', color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/40' },
  tools: { label: 'Tool', color: 'text-cyan-700 dark:text-cyan-400', bgColor: 'bg-cyan-100 dark:bg-cyan-900/40' },
  resources: { label: 'Resource', color: 'text-rose-700 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/40' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem('focuslinks-recent-searches');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(term: string) {
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s !== term);
    filtered.unshift(term);
    localStorage.setItem('focuslinks-recent-searches', JSON.stringify(filtered.slice(0, 10)));
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem('focuslinks-recent-searches');
  } catch {
    // ignore
  }
}

// ── Skeleton Components ────────────────────────────────────────────────────

function ResultCardSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-slate-800" />
          </div>
          <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-3 w-full rounded bg-gray-100 dark:bg-slate-800/60" />
          <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-slate-800/60" />
        </div>
        <div className="w-5 h-5 shrink-0 mt-2 rounded bg-gray-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function SidebarCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 animate-pulse">
      <div className="h-5 w-36 rounded bg-gray-200 dark:bg-slate-800 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 rounded-xl bg-gray-100 dark:bg-slate-800/60" />
        ))}
      </div>
    </div>
  );
}

// ── Animated Counter Hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return { count };
}

// ── Component ───────────────────────────────────────────────────────────────

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return getRecentSearches();
  });
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Skeleton loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus search input
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 900);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Debounce query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Filter results — forgiving search with keyword, alias, and partial matching
  const results = useMemo(() => {
    let filtered = ALL_MOCK_DATA;

    if (activeCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      // Split query into individual words for partial matching
      const queryWords = q.split(/\s+/).filter(Boolean);

      filtered = filtered.filter((item) => {
        const titleLower = item.title.toLowerCase();
        const subtitleLower = item.subtitle?.toLowerCase() || '';
        const metaLower = item.meta?.toLowerCase() || '';
        const meta2Lower = item.meta2?.toLowerCase() || '';
        const keywordsLower = item.keywords?.toLowerCase() || '';

        // 1. Exact substring match on any field (full query)
        const fullQueryMatch =
          titleLower.includes(q) ||
          subtitleLower.includes(q) ||
          metaLower.includes(q) ||
          meta2Lower.includes(q) ||
          keywordsLower.includes(q);

        if (fullQueryMatch) return true;

        // 2. Partial word match — each query word must match at least one field
        if (queryWords.length > 1) {
          const allWordsMatch = queryWords.every((word) =>
            titleLower.includes(word) ||
            subtitleLower.includes(word) ||
            metaLower.includes(word) ||
            keywordsLower.includes(word)
          );
          if (allWordsMatch) return true;
        }

        // 3. Type alias match — e.g. "tool" matches items of type "Lab Tool"
        const aliasMatch = Object.entries(TYPE_ALIASES).some(([typeKey, aliases]) => {
          if (aliases.some((alias) => alias.includes(q) || q.includes(alias))) {
            return metaLower.includes(typeKey);
          }
          return false;
        });
        if (aliasMatch) return true;

        // 4. Any individual query word matches keywords (for partial terms like "myop" matching "myopia")
        const partialKeywordMatch = queryWords.some((word) => {
          const keywordTokens = keywordsLower.split(',').map((k) => k.trim());
          return keywordTokens.some((token) => token.includes(word));
        });
        if (partialKeywordMatch) return true;

        return false;
      });
    }

    return filtered;
  }, [debouncedQuery, activeCategory]);

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      if (debouncedQuery.trim()) {
        saveRecentSearch(debouncedQuery.trim());
        setRecentSearches(getRecentSearches());
      }
      toast.success(`Opening: ${result.title}`);
      navigate(result.path);
    },
    [debouncedQuery, navigate]
  );

  const handleRecentClick = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const handleTrendingClick = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
    toast('Recent searches cleared');
  }, []);

  const handleClearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  }, []);

  const hasQuery = debouncedQuery.trim().length > 0;

  const categories: Category[] = ['all', 'members', 'articles', 'tools', 'events', 'resources'];

  const totalResults = useAnimatedCounter(results.length, 800);

  // ── Skeleton Loading State ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {/* Hero skeleton */}
        <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 px-4">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-200/40 dark:bg-violet-900/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center">
            {/* Title skeleton */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-slate-800 h-9 w-48 animate-pulse mb-6" />
            <div className="h-12 sm:h-14 lg:h-16 bg-gray-200 dark:bg-slate-800 rounded-2xl w-96 max-w-full mx-auto animate-pulse mb-4" />
            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-xl w-80 max-w-full mx-auto animate-pulse mb-10" />

            {/* Search bar skeleton */}
            <div className="max-w-2xl mx-auto">
              <div className="h-14 sm:h-16 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            </div>

            {/* Category tabs skeleton */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {categories.map((_, i) => (
                <div key={i} className="h-9 w-24 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        </section>

        {/* Content skeleton */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SidebarCardSkeleton />
            <SidebarCardSkeleton />
            <div className="md:col-span-2 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <ResultCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Loaded State ───────────────────────────────────────────────────────

  return (
    <>
    <SEO title="Search" description="Search the FocusLinks platform for profiles, articles, events, and resources." keywords="search, find, discover, platform search" />
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 px-4">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-200/40 dark:bg-violet-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Search Across FocusLinks
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="text-gradient bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Search FocusLinks
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto mb-10">
              Find members, posts, articles, events, and resources across our global optometry community.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative max-w-2xl mx-auto"
          >
            <div
              className={`relative flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                isFocused
                  ? 'border-violet-400 dark:border-violet-500 shadow-violet-500/10 dark:shadow-violet-500/5'
                  : 'border-gray-200 dark:border-slate-700 shadow-gray-200/50 dark:shadow-slate-900/50'
              }`}
            >
              <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-5 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search members, posts, articles, events..."
                className="flex-1 bg-transparent px-4 py-4 sm:py-5 text-base sm:text-lg text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                aria-label="Search FocusLinks"
              />
              {query ? (
                <button
                  onClick={handleClearQuery}
                  className="mr-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <div className="mr-3 flex items-center gap-1 text-gray-400 dark:text-gray-500">
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </kbd>
                </div>
              )}
              <button
                onClick={() => {
                  if (query.trim()) {
                    saveRecentSearch(query.trim());
                    setRecentSearches(getRecentSearches());
                  }
                }}
                className="mr-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg shadow-violet-500/20"
              >
                Search
              </button>
            </div>

            {/* Focus Glow Effect */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-emerald-500/20 blur-xl -z-10"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Category Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl mx-auto"
            role="tablist"
            aria-label="Search category filter"
          >
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    isActive
                      ? `${config.color} ${config.bgColor} ${config.borderColor} shadow-sm`
                      : 'text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {config.icon}
                  {config.label}
                  {isActive && (
                    <motion.div
                      layoutId="search-category-indicator"
                      className="absolute inset-0 rounded-full border-2 border-current opacity-30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Keyboard Shortcuts Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500"
          >
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-medium">⌘K</kbd>
              <span>to focus</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 font-medium">Esc</kbd>
              <span>to clear</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 pb-20" role="tabpanel">
        {/* Search Active State: Results or Empty */}
        {hasQuery ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${debouncedQuery}-${activeCategory}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Result Count */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <span className="tabular-nums">{totalResults.count}</span>
                  <span>result{results.length !== 1 ? 's' : ''} found</span>
                  {activeCategory !== 'all' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                      in {CATEGORY_CONFIG[activeCategory].label}
                    </span>
                  )}
                </div>
              </div>

              {/* Results */}
              {results.length > 0 ? (
                <div className="space-y-3" role="list" aria-label="Search results">
                  {results.map((result, index) => {
                    const badge = CATEGORY_BADGE[result.category] || CATEGORY_BADGE.resources;
                    return (
                      <motion.button
                        key={result.id}
                        role="listitem"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-11 h-11 rounded-xl ${badge.bgColor} flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-400 group-hover:scale-105 transition-transform`}>
                            {result.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.color} ${badge.bgColor}`}>
                                {badge.label}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                              {result.title}
                            </h3>
                            {result.subtitle && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{result.subtitle}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                              {result.meta && (
                                <span className="flex items-center gap-1">
                                  {result.category === 'members' && <MapPin className="w-3 h-3" />}
                                  {result.category === 'posts' && <Heart className="w-3 h-3" />}
                                  {result.category === 'articles' && <BookOpen className="w-3 h-3" />}
                                  {result.category === 'events' && <CalendarDays className="w-3 h-3" />}
                                  {result.category === 'tools' && <Wrench className="w-3 h-3" />}
                                  {result.category === 'resources' && <FolderOpen className="w-3 h-3" />}
                                  {result.meta}
                                </span>
                              )}
                              {result.meta2 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {result.meta2}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                /* No Results Empty State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto">
                      <SearchIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 dark:border-slate-700"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-4">
                    We couldn&apos;t find anything matching &quot;{debouncedQuery}&quot;. Try different keywords or browse categories.
                  </p>

                  {/* Suggestions */}
                  <div className="max-w-xs mx-auto mb-6">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Myopia', 'Glaucoma', 'Pediatric', 'Contact lens'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuery(suggestion)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setQuery('');
                        setActiveCategory('all');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Clear Search
                    </button>
                    <button
                      onClick={() => setActiveCategory('all')}
                      className="px-5 py-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-sm font-semibold hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-all"
                    >
                      Browse All
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Default State: Recent + Trending */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Recent Searches
                </h3>
                {recentSearches.length > 0 && (
                  <button
                    onClick={handleClearRecent}
                    className="text-xs font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                    aria-label="Clear recent searches"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {recentSearches.length > 0 ? (
                <ul className="space-y-2" role="list" aria-label="Recent searches">
                  {recentSearches.map((term, index) => (
                    <motion.li
                      key={term}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => handleRecentClick(term)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-left group"
                      >
                        <Clock className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                        <span className="truncate flex-1">{term}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No recent searches yet
                  </p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                    Your search history will appear here
                  </p>
                </div>
              )}
            </motion.div>

            {/* Trending Topics */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-amber-500" />
                Trending Searches
              </h3>
              <ul className="space-y-1" role="list" aria-label="Trending topics">
                {TRENDING_TOPICS.map((topic, index) => (
                  <motion.li
                    key={topic.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <button
                      onClick={() => handleTrendingClick(topic.label)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-400 transition-all duration-200 text-left group"
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        index < 3
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="flex-1 truncate">{topic.label}</span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-600 font-medium">{topic.count.toLocaleString()}</span>
                      <TrendingUp className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-violet-400 transition-colors shrink-0" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Quick Search Tips */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="md:col-span-2 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/30 dark:to-blue-950/30 rounded-2xl border border-violet-200/50 dark:border-violet-800/30 p-6"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Quick Search Tips
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                    <SearchIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Type to Search</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Results update in real-time as you type</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Filter by Category</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Use tabs to narrow down to profiles, articles, or tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <Keyboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Press ⌘K to focus search, Esc to clear</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Category Quick Access */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6"
            >
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500" />
                Browse by Category
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { cat: 'members' as Category, count: GLOBAL_RESULTS.filter(r => r.category === 'members').length, color: 'from-violet-500 to-purple-600' },
                  { cat: 'articles' as Category, count: GLOBAL_RESULTS.filter(r => r.category === 'articles' || r.category === 'posts').length, color: 'from-blue-500 to-cyan-600' },
                  { cat: 'tools' as Category, count: GLOBAL_RESULTS.filter(r => r.category === 'tools').length, color: 'from-cyan-500 to-teal-600' },
                  { cat: 'events' as Category, count: GLOBAL_RESULTS.filter(r => r.category === 'events').length, color: 'from-amber-500 to-orange-600' },
                  { cat: 'resources' as Category, count: GLOBAL_RESULTS.filter(r => r.category === 'resources').length, color: 'from-rose-500 to-pink-600' },
                ].map((item, index) => {
                  const config = CATEGORY_CONFIG[item.cat];
                  return (
                    <motion.button
                      key={item.cat}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
                      onClick={() => setActiveCategory(item.cat)}
                      className="relative flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-transparent transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors">
                          {config.icon}
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">
                          {config.label}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 group-hover:text-white/80 transition-colors">
                          {item.count} items
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </section>
    </div>
  </>
  );
}
