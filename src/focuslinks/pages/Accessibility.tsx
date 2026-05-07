'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import {
  Eye,
  Monitor,
  Keyboard,
  MousePointerClick,
  Smartphone,
  Volume2,
  Type,
  Contrast,
  Zap,
  ShieldCheck,
  Heart,
  Mail,
  MessageSquare,
  ChevronRight,
  Accessibility as AccessibilityIcon,
  Globe,
  CheckCircle2,
  Brain,
  BookOpen,
  Code2,
  Moon,
  Focus,
  Maximize2,
  Hand,
  Info,
} from 'lucide-react';
import { Link } from '../../context/NavigationContext';
import SEO from '../components/SEO';

/* ─── Standards Data ─── */
const standards = [
  {
    title: 'WCAG 2.1 Level AA',
    description:
      'We aim to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards across all pages, ensuring our platform is perceivable, operable, understandable, and robust for all users.',
    icon: ShieldCheck,
  },
  {
    title: 'Semantic HTML',
    description:
      'All pages use proper semantic HTML elements (main, nav, header, section, article, footer) for screen reader compatibility and meaningful document structure.',
    icon: Code2,
  },
  {
    title: 'Keyboard Navigation',
    description:
      'Every interactive element is fully accessible via keyboard. Tab, Enter, Escape, and arrow keys work throughout the platform — no mouse required.',
    icon: Keyboard,
  },
  {
    title: 'Screen Reader Support',
    description:
      'ARIA labels, roles, and descriptions are provided for complex components. Content is structured logically so assistive technologies can convey meaning accurately.',
    icon: Eye,
  },
  {
    title: 'Color Contrast',
    description:
      'Text-to-background contrast ratios meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text). We never rely on color alone to convey information.',
    icon: Contrast,
  },
  {
    title: 'Responsive Design',
    description:
      'All pages are mobile-first and fully responsive, adapting seamlessly from small smartphones to large desktop monitors at any zoom level up to 200%.',
    icon: Smartphone,
  },
  {
    title: 'Focus Indicators',
    description:
      'Visible, high-contrast focus rings and indicators are provided for all interactive elements during keyboard navigation, so users always know where they are on the page.',
    icon: Focus,
  },
  {
    title: 'Reduced Motion Support',
    description:
      'We respect the prefers-reduced-motion media query. Users who experience motion sensitivity can disable animations while retaining full access to all content and functionality.',
    icon: Zap,
  },
];

/* ─── Assistive Technologies ─── */
const assistiveTechs = [
  { name: 'NVDA', description: 'Free screen reader for Windows' },
  { name: 'VoiceOver', description: 'Built-in macOS & iOS screen reader' },
  { name: 'Chrome Accessibility', description: 'Chrome DevTools accessibility panel' },
  { name: 'Firefox Inspector', description: 'Firefox accessibility inspector' },
  { name: 'Keyboard Nav', description: 'Full Tab/Enter/Escape navigation' },
  { name: 'Zoom Text', description: 'Browser and OS text magnification' },
  { name: 'High Contrast', description: 'Windows High Contrast Mode' },
  { name: 'Reduced Motion', description: 'prefers-reduced-motion support' },
];

/* ─── Ongoing Efforts ─── */
const ongoingEfforts = [
  'Conducting quarterly accessibility audits across all platform pages',
  'Testing with popular screen readers (NVDA, JAWS, VoiceOver) on every release',
  'Improving alt text coverage and quality for all user-uploaded images',
  'Adding skip-to-content navigation links on every page',
  'Implementing ARIA live regions for dynamic content updates (notifications, chat)',
  'Enhancing form error messages with descriptive, screen-reader-friendly feedback',
  'Expanding keyboard navigation testing across all interactive components',
  'Automating accessibility checks in our continuous integration pipeline',
];

/* ─── Accessibility Features on FocusLinks ─── */
const platformFeatures = [
  {
    icon: Keyboard,
    title: 'Keyboard Navigation',
    description:
      'Use Tab to move between interactive elements, Enter to activate buttons and links, Escape to close modals, and arrow keys for menus and carousels.',
  },
  {
    icon: BookOpen,
    title: 'Skip to Content',
    description:
      'A "Skip to main content" link appears when you press Tab at the top of any page, letting you bypass navigation and jump directly to the content.',
  },
  {
    icon: Eye,
    title: 'Alt Text on Images',
    description:
      'All meaningful images include descriptive alternative text. Decorative images are marked appropriately so screen readers skip them.',
  },
  {
    icon: AccessibilityIcon,
    title: 'ARIA Labels',
    description:
      'Complex interactive components — dialogs, dropdowns, tabs, tooltips — include ARIA labels, roles, and live regions for clear screen reader announcements.',
  },
  {
    icon: Moon,
    title: 'Dark Mode',
    description:
      'A built-in dark mode toggle provides comfortable reading in low-light environments and reduces eye strain during extended use of clinical tools.',
  },
  {
    icon: Maximize2,
    title: 'Responsive Design',
    description:
      'Every page adapts fluidly to any screen size — from a compact phone to a large desktop monitor — with layouts that remain usable and readable at every breakpoint.',
  },
  {
    icon: Type,
    title: 'Font Size Flexibility',
    description:
      'The platform respects browser font-size settings and supports zoom levels up to 200% without loss of content or functionality.',
  },
  {
    icon: Focus,
    title: 'Focus Indicators',
    description:
      'All interactive elements display clear, visible focus outlines during keyboard navigation, so you always know which element is currently active.',
  },
];

/* ─── Animation variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: (startDelay: number) => ({
    transition: { staggerChildren: 0.06, delayChildren: startDelay },
  }),
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Accessibility() {
  const standardsRef = useRef<HTMLDivElement>(null);
  const standardsInView = useInView(standardsRef, { once: true, margin: '-60px' });

  const techRef = useRef<HTMLDivElement>(null);
  const techInView = useInView(techRef, { once: true, margin: '-60px' });

  const effortsRef = useRef<HTMLDivElement>(null);
  const effortsInView = useInView(effortsRef, { once: true, margin: '-60px' });

  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: '-60px' });

  return (
    <>
    <SEO title="Accessibility" description="FocusLinks accessibility statement and commitment to inclusive design." keywords="accessibility, inclusive design, WCAG" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-slate-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-slate-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-sm font-semibold mb-6 border border-white/15">
              <Heart className="w-4 h-4 text-rose-400" />
              Inclusivity First
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Accessibility{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Statement
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              FocusLinks is committed to making our platform accessible to everyone — including people with disabilities. Accessibility is not an afterthought; it is a core part of how we design, build, and maintain our community platform.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* ─── What is Accessibility? Section ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={fadeInUp}
          className="-mt-10 relative z-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 sm:p-8 lg:p-10 mb-12"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                What is Accessibility?
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                Understanding web accessibility and why it matters
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              <span className="font-semibold text-slate-900 dark:text-white">Web accessibility</span> means designing and developing websites so that everyone can use them — regardless of their abilities or disabilities. An accessible website ensures that people who are blind, have low vision, are deaf, have motor impairments, have cognitive or learning disabilities, or are using their device in challenging conditions can all perceive, understand, navigate, and interact with the content effectively.
            </p>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Accessibility matters because the web is a fundamental resource for education, employment, healthcare, commerce, and community. When websites are not accessible, millions of people are excluded from participating fully in society. Consider the range of disabilities it addresses:{' '}
              <span className="font-medium text-slate-800 dark:text-gray-200">visual</span> (blindness, low vision, color blindness),{' '}
              <span className="font-medium text-slate-800 dark:text-gray-200">motor</span> (limited dexterity, paralysis, tremors),{' '}
              <span className="font-medium text-slate-800 dark:text-gray-200">auditory</span> (deafness, hearing loss),{' '}
              <span className="font-medium text-slate-800 dark:text-gray-200">cognitive</span> (dyslexia, ADHD, autism, memory impairments), and even{' '}
              <span className="font-medium text-slate-800 dark:text-gray-200">situational</span> limitations (a broken arm, bright sunlight, a noisy environment, or using a phone with one hand).
            </p>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              For an optometry community platform like FocusLinks, accessibility carries a special significance. Our members are eye care professionals and students — people who dedicate their careers to preserving and improving human vision. It would be deeply ironic — and unacceptable — for our own digital tools to be inaccessible to the very populations our members serve. By leading with accessibility, we demonstrate the values our community stands for.
            </p>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Several legal and international standards guide our work:{' '}
              <span className="font-semibold text-slate-800 dark:text-gray-200">WCAG 2.1</span> (Web Content Accessibility Guidelines) provides the technical framework, while laws like the{' '}
              <span className="font-semibold text-slate-800 dark:text-gray-200">Americans with Disabilities Act (ADA)</span> and{' '}
              <span className="font-semibold text-slate-800 dark:text-gray-200">Section 508</span> of the Rehabilitation Act establish legal requirements. We aim not just to comply, but to exceed these standards wherever possible.
            </p>
          </div>

          {/* Disability types visual cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            {[
              { icon: Eye, label: 'Visual', desc: 'Blindness, low vision, color blindness' },
              { icon: Hand, label: 'Motor', desc: 'Limited dexterity, paralysis' },
              { icon: Volume2, label: 'Auditory', desc: 'Deafness, hearing loss' },
              { icon: Brain, label: 'Cognitive', desc: 'Dyslexia, ADHD, autism' },
              { icon: Smartphone, label: 'Situational', desc: 'Injuries, environment, device limits' },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                  <Icon className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-gray-200">{label}</span>
                <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">{desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Our Standards Grid ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.15}
          variants={fadeInUp}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold mb-4 border border-gray-200 dark:border-slate-700 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Standards &amp; Compliance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Our Accessibility Standards
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm sm:text-base">
              Eight core standards that guide every design and engineering decision on FocusLinks.
            </p>
          </div>

          <div ref={standardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {standards.map((standard, i) => {
              const StdIcon = standard.icon;
              return (
                <motion.div
                  key={standard.title}
                  custom={standardsInView ? 0.05 * i : 10}
                  variants={fadeInUp}
                  initial="hidden"
                  animate={standardsInView ? 'visible' : 'hidden'}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                      <StdIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {standard.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                        {standard.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ─── Assistive Technologies We Test With ─── */}
        <motion.div
          ref={techRef}
          initial="hidden"
          animate={techInView ? 'visible' : 'hidden'}
          custom={0.1}
          variants={fadeInUp}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 lg:p-10 mb-12"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Assistive Technologies We Test With
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                We regularly validate our platform against a range of assistive technologies and browser accessibility tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {assistiveTechs.map((tech) => (
              <div
                key={tech.name}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
                <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                  {tech.name}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 leading-snug">
                  {tech.description}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Ongoing Efforts ─── */}
        <motion.div
          ref={effortsRef}
          initial="hidden"
          animate={effortsInView ? 'visible' : 'hidden'}
          custom={0.1}
          variants={fadeInUp}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-800/30 p-6 sm:p-8 lg:p-10 mb-12"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Ongoing Efforts
              </h2>
              <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                Accessibility is a continuous journey. Here is what we are actively working on.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ongoingEfforts.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── Accessibility Features on FocusLinks ─── */}
        <motion.div
          ref={featuresRef}
          className="mb-12"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeInUp}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold mb-4 border border-gray-200 dark:border-slate-700 shadow-sm">
              <MousePointerClick className="w-3.5 h-3.5 text-cyan-500" />
              What You Can Do
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Accessibility Features on FocusLinks
            </h2>
            <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-xl mx-auto text-sm sm:text-base">
              Concrete features available to all users right now to make your experience on FocusLinks comfortable and productive.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            custom={0.15}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {platformFeatures.map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={staggerItem}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 transition-colors">
                      <FeatureIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* ─── Report Accessibility Issues ─── */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={fadeInUp}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 lg:p-10 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Report Accessibility Issues
          </h2>
          <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-lg mx-auto leading-relaxed">
            If you encounter any accessibility barriers while using FocusLinks, please let us know. We take all feedback seriously and will work to resolve issues promptly. Your input helps us build a better platform for everyone.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contactus"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold text-sm rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Us
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:hello@focuslinks.in"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Mail className="w-4 h-4" />
              hello@focuslinks.in
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  </>
  );
}
