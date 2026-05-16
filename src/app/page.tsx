'use client';

import React, { lazy, Suspense, useMemo, useEffect, useRef } from 'react';
import { NavigationProvider, useLocation, useNavigate } from '@/context/NavigationContext';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from '@/focuslinks/components/Navbar';
import Footer from '@/focuslinks/components/Footer';
import GettingStartedModal from '@/focuslinks/components/GettingStartedModal';
// OnboardingWizard removed — now using full-page OnboardingPage
import CommandPalette from '@/focuslinks/components/CommandPalette';
import OnboardingTour from '@/focuslinks/components/OnboardingTour';
import Breadcrumbs from '@/focuslinks/components/Breadcrumbs';
import BottomNav from '@/focuslinks/components/BottomNav';
import AuthGuardOverlay, { useIsAuthenticated, isRouteProtected, getPageName } from '@/focuslinks/components/AuthGuardOverlay';

const Home = lazy(() => import('@/focuslinks/pages/Home'));
const About = lazy(() => import('@/focuslinks/pages/About'));
const Membership = lazy(() => import('@/focuslinks/pages/Membership'));
const Directory = lazy(() => import('@/focuslinks/pages/Directory'));
const Community = lazy(() => import('@/focuslinks/pages/Community'));
const Blog = lazy(() => import('@/focuslinks/pages/Blog'));
const Labs = lazy(() => import('@/focuslinks/pages/Labs'));
const Events = lazy(() => import('@/focuslinks/pages/Events'));
const Login = lazy(() => import('@/focuslinks/pages/Login'));
const Register = lazy(() => import('@/focuslinks/pages/Register'));
const Dashboard = lazy(() => import('@/focuslinks/pages/Dashboard'));
const ContactUs = lazy(() => import('@/focuslinks/pages/ContactUs'));
const HelpCenter = lazy(() => import('@/focuslinks/pages/HelpCenter'));
const Privacy = lazy(() => import('@/focuslinks/pages/Privacy'));
const Terms = lazy(() => import('@/focuslinks/pages/Terms'));
const Feed = lazy(() => import('@/focuslinks/pages/Feed'));
const BlogPostDetail = lazy(() => import('@/focuslinks/pages/BlogPostDetail'));
const ProfileDetail = lazy(() => import('@/focuslinks/pages/ProfileDetail'));
const CreateProfile = lazy(() => import('@/focuslinks/pages/CreateProfile'));
const TeamApplication = lazy(() => import('@/focuslinks/pages/TeamApplication'));
const Supporters = lazy(() => import('@/focuslinks/pages/Supporters'));
const Academy = lazy(() => import('@/focuslinks/pages/Academy'));
const AcademyCourse = lazy(() => import('@/focuslinks/pages/AcademyCourse'));
const Webinar = lazy(() => import('@/focuslinks/pages/Webinar'));
const OdCam = lazy(() => import('@/focuslinks/pages/OdCam'));
const OptoScholar = lazy(() => import('@/focuslinks/pages/OptoScholar'));
const IpdMeasure = lazy(() => import('@/focuslinks/pages/IpdMeasure'));
const RapdSimulator = lazy(() => import('@/focuslinks/pages/RapdSimulator'));
const MembershipApplication = lazy(() => import('@/focuslinks/pages/MembershipApplication'));
const Verify = lazy(() => import('@/focuslinks/pages/Verify'));
const Booked = lazy(() => import('@/focuslinks/pages/Booked'));
const Debug = lazy(() => import('@/focuslinks/pages/Debug'));
const Articles = lazy(() => import('@/focuslinks/pages/Articles'));
const CreateArticle = lazy(() => import('@/focuslinks/pages/CreateArticle'));
const EventEyeQArena = lazy(() => import('@/focuslinks/pages/EventEyeQArena'));
const NotFound = lazy(() => import('@/focuslinks/pages/NotFound'));
const Settings = lazy(() => import('@/focuslinks/pages/Settings'));
const Messages = lazy(() => import('@/focuslinks/pages/Messages'));
const Explore = lazy(() => import('@/focuslinks/pages/Explore'));
const Bookmarks = lazy(() => import('@/focuslinks/pages/Bookmarks'));
const Notifications = lazy(() => import('@/focuslinks/pages/Notifications'));
const Leaderboard = lazy(() => import('@/focuslinks/pages/Leaderboard'));
const Resources = lazy(() => import('@/focuslinks/pages/Resources'));
const Marketplace = lazy(() => import('@/focuslinks/pages/Marketplace'));
const MyProfile = lazy(() => import('@/focuslinks/pages/MyProfile'));
const Search = lazy(() => import('@/focuslinks/pages/Search'));
const StatsDashboard = lazy(() => import('@/focuslinks/pages/StatsDashboard'));
const Jobs = lazy(() => import('@/focuslinks/pages/Jobs'));
const UserProfilePage = lazy(() => import('@/focuslinks/pages/UserProfilePage'));
const SitemapPage = lazy(() => import('@/focuslinks/pages/Sitemap'));
const AccessibilityPage = lazy(() => import('@/focuslinks/pages/Accessibility'));
const UserProfile = lazy(() => import('@/focuslinks/pages/UserProfile'));
const Admin = lazy(() => import('@/focuslinks/pages/Admin'));
const OptoMap = lazy(() => import('@/focuslinks/pages/OptoMap'));
const HomePage = lazy(() => import('@/focuslinks/pages/HomePage'));
const ConnectionsPage = lazy(() => import('@/focuslinks/pages/Connections'));
const ProfessionalsDirectory = lazy(() => import('@/focuslinks/pages/ProfessionalsDirectory'));
const OnboardingPage = lazy(() => import('@/focuslinks/pages/OnboardingPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-100 dark:border-blue-900 rounded-full" />
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-gray-400 dark:text-slate-500 animate-pulse">Loading...</p>
    </div>
  );
}

function Router() {
  const { pathname } = useLocation();
  const path = pathname || '/';
  // Redirect from / based on auth state (one-time only)
  const hasRedirected = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (path === '/' && !hasRedirected.current) {
      try {
        const storedUser = localStorage.getItem('fl_user');
        if (storedUser) {
          hasRedirected.current = true;
          navigate('/dashboard');
        } else {
          hasRedirected.current = true;
          navigate('/onboarding');
        }
      } catch { /* ignore */ }
    }
  }, [path, navigate]);

  // Auth guard
  const isAuthenticated = useIsAuthenticated();
  const isProtected = isRouteProtected(path);
  const needsGuard = !isAuthenticated && isProtected;
  const pageName = getPageName(path);

  const routes: Record<string, React.LazyExoticComponent<React.ComponentType>> = useMemo(() => ({
    '/': Home,
    '/about': About,
    '/membership': Membership,
    '/membership-application': MembershipApplication,
    '/directory': Directory,
    '/community': Community,
    '/feed': Feed,
    '/blog': Blog,
    '/labs': Labs,
    '/events': Events,
    '/login': Login,
    '/register': Register,
    '/dashboard': Dashboard,
    '/contactus': ContactUs,
    '/help-center': HelpCenter,
    '/privacy': Privacy,
    '/terms': Terms,
    '/supporters': Supporters,
    '/create-profile': CreateProfile,
    '/team-application': TeamApplication,
    '/academy': Academy,
    '/academy/beyond-the-phoropter': AcademyCourse,
    '/verify': Verify,
    '/booked': Booked,
    '/debug': Debug,
    '/articles': Articles,
    '/create-article': CreateArticle,
    '/event/eye-q-arena': EventEyeQArena,
    '/labs/od-cam': OdCam,
    '/labs/optoscholar': OptoScholar,
    '/labs/ipd-measure': IpdMeasure,
    '/labs/rapd-simulator': RapdSimulator,
    '/settings': Settings,
    '/messages': Messages,
    '/explore': Explore,
    '/bookmarks': Bookmarks,
    '/notifications': Notifications,
    '/leaderboard': Leaderboard,
    '/resources': Resources,
    '/marketplace': Marketplace,
    '/my-profile': MyProfile,
    '/user-profile': UserProfile,
    '/search': Search,
    '/stats': StatsDashboard,
    '/jobs': Jobs,
    '/sitemap': SitemapPage,
    '/accessibility': AccessibilityPage,
    '/admin': Admin,
    '/opto-map': OptoMap,
    '/home': HomePage,
    '/connections': ConnectionsPage,
    '/professionals': ProfessionalsDirectory,
    '/beyond-orthok': Webinar,
    '/onboarding': OnboardingPage,
  }), []);

  let PageComponent: React.LazyExoticComponent<React.ComponentType> | null = null;

  if (path.startsWith('/blog/') && path.split('/').length === 3) PageComponent = BlogPostDetail;
  else if (path.startsWith('/user/')) PageComponent = UserProfilePage;
  else if (path.startsWith('/profile/')) PageComponent = ProfileDetail;
  else if (path.startsWith('/webinar')) PageComponent = Webinar;
  else PageComponent = routes[path] || (path === '/' ? Home : NotFound);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={path}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={needsGuard ? 'blur-lg pointer-events-none select-none' : ''}
        >
          {path !== '/' && path !== '/onboarding' && !needsGuard && <Breadcrumbs />}
          <Suspense fallback={<PageLoader />}>
            {PageComponent && <PageComponent />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
      {needsGuard && <AuthGuardOverlay pageName={pageName} />}
    </>
  );
}

/* ── Inner layout that reads NavigationContext INSIDE the provider ── */
function AppLayout() {
  const isAuthenticated = useIsAuthenticated();
  const { pathname } = useLocation();
  const path = pathname || '/';
  const isOnboarding = path === '/onboarding';

  return (
    <div className={isOnboarding ? '' : 'min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200'}>
      {!isOnboarding && <Navbar />}
      {isAuthenticated && !isOnboarding && <GettingStartedModal />}
      {isAuthenticated && !isOnboarding && <CommandPalette />}
      {isAuthenticated && !isOnboarding && <OnboardingTour />}
      {isAuthenticated && !isOnboarding && <BottomNav />}
      <main className={isOnboarding ? '' : 'flex-grow'}>
        <Router />
      </main>
      {!isOnboarding && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <NavigationProvider>
      <AppLayout />
    </NavigationProvider>
  );
}
