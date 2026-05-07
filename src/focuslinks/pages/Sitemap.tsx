'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from '../../context/NavigationContext';
import {
  Home,
  Users,
  Rss,
  FlaskConical,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Calendar,
  Info,
  Heart,
  Search,
  LayoutDashboard,
  Settings,
  Bookmark,
  Trophy,
  Library,
  ShoppingBag,
  Briefcase,
  ShieldCheck,
  FileText,
  HelpCircle,
  UserPlus,
  ChevronDown,
  Map,
  Globe,
  Eye,
  Video,
  HandHelping,
  UserCircle,
  Lock,
  NotebookPen,
  BadgeCheck,
  FolderHeart,
  BarChart3,
  ClipboardList,
  Building2,
  Scale,
  Accessibility,
  LogIn,
  UserRoundPlus,
  UserCog,
  PenLine,
  Sparkles,
} from 'lucide-react';
import SEO from '../components/SEO';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SitemapItem {
  title: string;
  path: string;
  description: string;
  icon: React.ElementType;
}

interface SitemapSection {
  heading: string;
  icon: React.ElementType;
  theme: 'blue' | 'violet' | 'emerald' | 'amber' | 'slate' | 'rose';
  items: SitemapItem[];
}

/* ------------------------------------------------------------------ */
/*  Theme helpers                                                      */
/* ------------------------------------------------------------------ */

const themeConfig = {
  blue: {
    heading: 'text-blue-700',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-600 ring-blue-200',
    borderHover: 'hover:border-blue-200',
    bgHover: 'hover:bg-blue-50/40',
    iconHover: 'group-hover:bg-blue-100 group-hover:text-blue-600',
    titleHover: 'group-hover:text-blue-600',
  },
  violet: {
    heading: 'text-violet-700',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    badge: 'bg-violet-50 text-violet-600 ring-violet-200',
    borderHover: 'hover:border-violet-200',
    bgHover: 'hover:bg-violet-50/40',
    iconHover: 'group-hover:bg-violet-100 group-hover:text-violet-600',
    titleHover: 'group-hover:text-violet-600',
  },
  emerald: {
    heading: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
    borderHover: 'hover:border-emerald-200',
    bgHover: 'hover:bg-emerald-50/40',
    iconHover: 'group-hover:bg-emerald-100 group-hover:text-emerald-600',
    titleHover: 'group-hover:text-emerald-600',
  },
  amber: {
    heading: 'text-amber-700',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-600 ring-amber-200',
    borderHover: 'hover:border-amber-200',
    bgHover: 'hover:bg-amber-50/40',
    iconHover: 'group-hover:bg-amber-100 group-hover:text-amber-600',
    titleHover: 'group-hover:text-amber-600',
  },
  slate: {
    heading: 'text-slate-700',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600 ring-slate-200',
    borderHover: 'hover:border-slate-300',
    bgHover: 'hover:bg-slate-50/60',
    iconHover: 'group-hover:bg-slate-200 group-hover:text-slate-700',
    titleHover: 'group-hover:text-slate-800',
  },
  rose: {
    heading: 'text-rose-700',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-600 ring-rose-200',
    borderHover: 'hover:border-rose-200',
    bgHover: 'hover:bg-rose-50/40',
    iconHover: 'group-hover:bg-rose-100 group-hover:text-rose-600',
    titleHover: 'group-hover:text-rose-600',
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const sections: SitemapSection[] = [
  {
    heading: 'Main Pages',
    icon: Globe,
    theme: 'blue',
    items: [
      {
        title: 'Home',
        path: '/',
        description:
          'Platform homepage with search, featured optometrists, latest community posts, and quick access to all features',
        icon: Home,
      },
      {
        title: 'Directory',
        path: '/directory',
        description:
          'Browse and search our global directory of optometrists, ophthalmologists, and students by specialty, location, and skills',
        icon: Users,
      },
      {
        title: 'Feed',
        path: '/feed',
        description:
          'Community social feed where members share posts, clinical cases, polls, and engage in professional discussions',
        icon: Rss,
      },
      {
        title: 'Blog',
        path: '/blog',
        description:
          'Articles, clinical guides, research summaries, and insights written by community members and industry experts',
        icon: BookOpen,
      },
      {
        title: 'Labs',
        path: '/labs',
        description:
          'AI-powered clinical tools and simulators including OD CAM, OptoScholar, IPD Measure Pro, and RAPD Simulator',
        icon: FlaskConical,
      },

    ],
  },
  {
    heading: 'Community & Learning',
    icon: GraduationCap,
    theme: 'violet',
    items: [
      {
        title: 'Community',
        path: '/community',
        description:
          'Discussion forums, topic categories, trending discussions, community leaders, and upcoming webinar countdowns',
        icon: MessageSquare,
      },
      {
        title: 'Events',
        path: '/events',
        description:
          'Browse upcoming conferences, workshops, webinars, and community meetups in the eye care field',
        icon: Calendar,
      },
      {
        title: 'Webinars',
        path: '/webinar',
        description:
          'Book seats for live expert-led sessions on clinical topics, ask questions, and access recorded content',
        icon: Video,
      },
      {
        title: 'Academy',
        path: '/academy/beyond-the-phoropter',
        description:
          'Structured learning courses and masterclasses covering advanced optometry topics with learning outcomes',
        icon: NotebookPen,
      },
      {
        title: 'Supporters',
        path: '/supporters',
        description:
          'Meet the organizations, institutions, and individuals who back and sponsor the FocusLinks community',
        icon: Heart,
      },
    ],
  },
  {
    heading: 'Account & Tools',
    icon: LayoutDashboard,
    theme: 'emerald',
    items: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        description:
          'Your personal hub showing activity stats, recent interactions, notifications, and quick actions',
        icon: LayoutDashboard,
      },
      {
        title: 'My Profile',
        path: '/my-profile',
        description:
          'View and manage your public professional profile visible in the global directory',
        icon: UserCircle,
      },
      {
        title: 'Settings',
        path: '/settings',
        description:
          'Manage account preferences, privacy settings, notification controls, and theme selection',
        icon: Settings,
      },
      {
        title: 'Bookmarks',
        path: '/bookmarks',
        description:
          'Access your saved posts, resources, and content you\'ve bookmarked for later reference',
        icon: Bookmark,
      },
      {
        title: 'Search',
        path: '/search',
        description:
          'Universal search across the entire platform — profiles, posts, articles, tools, and more',
        icon: Search,
      },
    ],
  },
  {
    heading: 'Explore',
    icon: BarChart3,
    theme: 'amber',
    items: [
      {
        title: 'Leaderboard',
        path: '/leaderboard',
        description:
          'Community rankings showing top contributors by activity score, credits, posts, and connections with achievement badges',
        icon: Trophy,
      },
      {
        title: 'Resources',
        path: '/resources',
        description:
          'Curated library of clinical guidelines, research papers, video tutorials, case studies, and quick reference materials',
        icon: Library,
      },
      {
        title: 'Marketplace',
        path: '/marketplace',
        description:
          'Browse and list equipment, services, and career opportunities in the eye care industry',
        icon: ShoppingBag,
      },
      {
        title: 'Jobs',
        path: '/jobs',
        description:
          'Find optometry positions, residency openings, and career opportunities worldwide',
        icon: Briefcase,
      },
    ],
  },
  {
    heading: 'Company & Legal',
    icon: Scale,
    theme: 'slate',
    items: [
      {
        title: 'About',
        path: '/about',
        description:
          'Our mission to connect the global optometry community, our team, and the story behind FocusLinks',
        icon: Info,
      },
      {
        title: 'Contact',
        path: '/contactus',
        description:
          'Get in touch with the FocusLinks team for support, partnerships, or general inquiries',
        icon: HelpCircle,
      },
      {
        title: 'Help Center',
        path: '/help-center',
        description:
          'FAQs, getting started guides, troubleshooting, and comprehensive platform documentation',
        icon: HelpCircle,
      },
      {
        title: 'Privacy Policy',
        path: '/privacy',
        description:
          'How we collect, use, and protect your personal data and privacy rights',
        icon: ShieldCheck,
      },
      {
        title: 'Terms of Service',
        path: '/terms',
        description:
          'Platform usage guidelines, community rules, intellectual property, and legal terms',
        icon: FileText,
      },
      {
        title: 'Accessibility',
        path: '/accessibility',
        description:
          'Our commitment to making FocusLinks usable for everyone, including users with disabilities',
        icon: Accessibility,
      },
    ],
  },
  {
    heading: 'Getting Started',
    icon: LogIn,
    theme: 'rose',
    items: [
      {
        title: 'Login',
        path: '/login',
        description:
          'Sign in to your existing FocusLinks account',
        icon: Lock,
      },
      {
        title: 'Join Now',
        path: '/membership',
        description:
          'Create a free account and join 500+ optometry professionals worldwide',
        icon: UserRoundPlus,
      },
      {
        title: 'Create Profile',
        path: '/create-profile',
        description:
          'Set up your professional directory listing with credentials, specialties, and contact information',
        icon: UserCog,
      },
      {
        title: 'Team Application',
        path: '/team-application',
        description:
          'Apply to join the FocusLinks volunteer team and help grow the platform',
        icon: PenLine,
      },
    ],
  },
];

const totalPages = sections.reduce((sum, s) => sum + s.items.length, 0);

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function SitemapPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(sections.map((s) => [s.heading, true])),
  );

  const toggle = (heading: string) =>
    setExpanded((prev) => ({ ...prev, [heading]: !prev[heading] }));

  return (
    <>
    <SEO title="Sitemap" description="FocusLinks sitemap — browse all pages and sections of the platform." keywords="sitemap, site map, navigation" />
    <div className="min-h-screen bg-slate-50">
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* decorative blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-pink-400/15 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-blue-100 ring-1 ring-white/20 backdrop-blur-md mb-6">
              <Map className="h-4 w-4 text-yellow-300" />
              Complete Navigation
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Pages{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Overview
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-blue-100 leading-relaxed">
              A complete guide to every page on FocusLinks. Discover features you may have missed and find exactly what you need.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------- Stats bar ---------- */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{totalPages}</p>
                <p className="text-xs font-medium text-slate-500">Total Pages</p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                <FolderHeart className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{sections.length}</p>
                <p className="text-xs font-medium text-slate-500">Categories</p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <Sparkles className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">6</p>
                <p className="text-xs font-medium text-slate-500">Core Sections</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ---------- Sections ---------- */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        {sections.map((section, sIdx) => {
          const t = themeConfig[section.theme];
          const SectionIcon = section.icon;
          const isOpen = expanded[section.heading] ?? true;

          return (
            <motion.div
              key={section.heading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * sIdx, duration: 0.4 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* --- Accordion header --- */}
              <button
                onClick={() => toggle(section.heading)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-slate-50 sm:p-6"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.iconBg}`}
                  >
                    <SectionIcon className={`h-5 w-5 ${t.iconColor}`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${t.heading}`}>{section.heading}</h2>
                    <span
                      className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${t.badge}`}
                    >
                      {section.items.length} page{section.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* --- Accordion body --- */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`${section.heading}-body`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6 sm:gap-4">
                      {section.items.map((item, iIdx) => {
                        const ItemIcon = item.icon;
                        return (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * iIdx }}
                          >
                            <Link
                              to={item.path}
                              className={`group flex items-start gap-3 rounded-xl border border-slate-100 p-4 transition-all duration-200 ${t.borderHover} ${t.bgHover}`}
                            >
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors ${t.iconHover}`}
                              >
                                <ItemIcon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-current" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3
                                  className={`flex items-center gap-1.5 text-sm font-bold text-slate-900 transition-colors ${t.titleHover}`}
                                >
                                  {item.title}
                                  <ChevronDown className="h-3 w-3 -rotate-90 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-current" />
                                </h3>
                                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </main>

      {/* ---------- Footer CTA ---------- */}
      <section className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <Eye className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Still can&apos;t find what you need?
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Visit our Help Center for detailed guides, or contact our support team directly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/help-center"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <HelpCircle className="h-4 w-4" />
                Help Center
              </Link>
              <Link
                to="/contactus"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Building2 className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  </>
  );
}
