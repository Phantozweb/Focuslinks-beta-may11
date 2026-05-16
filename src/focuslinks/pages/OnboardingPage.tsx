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
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from '@/context/NavigationContext';

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
const statusOptions: { id: string; label: string; icon: LucideIcon; description: string }[] = [
  { id: 'student', label: 'Student', icon: GraduationCap, description: 'Currently studying optometry or a related field' },
  { id: 'practicing', label: 'Practicing Optometrist', icon: Stethoscope, description: 'Actively providing patient care' },
  { id: 'researcher', label: 'Researcher', icon: FlaskConical, description: 'Conducting research in vision science' },
  { id: 'clinic-owner', label: 'Clinic Owner', icon: Building2, description: 'Own or manage an optometry practice' },
  { id: 'educator', label: 'Educator', icon: Presentation, description: 'Teaching optometry or training professionals' },
  { id: 'other', label: 'Other', icon: HelpCircle, description: 'Allied health professional or other role' },
];

/* ─── Purpose Options (Step 3) ─── */
const purposeOptions: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'career', label: 'Career Development', icon: Briefcase },
  { id: 'visibility', label: 'Professional Visibility', icon: Eye },
  { id: 'clinical', label: 'Clinical Tools', icon: Wrench },
  { id: 'education', label: 'Learning & Education', icon: BookOpen },
  { id: 'research', label: 'Research & Collaboration', icon: FlaskConical },
  { id: 'management', label: 'Practice Management', icon: Settings },
  { id: 'mentorship', label: 'Mentorship', icon: Handshake },
  { id: 'community', label: 'Community & Peer Support', icon: Heart },
];

/* ─── Specialty Options (Step 4) ─── */
const specialtyOptions = [
  'Contact Lenses', 'Myopia Control', 'Pediatric Optometry', 'Low Vision',
  'Binocular Vision', 'Sports Vision', 'Geriatric Optometry', 'Ocular Disease',
  'Dry Eye Management', 'Neuro-Optometry', 'Vision Therapy', 'Dispensing Optics',
];

/* ─── Countries list ─── */
const popularCountries = [
  'India', 'United States', 'United Kingdom', 'Australia', 'Canada',
  'Nigeria', 'South Africa', 'UAE', 'Saudi Arabia', 'Singapore',
  'Malaysia', 'Philippines', 'Kenya', 'Ghana', 'Pakistan',
  'Bangladesh', 'Egypt', 'Brazil', 'Germany', 'New Zealand',
  'Sri Lanka', 'Nepal', 'Tanzania', 'Ethiopia', 'Other',
];

/* ─── Feature recommendations based on selections (Step 6) ─── */
interface FeatureRec {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
}

function getFeatureRecommendations(data: OnboardingData): FeatureRec[] {
  const features: FeatureRec[] = [];
  const { status, purposes, specialties } = data;

  if (status === 'student') {
    features.push({ icon: GraduationCap, title: 'FocusLinks Academy', description: 'Access courses, study materials, and certifications designed for students', route: '/academy' });
  }
  if (status === 'practicing' || status === 'clinic-owner') {
    features.push({ icon: LayoutGrid, title: 'Clinical Tools', description: 'OD CAM, IPD Measure, RAPD Simulator, and more clinical resources', route: '/labs' });
  }
  if (status === 'researcher') {
    features.push({ icon: Telescope, title: 'OptoScholar', description: 'AI-powered research assistant for vision science literature', route: '/labs/optoscholar' });
  }
  if (status === 'educator') {
    features.push({ icon: BookOpen, title: 'Create & Share Content', description: 'Publish articles, create courses, and share your expertise', route: '/create-article' });
  }
  if (purposes.includes('career')) {
    features.push({ icon: Briefcase, title: 'Jobs Board', description: 'Browse optometry opportunities worldwide', route: '/jobs' });
  }
  if (purposes.includes('visibility')) {
    features.push({ icon: Users, title: 'Professional Directory', description: 'Get listed and connect with peers globally', route: '/professionals' });
  }
  if (purposes.includes('community') || purposes.includes('mentorship')) {
    features.push({ icon: MessageSquare, title: 'Community', description: 'Join discussions, ask questions, and find mentors', route: '/community' });
  }
  if (purposes.includes('education')) {
    features.push({ icon: Award, title: 'Events & Webinars', description: 'Attend live sessions and earn certificates', route: '/events' });
  }
  if (specialties.includes('Contact Lenses') || specialties.includes('Myopia Control')) {
    if (!features.some(f => f.route === '/labs')) {
      features.push({ icon: Wrench, title: 'Clinical Tools', description: 'Specialized tools for contact lens and myopia management', route: '/labs' });
    }
  }
  if (features.length < 3) {
    if (!features.some(f => f.route === '/opto-map')) {
      features.push({ icon: MapPin, title: 'OptoMap', description: 'Discover optometrists worldwide on our interactive map', route: '/opto-map' });
    }
  }
  if (!features.some(f => f.route === '/explore')) {
    features.push({ icon: Search, title: 'Explore FocusLinks', description: 'Discover all features, articles, and resources', route: '/explore' });
  }
  if (!features.some(f => f.route === '/feed')) {
    features.push({ icon: Target, title: 'Your Feed', description: 'Personalized content based on your interests', route: '/feed' });
  }

  return features.slice(0, 5);
}

/* ─── Animation configs ─── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const slideTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/* ─── Decorative Left Panel (Desktop Only) ─── */
function DecorativePanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
      {/* Abstract decorative shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white"
        />
        {/* Medium circle */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.06 }}
          transition={{ duration: 1.8, delay: 0.3, ease: 'easeOut' }}
          className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-white"
        />
        {/* Small circles */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 0.08 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white"
        />
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 0.05 }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white"
        />
        {/* Diamond shape */}
        <motion.div
          initial={{ rotate: 0, scale: 0, opacity: 0 }}
          animate={{ rotate: 45, scale: 1, opacity: 0.06 }}
          transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
          className="absolute bottom-1/3 left-10 w-32 h-32 bg-white"
        />
        {/* Lines */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.08 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute top-1/2 left-0 right-0 h-px bg-white origin-left"
        />
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.05 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute top-2/3 left-0 right-0 h-px bg-white origin-left"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
        {/* Logo area */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FocusLinks</span>
          </motion.div>
        </div>

        {/* Middle — cute mascot + inspirational text */}
        <div className="space-y-6">
          {/* Cute mascot icon */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 }}
            className="w-28 h-28 mx-auto relative"
          >
            <img 
              src="/images/onboarding/icon.png" 
              alt="FocusLinks Mascot" 
              className="w-full h-full object-contain drop-shadow-xl"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.1, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-white/15 -m-3"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-3xl xl:text-4xl font-bold text-white leading-tight text-center"
          >
            The Future of<br />
            Optometry Starts<br />
            <span className="text-blue-200">With You</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-blue-100/80 text-base leading-relaxed max-w-sm"
          >
            Join thousands of optometry professionals worldwide who are transforming patient care, advancing research, and building meaningful connections.
          </motion.p>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex items-center gap-8"
        >
          <div>
            <div className="text-2xl font-bold text-white">600+</div>
            <div className="text-blue-200/70 text-sm">Optometrists</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-2xl font-bold text-white">25+</div>
            <div className="text-blue-200/70 text-sm">Countries</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div>
            <div className="text-2xl font-bold text-white">10+</div>
            <div className="text-blue-200/70 text-sm">Specialties</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main Onboarding Page ─── */
export default function OnboardingPage() {
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
  const [direction, setDirection] = useState(1);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 6;

  /* ── Persist data to localStorage on change ── */
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  }, [data, mounted]);

  /* ── If onboarding already complete, redirect ── */
  useEffect(() => {
    if (!mounted) return;
    try {
      const isComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
      const hasUser = localStorage.getItem('fl_user');
      if (isComplete && hasUser) {
        navigate('/home');
      }
    } catch { /* ignore */ }
  }, [mounted, navigate]);

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
      localStorage.setItem(USER_KEY, JSON.stringify({
        name: data.fullName || 'User',
        email: data.email || '',
        role: data.status || '',
        location: data.cityState ? `${data.cityState}, ${data.country}` : data.country || '',
      }));
    } catch { /* ignore */ }
    navigate('/home');
  }, [data, navigate]);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);
    try {
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
          body: JSON.stringify({ type: 'onboarding', ...data }),
        });
      } catch { /* non-blocking */ }

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
      case 3: return true;
      case 4: return true;
      case 5: return true;
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

  /* ── Don't render until mounted ── */
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-100 rounded-full" />
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
        </div>
      </div>
    );
  }

  /* ─── Step Renderers ─── */
  const renderStep1 = () => (
    <motion.div
      key="step-0"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="flex flex-col gap-6"
    >
      <div className="mb-2">
        {/* Cute mascot icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-24 h-24 mx-auto mb-5 relative"
        >
          <img 
            src="/images/onboarding/icon.png" 
            alt="FocusLinks Mascot" 
            className="w-full h-full object-contain drop-shadow-lg"
          />
          {/* Cute bounce animation ring */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.15, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-blue-400/20 -m-2"
          />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center">
          Welcome to FocusLinks
        </h2>
        <p className="text-gray-500 mt-2 leading-relaxed text-center text-base">
          The global platform for optometry professionals. Let&apos;s personalize your experience in just a few steps.
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <label htmlFor="ob-name" className="text-sm font-semibold text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="ob-name"
            type="text"
            value={data.fullName}
            onChange={e => setData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Dr. Jane Smith"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm"
            autoFocus
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="ob-email" className="text-sm font-semibold text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="ob-email"
            type="email"
            value={data.email}
            onChange={e => setData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="jane@example.com"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm"
          />
        </div>
        {data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && (
          <p className="text-xs text-red-500 font-medium">Please enter a valid email address</p>
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step-1"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="flex flex-col gap-5"
    >
      <div className="mb-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          What best describes you?
        </h2>
        <p className="text-gray-500 mt-2 text-base">
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
              className={`relative flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer text-center
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-600/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs sm:text-sm font-semibold leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                {option.label}
              </span>
              <span className="text-[11px] text-gray-400 leading-tight hidden sm:block">
                {option.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step-2"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="flex flex-col gap-5"
    >
      <div className="mb-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          What brings you to FocusLinks?
        </h2>
        <p className="text-gray-500 mt-2 text-base">
          Choose all that apply <span className="text-blue-600 font-semibold">({data.purposes.length} selected)</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
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
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
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

  const renderStep4 = () => (
    <motion.div
      key="step-3"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="flex flex-col gap-5"
    >
      <div className="mb-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Your Specialty &amp; Interests
        </h2>
        <p className="text-gray-500 mt-2 text-base">
          Select your areas of focus <span className="text-blue-600 font-semibold">({data.specialties.length} selected)</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2.5">
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
              className={`px-4 py-2.5 rounded-full border-2 transition-all cursor-pointer text-sm font-medium
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
              {name}
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-400">
        You can skip this step if you&apos;d like
      </p>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      key="step-4"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="flex flex-col gap-5"
    >
      <div className="mb-1">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Tell us about yourself
        </h2>
        <p className="text-gray-500 mt-2 text-base">
          Help us connect you with the right community
        </p>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <label htmlFor="ob-country" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-gray-500" /> Country / Region
        </label>
        <div className="relative">
          <button
            type="button"
            id="ob-country"
            onClick={() => setCountryDropdownOpen(v => !v)}
            className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-left text-sm flex items-center justify-between hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm"
          >
            <span className={data.country ? 'text-gray-900' : 'text-gray-400'}>
              {data.country || 'Select your country'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {countryDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
              >
                {popularCountries.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setData(prev => ({ ...prev, country: c }));
                      setCountryDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors
                      ${data.country === c ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-gray-700'}`}
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
        <label htmlFor="ob-city" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-500" /> City / State
        </label>
        <input
          id="ob-city"
          type="text"
          value={data.cityState}
          onChange={e => setData(prev => ({ ...prev, cityState: e.target.value }))}
          placeholder="Mumbai, Maharashtra"
          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm"
        />
      </div>

      {/* Organization */}
      <div className="space-y-2">
        <label htmlFor="ob-org" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-gray-500" /> Organization / Clinic <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <input
          id="ob-org"
          type="text"
          value={data.organization}
          onChange={e => setData(prev => ({ ...prev, organization: e.target.value }))}
          placeholder="Vision Care Clinic"
          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm"
        />
      </div>

      {/* Membership ID */}
      <div className="space-y-2">
        <label htmlFor="ob-mid" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Hash className="w-4 h-4 text-gray-500" /> Membership ID <span className="text-gray-400 text-xs font-normal">(optional)</span>
        </label>
        <input
          id="ob-mid"
          type="text"
          value={data.membershipId}
          onChange={e => setData(prev => ({ ...prev, membershipId: e.target.value }))}
          placeholder="FL-XXXXX"
          className="w-full px-4 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm"
        />
      </div>
    </motion.div>
  );

  const renderStep6 = () => (
    <motion.div
      key="step-5"
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={slideTransition}
      className="flex flex-col gap-5"
    >
      <div className="mb-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center">
          Your FocusLinks Experience
        </h2>
        <p className="text-gray-500 mt-2 text-base text-center">
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
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{feature.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-400 mt-1">
        You can explore all features anytime from the navigation menu
      </p>
    </motion.div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderStep1();
      case 1: return renderStep2();
      case 2: return renderStep3();
      case 3: return renderStep4();
      case 4: return renderStep5();
      case 5: return renderStep6();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Desktop Left Panel */}
      <DecorativePanel />

      {/* Right Side — Step Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile gradient header with cute banner */}
        <div className="lg:hidden relative overflow-hidden">
          {/* Banner image area */}
          <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 pt-6 pb-4 px-6">
            {/* Abstract shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-blue-400/10" />
            </div>
            <div className="relative z-10 flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">FocusLinks</span>
            </div>
          </div>
          {/* Cute mascot banner */}
          <div className="relative -mt-2 mx-auto max-w-[280px]">
            <img 
              src="/images/onboarding/mobile-banner.png" 
              alt="Welcome to FocusLinks" 
              className="w-full h-auto rounded-3xl shadow-xl shadow-blue-600/20 border-2 border-white/50"
            />
          </div>
          <div className="text-center px-6 pt-4 pb-2">
            <h1 className="text-xl font-bold text-gray-900">Welcome aboard ✨</h1>
            <p className="text-gray-500 text-sm mt-1">Let&apos;s set up your experience</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 lg:px-10 pt-4 lg:pt-8 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer font-medium"
            >
              Skip for now
            </button>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
              initial={false}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-6 lg:py-8 custom-scrollbar">
          <AnimatePresence mode="wait" custom={direction}>
            {renderCurrentStep()}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 lg:px-10 py-5 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 px-5 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
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
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
      </div>
    </div>
  );
}
