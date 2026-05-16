'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { Link, useNavigate } from '@/context/NavigationContext';

// ── Auth state via useSyncExternalStore ──
const authListeners = new Set<() => void>();

function emitAuthChange() {
  authListeners.forEach((l) => l());
}

// Subscribe to localStorage changes (works cross-tab via StorageEvent,
// same-tab via the custom Event('storage') that Login/Register dispatch,
// and also our own fl_auth_change event for any future use).
function subscribeAuth(callback: () => void): () => void {
  authListeners.add(callback);
  const onStorage = () => {
    // Re-check snapshot — if it changed, notify
    callback();
  };
  const onCustom = () => callback();
  window.addEventListener('storage', onStorage);
  window.addEventListener('fl_auth_change', onCustom);
  return () => {
    authListeners.delete(callback);
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('fl_auth_change', onCustom);
  };
}

function getAuthSnapshot(): boolean {
  try {
    return !!localStorage.getItem('fl_user');
  } catch {
    return false;
  }
}

function getServerAuthSnapshot(): boolean {
  return false;
}

export function useIsAuthenticated(): boolean {
  return React.useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
}

// ── Page name mapping ──
const PAGE_NAMES: Record<string, string> = {
  '/home': 'Home Feed',
  '/directory': 'Professional Directory',
  '/feed': 'Feed',
  '/blog': 'Blog',
  '/labs': 'Labs',
  '/events': 'Events',
  '/academy': 'Academy',
  '/community': 'Community',
  '/explore': 'Explore',
  '/jobs': 'Jobs',
  '/settings': 'Settings',
  '/messages': 'Messages',
  '/bookmarks': 'Bookmarks',
  '/notifications': 'Notifications',
  '/leaderboard': 'Leaderboard',
  '/resources': 'Resources',
  '/marketplace': 'Marketplace',
  '/my-profile': 'My Profile',
  '/search': 'Search',
  '/stats': 'Statistics',
  '/opto-map': 'Opto Map',
  '/connections': 'Connections',
  '/professionals': 'Professionals',
  '/supporters': 'Supporters',
  '/booked': 'Booked Sessions',
  '/debug': 'Debug',
  '/admin': 'Admin',
  '/sitemap': 'Sitemap',
  '/accessibility': 'Accessibility',
  '/user-profile': 'User Profile',
  '/create-article': 'Create Article',
  '/create-profile': 'Create Profile',
  '/team-application': 'Team Application',
  '/dashboard': 'Dashboard',
  '/articles': 'Articles',
};

function getPageName(pathname: string): string {
  // Exact match first
  if (PAGE_NAMES[pathname]) return PAGE_NAMES[pathname];

  // Dynamic route patterns
  if (pathname.startsWith('/webinar')) return 'Webinar';
  if (pathname.startsWith('/labs/')) return 'Lab Tool';
  if (pathname.startsWith('/academy/')) return 'Academy Course';
  if (pathname.startsWith('/profile/')) return 'Profile';
  if (pathname.startsWith('/user/')) return 'User Profile';
  if (pathname.startsWith('/blog/')) return 'Blog Post';
  if (pathname.startsWith('/event/')) return 'Event';

  // Fallback: capitalize the first segment
  const segment = pathname.split('/').filter(Boolean)[0] || 'Page';
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

// ── Public routes (no auth needed) ──
const PUBLIC_ROUTES = new Set([
  '/',
  '/login',
  '/register',
  '/about',
  '/privacy',
  '/terms',
  '/membership',
  '/membership-application',
  '/contactus',
  '/help-center',
]);

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return false;
}

export function isRouteProtected(pathname: string): boolean {
  return !isPublicRoute(pathname);
}

// ── AuthGuardOverlay Component ──
interface AuthGuardOverlayProps {
  pageName: string;
}

export default function AuthGuardOverlay({ pageName }: AuthGuardOverlayProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[90] flex items-center justify-center backdrop-blur-xl bg-black/40"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-[calc(100%-2rem)] max-w-md mx-auto"
        >
          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
            {/* Gradient header */}
            <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/30 dark:to-slate-900">
              {/* Icon */}
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-600/25">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Sign in to continue
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                Join FocusLinks to access{' '}
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  {pageName}
                </span>{' '}
                and connect with optometry professionals worldwide.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-2 space-y-3">
              {/* Sign In */}
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl text-center shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>

              {/* Create Account */}
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-6 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-xl text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-5 h-5" />
                Become a Member
              </Link>

              {/* Back to Home */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-sm text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Home
              </button>
            </div>

            {/* Trust signal */}
            <div className="px-6 pb-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-gray-600">
              <Shield className="w-3 h-3" />
              <span>Free to join · Trusted by 600+ optometrists</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export { getPageName };
