'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from '../../context/NavigationContext';
import {
  Search,
  TrendingUp,
  Hash,
  Heart,
  MessageSquare,
  UserPlus,
  Clock,
  Calendar,
  ArrowRight,
  ChevronRight,
  Compass,
  Stethoscope,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Monitor,
  BookOpen,
  Award,
  Building2,
  Users,
  Flame,
  Star,
  Zap,
  FileText,
  Trophy,
  ArrowUpRight,
  Sparkles,
  Share2,
  ChevronLeft,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

// ─── Data ──────────────────────────────────────────────────────────
const trendingTopics = [
  { tag: '#Myopia', count: 2847, color: 'from-amber-500 to-orange-500' },
  { tag: '#ContactLenses', count: 2134, color: 'from-emerald-500 to-teal-500' },
  { tag: '#PediatricOptometry', count: 1856, color: 'from-pink-500 to-rose-500' },
  { tag: '#LowVision', count: 1423, color: 'from-violet-500 to-purple-500' },
  { tag: '#BinocularVision', count: 1198, color: 'from-cyan-500 to-blue-500' },
  { tag: '#OptometrySchool', count: 987, color: 'from-indigo-500 to-blue-500' },
  { tag: '#BoardExam', count: 876, color: 'from-rose-500 to-red-500' },
  { tag: '#ClinicalCases', count: 765, color: 'from-teal-500 to-emerald-500' },
  { tag: '#Glaucoma', count: 654, color: 'from-amber-400 to-yellow-500' },
  { tag: '#DryEye', count: 543, color: 'from-sky-500 to-blue-500' },
  { tag: '#NeuroOptometry', count: 432, color: 'from-fuchsia-500 to-pink-500' },
  { tag: '#OCT', count: 321, color: 'from-emerald-400 to-green-500' },
];

const trendingPosts: Array<{
  id: string;
  author: { name: string; avatar: string; role: string };
  title: string;
  excerpt: string;
  likes: number;
  comments: number;
  category: string;
  time: string;
  gradient: string;
}> = [];

const suggestedProfiles = [
  {
    name: 'Dr. Lisa Huang',
    role: 'Glaucoma Specialist',
    location: 'Vancouver, Canada',
    avatar: 'LH',
    color: 'bg-emerald-600',
    followers: 2340,
    posts: 89,
  },
  {
    name: 'Dr. Carlos Mendoza',
    role: 'Retina & Uveitis Expert',
    location: 'Mexico City, Mexico',
    avatar: 'CM',
    color: 'bg-amber-600',
    followers: 1876,
    posts: 124,
  },
  {
    name: 'Emily Johnson',
    role: 'Low Vision Researcher',
    location: 'London, UK',
    avatar: 'EJ',
    color: 'bg-purple-600',
    followers: 1543,
    posts: 56,
  },
  {
    name: 'Dr. Raj Patel',
    role: 'Neuro-Optometrist',
    location: 'Mumbai, India',
    avatar: 'RP',
    color: 'bg-rose-600',
    followers: 3102,
    posts: 201,
  },
];

// 6 specific categories as requested
const categories = [
  {
    icon: <Stethoscope className="w-6 h-6" />,
    title: 'Clinical Cases',
    description: 'Share and discuss challenging patient cases',
    posts: 1247,
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'from-amber-50 to-orange-50',
    bgDark: 'from-amber-950/30 to-orange-950/30',
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    title: 'Research',
    description: 'Latest studies, papers, and clinical trials',
    posts: 893,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'from-emerald-50 to-teal-50',
    bgDark: 'from-emerald-950/30 to-teal-950/30',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Education',
    description: 'Learning resources, webinars, and tutorials',
    posts: 756,
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'from-blue-50 to-indigo-50',
    bgDark: 'from-blue-950/30 to-indigo-950/30',
  },
  {
    icon: <Briefcase className="w-6 h-6" />,
    title: 'Career',
    description: 'Job postings, mentorship, and professional growth',
    posts: 534,
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'from-purple-50 to-violet-50',
    bgDark: 'from-purple-950/30 to-violet-950/30',
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: 'Technology',
    description: 'AI, devices, and innovation in eye care',
    posts: 678,
    gradient: 'from-cyan-500 to-blue-600',
    bgLight: 'from-cyan-50 to-blue-50',
    bgDark: 'from-cyan-950/30 to-blue-950/30',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Community',
    description: 'Connect, network, and grow together',
    posts: 1023,
    gradient: 'from-pink-500 to-rose-600',
    bgLight: 'from-pink-50 to-rose-50',
    bgDark: 'from-pink-950/30 to-rose-950/30',
  },
];

const upcomingEvents: Array<{
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  image: string;
  type: string;
}> = [];

const hotActivity: Array<{
  id: string;
  user: string;
  action: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}> = [];

// ─── Floating Particle Component ──────────────────────────────────
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    })),
  []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Featured Carousel ────────────────────────────────────────────
function FeaturedCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const featured = trendingPosts.slice(0, 3);

  useEffect(() => {
    if (featured.length === 0) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featured.length]);

  if (featured.length === 0) {
    return (
      <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 rounded-2xl p-8 border border-gray-100 dark:border-slate-800/50 text-center">
        <Star className="w-10 h-10 text-violet-300 dark:text-violet-700 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No featured content yet</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Trending posts will appear here as the community grows.</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + featured.length) % featured.length);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % featured.length);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const item = featured[current];

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className={`bg-gradient-to-r ${item.gradient} p-6 sm:p-8 border border-gray-100 dark:border-slate-800/50`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Featured</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">· {item.time}</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-500 dark:to-gray-700 flex items-center justify-center text-white font-bold text-sm">
              {item.author.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{item.author.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.author.role}</p>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl leading-snug mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{item.excerpt}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info(`Opening: ${item.title}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm"
            >
              Read More <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {item.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {item.comments}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {item.likes * 4}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); if (timerRef.current) clearInterval(timerRef.current); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-violet-500' : 'w-1.5 bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-900 transition-colors shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Topic Tag Cloud ──────────────────────────────────────────────
function TopicTagCloud() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {trendingTopics.map((topic, i) => (
        <motion.button
          key={topic.tag}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toast.info(`Browsing ${topic.tag} posts`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
        >
          {/* Hover gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-5`} />
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${topic.color} relative z-10`} />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-white transition-colors relative z-10">{topic.tag}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium group-hover:text-white/70 transition-colors relative z-10">{topic.count.toLocaleString()}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Trending Topic Pill ───────────────────────────────────────────
const TrendingTopicPill = ({ topic, index }: { topic: typeof trendingTopics[0]; index: number }) => (
  <motion.button
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => toast.info(`Browsing ${topic.tag} posts`)}
    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all group"
  >
    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${topic.color}`} />
    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{topic.tag}</span>
    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{topic.count.toLocaleString()}</span>
  </motion.button>
);

// ─── Trending Post Card ────────────────────────────────────────────
const TrendingPostCard = ({ post, index }: { post: typeof trendingPosts[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 group"
  >
    <div className={`bg-gradient-to-r ${post.gradient} p-4 border-b border-gray-100/50 dark:border-slate-800/50`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-500 dark:to-gray-700 flex items-center justify-center text-white font-bold text-xs">
            {post.author.avatar}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{post.author.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{post.time}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider">
          <Flame className="w-3 h-3" />
          Trending
        </span>
      </div>
      <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-2">{post.category}</span>
      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{post.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{post.excerpt}</p>
    </div>
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors group/like">
          <Heart className="w-4 h-4 group-hover/like:scale-110 transition-transform" />
          <span className="text-xs font-semibold">{post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-semibold">{post.comments}</span>
        </button>
      </div>
      <button className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors">
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// ─── Profile Suggestion Card ───────────────────────────────────────
const ProfileSuggestionCard = ({ profile, onFollow }: { profile: typeof suggestedProfiles[0]; onFollow: (name: string) => void }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(prev => !prev);
    onFollow(profile.name);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 transition-all group">
      <div className={`w-11 h-11 rounded-full ${profile.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
        {profile.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{profile.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.role}</p>
      </div>
      <button
        onClick={handleFollow}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isFollowing
            ? 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

// ─── Event Card ────────────────────────────────────────────────────
const EventCard = ({ event, index }: { event: typeof upcomingEvents[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4 }}
    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 group"
  >
    <div className="relative h-40 overflow-hidden">
      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-bold text-gray-800 dark:text-gray-200">
        {event.type}
      </span>
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <Users className="w-4 h-4 text-white/80" />
        <span className="text-xs font-semibold text-white/90">{event.attendees.toLocaleString()} attending</span>
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{event.title}</h3>
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Monitor className="w-4 h-4 shrink-0" />
          <span>{event.location}</span>
        </div>
      </div>
      <button
        onClick={() => toast.success(`Registered for "${event.title}"!`)}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white text-sm font-bold transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
      >
        Register Now <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// ─── Category Card ─────────────────────────────────────────────────
const CategoryCard = ({ category, index }: { category: typeof categories[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, delay: index * 0.06 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative rounded-2xl overflow-hidden cursor-pointer group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className={`relative bg-gradient-to-br ${category.bgLight} dark:${category.bgDark} p-5 sm:p-6 border border-gray-100 dark:border-slate-800 group-hover:border-transparent rounded-2xl h-full transition-all`}>
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} text-white flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
        {category.icon}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1.5">{category.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{category.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">{category.posts.toLocaleString()} posts</span>
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  </motion.div>
);

// ─── Dynamic Article Interface ────────────────────────────────────
interface DynamicArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  authorName: string;
  createdAt: string;
  views: number;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

// ─── Article Card (Dynamic) ────────────────────────────────────────
const ArticleCard = ({ article, index }: { article: DynamicArticle; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    whileHover={{ y: -4 }}
  >
    <Link to={`/blog/${article.slug}`} className="block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 group">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[11px] font-bold text-gray-700 dark:text-gray-300">
          {article.category}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white/90">
          <Eye className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{article.views} views</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{article.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
            {getInitials(article.authorName)}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{article.authorName}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{timeAgo(article.createdAt)}</p>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

// ─── Hot Activity Item ─────────────────────────────────────────────
const HotActivityItem = ({ item, index }: { item: typeof hotActivity[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.06 }}
    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
  >
    <div className={`mt-0.5 p-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 ${item.color} shrink-0`}>
      {item.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
        <span className="font-semibold text-gray-900 dark:text-white">{item.user}</span>{' '}
        {item.action}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{item.time}</p>
    </div>
  </motion.div>
);

// ─── Section Title ─────────────────────────────────────────────────
const SectionTitle = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
    className="mb-6 sm:mb-8"
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-sm">
        {icon}
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
    </div>
    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">{subtitle}</p>}
  </motion.div>
);

// ─── Main Explore Component ────────────────────────────────────────
export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlQuery = useMemo(() => {
    const queryIdx = location.pathname.indexOf('?query=');
    if (queryIdx !== -1) {
      return decodeURIComponent(location.pathname.substring(queryIdx + 7));
    }
    return '';
  }, [location.pathname]);

  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [visibleItems, setVisibleItems] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [articles, setArticles] = useState<DynamicArticle[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"`);
    }
  };

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleItems(prev => Math.min(prev + 6, 20));
      setIsLoadingMore(false);
    }, 800);
  }, []);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && visibleItems < 20) {
          handleLoadMore();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoadingMore, visibleItems, handleLoadMore]);

  // Fetch articles for Trending Articles section
  useEffect(() => {
    let cancelled = false;
    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/articles?action=list-published&limit=3');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();
        if (!cancelled) {
          setArticles(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setIsLoadingArticles(false);
      }
    };
    fetchArticles();
    return () => { cancelled = true; };
  }, []);

  const handleFollow = (name: string) => {
    toast.success(`You are now connected with ${name}!`);
  };

  return (
    <>
      <SEO
        title="Explore — FocusLinks"
        description="Discover trending topics, popular posts, top contributors, and upcoming events in the global optometry community."
      />

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-violet-950 to-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Animated gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{
              backgroundSize: '400% 400%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.2) 25%, rgba(16,185,129,0.2) 50%, rgba(139,92,246,0.3) 75%, rgba(59,130,246,0.2) 100%)',
            }}
          />
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        </div>

        {/* Floating Particles */}
        <FloatingParticles />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm">
              <Compass className="w-3.5 h-3.5" />
              Discover what&apos;s trending
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 sm:mb-6"
          >
            Explore
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-blue-200/80 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto"
          >
            Discover trending topics, popular content, and connect with the optometry community worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, posts, people, events..."
                className="w-full pl-12 pr-4 py-4 sm:py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400/50 text-sm sm:text-base transition-all"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex items-center justify-center gap-6 sm:gap-10 text-white/70"
          >
            {[
              { label: 'Members', value: '2.4k+' },
              { label: 'Posts', value: '5.6k+' },
              { label: 'Countries', value: '80+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left / Main Column */}
          <div className="flex-1 min-w-0">

            {/* Featured Content Carousel */}
            <SectionTitle
              icon={<Star className="w-5 h-5" />}
              title="Featured Content"
              subtitle="Hand-picked highlights from the community"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="mb-12 sm:mb-16"
            >
              <FeaturedCarousel />
            </motion.div>

            {/* Category Grid (6 categories) */}
            <SectionTitle
              icon={<Hash className="w-5 h-5" />}
              title="Browse Categories"
              subtitle="Find content by topic"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 sm:mb-16">
              {categories.map((category, i) => (
                <CategoryCard key={category.title} category={category} index={i} />
              ))}
            </div>

            {/* Trending Topics */}
            <SectionTitle
              icon={<TrendingUp className="w-5 h-5" />}
              title="Trending Topics"
              subtitle="Most discussed topics in the community right now"
            />
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="mb-12 sm:mb-16"
            >
              <TopicTagCloud />
            </motion.div>

            {/* Trending Posts */}
            <SectionTitle
              icon={<Flame className="w-5 h-5" />}
              title="Trending Posts"
              subtitle="Posts gaining the most engagement today"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 sm:mb-16">
              {trendingPosts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <Flame className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No trending posts yet</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Posts gaining engagement will appear here.</p>
                </div>
              ) : (
                trendingPosts.slice(0, visibleItems).map((post, i) => (
                  <TrendingPostCard key={post.id} post={post} index={i} />
                ))
              )}
            </div>

            {/* Load More */}
            {visibleItems < 20 && trendingPosts.length > 0 && (
              <div className="flex justify-center mb-12 sm:mb-16" ref={loadMoreRef}>
                <motion.button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-md transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Load More
                    </>
                  )}
                </motion.button>
              </div>
            )}

            {/* Popular Profiles */}
            <SectionTitle
              icon={<Users className="w-5 h-5" />}
              title="Suggested Connections"
              subtitle="People you might want to connect with"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12 sm:mb-16">
              {suggestedProfiles.map((profile, i) => (
                <motion.div
                  key={profile.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <ProfileSuggestionCard profile={profile} onFollow={handleFollow} />
                </motion.div>
              ))}
            </div>

            {/* Trending Articles */}
            <SectionTitle
              icon={<FileText className="w-5 h-5" />}
              title="Trending Articles"
              subtitle="Latest from the FocusLinks Blog"
            />
            <div className="mb-12 sm:mb-16">
              {isLoadingArticles ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-pulse">
                      <div className="h-44 bg-slate-200 dark:bg-slate-800" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                        <div className="flex items-center gap-2 pt-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
                          <div className="space-y-1 flex-1">
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No articles yet</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Published articles will appear here as the community contributes.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {articles.map((article, i) => (
                    <ArticleCard key={article.id} article={article} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <SectionTitle
              icon={<Calendar className="w-5 h-5" />}
              title="Upcoming Events"
              subtitle="Don't miss these opportunities"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12 sm:mb-16">
              {upcomingEvents.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No upcoming events yet</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Events will appear here as they are scheduled.</p>
                </div>
              ) : (
                upcomingEvents.map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))
              )}
            </div>
          </div>

          {/* Right / Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {/* What's Hot */}
            <div className="sticky top-24">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-sm">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">What&apos;s Hot</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Real-time activity</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-emerald-500 font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      Live
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-1 max-h-[480px] overflow-y-auto">
                  {hotActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Flame className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm text-slate-500 dark:text-gray-400">No recent activity</p>
                    </div>
                  ) : (
                    hotActivity.map((item, i) => (
                      <HotActivityItem key={item.id} item={item} index={i} />
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-slate-800">
                  <Link
                    to="/feed"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                  >
                    View All Activity <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5">
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Active Users', value: '2.4k', icon: <Users className="w-4 h-4 text-violet-500" /> },
                    { label: 'Posts Today', value: '147', icon: <FileText className="w-4 h-4 text-emerald-500" /> },
                    { label: 'Comments Today', value: '892', icon: <MessageSquare className="w-4 h-4 text-purple-500" /> },
                    { label: 'New Members', value: '38', icon: <UserPlus className="w-4 h-4 text-amber-500" /> },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {stat.icon}
                        <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
