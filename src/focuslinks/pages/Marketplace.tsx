'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Star,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  GraduationCap,
  Shield,
  Heart,
  Share2,
  ChevronRight,
  TrendingUp,
  Users,
  Package,
  Briefcase,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from '@/context/NavigationContext';
import { toast } from 'sonner';
import { SITE_URL } from '../../lib/constants';
import { motion, useInView } from 'motion/react';
import SEO from '../components/SEO';

/* ─── Types ─── */
type Category = 'All' | 'Equipment' | 'Jobs' | 'Services' | 'Practices for Sale';
type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular';

interface Listing {
  id: number;
  title: string;
  description: string;
  category: 'Equipment' | 'Jobs' | 'Services';
  price?: string;
  salary?: string;
  condition?: string;
  company?: string;
  location?: string;
  postedDate?: string;
  rating: number;
  provider?: string;
  sellerRating?: string;
  featured?: boolean;
}

/* ─── Listings Data — empty until real data is loaded ─── */
const listings: Listing[] = [];

/* ─── Category Config ─── */
const categoryColors: Record<string, {
  bg: string; text: string; border: string; darkBg: string; darkBorder: string; darkText: string; gradient: string;
}> = {
  Equipment: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    darkBg: 'dark:bg-orange-900/40',
    darkBorder: 'dark:border-orange-800/50',
    darkText: 'dark:text-orange-300',
    gradient: 'from-orange-500 to-amber-500',
  },
  Jobs: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    darkBg: 'dark:bg-emerald-900/40',
    darkBorder: 'dark:border-emerald-800/50',
    darkText: 'dark:text-emerald-300',
    gradient: 'from-emerald-500 to-teal-500',
  },
  Services: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    darkBg: 'dark:bg-violet-900/40',
    darkBorder: 'dark:border-violet-800/50',
    darkText: 'dark:text-violet-300',
    gradient: 'from-violet-500 to-purple-500',
  },
};

const categoryTabs: Category[] = ['All', 'Equipment', 'Jobs', 'Services', 'Practices for Sale'];

/* ─── Category Icons ─── */
const categoryIcons: Record<string, typeof Package> = {
  Equipment: Package,
  Jobs: Briefcase,
  Services: GraduationCap,
  'Practices for Sale': Building2,
};

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 1400, shouldStart = false) {
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

/* ─── Stat Card ─── */
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
  icon: typeof Package;
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

  const displayValue = isDecimal ? (displayCount / 10).toFixed(1) : displayCount;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={effectiveInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 text-center shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
        {displayValue}{suffix}
      </p>
      <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
    </motion.div>
  );
}

/* ─── Rating Stars ─── */
function RatingStars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : star - 0.5 <= rating
                ? 'fill-amber-200 text-amber-400'
                : 'text-slate-200 dark:text-slate-700'
          }`}
        />
      ))}
      <span className={`ml-1 font-bold text-amber-600 dark:text-amber-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {rating}
      </span>
    </div>
  );
}

/* ─── Main Component ─── */
export default function Marketplace() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  /* Refs for in-view animations */
  const featuredRef = useRef(null);
  const featuredInView = useInView(featuredRef, { once: true, margin: '-60px' });
  const gridRef = useRef(null);
  const gridInView = useInView(gridRef, { once: true, margin: '-40px' });
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' });
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-40px' });
  const trustRef = useRef(null);
  const trustInView = useInView(trustRef, { once: true, margin: '-40px' });

  /* Skeleton loading */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  /* ─── Filtering & Sorting ─── */
  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (activeCategory !== 'All') {
      result = result.filter((l) => l.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.provider && l.provider.toLowerCase().includes(q)) ||
          (l.location && l.location.toLowerCase().includes(q))
      );
    }

    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => {
          const pa = a.price ? parseFloat(a.price.replace(/[^0-9.]/g, '')) : 0;
          const pb = b.price ? parseFloat(b.price.replace(/[^0-9.]/g, '')) : 0;
          return pa - pb;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const pa = a.price ? parseFloat(a.price.replace(/[^0-9.]/g, '')) : 0;
          const pb = b.price ? parseFloat(b.price.replace(/[^0-9.]/g, '')) : 0;
          return pb - pa;
        });
        break;
      case 'popular':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        break;
    }

    return result;
  }, [searchQuery, activeCategory, sortOption]);

  const featuredListings = useMemo(
    () => listings.filter((l) => l.featured),
    []
  );

  /* ─── Card animation variants ─── */
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.07,
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  /* ─── Handlers ─── */
  const handleBookmark = useCallback((id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info('Removed from saved items');
      } else {
        next.add(id);
        toast.success('Listing saved!');
      }
      return next;
    });
  }, []);

  const handleShare = useCallback(async (title: string) => {
    const url = `${SITE_URL}/marketplace`;
    try {
      await navigator.clipboard.writeText(`${title} — ${url}`);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  }, []);

  const handleViewDetails = useCallback((title: string) => {
    toast.info(`Viewing details for: ${title}`);
  }, []);

  const handleCreateListing = useCallback(() => {
    toast.info('Coming soon!', {
      description: 'The listing creation feature is currently in development.',
    });
  }, []);

  /* ─── Render ─── */
  return (
    <>
      <SEO title="Optometry Marketplace" description="Browse optometry products, equipment, and services." keywords="optometry marketplace, eye care products, optical equipment" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl animate-float animation-delay-2000" />
          <div className="absolute -bottom-12 right-1/4 w-64 h-64 bg-yellow-400/15 rounded-full blur-3xl animate-float animation-delay-4000" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-orange-100 text-sm font-semibold border border-white/20 mb-6">
              <ShoppingBag className="w-4 h-4 text-yellow-200" />
              Buy, Sell &amp; Connect
            </div>

            {/* Animated gradient heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight flex items-center justify-center gap-3 flex-wrap">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-white/80" />
              <span className="bg-gradient-to-r from-yellow-200 via-orange-200 to-amber-200 bg-clip-text text-transparent">
                Optometry Marketplace
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-orange-100 leading-relaxed max-w-2xl mx-auto">
              Find equipment, services, and career opportunities from the global optometry community
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══════════════════════════════════════════════════════════════════
            SEARCH & SORT BAR
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="-mt-8 mb-8 relative z-20"
        >
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-slate-700/50 shadow-lg shadow-orange-900/10 dark:shadow-slate-900/30 p-4 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings by name, category, or location..."
                className="w-full pl-12 pr-10 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-600/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300 dark:focus:border-orange-700 transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm font-medium leading-none">&times;</span>
                </button>
              )}
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="appearance-none w-full sm:w-auto pl-4 pr-10 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-600/50 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-300 dark:focus:border-orange-700 transition-all cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low-High</option>
                <option value="price-high">Price: High-Low</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            CATEGORY FILTER TABS
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-10"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-2 sm:p-3">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <Filter className="w-4 h-4 text-slate-400 dark:text-gray-500 ml-2 shrink-0" />
              {categoryTabs.map((cat) => {
                const Icon = categoryIcons[cat] ?? ShoppingBag;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-slate-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat}
                    {isActive && (
                      <motion.div
                        layoutId="category-underline"
                        className="absolute inset-0 bg-orange-50 dark:bg-orange-900/30 rounded-xl -z-10 border border-orange-200 dark:border-orange-800/50"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            FEATURED LISTINGS BANNER
        ═══════════════════════════════════════════════════════════════════ */}
        {activeCategory === 'All' && !searchQuery && (
          <motion.div
            ref={featuredRef}
            initial={{ opacity: 0, y: 24 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Featured Listings</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {featuredListings.map((listing) => {
                const colors = categoryColors[listing.category];
                return (
                  <motion.div
                    key={listing.id}
                    whileHover={{ y: -4 }}
                    className="min-w-[280px] sm:min-w-[320px] max-w-[360px] flex-shrink-0 relative rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => handleViewDetails(listing.title)}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-90`} />
                    {/* Overlay pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.08]" />
                    {/* Decorative circle */}
                    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                    <div className="relative z-10 p-6 flex flex-col h-full min-h-[200px]">
                      {/* Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20">
                          <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                          Featured
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full border border-white/20`}>
                          {listing.category}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-100 transition-colors line-clamp-2">
                        {listing.title}
                      </h3>

                      <p className="text-white/80 text-sm mb-4 line-clamp-2 flex-grow">
                        {listing.description}
                      </p>

                      {/* Price / Salary */}
                      {(listing.price || listing.salary) && (
                        <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                          <DollarSign className="w-4 h-4" />
                          {listing.price || listing.salary}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            RESULTS COUNT
        ═══════════════════════════════════════════════════════════════════ */}
        {(searchQuery || activeCategory !== 'All') && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-500 dark:text-gray-400 mb-6"
          >
            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
            {activeCategory !== 'All' && ` in "${activeCategory}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </motion.p>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            LISTINGS GRID
        ═══════════════════════════════════════════════════════════════════ */}
        <div ref={gridRef} className="mb-16">
          {filteredListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No listings yet</p>
              <p className="text-slate-500 dark:text-gray-400 text-sm mb-4">
                Marketplace listings will appear here as they are posted.
              </p>
              <motion.button
                onClick={handleCreateListing}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Create Listing
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing, i) => {
                const colors = categoryColors[listing.category];
                const CatIcon = categoryIcons[listing.category] ?? Package;

                return (
                  <motion.div
                    key={listing.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate={gridInView ? 'visible' : 'hidden'}
                    className="group relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                  >
                    {/* Gradient border glow on hover */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm scale-[1.02]`} />

                    {/* Top gradient accent */}
                    <div className={`h-1.5 bg-gradient-to-r ${colors.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                    {/* Image placeholder with gradient */}
                    <div className={`relative h-40 bg-gradient-to-br ${colors.gradient} opacity-10 dark:opacity-20 flex items-center justify-center`}>
                      <CatIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                      {/* Condition badge for equipment */}
                      {listing.condition && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-bold rounded-lg text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                          {listing.condition}
                        </span>
                      )}
                      {/* Category badge */}
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border} ${colors.darkBg} ${colors.darkBorder} ${colors.darkText}`}>
                        {listing.category}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 leading-snug">
                        {listing.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 dark:text-gray-400 text-sm mb-3 flex-grow line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>

                      {/* Price/Salary row */}
                      {(listing.price || listing.salary) && (
                        <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold text-sm mb-2">
                          <DollarSign className="w-4 h-4" />
                          {listing.price || listing.salary}
                        </div>
                      )}

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-gray-400 mb-3">
                        {listing.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {listing.company}
                          </span>
                        )}
                        {listing.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {listing.location}
                          </span>
                        )}
                        {listing.postedDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {listing.postedDate}
                          </span>
                        )}
                        {listing.provider && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            {listing.provider}
                          </span>
                        )}
                        {listing.sellerRating && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            Seller {listing.sellerRating}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <RatingStars rating={listing.rating} />

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleBookmark(listing.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Save listing"
                          >
                            <Heart className={`w-4 h-4 transition-colors ${
                              bookmarks.has(listing.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-slate-400 dark:text-gray-500 hover:text-red-500'
                            }`} />
                          </button>
                          <button
                            onClick={() => handleShare(listing.title)}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Share listing"
                          >
                            <Share2 className="w-4 h-4 text-slate-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors" />
                          </button>
                        </div>
                        <motion.button
                          onClick={() => handleViewDetails(listing.title)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-sm rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors border border-orange-200 dark:border-orange-800/50"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            STATS SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 24 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Marketplace at a Glance
            </h2>
            <p className="text-slate-500 dark:text-gray-400 text-sm">
              Our growing optometry marketplace ecosystem
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={Package}
              label="Listings"
              target={150}
              suffix="+"
              color="bg-orange-500"
              inView={statsInView}
              delay={0.1}
            />
            <StatCard
              icon={Users}
              label="Sellers"
              target={50}
              suffix="+"
              color="bg-amber-500"
              inView={statsInView}
              delay={0.2}
            />
            <StatCard
              icon={MapPin}
              label="Countries"
              target={12}
              suffix=""
              color="bg-yellow-500"
              inView={statsInView}
              delay={0.3}
            />
            <StatCard
              icon={Star}
              label="Avg Rating"
              target={4.9}
              suffix=""
              color="bg-emerald-500"
              inView={statsInView}
              delay={0.4}
              isDecimal
            />
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            POST A LISTING CTA
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 30 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-8 md:p-12 text-center">
            {/* Decorative */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={ctaInView ? { scale: 1 } : {}}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20"
              >
                <ShoppingBag className="w-8 h-8 text-yellow-200" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Have something to sell or a job to post?
              </h2>
              <p className="text-orange-100 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Reach thousands of eye care professionals worldwide. List your equipment, services, or job openings on the FocusLinks Marketplace.
              </p>

              <motion.button
                onClick={handleCreateListing}
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-orange-700 dark:text-orange-400 font-bold py-3.5 px-8 rounded-xl shadow-lg hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Create Listing
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            TRUST & SAFETY NOTE
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          ref={trustRef}
          initial={{ opacity: 0, y: 20 }}
          animate={trustInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Trust &amp; Safety
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  Your safety is our priority. All sellers on the FocusLinks Marketplace go through a verification process to ensure authenticity and trustworthiness.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">Verified Sellers</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">Secure Transactions</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Star className="w-5 h-5 text-amber-500 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">Community Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
