'use client';
import { Link } from '../../context/NavigationContext';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import SEO from '../components/SEO';
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Globe,
  Cookie,
  UserCheck,
  Baby,
  RefreshCcw,
  Mail,
  ChevronRight,
  Home,
  Database,
  Fingerprint,
} from 'lucide-react';

const sections = [
  {
    id: 'information-we-collect',
    icon: <Database className="w-5 h-5" />,
    title: 'Information We Collect',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    paragraphs: [
      'At FocusLinks, we collect information that you voluntarily provide when creating an account, participating in our community, or using our clinical tools. This includes your name, professional credentials (optometry degree, license number, specialty), email address, institutional affiliation, and a professional headshot. For students, we also collect your educational institution and expected graduation year.',
      'We automatically collect certain technical information when you interact with our platform, including your IP address, browser type, operating system, device identifiers, pages visited, time spent on each page, and referring URLs. This data helps us improve platform performance and deliver a better user experience for eye care professionals worldwide.',
      'When you use our clinical tools such as OD CAM, OptoScholar, or IPD Measure Pro, we may collect anonymized usage data including tool interaction patterns and session durations. No identifiable patient data is ever collected through our platform. Any clinical data you input during use is processed in real-time and is not stored on our servers.',
    ],
  },
  {
    id: 'how-we-use',
    icon: <Eye className="w-5 h-5" />,
    title: 'How We Use Your Information',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    paragraphs: [
      'Your information is used to provide and personalize the FocusLinks community experience. We use your professional profile to power our global directory, help you connect with fellow optometrists and ophthalmologists, and recommend relevant clinical content, events, and networking opportunities based on your specialty and interests.',
      'We use your data to operate and improve our platform, including our AI-powered clinical tools, research engines, and community features. Aggregated, anonymized usage statistics help us understand which features are most valuable to our community and guide our product development decisions.',
      'Your contact information enables us to send important platform notifications, event registration confirmations, security alerts, and — only if you opt in — newsletters about community updates, new clinical tools, and upcoming events such as the Eye Q Arena. You may manage your communication preferences at any time from your account settings.',
    ],
  },
  {
    id: 'information-sharing',
    icon: <Globe className="w-5 h-5" />,
    title: 'Information Sharing',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    paragraphs: [
      'FocusLinks does not sell, trade, or rent your personal information to third parties. Your professional data is shared with other community members only through the directory and profile features that you control. You choose what information is visible on your public profile and can adjust these visibility settings at any time.',
      'We may share limited, non-personally-identifiable information with trusted service providers who help us operate our platform — including hosting providers, analytics services, and email delivery services. These partners are bound by strict data processing agreements and are only permitted to use your data to provide services on behalf of FocusLinks.',
      'We may disclose information if required by applicable law, legal process, or governmental request, or when we believe in good faith that disclosure is necessary to protect the rights of FocusLinks, our users, or the public. In the event of a merger, acquisition, or reorganization, your data may be transferred to the successor entity with continued protection under this policy.',
    ],
  },
  {
    id: 'data-security',
    icon: <Lock className="w-5 h-5" />,
    title: 'Data Security',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    paragraphs: [
      'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. All data transmissions between your device and our servers are encrypted using TLS/SSL protocols. Your password is hashed using bcrypt and is never stored or transmitted in plain text.',
      'Our infrastructure is regularly audited and monitored for potential vulnerabilities. We maintain access controls, server-side request validation, and rate limiting to protect against common web threats. Our clinical tools process sensitive data in secure, isolated environments, and no patient data is persisted beyond the active session.',
      'While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We encourage you to use strong passwords and to contact us immediately if you suspect any unauthorized access to your account.',
    ],
  },
  {
    id: 'cookies',
    icon: <Cookie className="w-5 h-5" />,
    title: 'Cookies & Tracking Technologies',
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    paragraphs: [
      'FocusLinks uses cookies and similar tracking technologies to enhance your browsing experience. Essential cookies are required for platform functionality, including session management, authentication, and security features. These cookies cannot be disabled without impacting your ability to use the platform.',
      'We use analytics cookies (such as those from our privacy-respecting analytics provider) to understand how members interact with our platform — which pages are most visited, how users navigate between features, and where drop-offs may occur. This data is aggregated and does not identify individual users. We do not use advertising cookies or share browsing data with ad networks.',
      'You can manage your cookie preferences through your browser settings. Please note that disabling certain cookies may affect the functionality of features like the global directory, clinical labs, and event registrations. We also use localStorage for interface preferences such as theme selection and dashboard layout, which persist across sessions.',
    ],
  },
  {
    id: 'your-rights',
    icon: <UserCheck className="w-5 h-5" />,
    title: 'Your Rights',
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400',
    paragraphs: [
      'Depending on your jurisdiction, you may have specific rights regarding your personal data. These may include the right to access the personal data we hold about you, the right to request correction of inaccurate information, and the right to request deletion of your data (subject to certain legal obligations we may have to retain it).',
      'You have the right to data portability — you can request a copy of your data in a structured, commonly used format. You also have the right to withdraw consent for data processing where consent is the legal basis, and to object to processing based on legitimate interests. To exercise any of these rights, please contact us using the details provided below.',
      'You can manage much of your data directly through your account settings, including updating your profile information, adjusting privacy settings, managing email preferences, and deleting your account. Upon account deletion, we will remove your personal data from our active systems within 30 days, though anonymized data may be retained for analytical purposes.',
    ],
  },
  {
    id: 'childrens-privacy',
    icon: <Baby className="w-5 h-5" />,
    title: "Children's Privacy",
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
    paragraphs: [
      'FocusLinks is designed for use by eye care professionals, students enrolled in optometry or ophthalmology programs, and industry affiliates. While we welcome student members, our platform is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13.',
      'If we become aware that we have inadvertently collected personal information from a child under 13, we will take immediate steps to delete such information from our servers. If you believe that a child under 13 has provided us with personal information, please contact us so we can take appropriate action.',
      'Student members under the age of 18 who join FocusLinks through their educational institution or independently should have parental or guardian awareness of their participation. We recommend that educational institutions using FocusLinks as part of their curriculum ensure appropriate consent and supervision.',
    ],
  },
  {
    id: 'changes',
    icon: <RefreshCcw className="w-5 h-5" />,
    title: 'Changes to This Policy',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    paragraphs: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes, we will notify you by posting the updated policy on this page with a revised "Last Updated" date and, for significant changes, by sending an email notification to the address associated with your account.',
      'We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information. Your continued use of the FocusLinks platform after any changes to this policy constitutes your acceptance of the updated terms. If you disagree with any changes, you may update your preferences or delete your account as described in the "Your Rights" section above.',
    ],
  },
  {
    id: 'contact-us',
    icon: <Mail className="w-5 h-5" />,
    title: 'Contact Us',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
    paragraphs: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to our team. You can contact us through the FocusLinks Contact Us page or by emailing our Data Protection Officer at privacy@focuslinks.org.',
      'We aim to respond to all privacy-related inquiries within 10 business days. If you are not satisfied with our response, you may have the right to lodge a complaint with your local data protection authority, depending on your jurisdiction and applicable data protection laws.',
    ],
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Privacy() {
  const contentRef = useRef(null);
  const isContentInView = useInView(contentRef, { once: true, margin: '-80px' });

  return (
    <>
    <SEO title="Privacy Policy" description="FocusLinks privacy policy — how we collect, use, and protect your data." keywords="privacy policy, data protection, GDPR" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-sm mb-8"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" /> Home
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600" />
          <Link to="/help-center" className="text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Help Center
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600" />
          <span className="text-slate-900 dark:text-white font-semibold">Privacy Policy</span>
        </motion.nav>

        {/* Back to Help Center */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            to="/help-center"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Help Center
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 relative"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[60px] animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-emerald-400/15 dark:bg-emerald-600/10 rounded-full blur-[50px] animate-blob animation-delay-2000" />

          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 shadow-sm"
            >
              <Shield className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-500 dark:text-gray-400">
              Last updated: January 15, 2025
            </p>
          </div>
        </motion.div>

        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm mb-8"
        >
          <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-base">
            At <span className="font-semibold text-slate-900 dark:text-white">FocusLinks</span>, protecting your privacy and maintaining the trust of our global eye care community is fundamental to our mission. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform, create a professional profile, participate in community discussions, use our clinical tools, or attend events. We are committed to transparency and want you to understand exactly how your data is handled.
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-10"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-slate-400 dark:text-gray-500" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((section, i) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-blue-500 transition-colors flex-shrink-0" />
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <div ref={contentRef} className="space-y-6">
          {sections.map((section, secIdx) => (
            <motion.div
              key={section.id}
              id={section.id}
              custom={secIdx}
              variants={sectionVariants}
              initial="hidden"
              animate={isContentInView ? 'visible' : 'hidden'}
              className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl ${section.color}`}>
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.paragraphs.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-slate-600 dark:text-gray-400 leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-emerald-300/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-8 sm:p-12 text-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Questions about your privacy?
            </h3>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto text-lg">
              We take data protection seriously. Reach out if you have any concerns or want to exercise your rights.
            </p>
            <Link
              to="/contactus"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-blue-600 font-bold py-3.5 px-8 rounded-2xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
