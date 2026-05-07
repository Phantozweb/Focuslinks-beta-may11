'use client';

import { Link, useNavigate } from '../../context/NavigationContext';
import { Eye, ArrowRight, Users, Globe, Award, BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

function FloatingOrb({ delay, x, y, size, color }: {
  delay: number;
  x: string;
  y: string;
  size: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-xl pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
      animate={{
        y: [0, -15, 0],
        x: [0, 8, 0],
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function FloatingShape({ delay, x, y, type, color }: {
  delay: number;
  x: string;
  y: string;
  type: 'circle' | 'square' | 'triangle' | 'diamond';
  color: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, color: color }}
      animate={{
        y: [0, -20, 5, -10, 0],
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 0.95, 1.05, 1],
        opacity: [0.15, 0.3, 0.2, 0.35, 0.15],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {type === 'circle' && <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: color }} />}
      {type === 'square' && <div className="w-5 h-5 rounded-sm border-2 rotate-45" style={{ borderColor: color }} />}
      {type === 'triangle' && (
        <div className="w-0 h-0" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `14px solid ${color}` }} />
      )}
      {type === 'diamond' && <div className="w-4 h-4 rotate-45 border-2" style={{ borderColor: color }} />}
    </motion.div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Users,
      title: 'Global Network',
      description: 'Connect with optometrists and eye care professionals from around the world.',
    },
    {
      icon: BookOpen,
      title: 'Clinical Resources',
      description: 'Access exclusive clinical tools, research papers, and educational content.',
    },
    {
      icon: Globe,
      title: 'Events & Webinars',
      description: 'Join live events, earn certificates, and stay updated with the latest advances.',
    },
    {
      icon: Award,
      title: 'Professional Growth',
      description: 'Showcase your expertise and advance your career in optometry.',
    },
  ];

  return (
    <>
    <SEO title="Join FocusLinks" description="Apply for FocusLinks membership to join the world's premier global platform for optometrists." keywords="join, register, membership, focuslinks, optometry, apply" />
    <div className="min-h-[calc(100vh-4rem)] flex -mt-16">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Floating orbs */}
        <FloatingOrb delay={0} x="10%" y="20%" size={120} color="rgba(59,130,246,0.15)" />
        <FloatingOrb delay={1} x="70%" y="15%" size={80} color="rgba(147,51,234,0.12)" />
        <FloatingOrb delay={0.5} x="20%" y="70%" size={100} color="rgba(59,130,246,0.1)" />
        <FloatingOrb delay={1.5} x="80%" y="65%" size={60} color="rgba(147,51,234,0.08)" />

        {/* Animated floating geometric shapes */}
        <FloatingShape delay={0} x="8%" y="12%" type="circle" color="rgba(59,130,246,0.25)" />
        <FloatingShape delay={1.5} x="82%" y="8%" type="square" color="rgba(147,51,234,0.2)" />
        <FloatingShape delay={3} x="15%" y="75%" type="diamond" color="rgba(59,130,246,0.2)" />
        <FloatingShape delay={4.5} x="70%" y="70%" type="triangle" color="rgba(147,51,234,0.18)" />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <Eye className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Join FocusLinks
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-6" />
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed max-w-sm mx-auto">
              Become part of the world&apos;s premier optometry community
            </p>
          </motion.div>

          {/* Benefits list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 space-y-5 max-w-sm mx-auto"
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
                className="flex items-start gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <benefit.icon className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-100">{benefit.title}</p>
                  <p className="text-xs text-blue-100/50 mt-0.5 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Join Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 bg-gray-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10 glass-panel animate-glow-border rounded-2xl"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
              <Eye className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Apply for Membership
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              To join FocusLinks, submit a membership application
            </p>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mb-6 p-5 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800/40 rounded-xl"
          >
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-3">
              What you&apos;ll get with your membership:
            </h3>
            <ul className="space-y-2">
              {[
                'Unique FL Membership ID for instant access',
                'Professional profile on the global directory',
                'Access to webinars, courses & certificates',
                'Community forums & networking tools',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                  className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Apply Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <button
              type="button"
              onClick={() => navigate('/membership-application')}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              Apply for Membership
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Or browse membership page */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-4 text-center"
          >
            <Link
              to="/membership"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Learn more about membership →
            </Link>
          </motion.div>

          {/* Bottom Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already a member?{' '}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </>
  );
}
