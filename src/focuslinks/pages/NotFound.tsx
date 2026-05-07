'use client';

import { Link, useNavigate } from '../../context/NavigationContext';
import { Eye, Home, Search, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

function FloatingDot({ delay, x, y, size, duration }: {
  delay: number;
  x: string;
  y: string;
  size: number;
  duration: number;
}) {
  return (
    <>
    <SEO title="Page Not Found" description="The page you are looking for does not exist on FocusLinks." keywords="404, not found" />
    <motion.div
      className="absolute rounded-full bg-blue-400/20 dark:bg-blue-500/10"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -20, 0],
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  </>
  );
}

export default function NotFound() {
  const navigate = useNavigate();

  const floatingDots = [
    { delay: 0, x: '10%', y: '20%', size: 12, duration: 4 },
    { delay: 0.5, x: '80%', y: '15%', size: 8, duration: 5 },
    { delay: 1, x: '25%', y: '70%', size: 16, duration: 3.5 },
    { delay: 1.5, x: '70%', y: '65%', size: 10, duration: 4.5 },
    { delay: 0.8, x: '50%', y: '30%', size: 6, duration: 6 },
    { delay: 2, x: '15%', y: '50%', size: 14, duration: 3.8 },
    { delay: 0.3, x: '85%', y: '40%', size: 8, duration: 5.2 },
    { delay: 1.2, x: '40%', y: '80%', size: 10, duration: 4.2 },
    { delay: 1.8, x: '60%', y: '10%', size: 6, duration: 5.5 },
    { delay: 0.6, x: '90%', y: '80%', size: 12, duration: 3.6 },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden px-4 py-16">
      {/* Floating background dots */}
      {floatingDots.map((dot, i) => (
        <FloatingDot key={i} {...dot} />
      ))}

      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-purple-50/60 dark:from-blue-950/30 dark:via-transparent dark:to-purple-950/30 pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-[8rem] sm:text-[10rem] font-black leading-none select-none bg-gradient-to-br from-blue-600 via-purple-600 to-rose-500 dark:from-blue-400 dark:via-purple-400 dark:to-rose-400 bg-clip-text text-transparent drop-shadow-sm">
            404
          </h1>
        </motion.div>

        {/* Eye Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="relative inline-flex items-center justify-center -mt-8 mb-6"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 flex items-center justify-center border-2 border-blue-200/60 dark:border-blue-700/40">
              <Eye className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            {/* X mark overlay */}
            <motion.div
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 dark:bg-rose-600 flex items-center justify-center shadow-lg"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-300/40 dark:border-blue-600/30"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3"
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-500 dark:text-gray-400 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            to="/directory"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold text-sm border border-gray-200 dark:border-slate-700 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-4 h-4" />
            Search Directory
          </Link>
        </motion.div>

        {/* Report Issue Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8"
        >
          <Link
            to="/help-center"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Report Issue
          </Link>
        </motion.div>

        {/* Keyboard hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-4 text-xs text-gray-300 dark:text-gray-600"
        >
          Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 font-mono text-[10px]">
            Backspace
          </kbd>{' '}
          to go back
        </motion.p>
      </div>
    </div>
  );
}
