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
  Shield,
  Zap,
  Pin,
  Lightbulb,
  Star,
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
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const slideTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/* ─── Floating animation for decorative elements ─── */
const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

const floatAnimationSlow = {
  initial: { y: 0 },
  animate: {
    y: [0, -7, 0],
    transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

/* ─── Step-aware content for left panel ─── */
const stepDescriptions: Record<number, { headline: string; sub: string }> = {
  0: { headline: 'The Future of Optometry Starts With You', sub: 'Join thousands of professionals transforming patient care worldwide.' },
  1: { headline: 'Your Role Shapes Your Experience', sub: 'We personalize every feature to match how you work.' },
  2: { headline: 'Built for What Matters Most', sub: 'Tell us your goals and we\'ll tailor your dashboard.' },
  3: { headline: 'Deep Expertise, Right Tools', sub: 'From myopia control to neuro-optometry — we\'ve got you.' },
  4: { headline: 'Connect Locally, Impact Globally', sub: 'Find peers, events, and opportunities near you.' },
  5: { headline: 'Your Journey Begins Now', sub: 'Everything is set. Welcome to the future of optometry.' },
};

/* ─── Visual tag cards for right side — each image has its own tag label ─── */
const visualTagCards = [
  {
    id: 'tag-clinical',
    img: '/images/onboarding/cartoon-clinical.png',
    tag: 'AI Tools',
    tagColor: 'bg-amber-500',
    tagText: 'text-white',
    rotate: -5,
    floatDur: 3.4,
    delay: 0.8,
  },
  {
    id: 'tag-academy',
    img: '/images/onboarding/cartoon-academy.png',
    tag: 'Academy',
    tagColor: 'bg-emerald-500',
    tagText: 'text-white',
    rotate: 4,
    floatDur: 4.0,
    delay: 1.0,
  },
  {
    id: 'tag-global',
    img: '/images/onboarding/cartoon-global.png',
    tag: 'Community',
    tagColor: 'bg-sky-500',
    tagText: 'text-white',
    rotate: -3,
    floatDur: 3.7,
    delay: 1.1,
  },
  {
    id: 'tag-events',
    img: '/images/onboarding/cartoon-events.png',
    tag: 'Events',
    tagColor: 'bg-purple-500',
    tagText: 'text-white',
    rotate: 6,
    floatDur: 4.3,
    delay: 1.2,
  },
  {
    id: 'tag-career',
    img: '/images/onboarding/cartoon-career.png',
    tag: 'Career',
    tagColor: 'bg-orange-500',
    tagText: 'text-white',
    rotate: -4,
    floatDur: 3.5,
    delay: 1.3,
  },
  {
    id: 'tag-trust',
    img: '/images/onboarding/cartoon-trust.png',
    tag: 'Free & Safe',
    tagColor: 'bg-blue-600',
    tagText: 'text-white',
    rotate: 3,
    floatDur: 3.9,
    delay: 1.4,
  },
];

/* ─── Decorative Left Panel (Desktop Only) ─── */
function DecorativePanel({ currentStep }: { currentStep: number }) {
  const stepInfo = stepDescriptions[currentStep] || stepDescriptions[0];

  return (
    <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden flex-col">
      {/* Girl as FULL background */}
      <motion.img
        key={`bg-girl-${currentStep}`}
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        src="/images/onboarding/desktop-banner.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Multi-layer gradient overlays for edge blending */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/75 via-blue-800/50 to-blue-700/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/85 via-blue-900/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/25 via-transparent to-blue-900/40" />
      {/* Right edge blend into white panel */}
      <div className="absolute inset-y-0 -right-1 w-20 bg-gradient-to-l from-white to-transparent z-20" />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.03] z-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Animated floating particles */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <motion.div {...floatAnimation} className="absolute top-[15%] right-[18%] w-2 h-2 rounded-full bg-white/40" />
        <motion.div {...floatAnimationSlow} className="absolute top-[30%] left-[10%] w-1.5 h-1.5 rounded-full bg-cyan-300/50" />
        <motion.div {...floatAnimation} className="absolute top-[60%] right-[12%] w-2.5 h-2.5 rounded-full bg-white/20" />
        <motion.div {...floatAnimationSlow} className="absolute bottom-[25%] left-[18%] w-2 h-2 rounded-full bg-blue-200/30" />
        <motion.div {...floatAnimation} className="absolute top-[45%] left-[35%] w-1.5 h-1.5 rounded-full bg-cyan-400/30" />
        {/* Pulse rings */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.12, 0, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[28%] right-[22%] w-12 h-12 rounded-full border border-white/12"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0, 0.08] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-[32%] left-[12%] w-16 h-16 rounded-full border border-cyan-300/12"
        />
      </div>

      {/* Content overlaid on the girl */}
      <div className="relative z-20 flex flex-col justify-between p-8 xl:p-10 w-full h-full">
        {/* Top bar: FocusLinks branding + Step pill — aligned on same row */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-2xl font-bold text-white tracking-tight drop-shadow-lg">FocusLinks</span>
          </motion.div>

          <motion.div
            key={`step-pill-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{currentStep + 1}</span>
            </div>
            <span className="text-xs font-semibold text-blue-100">of 6</span>
          </motion.div>
        </div>

        {/* Center spacer — lets girl face show through */}
        <div className="flex-1" />

        {/* Bottom section: Overlapping glassmorphism cards — properly aligned */}
        <div className="relative">
          {/* Card peeking top-right — clearly visible overlap */}
          <motion.div
            initial={{ opacity: 0, x: 10, y: -10 }}
            animate={{ opacity: 1, x: 10, y: -14 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-4 right-0 w-[60%] h-16 bg-white/[0.12] backdrop-blur-xl rounded-2xl border border-white/15 shadow-xl"
            style={{ transform: 'rotate(2.5deg)' }}
          />

          {/* Card peeking bottom-left — clearly visible overlap */}
          <motion.div
            initial={{ opacity: 0, x: -5, y: 5 }}
            animate={{ opacity: 1, x: -5, y: 8 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-2 left-2 w-[50%] h-10 bg-white/[0.10] backdrop-blur-xl rounded-2xl border border-white/12 shadow-lg"
            style={{ transform: 'rotate(-2deg)' }}
          />

          {/* Main headline card — front and center */}
          <motion.div
            key={`headline-${currentStep}`}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative backdrop-blur-2xl rounded-3xl p-6 xl:p-8 border border-white/20 shadow-2xl shadow-black/25"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%)',
            }}
          >
            <h1 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-2.5 drop-shadow-lg">
              {stepInfo.headline.split(' ').map((word, i, arr) => (
                i === arr.length - 1 ? (
                  <span key={i} className="bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">{word}</span>
                ) : (
                  <span key={i}>{word} </span>
                )
              ))}
            </h1>
            <p className="text-blue-100/85 text-sm leading-relaxed drop-shadow">
              {stepInfo.sub}
            </p>

            {/* Stats row inside the headline card */}
            <div className="flex items-center gap-2.5 mt-5">
              {[
                { value: '600+', label: 'Optometrists' },
                { value: '25+', label: 'Countries' },
                { value: '10+', label: 'Specialties' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.07, type: 'spring', stiffness: 200, damping: 20 }}
                  className="bg-white/[0.12] backdrop-blur-lg rounded-xl px-3 py-2 border border-white/20 shadow-lg"
                >
                  <div className="text-xs font-extrabold text-white drop-shadow">{stat.value}</div>
                  <div className="text-blue-200/70 text-[8px] font-semibold">{stat.label}</div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="ml-auto flex items-center gap-1.5 bg-white/[0.08] backdrop-blur-md rounded-full px-3 py-1.5 border border-white/15"
              >
                <Shield className="w-3 h-3 text-green-300" />
                <span className="text-[9px] text-blue-100/70 font-medium">Free & Trusted</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
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

      try {
        await fetch('/api/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'onboarding', ...data }),
        });
      } catch { /* non-blocking */ }

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
      className="flex flex-col gap-5"
    >
      <div className="mb-1">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/25"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight text-center"
        >
          Welcome to FocusLinks
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 mt-2 leading-relaxed text-center text-sm sm:text-base"
        >
          The global platform for optometry professionals. Let&apos;s personalize your experience in just a few steps.
        </motion.p>
      </div>

      {/* Name */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 20 }}
        className="space-y-2"
      >
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
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 200, damping: 20 }}
        className="space-y-2"
      >
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
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-medium">Please enter a valid email address</motion.p>
        )}
      </motion.div>

      {/* Continue button — right below email, centered for easy access */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 200, damping: 20 }}
        className="flex justify-center pt-1"
      >
        <motion.button
          type="button"
          onClick={goNext}
          disabled={!canContinue()}
          whileHover={{ scale: canContinue() ? 1.03 : 1 }}
          whileTap={{ scale: canContinue() ? 0.97 : 1 }}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer w-full sm:w-auto sm:min-w-[200px] justify-center"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>

      {/* Social proof hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-2 pt-1"
      >
        <div className="flex -space-x-2">
          {['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-500'].map((color, i) => (
            <div key={i} className={`w-6 h-6 rounded-full ${color} border-2 border-white flex items-center justify-center text-[8px] text-white font-bold`}>
              {['J', 'A', 'R', 'M'][i]}
            </div>
          ))}
        </div>
        <span className="text-xs text-gray-400">Join 600+ optometrists worldwide</span>
      </motion.div>
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
      className="flex flex-col gap-4"
    >
      <div className="mb-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          What best describes you?
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
          Select the option that fits your current role
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setData(prev => ({ ...prev, status: option.id }))}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer text-center
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md shadow-blue-600/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs sm:text-sm font-semibold leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                {option.label}
              </span>
              <span className="text-[11px] text-gray-400 leading-tight hidden sm:block">{option.description}</span>
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
      className="flex flex-col gap-4"
    >
      <div className="mb-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          What brings you to FocusLinks?
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
          Choose all that apply <span className="text-blue-600 font-semibold">({data.purposes.length} selected)</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
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
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
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
      className="flex flex-col gap-4"
    >
      <div className="mb-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Your Specialty &amp; Interests
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
          Select your areas of focus <span className="text-blue-600 font-semibold">({data.specialties.length} selected)</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {specialtyOptions.map((name, i) => {
          const isSelected = data.specialties.includes(name);
          return (
            <motion.button
              key={name}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSpecialty(name)}
              className={`px-3.5 py-2 rounded-full border-2 transition-all cursor-pointer text-sm font-medium
                ${isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
              {name}
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-400">You can skip this step if you&apos;d like</p>
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
      className="flex flex-col gap-4"
    >
      <div className="mb-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Tell us about yourself
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
          Help us connect you with the right community
        </p>
      </div>

      {/* Country */}
      <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
        <label htmlFor="ob-country" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-gray-500" /> Country / Region
        </label>
        <div className="relative">
          <button
            type="button"
            id="ob-country"
            onClick={() => setCountryDropdownOpen(v => !v)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-left text-sm flex items-center justify-between hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 shadow-sm"
          >
            <span className={data.country ? 'text-gray-900' : 'text-gray-400'}>{data.country || 'Select your country'}</span>
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
                  <button key={c} type="button" onClick={() => { setData(prev => ({ ...prev, country: c })); setCountryDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${data.country === c ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-gray-700'}`}>
                    {c}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* City/State */}
      <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="space-y-2">
        <label htmlFor="ob-city" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-500" /> City / State
        </label>
        <input id="ob-city" type="text" value={data.cityState} onChange={e => setData(prev => ({ ...prev, cityState: e.target.value }))} placeholder="Mumbai, Maharashtra"
          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm" />
      </motion.div>

      {/* Org + Membership side by side on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
          <label htmlFor="ob-org" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-gray-500" /> Org <span className="text-gray-400 text-xs font-normal">(opt.)</span>
          </label>
          <input id="ob-org" type="text" value={data.organization} onChange={e => setData(prev => ({ ...prev, organization: e.target.value }))} placeholder="Vision Care Clinic"
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm" />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="space-y-2">
          <label htmlFor="ob-mid" className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-gray-500" /> ID <span className="text-gray-400 text-xs font-normal">(opt.)</span>
          </label>
          <input id="ob-mid" type="text" value={data.membershipId} onChange={e => setData(prev => ({ ...prev, membershipId: e.target.value }))} placeholder="FL-XXXXX"
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-sm" />
        </motion.div>
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
      className="flex flex-col gap-4"
    >
      <div className="mb-1">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
          className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30"
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight text-center">
          Your FocusLinks Experience
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm sm:text-base text-center">
          Based on your preferences, here&apos;s what we recommend
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {getFeatureRecommendations(data).map((feature, i) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 200, damping: 22 }}
              whileHover={{ x: 4, borderColor: 'rgb(191 219 254)' }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-gray-100 hover:shadow-sm transition-all cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
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

      <p className="text-xs text-center text-gray-400 mt-1">You can explore all features anytime from the navigation menu</p>
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

  /* ── Step dots indicator for desktop ── */
  const stepLabels = ['Welcome', 'Role', 'Purpose', 'Specialty', 'Location', 'Ready'];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Desktop Left Panel */}
      <DecorativePanel currentStep={currentStep} />

      {/* Right Side — Step Content + Scattered Visuals */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile — banner with visible character */}
        <div className="lg:hidden relative h-52 overflow-hidden">
          <img src="/images/onboarding/mobile-banner.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-transparent to-white" />
          <div className="relative z-10 flex items-center gap-2 pt-4 px-5">
            <div className="w-7 h-7 rounded-lg bg-white/25 backdrop-blur-sm flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white drop-shadow-sm">FocusLinks</span>
          </div>
        </div>

        {/* Desktop — step dots indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-10 pt-6 pb-2">
          {stepLabels.map((label, i) => (
            <motion.div
              key={label}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <motion.div
                animate={{
                  width: i === currentStep ? 24 : 8,
                  backgroundColor: i === currentStep ? '#2563EB' : i < currentStep ? '#60A5FA' : '#E5E7EB',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="h-2 rounded-full"
              />
              <span className={`text-[10px] font-medium transition-colors ${
                i === currentStep ? 'text-blue-600' : i < currentStep ? 'text-blue-400' : 'text-gray-300'
              }`}>{label}</span>
              {i < stepLabels.length - 1 && <div className="w-2 h-px bg-gray-200 mx-0.5" />}
            </motion.div>
          ))}
          <div className="flex-1" />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer font-medium"
          >
            Skip for now
          </motion.button>
        </div>

        {/* Mobile — Progress Bar */}
        <div className="lg:hidden px-6 pt-4 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">Step {currentStep + 1} of {totalSteps}</span>
            <button onClick={handleSkip} className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer font-medium">Skip for now</button>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" initial={false}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 25 }} />
          </div>
        </div>

        {/* Step Content — centered on desktop with max-width */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-0 py-6 lg:py-4 custom-scrollbar relative">
          <div className="lg:max-w-lg lg:mx-auto relative z-10">
            <AnimatePresence mode="wait" custom={direction}>
              {renderCurrentStep()}
            </AnimatePresence>

            {/* Desktop only: Tagged visual cards below the form — cute cartoon mood board */}
            <div className="hidden lg:block mt-6">
              {/* Soft separator */}
              <div className="h-px w-full mb-5" style={{ background: 'linear-gradient(to right, transparent, rgba(37,99,235,0.12), transparent)' }} />

              {/* 3×2 grid of cartoon visual cards with tag labels */}
              <div className="grid grid-cols-3 gap-3">
                {visualTagCards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20, scale: 0.9, rotate: card.rotate * 2 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: card.rotate }}
                    transition={{ delay: card.delay, type: 'spring', stiffness: 180, damping: 18 }}
                    whileHover={{ scale: 1.05, y: -4, rotate: 0 }}
                    className="relative group cursor-default"
                  >
                    <motion.div
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{ duration: card.floatDur, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white"
                    >
                      {/* Cartoon image */}
                      <img
                        src={card.img}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                      {/* Subtle overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>

                    {/* Tag label — connected to the image like a tag/sticker */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: card.delay + 0.15, type: 'spring', stiffness: 250, damping: 20 }}
                      className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${card.tagColor} ${card.tagText} px-3 py-1 rounded-full text-[11px] font-bold shadow-md whitespace-nowrap z-10`}
                    >
                      {/* Tag connector — dotted line + dot */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mb-0.5" />
                        <div className="w-0.5 h-3 bg-gray-300" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #d1d5db 0px, #d1d5db 2px, transparent 2px, transparent 5px)' }} />
                      </div>
                      {card.tag}
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* AI-powered badge — centered below the grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, type: 'spring', stiffness: 200, damping: 22 }}
                className="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-white mx-auto w-fit"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </motion.div>
                <span className="text-xs font-semibold text-gray-600">AI-Powered Personalization</span>
                <span className="text-[10px] text-gray-400">— adapts as you go</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons — centered on desktop */}
        <div className="px-6 lg:px-0 py-4 lg:py-5 border-t border-gray-100 bg-white">
          <div className="lg:max-w-lg lg:mx-auto flex items-center gap-3">
            {currentStep > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                type="button"
                onClick={goBack}
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
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
                whileHover={{ scale: canContinue() ? 1.02 : 1 }}
                whileTap={{ scale: canContinue() ? 0.98 : 1 }}
                className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
