'use client';
import { useRef, useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from '../../context/NavigationContext';
import { 
  Search, 
  MapPin, 
  Users, 
  Building2, 
  ChevronRight, 
  ArrowRight,
  ChevronLeft,
  BadgeCheck,
  Calendar,
  Clock,
  Award,
  FileText,
  Activity,
  Eye,
  Smartphone,
  Camera,
  Sparkles,
  FlaskConical,
  Globe,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Briefcase,
  Star,
  Heart,
  Quote,
  Microscope,
  LayoutGrid,
  Flame,
  X,
  Compass,
  TrendingUp,
  Rss,
  PenLine,
  Beaker,
  ThumbsUp,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { DirectoryIcon, FeedIcon, BlogIcon, LabsIcon, ProfilesIcon, EventsIcon, AcademyIcon } from '../components/CustomIcons';
import { globalSearchData } from '../../data/searchData';
import { useProfiles, generateSlug } from '../../hooks/useProfiles';
import dynamic from 'next/dynamic';

const MiniMap = dynamic(() => import('../components/MiniOptoMap'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-[350px] sm:h-[450px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 via-teal-50/30 to-emerald-50/30 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto w-12 h-12 mb-3">
          <div className="absolute inset-0 rounded-full border-3 border-teal-200 dark:border-teal-800 animate-ping opacity-20" />
          <MapPin className="absolute inset-0 m-auto w-6 h-6 text-teal-500 animate-bounce" />
        </div>
        <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading map...</p>
      </div>
    </div>
  ),
});

// ─── ProfileCard ───────────────────────────────────────────────────
const ProfileCard = ({ profile }: { profile: any }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col h-full hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
    {/* Premium Cover Photo Area */}
    <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/40 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
      {profile.flCredits && (
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-amber-200/50 flex items-center gap-1.5 z-10">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold text-amber-700">{profile.flCredits} FL</span>
        </div>
      )}
    </div>
    
    <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col flex-grow relative">
      {/* Avatar overlapping cover */}
      <div className="relative -mt-10 sm:-mt-12 mb-3 sm:mb-4 inline-block self-start">
        {!profile.image || profile.image === 'none' ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 dark:text-gray-500" />
          </div>
        ) : (
          <img src={profile.image} alt={profile.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300 bg-white dark:bg-slate-900" referrerPolicy="no-referrer" />
        )}
        {profile.verified && (
          <BadgeCheck className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-6 h-6 sm:w-7 sm:h-7 text-blue-500 drop-shadow-sm bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />
        )}
      </div>
      
      {/* Info */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl leading-tight group-hover:text-blue-600 transition-colors">{profile.name}</h3>
        <p className="text-sm sm:text-base text-blue-600 font-semibold mt-1 line-clamp-2">{profile.title}</p>
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-2 font-medium">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0 text-gray-400 dark:text-gray-500" />
          {profile.location}
        </div>
      </div>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow line-clamp-3 my-4 sm:my-5 leading-relaxed">
        {profile.description}
      </p>
      
      {/* Action */}
      <Link to={`/profile/${generateSlug(profile.name)}`} className="w-full py-2.5 sm:py-3 px-4 bg-gray-50 dark:bg-slate-950 hover:bg-blue-50 text-gray-700 dark:text-gray-300 hover:text-blue-700 font-bold rounded-xl text-sm transition-all border border-gray-200 dark:border-slate-700 hover:border-blue-200 shadow-sm group-hover:shadow-md mt-auto text-center">
        View Profile
      </Link>
    </div>
  </div>
);

// ─── SkeletonCard ──────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="w-[320px] sm:w-[360px] lg:w-[340px] snap-center shrink-0 h-full">
    <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Cover skeleton */}
      <div className="h-20 sm:h-24 bg-gray-100 dark:bg-slate-800 animate-pulse" />
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col flex-grow relative">
        {/* Avatar skeleton */}
        <div className="relative -mt-10 sm:-mt-12 mb-3 sm:mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse border-4 border-white" />
        </div>
        {/* Name skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse w-3/4 mb-2" />
        {/* Title skeleton */}
        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse w-1/2 mb-2" />
        {/* Location skeleton */}
        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse w-1/3 mb-4" />
        {/* Description skeleton */}
        <div className="flex-grow space-y-2 my-4">
          <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse w-full" />
          <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse w-5/6" />
          <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse w-4/6" />
        </div>
        {/* Button skeleton */}
        <div className="h-11 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse w-full mt-auto" />
      </div>
    </div>
  </div>
);

// ─── SectionHeader ─────────────────────────────────────────────────
const SectionHeader = ({ title, onPrev, onNext, viewAllPath }: { title: string, onPrev?: () => void, onNext?: () => void, viewAllPath?: string }) => (
  <div className="flex items-center justify-between mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
    <div className="flex items-center gap-4 sm:gap-6">
      {viewAllPath ? (
        <Link to={viewAllPath} className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors hidden sm:flex items-center group cursor-pointer">View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
      ) : null}
      {onPrev && onNext && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={onPrev} className="p-2 sm:p-2.5 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={onNext} className="p-2 sm:p-2.5 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}
    </div>
  </div>
);

// ─── AnimatedCounter (Intersection Observer) ───────────────────────
function useAnimatedCounter(target: number, duration: number = 2000, inView: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, inView]);

  return count;
}

function StatCard({ icon, value, suffix, label, gradient }: {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  gradient: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const count = useAnimatedCounter(value, 2000, inView);

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center overflow-hidden backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 glass-card-hover ${gradient}`}
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 rounded-2xl sm:rounded-3xl" />
      {/* Decorative blob */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/30 dark:bg-slate-900/30 rounded-full blur-2xl" />
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm mb-4 text-blue-600">
          {icon}
        </div>
        <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          {count.toLocaleString()}<span className="text-blue-600">{suffix}</span>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-semibold mt-2">{label}</p>
      </div>
    </div>
  );
}

// ─── Stats Section ─────────────────────────────────────────────────
const StatsSection = ({ memberCount, countryCount, clinicCount }: { memberCount: number; countryCount: number; clinicCount: number }) => {
  const stats = [
    { icon: <Users className="w-6 h-6 sm:w-7 sm:h-7" />, value: memberCount, suffix: '+', label: 'Members', gradient: 'bg-gradient-to-br from-blue-100 to-indigo-50' },
    { icon: <Globe className="w-6 h-6 sm:w-7 sm:h-7" />, value: countryCount, suffix: '+', label: 'Countries', gradient: 'bg-gradient-to-br from-emerald-100 to-teal-50' },
    { icon: <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />, value: clinicCount, suffix: '+', label: 'Clinics', gradient: 'bg-gradient-to-br from-amber-100 to-orange-50' },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-[120px] pointer-events-none" />
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-gradient-to-br from-emerald-300/20 via-transparent to-transparent rounded-full blur-[80px] animate-blob" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-gradient-to-tl from-amber-300/15 via-transparent to-transparent rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-[35%] h-[35%] bg-gradient-to-br from-rose-300/10 via-transparent to-transparent rounded-full blur-[90px] animate-blob animation-delay-4000" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
          >
            Trusted by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Global Community</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-500 dark:text-gray-400 mt-3 text-base sm:text-lg max-w-xl mx-auto"
          >
            Growing every day with passionate optometry professionals and students worldwide.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Why FocusLinks Features Section ───────────────────────────────
const WhyFocusLinksSection = () => {
  const features = [
    { icon: <Globe className="w-6 h-6" />, title: 'Global Directory', desc: 'Discover and connect with optometrists, students, and clinics worldwide.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: <Microscope className="w-6 h-6" />, title: 'Clinical Tools', desc: 'Access AI-powered simulators, calculators, and diagnostic utilities in our innovation lab.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: <GraduationCap className="w-6 h-6" />, title: 'Academy & Webinars', desc: 'Masterclasses and learning modules designed by leading experts for continuous growth.', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: <MessageSquare className="w-6 h-6" />, title: 'Community Feed', desc: 'Share clinical cases, discuss trends, and collaborate with peers in real-time.', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: <Activity className="w-6 h-6" />, title: 'Case Forum', desc: 'Present challenging cases, get multi-disciplinary opinions, and sharpen your clinical acumen.', color: 'text-rose-600', bg: 'bg-rose-50' },
    { icon: <Briefcase className="w-6 h-6" />, title: 'Career Center', desc: 'Find job opportunities, mentorship programs, and professional development resources.', color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/60 dark:bg-slate-950/60 border-y border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold mb-4 border border-gray-200 dark:border-slate-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Platform Highlights
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight"
          >
            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">FocusLinks</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-gray-500 dark:text-gray-400 mt-3 text-base sm:text-lg max-w-xl mx-auto"
          >
            Everything you need to grow professionally, all in one place.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.01, rotateX: 2, rotateY: -2 }}
              style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Testimonials ──────────────────────────────────────────────────
const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Optometrist',
    location: 'Mumbai, India',
    initials: 'PS',
    quote: 'FocusLinks has completely transformed how I connect with fellow optometrists globally. The case forum helped me solve a complex diagnostic dilemma within hours.',
    rating: 5,
    gradient: 'from-blue-50 to-indigo-50',
  },
  {
    name: 'Michael Torres',
    role: 'Contact Lens Specialist',
    location: 'Barcelona, Spain',
    initials: 'MT',
    quote: 'The Labs tools are incredible. IPD Measure Pro saved me so much chair time. This platform truly understands what clinicians need in their daily practice.',
    rating: 5,
    gradient: 'from-emerald-50 to-teal-50',
  },
  {
    name: 'Aisha Okonkwo',
    role: 'Optometry Student',
    location: 'Lagos, Nigeria',
    initials: 'AO',
    quote: 'As a student, the Academy webinars and global directory have been invaluable for my learning journey. I found a mentor through the Career Center!',
    rating: 5,
    gradient: 'from-amber-50 to-orange-50',
  },
  {
    name: 'Dr. Kenji Watanabe',
    role: 'Pediatric Optometrist',
    location: 'Tokyo, Japan',
    initials: 'KW',
    quote: 'The community here is genuinely supportive. I regularly share my myopia management protocols and receive thoughtful feedback from peers worldwide.',
    rating: 5,
    gradient: 'from-purple-50 to-pink-50',
  },
  {
    name: 'Sarah Mitchell',
    role: 'Practice Owner',
    location: 'Sydney, Australia',
    initials: 'SM',
    quote: 'From clinical tools to career resources, FocusLinks is the Swiss Army knife for optometry. Our practice has grown significantly since joining the community.',
    rating: 4,
    gradient: 'from-rose-50 to-red-50',
  },
];

const TestimonialsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.children[0]?.getBoundingClientRect().width || 360;
    const gap = 24;
    scrollRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: 'smooth' });
    setActiveDot(index);
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveDot(prev => {
        const next = (prev + 1) % testimonials.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, scrollToIndex]);

  // Sync dots on manual scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.children[0]?.getBoundingClientRect().width || 360;
    const gap = 24;
    const idx = Math.round(scrollLeft / (cardWidth + gap));
    setActiveDot(Math.min(idx, testimonials.length - 1));
  };

  const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-purple-600', 'bg-rose-600'];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-purple-50/50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/30 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-semibold mb-4 border border-gray-200 dark:border-slate-700 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Community Love
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            What Our Members Say
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-base sm:text-lg max-w-xl mx-auto">
            Real stories from optometry professionals and students around the world.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 hide-scrollbar"
          >
            {testimonials.map((t, i) => (
              <div key={i} className="w-[320px] sm:w-[380px] snap-center shrink-0">
                <div className={`bg-gradient-to-br ${t.gradient} rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full border border-gray-100/60 flex flex-col relative`}>
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-4 shrink-0" />
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-4 h-4 ${si < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  {/* Quote text */}
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed flex-grow mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
                    <div className={`w-10 h-10 rounded-full ${colors[i]} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{t.role} · {t.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeDot
                    ? 'w-8 h-2.5 bg-blue-600'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── Floating Particles ────────────────────────────────────────────
const particles = [
  { top: '8%', left: '12%', size: 'w-1.5 h-1.5', delay: '0s', duration: '7s' },
  { top: '15%', left: '78%', size: 'w-2 h-2', delay: '1.5s', duration: '9s' },
  { top: '25%', left: '45%', size: 'w-1 h-1', delay: '0.5s', duration: '6s' },
  { top: '35%', left: '88%', size: 'w-1.5 h-1.5', delay: '2s', duration: '8s' },
  { top: '45%', left: '20%', size: 'w-2.5 h-2.5', delay: '3s', duration: '10s' },
  { top: '55%', left: '65%', size: 'w-1 h-1', delay: '1s', duration: '7s' },
  { top: '18%', left: '33%', size: 'w-1.5 h-1.5', delay: '4s', duration: '9s' },
  { top: '65%', left: '50%', size: 'w-2 h-2', delay: '0.8s', duration: '8s' },
  { top: '72%', left: '82%', size: 'w-1 h-1', delay: '2.5s', duration: '6s' },
  { top: '40%', left: '5%', size: 'w-2 h-2', delay: '1.2s', duration: '11s' },
  { top: '80%', left: '30%', size: 'w-1.5 h-1.5', delay: '3.5s', duration: '9s' },
  { top: '10%', left: '60%', size: 'w-1 h-1', delay: '0.3s', duration: '7s' },
  { top: '50%', left: '92%', size: 'w-2 h-2', delay: '2.8s', duration: '10s' },
  { top: '30%', left: '72%', size: 'w-1.5 h-1.5', delay: '1.8s', duration: '8s' },
];

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {particles.map((p, i) => (
      <div
        key={i}
        className={`absolute rounded-full bg-white/20 dark:bg-blue-400/15 ${p.size} animate-particle-float`}
        style={{ top: p.top, left: p.left, animationDelay: p.delay, animationDuration: p.duration }}
      />
    ))}
  </div>
);

// ─── Main Home Component ───────────────────────────────────────────
export default function Home() {
  const { listProfiles, loadingList, errorList, fetchListProfiles } = useProfiles();
  
  // Auth state
  const isGuest = useSyncExternalStore(
    () => () => {},
    () => !localStorage.getItem('fl_user'),
    () => true
  );
  
  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  // ─── Real-time stats from /api/opto-map ─────────────────────────
  const [mapStats, setMapStats] = useState<{ totalProfiles: number; totalUsers: number; countriesCount: number; totalClinics: number } | null>(null);

  useEffect(() => {
    fetch('/api/opto-map')
      .then(res => res.json())
      .then(data => {
        if (data?.stats) setMapStats(data.stats);
      })
      .catch(() => {});
  }, []);

  const professionals = useMemo(() => 
    listProfiles.filter(p => p.type === 'professional'),
    [listProfiles]
  );
  
  const students = useMemo(() => 
    listProfiles.filter(p => p.type === 'student'),
    [listProfiles]
  );

  // Computed fallbacks from listProfiles (public directory only)
  const fallbackCountryCount = useMemo(() => {
    const countries = new Set<string>();
    for (const p of listProfiles) {
      if (!p.location) continue;
      const parts = p.location.split(',');
      const country = parts.length > 1 ? parts[parts.length - 1].trim() : p.location.trim();
      if (country) countries.add(country.toLowerCase());
    }
    return countries.size;
  }, [listProfiles]);

  const fallbackClinicCount = useMemo(() =>
    listProfiles.filter(p =>
      p.type === 'clinic' || (p.title && p.title.toLowerCase().includes('clinic'))
    ).length,
    [listProfiles]
  );

  // Use real-time stats from /api/opto-map, fallback to computed values
  const memberCount = mapStats ? mapStats.totalProfiles + mapStats.totalUsers : listProfiles.length;
  const countryCount = mapStats?.countriesCount ?? fallbackCountryCount;
  const clinicCount = mapStats?.totalClinics ?? fallbackClinicCount;

  const profScrollRef = useRef<HTMLDivElement>(null);
  const studentScrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  // ─── Enhanced Search: Recent & Popular ──────────────────────────
  const popularSearches = [
    'Myopia management', 'Contact lens fitting', 'Board exam prep',
    'Clinical cases', 'Pediatric optometry', 'Dry eye treatment',
    'Optometry school', 'Practice management',
  ];

  const trendingSearches = [
    'Low-dose atropine 2026', 'Ortho-K outcomes', 'AI in optometry',
  ];

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('focuslinks-recent-searches');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    }
    return [];
  });

  const addRecentSearch = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try { localStorage.setItem('focuslinks-recent-searches', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try { localStorage.removeItem('focuslinks-recent-searches'); } catch {}
  }, []);

  const handleSearchItemClick = useCallback((query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
    if (isGuest) {
      navigate('/login');
    } else {
      navigate(`/explore?query=${encodeURIComponent(query)}`);
    }
    setIsSearchFocused(false);
  }, [navigate, addRecentSearch, isGuest]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    // Combine global search data with local professionals/students for a rich search experience
    const localProfiles = [...professionals, ...students].map((p, idx) => ({
      id: `local-prof-${idx}`,
      type: 'Profile',
      title: p.name,
      desc: p.title,
      path: '/directory',
      icon: <Users className="w-5 h-5 text-indigo-500" />
    }));

    const allData = [...globalSearchData, ...localProfiles];
    
    // Deduplicate by title to avoid showing the same profile twice if it's in both lists
    const uniqueData = Array.from(new Map(allData.map(item => [item.title, item])).values());

    return uniqueData.filter(item => {
      const title = (item.title || '').toLowerCase();
      const desc = (item.desc || '').toLowerCase();
      const type = (item.type || '').toLowerCase();
      return title.includes(query) || desc.includes(query) || type.includes(query);
    }).slice(0, 6); // Limit to top 6 results
  }, [searchQuery, professionals, students]);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      if (isGuest) {
        navigate('/login');
      } else {
        navigate(`/explore?query=${encodeURIComponent(searchQuery.trim())}`);
      }
      setIsSearchFocused(false);
    }
  };

  // Recent articles from API
  const [recentArticles, setRecentArticles] = useState<Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    coverImage?: string;
    authorName: string;
    createdAt: string;
    views: number;
  }>>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/articles?action=list-published&limit=3')
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data?.articles) {
          setRecentArticles(data.articles);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingArticles(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <SEO title="FocusLinks | Global Optometry Platform" description="World's First Global Platform for Optometrists — connecting vision professionals, students, and organizations worldwide with tools, community, and career resources." keywords="optometry, optometrist, eye care, vision science, clinical tools, optometry community, global directory" />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50/50 via-white to-white py-16 sm:py-32 px-4 sm:px-6 lg:px-8 text-center border-b border-gray-100 dark:border-slate-800">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 mix-blend-multiply filter blur-[100px] animate-blob"></div>
          <div className="absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
          
          {/* Animated mesh/grid pattern */}
          <div className="absolute inset-0 animated-mesh-bg opacity-60 [mask-image:linear-gradient(to_bottom,white_20%,transparent)]"></div>
          {/* Subtle dot overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
          
          {/* Floating Particles */}
          <FloatingParticles />
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />
        </div>

        <div className="relative max-w-4xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/membership" className="inline-flex items-center gap-2 py-1.5 px-3 sm:px-4 rounded-full bg-white/80 dark:bg-slate-900/80 text-blue-700 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-blue-100 shadow-sm backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer group">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Join our growing community
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 sm:mb-6 leading-[1.1]"
          >
            A Global Platform<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-x">for Optometrists</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-gray-500 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
          >
            Connecting vision professionals, students, and organizations worldwide. Find peers, discover opportunities, and grow your career.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 shadow-2xl shadow-blue-900/10 rounded-2xl p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 relative z-[999]"
            ref={searchRef}
          >
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${isSearchFocused ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500'}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="block w-full pl-11 sm:pl-13 pr-3 sm:pr-4 py-4 sm:py-5 border-none rounded-xl leading-5 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-0 text-base sm:text-lg transition-all"
                placeholder="Search tools, events, articles, profiles, topics..."
              />
              
              {/* Search Dropdown — No Query: Popular, Trending, Recent */}
              {!searchQuery && isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[450px] ring-1 ring-slate-900/5 origin-top animate-in fade-in slide-in-from-top-4 duration-200 text-left z-[999] w-[calc(100vw-2rem)] sm:w-full -ml-4 sm:ml-0">
                  <div className="overflow-y-auto p-3 sm:p-4 space-y-4">
                    {/* Trending Searches */}
                    {trendingSearches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5 px-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Trending</span>
                        </div>
                        <div className="space-y-0.5">
                          {trendingSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => handleSearchItemClick(term)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
                            >
                              <TrendingUp className="w-4 h-4 text-orange-400 shrink-0" />
                              <span className="text-sm font-medium text-slate-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5 px-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Recent</span>
                          </div>
                          <button
                            onClick={clearRecentSearches}
                            className="text-[11px] font-medium text-slate-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Clear
                          </button>
                        </div>
                        <div className="space-y-0.5">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => handleSearchItemClick(term)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
                            >
                              <Clock className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                              <span className="text-sm font-medium text-slate-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 truncate">{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <div className="flex items-center gap-2 mb-2.5 px-1">
                        <Compass className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Popular Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearchItemClick(term)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800"
                          >
                            <Search className="w-3.5 h-3.5" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Dropdown — With Query: Results */}
              {searchQuery && isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[60vh] sm:max-h-[400px] ring-1 ring-slate-900/5 origin-top animate-in fade-in slide-in-from-top-4 duration-200 text-left z-[999] w-[calc(100vw-2rem)] sm:w-full -ml-4 sm:ml-0 px-2 sm:px-0">
                  <div className="p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Search Results
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-gray-500">
                      {filteredResults.length} found
                    </span>
                  </div>
                  <div className="overflow-y-auto p-2 sm:p-3 space-y-1 sm:space-y-2">
                    {filteredResults.length > 0 ? (
                      filteredResults.map(result => (
                        <Link 
                          key={result.id} 
                          to={result.path} 
                          className="w-full flex items-center p-2 sm:p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-200"
                        >
                          <div className="p-2 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm transition-all duration-300 mr-3 sm:mr-4 shrink-0">
                            {result.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                              <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">{result.type}</span>
                              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors text-sm sm:text-base line-clamp-1">{result.title}</h4>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 line-clamp-1 group-hover:text-slate-600 transition-colors">{result.desc}</p>
                          </div>
                          <div className="shrink-0 ml-2 sm:ml-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 sm:p-12 text-center text-slate-500 dark:text-gray-400">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Search className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 dark:text-gray-600" />
                        </div>
                        <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-1">No results found</p>
                        <p className="text-xs sm:text-sm">We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={handleSearchSubmit}
              className="shimmer-shine inline-flex items-center justify-center px-6 sm:px-8 py-4 sm:py-5 border border-transparent text-sm sm:text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap active:scale-95 hover-glow"
            >
              Explore
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Guest CTA: Join FocusLinks ─── */}
      {isGuest && (
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 p-8 sm:p-12 text-center shadow-2xl shadow-teal-500/20">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Free to Join · No Credit Card Required
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
                  Ready to grow your<br />optometry career?
                </h2>
                <p className="text-teal-100 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
                  Join 600+ optometrists and students already connecting, learning, and growing on FocusLinks.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-700 font-bold rounded-xl text-center shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all active:scale-[0.98] text-sm sm:text-base"
                  >
                    <Users className="w-5 h-5" />
                    Become a Member
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/40 text-white font-bold rounded-xl text-center hover:bg-white/10 transition-all active:scale-[0.98] text-sm sm:text-base"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ─── Quick Links Row (logged-in only) ─── */}
      {!isGuest && (
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { name: 'Directory', icon: <DirectoryIcon className="w-6 h-6" />, path: '/directory', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/30', ring: 'ring-blue-200/60 dark:ring-blue-800/40' },
              { name: 'Feed', icon: <FeedIcon className="w-6 h-6" />, path: '/feed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/80 dark:from-emerald-950/40 dark:to-emerald-900/30', ring: 'ring-emerald-200/60 dark:ring-emerald-800/40' },
              { name: 'Blog', icon: <BlogIcon className="w-6 h-6" />, path: '/blog', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-950/40 dark:to-purple-900/30', ring: 'ring-purple-200/60 dark:ring-purple-800/40' },
              { name: 'Labs', icon: <LabsIcon className="w-6 h-6" />, path: '/labs', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-gradient-to-br from-amber-50 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/30', ring: 'ring-amber-200/60 dark:ring-amber-800/40' },
            ].map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="glass-card-hover glass-panel rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 cursor-pointer group text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${link.bg} ${link.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-1 ${link.ring} shadow-sm`}>
                  {link.icon}
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{link.name}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>
      )}

      {/* ─── Quick Links Floating Bar (logged-in only) ─── */}
      {!isGuest && (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
            {[
              { icon: <ProfilesIcon className="w-6 h-6" />, label: 'Profiles', path: '/directory', color: 'text-blue-600 dark:text-blue-400', gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/40', ring: 'ring-blue-200/60 dark:ring-blue-800/40', glow: 'hover:shadow-blue-500/25' },
              { icon: <BlogIcon className="w-6 h-6" />, label: 'Blog', path: '/blog', color: 'text-purple-600 dark:text-purple-400', gradient: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/40', ring: 'ring-purple-200/60 dark:ring-purple-800/40', glow: 'hover:shadow-purple-500/25' },
              { icon: <EventsIcon className="w-6 h-6" />, label: 'Events', path: '/events', color: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/40', ring: 'ring-amber-200/60 dark:ring-amber-800/40', glow: 'hover:shadow-amber-500/25' },
              { icon: <LabsIcon className="w-6 h-6" />, label: 'Labs', path: '/labs', color: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/40', ring: 'ring-emerald-200/60 dark:ring-emerald-800/40', glow: 'hover:shadow-emerald-500/25' },
              { icon: <AcademyIcon className="w-6 h-6" />, label: 'Academy', path: '/academy', color: 'text-rose-600 dark:text-rose-400', gradient: 'from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/40', ring: 'ring-rose-200/60 dark:ring-rose-800/40', glow: 'hover:shadow-rose-500/25' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                whileHover={{ y: -4, scale: 1.05 }}
              >
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-2.5 px-5 sm:px-7 py-4 sm:py-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-slate-700/60 shadow-lg ${item.glow} hover:shadow-xl hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-300 group cursor-pointer`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center ${item.color} ring-1 ${item.ring} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      )}

      {/* ─── Activity Pulse & Stats — only shown to guests (marketing) ─── */}
      {isGuest && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center py-4"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-gray-200/60 dark:border-slate-700/60 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">12 members online now</span>
            </div>
          </motion.div>

          {/* ─── Animated Stats Counter Section ─── */}
          <StatsSection memberCount={memberCount} countryCount={countryCount} clinicCount={clinicCount} />
        </>
      )}

      {/* ─── OptoMap Section ─── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/60 dark:bg-slate-950/60 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 text-teal-700 dark:text-teal-400 text-xs sm:text-sm font-semibold mb-4 border border-teal-200/60 dark:border-teal-800/40 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              Global Community
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Find Professionals <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Near You</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-base sm:text-lg max-w-xl mx-auto">
              Connect with optometrists, clinics, and students in your area and across the globe.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-teal-900/10 border border-gray-200 dark:border-slate-700"
          >
            <MiniMap />
          </motion.div>

          <div className="flex justify-center mt-6">
            <Link to="/opto-map" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 shadow-sm hover:shadow-md transition-all group">
              Open Full Map
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Community Highlights Section ─── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold mb-4 border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Community Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Trending in the Community
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              { name: 'Dr. Priya Sharma', initials: 'PS', role: 'Optometrist', location: 'Mumbai', color: 'bg-blue-600', excerpt: 'Just published a comprehensive guide on managing pediatric myopia with low-dose atropine therapy. Must-read for every practitioner!', likes: 47, comments: 12 },
              { name: 'Prof. James Wilson', initials: 'JW', role: 'Research Scientist', location: 'London', color: 'bg-purple-600', excerpt: 'Our latest research on AI-assisted retinal screening accuracy is now available. Results show 94.7% sensitivity.', likes: 83, comments: 28 },
              { name: 'Aisha Okonkwo', initials: 'AO', role: 'Optometry Student', location: 'Lagos', color: 'bg-emerald-600', excerpt: 'Passed my board exam on the first attempt! Here are the top 10 study strategies that helped me succeed.', likes: 126, comments: 34 },
            ].map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 sm:p-6 hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer group"
                style={{ perspective: '1000px' }}
                onClick={() => { toast.info('Opening post by ' + post.name); }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${post.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                    {post.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{post.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.role} · {post.location}</p>
                  </div>
                  <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.comments}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Webinar Ended — Claim Certificate Banner */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Link to="/beyond-orthok" className="relative block w-full rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 shadow-2xl group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] group-hover:bg-emerald-500/30 transition-colors duration-700"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] group-hover:bg-teal-500/30 transition-colors duration-700"></div>
          
          <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 w-full max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                <GraduationCap className="w-3 h-3" />
                Webinar Ended — Claim Your Certificate
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                Beyond Ortho-K: Practical & Affordable Myopia Management with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Contact Lenses</span>
              </h2>
              <p className="text-slate-300 text-base sm:text-lg mb-6">
                This webinar has ended. Claim your certificate of participation now!
              </p>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-4 sm:gap-x-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">Completed May 6, 2026</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-700"></div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400 shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">Manish Bhagat</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-slate-700"></div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-white font-medium text-sm sm:text-base">Certificate Available</span>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-auto mt-2 lg:mt-0 flex-shrink-0">
              <div className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-base sm:text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
                Claim Certificate <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ─── Why FocusLinks? Features Section ─── */}
      <WhyFocusLinksSection />

      {/* Featured Professionals */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Featured Professionals" onPrev={() => scrollLeft(profScrollRef)} onNext={() => scrollRight(profScrollRef)} viewAllPath="/directory" />
        </div>
        <div 
          ref={profScrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-8 hide-scrollbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {loadingList ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : errorList ? (
            <div className="w-full text-center py-10 text-red-500">Error loading profiles: {errorList}</div>
          ) : professionals.length > 0 ? (
            professionals.map((prof, i) => (
              <div key={`${prof.name}-${i}`} className="w-[320px] sm:w-[360px] lg:w-[340px] snap-center shrink-0 h-full">
                <ProfileCard profile={prof} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-10 text-gray-500 dark:text-gray-400">No professionals found.</div>
          )}
        </div>
      </section>

      {/* Student Directory */}
      <section className="py-12 sm:py-20 bg-gray-50/50 dark:bg-slate-950/50 border-y border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Student Directory" onPrev={() => scrollLeft(studentScrollRef)} onNext={() => scrollRight(studentScrollRef)} viewAllPath="/directory" />
        </div>
        <div 
          ref={studentScrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-8 hide-scrollbar max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {loadingList ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : students.length > 0 ? (
            students.map((student, i) => (
              <div key={`${student.name}-${i}`} className="w-[320px] sm:w-[360px] lg:w-[340px] snap-center shrink-0 h-full">
                <ProfileCard profile={student} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-10 text-gray-500 dark:text-gray-400">No students found.</div>
          )}
        </div>
      </section>

      {/* ─── Testimonials Carousel Section ─── */}
      <TestimonialsSection />

      {/* Labs Section */}
      <section className="py-12 sm:py-24 bg-slate-950 text-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                <FlaskConical className="w-3.5 h-3.5" /> Innovation Hub
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">FocusLinks <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Labs</span></h2>
              <p className="text-slate-400 dark:text-gray-500 text-lg leading-relaxed">Explore our experimental playground of AI-powered utilities, clinical simulators, and advanced research tools designed for the modern practitioner.</p>
            </div>
            <Link to="/labs" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 dark:bg-slate-900/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold transition-all group whitespace-nowrap">
              Explore All Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { 
                title: 'OD CAM', 
                desc: 'AI Clinical Empathy Simulator',
                icon: <Smartphone className="w-6 h-6" />, 
                color: 'text-rose-400', 
                bg: 'bg-rose-400/10',
                path: '/labs/od-cam',
                tag: 'AI Vision',
                isComingSoon: false
              },
              { 
                title: 'OptoScholar', 
                desc: 'Clinical Research Engine',
                icon: <Search className="w-6 h-6" />, 
                color: 'text-blue-400', 
                bg: 'bg-blue-400/10',
                path: '/labs/optoscholar',
                tag: 'Research',
                isComingSoon: false
              },
              { 
                title: 'IPD Measure Pro', 
                desc: 'Webcam-based PD Measurement',
                icon: <Camera className="w-6 h-6" />, 
                color: 'text-purple-400', 
                bg: 'bg-purple-400/10',
                path: '/labs/ipd-measure',
                tag: 'Computer Vision',
                isComingSoon: false
              },
              { 
                title: 'RAPD Simulator', 
                desc: 'Pupillary Defect Practice',
                icon: <Eye className="w-6 h-6" />, 
                color: 'text-amber-400', 
                bg: 'bg-amber-400/10',
                path: '/labs/rapd-simulator',
                tag: 'Simulation',
                isComingSoon: false
              }
            ].map((tool, idx) => (
              <Link 
                key={idx} 
                to={tool.path} 
                className="group relative bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 hover:bg-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col items-start overflow-hidden"
              >
                {/* Hover Glow */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 ${tool.bg} rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="flex items-center justify-between w-full mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                    {tool.icon}
                  </div>
                  {tool.isComingSoon ? (
                    <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">Coming Soon</span>
                  ) : (
                    <span className={`px-2 py-1 rounded-md ${tool.bg} ${tool.color} text-[10px] font-bold uppercase tracking-wider border border-transparent`}>{tool.tag}</span>
                  )}
                </div>
                
                <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2 group-hover:text-blue-400 transition-colors tracking-tight">{tool.title}</h3>
                  <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">{tool.desc}</p>
                </div>
                
                <div className="mt-auto pt-4 w-full border-t border-slate-800/50 flex items-center justify-between relative z-10">
                  <span className="text-xs font-bold text-slate-400 dark:text-gray-500 group-hover:text-blue-400 transition-colors">
                    {tool.isComingSoon ? 'Notify Me' : 'Launch Tool'}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles & Courses Section — Enhanced with blog data */}
      <section className="py-12 sm:py-20 bg-white dark:bg-slate-900 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Latest Blog Posts — now showing real data */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Latest Insights</h2>
                <Link to="/blog" className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors flex items-center group">
                  Explore Blog <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="space-y-4 flex flex-col gap-4">
                {loadingArticles ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col sm:flex-row animate-pulse">
                      <div className="w-full sm:w-40 h-32 sm:h-auto shrink-0 bg-gray-100 dark:bg-slate-800" />
                      <div className="p-4 sm:p-5 flex flex-col justify-center flex-grow gap-3">
                        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded-lg w-2/3" />
                        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg w-full" />
                        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg w-4/5" />
                        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/3" />
                      </div>
                    </div>
                  ))
                ) : recentArticles.length > 0 ? (
                  recentArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col sm:flex-row"
                    >
                      {/* Cover Image */}
                      <div className="w-full sm:w-40 h-32 sm:h-auto shrink-0 bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-slate-800 dark:to-slate-700 relative overflow-hidden">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-blue-300 dark:text-slate-600" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-4 sm:p-5 flex flex-col justify-center flex-grow">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug mb-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">{article.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                          <span className="font-medium text-gray-600 dark:text-gray-400">{article.authorName}</span>
                          <span>·</span>
                          <span>{new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  // Empty state
                  <div className="text-center py-12 px-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <PenLine className="w-7 h-7 text-blue-400 dark:text-slate-500" />
                    </div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Be the first to write!</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Share your knowledge with the community.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Academy / Courses — Coming Soon with badge */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Academy</h2>
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Coming Soon
                  </span>
                </div>
                <Link to="/academy/beyond-the-phoropter" className="text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors flex items-center group">
                  View Masterclass <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 sm:p-10 text-white flex flex-col items-center justify-center text-center h-full min-h-[300px] relative overflow-hidden group">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-16 h-16 bg-white/10 dark:bg-slate-900/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center mb-6 relative z-10">
                  <GraduationCap className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-black mb-2 relative z-10">Professional Learning</h3>
                <p className="text-blue-400 font-black uppercase tracking-widest text-xs mb-4 relative z-10">New Modules Loading</p>
                <p className="text-slate-400 dark:text-gray-500 text-sm max-w-xs relative z-10">
                  Our structured learning paths are being finalized to help you master the modern optometry landscape.
                </p>
                {/* Shimmer coming soon effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>

          </div>
        </div>
      </section>

    </>
  );
}
