/**
 * Schema.org JSON-LD Structured Data Builders for FocusLinks
 *
 * Generates schema.org structured data for:
 * - Person (optometrist profiles)
 * - MedicalBusiness / ProfessionalService (clinic/practice profiles)
 * - BreadcrumbList (navigation trails)
 * - FAQPage (frequently asked questions)
 * - WebSite (search action)
 * - Article (blog posts)
 * - Event (webinars, Eye Q Arena)
 * - Course (academy courses)
 *
 * These schemas help Google, Bing, and AI crawlers (ChatGPT, Claude,
 * Perplexity, Gemini) understand and surface FocusLinks content in
 * search results, AI answers, and knowledge panels.
 */

const SITE_URL = 'https://focuslinks.in';
const SITE_NAME = 'FocusLinks';

/* ------------------------------------------------------------------ */
/*  Person — Optometrist / Professional Profile                       */
/* ------------------------------------------------------------------ */

export interface PersonSchemaInput {
  name: string;
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  email?: string;
  linkedin?: string;
  location?: string;
  country?: string;
  role?: string;
  specialties?: string[];
  skills?: string[];
  languages?: string[];
  experience?: { title: string; company: string; duration: string; description?: string }[];
  education?: { degree: string; institution: string; year?: string }[];
  verified?: boolean;
  membershipId?: string;
  organization?: string;
}

export function buildPersonSchema(data: PersonSchemaInput) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const profileUrl = data.url || `${SITE_URL}/profile/${slug}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    url: profileUrl,
    image: data.image || `${SITE_URL}/logo.svg`,
    jobTitle: data.title || data.role || 'Optometrist',
    worksFor: {
      '@type': 'Organization',
      name: data.organization || SITE_NAME,
    },
  };

  // Description / bio
  if (data.description) {
    schema.description = data.description;
  }

  // Email
  if (data.email) {
    schema.email = data.email;
  }

  // SameAs — social profiles (helps Google connect knowledge panels)
  const sameAs: string[] = [];
  if (data.linkedin) sameAs.push(data.linkedin);
  if (sameAs.length > 0) schema.sameAs = sameAs;

  // Address
  if (data.location || data.country) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: data.location || '',
      addressCountry: data.country || '',
    };
  }

  // Knows About — specialties and skills (maps to schema:knowsAbout)
  const knowsAbout = [...(data.specialties || []), ...(data.skills || [])];
  if (knowsAbout.length > 0) {
    schema.knowsAbout = knowsAbout;
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    schema.knowsLanguage = data.languages;
  }

  // Verified badge → hasCredential
  if (data.verified) {
    schema.hasCredential = {
      '@type': 'EducationalOccupationalCredential',
      name: 'FocusLinks Verified Professional',
      credentialCategory: 'verification',
      recognizedBy: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    };
  }

  // Alumni Of — education
  if (data.education && data.education.length > 0) {
    schema.alumniOf = data.education.map(edu => ({
      '@type': 'EducationalOrganization',
      name: edu.institution,
    }));
  }

  // Work Experience
  if (data.experience && data.experience.length > 0) {
    schema.workExperience = data.experience.map(exp => ({
      '@type': 'OrganizationRole',
      roleName: exp.title,
      worksFor: {
        '@type': 'Organization',
        name: exp.company,
      },
      startDate: exp.duration,
      description: exp.description || '',
    }));
  }

  // Identifier
  if (data.membershipId) {
    schema.identifier = data.membershipId;
  }

  return schema;
}

/* ------------------------------------------------------------------ */
/*  ProfessionalService / MedicalBusiness — Clinic/Practice Profile   */
/* ------------------------------------------------------------------ */

export interface ProfessionalServiceSchemaInput {
  name: string;
  description?: string;
  image?: string;
  url?: string;
  location?: string;
  country?: string;
  phone?: string;
  email?: string;
  specialties?: string[];
  priceRange?: string;
}

export function buildProfessionalServiceSchema(data: ProfessionalServiceSchemaInput) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'MedicalBusiness'],
    name: data.name,
    url: data.url || SITE_URL,
    image: data.image || `${SITE_URL}/logo.svg`,
    priceRange: data.priceRange || 'Free consultation',
  };

  if (data.description) schema.description = data.description;
  if (data.email) schema.email = data.email;
  if (data.phone) schema.telephone = data.phone;

  if (data.location || data.country) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: data.location || '',
      addressCountry: data.country || '',
    };
  }

  if (data.specialties && data.specialties.length > 0) {
    schema.knowsAbout = data.specialties;
    schema.medicalSpecialty = data.specialties;
    schema.serviceType = data.specialties.map(s => `${s} Services`);
  }

  return schema;
}

/* ------------------------------------------------------------------ */
/*  BreadcrumbList — Navigation Trail                                 */
/* ------------------------------------------------------------------ */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  FAQPage — Frequently Asked Questions                              */
/* ------------------------------------------------------------------ */

export interface FAQItem {
  question: string;
  answer: string;
}

export function buildFAQSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  WebSite — Search Action (enables sitelinks searchbox)             */
/* ------------------------------------------------------------------ */

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Article — Blog Post                                               */
/* ------------------------------------------------------------------ */

export interface ArticleSchemaInput {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  authorName?: string;
  authorUrl?: string;
  datePublished?: string;
  dateModified?: string;
}

export function buildArticleSchema(data: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description || '',
    url: data.url || '',
    image: data.image || `${SITE_URL}/og-image.jpg`,
    datePublished: data.datePublished || new Date().toISOString(),
    dateModified: data.dateModified || data.datePublished || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: data.authorName || SITE_NAME,
      url: data.authorUrl || SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url || SITE_URL,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Event — Webinars, Eye Q Arena                                     */
/* ------------------------------------------------------------------ */

export interface EventSchemaInput {
  name: string;
  description?: string;
  url?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  organizer?: string;
  eventStatus?: string;
  eventAttendanceMode?: string;
}

export function buildEventSchema(data: EventSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name,
    description: data.description || '',
    url: data.url || `${SITE_URL}/events`,
    image: data.image || `${SITE_URL}/og-image.jpg`,
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    eventStatus: data.eventStatus || 'https://schema.org/EventScheduled',
    eventAttendanceMode: data.eventAttendanceMode || 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: data.url || `${SITE_URL}/events`,
    },
    organizer: {
      '@type': 'Organization',
      name: data.organizer || SITE_NAME,
      url: SITE_URL,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Course — Academy Courses                                          */
/* ------------------------------------------------------------------ */

export interface CourseSchemaInput {
  name: string;
  description?: string;
  url?: string;
  provider?: string;
  instructor?: string;
}

export function buildCourseSchema(data: CourseSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: data.name,
    description: data.description || '',
    url: data.url || `${SITE_URL}/academy`,
    provider: {
      '@type': 'Organization',
      name: data.provider || SITE_NAME,
      url: SITE_URL,
    },
    ...(data.instructor ? {
      instructor: {
        '@type': 'Person',
        name: data.instructor,
      },
    } : {}),
  };
}

/* ------------------------------------------------------------------ */
/*  ItemList — Directory / Collection pages                           */
/* ------------------------------------------------------------------ */

export interface ListItemInput {
  name: string;
  url: string;
  position: number;
}

export function buildItemListSchema(items: ListItemInput[], name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

/* ------------------------------------------------------------------ */
/*  Route-level FAQ Data — Pre-built for key pages                    */
/* ------------------------------------------------------------------ */

export const routeFAQs: Record<string, FAQItem[]> = {
  '/directory': [
    { question: 'What is the FocusLinks Optometrist Directory?', answer: 'The FocusLinks directory is a global listing of optometrists, eye care professionals, and vision science organizations. You can search by specialty, location, or name to find the right professional.' },
    { question: 'How do I add my profile to the directory?', answer: 'Create a free FocusLinks account, complete your profile, and click "Create Public Profile" from your dashboard. Your profile will be reviewed and published to the global directory.' },
    { question: 'Is the directory free to use?', answer: 'Yes, browsing and listing in the FocusLinks optometrist directory is completely free. No credit card required.' },
  ],
  '/labs': [
    { question: 'What clinical tools does FocusLinks Labs offer?', answer: 'FocusLinks Labs provides AI-powered clinical tools including OD Cam (eye imaging), OptoScholar (AI learning assistant), IPD Measure (interpupillary distance tool), and RAPD Simulator (pupillary defect training).' },
    { question: 'Are FocusLinks Labs tools free?', answer: 'Yes, all clinical tools in FocusLinks Labs are free for registered optometrists and students.' },
    { question: 'Can I use these tools for patient care?', answer: 'FocusLinks Labs tools are designed as educational and clinical assistance tools. Always verify results with standard clinical practices.' },
  ],
  '/academy': [
    { question: 'What courses are available on FocusLinks Academy?', answer: 'FocusLinks Academy offers courses like "Beyond the Phoropter" for advanced optometry training, plus webinars, certifications, and study materials for students and professionals.' },
    { question: 'Do I get a certificate after completing a course?', answer: 'Yes, FocusLinks Academy provides certificates upon successful completion of courses and webinars.' },
  ],
  '/membership': [
    { question: 'Is FocusLinks membership free?', answer: 'Yes, FocusLinks offers a free community membership that includes access to the directory, community feed, labs tools, and academy. Premium plans with additional features are also available.' },
    { question: 'Who can join FocusLinks?', answer: 'FocusLinks is open to optometrists, optometry students, vision science researchers, clinic owners, educators, and anyone in the eye care profession worldwide.' },
  ],
  '/about': [
    { question: 'What is FocusLinks?', answer: 'FocusLinks is the world\'s first global platform for optometrists — connecting vision professionals, students, and organizations across 25+ countries with tools, resources, and community.' },
    { question: 'Is FocusLinks available worldwide?', answer: 'Yes, FocusLinks is a global platform used by optometrists in over 25 countries including India, the US, UK, Australia, Nigeria, UAE, and more.' },
  ],
};

/* ------------------------------------------------------------------ */
/*  Route-level Breadcrumb Data — Pre-built for key pages             */
/* ------------------------------------------------------------------ */

export const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/about': [
    { name: 'Home', url: SITE_URL },
    { name: 'About', url: `${SITE_URL}/about` },
  ],
  '/directory': [
    { name: 'Home', url: SITE_URL },
    { name: 'Directory', url: `${SITE_URL}/directory` },
  ],
  '/professionals': [
    { name: 'Home', url: SITE_URL },
    { name: 'Professionals', url: `${SITE_URL}/professionals` },
  ],
  '/blog': [
    { name: 'Home', url: SITE_URL },
    { name: 'Blog', url: `${SITE_URL}/blog` },
  ],
  '/labs': [
    { name: 'Home', url: SITE_URL },
    { name: 'Labs', url: `${SITE_URL}/labs` },
  ],
  '/academy': [
    { name: 'Home', url: SITE_URL },
    { name: 'Academy', url: `${SITE_URL}/academy` },
  ],
  '/events': [
    { name: 'Home', url: SITE_URL },
    { name: 'Events', url: `${SITE_URL}/events` },
  ],
  '/community': [
    { name: 'Home', url: SITE_URL },
    { name: 'Community', url: `${SITE_URL}/community` },
  ],
  '/feed': [
    { name: 'Home', url: SITE_URL },
    { name: 'Feed', url: `${SITE_URL}/feed` },
  ],
  '/jobs': [
    { name: 'Home', url: SITE_URL },
    { name: 'Jobs', url: `${SITE_URL}/jobs` },
  ],
  '/membership': [
    { name: 'Home', url: SITE_URL },
    { name: 'Membership', url: `${SITE_URL}/membership` },
  ],
  '/dashboard': [
    { name: 'Home', url: SITE_URL },
    { name: 'Dashboard', url: `${SITE_URL}/dashboard` },
  ],
  '/labs/od-cam': [
    { name: 'Home', url: SITE_URL },
    { name: 'Labs', url: `${SITE_URL}/labs` },
    { name: 'OD Cam', url: `${SITE_URL}/labs/od-cam` },
  ],
  '/labs/optoscholar': [
    { name: 'Home', url: SITE_URL },
    { name: 'Labs', url: `${SITE_URL}/labs` },
    { name: 'OptoScholar', url: `${SITE_URL}/labs/optoscholar` },
  ],
  '/labs/ipd-measure': [
    { name: 'Home', url: SITE_URL },
    { name: 'Labs', url: `${SITE_URL}/labs` },
    { name: 'IPD Measure', url: `${SITE_URL}/labs/ipd-measure` },
  ],
  '/labs/rapd-simulator': [
    { name: 'Home', url: SITE_URL },
    { name: 'Labs', url: `${SITE_URL}/labs` },
    { name: 'RAPD Simulator', url: `${SITE_URL}/labs/rapd-simulator` },
  ],
  '/academy/beyond-the-phoropter': [
    { name: 'Home', url: SITE_URL },
    { name: 'Academy', url: `${SITE_URL}/academy` },
    { name: 'Beyond the Phoropter', url: `${SITE_URL}/academy/beyond-the-phoropter` },
  ],
  '/event/eye-q-arena': [
    { name: 'Home', url: SITE_URL },
    { name: 'Events', url: `${SITE_URL}/events` },
    { name: 'Eye Q Arena', url: `${SITE_URL}/event/eye-q-arena` },
  ],
};
