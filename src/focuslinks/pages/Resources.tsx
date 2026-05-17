'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Eye,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  Share2,
  Search,
  Clock,
  Filter,
  Star,
  Users,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Brain,
  Stethoscope,
  Microscope,
  Circle,
  Baby,
  FlaskConical,
  Target,
  Briefcase,
  X,
} from 'lucide-react';
import { useNavigate } from '@/context/NavigationContext';
import { toast } from 'sonner';
import { SITE_URL } from '../../lib/constants';
import { motion, AnimatePresence, useInView } from 'motion/react';
import SEO from '../components/SEO';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════ */

type Category =
  | 'Clinical Guidelines'
  | 'Research Papers'
  | 'Video Tutorials'
  | 'Case Studies'
  | 'Quick References'
  | 'Contact Lens Science'
  | 'Pediatric Optometry'
  | 'Ocular Pharmacology'
  | 'Vision Therapy'
  | 'Practice Management';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Resource {
  id: number;
  title: string;
  description: string;
  author: string;
  readTime: string;
  category: Category;
  difficulty: Difficulty;
  rating: number;
  featured?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESOURCE DATA — empty until real data is loaded
═══════════════════════════════════════════════════════════════════════════ */

const resources: Resource[] = [];

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY CONFIG — 10 categories with unique colors & icons
═══════════════════════════════════════════════════════════════════════════ */

const categoryConfig: Record<
  Category,
  {
    color: string;
    bg: string;
    border: string;
    darkBg: string;
    darkBorder: string;
    darkText: string;
    icon: typeof FileText;
    gradient: string;
    hoverBorder: string;
  }
> = {
  'Clinical Guidelines': {
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    darkBg: 'dark:bg-teal-900/40',
    darkBorder: 'dark:border-teal-800/50',
    darkText: 'dark:text-teal-300',
    icon: Stethoscope,
    gradient: 'from-teal-500 to-teal-600',
    hoverBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
  },
  'Research Papers': {
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    darkBg: 'dark:bg-cyan-900/40',
    darkBorder: 'dark:border-cyan-800/50',
    darkText: 'dark:text-cyan-300',
    icon: Microscope,
    gradient: 'from-cyan-500 to-cyan-600',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
  },
  'Video Tutorials': {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    darkBg: 'dark:bg-emerald-900/40',
    darkBorder: 'dark:border-emerald-800/50',
    darkText: 'dark:text-emerald-300',
    icon: Video,
    gradient: 'from-emerald-500 to-emerald-600',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  'Case Studies': {
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    darkBg: 'dark:bg-amber-900/40',
    darkBorder: 'dark:border-amber-800/50',
    darkText: 'dark:text-amber-300',
    icon: Eye,
    gradient: 'from-amber-500 to-amber-600',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  'Quick References': {
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    darkBg: 'dark:bg-violet-900/40',
    darkBorder: 'dark:border-violet-800/50',
    darkText: 'dark:text-violet-300',
    icon: FileText,
    gradient: 'from-violet-500 to-violet-600',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
  'Contact Lens Science': {
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    darkBg: 'dark:bg-rose-900/40',
    darkBorder: 'dark:border-rose-800/50',
    darkText: 'dark:text-rose-300',
    icon: Circle,
    gradient: 'from-rose-500 to-rose-600',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
  'Pediatric Optometry': {
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    darkBg: 'dark:bg-pink-900/40',
    darkBorder: 'dark:border-pink-800/50',
    darkText: 'dark:text-pink-300',
    icon: Baby,
    gradient: 'from-pink-500 to-pink-600',
    hoverBorder: 'hover:border-pink-300 dark:hover:border-pink-700',
  },
  'Ocular Pharmacology': {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    darkBg: 'dark:bg-orange-900/40',
    darkBorder: 'dark:border-orange-800/50',
    darkText: 'dark:text-orange-300',
    icon: FlaskConical,
    gradient: 'from-orange-500 to-orange-600',
    hoverBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
  },
  'Vision Therapy': {
    color: 'text-lime-700',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    darkBg: 'dark:bg-lime-900/40',
    darkBorder: 'dark:border-lime-800/50',
    darkText: 'dark:text-lime-300',
    icon: Target,
    gradient: 'from-lime-500 to-lime-600',
    hoverBorder: 'hover:border-lime-300 dark:hover:border-lime-700',
  },
  'Practice Management': {
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    darkBg: 'dark:bg-slate-900/40',
    darkBorder: 'dark:border-slate-700/50',
    darkText: 'dark:text-slate-300',
    icon: Briefcase,
    gradient: 'from-slate-500 to-slate-600',
    hoverBorder: 'hover:border-slate-300 dark:hover:border-slate-700',
  },
};

const categoryFilters: (Category | 'All')[] = [
  'All',
  'Clinical Guidelines',
  'Research Papers',
  'Video Tutorials',
  'Case Studies',
  'Quick References',
  'Contact Lens Science',
  'Pediatric Optometry',
  'Ocular Pharmacology',
  'Vision Therapy',
  'Practice Management',
];

/* ═══════════════════════════════════════════════════════════════════════════
   DIFFICULTY CONFIG
═══════════════════════════════════════════════════════════════════════════ */

const difficultyConfig: Record<
  Difficulty,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  Beginner: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    darkBg: 'dark:bg-green-900/30',
    darkText: 'dark:text-green-400',
  },
  Intermediate: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    darkBg: 'dark:bg-amber-900/30',
    darkText: 'dark:text-amber-400',
  },
  Advanced: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    darkBg: 'dark:bg-red-900/30',
    darkText: 'dark:text-red-400',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 ${className ?? ''}`}
    />
  );
}

function SkeletonState() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero skeleton */}
        <div className="text-center mb-12">
          <SkeletonPulse className="h-8 w-48 mx-auto mb-4" />
          <SkeletonPulse className="h-12 w-80 mx-auto mb-4" />
          <SkeletonPulse className="h-6 w-96 mx-auto" />
        </div>
        {/* Search skeleton */}
        <SkeletonPulse className="h-12 max-w-2xl mx-auto mb-8 rounded-2xl" />
        {/* Filter pills skeleton */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 mb-10">
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 11 }).map((_, i) => (
              <SkeletonPulse key={i} className="h-10 w-28 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>
        {/* Featured skeleton */}
        <SkeletonPulse className="h-64 w-full mb-12 rounded-3xl" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6"
            >
              <SkeletonPulse className="h-6 w-28 mb-4" />
              <SkeletonPulse className="h-6 w-full mb-3" />
              <SkeletonPulse className="h-6 w-3/4 mb-4" />
              <SkeletonPulse className="h-4 w-full mb-2" />
              <SkeletonPulse className="h-4 w-5/6 mb-6" />
              <div className="flex justify-between">
                <SkeletonPulse className="h-4 w-24" />
                <SkeletonPulse className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        {/* CTA skeleton */}
        <SkeletonPulse className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOKMARKS HOOK
═══════════════════════════════════════════════════════════════════════════ */

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    try {
      const stored = localStorage.getItem('fl_resource_bookmarks');
      if (stored) return new Set(JSON.parse(stored) as number[]);
    } catch {
      /* ignore parse errors */
    }
    return new Set<number>();
  });

  const toggleBookmark = useCallback((id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info('Bookmark removed');
      } else {
        next.add(id);
        toast.success('Resource bookmarked!');
      }
      try {
        localStorage.setItem('fl_resource_bookmarks', JSON.stringify([...next]));
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }, []);

  return { bookmarks, toggleBookmark };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER HOOK
═══════════════════════════════════════════════════════════════════════════ */

function useAnimatedCounter(
  target: number,
  duration = 1400,
  shouldStart = false
) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart || target <= 0) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD SUB-COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

function StatCard({
  icon: Icon,
  label,
  target,
  suffix,
  color,
  inView,
  delay,
  isDecimal,
}: {
  icon: typeof BookOpen;
  label: string;
  target: number;
  suffix: string;
  color: string;
  inView: boolean;
  delay: number;
  isDecimal?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const effectiveInView = inView && isInView;

  const displayCount = useAnimatedCounter(
    isDecimal ? Math.round(target * 10) : target,
    1500,
    effectiveInView
  );

  const displayValue = isDecimal
    ? (displayCount / 10).toFixed(1)
    : displayCount;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={effectiveInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-6 text-center border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
    >
      <div
        className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3 shadow-lg`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
        {displayValue}
        {suffix}
      </p>
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">
        {label}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RATING STARS COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
        />
      ))}
      {hasHalf && (
        <span className="relative inline-flex w-3.5 h-3.5">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-3.5 h-3.5 text-slate-200 dark:text-slate-700"
        />
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function Resources() {
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  /* Refs for scroll-triggered animations */
  const featuredRef = useRef(null);
  const featuredInView = useInView(featuredRef, { once: true, margin: '-60px' });
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: '-40px' });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' });
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-40px' });

  /* Skeleton loading for 600ms */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  /* ─── Filtering ─── */
  const filteredResources = useMemo(() => {
    let result = resources;

    if (activeCategory !== 'All') {
      result = result.filter((r) => r.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  const featuredResource = useMemo(() => resources.find((r) => r.featured), []);

  /* ─── Handlers ─── */
  const handleShare = useCallback(async (title: string) => {
    const url = `${SITE_URL}/resources`;
    try {
      await navigator.clipboard.writeText(`${title} — ${url}`);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  }, []);

  const handleStartLearning = useCallback((title: string) => {
    toast.success(`Opening: ${title}`);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  /* ─── Card animation variants ─── */
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.06,
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  /* ─── Render skeleton ─── */
  if (isLoading) {
    return <SkeletonState />;
  }

  return (
    <>
      <SEO title="Optometry Resources" description="Curated optometry resources including clinical guidelines, calculators, and educational content." keywords="optometry resources, clinical guidelines, eye care reference, educational materials" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-700 pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-float animation-delay-2000" />
          <div className="absolute -bottom-12 right-1/4 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl animate-float animation-delay-4000" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.06]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-sm font-semibold border border-white/20 mb-6">
              <GraduationCap className="w-4 h-4 text-yellow-300" />
              FocusLinks Academy
            </div>

            {/* Animated gradient heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight flex items-center justify-center gap-3">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" />
              <span className="bg-gradient-to-r from-yellow-200 via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                Learning Resources
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-teal-100 leading-relaxed max-w-2xl mx-auto">
              Curated educational content across {categoryFilters.length - 1}{' '}
              specialty topics for eye care professionals at every career stage
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══════════════════════════════════════════════════════════════
            SEARCH BAR
        ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="-mt-8 mb-8 relative z-20 max-w-2xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources by title, topic, or author..."
              className="w-full pl-12 pr-10 py-3.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-slate-700/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-300 dark:focus:border-teal-700 transition-all shadow-lg shadow-teal-900/10 dark:shadow-slate-900/30"
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            CATEGORY FILTER PILLS (horizontal scrollable)
        ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-10"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
              <Filter className="w-4 h-4 text-slate-400 dark:text-gray-500 ml-2 shrink-0" />
              {categoryFilters.map((cat) => {
                const cfg =
                  cat !== 'All' ? categoryConfig[cat as Category] : null;
                const Icon = cfg?.icon ?? Brain;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20 scale-105'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{cat}</span>
                    <span className="sm:hidden">
                      {cat === 'Clinical Guidelines'
                        ? 'Clinical'
                        : cat === 'Research Papers'
                          ? 'Research'
                          : cat === 'Video Tutorials'
                            ? 'Videos'
                            : cat === 'Case Studies'
                              ? 'Cases'
                              : cat === 'Quick References'
                                ? 'Quick Ref'
                                : cat === 'Contact Lens Science'
                                  ? 'CL Science'
                                  : cat === 'Pediatric Optometry'
                                    ? 'Pediatric'
                                    : cat === 'Ocular Pharmacology'
                                      ? 'Pharmacol.'
                                      : cat === 'Vision Therapy'
                                        ? 'Vis. Therapy'
                                        : cat === 'Practice Management'
                                          ? 'Practice'
                                          : 'All'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            FEATURED RESOURCE BANNER
        ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {featuredResource && activeCategory === 'All' && !searchQuery && (
            <motion.div
              key="featured"
              ref={featuredRef}
              initial={{ opacity: 0, y: 24 }}
              animate={
                featuredInView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 24 }
              }
              exit={{ opacity: 0, y: -10 }}
              transition={{
                delay: 0.15,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-12"
            >
              <div
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-700 p-8 md:p-12 cursor-pointer group"
                onClick={() => handleStartLearning(featuredResource.title)}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20">
                        <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                        Featured
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-semibold rounded-full">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Top Rated
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-teal-100 transition-colors">
                      {featuredResource.title}
                    </h2>
                    <p className="text-teal-100 text-base md:text-lg max-w-2xl mb-6 leading-relaxed line-clamp-3">
                      {featuredResource.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-teal-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-white">
                          {featuredResource.author}
                        </span>
                      </div>
                      <span className="text-teal-200/60">|</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {featuredResource.readTime}
                      </div>
                      <span className="text-teal-200/60">|</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                        <span className="font-medium text-white">
                          {featuredResource.rating}
                        </span>
                      </div>
                      <span className="text-teal-200/60">|</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-semibold">
                        <Stethoscope className="w-3 h-3" />
                        {featuredResource.category}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartLearning(featuredResource.title);
                    }}
                    className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold py-3 px-8 rounded-xl shadow-lg group-hover:bg-teal-50 dark:group-hover:bg-slate-700 transition-colors shrink-0 self-start md:self-center"
                    whileHover={{ x: 4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Start Learning
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════
            RESULTS COUNT
        ═══════════════════════════════════════════════════════════════ */}
        {(searchQuery || activeCategory !== 'All') && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-500 dark:text-gray-400 mb-6"
          >
            {filteredResources.length} resource
            {filteredResources.length !== 1 ? 's' : ''} found
            {activeCategory !== 'All' && ` in "${activeCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </motion.p>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            RESOURCE CARDS GRID
        ═══════════════════════════════════════════════════════════════ */}
        <div ref={gridRef} className="mb-16">
          {filteredResources.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No resources yet
              </p>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">
                Learning resources will appear here as they are added.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources
                .filter(
                  (r) => !(activeCategory === 'All' && !searchQuery && r.featured)
                )
                .map((resource, i) => {
                  const catCfg = categoryConfig[resource.category];
                  const diffCfg = difficultyConfig[resource.difficulty];
                  const CatIcon = catCfg.icon;

                  return (
                    <motion.div
                      key={resource.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate={gridInView ? 'visible' : 'hidden'}
                      className={`group relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] ${catCfg.hoverBorder} flex flex-col`}
                    >
                      {/* Top gradient accent — category-colored */}
                      <div
                        className={`h-1.5 bg-gradient-to-r ${catCfg.gradient} opacity-60 group-hover:opacity-100 transition-opacity`}
                      />

                      {/* Decorative corner glow */}
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${catCfg.bg} dark:from-slate-950/20 to-transparent rounded-bl-full -z-10 opacity-0 group-hover:opacity-70 group-hover:scale-125 transition-all duration-500`}
                      />

                      <div className="p-6 flex flex-col flex-1">
                        {/* Category badge + action buttons */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${catCfg.bg} ${catCfg.color} ${catCfg.border} ${catCfg.darkBg} ${catCfg.darkBorder} ${catCfg.darkText}`}
                          >
                            <CatIcon className="w-3 h-3" />
                            {resource.category}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => toggleBookmark(resource.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              aria-label={
                                bookmarks.has(resource.id)
                                  ? 'Remove bookmark'
                                  : 'Bookmark resource'
                              }
                            >
                              {bookmarks.has(resource.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              ) : (
                                <Bookmark className="w-4 h-4 text-slate-400 dark:text-gray-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors" />
                              )}
                            </button>
                            <button
                              onClick={() => handleShare(resource.title)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              aria-label="Share resource"
                            >
                              <Share2 className="w-4 h-4 text-slate-400 dark:text-gray-500 hover:text-teal-500 dark:hover:text-teal-400 transition-colors" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className={`text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:${catCfg.color} transition-colors line-clamp-2 leading-snug`}
                        >
                          {resource.title}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">
                          {resource.description}
                        </p>

                        {/* Meta row: read time, difficulty, rating stars */}
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {resource.readTime}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${diffCfg.bg} ${diffCfg.text} ${diffCfg.darkBg} ${diffCfg.darkText}`}
                          >
                            {resource.difficulty}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold ml-auto">
                            <RatingStars rating={resource.rating} />
                            <span className="ml-1">{resource.rating}</span>
                          </span>
                        </div>

                        {/* Footer: author + open button */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                          <div className="flex items-center min-w-0">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-gray-500 mr-3 shrink-0">
                              <Users className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {resource.author}
                            </span>
                          </div>
                          <button
                            onClick={() => handleStartLearning(resource.title)}
                            className={`w-8 h-8 rounded-full ${catCfg.bg} ${catCfg.color} flex items-center justify-center group-hover:bg-gradient-to-r group-hover:${catCfg.gradient} group-hover:text-white transition-colors shrink-0`}
                            aria-label="Open resource"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            QUICK STATS SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 24 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              By the Numbers
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm">
              Our growing collection of educational resources
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={BookOpen}
              label="Total Resources"
              target={resources.length}
              suffix="+"
              color="bg-teal-500"
              inView={statsInView}
              delay={0.1}
            />
            <StatCard
              icon={Sparkles}
              label="Specialty Topics"
              target={categoryFilters.length - 1}
              suffix=""
              color="bg-cyan-500"
              inView={statsInView}
              delay={0.2}
            />
            <StatCard
              icon={Users}
              label="Contributors"
              target={50}
              suffix="+"
              color="bg-emerald-500"
              inView={statsInView}
              delay={0.3}
            />
            <StatCard
              icon={Star}
              label="Average Rating"
              target={4.8}
              suffix=""
              color="bg-amber-500"
              inView={statsInView}
              delay={0.4}
              isDecimal
            />
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            CONTRIBUTE CTA SECTION
        ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 30 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-700 p-8 md:p-12 text-center">
            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={ctaInView ? { scale: 1 } : {}}
                transition={{
                  delay: 0.3,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20"
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Have a resource to share?
              </h2>
              <p className="text-teal-100 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Help grow our community&apos;s knowledge base. Submit your clinical
                guidelines, research papers, tutorials, case studies, or practice
                management insights for peer review.
              </p>

              <motion.button
                onClick={() => navigate('/contactus')}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold py-3.5 px-8 rounded-xl shadow-lg hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Submit a Resource
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
