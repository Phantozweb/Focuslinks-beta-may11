'use client';
import React from 'react';
import { Link } from '../../context/NavigationContext';
import {
  GraduationCap,
  Clock,
  Award,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Target,
  Star,
  PlayCircle,
  ChevronRight,
  Sparkles,
  Flame,
  Rocket,
  CheckCircle2,
  Eye,
  Lightbulb,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

const courses = [
  {
    id: 'beyond-the-phoropter',
    title: 'Beyond the Phoropter',
    subtitle: 'Redefining the Role of the Modern Optometrist',
    description: 'A masterclass on professional identity, clinical authority, and positioning for optometrists who want to be seen as healthcare professionals — not just "the person who prescribes glasses."',
    instructor: 'FocusLinks Academy',
    duration: '1 Hour',
    level: 'Advanced',
    modules: 4,
    path: '/academy/beyond-the-phoropter',
    badge: 'Masterclass',
    badgeColor: 'bg-blue-600',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    stats: { enrolled: '250+', rating: 4.9, reviews: 48 },
    tags: ['Professional Identity', 'Clinical Authority', 'Visibility Strategy'],
    outcomes: [
      'Understand the "Optometrist Identity Gap"',
      'Articulate the real scope of optometry',
      'Build professional visibility and confidence',
    ],
  },
  {
    id: 'coming-soon-2',
    title: 'Contact Lens Masterclass',
    subtitle: 'Advanced Fitting Techniques & Troubleshooting',
    description: 'Deep dive into specialty lens fitting including ortho-K, scleral lenses, and myopia management. Learn troubleshooting frameworks from complex clinical cases.',
    instructor: 'FocusLinks Academy',
    duration: 'Coming Soon',
    level: 'Intermediate',
    modules: 6,
    path: null,
    badge: 'Coming Soon',
    badgeColor: 'bg-slate-500',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    stats: { enrolled: '—', rating: '—', reviews: 0 },
    tags: ['Contact Lens', 'Ortho-K', 'Myopia Management'],
    outcomes: [
      'Master specialty lens fitting protocols',
      'Troubleshoot complex clinical scenarios',
    ],
  },
  {
    id: 'coming-soon-3',
    title: 'Pediatric Optometry Essentials',
    subtitle: 'Children\'s Eye Care from Screening to Management',
    description: 'Comprehensive guide to pediatric eye examinations, amblyopia management, and binocular vision disorders commonly seen in clinical practice.',
    instructor: 'FocusLinks Academy',
    duration: 'Coming Soon',
    level: 'Beginner to Intermediate',
    modules: 5,
    path: null,
    badge: 'Coming Soon',
    badgeColor: 'bg-slate-500',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    stats: { enrolled: '—', rating: '—', reviews: 0 },
    tags: ['Pediatric', 'Amblyopia', 'Binocular Vision'],
    outcomes: [
      'Conduct thorough pediatric eye exams',
      'Manage common childhood vision disorders',
    ],
  },
];

const features = [
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: 'Expert-Led Content',
    desc: 'Masterclasses designed by leading optometry professionals and educators.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Verified Certification',
    desc: 'Earn FL Credits and official certificates upon successful completion.',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Structured Curriculum',
    desc: 'Modular courses with clear learning outcomes and practical takeaways.',
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: 'Actionable Skills',
    desc: 'Real-world clinical and professional development you can apply immediately.',
  },
];

const roadmap = [
  {
    date: 'December 2024',
    phase: 'The Spark',
    icon: <Flame className="w-5 h-5" />,
    color: 'bg-amber-500',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    desc: 'The idea was born — to build a dedicated career development platform for optometrists, addressing the profession\'s need for structured, expert-led continuing education and professional growth resources.',
  },
  {
    date: 'Early 2025',
    phase: 'Research & Design',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    desc: 'Community needs assessment, curriculum planning, and platform architecture. Conducted surveys with 200+ optometrists to identify the most impactful topics for career advancement.',
  },
  {
    date: 'Mid 2025',
    phase: 'Content Development',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    desc: 'First masterclass curriculum developed in collaboration with clinical experts. Built modular course structure with clear learning outcomes, practical applications, and certification framework.',
  },
  {
    date: 'October 2025',
    phase: 'Official Launch',
    icon: <Rocket className="w-5 h-5" />,
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    desc: 'FocusLinks Academy officially launched with "Beyond the Phoropter" as the inaugural masterclass. Opened enrollment to the global FocusLinks community of 500+ optometrists and students.',
  },
  {
    date: '2026 & Beyond',
    phase: 'Expansion',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-slate-600',
    borderColor: 'border-slate-400',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    desc: 'Expanding course library with Contact Lens Masterclass, Pediatric Optometry Essentials, and more. Building partnerships with institutions and industry leaders for accredited certification programs.',
  },
];

export default function Academy() {
  const availableCourses = courses.filter((c) => c.path !== null);
  const comingSoonCourses = courses.filter((c) => c.path === null);

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {/* Locked Content - Blurred */}
      <div className="blur-[8px] select-none pointer-events-none">
      <SEO title="FocusLinks Academy" description="Learn from leading optometry experts through masterclasses, courses, and educational resources at the FocusLinks Academy." keywords="optometry academy, eye care courses, optometry education, clinical training" />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Official FocusLinks Program
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              FocusLinks
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Academy
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              The official career development program by FocusLinks for optometrists.
              Masterclasses, certifications, and professional growth — built by the community, for the community.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-12"
          >
            {[
              { value: '1', label: 'Active Masterclass' },
              { value: '250+', label: 'Enrolled Members' },
              { value: '4.9', label: 'Average Rating' },
              { value: 'Oct 2025', label: 'Launched' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-slate-400 font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 lg:py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
                <Eye className="w-3.5 h-3.5" />
                About the Academy
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
                Career Development for the Next Generation of Optometrists
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                FocusLinks Academy is the <strong className="text-slate-900">official educational arm</strong> of the FocusLinks platform — dedicated exclusively to the career development and professional advancement of optometrists worldwide.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Our masterclasses go beyond clinical knowledge. We address the full spectrum of professional growth — from clinical authority and patient communication to personal branding, career positioning, and leadership within the optometry community.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Every course is designed with input from practicing optometrists and educators, ensuring content that is clinically relevant, professionally transformative, and immediately applicable in real-world practice.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <GraduationCap className="w-5 h-5" />, label: 'Career Development', desc: 'Structured paths for professional advancement at every stage.' },
                  { icon: <Award className="w-5 h-5" />, label: 'FL Certification', desc: 'Verified credentials recognized across the FocusLinks community.' },
                  { icon: <Target className="w-5 h-5" />, label: 'Clinical Excellence', desc: 'Evidence-based content rooted in real-world optometry practice.' },
                  { icon: <TrendingUp className="w-5 h-5" />, label: 'Professional Growth', desc: 'Skills that elevate your career beyond the clinical setting.' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                      {item.icon}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.label}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap / Timeline */}
      <section className="py-12 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Rocket className="w-3.5 h-3.5 text-blue-500" />
              Our Journey
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
              Academy Roadmap
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              From a spark of an idea to an official career development program for optometrists worldwide.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-8 sm:space-y-10">
              {roadmap.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative pl-14 sm:pl-20"
                >
                  {/* Dot on timeline */}
                  <div className={`absolute left-3 sm:left-5 top-1 w-5 h-5 rounded-full ${item.color} border-4 border-white shadow-sm z-10`} />

                  <div className={`bg-white rounded-2xl p-5 sm:p-6 border ${i === roadmap.length - 1 ? 'border-slate-200' : 'border-slate-100'} shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${item.bgColor} ${item.textColor} text-xs font-bold`}>
                        {item.icon}
                        {item.phase}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-white border-y border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{f.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Courses */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Available Courses
              </h2>
            </div>
            <p className="text-slate-500 mb-8 max-w-xl">
              Enroll now and start learning. Each course includes structured modules, real-world applications, and official certification.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {availableCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link to={course.path!} className="block group">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${course.gradient} p-6 sm:p-8 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative z-10">
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm mb-4">
                          <GraduationCap className="w-3 h-3" />
                          {course.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mb-1 group-hover:translate-x-1 transition-transform">
                          {course.title}
                        </h3>
                        <p className="text-white/70 text-sm font-medium">{course.subtitle}</p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 sm:p-8">
                      <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-3">
                        {course.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-5 pb-5 border-b border-slate-100">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span className="font-medium">{course.modules} Modules</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span className="font-medium">{course.level}</span>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <p className="text-lg font-black text-slate-900">{course.stats.enrolled}</p>
                          <p className="text-[11px] text-slate-400 font-medium">Enrolled</p>
                        </div>
                        <div className="text-center border-x border-slate-100">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <p className="text-lg font-black text-slate-900">{course.stats.rating}</p>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">{course.stats.reviews} Reviews</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">Certified</p>
                        </div>
                      </div>

                      {/* Outcomes */}
                      <div className="mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Outcomes</p>
                        <ul className="space-y-1.5">
                          {course.outcomes.map((outcome) => (
                            <li key={outcome} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400 font-medium">By {course.instructor}</span>
                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-sm group-hover:gap-2.5 transition-all">
                          View Course
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      {comingSoonCourses.length > 0 && (
        <section className="py-12 lg:py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-slate-400" />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Coming Soon
                </h2>
              </div>
              <p className="text-slate-500 mb-8 max-w-xl">
                New courses are in development to expand the Academy's career development catalog.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comingSoonCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${course.gradient}`} />
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4">
                    <Clock className="w-3 h-3" />
                    {course.badge}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{course.title}</h3>
                  <p className="text-slate-500 text-sm mb-3">{course.subtitle}</p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-500 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
              Invest in Your Professional Growth
            </h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto">
              Join hundreds of optometrists advancing their careers through FocusLinks Academy's official certification programs and expert-led masterclasses.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/membership">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                  Join FocusLinks
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/contactus">
                <button className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-2">
                  Suggest a Course Topic
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* End Locked Content */}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px]">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">Coming Soon</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm max-w-md mx-auto">Academy access is currently restricted. Stay tuned for updates!</p>
        </div>
      </div>
    </div>
  );
}
