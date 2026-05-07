'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Users,
  Rss,
  BookOpen,
  FlaskConical,
  CalendarDays,
  Info,
  CreditCard,
  LayoutDashboard,
  Search,
  Moon,
  Sun,
  LogIn,
  UserPlus,
  ArrowRight,
  Settings,
  MessagesSquare,
  Bookmark,
  Bell,
  Compass,
  GraduationCap,
  Trophy,
  Library,
  ShoppingBag,
  UserCircle,
  BarChart3,
  Briefcase,
  Map as MapIcon,
  Accessibility,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from '../../context/NavigationContext';
import { useTheme } from 'next-themes';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const commands: CommandItem[] = useMemo(() => [
    { id: 'nav-home', label: 'Home', icon: <Home className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/') },
    { id: 'nav-directory', label: 'Directory', icon: <Users className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/directory') },
    { id: 'nav-community', label: 'Community', icon: <Users className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/community') },
    { id: 'nav-feed', label: 'Feed', icon: <Rss className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/feed') },
    { id: 'nav-explore', label: 'Explore', icon: <Compass className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/explore') },
    { id: 'nav-blog', label: 'Blog', icon: <BookOpen className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/blog') },
    { id: 'nav-labs', label: 'Labs', icon: <FlaskConical className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/labs') },
    { id: 'nav-events', label: 'Events', icon: <CalendarDays className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/events') },
    { id: 'nav-about', label: 'About', icon: <Info className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/about') },
    { id: 'nav-membership', label: 'Membership', icon: <CreditCard className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/membership') },
    { id: 'nav-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/dashboard') },
    { id: 'nav-settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/settings') },
    { id: 'nav-messages', label: 'Messages', icon: <MessagesSquare className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/messages') },
    { id: 'nav-bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/bookmarks') },
    { id: 'nav-notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/notifications') },

    { id: 'nav-leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/leaderboard') },
    { id: 'nav-resources', label: 'Resources', icon: <Library className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/resources') },
    { id: 'nav-marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/marketplace') },
    { id: 'nav-jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/jobs') },
    { id: 'nav-user-profile', label: 'User Profile', icon: <UserCircle className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/user-profile') },
    { id: 'nav-sitemap', label: 'Sitemap', icon: <MapIcon className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/sitemap') },
    { id: 'nav-accessibility', label: 'Accessibility', icon: <Accessibility className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/accessibility') },
    { id: 'nav-my-profile', label: 'My Profile', icon: <UserCircle className="w-4 h-4" />, category: 'Navigation', action: () => navigate('/my-profile') },
    { id: 'act-search', label: 'Search', icon: <Search className="w-4 h-4" />, category: 'Actions', action: () => navigate('/search') },
    { id: 'act-stats', label: 'Community Stats', icon: <BarChart3 className="w-4 h-4" />, category: 'Actions', action: () => navigate('/stats') },
    { id: 'act-theme', label: 'Toggle Theme', icon: resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, category: 'Actions', action: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark') },
    { id: 'act-login', label: 'Go to Login', icon: <LogIn className="w-4 h-4" />, category: 'Actions', action: () => navigate('/login') },
    { id: 'act-join', label: 'Go to Sign Up', icon: <UserPlus className="w-4 h-4" />, category: 'Actions', action: () => navigate('/membership') },
    { id: 'action-restart-tour', label: 'Restart Onboarding Tour', icon: <GraduationCap className="w-4 h-4" />, category: 'Actions', action: () => { localStorage.removeItem('fl_tour_completed'); window.dispatchEvent(new Event('restart-tour')); toast('Tour restarted!'); } },
  ], [navigate, resolvedTheme, setTheme]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) => cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selection when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // Global keyboard listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      // Use setTimeout to avoid race condition with AnimatePresence
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    cmd.action();
    setOpen(false);
    setQuery('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
    }
  }, [filtered, selectedIndex, executeCommand]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Group filtered commands by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  let flatIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => { setOpen(false); setQuery(''); }}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 top-[15vh] z-[101] mx-auto w-full max-w-lg px-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-900/80 border border-gray-200 dark:border-slate-700 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                  ESC
                </kbd>
              </div>

              {/* Command List */}
              <div ref={listRef} className="max-h-72 overflow-y-auto custom-scrollbar py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No results found</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {category}
                      </div>
                      {items.map((cmd) => {
                        const currentIndex = flatIndex++;
                        const isSelected = currentIndex === selectedIndex;
                        return (
                          <button
                            key={cmd.id}
                            data-selected={isSelected}
                            onClick={() => executeCommand(cmd)}
                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <span className={`shrink-0 ${isSelected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                              {cmd.icon}
                            </span>
                            <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                            {isSelected && (
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                    <ArrowRight className="w-2.5 h-2.5 inline" />
                    <span className="ml-0.5"><ArrowRight className="w-2.5 h-2.5 inline -ml-0.5" /></span>
                  </kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                    ↵
                  </kbd>
                  Select
                </span>
                <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-gray-100 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                    esc
                  </kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
