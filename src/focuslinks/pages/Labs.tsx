'use client';
import { Link } from '../../context/NavigationContext';
import { Search, ArrowRight, Smartphone, Sparkles, AlertTriangle, Beaker, Lock, Zap, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';

const tools = [
  {
    id: 'od-cam',
    title: 'OD CAM',
    description: 'Real-time simulator for clinical empathy, student education, and caregiver understanding powered by Focus.Ai V5.5. Experience the world through simulated visual conditions.',
    icon: Smartphone,
    gradient: 'from-rose-500 to-orange-500',
    gradientBg: 'from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30',
    path: '/labs/od-cam',
    status: 'Beta',
    statusColor: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    tag: 'AI Vision',
    tagColor: 'text-amber-500'
  },
  {
    id: 'optoscholar',
    title: 'OptoScholar Research Engine',
    description: 'Specialized clinical search for optometry with 1M+ indexed articles. Find peer-reviewed research, clinical trials, and evidence-based practice resources instantly.',
    icon: Search,
    gradient: 'from-blue-500 to-cyan-500',
    gradientBg: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    path: '/labs/optoscholar',
    status: 'Live',
    statusColor: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    tag: 'Research',
    tagColor: 'text-emerald-500'
  },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let current = 0;
          const step = Math.max(1, Math.floor(target / 30));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            setCount(current);
          }, 40);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
      {count}{suffix}
    </div>
  );
}

export default function Labs() {
  return (
    <>
      <SEO title="Clinical Labs & Tools" description="AI-powered optometry tools including OD CAM, IPD Measure, OptoScholar, and RAPD Simulator." keywords="optometry tools, clinical labs, AI optometry, diagnostic tools" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-white pb-24 pt-12 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -25, 35, 0], y: [0, 30, -30, 0], scale: [1, 0.95, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-400/15 dark:bg-purple-600/8 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 20, -30, 0], y: [0, -20, 40, 0], scale: [1, 1.05, 0.9, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-400/15 dark:bg-emerald-600/8 rounded-full blur-[100px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 pt-8">
          {/* Innovation Lab Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm mb-8 shadow-lg shadow-blue-500/25 uppercase tracking-widest"
          >
            <Beaker className="w-4 h-4" />
            Innovation Lab
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Explore the Future of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
              Optometry
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 dark:text-gray-400 mb-10 leading-relaxed"
          >
            Welcome to our experimental playground. Explore cutting-edge knowledge tools, AI-powered utilities, and beta features designed to elevate your practice.
          </motion.p>

          {/* Stats Counters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-12 mb-10"
          >
            <div className="text-center">
              <AnimatedCounter target={2} suffix=" tools" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1">Available Now</p>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
            <div className="text-center">
              <AnimatedCounter target={1} suffix="M+" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1">Articles Indexed</p>
            </div>
          </motion.div>

          {/* Disclaimer Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-start sm:items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 text-left sm:text-center max-w-2xl mx-auto shadow-sm"
          >
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong className="text-amber-900 dark:text-amber-200">Experimental Notice:</strong> Tools in Labs are actively being tested. They are designed for educational and research purposes and should not replace professional clinical judgment.
            </p>
          </motion.div>
        </div>

        {/* Available Tools Section */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Available Tools</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Launch any tool to get started</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              const isAvailable = tool.status === 'Beta' || tool.status === 'Live';
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 border border-gray-100 dark:border-slate-800 shadow-sm group flex flex-col relative overflow-hidden transition-all duration-500 ${
                    isAvailable
                      ? 'hover:shadow-2xl hover:-translate-y-2 hover:border-gray-200 dark:hover:border-slate-700'
                      : 'opacity-80'
                  }`}
                >
                  {/* Hover gradient glow */}
                  {isAvailable && (
                    <div className={`absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br ${tool.gradient} rounded-full blur-[80px] opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none`} />
                  )}

                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${tool.gradient} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${tool.status === 'Live' ? 'icon-glow-pulse' : ''}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${tool.statusColor}`}>
                        {tool.status}
                      </span>
                      <span className={`text-xs font-medium ${tool.tagColor} flex items-center gap-1`}>
                        <Sparkles className="w-3 h-3" /> {tool.tag}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                      {tool.description}
                    </p>
                  </div>

                  {/* Action */}
                  {isAvailable ? (
                    <Link
                      to={tool.path}
                      className="relative z-10 inline-flex items-center justify-between w-full px-6 py-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 text-gray-900 dark:text-white font-bold hover:from-blue-600 hover:to-indigo-600 hover:text-white border border-gray-200 dark:border-slate-700 hover:border-transparent transition-all duration-300 group/btn overflow-hidden"
                    >
                      <span className="relative z-10">Launch Tool</span>
                      <div className="w-8 h-8 rounded-full bg-gray-200/50 dark:bg-slate-700/50 flex items-center justify-center group-hover/btn:bg-white/20 transition-colors relative z-10">
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ) : (
                    <div className="relative z-10 inline-flex items-center justify-between w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-gray-500 font-bold border border-gray-200 dark:border-slate-700 cursor-not-allowed">
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Under Maintenance
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-3xl p-8 sm:p-10 border border-blue-100 dark:border-blue-900/30">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Have an Idea for a Tool?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">We're always looking for innovative ideas from the optometry community.</p>
            </div>
            <Link
              to="/contactus"
              className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              Submit Idea
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  </>
  );
}
