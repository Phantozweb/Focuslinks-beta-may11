'use client';
import { Link } from '../../context/NavigationContext';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import {
  ArrowLeft,
  FileText,
  UserPlus,
  Users,
  Scale,
  ShieldAlert,
  AlertTriangle,
  Ban,
  Gavel,
  RefreshCcw,
  Mail,
  ChevronRight,
  Home,
  ListChecks,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import SEO from '../components/SEO';

const sections = [
  {
    id: 'acceptance-of-terms',
    icon: <CheckCircle className="w-5 h-5" />,
    title: 'Acceptance of Terms',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    paragraphs: [
      'By accessing or using the FocusLinks platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"), along with our Privacy Policy, which is incorporated herein by reference. If you do not agree with any part of these Terms, you must not use the Platform. These Terms constitute a legally binding agreement between you ("User," "you," or "your") and FocusLinks.',
      'FocusLinks reserves the right to modify or update these Terms at any time. Continued use of the Platform following any changes constitutes acceptance of the revised Terms. We will make reasonable efforts to notify registered users of material changes, but it is your responsibility to review these Terms periodically. The most current version will always be available on this page.',
      'By creating an account, participating in community features, using our clinical tools, or attending events through the Platform, you represent that you are at least 18 years of age (or have parental consent if under 18), that you are an eye care professional, student, or affiliated industry member, and that you have the legal capacity to enter into these Terms.',
    ],
  },
  {
    id: 'user-accounts',
    icon: <UserPlus className="w-5 h-5" />,
    title: 'User Accounts',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    paragraphs: [
      'To access certain features of FocusLinks, you must create a user account. When registering, you agree to provide accurate, current, and complete information, including your real name, professional credentials, and contact details. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      'You may not create multiple accounts, impersonate another person or entity, or use a false identity. Student members must accurately represent their enrollment status and educational institution. Practitioner members must maintain current and valid professional credentials as displayed on their profile. Misrepresentation of credentials or identity may result in immediate account suspension.',
      'If you become aware of any unauthorized use of your account or any security breach, you must notify us immediately by contacting our support team. FocusLinks will not be liable for any loss or damage arising from your failure to protect your account credentials. You may delete your account at any time through your account settings, subject to any obligations we may have to retain certain information as described in our Privacy Policy.',
    ],
  },
  {
    id: 'community-guidelines',
    icon: <Users className="w-5 h-5" />,
    title: 'Community Guidelines',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    paragraphs: [
      'FocusLinks is a professional community dedicated to advancing eye care worldwide. All members are expected to conduct themselves with professionalism, integrity, and respect. This includes using respectful language in discussions, providing constructive feedback, and fostering a supportive environment for colleagues, students, and industry partners across all community features including the feed, directory, and events.',
      'The following activities are strictly prohibited: posting or sharing patient-identifiable information without proper authorization; engaging in harassment, bullying, discrimination, or hate speech; promoting or advertising products/services without prior authorization; sharing misleading clinical information; attempting to gain unauthorized access to other members\' accounts or data; and using the Platform for any unlawful purpose. Violations may result in content removal, account suspension, or permanent ban.',
      'When participating in community discussions, forums, or the Eye Q Arena, you retain ownership of the content you create. However, by posting on the Platform, you grant FocusLinks a non-exclusive, worldwide, royalty-free license to display, distribute, and store your content for the purpose of operating the community. This license ends when you delete the content or your account.',
    ],
  },
  {
    id: 'intellectual-property',
    icon: <Scale className="w-5 h-5" />,
    title: 'Intellectual Property',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    paragraphs: [
      'The FocusLinks platform, including its design, logo, branding, clinical tools (OD CAM, OptoScholar, IPD Measure Pro, RAPD Simulator), source code, documentation, and all other content, is the intellectual property of FocusLinks and is protected by applicable copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works from, or commercially exploit any part of the Platform without prior written consent.',
      'Third-party content displayed on the Platform, including research articles, clinical images, and educational materials, remains the property of their respective owners. FocusLinks makes no claim to ownership of user-generated content posted by community members. Users are solely responsible for ensuring they have the right to share any content they post and that it does not infringe on the intellectual property rights of others.',
      'You may share links to FocusLinks content on social media and other platforms for non-commercial purposes. Any use of the FocusLinks name, logo, or branding in external materials requires prior written approval. Academic citations of content found through OptoScholar or other research tools should follow standard academic citation practices.',
    ],
  },
  {
    id: 'content-disclaimer',
    icon: <ShieldAlert className="w-5 h-5" />,
    title: 'Content Disclaimer',
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    paragraphs: [
      'The FocusLinks platform serves as a professional networking and educational resource for eye care professionals. Content shared by community members — including clinical discussions, articles, and event presentations — represents the views of individual authors and does not necessarily reflect the opinions or positions of FocusLinks. No content on the Platform should be interpreted as professional medical advice.',
      'Our AI-powered clinical tools, including OD CAM (visual impairment simulator), OptoScholar (research engine), IPD Measure Pro, and the RAPD Simulator, are designed as educational aids and practice tools. They are not intended to replace professional clinical judgment, diagnostic procedures, or treatment decisions. Practitioners should always use their own clinical expertise and follow established protocols when making patient care decisions.',
      'While we strive to ensure the accuracy and quality of content on the Platform, we do not guarantee that all information is complete, current, or error-free. FocusLinks disclaims all warranties, express or implied, regarding the Platform\'s content, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
    ],
  },
  {
    id: 'limitation-of-liability',
    icon: <AlertTriangle className="w-5 h-5" />,
    title: 'Limitation of Liability',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    paragraphs: [
      'To the fullest extent permitted by applicable law, FocusLinks, its directors, officers, employees, agents, volunteers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or professional opportunities, arising out of or in connection with your use of or inability to use the Platform.',
      'FocusLinks does not accept liability for any content posted by community members, the accuracy of information provided through our tools or research engine, any interruptions or errors in service, or any unauthorized access to or alteration of your data. Your use of the Platform and any reliance on its content is at your sole risk.',
      'In jurisdictions that do not allow the exclusion or limitation of liability for consequential or incidental damages, our liability shall be limited to the greatest extent permitted by law. Any claims against FocusLinks must be brought within one (1) year of the event giving rise to the claim.',
    ],
  },
  {
    id: 'termination',
    icon: <Ban className="w-5 h-5" />,
    title: 'Termination',
    color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    paragraphs: [
      'FocusLinks reserves the right to suspend or terminate your account and access to the Platform at any time, with or without cause, and with or without notice. Grounds for termination include but are not limited to: violation of these Terms, violation of community guidelines, fraudulent or misrepresented credentials, inappropriate conduct, or extended periods of inactivity.',
      'You may terminate your account at any time by accessing your account settings or contacting our support team. Upon termination, your right to use the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination — including intellectual property rights, disclaimers, limitations of liability, and governing law — will continue to apply.',
      'FocusLinks reserves the right to remove any content that violates these Terms or community guidelines without prior notice. In cases of severe violations, such as sharing patient data or engaging in harassment, we may report the matter to relevant professional regulatory bodies as required by law or professional ethics.',
    ],
  },
  {
    id: 'governing-law',
    icon: <Gavel className="w-5 h-5" />,
    title: 'Governing Law',
    color: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
    paragraphs: [
      'These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which FocusLinks operates, without regard to its conflict of law principles. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in that jurisdiction.',
      'Before initiating any formal legal proceedings, you agree to attempt to resolve any dispute with FocusLinks through good-faith negotiation. We encourage open communication and will make reasonable efforts to address your concerns before any escalation. FocusLinks is committed to fair and transparent resolution of any disagreements with our community members.',
      'If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent.',
    ],
  },
  {
    id: 'changes-to-terms',
    icon: <RefreshCcw className="w-5 h-5" />,
    title: 'Changes to These Terms',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    paragraphs: [
      'FocusLinks reserves the right to revise these Terms of Service at any time. When we make changes, we will update the "Last Updated" date at the top of this page. For material changes that may affect your rights, we will provide additional notice through email or a prominent announcement on the Platform at least 30 days before the changes take effect.',
      'Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms. If you do not agree with the changes, you should discontinue use of the Platform and, if applicable, delete your account. We encourage you to review these Terms periodically to stay informed of any updates.',
    ],
  },
  {
    id: 'contact',
    icon: <Mail className="w-5 h-5" />,
    title: 'Contact',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
    paragraphs: [
      'If you have any questions, concerns, or feedback regarding these Terms of Service, please do not hesitate to reach out. You can contact our team through the FocusLinks Contact Us page or by emailing legal@focuslinks.org.',
      'We value the input of our community members and are committed to maintaining a transparent, fair, and supportive platform for eye care professionals worldwide. We aim to respond to all inquiries within 10 business days.',
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

export default function Terms() {
  const contentRef = useRef(null);
  const isContentInView = useInView(contentRef, { once: true, margin: '-80px' });

  return (
    <>
    <SEO title="Terms of Service" description="FocusLinks terms of service and usage guidelines." keywords="terms of service, terms, usage guidelines, legal" />
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
          <span className="text-slate-900 dark:text-white font-semibold">Terms of Service</span>
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
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-violet-400/15 dark:bg-violet-600/10 rounded-full blur-[60px] animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-amber-400/15 dark:bg-amber-600/10 rounded-full blur-[50px] animate-blob animation-delay-2000" />

          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 mb-6 shadow-sm"
            >
              <FileText className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              Terms of Service
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
            Welcome to <span className="font-semibold text-slate-900 dark:text-white">FocusLinks</span>, the world&apos;s largest digital community for eye care professionals. These Terms of Service govern your use of our platform, including all community features, clinical tools, events, and related services. By using FocusLinks, you agree to abide by these terms and to help us maintain a safe, professional, and supportive environment for optometrists, ophthalmologists, students, and industry partners worldwide.
          </p>
        </motion.div>

        {/* Key Points */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-violet-100 dark:border-violet-800/30 mb-10"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Key Takeaways
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, text: 'Be professional and respectful in all interactions' },
              { icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, text: 'Protect patient privacy — no identifiable data on the platform' },
              { icon: <XCircle className="w-4 h-4 text-red-500" />, text: 'No unauthorized commercial activity or spam' },
              { icon: <XCircle className="w-4 h-4 text-red-500" />, text: 'No misrepresentation of credentials or identity' },
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-gray-400">
                {point.icon}
                <span>{point.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-10"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-slate-400 dark:text-gray-500" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-all group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-600 group-hover:bg-violet-500 transition-colors flex-shrink-0" />
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
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-violet-300/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-8 sm:p-12 text-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <FileText className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Have questions about these terms?
            </h3>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto text-lg">
              We&apos;re committed to transparency. Reach out if anything needs clarification.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contactus"
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-violet-600 font-bold py-3.5 px-8 rounded-2xl hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </Link>
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-white/20 transition-colors hover:-translate-y-0.5 transition-all"
              >
                <ShieldAlert className="w-5 h-5" />
                Privacy Policy
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </>
  );
}
