'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bookmark, Search, Trash2, FileText, MessageSquare, CalendarDays,
  BookOpen, ChevronDown, X, Newspaper, Calendar, Rss, Link2,
  Package, Archive, Sparkles, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { useNavigate, Link } from '@/context/NavigationContext';

/* ─── Types ──────────────────────────────────────────────── */

type BookmarkCategory = 'article' | 'post' | 'resource' | 'event';
type FilterTab = 'all' | BookmarkCategory;
type SortOption = 'recent' | 'oldest' | 'source';

interface BookmarkItem {
  id: string;
  title: string;
  excerpt: string;
  category: BookmarkCategory;
  source: 'Blog' | 'Feed' | 'Events' | 'Resources';
  savedDate: string;
  icon?: string;
}

/* ─── Mock Data removed — bookmarks stored in localStorage ── */

/* ─── Helpers ────────────────────────────────────────────── */

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function categoryConfig(cat: BookmarkCategory) {
  switch (cat) {
    case 'article':
      return {
        icon: <FileText className="w-3.5 h-3.5" />,
        label: 'Article',
        badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
        hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700/60',
        gradientBorder: 'from-blue-500/20 via-purple-500/20 to-cyan-500/20',
      };
    case 'post':
      return {
        icon: <MessageSquare className="w-3.5 h-3.5" />,
        label: 'Post',
        badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
        hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-700/60',
        gradientBorder: 'from-purple-500/20 via-pink-500/20 to-rose-500/20',
      };
    case 'resource':
      return {
        icon: <Package className="w-3.5 h-3.5" />,
        label: 'Resource',
        badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
        hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700/60',
        gradientBorder: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
      };
    case 'event':
      return {
        icon: <CalendarDays className="w-3.5 h-3.5" />,
        label: 'Event',
        badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
        hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700/60',
        gradientBorder: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
      };
  }
}

function sourceIcon(source: string) {
  switch (source) {
    case 'Blog': return <Newspaper className="w-3.5 h-3.5" />;
    case 'Feed': return <Rss className="w-3.5 h-3.5" />;
    case 'Events': return <Calendar className="w-3.5 h-3.5" />;
    case 'Resources': return <Link2 className="w-3.5 h-3.5" />;
    default: return <BookOpen className="w-3.5 h-3.5" />;
  }
}

/* ─── Empty State Icons ──────────────────────────────────── */

function CategoryEmptyState({ category }: { category: FilterTab }) {
  const configs: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
    all: {
      icon: <Bookmark className="w-10 h-10" />,
      title: 'Your library is empty',
      desc: 'Start saving articles, posts, resources, and events to build your personal collection.',
    },
    article: {
      icon: <FileText className="w-10 h-10" />,
      title: 'No articles saved',
      desc: 'Save blog articles you find interesting to read them later.',
    },
    post: {
      icon: <MessageSquare className="w-10 h-10" />,
      title: 'No posts saved',
      desc: 'Bookmark community posts to keep track of discussions.',
    },
    resource: {
      icon: <Package className="w-10 h-10" />,
      title: 'No resources saved',
      desc: 'Save tools, guides, and downloads for quick access.',
    },
    event: {
      icon: <CalendarDays className="w-10 h-10" />,
      title: 'No events saved',
      desc: 'Bookmark upcoming events so you don\'t miss them.',
    },
  };
  const cfg = configs[category] || configs.all;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <div className="relative w-24 h-24 mx-auto mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700"
        />
        <div className="absolute inset-3 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600">
          {cfg.icon}
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{cfg.title}</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{cfg.desc}</p>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export default function Bookmarks() {
  const navigate = useNavigate();
  const [bookmarkedItems, setBookmarkedItems] = useState<BookmarkItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  /* Close sort dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarkedItems(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from library');
  }, []);

  const clearAll = useCallback(() => {
    setBookmarkedItems([]);
    setShowClearConfirm(false);
    toast.success('All items cleared from your library');
  }, []);

  const stats = useMemo(() => {
    const articles = bookmarkedItems.filter(i => i.category === 'article').length;
    const posts = bookmarkedItems.filter(i => i.category === 'post').length;
    const resources = bookmarkedItems.filter(i => i.category === 'resource').length;
    const events = bookmarkedItems.filter(i => i.category === 'event').length;
    return { articles, posts, resources, events, total: bookmarkedItems.length };
  }, [bookmarkedItems]);

  const filteredAndSorted = useMemo(() => {
    let items = [...bookmarkedItems];

    /* Filter by category tab */
    if (activeFilter !== 'all') {
      items = items.filter(i => i.category === activeFilter);
    }

    /* Filter by search */
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) || i.excerpt.toLowerCase().includes(q)
      );
    }

    /* Sort */
    if (sortOption === 'recent') {
      items.sort((a, b) => new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime());
    } else if (sortOption === 'oldest') {
      items.sort((a, b) => new Date(a.savedDate).getTime() - new Date(b.savedDate).getTime());
    } else if (sortOption === 'source') {
      const sourceOrder: Record<string, number> = { Blog: 0, Feed: 1, Resources: 2, Events: 3 };
      items.sort((a, b) => (sourceOrder[a.source] ?? 4) - (sourceOrder[b.source] ?? 4));
    }

    return items;
  }, [bookmarkedItems, activeFilter, searchQuery, sortOption]);

  const tabs: { key: FilterTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: 'All', icon: <Bookmark className="w-4 h-4" />, count: stats.total },
    { key: 'article', label: 'Articles', icon: <FileText className="w-4 h-4" />, count: stats.articles },
    { key: 'post', label: 'Posts', icon: <MessageSquare className="w-4 h-4" />, count: stats.posts },
    { key: 'resource', label: 'Resources', icon: <Package className="w-4 h-4" />, count: stats.resources },
    { key: 'event', label: 'Events', icon: <CalendarDays className="w-4 h-4" />, count: stats.events },
  ];

  const sortLabels: Record<SortOption, string> = {
    recent: 'Recently Saved',
    oldest: 'Oldest First',
    source: 'By Source',
  };

  return (
    <>
    <SEO title="Bookmarks" description="Your saved articles, posts, and resources on FocusLinks." keywords="bookmarks, saved items, reading list" />
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ─── Hero Section ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Bookmark className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Your Library
              </span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-gray-400 text-sm sm:text-base"
          >
            {stats.total} saved {stats.total === 1 ? 'item' : 'items'} across your FocusLinks journey
          </motion.p>
        </motion.div>

        {/* ─── Stats Bar ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: 'Total Saved', value: stats.total, icon: <Archive className="w-4 h-4" />, gradient: 'from-rose-500 to-pink-500' },
            { label: 'Articles', value: stats.articles, icon: <FileText className="w-4 h-4" />, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Posts', value: stats.posts, icon: <MessageSquare className="w-4 h-4" />, gradient: 'from-purple-500 to-violet-500' },
            { label: 'Resources', value: stats.resources, icon: <Package className="w-4 h-4" />, gradient: 'from-amber-500 to-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
              className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 dark:from-gray-900/80 to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Search & Actions ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6"
        >
          {/* Glass-morphism Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library..."
              className="w-full pl-11 pr-10 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                {sortLabels[sortOption]}
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-20 min-w-[180px] overflow-hidden"
                  >
                    {(Object.keys(sortLabels) as SortOption[]).map(option => (
                      <button
                        key={option}
                        onClick={() => { setSortOption(option); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          sortOption === option
                            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {sortLabels[option]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear All */}
            <AnimatePresence>
              {bookmarkedItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-2 px-4 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800/50 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      <button
                        onClick={clearAll}
                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-medium transition-colors shadow-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── Category Tabs ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-1 overflow-x-auto pb-1 mb-8 no-scrollbar"
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeFilter === tab.key
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === tab.key
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
              {activeFilter === tab.key && (
                <motion.div
                  layoutId="activeBookmarkTab"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* ─── Saved Items Grid / Empty ─────────────────── */}
        {filteredAndSorted.length === 0 ? (
          <CategoryEmptyState category={activeFilter} />
        ) : (
          <div className={`grid gap-4 ${
            activeFilter === 'all'
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1'
          }`}>
            <AnimatePresence mode="popLayout">
              {filteredAndSorted.map((item, idx) => {
                const cat = categoryConfig(item.category);
                const isWide = item.category === 'article' && activeFilter === 'all';

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className={`group relative rounded-2xl overflow-hidden ${
                      isWide ? 'md:col-span-2' : ''
                    }`}
                  >
                    {/* Gradient border on hover */}
                    <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${cat.gradientBorder} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className={`relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm group-hover:shadow-lg group-hover:border-gray-300 dark:group-hover:border-gray-700 transition-all duration-300 overflow-hidden`}>
                      <div className="p-5">
                        {/* Top: badges & actions */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Category badge */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cat.badge}`}>
                              {cat.icon}
                              {cat.label}
                            </span>
                            {/* Source badge */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                              {sourceIcon(item.source)}
                              {item.source}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeBookmark(item.id)}
                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Remove bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Excerpt */}
                        <p className={`text-sm text-gray-500 dark:text-gray-400 leading-relaxed ${
                          isWide ? 'line-clamp-2' : 'line-clamp-2'
                        }`}>
                          {item.excerpt}
                        </p>

                        {/* Footer: date & link */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                            <Bookmark className="w-3 h-3" />
                            Saved {formatRelativeDate(item.savedDate)}
                          </span>
                          <Link
                            to={item.category === 'event' ? '/events' : item.category === 'article' ? '/blog' : '/feed'}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                          >
                            Open
                            <Sparkles className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Search No Results ────────────────────────── */}
        {searchQuery && filteredAndSorted.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No bookmarks match &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-semibold"
            >
              Clear search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  </>
  );
}
