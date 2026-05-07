'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  Compass,
  Rss,
  Keyboard,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TOUR_KEY = 'fl_tour_completed';

interface TourStep {
  id: string;
  type: 'modal' | 'tooltip';
  title: string;
  description: string;
  Icon: React.ElementType;
  targetSelector?: string;
  actionLabel?: string;
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    type: 'modal',
    title: 'Welcome to FocusLinks!',
    description:
      "Your gateway to the world's most vibrant optometry community. Connect with eye care professionals, access clinical resources, and advance your career — all in one place.",
    Icon: Eye,
    actionLabel: "Let's take a quick tour",
  },
  {
    id: 'navigation',
    type: 'tooltip',
    title: 'Explore the Community',
    description:
      'Navigate through Community, Blog, Events, Academy, and more using the main navigation bar. Everything you need is just a click away.',
    Icon: Compass,
    targetSelector: 'nav.sticky',
  },

  {
    id: 'feed',
    type: 'tooltip',
    title: 'Stay Connected',
    description:
      'Browse the community feed with posts, case discussions, polls, and bookmark content that matters to you.',
    Icon: Rss,
  },
  {
    id: 'command-palette',
    type: 'tooltip',
    title: 'Quick Navigation',
    description:
      'Press \u2318K (Mac) or Ctrl+K (Windows) to open the command palette and jump to any page instantly.',
    Icon: Keyboard,
    targetSelector: 'button[aria-label="Search"]',
  },
  {
    id: 'complete',
    type: 'modal',
    title: "You're all set!",
    description:
      'You now know the basics of FocusLinks. Dive in, connect with peers, and start exploring the community!',
    Icon: CheckCircle,
    actionLabel: 'Start Exploring',
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function findTarget(selector: string): DOMRect | null {
  if (typeof document === 'undefined') return null;
  try {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const stepRef = useRef(0);

  /* ── Sync ref with state ── */
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  /* ── Check localStorage on mount ── */
  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return;
    const t = setTimeout(() => setActive(true), 900);
    return () => clearTimeout(t);
  }, []);

  /* ── Listen for restart-tour custom event ── */
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem(TOUR_KEY);
      setActive(true);
      setStep(0);
    };
    window.addEventListener('restart-tour', handler);
    return () => window.removeEventListener('restart-tour', handler);
  }, []);

  /* ── Track target element rect ── */
  useEffect(() => {
    const s = STEPS[step];
    const update = () => {
      if (s.type !== 'tooltip' || !s.targetSelector) {
        setRect(null);
        return;
      }
      setRect(findTarget(s.targetSelector!));
    };
    update();
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [step]);

  /* ── Actions (stable via ref) ── */
  const close = useCallback(() => {
    setActive(false);
    localStorage.setItem(TOUR_KEY, 'true');
  }, []);

  const next = useCallback(() => {
    const s = stepRef.current;
    if (s < STEPS.length - 1) {
      setStep((p) => p + 1);
    } else {
      setActive(false);
      localStorage.setItem(TOUR_KEY, 'true');
      toast.success('Tour completed! \ud83c\udf89');
    }
  }, []);

  const prev = useCallback(() => {
    if (stepRef.current > 0) setStep((p) => p - 1);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [active, close, next, prev]);

  /* ── Derived state ── */
  const cur = STEPS[step];
  const CurIcon = cur.Icon;
  const isModal = cur.type === 'modal';
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const hasSpotlight = !isModal && rect !== null;

  /* ── Tooltip position ── */
  const pos = (() => {
    if (isModal || !rect) return null;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    if (vw < 640) return null;
    const gap = 18;
    const w = Math.min(380, vw - 32);
    const h = 300;
    let top = rect.bottom + gap;
    if (top + h > vh - 24) top = rect.top - gap - h;
    top = Math.max(24, top);
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(16, Math.min(left, vw - w - 16));
    return { top, left, w };
  })();

  /* ── Render ── */
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm"
          />

          {/* ── Spotlight ── */}
          <motion.div
            key="tour-spotlight"
            initial={false}
            animate={{
              opacity: hasSpotlight ? 1 : 0,
              top: rect ? rect.top - 8 : -200,
              left: rect ? rect.left - 8 : -200,
              width: rect ? rect.width + 16 : 0,
              height: rect ? rect.height + 16 : 0,
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed z-[81] rounded-2xl pointer-events-none"
            style={{
              boxShadow:
                '0 0 0 9999px rgba(0,0,0,0.12), 0 0 0 3px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.12)',
            }}
          />

          {/* ── Tour Card ── */}
          <motion.div
            key={cur.id}
            initial={{ opacity: 0, scale: 0.92, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={
              isModal
                ? 'fixed inset-0 z-[82] flex items-center justify-center p-4'
                : 'fixed z-[82]'
            }
            style={
              !isModal && pos
                ? { top: pos.top, left: pos.left, width: pos.w }
                : !isModal
                  ? { bottom: 24, left: 16, right: 16 }
                  : undefined
            }
          >
            {/* Gradient border wrapper */}
            <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500 shadow-2xl w-full">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
                {/* ── Header ── */}
                <div className="relative px-6 pt-6 pb-2">
                  <button
                    onClick={close}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Skip tour"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                      <CurIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                      {step + 1}
                    </div>
                  </div>

                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-white pr-8 leading-snug">
                    {cur.title}
                  </h3>
                </div>

                {/* ── Description ── */}
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {cur.description}
                  </p>
                </div>

                {/* ── Actions ── */}
                <div className="px-6 pb-4">
                  {isModal && cur.actionLabel ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={next}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-500/25"
                    >
                      {cur.actionLabel}
                    </motion.button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={prev}
                        disabled={isFirst}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={next}
                        className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-500/25"
                      >
                        {isLast ? 'Finish' : 'Next'}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                        {isLast && <CheckCircle className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* ── Progress Dots ── */}
                <div className="px-6 pb-5">
                  <div className="flex items-center justify-center gap-2">
                    {STEPS.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`rounded-full ${
                          i === step
                            ? 'w-6 h-2 bg-gradient-to-r from-violet-500 to-blue-500'
                            : 'w-2 h-2 bg-gray-200 dark:bg-slate-700'
                        }`}
                        layout
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    ))}
                  </div>
                  <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2 font-medium tracking-wide uppercase">
                    Step {step + 1} of {STEPS.length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
