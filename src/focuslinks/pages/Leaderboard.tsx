'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { useProfiles } from '../../hooks/useProfiles';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Users,
  Activity,
  Award,
  Target,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Minus,
  Lock,
  Zap,
  MessageSquare,
  UserPlus,
  BookOpen,
  Sparkles,
  Flame,
  Gem,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

interface LeaderboardMember {
  rank: number;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
  credits: number;
  posts: number;
  connections: number;
  score: number;
  trend: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

interface AchievementBadge {
  id: number;
  name: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
  color: string;
  bgColor: string;
}

/* ═══════════════════════════════════════════════════════
   HELPERS — Avatar Color & Initials Generation
   ═══════════════════════════════════════════════════════ */

const avatarColors = [
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-teal-400 to-cyan-500',
  'from-green-400 to-emerald-600',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-lime-400 to-green-500',
  'from-orange-400 to-amber-600',
  'from-cyan-400 to-blue-500',
  'from-pink-400 to-rose-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getTrend(name: string): 'up' | 'down' | 'same' {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 3) - hash);
  }
  const val = Math.abs(hash) % 3;
  if (val === 0) return 'up';
  if (val === 1) return 'down';
  return 'same';
}

/* ═══════════════════════════════════════════════════════
   DATA — 8 achievement badges
   ═══════════════════════════════════════════════════════ */

const achievementBadges: AchievementBadge[] = [
  { id: 1, name: 'First Post', description: 'Published your first community post', icon: MessageSquare, earned: true, color: 'from-emerald-400 to-green-500', bgColor: 'bg-emerald-50' },
  { id: 2, name: '100 Connections', description: 'Connected with 100 professionals', icon: UserPlus, earned: true, color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-50' },
  { id: 3, name: 'Top Contributor', description: 'Ranked in the top 10 leaderboard', icon: Trophy, earned: false, color: 'from-amber-400 to-yellow-500', bgColor: 'bg-amber-50' },
  { id: 4, name: 'Helpful Expert', description: 'Received 50+ helpful votes on answers', icon: Star, earned: true, color: 'from-green-400 to-teal-500', bgColor: 'bg-green-50' },
  { id: 5, name: 'Community Champion', description: 'Active member for 6+ consecutive months', icon: Flame, earned: false, color: 'from-orange-400 to-red-500', bgColor: 'bg-orange-50' },
  { id: 6, name: 'Rising Star', description: 'Joined and reached 500+ score in first month', icon: TrendingUp, earned: true, color: 'from-teal-400 to-emerald-500', bgColor: 'bg-teal-50' },
  { id: 7, name: 'Event Host', description: 'Successfully hosted a community event', icon: Gem, earned: false, color: 'from-rose-400 to-pink-500', bgColor: 'bg-rose-50' },
  { id: 8, name: 'Knowledge Sharer', description: 'Published 25+ educational resources', icon: BookOpen, earned: true, color: 'from-green-400 to-lime-500', bgColor: 'bg-green-50' },
];

/* ═══════════════════════════════════════════════════════
   HOOKS — Animated Counter
   ═══════════════════════════════════════════════════════ */

function useAnimatedCounter(target: number, duration = 1200, shouldStart = false): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart || target <= 0) {
      return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);

  if (!shouldStart || target <= 0) return 0;
  return count;
}

/* ═══════════════════════════════════════════════════════
   HELPERS — Rank Badge Styling
   ═══════════════════════════════════════════════════════ */

function getRankBadge(rank: number) {
  if (rank === 1)
    return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', icon: Crown };
  if (rank === 2)
    return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', icon: Medal };
  if (rank === 3)
    return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', icon: Medal };
  if (rank <= 10)
    return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: Star };
  return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: Zap };
}

function getTrendIcon(trend: 'up' | 'down' | 'same') {
  if (trend === 'up') return { Icon: ChevronUp, color: 'text-emerald-500' };
  if (trend === 'down') return { Icon: ChevronDown, color: 'text-red-400' };
  return { Icon: Minus, color: 'text-slate-400' };
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — FilterTabs
   ═══════════════════════════════════════════════════════ */

function FilterTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (value: string) => void;
}) {
  const tabs = ['This Week', 'This Month', 'All Time'];

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-white/10 p-1.5 border border-white/20 backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => {
            onChange(tab);
            toast.info(`Showing ${tab.toLowerCase()} rankings`);
          }}
          className={`relative rounded-xl px-4 py-2 text-xs font-bold transition-colors sm:px-5 sm:py-2.5 sm:text-sm ${
            active === tab ? 'text-white' : 'text-emerald-200 hover:text-white'
          }`}
        >
          {active === tab && (
            <motion.div
              layoutId="leaderboard-active-tab"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — StatCard (Platform Stats)
   ═══════════════════════════════════════════════════════ */

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const count = useAnimatedCounter(value, 1500, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div
        className={`mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 tabular-nums sm:text-3xl">
        {count.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — PodiumCard (Top 3)
   Uses flex layout ONLY, no absolute positioning for content
   ═══════════════════════════════════════════════════════ */

function PodiumCard({
  member,
  position,
  delay,
}: {
  member: LeaderboardMember;
  position: 'first' | 'second' | 'third';
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const animatedScore = useAnimatedCounter(member.score, 2000, isInView);

  const medalGradient: Record<string, string> = {
    first: 'from-amber-400 via-yellow-400 to-amber-500',
    second: 'from-slate-300 via-gray-300 to-slate-400',
    third: 'from-orange-400 via-amber-500 to-orange-600',
  };

  const borderClass: Record<string, string> = {
    first: 'border-amber-300',
    second: 'border-slate-300',
    third: 'border-orange-300',
  };

  const podiumBaseBg: Record<string, string> = {
    first: 'from-amber-50 to-white',
    second: 'from-slate-50 to-white',
    third: 'from-orange-50 to-white',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, type: 'spring', stiffness: 100 }}
      className="w-full sm:w-auto"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`overflow-hidden rounded-2xl border-2 ${borderClass[position]} bg-white shadow-lg`}
      >
        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${medalGradient[position]}`}
        />

        {/* Card body - centered flex column */}
        <div className="flex flex-col items-center gap-3 px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
          {/* Crown for #1 */}
          {position === 'first' && (
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="shrink-0"
            >
              <Crown className="h-7 w-7 text-amber-400 drop-shadow-md" />
            </motion.div>
          )}

          {/* Avatar */}
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${member.avatarColor} text-xl font-extrabold text-white shadow-md ring-3 ring-white sm:h-20 sm:w-20 sm:text-2xl sm:ring-4`}
          >
            {member.initials}
          </div>

          {/* Rank badge */}
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${medalGradient[position]} text-xs font-black text-white shadow-sm ring-2 ring-white`}
          >
            {member.rank}
          </div>

          {/* Name */}
          <h3 className="text-center text-base font-bold text-slate-900 sm:text-lg">
            {member.name}
          </h3>

          {/* Role */}
          <p className="max-w-[200px] truncate text-center text-xs text-slate-500">
            {member.role}
          </p>

          {/* Score */}
          <div className="mt-1 flex flex-col items-center">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums sm:text-3xl">
              {animatedScore.toLocaleString()}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Score
            </p>
          </div>
        </div>

        {/* Stats base */}
        <div
          className={`flex items-center justify-center gap-4 border-t border-slate-100 bg-gradient-to-t ${podiumBaseBg[position]} px-4 py-3 sm:gap-6 sm:py-4`}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-slate-700">
              {member.credits.toLocaleString()}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Credits
            </span>
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-slate-700">{member.posts}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Posts
            </span>
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-slate-700">
              {member.connections}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Connections
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — MobileRankCard (card-based row for mobile)
   ═══════════════════════════════════════════════════════ */

function MobileRankCard({
  member,
  index,
}: {
  member: LeaderboardMember;
  index: number;
}) {
  const badge = getRankBadge(member.rank);
  const { Icon: TrendIcon, color: trendColor } = getTrendIcon(member.trend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={() => toast.success(`Viewing ${member.name}'s profile`)}
      className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-3 transition-colors ${
        member.isCurrentUser
          ? 'border-emerald-300 bg-emerald-50/80'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      {/* Top row: rank + avatar + name + score */}
      <div className="flex items-center gap-3">
        {/* Rank badge */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${badge.bg} ${badge.border}`}
        >
          {member.rank <= 3 ? (
            <badge.icon className={`h-4 w-4 ${badge.text}`} />
          ) : (
            <span className={`text-xs font-bold ${badge.text}`}>{member.rank}</span>
          )}
        </div>

        {/* Avatar */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${member.avatarColor} text-xs font-bold text-white shadow-sm`}
        >
          {member.initials}
        </div>

        {/* Name + Role */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-slate-900">
              {member.name}
            </p>
            {member.isCurrentUser && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                You
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">{member.role}</p>
        </div>

        {/* Score + Trend */}
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            {member.score.toLocaleString()}
          </span>
          <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
        </div>
      </div>

      {/* Bottom row: stats */}
      <div className="flex items-center gap-4 pl-11">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-500" />
          <span className="text-xs font-semibold text-slate-600">
            {member.credits.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3 text-emerald-500" />
          <span className="text-xs font-semibold text-slate-600">
            {member.posts}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <UserPlus className="h-3 w-3 text-teal-500" />
          <span className="text-xs font-semibold text-slate-600">
            {member.connections}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — DesktopRankRow (table row for desktop)
   ═══════════════════════════════════════════════════════ */

function DesktopRankRow({
  member,
  index,
  topScore,
}: {
  member: LeaderboardMember;
  index: number;
  topScore: number;
}) {
  const badge = getRankBadge(member.rank);
  const { Icon: TrendIcon, color: trendColor } = getTrendIcon(member.trend);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => toast.success(`Viewing ${member.name}'s profile`)}
      className={`group grid cursor-pointer grid-cols-[64px_1fr_100px_80px_90px_100px_110px_48px] items-center gap-2 border-b border-slate-100 px-5 py-3 transition-colors last:border-b-0 ${
        member.isCurrentUser
          ? 'border-l-4 border-l-emerald-500 bg-emerald-50/80'
          : index % 2 === 0
            ? 'bg-white'
            : 'bg-slate-50/50'
      } hover:bg-emerald-50/40`}
    >
      {/* Rank */}
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${badge.bg} ${badge.border}`}
      >
        {member.rank <= 3 ? (
          <badge.icon className={`h-4 w-4 ${badge.text}`} />
        ) : (
          <span className={`text-xs font-bold ${badge.text}`}>{member.rank}</span>
        )}
      </div>

      {/* Member */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${member.avatarColor} text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-110`}
        >
          {member.initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-600">
              {member.name}
            </p>
            {member.isCurrentUser && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                You
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">{member.role}</p>
        </div>
      </div>

      {/* Credits */}
      <div className="text-right text-sm font-semibold text-slate-700 tabular-nums">
        {member.credits.toLocaleString()}
      </div>

      {/* Posts */}
      <div className="text-right text-sm font-semibold text-slate-700 tabular-nums">
        {member.posts}
      </div>

      {/* Connections */}
      <div className="text-right text-sm font-semibold text-slate-700 tabular-nums">
        {member.connections}
      </div>

      {/* Activity Bar */}
      <div className="flex items-center justify-end">
        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-400 transition-all"
            style={{ width: `${(member.score / topScore) * 100}%` }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="text-right text-sm font-bold text-slate-900 tabular-nums">
        {member.score.toLocaleString()}
      </div>

      {/* Trend */}
      <div className="flex justify-end">
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — AchievementBadgeCard
   ═══════════════════════════════════════════════════════ */

function AchievementBadgeCard({
  badge,
  index,
}: {
  badge: AchievementBadge;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={badge.earned ? { y: -4, scale: 1.02 } : {}}
      className={`flex items-start gap-3 rounded-xl border p-4 transition-shadow ${
        badge.earned
          ? 'border-emerald-200 bg-white shadow-sm hover:shadow-md'
          : 'border-slate-200 bg-slate-50 opacity-60'
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
          badge.earned
            ? `bg-gradient-to-br ${badge.color} shadow-sm`
            : 'bg-slate-200'
        }`}
      >
        {badge.earned ? (
          <badge.icon className="h-5 w-5 text-white" />
        ) : (
          <Lock className="h-4 w-4 text-slate-400" />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <h4
          className={`text-sm font-bold ${
            badge.earned ? 'text-slate-900' : 'text-slate-400'
          }`}
        >
          {badge.name}
        </h4>
        <p
          className={`mt-0.5 text-xs leading-relaxed ${
            badge.earned ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {badge.description}
        </p>
        {badge.earned && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: index * 0.07 + 0.3 }}
            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600"
          >
            <Sparkles className="h-3 w-3" />
            Earned
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — YourRankingCard (sidebar / inline)
   ═══════════════════════════════════════════════════════ */

function YourRankingCard({
  member,
  showCompact,
  nextRankScore: nextRankScoreProp,
  totalMembers,
}: {
  member: LeaderboardMember;
  showCompact?: boolean;
  nextRankScore?: number;
  totalMembers: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const nextRankScore = nextRankScoreProp ?? member.score;
  const progressToNext = Math.min(
    100,
    Math.round(
      ((member.score - (nextRankScore - 500)) /
        (nextRankScore - (nextRankScore - 500))) *
        100
    )
  );
  const percentile = Math.round(
    ((totalMembers - member.rank) / totalMembers) * 100
  );

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-500">
          <Target className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 sm:text-base">
          Your Ranking
        </h3>
      </div>

      {/* Rank + Score + Percentile */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-xl font-extrabold text-white shadow-md ring-3 ring-emerald-100">
          #{member.rank}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-slate-900">
            {member.score.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">Activity Score</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-emerald-600">Top {percentile}%</p>
          <p className="text-xs text-slate-500">Percentile</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">
            Progress to Rank #{member.rank - 1}
          </span>
          <span className="text-xs font-bold text-emerald-600">
            {progressToNext}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${progressToNext}%` } : {}}
            transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
            className="h-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400"
          >
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatDelay: 1,
              }}
              className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            {member.score.toLocaleString()} pts
          </span>
          <span className="text-[10px] text-slate-400">
            {nextRankScore.toLocaleString()} pts
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-900">
            {member.credits.toLocaleString()}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Credits
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-900">{member.posts}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Posts
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-900">
            {member.connections}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Connections
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — FloatingUserCard (appears on scroll)
   ═══════════════════════════════════════════════════════ */

function FloatingUserCard({ member, totalMembers }: { member: LeaderboardMember; totalMembers: number }) {
  const { Icon: TrendIcon, color: trendColor } = getTrendIcon(member.trend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="z-50"
    >
      {/* Mobile: full-width bottom banner */}
      <div className="fixed inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-emerald-300 bg-white px-4 py-2.5 shadow-lg md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-xs font-bold text-white">
            #{member.rank}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">Your Ranking</p>
            <p className="text-xs text-slate-500">
              {member.score.toLocaleString()} pts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <button
            onClick={() =>
              document
                .getElementById('your-ranking-section')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
          >
            View
          </button>
        </div>
      </div>

      {/* Desktop: fixed bottom-right card */}
      <div className="hidden fixed right-6 bottom-6 w-64 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl md:block">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-sm font-bold text-white">
            #{member.rank}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">Your Position</p>
            <p className="text-xs text-slate-500">
              Rank {member.rank} of {totalMembers}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold text-slate-900 tabular-nums">
              {member.score.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">Score</p>
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className="text-xs font-semibold text-emerald-600">Trending</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   COMPONENT — SectionHeader (reusable)
   ═══════════════════════════════════════════════════════ */

function SectionHeader({
  icon: Icon,
  iconBg,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3 sm:mb-8">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md sm:h-11 sm:w-11`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
          {title}
        </h2>
        <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT — Leaderboard
   ═══════════════════════════════════════════════════════ */

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const rankingSectionRef = useRef<HTMLDivElement>(null);
  const { listProfiles, loadingList, fetchListProfiles } = useProfiles();

  // Fetch profiles on mount
  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  // Get current user from localStorage
  const currentUserMembershipId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('fl_user');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.membershipId || null;
      }
    } catch {
      // ignore parse errors
    }
    return null;
  }, []);

  // Compute leaderboard data from real profiles
  const leaderboardData = useMemo<LeaderboardMember[]>(() => {
    if (!listProfiles || listProfiles.length === 0) return [];

    // Filter out membership_application types
    const validProfiles = listProfiles.filter(
      (p) => p.type !== 'membership_application' && p.name
    );

    // Sort by flCredits descending
    const sorted = [...validProfiles].sort((a, b) => (b.flCredits || 0) - (a.flCredits || 0));

    // Map to leaderboard members
    const members: LeaderboardMember[] = sorted.map((profile, index) => {
      const credits = profile.flCredits || 0;
      const name = profile.name || 'Unknown';
      return {
        rank: index + 1,
        name,
        initials: getInitials(name),
        role: profile.title || profile.location || 'Community Member',
        avatarColor: getAvatarColor(name),
        credits,
        posts: profile.badges?.length || 0,
        connections: Math.floor(credits * 0.2),
        score: credits * 2,
        trend: getTrend(name),
        isCurrentUser: currentUserMembershipId
          ? profile.membershipId === currentUserMembershipId
          : false,
      };
    });

    // If current user is not in the list, add a placeholder
    if (currentUserMembershipId && !members.some((m) => m.isCurrentUser)) {
      let userName = 'You';
      try {
        const userData = localStorage.getItem('fl_user');
        if (userData) {
          const parsed = JSON.parse(userData);
          userName = parsed.name || 'You';
        }
      } catch {
        // ignore
      }
      members.push({
        rank: members.length + 1,
        name: userName,
        initials: getInitials(userName),
        role: 'Community Member',
        avatarColor: 'from-emerald-400 to-green-500',
        credits: 0,
        posts: 0,
        connections: 0,
        score: 0,
        trend: 'same',
        isCurrentUser: true,
      });
    }

    return members;
  }, [listProfiles, currentUserMembershipId]);

  const currentUser = leaderboardData.find((m) => m.isCurrentUser);
  const topScore = leaderboardData.length > 0 ? leaderboardData[0].score : 1;
  const nextRankScore =
    currentUser && currentUser.rank > 1
      ? leaderboardData[currentUser.rank - 2]?.score ?? currentUser.score
      : currentUser?.score ?? 0;
  const totalPosts = leaderboardData.reduce((sum, m) => sum + m.posts, 0);

  // Track scroll position for floating user card
  useEffect(() => {
    const handleScroll = () => {
      if (!rankingSectionRef.current) return;
      const rect = rankingSectionRef.current.getBoundingClientRect();
      setShowFloatingCard(rect.top < -100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <SEO title="Leaderboard & Rankings" description="Top contributors and most active members on FocusLinks." keywords="optometry leaderboard, rankings, FL credits, top contributors" />
    <div className="min-h-screen bg-slate-50">
      {/* ═══════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-emerald-950/80 to-slate-900 px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-blob absolute left-[10%] top-[15%] h-[400px] w-[400px] rounded-full bg-emerald-500/20 blur-[120px] sm:h-[500px] sm:w-[500px]" />
          <div
            className="animate-blob absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-amber-500/15 blur-[100px] sm:h-[400px] sm:w-[400px]"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="animate-blob absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[120px] sm:h-[600px] sm:w-[600px]"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur-sm sm:mb-6 sm:text-sm">
              <Trophy className="h-3.5 w-3.5" />
              Community Rankings
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:mb-5 sm:text-5xl lg:text-6xl"
          >
            Community{' '}
            <span className="animate-gradient-x bg-gradient-to-r from-emerald-400 via-green-300 to-amber-400 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-6 max-w-xl mx-auto text-sm text-emerald-200/80 sm:mb-8 sm:text-base lg:text-lg"
          >
            Recognizing our most active contributors and celebrating excellence
            in the optometry community
          </motion.p>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <FilterTabs active={activeFilter} onChange={setActiveFilter} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════════ */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        {/* ─── Loading State ─── */}
        {loadingList && (
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
            <div className="min-w-0 flex-1">
              {/* Loading podium skeleton */}
              <div className="mb-10">
                <div className="mb-6 flex items-center gap-3 sm:mb-8">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 sm:h-11 sm:w-11" />
                  <div>
                    <div className="mb-1 h-5 w-40 animate-pulse rounded bg-slate-200 sm:h-6" />
                    <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="h-1.5 w-full bg-slate-100" />
                      <div className="flex flex-col items-center gap-3 px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
                        {i === 1 && <div className="h-7 w-7 animate-pulse rounded-full bg-amber-100" />}
                        <div className="h-16 w-16 animate-pulse rounded-full bg-slate-100 sm:h-20 sm:w-20" />
                        <div className="h-4 w-7 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-36 animate-pulse rounded bg-slate-50" />
                        <div className="h-8 w-20 animate-pulse rounded bg-slate-100" />
                      </div>
                      <div className="flex items-center justify-center gap-4 border-t border-slate-100 px-4 py-3">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="flex flex-col items-center">
                            <div className="mb-1 h-3.5 w-8 animate-pulse rounded bg-slate-100" />
                            <div className="h-2.5 w-14 animate-pulse rounded bg-slate-50" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Loading rankings skeleton */}
              <div className="mb-10">
                <div className="mb-6 flex items-center gap-3 sm:mb-8">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 sm:h-11 sm:w-11" />
                  <div>
                    <div className="mb-1 h-5 w-32 animate-pulse rounded bg-slate-200 sm:h-6" />
                    <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:hidden">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 h-3.5 w-32 animate-pulse rounded bg-slate-100" />
                          <div className="h-3 w-48 animate-pulse rounded bg-slate-50" />
                        </div>
                        <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden md:block">
                  <div className="grid grid-cols-[64px_1fr_100px_80px_90px_100px_110px_48px] items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-3 animate-pulse rounded bg-slate-100" />
                    ))}
                  </div>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-[64px_1fr_100px_80px_90px_100px_110px_48px] items-center gap-2 border-b border-slate-100 px-5 py-3">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-50" />
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-50" />
                        <div className="flex-1">
                          <div className="mb-1 h-3.5 w-28 animate-pulse rounded bg-slate-50" />
                          <div className="h-2.5 w-44 animate-pulse rounded bg-slate-50" />
                        </div>
                      </div>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="h-3.5 w-12 animate-pulse rounded bg-slate-50" />
                      ))}
                      <div className="h-3.5 w-6 animate-pulse rounded bg-slate-50" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Loading stats skeleton */}
              <div className="mb-10">
                <div className="mb-6 flex items-center gap-3 sm:mb-8">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 sm:h-11 sm:w-11" />
                  <div>
                    <div className="mb-1 h-5 w-32 animate-pulse rounded bg-slate-200 sm:h-6" />
                    <div className="h-3 w-48 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-3 h-12 w-12 animate-pulse rounded-xl bg-slate-100" />
                      <div className="mb-1 h-7 w-20 animate-pulse rounded bg-slate-100 sm:h-8" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden lg:block lg:w-80 xl:w-96">
              <div className="sticky top-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-4 h-20 animate-pulse rounded-xl bg-slate-50" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-50" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Loaded State ─── */}
        {!loadingList && leaderboardData.length > 0 && (
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          {/* ─── Left Column: Main Content ─── */}
          <div className="min-w-0 flex-1">
            {/* ─── Top 3 Podium ─── */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-10"
            >
              <SectionHeader
                icon={Crown}
                iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
                title="Top 3 Contributors"
                subtitle="This period's community champions"
              />

              {/* Mobile: stacked cards vertically */}
              <div className="flex flex-col gap-4 sm:hidden">
                <PodiumCard
                  member={leaderboardData[0]}
                  position="first"
                  delay={0.1}
                />
                <PodiumCard
                  member={leaderboardData[1]}
                  position="second"
                  delay={0.2}
                />
                <PodiumCard
                  member={leaderboardData[2]}
                  position="third"
                  delay={0.3}
                />
              </div>

              {/* Tablet: 3-column grid, equal height */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-4 lg:hidden">
                <PodiumCard
                  member={leaderboardData[0]}
                  position="first"
                  delay={0.1}
                />
                <PodiumCard
                  member={leaderboardData[1]}
                  position="second"
                  delay={0.2}
                />
                <PodiumCard
                  member={leaderboardData[2]}
                  position="third"
                  delay={0.3}
                />
              </div>

              {/* Desktop: traditional podium with #1 center taller */}
              <div className="hidden lg:grid lg:grid-cols-3 lg:gap-5 items-end">
                <div className="flex justify-end lg:pb-8">
                  <div className="w-full max-w-[280px]">
                    <PodiumCard
                      member={leaderboardData[1]}
                      position="second"
                      delay={0.2}
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-full max-w-[300px]">
                    <PodiumCard
                      member={leaderboardData[0]}
                      position="first"
                      delay={0.1}
                    />
                  </div>
                </div>
                <div className="flex justify-start lg:pb-8">
                  <div className="w-full max-w-[280px]">
                    <PodiumCard
                      member={leaderboardData[2]}
                      position="third"
                      delay={0.3}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ─── Full Rankings ─── */}
            <motion.section
              ref={rankingSectionRef}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <SectionHeader
                icon={Activity}
                iconBg="bg-gradient-to-br from-emerald-500 to-green-500"
                title="Full Rankings"
                subtitle="Complete community standings"
              />

              {/* Mobile: Card layout */}
              <div className="flex flex-col gap-2 md:hidden">
                {leaderboardData.map((member, i) => (
                  <MobileRankCard key={member.rank} member={member} index={i} />
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden md:block">
                {/* Table header */}
                <div className="grid grid-cols-[64px_1fr_100px_80px_90px_100px_110px_48px] items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Rank
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Member
                  </span>
                  <span className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Credits
                  </span>
                  <span className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Posts
                  </span>
                  <span className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Connections
                  </span>
                  <span className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Activity
                  </span>
                  <span className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Score
                  </span>
                  <span className="text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Trend
                  </span>
                </div>

                {/* Table body with scroll */}
                <div className="custom-scrollbar-refined max-h-[600px] overflow-y-auto">
                  {leaderboardData.map((member, i) => (
                    <DesktopRankRow
                      key={member.rank}
                      member={member}
                      index={i}
                      topScore={topScore}
                    />
                  ))}
                </div>
              </div>
            </motion.section>

            {/* ─── Platform Stats ─── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <SectionHeader
                icon={BarChart3}
                iconBg="bg-gradient-to-br from-green-500 to-teal-500"
                title="Platform Stats"
                subtitle="Community-wide activity overview"
              />

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  icon={Users}
                  label="Total Members"
                  value={leaderboardData.length}
                  suffix=""
                  color="bg-gradient-to-br from-emerald-500 to-green-500"
                  delay={0}
                />
                <StatCard
                  icon={Activity}
                  label="Active This Period"
                  value={Math.min(leaderboardData.length, Math.floor(leaderboardData.length * 0.7))}
                  suffix=""
                  color="bg-gradient-to-br from-teal-500 to-emerald-500"
                  delay={0.1}
                />
                <StatCard
                  icon={Zap}
                  label="Top Score"
                  value={topScore}
                  suffix=""
                  color="bg-gradient-to-br from-amber-500 to-orange-500"
                  delay={0.2}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Total Badges"
                  value={totalPosts}
                  suffix=""
                  color="bg-gradient-to-br from-green-500 to-lime-500"
                  delay={0.3}
                />
              </div>
            </motion.section>

            {/* ─── Achievement Badges ─── */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <SectionHeader
                icon={Award}
                iconBg="bg-gradient-to-br from-amber-500 to-yellow-500"
                title="Achievement Badges"
                subtitle="Unlock badges by contributing to the community"
              />

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {achievementBadges.map((badge, i) => (
                  <AchievementBadgeCard
                    key={badge.id}
                    badge={badge}
                    index={i}
                  />
                ))}
              </div>
            </motion.section>

            {/* ─── Your Ranking (inline on all screens) ─── */}
            <motion.section
              id="your-ranking-section"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {currentUser && (
                <YourRankingCard
                  member={currentUser}
                  nextRankScore={nextRankScore}
                  totalMembers={leaderboardData.length}
                />
              )}
            </motion.section>
          </div>

          {/* ─── Right Column: Your Ranking Sidebar (desktop only) ─── */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="sticky top-6">
              {currentUser && (
                <YourRankingCard
                  member={currentUser}
                  showCompact
                  nextRankScore={nextRankScore}
                  totalMembers={leaderboardData.length}
                />
              )}

              {/* Quick actions card */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  How to Climb the Ranks
                </h3>
                <ul className="space-y-2.5">
                  {[
                    { icon: MessageSquare, text: 'Post insightful discussions', color: 'text-emerald-500' },
                    { icon: UserPlus, text: 'Connect with colleagues', color: 'text-amber-500' },
                    { icon: Star, text: 'Get helpful votes on answers', color: 'text-orange-500' },
                    { icon: Calendar, text: 'Attend community events', color: 'text-teal-500' },
                    { icon: BookOpen, text: 'Share educational resources', color: 'text-green-500' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                      <span className="text-xs text-slate-600">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Bottom padding for mobile floating card */}
        <div className="h-16 md:hidden" />
      </main>

      {/* ═══════════════════════════════════════════════════
          FLOATING USER CARD (visible when ranking section scrolled past)
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showFloatingCard && currentUser && (
          <FloatingUserCard member={currentUser} totalMembers={leaderboardData.length} />
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
