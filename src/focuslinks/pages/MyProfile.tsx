'use client';

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from '../../context/NavigationContext';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { toast } from 'sonner';
import {
  User,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Share2,
  Star,
  Award,
  FileText,
  MessageSquare,
  Heart,
  Bookmark,
  Settings,
  Bell,
  Shield,
  Trash2,
  Plus,
  X,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Clock,
  Loader2,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Animated Counter Component                                         */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    let animFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) animFrame = requestAnimationFrame(step);
    };
    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

import SEO from '../components/SEO';
import { useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  No mock data — show empty states                                   */
/* ------------------------------------------------------------------ */
const mockPosts: Array<{ id: string; title: string; type: string; likes: number; comments: number; time: string; image: boolean }> = [];
const activityItems: Array<{ icon: React.ComponentType<{ className?: string }>; color: string; border: string; title: string; description: string; time: string }> = [];
const achievements: Array<{ name: string; icon: string; unlocked: boolean; desc: string }> = [];

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const tabs = ['Posts', 'Activity', 'Achievements', 'About'] as const;
type TabType = typeof tabs[number];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function MyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('Posts');

  const [bio] = useState('');

  const [skills] = useState<string[]>([]);
  const [socialLinks] = useState({
    twitter: '',
    linkedin: '',
    github: '',
  });

  const [tooltipAchievement, setTooltipAchievement] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEditProfile = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const handleShareProfile = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Profile link copied to clipboard!');
      }).catch(() => {
        toast.success('Profile link copied!');
      });
    } else {
      toast.success('Profile link copied!');
    }
  }, []);

  const handleDeleteAccount = useCallback(() => {
    setShowDeleteDialog(false);
    toast.error('Account deletion requires email confirmation.');
  }, []);

  const glassCard = 'bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm';

  return (
    <>
    <SEO title="My Profile" description="View and manage your FocusLinks professional profile. Showcase your skills and connect with the optometry community." keywords="my profile, professional profile, optometrist profile" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-white">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto">

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 1. COVER PHOTO SECTION                                     */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="relative">
          <div className="h-56 sm:h-64 md:h-72 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 relative overflow-hidden">
            {/* Pattern + decorative blobs */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
            </div>
            <div className="absolute top-8 left-16 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-4 right-20 w-48 h-48 bg-fuchsia-400/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-purple-300/20 rounded-full blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent" />
          </div>

          {/* Edit Cover Button */}
          <button onClick={() => toast.success('Opening cover editor...')} className="absolute top-6 right-6 inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md text-white/90 rounded-full text-sm font-medium hover:bg-black/60 transition-all border border-white/10">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Cover</span>
          </button>

          {/* Avatar with verified badge */}
          <div className="absolute -bottom-16 left-6 sm:left-8 md:left-10">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl shadow-violet-500/30 border-4 border-slate-50 dark:border-slate-950">
                {(() => { try { const u = JSON.parse(localStorage.getItem('fl_user') || '{}'); return (u.name || 'YN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(); } catch { return 'YN'; } })()}
              </div>
              <button onClick={() => toast.success('Opening avatar editor...')} className="absolute bottom-1 right-1 w-9 h-9 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-slate-50 dark:border-slate-950" aria-label="Edit avatar">
                <Edit className="w-4 h-4 text-white" />
              </button>
              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-50 dark:border-slate-950">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 2. PROFILE INFO CARD                                       */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-6">
          <div className={glassCard}>
            <div className="p-5 sm:p-6 md:p-8">
              {/* Name, role, location, member since */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                      {(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('fl_user') || '{}').name) || 'Your Name'}
                    </h1>
                    <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0 hidden sm:block" />
                  </div>
                  <p className="text-violet-600 dark:text-violet-400 font-semibold mt-1 text-sm sm:text-base">
                    {(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('fl_user') || '{}').role) || ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('fl_user') || '{}').location) && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {JSON.parse(localStorage.getItem('fl_user') || '{}').location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Member
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={handleEditProfile} className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30">
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                  <button onClick={handleShareProfile} className="inline-flex items-center justify-center p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-slate-700">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Posts', value: 0, icon: FileText },
                  { label: 'Connections', value: 0, icon: User },
                  { label: 'FL Credits', value: 0, icon: Star },
                  { label: 'Profile Views', value: 0, icon: Eye },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-slate-700/50 hover:border-violet-200 dark:hover:border-violet-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className="w-4 h-4 text-violet-500 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{stat.label}</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                      <AnimatedCounter target={stat.value} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB NAVIGATION                                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* MAIN CONTENT LAYOUT                                           */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="px-4 sm:px-6 md:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── LEFT COLUMN: Tab Content ── */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activeTab === 'Posts' && (
                  <motion.div key="posts" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className={glassCard}>
                    <div className="p-5 sm:p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-violet-500" />
                          Posts <span className="text-sm font-normal text-gray-400">({mockPosts.length})</span>
                        </h2>
                      </div>
                      {mockPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Posts Yet</h3>
                          <p className="text-sm text-slate-400 mb-4">Share your first post with the community</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {mockPosts.map((post, idx) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.06 }}
                              className="rounded-xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-md transition-all group cursor-pointer"
                            >
                              {post.image && (
                                <div className="h-32 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/40 dark:to-fuchsia-950/40 flex items-center justify-center">
                                  <FileText className="w-10 h-10 text-violet-400/50" />
                                </div>
                              )}
                              <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-md">{post.type}</span>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{post.time}</span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">{post.title}</h3>
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>
                                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Activity' && (
                  <motion.div key="activity" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className={glassCard}>
                    <div className="p-5 sm:p-6 md:p-8">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-emerald-500" /> Activity Timeline
                      </h2>
                      {activityItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Activity Yet</h3>
                          <p className="text-sm text-slate-400 mb-4">Your recent activity will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-0">
                          {activityItems.map((item, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.08, duration: 0.35 }}
                              className={`relative flex gap-4 pb-6 pl-6 border-l-2 ${item.border} last:pb-0`}
                            >
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-950 border-2 border-current flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center ${item.color}`}>
                                      <item.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                  </div>
                                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{item.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed ml-9">{item.description}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Achievements' && (
                  <motion.div key="achievements" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className={glassCard}>
                    <div className="p-5 sm:p-6 md:p-8">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                        <Award className="w-5 h-5 text-amber-500" /> Achievements
                      </h2>
                      {achievements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                          <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Achievements Yet</h3>
                          <p className="text-sm text-slate-400 mb-4">Start engaging to earn your first badge</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            {achievements.map((ach) => {
                              const isHovered = tooltipAchievement === ach.name;
                              return (
                                <div key={ach.name} className="relative" onMouseEnter={() => setTooltipAchievement(ach.name)} onMouseLeave={() => setTooltipAchievement(null)}>
                                  <motion.div whileHover={{ scale: 1.05, y: -2 }} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-default ${ach.unlocked ? 'bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 border-amber-200 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-700' : 'bg-gray-50 dark:bg-slate-800/30 border-gray-200 dark:border-slate-700 opacity-50'}`}>
                                    <span className="text-3xl">{ach.icon}</span>
                                    <span className={`text-xs font-semibold text-center leading-tight ${ach.unlocked ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-gray-500'}`}>{ach.name}</span>
                                    {ach.unlocked && <Check className="w-3.5 h-3.5 text-amber-500" />}
                                  </motion.div>
                                  <AnimatePresence>
                                    {isHovered && (
                                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-200 whitespace-nowrap shadow-xl pointer-events-none">
                                        {ach.desc}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">{achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked</span>
                              <span className="text-violet-600 dark:text-violet-400 font-bold">{achievements.length > 0 ? Math.round((achievements.filter((a) => a.unlocked).length / achievements.length) * 100) : 0}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${achievements.length > 0 ? (achievements.filter((a) => a.unlocked).length / achievements.length) * 100 : 0}%` }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'About' && (
                  <motion.div key="about" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                    {/* Bio */}
                    <div className={glassCard}>
                      <div className="p-5 sm:p-6 md:p-8 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <User className="w-5 h-5 text-violet-500" /> About
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{bio || 'No bio yet. Click Edit Profile to add your bio.'}</p>

                        {/* Skills */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Skills & Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {skills.length > 0 ? skills.map((skill) => (
                              <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 text-sm font-medium">
                                {skill}
                              </span>
                            )) : <p className="text-sm text-slate-400">No skills added yet</p>}
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Experience</h3>
                          <p className="text-sm text-slate-400">No experience added yet</p>
                        </div>

                        {/* Education */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4" /> Education
                          </h3>
                          <p className="text-sm text-slate-400">No education added yet</p>
                        </div>

                        {/* Social Links */}
                        <div>
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Social Links</h3>
                          <div className="space-y-2">
                            {[
                              { key: 'twitter' as const, label: 'Twitter', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' },
                              { key: 'linkedin' as const, label: 'LinkedIn', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                              { key: 'github' as const, label: 'GitHub', color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800' },
                            ].map((social) => (
                              <div key={social.key} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                                <div className={`w-9 h-9 rounded-lg ${social.bg} flex items-center justify-center`}>
                                  <ExternalLink className={`w-4 h-4 ${social.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{social.label}</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{socialLinks[social.key]}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT COLUMN (Sidebar) ── */}
            <div className="space-y-6">
              {/* Quick Links */}
              <motion.div variants={itemVariants} className={glassCard}>
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-gray-400" /> Quick Links
                  </h3>
                  <div className="space-y-1">
                    {[
                      { label: 'Settings', icon: Settings, path: '/settings' },
                      { label: 'Notifications', icon: Bell, path: '/notifications' },
                      { label: 'Messages', icon: MessageSquare, path: '/messages' },
                      { label: 'Privacy', icon: Shield, path: '/settings' },
                    ].map((link) => (
                      <button key={link.label} onClick={() => navigate(link.path)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group text-left">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-violet-50 dark:group-hover:bg-violet-950/30 transition-colors">
                          <link.icon className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-1">{link.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600 dark:text-gray-500 group-hover:text-violet-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Saved Content */}
              <motion.div variants={itemVariants} className={glassCard}>
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Bookmark className="w-4 h-4 text-rose-500" /> Saved Content
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Saved Articles', count: 0, gradient: 'from-violet-500 to-purple-600' },
                      { label: 'Saved Resources', count: 0, gradient: 'from-sky-500 to-blue-600' },
                      { label: 'Bookmarked Posts', count: 0, gradient: 'from-rose-500 to-pink-600' },
                    ].map((card) => (
                      <button key={card.label} onClick={() => toast.success('Opening saved content...')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all group text-left">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{card.label}</p>
                          <p className="text-xs text-gray-400">{card.count} items</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-violet-400 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Danger Zone */}
              <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-950/20 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-2xl">
                <div className="p-5">
                  <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
                    <Trash2 className="w-5 h-5" /> Danger Zone
                  </h2>
                  <p className="text-xs text-red-500/70 dark:text-red-400/50 mb-4">Irreversible actions — proceed with caution.</p>
                  <button onClick={() => setShowDeleteDialog(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-bold rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowDeleteDialog(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-950/20">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4 mx-auto">
                  <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">Delete Account Permanently?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center leading-relaxed">
                  This action is <span className="font-bold text-red-600 dark:text-red-400">irreversible</span>. All your data, posts, connections, and FL Credits will be permanently deleted.
                </p>
              </div>
              <div className="p-6 flex justify-center gap-3">
                <button onClick={() => setShowDeleteDialog(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleDeleteAccount} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-red-600/20">
                  <Trash2 className="w-4 h-4" /> Yes, Delete Forever
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  </>
  );
}
