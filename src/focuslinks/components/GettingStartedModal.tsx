'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  User,
  Search,
  MessageSquare,
  Wrench,
  ArrowRight,
  Check,
} from 'lucide-react';
import { useNavigate } from '../../context/NavigationContext';

const STORAGE_KEY = 'fl_guide_dismissed';

function useIsLoggedIn() {
  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('fl_user');
  };
  const getServerSnapshot = () => false;
  const subscribe = (callback: () => void) => {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  };
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const steps = [
  {
    icon: User,
    title: 'Create Your Profile',
    description: 'Set up your professional profile to be visible in our global directory',
    color: 'text-violet-500 dark:text-violet-400',
    bg: 'bg-violet-100 dark:bg-violet-950/60',
    route: '/membership',
  },
  {
    icon: Search,
    title: 'Explore the Directory',
    description: 'Find and connect with optometrists from around the world',
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    route: '/directory',
  },
  {
    icon: MessageSquare,
    title: 'Join the Community',
    description: 'Participate in discussions, share cases, and learn from peers',
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    route: '/community',
  },
  {
    icon: Wrench,
    title: 'Discover Clinical Tools',
    description: 'Use our AI-powered tools like OD CAM and IPD Measure',
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    route: '/labs',
  },
];

function StepCard({
  step,
  index,
  onClick,
}: {
  step: (typeof steps)[number];
  index: number;
  onClick: () => void;
}) {
  const Icon = step.icon;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.15 + index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 22,
      }}
      onClick={onClick}
      className="w-full text-left flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:border-slate-300/80 dark:hover:border-slate-600/60 transition-colors cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 rounded-2xl"
    >
      {/* Number badge + icon */}
      <div className="relative flex-shrink-0">
        <span className="absolute -top-2 -left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold">
          {index + 1}
        </span>
        <div
          className={`w-11 h-11 rounded-xl ${step.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
        >
          <Icon className={`w-5 h-5 ${step.color}`} />
        </div>
      </div>

      {/* Text */}
      <div className="min-w-0 pt-0.5 flex-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
          {step.title}
        </h4>
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {step.description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="flex-shrink-0 self-center opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
      </div>
    </motion.button>
  );
}

export default function GettingStartedModal() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const isLoggedIn = useIsLoggedIn();
  const navigate = useNavigate();

  // Check if permanently dismissed
  const [isPermanentlyDismissed, setIsPermanentlyDismissed] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR safe
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return true;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  Auto-open on first visit after 2-second delay                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!mounted || isLoggedIn || isPermanentlyDismissed || hasAutoOpened) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasAutoOpened(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [mounted, isLoggedIn, isPermanentlyDismissed, hasAutoOpened]);

  /* ------------------------------------------------------------------ */
  /*  Dismiss helpers                                                    */
  /* ------------------------------------------------------------------ */
  const dismissPermanently = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsPermanentlyDismissed(true);
    setIsOpen(false);
  }, []);

  const dismissTemporarily = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleGetStarted = useCallback(() => {
    // "Get Started" always permanently dismisses
    dismissPermanently();
    navigate('/membership');
  }, [dismissPermanently, navigate]);

  const handleStepClick = useCallback(
    (route: string) => {
      // Clicking a step permanently dismisses and navigates
      dismissPermanently();
      navigate(route);
    },
    [dismissPermanently, navigate]
  );

  const handleDismiss = useCallback(() => {
    // X or backdrop: temporary dismiss, unless "don't show again" is checked
    if (dontShowAgain) {
      dismissPermanently();
    } else {
      dismissTemporarily();
    }
  }, [dontShowAgain, dismissPermanently, dismissTemporarily]);

  const handleOpen = useCallback(() => setIsOpen(true), []);

  // Don't render anything for logged-in users or permanently dismissed
  if (!mounted || isLoggedIn || isPermanentlyDismissed) {
    return null;
  }

  /* ------------------------------------------------------------------ */
  /*  FAB (Floating Action Button) - Only after first auto-open          */
  /* ------------------------------------------------------------------ */
  const fab = (
    <AnimatePresence>
      {hasAutoOpened && !isOpen && (
        <motion.button
          onClick={handleOpen}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 220,
            damping: 20,
          }}
          aria-label="Getting started guide"
          className="fixed bottom-6 left-6 z-[90] w-14 h-14 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/30 dark:shadow-white/10 flex items-center justify-center hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white md:hidden"
        >
          {/* Subtle breathing ring */}
          <span className="absolute inset-0 rounded-full animate-fab-ring bg-slate-900/15 dark:bg-white/15" />
          <Sparkles className="w-6 h-6 relative z-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );

  /* ------------------------------------------------------------------ */
  /*  Modal overlay + content                                            */
  /* ------------------------------------------------------------------ */
  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Centered modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 26,
                mass: 0.8,
              }}
              className="pointer-events-auto w-full max-w-[500px] rounded-3xl overflow-hidden
                bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl
                border border-slate-200/60 dark:border-slate-700/50
                shadow-2xl shadow-slate-900/10 dark:shadow-black/40
                relative"
            >
              {/* Decorative top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-rose-500 to-amber-500" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Body */}
              <div className="p-6 pt-8 pb-4 flex flex-col gap-5">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 22,
                    delay: 0.05,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-violet-500 dark:text-violet-400" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                      Welcome to FocusLinks!
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Here&apos;s how to get started:
                  </p>
                </motion.div>

                {/* Step cards */}
                <div className="flex flex-col gap-3">
                  {steps.map((s, i) => (
                    <StepCard
                      key={s.title}
                      step={s}
                      index={i}
                      onClick={() => handleStepClick(s.route)}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.3 }}
                className="px-6 pb-6 pt-2"
              >
                {/* Don't show again */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer select-none group">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={dontShowAgain}
                    onClick={() => setDontShowAgain((v) => !v)}
                    className={`w-4 h-4 rounded border transition-colors flex items-center justify-center flex-shrink-0 ${
                      dontShowAgain
                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                    }`}
                  >
                    {dontShowAgain && (
                      <Check className="w-3 h-3 text-white dark:text-slate-900" />
                    )}
                  </button>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    Don&apos;t show this again
                  </span>
                </label>

                {/* CTA */}
                <button
                  onClick={handleGetStarted}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {fab}
      {modal}
    </>
  );
}
