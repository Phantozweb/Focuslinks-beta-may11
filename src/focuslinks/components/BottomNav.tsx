'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { Link, useLocation } from '../../context/NavigationContext';
import { Home, Rss, Search, MessageCircle, User, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { name: 'Home', path: '/home', icon: Home },
  { name: 'Feed', path: '/feed', icon: Rss },
  { name: 'Map', path: '/opto-map', icon: MapPin },
  { name: 'Messages', path: '/messages', icon: MessageCircle },
  { name: 'Profile', path: '/dashboard', icon: User },
];

function useIsLoggedIn() {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('fl_user');
  };
  const getServerSnapshot = () => false;
  const subscribe = (callback: () => void) => {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  };
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function BottomNav() {
  const isLoggedIn = useIsLoggedIn();
  const location = useLocation();

  if (!isLoggedIn) return null;

  const currentPath = location.pathname || '/';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] md:hidden">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-200/80 dark:border-slate-700/80">
        <nav
          className="flex items-center justify-around px-2 pt-1.5 pb-1"
          aria-label="Bottom navigation"
        >
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/home' && currentPath.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] group"
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}
