'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from '../../context/NavigationContext';

// Human-readable names for known routes
const ROUTE_LABELS: Record<string, string> = {
  'about': 'About',
  'membership': 'Membership',
  'membership-application': 'Membership Application',
  'directory': 'Directory',
  'community': 'Community',
  'feed': 'Community Feed',
  'blog': 'Blog',
  'labs': 'Clinical Tools',
  'events': 'Events',
  'login': 'Log In',
  'register': 'Register',
  'dashboard': 'Dashboard',
  'contactus': 'Contact Us',
  'help-center': 'Help Center',
  'privacy': 'Privacy Policy',
  'terms': 'Terms of Service',
  'supporters': 'Supporters',
  'create-profile': 'Create Profile',
  'team-application': 'Join Our Team',
  'academy': 'Academy',
  'beyond-the-phoropter': 'Beyond the Phoropter',
  'verify': 'Verify',
  'booked': 'Booked',
  'debug': 'Debug',
  'articles': 'Articles',
  'settings': 'Settings',
  'messages': 'Messages',
  'explore': 'Explore',
  'bookmarks': 'Bookmarks',
  'notifications': 'Notifications',
  'leaderboard': 'Leaderboard',
  'resources': 'Learning Resources',
  'marketplace': 'Marketplace',
  'my-profile': 'My Profile',
  'search': 'Search',
  'stats': 'Community Stats',
  'od-cam': 'OD Cam',
  'optoscholar': 'OptoScholar',
  'ipd-measure': 'IPD Measure',
  'rapd-simulator': 'RAPD Simulator',
  'eye-q-arena': 'Eye Q Arena',
  'webinar': 'Webinar',
  'profile': 'Profile',
  'event': 'Event',
};

function formatSegment(segment: string): string {
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment];
  // Convert kebab-case or slug to Title Case
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const path = pathname || '/';

  const crumbs = useMemo(() => {
    if (path === '/') return [];

    const segments = path.split('/').filter(Boolean);
    const result: { label: string; path: string; isLast: boolean }[] = [];

    segments.forEach((segment, index) => {
      const builtPath = '/' + segments.slice(0, index + 1).join('/');
      result.push({
        label: formatSegment(segment),
        path: builtPath,
        isLast: index === segments.length - 1,
      });
    });

    return result;
  }, [path]);

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      <motion.ol
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center gap-1 text-sm overflow-x-auto hide-scrollbar"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {/* Home crumb */}
        <li
          className="flex items-center shrink-0"
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
            aria-label="Home"
            itemProp="item"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <meta itemProp="name" content="Home" />
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {crumbs.map((crumb, index) => (
          <li
            key={crumb.path}
            className="flex items-center shrink-0"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <ChevronRight
              className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-1"
              aria-hidden="true"
            />
            {crumb.isLast ? (
              <span
                className="px-2 py-1 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-slate-800 truncate max-w-[200px] sm:max-w-[300px]"
                aria-current="page"
                itemProp="name"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="px-2 py-1 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 truncate max-w-[160px] sm:max-w-[250px]"
                itemProp="item"
              >
                <span itemProp="name">{crumb.label}</span>
              </Link>
            )}
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}
      </motion.ol>
    </nav>
  );
}
