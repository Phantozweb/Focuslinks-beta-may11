'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from '../../context/NavigationContext';
import { Calendar, Video, Wrench, Users, ArrowRight, Trophy, Clock, ChevronLeft, ChevronRight, User, Zap, Sparkles, BookOpen, Globe, Radio, Send, CheckCircle, Search, Eye, MessageCircle, TrendingUp, Award, GraduationCap, Briefcase, Cpu, Stethoscope, PenLine, BarChart3, Flame } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 1200, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart || target <= 0) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
}

/* ─── Stat Card ─── */
function CommunityStat({ icon: Icon, label, value, suffix, color, delay }: { icon: any; label: string; value: number; suffix: string; color: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useAnimatedCounter(value, 1500, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="glass-card rounded-2xl p-6 text-center hover-glow glass-panel"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums text-shimmer">
        {count}{suffix}
      </p>
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">{label}</p>
    </motion.div>
  );
}

const tools = [
  {
    title: "OD CAM",
    developer: "Focus Links",
    description: "Real-time simulator for clinical empathy, student education, and caregiver understanding powered by Focus.Ai V5.5.",
    type: "AI Vision",
    path: "/labs/od-cam",
    icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 border-violet-100 dark:border-violet-800/50 group-hover:border-violet-200"
  },
  {
    title: "OptoScholar Research Engine",
    developer: "Focus Links",
    description: "Specialized clinical search for optometry. 1M+ indexed articles.",
    type: "Research",
    path: "/labs/optoscholar",
    icon: <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 border-blue-100 dark:border-blue-800/50 group-hover:border-blue-200"
  },
  {
    title: "IPD Measure Pro",
    developer: "Focus Links",
    description: "An AI-powered tool to accurately measure interpupillary distance using your webcam.",
    type: "AI Tool",
    path: "/labs/ipd-measure",
    icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 border-amber-100 dark:border-amber-800/50 group-hover:border-amber-200"
  },
  {
    title: "RAPD Simulator Practice",
    developer: "Focus Links",
    description: "Practice the swinging flashlight test to detect Relative Afferent Pupillary Defects.",
    type: "Simulator",
    path: "/labs/rapd-simulator",
    icon: <Globe className="w-6 h-6 sm:w-7 sm:h-7" />,
    color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 border-emerald-100 dark:border-emerald-800/50 group-hover:border-emerald-200"
  }
];

const categories = [
  {
    title: "Events & Competitions",
    description: "Participate in global challenges and test your clinical knowledge.",
    path: "/events",
    icon: Calendar,
    color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-700",
    linkColor: "text-blue-600",
    glowColor: "hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30"
  },
  {
    title: "Academy Webinars",
    description: "Learn from industry leaders through live and recorded sessions.",
    path: "/events",
    icon: Video,
    color: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white",
    hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
    linkColor: "text-violet-600",
    glowColor: "hover:shadow-violet-200/50 dark:hover:shadow-violet-900/30"
  },
  {
    title: "Clinical Tools",
    description: "Access calculators, reference guides, and practice management tools.",
    path: "/labs",
    icon: Wrench,
    color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white",
    hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
    linkColor: "text-emerald-600",
    glowColor: "hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30"
  }
];

/* ─── Topic Categories ─── */
const topicCategories = [
  { name: 'Clinical Cases', icon: <Stethoscope className="w-6 h-6" />, count: 342, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { name: 'Research', icon: <GraduationCap className="w-6 h-6" />, count: 218, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-900/30' },
  { name: 'Career Advice', icon: <Briefcase className="w-6 h-6" />, count: 156, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  { name: 'Student Life', icon: <GraduationCap className="w-6 h-6" />, count: 189, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  { name: 'Technology', icon: <Cpu className="w-6 h-6" />, count: 124, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-50 dark:bg-rose-900/30' },
  { name: 'Board Prep', icon: <BarChart3 className="w-6 h-6" />, count: 97, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
];

/* ─── Trending Discussions ─── */
const trendingDiscussions: Array<{ title: string; author: string; initials: string; avatarColor: string; replies: number; views: number; category: string; time: string }> = [];

/* ─── Community Leaders ─── */
const communityLeaders: Array<{ name: string; points: number; rank: number; initials: string; color: string; badge: string; badgeColor: string }> = [];

/* ─── Countdown Timer ─── */
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };
    const init = setTimeout(() => setTimeLeft(calc()), 0);
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => { clearTimeout(init); clearInterval(timer); };
  }, [targetDate]);

  const blocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  return (
    <div ref={ref} className="flex gap-3">
      {blocks.map((block, i) => (
        <motion.div
          key={block.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">{String(block.value).padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase tracking-wider mt-1.5">{block.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export default function Community() {
  const toolsScrollRef = useRef<HTMLDivElement>(null);
  const articlesScrollRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const [currentDot, setCurrentDot] = useState(0);
  const [registering, setRegistering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startingDiscussion, setStartingDiscussion] = useState(false);
  const [articles, setArticles] = useState<Array<{ id: string; slug: string; title: string; excerpt: string; category: string; coverImage?: string; authorName: string; createdAt: string; views: number }>>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Fetch published articles
  useEffect(() => {
    let cancelled = false;
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        const res = await fetch('/api/articles?action=list-published&limit=6');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) {
          setArticles(Array.isArray(data?.articles) ? data.articles : []);
        }
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setArticlesLoading(false);
      }
    };
    fetchArticles();
    return () => { cancelled = true; };
  }, []);

  // Auto-scroll for articles carousel (only when articles exist)
  useEffect(() => {
    if (autoScrollPaused || !articlesScrollRef.current || articles.length === 0) return;
    const interval = setInterval(() => {
      const el = articlesScrollRef.current;
      if (!el || articles.length === 0) return;
      const cardWidth = el.scrollWidth / articles.length;
      const nextScroll = el.scrollLeft + cardWidth;
      if (nextScroll >= el.scrollWidth - el.clientWidth + 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
        setCurrentDot(0);
      } else {
        el.scrollBy({ left: cardWidth, behavior: 'smooth' });
        setCurrentDot((prev) => Math.min(prev + 1, articles.length - 1));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoScrollPaused, articles.length]);

  const handleDotClick = useCallback((index: number) => {
    const el = articlesScrollRef.current;
    if (!el || articles.length === 0) return;
    const cardWidth = el.scrollWidth / articles.length;
    el.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    setCurrentDot(index);
  }, [articles.length]);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  const handleSubscribe = useCallback(() => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribed(true);
      toast.success('Successfully subscribed!', {
        description: 'You\'ll receive our latest updates in your inbox.',
      });
    }, 1200);
  }, [email]);

  const handleRegister = useCallback(() => {
    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      toast.success('Registration confirmed!', {
        description: 'You\'ll receive a reminder before the webinar starts.',
      });
    }, 1500);
  }, []);

  const handleStartDiscussion = useCallback(() => {
    setStartingDiscussion(true);
    setTimeout(() => {
      setStartingDiscussion(false);
      toast.success('Discussion started! 🎉', {
        description: 'Your new discussion has been posted to the community.',
      });
    }, 1500);
  }, []);

  const webinarDate = new Date('2026-05-06T10:00:00');

  // Filter discussions by search
  const filteredDiscussions = trendingDiscussions.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Optometry Community" description="Join the global FocusLinks optometry community. Share cases, discuss trends, collaborate with peers, and grow professionally." keywords="optometry community, eye care forum, clinical discussion, optometrist network" />
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 relative"
        >
          {/* Animated decorative blobs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[80px] animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-[70px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 right-0 w-40 h-40 bg-emerald-400/15 dark:bg-emerald-600/10 rounded-full blur-[60px] animate-blob animation-delay-4000" />

          {/* Floating decorative particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full ${i % 3 === 0 ? 'bg-blue-400/10 dark:bg-blue-400/8' : i % 3 === 1 ? 'bg-violet-400/10 dark:bg-violet-400/8' : 'bg-emerald-400/10 dark:bg-emerald-400/8'} animate-float-slow`}
                style={{
                  width: `${4 + (i % 4) * 2}px`,
                  height: `${4 + (i % 4) * 2}px`,
                  top: `${10 + (i * 7.5) % 80}%`,
                  left: `${5 + (i * 9) % 90}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${6 + (i % 3) * 2}s`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative z-10"
          >
            {/* Animated badge */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-6 border border-blue-200 dark:border-blue-800/50"
            >
              <Radio className="w-4 h-4" />
              Live Community Hub
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Official{' '}
              <span className="text-gradient">Community Hub</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed mb-8 max-w-2xl mx-auto">
              Stay updated with official FocusLinks announcements, expert-led webinars, and clinical tools.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/feed" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 hover:shadow-xl hover:-translate-y-0.5">
                <Users className="w-5 h-5" /> Explore User Feed
              </Link>
              <Link to="/directory" className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                <User className="w-5 h-5" /> Professional Directory
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Community Stats Bar ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16"
        >
          <CommunityStat icon={Users} label="Total Members" value={10} suffix="K+" color="bg-blue-500" delay={0.3} />
          <CommunityStat icon={Radio} label="Online Now" value={342} suffix="" color="bg-emerald-500" delay={0.4} />
          <CommunityStat icon={MessageCircle} label="Discussions" value={1126} suffix="+" color="bg-violet-500" delay={0.5} />
          <CommunityStat icon={BookOpen} label="Resources Shared" value={500} suffix="+" color="bg-amber-500" delay={0.6} />
        </motion.div>

        {/* ─── Topic Categories Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Browse Topics</h2>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Explore discussions by category</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {topicCategories.map((topic, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-blue-500/10 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer group text-center hover:-translate-y-1 hover-glow animate-glow-border"
              >
                <div className={`w-12 h-12 rounded-xl ${topic.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <div className={`bg-gradient-to-br ${topic.color} bg-clip-text text-transparent`}>
                    {topic.icon}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{topic.name}</h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">{topic.count} posts</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Discussions + Community Leaders Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* ─── Trending Discussions ─── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Trending Discussions</h2>
              </div>
              <Link to="/feed" className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors hidden sm:flex items-center group">
                View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Discussion List */}
            <div className="space-y-3">
              {filteredDiscussions.length === 0 && !searchQuery ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Discussions Yet</h3>
                  <p className="text-sm text-slate-400 mb-4">Be the first to start a discussion in the community</p>
                </div>
              ) : filteredDiscussions.length === 0 && searchQuery ? (
                <div className="text-center py-12">
                  <Search className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-gray-400 font-medium">No discussions match your search.</p>
                </div>
              ) : (
              filteredDiscussions.map((discussion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ x: 4 }}
                  className="bg-white dark:bg-slate-800/60 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer group"
                >
                  {/* Fire/trending badge on top item */}
                  {i === 0 && (
                    <span className="absolute -top-2 -right-2 animate-fire-pulse inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow-md">
                      <Flame className="w-3 h-3" /> Hot
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${discussion.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                      {discussion.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-1 mb-1">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">{discussion.author}</span>
                        <span className="text-xs text-slate-400 dark:text-gray-500">·</span>
                        <span className="text-xs text-slate-400 dark:text-gray-500">{discussion.time}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-400 text-[10px] font-bold">{discussion.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="font-medium">{discussion.replies}</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="font-medium">{discussion.views >= 1000 ? `${(discussion.views / 1000).toFixed(1)}k` : discussion.views}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </div>

            {/* Start a Discussion Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartDiscussion}
              disabled={startingDiscussion}
              className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {startingDiscussion ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <PenLine className="w-4 h-4" />
                  Start a Discussion
                </>
              )}
            </motion.button>
          </motion.div>

          {/* ─── Community Leaders Sidebar ─── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Leaders Card */}
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Community Leaders</h3>
                </div>
                <div className="space-y-4">
                  {communityLeaders.length > 0 ? communityLeaders.map((leader, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      {/* Rank badge */}
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${leader.color} flex items-center justify-center text-white font-bold text-sm shadow-md ${i < 2 ? 'status-dot-online' : 'status-dot-offline'}`}>
                          {leader.initials}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
                          {leader.rank}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{leader.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${leader.badgeColor}`}>
                            {leader.badge}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">{leader.points.toLocaleString()} pts</span>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm text-slate-400">No leaders yet</p>
                    </div>
                  )}
                </div>
                <Link to="/directory" className="block mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                  View Full Leaderboard <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                </Link>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link to="/feed" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Community Feed</span>
                  </Link>
                  <Link to="/blog" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Latest Articles</span>
                  </Link>
                  <Link to="/labs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">AI Clinical Tools</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link to={cat.path} className={`bg-white dark:bg-slate-800/60 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl ${cat.glowColor} ${cat.hoverBorder} transition-all duration-300 group block hover:-translate-y-2`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{cat.title}</h3>
                <p className="text-slate-600 dark:text-gray-400 mb-4">{cat.description}</p>
                <span className={`${cat.linkColor} font-semibold text-sm flex items-center group-hover:gap-2 transition-all`}>
                  View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Webinar with Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Upcoming Webinar</h2>
            <Link to="/webinar/beyond-orthok-practical-and-affordable-myopia-management-with-contact-lens" className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors hidden sm:flex items-center group">View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
          <Link to="/webinar/beyond-orthok-practical-and-affordable-myopia-management-with-contact-lens" className="relative block w-full rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] group-hover:bg-blue-500/40 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] group-hover:bg-purple-500/40 transition-colors duration-700"></div>

            <div className="relative z-10 p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1 w-full">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  Upcoming Masterclass
                </motion.div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  Beyond Ortho-K: Practical & Affordable Myopia Management with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Contact Lenses</span>
                </h3>
                <p className="text-slate-300 text-lg max-w-2xl mb-6">
                  Join our expert speaker on May 6th for an exclusive interactive learning session. Prebook now to secure your spot and earn FL Credits!
                </p>

                {/* Speaker Info */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/10 w-fit">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                    DR
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Dr. Expert Speaker</p>
                    <p className="text-slate-400 text-xs">Myopia Management Specialist</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="text-white font-medium">May 6, 2026</span>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-slate-700"></div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="text-white font-medium">250 Registered</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full lg:w-auto mt-4 lg:mt-0 flex flex-col items-center gap-6">
                {/* Countdown */}
                <CountdownTimer targetDate={webinarDate} />

                {/* Register Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRegister(); }}
                  disabled={registering}
                  className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-70"
                >
                  {registering ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Register Now <ArrowRight className="w-5 h-5" /></>
                  )}
                </motion.button>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Featured Past Event */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Featured Past Events</h2>
            <Link to="/events" className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors hidden sm:flex items-center group">View Archives <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
          </div>
          <div className="bg-white dark:bg-slate-800/60 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="relative z-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <Clock className="w-3 h-3 mr-1" /> Event Concluded
                  </span>
                  <h3 className="text-3xl font-bold text-white mb-2">Eye Q Arena 2025</h3>
                  <p className="text-blue-200 font-medium">The International Optometry Knowledge Championship</p>
                </div>
              </div>
              <div className="md:col-span-3 p-8 flex flex-col justify-center">
                <p className="text-slate-600 dark:text-gray-400 text-lg mb-6 leading-relaxed">
                  This international optometry quiz competition brought together passionate optometry students, interns, and professionals from across the globe for a thrilling test of knowledge.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center text-sm text-slate-500 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2 text-slate-400 dark:text-gray-500" />
                    15+ Countries
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-gray-400">
                    <Trophy className="w-4 h-4 mr-2 text-slate-400 dark:text-gray-500" />
                    100 Questions
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400 dark:text-gray-500" />
                    Nov 2025
                  </div>
                </div>
                <Link to="/event/eye-q-arena" className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  View Results & Highlights <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Tools & Labs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">AI & Clinical Tools</h2>
            <div className="flex items-center gap-4">
              <Link to="/labs" className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors hidden sm:flex items-center group">View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button onClick={() => scrollLeft(toolsScrollRef)} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button onClick={() => scrollRight(toolsScrollRef)} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
          <div
            ref={toolsScrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 pb-8 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {tools.map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="w-[320px] sm:w-[360px] snap-center shrink-0 glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full hover-glow"
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-5">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors duration-300 border shadow-sm flex-shrink-0 ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">{tool.title}</h3>
                    <p className="text-xs sm:text-sm text-blue-600 font-semibold mt-0.5 sm:mt-1">{tool.developer}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-gray-400 mb-4 sm:mb-6 font-medium">
                  <p className="line-clamp-2">{tool.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 uppercase tracking-wide border border-slate-200 dark:border-slate-700">{tool.type}</span>
                  <Link to={tool.path} className="text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center group/btn px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-800">
                    Try Now <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Articles Carousel with Auto-scroll and Dots */}
        {!articlesLoading && articles.length === 0 ? null : (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Latest Insights</h2>
            <div className="flex items-center gap-4">
              <Link to="/blog" className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-800 dark:hover:text-blue-300 transition-colors hidden sm:flex items-center group">View All Insights <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></Link>
              {!articlesLoading && articles.length > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button onClick={() => scrollLeft(articlesScrollRef)} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button onClick={() => scrollRight(articlesScrollRef)} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              )}
            </div>
          </div>
          {articlesLoading ? (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 pb-8 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-[320px] sm:w-[400px] snap-center shrink-0 bg-white dark:bg-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
                  <div className="h-6 w-1/2 rounded bg-slate-200 dark:bg-slate-700 mb-4" />
                  <div className="space-y-2 mb-8">
                    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700 mb-1" />
                      <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div
            ref={articlesScrollRef}
            onMouseEnter={() => setAutoScrollPaused(true)}
            onMouseLeave={() => setAutoScrollPaused(false)}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 pb-8 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {articles.map((article) => (
              <Link key={article.id} to={`/blog/${article.slug}`} className="w-[320px] sm:w-[400px] snap-center shrink-0 bg-white dark:bg-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>

                <div className="relative z-10 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                      {article.category}
                    </span>
                    <div className="flex items-center text-xs text-slate-400 dark:text-gray-500 font-medium">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>{article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views} views</span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-slate-600 dark:text-gray-400 mb-8 line-clamp-3 leading-relaxed flex-grow">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{article.authorName}</span>
                      <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">{article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-slate-100 dark:border-slate-700 group-hover:border-blue-600">
                      <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
          {/* Navigation Dots */}
          {!articlesLoading && articles.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`h-2 rounded-full transition-all duration-300 ${currentDot === i ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          )}
        </motion.div>
        )}

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-300/10 rounded-full blur-[60px]"></div>

          <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                <Send className="w-5 h-5 text-blue-200" />
                <span className="text-blue-200 text-sm font-bold uppercase tracking-wider">Newsletter</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Stay in the Loop</h3>
              <p className="text-blue-100 max-w-lg text-lg">
                Get the latest articles, webinar announcements, and community updates delivered to your inbox.
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-300" />
                  <span className="text-white font-semibold">You&apos;re subscribed!</span>
                </motion.div>
              ) : (
                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 md:w-72 px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="px-6 py-3.5 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-70 flex items-center gap-2 shrink-0"
                  >
                    {subscribing ? (
                      <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin" />
                    ) : (
                      'Subscribe'
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
