import type { Metadata } from 'next';
import SpaShell from '@/focuslinks/components/SpaShell';
import { buildBreadcrumbSchema, buildFAQSchema, buildWebSiteSchema, buildPersonSchema, buildProfilePageSchemas, routeFAQs, routeBreadcrumbs } from '@/lib/schema';

const GITHUB_PAT = process.env.GITHUB_PAT;

/* ------------------------------------------------------------------ */
/*  Route Metadata Map — per-page SEO data for server-side rendering  */
/* ------------------------------------------------------------------ */

const SITE_URL = 'https://focuslinks.in';

interface RouteMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  type?: 'website' | 'article';
}

const routeMeta: Record<string, RouteMeta> = {
  '/': {
    title: "FocusLinks | World's First Global Platform for Optometrists",
    description: 'FocusLinks is the premier global network for eye care professionals, students, and organizations to collaborate, learn, and grow.',
    keywords: ['FocusLinks', 'Optometry', 'Eye Care', 'Optometrist', 'Vision Science', 'Global Network'],
  },
  '/about': {
    title: 'About FocusLinks | Our Mission & Vision',
    description: 'Learn about FocusLinks — the world\'s first global platform uniting optometrists, students, and eye care organizations. Discover our mission to transform vision care worldwide.',
    keywords: ['about FocusLinks', 'optometry mission', 'eye care vision', 'optometry platform'],
  },
  '/membership': {
    title: 'Membership Plans | FocusLinks',
    description: 'Join FocusLinks with free or premium membership. Access clinical tools, community, academy courses, and the global optometrist directory.',
    keywords: ['FocusLinks membership', 'optometry membership', 'eye care community', 'optometrist network'],
  },
  '/membership-application': {
    title: 'Apply for Membership | FocusLinks',
    description: 'Submit your membership application to join the global FocusLinks optometry community.',
    keywords: ['membership application', 'join optometry', 'FocusLinks apply'],
  },
  '/directory': {
    title: 'Optometrist Directory | Find Eye Care Professionals | FocusLinks',
    description: 'Browse the global directory of optometrists, eye care professionals, and vision science organizations on FocusLinks.',
    keywords: ['optometrist directory', 'eye care professionals', 'find optometrist', 'vision specialist'],
  },
  '/professionals': {
    title: 'Professionals Directory | FocusLinks',
    description: 'Discover and connect with optometry professionals worldwide. Search by specialty, location, and more on FocusLinks.',
    keywords: ['optometry professionals', 'eye care specialists', 'optometrist search'],
  },
  '/community': {
    title: 'Community Hub | FocusLinks',
    description: 'Connect with optometrists and eye care professionals in the FocusLinks community. Share knowledge, ask questions, and grow together.',
    keywords: ['optometry community', 'eye care forum', 'optometrist discussion'],
  },
  '/feed': {
    title: 'Community Feed | FocusLinks',
    description: 'Stay updated with the latest posts, discussions, and insights from the global optometry community on FocusLinks.',
    keywords: ['optometry feed', 'eye care news', 'community posts'],
  },
  '/blog': {
    title: 'Optometry Blog | Articles & Insights | FocusLinks',
    description: 'Read the latest articles, research summaries, and expert insights on optometry, vision science, and eye care on the FocusLinks blog.',
    keywords: ['optometry blog', 'eye care articles', 'vision science research', 'optometry insights'],
  },
  '/labs': {
    title: 'Clinical Labs & AI Tools | FocusLinks',
    description: 'Access AI-powered clinical tools for optometrists — OD Cam, OptoScholar, IPD Measure, RAPD Simulator, and more on FocusLinks Labs.',
    keywords: ['optometry tools', 'clinical labs', 'AI eye care', 'optometry AI', 'ophthalmology tools'],
  },
  '/labs/od-cam': {
    title: 'OD Cam | AI Eye Imaging Tool | FocusLinks Labs',
    description: 'OD Cam — AI-powered eye imaging and analysis tool for optometrists. Capture, analyze, and document eye conditions with FocusLinks Labs.',
    keywords: ['OD Cam', 'eye imaging', 'AI eye analysis', 'optometry camera'],
  },
  '/labs/optoscholar': {
    title: 'OptoScholar | AI Learning Assistant | FocusLinks Labs',
    description: 'OptoScholar — your AI-powered learning assistant for optometry. Get instant answers to clinical questions and study aids.',
    keywords: ['OptoScholar', 'optometry AI', 'learning assistant', 'clinical questions'],
  },
  '/labs/ipd-measure': {
    title: 'IPD Measure | Interpupillary Distance Tool | FocusLinks Labs',
    description: 'Measure interpupillary distance accurately with the IPD Measure tool. Free AI-powered clinical tool for optometrists on FocusLinks.',
    keywords: ['IPD measure', 'interpupillary distance', 'PD measurement', 'optometry tool'],
  },
  '/labs/rapd-simulator': {
    title: 'RAPD Simulator | Relative Afferent Pupillary Defect | FocusLinks Labs',
    description: 'Simulate and learn about Relative Afferent Pupillary Defect (RAPD) with the interactive RAPD Simulator on FocusLinks Labs.',
    keywords: ['RAPD simulator', 'pupillary defect', 'neuro-optometry', 'clinical simulation'],
  },
  '/events': {
    title: 'Events & Webinars | FocusLinks',
    description: 'Discover upcoming optometry events, webinars, and conferences. Register for Eye Q Arena and more on FocusLinks.',
    keywords: ['optometry events', 'eye care webinars', 'optometry conferences', 'Eye Q Arena'],
  },
  '/event/eye-q-arena': {
    title: 'Eye Q Arena | Optometry Quiz Competition | FocusLinks',
    description: 'Compete in Eye Q Arena — the ultimate optometry quiz competition. Test your knowledge against optometrists worldwide on FocusLinks.',
    keywords: ['Eye Q Arena', 'optometry quiz', 'eye care competition', 'optometry challenge'],
  },
  '/academy': {
    title: 'Academy | Optometry Courses & Learning | FocusLinks',
    description: 'Learn with FocusLinks Academy — courses, webinars, and resources for optometrists and vision science students.',
    keywords: ['optometry academy', 'eye care courses', 'vision science learning', 'optometry education'],
  },
  '/academy/beyond-the-phoropter': {
    title: 'Beyond the Phoropter | FocusLinks Academy',
    description: 'Enroll in "Beyond the Phoropter" — an advanced course for optometrists on FocusLinks Academy.',
    keywords: ['beyond the phoropter', 'optometry course', 'advanced optometry'],
  },
  '/login': {
    title: 'Sign In | FocusLinks',
    description: 'Sign in to your FocusLinks account to access the global optometry platform, clinical tools, and community.',
    keywords: ['FocusLinks login', 'optometry sign in', 'eye care platform'],
  },
  '/register': {
    title: 'Create Account | Join FocusLinks',
    description: 'Create your free FocusLinks account. Join the world\'s largest global platform for optometrists, students, and eye care professionals.',
    keywords: ['FocusLinks register', 'create account', 'join optometry', 'sign up'],
  },
  '/dashboard': {
    title: 'Dashboard | FocusLinks',
    description: 'Your FocusLinks dashboard — manage your profile, view community activity, access clinical tools, and track your optometry journey.',
    keywords: ['dashboard', 'profile management', 'optometry dashboard'],
  },
  '/contactus': {
    title: 'Contact Us | FocusLinks',
    description: 'Get in touch with the FocusLinks team. Support, partnerships, and general inquiries for the global optometry platform.',
    keywords: ['contact FocusLinks', 'optometry support', 'eye care help'],
  },
  '/help-center': {
    title: 'Help Center | FocusLinks',
    description: 'Find answers to frequently asked questions, guides, and support resources for the FocusLinks optometry platform.',
    keywords: ['help center', 'FocusLinks support', 'FAQ', 'optometry help'],
  },
  '/privacy': {
    title: 'Privacy Policy | FocusLinks',
    description: 'Read the FocusLinks privacy policy. Learn how we protect your data and privacy on the global optometry platform.',
    keywords: ['privacy policy', 'data protection', 'FocusLinks privacy'],
  },
  '/terms': {
    title: 'Terms of Service | FocusLinks',
    description: 'Read the FocusLinks terms of service for using the global optometry platform.',
    keywords: ['terms of service', 'FocusLinks terms', 'platform terms'],
  },
  '/supporters': {
    title: 'Supporters & Partners | FocusLinks',
    description: 'Meet the organizations and partners supporting FocusLinks — the global platform for optometrists and eye care professionals.',
    keywords: ['FocusLinks supporters', 'partners', 'optometry partners'],
  },
  '/create-profile': {
    title: 'Create Your Profile | FocusLinks',
    description: 'Create your professional optometry profile on FocusLinks. List your specialties, connect with peers, and join the global directory.',
    keywords: ['create profile', 'optometry profile', 'professional directory'],
  },
  '/team-application': {
    title: 'Join the FocusLinks Team',
    description: 'Apply to join the FocusLinks team. Help build the world\'s first global platform for optometrists.',
    keywords: ['team application', 'FocusLinks careers', 'join team'],
  },
  '/verify': {
    title: 'Verify Your Account | FocusLinks',
    description: 'Verify your FocusLinks account to access all features of the global optometry platform.',
    keywords: ['verify account', 'FocusLinks verification'],
  },
  '/articles': {
    title: 'Articles | Optometry Knowledge Base | FocusLinks',
    description: 'Browse and read expert articles on optometry, vision science, and eye care. Contribute your own articles on FocusLinks.',
    keywords: ['optometry articles', 'eye care knowledge', 'vision science articles'],
  },
  '/create-article': {
    title: 'Write an Article | FocusLinks',
    description: 'Share your expertise by writing articles on optometry and eye care for the FocusLinks community.',
    keywords: ['write article', 'contribute optometry', 'publish eye care'],
  },
  '/settings': {
    title: 'Settings | FocusLinks',
    description: 'Manage your FocusLinks account settings, notifications, and preferences.',
    keywords: ['settings', 'account preferences', 'FocusLinks settings'],
  },
  '/messages': {
    title: 'Messages | FocusLinks',
    description: 'View and send messages to other optometrists and eye care professionals on FocusLinks.',
    keywords: ['messages', 'optometry messaging', 'professional chat'],
  },
  '/explore': {
    title: 'Explore | FocusLinks',
    description: 'Explore the FocusLinks platform — discover people, content, tools, and resources for optometrists.',
    keywords: ['explore', 'discover optometry', 'eye care resources'],
  },
  '/bookmarks': {
    title: 'Bookmarks | FocusLinks',
    description: 'View your saved bookmarks — articles, posts, and profiles you\'ve bookmarked on FocusLinks.',
    keywords: ['bookmarks', 'saved content', 'FocusLinks bookmarks'],
  },
  '/notifications': {
    title: 'Notifications | FocusLinks',
    description: 'View your latest notifications — activity, mentions, and updates from the FocusLinks community.',
    keywords: ['notifications', 'activity updates', 'FocusLinks alerts'],
  },
  '/leaderboard': {
    title: 'Leaderboard | FocusLinks',
    description: 'See the top contributors and most active members on FocusLinks. Rise through the ranks of the global optometry community.',
    keywords: ['leaderboard', 'top optometrists', 'community rankings', 'gamification'],
  },
  '/resources': {
    title: 'Resources | FocusLinks',
    description: 'Access curated resources for optometrists — clinical guides, charts, calculators, and educational materials on FocusLinks.',
    keywords: ['optometry resources', 'clinical guides', 'eye care materials'],
  },
  '/marketplace': {
    title: 'Marketplace | FocusLinks',
    description: 'Browse the FocusLinks marketplace — optometry equipment, software, and services from trusted providers.',
    keywords: ['marketplace', 'optometry equipment', 'eye care products'],
  },
  '/my-profile': {
    title: 'My Profile | FocusLinks',
    description: 'View and edit your FocusLinks professional profile.',
    keywords: ['my profile', 'edit profile', 'professional profile'],
  },
  '/user-profile': {
    title: 'User Profile | FocusLinks',
    description: 'View user profiles on FocusLinks — the global optometry platform.',
    keywords: ['user profile', 'optometrist profile'],
  },
  '/search': {
    title: 'Search | FocusLinks',
    description: 'Search the FocusLinks platform for optometrists, articles, tools, and resources.',
    keywords: ['search', 'find optometrist', 'eye care search'],
  },
  '/stats': {
    title: 'Platform Stats | FocusLinks',
    description: 'View FocusLinks platform statistics — member count, profiles, posts, and community growth.',
    keywords: ['stats', 'platform statistics', 'community metrics'],
  },
  '/jobs': {
    title: 'Optometry Jobs | Career Board | FocusLinks',
    description: 'Find optometry jobs and career opportunities worldwide. Post and browse positions on the FocusLinks job board.',
    keywords: ['optometry jobs', 'eye care careers', 'optometrist positions', 'job board'],
  },
  '/sitemap': {
    title: 'Sitemap | FocusLinks',
    description: 'Browse the complete sitemap of FocusLinks — the global platform for optometrists.',
    keywords: ['sitemap', 'FocusLinks pages', 'site navigation'],
  },
  '/accessibility': {
    title: 'Accessibility Statement | FocusLinks',
    description: 'Read the FocusLinks accessibility commitment. We strive to make the optometry platform accessible to all users.',
    keywords: ['accessibility', 'a11y', 'inclusive design'],
  },
  '/opto-map': {
    title: 'OptoMap | Interactive World Map of Optometrists | FocusLinks',
    description: 'Explore OptoMap — an interactive world map of optometrists, eye care organizations, and vision science institutions on FocusLinks.',
    keywords: ['OptoMap', 'world map', 'optometrist locations', 'global eye care map'],
  },
  '/home': {
    title: 'Home | FocusLinks',
    description: 'Welcome to FocusLinks — the world\'s first global platform for optometrists, students, and eye care organizations.',
    keywords: ['FocusLinks', 'optometry home', 'eye care platform'],
  },
  '/connections': {
    title: 'Connections | FocusLinks',
    description: 'Manage your professional connections on FocusLinks. Connect with optometrists and eye care professionals worldwide.',
    keywords: ['connections', 'professional network', 'optometry contacts'],
  },
  '/beyond-orthok': {
    title: 'Beyond OrthoK Webinar | FocusLinks',
    description: 'Register for the Beyond OrthoK webinar on FocusLinks. Learn about advanced orthokeratology from expert optometrists.',
    keywords: ['Beyond OrthoK', 'orthokeratology webinar', 'orthoK learning'],
  },
  '/onboarding': {
    title: 'Get Started | FocusLinks',
    description: 'Join FocusLinks — set up your account and start connecting with optometrists worldwide.',
    keywords: ['get started', 'onboarding', 'join FocusLinks'],
  },
  '/booked': {
    title: 'Booking Confirmed | FocusLinks',
    description: 'Your booking on FocusLinks has been confirmed.',
    keywords: ['booking confirmed', 'FocusLinks event'],
  },
  '/debug': {
    title: 'Debug | FocusLinks',
    description: 'FocusLinks debug tools.',
    keywords: ['debug'],
  },
  '/admin': {
    title: 'Admin | FocusLinks',
    description: 'FocusLinks administration panel.',
    keywords: ['admin'],
  },
};

/* ------------------------------------------------------------------ */
/*  Resolve metadata for a given path (supports dynamic routes)       */
/* ------------------------------------------------------------------ */

function resolveMeta(slug: string[] | undefined): RouteMeta {
  const path = slug ? `/${slug.join('/')}` : '/';

  // Exact match
  if (routeMeta[path]) return routeMeta[path];

  // Dynamic route patterns
  if (path.startsWith('/blog/') && path.split('/').length === 3) {
    return {
      title: 'Blog Post | FocusLinks',
      description: 'Read this optometry article on FocusLinks — insights on eye care, vision science, and clinical practice.',
      keywords: ['optometry blog', 'eye care article', 'vision science'],
      type: 'article',
    };
  }
  if (path.startsWith('/user/')) {
    return {
      title: 'Optometrist Profile | FocusLinks',
      description: 'View this optometrist\'s professional profile on FocusLinks — the global platform for eye care professionals.',
      keywords: ['optometrist profile', 'eye care professional'],
    };
  }
  if (path.startsWith('/profile/')) {
    return {
      title: 'Professional Profile | FocusLinks Directory',
      description: 'View this eye care professional\'s directory profile on FocusLinks.',
      keywords: ['professional profile', 'optometrist directory'],
    };
  }
  if (path.startsWith('/webinar')) {
    return {
      title: 'Webinar | FocusLinks',
      description: 'Join this optometry webinar on FocusLinks. Learn from expert eye care professionals.',
      keywords: ['optometry webinar', 'eye care learning'],
    };
  }

  // Fallback for unknown routes
  return {
    title: 'FocusLinks | Global Platform for Optometrists',
    description: 'FocusLinks is the premier global network for eye care professionals, students, and organizations.',
    keywords: ['FocusLinks', 'Optometry', 'Eye Care'],
  };
}

/* ------------------------------------------------------------------ */
/*  Helper: Fetch profile data from GitHub for SSR metadata           */
/* ------------------------------------------------------------------ */

async function fetchProfileForSSR(slug: string): Promise<{
  name: string;
  title?: string;
  location?: string;
  country?: string;
  role?: string;
  description?: string;
  image?: string;
  verified?: boolean;
  membershipId?: string;
} | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'FocusLinks-App',
    };
    if (GITHUB_PAT) {
      headers.Authorization = `token ${GITHUB_PAT}`;
    }

    // Fetch list_profiles.json to find the profile by slug
    const res = await fetch(
      `https://raw.githubusercontent.com/Phantozweb/Fldatas/main/list_profiles.json`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    if (!res.ok) return null;

    const profiles = await res.json();
    if (!Array.isArray(profiles)) return null;

    // Find profile by matching slug
    const generateSlug = (name: string) =>
      (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const profile = profiles.find((p: any) => generateSlug(p.name) === slug);
    if (!profile) return null;

    return {
      name: profile.name,
      title: profile.title,
      location: profile.location,
      country: profile.country,
      role: profile.role,
      description: profile.description,
      image: profile.image,
      verified: profile.verified,
      membershipId: profile.membershipId,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  generateMetadata — server-side per-route SEO                      */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = resolveMeta(slug);
  const path = slug ? `/${slug.join('/')}` : '/';
  const canonicalUrl = `${SITE_URL}${path}`;

  // Dynamic profile metadata for /profile/[slug] routes
  let title = meta.title;
  let description = meta.description;
  let keywords = meta.keywords;
  let ogImage = '/og-image.jpg';

  if (path.startsWith('/profile/')) {
    const profileSlug = path.replace('/profile/', '');
    const profile = await fetchProfileForSSR(profileSlug);
    if (profile) {
      title = `${profile.name} — ${profile.title || profile.role || 'Optometrist'} | FocusLinks`;
      description = `${profile.name} is a ${(profile.role || 'professional').toLowerCase()} on FocusLinks.${profile.location ? ` Based in ${profile.location}.` : ''}${profile.description ? ` ${profile.description.slice(0, 120)}` : ''}`;
      keywords = [profile.name, profile.role || 'optometrist', profile.location || '', 'FocusLinks profile'].filter(Boolean);
      if (profile.image && profile.image !== 'none' && !profile.image.includes('localhost')) {
        ogImage = profile.image;
      }
    }
  }

  return {
    // Use absolute title to avoid layout template duplication
    title: { absolute: title },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'FocusLinks',
      type: (meta.type as 'website' | 'article') || 'website',
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page Component — server-side shell that renders the SPA client     */
/*  Also injects per-route JSON-LD structured data for SEO & AEO      */
/* ------------------------------------------------------------------ */

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = slug ? `/${slug.join('/')}` : '/';

  // Build server-side JSON-LD schemas
  const schemas: Record<string, unknown>[] = [];

  // WebSite schema on homepage only (search action for Google sitelinks)
  if (path === '/') {
    schemas.push(buildWebSiteSchema());
  }

  // Profile pages: inject Person + BreadcrumbList + ProfilePage + FAQ schemas
  if (path.startsWith('/profile/')) {
    const profileSlug = path.replace('/profile/', '');
    const profile = await fetchProfileForSSR(profileSlug);
    if (profile) {
      const profileSchemas = buildProfilePageSchemas({
        name: profile.name,
        title: profile.title,
        description: profile.description,
        image: profile.image,
        location: profile.location,
        country: profile.country,
        role: profile.role,
        verified: profile.verified,
        membershipId: profile.membershipId,
      });
      schemas.push(...profileSchemas);
    }
  }

  // BreadcrumbList schema for every page that has a breadcrumb
  const breadcrumbItems = routeBreadcrumbs[path];
  if (breadcrumbItems) {
    schemas.push(buildBreadcrumbSchema(breadcrumbItems));
  }

  // FAQPage schema for pages that have FAQs
  const faqs = routeFAQs[path];
  if (faqs) {
    schemas.push(buildFAQSchema(faqs));
  }

  return (
    <>
      {/* Server-side JSON-LD structured data — visible to crawlers */}
      {schemas.map((schema, i) => (
        <script
          key={`schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <SpaShell />
    </>
  );
}
