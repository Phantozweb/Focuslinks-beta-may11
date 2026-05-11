'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, UserPlus, Linkedin, Mail, X } from 'lucide-react';
import { Link } from '../../context/NavigationContext';

export type AuthGateAction = 'connect' | 'linkedin' | 'email' | 'general';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: AuthGateAction;
}

const ACTION_CONFIG: Record<AuthGateAction, {
  icon: typeof Shield;
  title: string;
  description: string;
}> = {
  connect: {
    icon: UserPlus,
    title: 'Join to Connect',
    description: 'Sign in to connect with optometry professionals, send messages, and grow your network.',
  },
  linkedin: {
    icon: Linkedin,
    title: 'Join to View LinkedIn',
    description: 'Sign in to view LinkedIn profiles and expand your professional network.',
  },
  email: {
    icon: Mail,
    title: 'Join to Message',
    description: 'Sign in to send messages to professionals on FocusLinks.',
  },
  general: {
    icon: Shield,
    title: 'Join FocusLinks',
    description: 'Sign in to access all features, connect with professionals, and grow your optometry network.',
  },
};

export default function AuthGateModal({ isOpen, onClose, actionType }: AuthGateModalProps) {
  const config = ACTION_CONFIG[actionType] || ACTION_CONFIG.general;
  const IconComponent = config.icon;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Content - responsive bottom sheet on mobile, centered dialog on desktop */}
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-gate-title"
              aria-describedby="auth-gate-desc"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle for mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-700" />
              </div>

              {/* Compact Header with icon + action context */}
              <div className="px-5 sm:px-6 pt-2 sm:pt-5 pb-4 flex items-start gap-4">
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      id="auth-gate-title"
                      className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight"
                    >
                      {config.title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-gray-400"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p
                    id="auth-gate-desc"
                    className="text-sm text-slate-500 dark:text-gray-400 mt-1 leading-relaxed"
                  >
                    {config.description}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-5 sm:mx-6 border-t border-slate-100 dark:border-slate-800" />

              {/* Action Buttons */}
              <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-2.5">
                {/* Sign In - Primary button */}
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl text-center shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Sign In with Membership ID
                </Link>

                {/* Create Account - Secondary button */}
                <Link
                  to="/register"
                  onClick={onClose}
                  className="flex items-center justify-center w-full py-3 px-6 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 font-bold rounded-xl text-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all active:scale-[0.98]"
                >
                  Become a Member
                </Link>
              </div>

              {/* Maybe Later + trust signal */}
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col items-center gap-3">
                <button
                  onClick={onClose}
                  className="text-sm text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                >
                  Maybe later
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-gray-600">
                  <Shield className="w-3 h-3" />
                  <span>Free to join · Trusted by {600}+ optometrists</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
