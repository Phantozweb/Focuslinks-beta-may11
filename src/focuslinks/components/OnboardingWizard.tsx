'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  GraduationCap,
  Stethoscope,
  FlaskConical,
  Building2,
  Presentation,
  HelpCircle,
  Briefcase,
  Eye,
  Users,
  Wrench,
  BookOpen,
  Handshake,
  Settings,
  Heart,
  Search,
  Target,
  MapPin,
  Building,
  Hash,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Globe,
  ChevronDown,
  Award,
  Telescope,
  MessageSquare,
  LayoutGrid,
} from 'lucide-react';
import { useNavigate } from '../../context/NavigationContext';

/* ─── Storage Keys ─── */
const ONBOARDING_DATA_KEY = 'fl_onboarding_data';
const ONBOARDING_COMPLETE_KEY = 'fl_onboarding_complete';
const USER_KEY = 'fl_user';

/* ─── Types ─── */
interface OnboardingData {
  fullName: string;
  email: string;
  status: string;
  purposes: string[];
  specialties: string[];
  country: string;
  cityState: string;
  organization: string;
  membershipId: string;
}

const initialData: OnboardingData = {
  fullName: '',
  email: '',
  status: '',
  purposes: [],
  specialties: [],
  country: '',
  cityState: '',
  organization: '',
  membershipId: '',
};

/* ─── Status Options (Step 2) ─── */
const statusOptions = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    description: 'Currently studying optometry or a related field',
    color: 'from-teal-500 to-emerald-500',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-950/40',
    borderSelected: 'border-teal-500 dark:border-teal-400',
    textSelected: 'text-teal-700 dark:text-teal-300',
  },
  {
    id: 'practicing',
    label: 'Practicing Optometrist',
    icon: Stethoscope,
    description: 'Actively providing patient care',
    color: 'from-emerald-500 to-green-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/40',
    borderSelected: 'border-emerald-500 dark:border-emerald-400',
    textSelected: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'researcher',
    label: 'Researcher',
    icon: FlaskConical,
    description: 'Conducting research in vision science',
    color: 'from-violet-500 to-purple-500',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/40',
    borderSelected: 'border-violet-500 dark:border-violet-400',
    textSelected: 'text-violet-700 dark:text-violet-300',
  },
  {
    id: 'clinic-owner',
    label: 'Clinic Owner',
    icon: Building2,
    description: 'Own or manage an optometry practice',
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/40',
    borderSelected: 'border-amber-500 dark:border-amber-400',
    textSelected: 'text-amber-700 dark:text-amber-300',
  },
  {
    id: 'educator',
    label: 'Educator',
    icon: Presentation,
    description: 'Teaching optometry or training professionals',
    color: 'from-rose-500 to-pink-500',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-950/40',
    borderSelected: 'border-rose-500 dark:border-rose-400',
    textSelected: 'text-rose-700 dark:text-rose-300',
  },
  {
    id: 'other',
    label: 'Other',
    icon: HelpCircle,
    description: 'Allied health professional or other role',
    color: 'from-slate-500 to-gray-500',
    bgLight: 'bg-slate-50',
    bgDark: 'dark:bg-slate-800/40',
    borderSelected: 'border-slate-500 dark:border-slate-400',
    textSelected: 'text-slate-700 dark:text-slate-300',
  },
];

/* ─── Purpose Options (Step 3) ─── */
const purposeOptions = [
  { id: 'career', label: 'Career Development & Jobs', icon: Briefcase },
  { id: 'visibility', label: 'Professional Visibility & Networking', icon: Eye },
  { id: 'clinical', label: 'Clinical Tools & Resources', icon: Wrench },
  { id: 'education', label: 'Learning & Continuing Education', icon: BookOpen },
  { id: 'research', label: 'Research & Collaboration', icon: FlaskConical },
  { id: 'management', label: 'Practice Management', icon: Settings },
  { id: 'mentorship', label: 'Mentorship (Give or Receive)', icon: Handshake },
  { id: 'community', label: 'Community & Peer Support', icon: Heart },
];

/* ─── Specialty Options (Step 4) ─── */
const specialtyOptions = [
  'Contact Lenses',
  'Myopia Control',
  'Pediatric Optometry',
  'Low Vision',
  'Binocular Vision',
  'Sports Vision',
  'Geriatric Optometry',
  'Ocular Disease',
  'Dry Eye Management',
  'Neuro-Optometry',
  'Vision Therapy',
  'Dispensing Optics',
];

/* ─── Countries list (common ones) ─── */
const popularCountries = [
  'India', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'Nigeria', 'South Africa', 'UAE', 'Saudi Arabia', 'Singapore',
  'Malaysia', 'Philippines', 'Kenya', 'Ghana', 'Pakistan',
  'Bangladesh', 'Egypt', 'Brazil', 'Germany', 'New Zealand',
  'Sri Lanka', 'Nepal', 'Tanzania', 'Ethiopia', 'Other',
];

/* ─── Feature recommendations based on selections (Step 6) ─── */
interface FeatureRec {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  route: string;
  color: string;
}

function getFeatureRecommendations(data: OnboardingData): FeatureRec[] {
  const features: FeatureRec[] = [];
  const { status, purposes, specialties } = data;

  // Status-based recommendations
  if (status === 'student') {
    features.push({
      icon: GraduationCap,
      title: 'FocusLinks Academy',
      description: 'Access courses, study materials, and certifications designed for students',
      route: '/academy',
      color: 'from-teal-500 to-emerald-500',
    });
  }

  if (status === 'practicing' || status === 'clinic-owner') {
    features.push({
      icon: LayoutGrid,
      title: 'Clinical Tools',
      description: 'OD CAM, IPD Measure, RAPD Simulator, and more clinical resources',
      route: '/labs',
      color: 'from-emerald-500 to-green-500',
    });
  }

  if (status === 'researcher') {
    features.push({
      icon: Telescope,
      title: 'OptoScholar',
      description: 'AI-powered research assistant for vision science literature',
      route: '/labs/optoscholar',
      color: 'from-violet-500 to-purple-500',
    });
  }

  if (status === 'educator') {
    features.push({
      icon: BookOpen,
      title: 'Create & Share Content',
      description: 'Publish articles, create courses, and share your expertise',
      route: '/create-article',
      color: 'from-rose-500 to-pink-500',
    });
  }

  // Purpose-based recommendations
  if (purposes.includes('career')) {
    features.push({
      icon: Briefcase,
      title: 'Jobs Board',
      description: 'Browse optometry opportunities worldwide',
      route: '/jobs',
      color: 'from-amber-500 to-orange-500',
    });
  }

  if (purposes.includes('visibility')) {
    features.push({
      icon: Users,
      title: 'Professional Directory',
      description: 'Get listed and connect with peers globally',
      route: '/professionals',
      color: 'from-cyan-500 to-teal-500',
    });
  }

  if (purposes.includes('community') || purposes.includes('mentorship')) {
    features.push({
      icon: MessageSquare,
      title: 'Community',
      description: 'Join discussions, ask questions, and find mentors',
      route: '/community',
      color: 'from-pink-500 to-rose-500',
    });
  }

  if (purposes.includes('education')) {
    features.push({
      icon: Award,
      title: 'Events & Webinars',
      description: 'Attend live sessions and earn certificates',
      route: '/events',
      color: 'from-indigo-500 to-violet-500',
    });
  }

  // Specialty-based recommendations
  if (specialties.includes('Contact Lenses') || specialties.includes('Myopia Control')) {
    if (!features.some(f => f.route === '/labs')) {
      features.push({
        icon: Wrench,
        title: 'Clinical Tools',
        description: 'Specialized tools for contact lens and myopia management',
        route: '/labs',
        color: 'from-emerald-500 to-green-500',
      });
    }
  }

  // Default / always-show features (if we don't have enough)
  if (features.length < 3) {
    if (!features.some(f => f.route === '/opto-map')) {
      features.push({
        icon: MapPin,
        title: 'OptoMap',
        description: 'Discover optometrists worldwide on our interactive map',
        route: '/opto-map',
        color: 'from-teal-500 to-cyan-500',
      });
    }
  }

  if (!features.some(f => f.route === '/explore')) {
    features.push({
      icon: Search,
      title: 'Explore FocusLinks',
      description: 'Discover all features, articles, and resources',
      route: '/explore',
      color: 'from-slate-500 to-gray-500',
    });
  }

  if (!features.some(f => f.route === '/feed')) {
    features.push({
      icon: Target,
      title: 'Your Feed',
      description: 'Personalized content based on your interests',
      route: '/feed',
      color: 'from-orange-500 to-amber-500',
    });
  }

  // Return max 5
  return features.slice(0, 5);
}

/* ─── Spring animation config ─── */
const slideTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/* ─── Component ─── */
// Allow triggering onboarding from anywhere in the app
export function triggerOnboarding() {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('fl-trigger-onboarding'));
}

export default function OnboardingWizard() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window === 'undefined') return initialData;
    try {
      const savedData = localStorage.getItem(ONBOARDING_DATA_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return { ...initialData, ...parsed };
      }
    } catch { /* ignore */ }
    return initialData;
  });
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 6;

  // Determine if onboarding wizard should auto-open
  const shouldAutoOpen = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        // Allow forcing onboarding via ?onboard=true URL param
        const params = new URLSearchParams(window.location.search);
        if (params.get('onboard') === 'true') {
          localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
          return true;
        }
        return localStorage.getItem(ONBOARDING_COMPLETE_KEY) !== 'true';
      } catch { return false; }
    },
    () => false
  );

  const [isOpen, setIsOpen] = useState(false);

  /* ── Auto-open for new users ── */
  useEffect(() => {
    if (!mounted) return;
    // Force open if ?onboard=true in URL (works with SPA routing too)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('onboard') === 'true') {
        localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch { /* ignore */ }
    if (!shouldAutoOpen) return;
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, [mounted, shouldAutoOpen]);

  /* ── Listen for manual trigger event ── */
  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
    window.addEventListener('fl-trigger-onboarding', handler);
    return () => window.removeEventListener('fl-trigger-onboarding', handler);
  }, [mounted]);

  /* ── Persist data to localStorage on change ── */
  useEffect(() => {
    if (!mounted || !isOpen) return;
    try {
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }, [data, mounted, isOpen]);

  /* ── Navigation helpers ── */
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch { /* ignore */ }
    setIsOpen(false);
  }, []);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Set localStorage flags
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      localStorage.setItem(USER_KEY, JSON.stringify({
        name: data.fullName,
        email: data.email,
        role: data.status,
        location: data.cityState ? `${data.cityState}, ${data.country}` : data.country,
      }));

      // Submit to API
      try {
        await fetch('/api/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'onboarding',
            ...data,
          }),
        });
      } catch { /* non-blocking */ }

      setIsOpen(false);

      // Navigate to most relevant page
      const recommendations = getFeatureRecommendations(data);
      const bestRoute = recommendations.length > 0 ? recommendations[0].route : '/home';
      navigate(bestRoute);
    } catch {
      setIsSubmitting(false);
    }
  }, [data, navigate]);

  /* ── Validation ── */
  const canContinue = (): boolean => {
    switch (currentStep) {
      case 0: return data.fullName.trim().length > 0 && data.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      case 1: return data.status.length > 0;
      case 2: return data.purposes.length > 0;
      case 3: return true; // Optional
      case 4: return true; // Optional
      case 5: return true; // Final step
      default: return true;
    }
  };

  /* ── Toggle helpers ── */
  const togglePurpose = (id: string) => {
    setData(prev => ({
      ...prev,
      purposes: prev.purposes.includes(id)
        ? prev.purposes.filter(p => p !== id)
        : [...prev.purposes, id],
    }));
  };

  const toggleSpecialty = (name: string) => {
    setData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(name)
        ? prev.specialties.filter(s => s !== name)
        : [...prev.specialties, name],
    }));
  };

  /* ── Don't render until mounted or if onboarding complete ── */
  if (!mounted) return null;

  /* ─── Step Components ─── */
  const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col gap-6"
          >
            {/* Welcome header */}
            <div className="text-center mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome to FocusLinks
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                The global platform for optometry professionals. Let&apos;s personalize your experience in just a few steps.
              </p>
            </div>

            {/* Name input */}
            <div className="space-y-2">
              <label htmlFor="fl-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="fl-name"
                  type="text"
                  value={data.fullName}
                  onChange={e => setData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Dr. Jane Smith"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <label htmlFor="fl-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="fl-email"
                  type="email"
                  value={data.email}
                  onChange={e => setData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-sm"
                />
              </div>
              {data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && (
                <p className="text-xs text-rose-500">Please enter a valid email address</p>
              )}
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col gap-5"
          >
            <div className="text-center mb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                What best describes you?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select the option that fits your current role
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option, i) => {
                const Icon = option.icon;
                const isSelected = data.status === option.id;
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={() => setData(prev => ({ ...prev, status: option.id }))}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer text-center
                      ${isSelected
                        ? `${option.borderSelected} ${option.bgLight} ${option.bgDark} shadow-md`
                        : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white/80 dark:hover:bg-slate-800/50'
                      }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                    <div className={`w-10 h-10 rounded-xl ${isSelected ? option.bgLight + ' ' + option.bgDark : 'bg-slate-100 dark:bg-slate-700/50'} flex items-center justify-center transition-colors`}>
                      <Icon className={`w-5 h-5 ${isSelected ? option.textSelected : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    <span className={`text-xs font-semibold leading-tight ${isSelected ? option.textSelected : 'text-slate-700 dark:text-slate-300'}`}>
                      {option.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight hidden sm:block">
                      {option.description}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col gap-5"
          >
            <div className="text-center mb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                What brings you to FocusLinks?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Choose all that apply ({data.purposes.length} selected)
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center">
              {purposeOptions.map((option, i) => {
                const Icon = option.icon;
                const isSelected = data.purposes.includes(option.id);
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={() => togglePurpose(option.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all cursor-pointer text-sm font-medium
                      ${isSelected
                        ? 'border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col gap-5"
          >
            <div className="text-center mb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Your Specialty &amp; Interests
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select your areas of focus ({data.specialties.length} selected)
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {specialtyOptions.map((name, i) => {
                const isSelected = data.specialties.includes(name);
                return (
                  <motion.button
                    key={name}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={() => toggleSpecialty(name)}
                    className={`px-4 py-2 rounded-full border-2 transition-all cursor-pointer text-sm font-medium
                      ${isSelected
                        ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                    {name}
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500">
              You can skip this step if you&apos;d like
            </p>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step-4"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col gap-5"
          >
            <div className="text-center mb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Tell us about yourself
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Help us connect you with the right community
              </p>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label htmlFor="fl-country" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Country/Region
              </label>
              <div className="relative">
                <button
                  type="button"
                  id="fl-country"
                  onClick={() => setCountryDropdownOpen(v => !v)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-sm flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                >
                  <span className={data.country ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
                    {data.country || 'Select your country'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {countryDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar"
                    >
                      {popularCountries.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setData(prev => ({ ...prev, country: c }));
                            setCountryDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors
                            ${data.country === c ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/20 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* City/State */}
            <div className="space-y-2">
              <label htmlFor="fl-city" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> City / State
              </label>
              <input
                id="fl-city"
                type="text"
                value={data.cityState}
                onChange={e => setData(prev => ({ ...prev, cityState: e.target.value }))}
                placeholder="Mumbai, Maharashtra"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-sm"
              />
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <label htmlFor="fl-org" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Organization / Clinic <span className="text-slate-400 dark:text-slate-500 text-xs">(optional)</span>
              </label>
              <input
                id="fl-org"
                type="text"
                value={data.organization}
                onChange={e => setData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Vision Care Clinic"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-sm"
              />
            </div>

            {/* Membership ID */}
            <div className="space-y-2">
              <label htmlFor="fl-mid" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Membership ID <span className="text-slate-400 dark:text-slate-500 text-xs">(optional)</span>
              </label>
              <input
                id="fl-mid"
                type="text"
                value={data.membershipId}
                onChange={e => setData(prev => ({ ...prev, membershipId: e.target.value }))}
                placeholder="FL-XXXXX"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-sm"
              />
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step-5"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="flex flex-col gap-5"
          >
            <div className="text-center mb-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25"
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Your FocusLinks Experience
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Based on your preferences, here&apos;s what we recommend
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {getFeatureRecommendations(data).map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{feature.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{feature.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-1">
              You can explore all features anytime from the navigation menu
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="onboarding-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[200]"
          />

          {/* Modal container */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
            <motion.div
              key="onboarding-modal"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.8 }}
              className="pointer-events-auto w-full max-w-[520px] rounded-3xl overflow-hidden
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
                border border-slate-200/60 dark:border-slate-700/50
                shadow-2xl shadow-slate-900/10 dark:shadow-black/40
                relative flex flex-col"
              style={{ maxHeight: 'min(92vh, 720px)' }}
            >
              {/* Progress bar */}
              <div className="px-6 pt-5 pb-0">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                  <button
                    onClick={handleSkip}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Skip for now
                  </button>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                    initial={false}
                    animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  />
                </div>
              </div>

              {/* Step content - scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
                <AnimatePresence mode="wait" custom={direction}>
                  {renderStep()}
                </AnimatePresence>
              </div>

              {/* Navigation buttons */}
              <div className="px-6 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  {currentStep > 0 && (
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </motion.button>
                  )}

                  <div className="flex-1" />

                  {currentStep < totalSteps - 1 ? (
                    <motion.button
                      type="button"
                      onClick={goNext}
                      disabled={!canContinue()}
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleComplete}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm shadow-md shadow-teal-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        <>
                          Get Started
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
