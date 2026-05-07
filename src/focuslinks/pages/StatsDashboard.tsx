'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Users,
  FileText,
  FolderOpen,
  CalendarDays,
  Globe,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Clock,
  Heart,
  ArrowRight,
  Star,
  Award,
  Sparkles,
} from 'lucide-react';
import { Link } from '../../context/NavigationContext';
import SEO from '../components/SEO';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// ── Types ───────────────────────────────────────────────────────────────────

interface StatCard {
  label: string;
  value: number;
  suffix?: string;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  sparkline: number[];
}

interface Milestone {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// ── No mock data — show loading state ────────────────────────────────────

const GROWTH_DATA: Array<{ month: string; members: number; posts: number; events: number }> = [];

const COUNTRIES_DATA: Array<{ country: string; members: number; flag: string }> = [];

const MILESTONES: Milestone[] = [];

// ── Animated Counter Hook ───────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

// ── Mini Sparkline Component ────────────────────────────────────────────────

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 30;
  const padding = 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height} ${points} ${width - padding},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polygon points={areaPoints} fill={`${color}20`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Stat Card Component ─────────────────────────────────────────────────────

function StatCardComponent({ stat, index }: { stat: StatCard; index: number }) {
  const { count, ref } = useAnimatedCounter(stat.value, 2000 + index * 200);
  const isUp = stat.trend > 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="relative bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
    >
      {/* Gradient border glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 via-emerald-500/0 to-teal-500/0 group-hover:from-teal-500/10 group-hover:via-emerald-500/5 group-hover:to-teal-500/10 transition-all duration-300 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
            {stat.icon}
          </div>
          <MiniSparkline data={stat.sparkline} color={isUp ? '#10b981' : '#f43f5e'} />
        </div>

        <div className="flex items-end gap-2 mb-1">
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
            {count.toLocaleString()}
            {stat.suffix && <span className="text-base">{stat.suffix}</span>}
          </span>
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold mb-1 ${
            isUp
              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
          }`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(stat.trend)}%
          </span>
        </div>

        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.trendLabel}</p>
      </div>
    </motion.div>
  );
}

// ── Activity Metric Card ────────────────────────────────────────────────────

function ActivityMetric({ icon, label, value, description, color, bgColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  color: string;
  bgColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${bgColor} ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
    </motion.div>
  );
}

// ── Custom Tooltip for Charts ───────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 px-3 py-2 text-xs">
      <p className="font-bold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-gray-500 dark:text-gray-400">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.dataKey === 'members' ? 'Members' : entry.dataKey === 'posts' ? 'Posts' : 'Events'}:{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-200">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function StatsDashboard() {
  const statCards: StatCard[] = useMemo(() => [
    { label: 'Total Members', value: 12847, trend: 2.3, trendLabel: '+234 this month', icon: <Users className="w-5 h-5" />, color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-100 dark:bg-teal-900/40', sparkline: [8200, 8750, 9200, 9600, 9950, 10400, 10800, 11200, 11500, 11900, 12400, 12847] },
    { label: 'Active Today', value: 1284, trend: 5.1, trendLabel: '+62 vs yesterday', icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/40', sparkline: [980, 1020, 1050, 990, 1100, 1150, 1080, 1200, 1180, 1250, 1222, 1284] },
    { label: 'Total Posts', value: 45892, trend: 3.7, trendLabel: '+1,642 this month', icon: <FileText className="w-5 h-5" />, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/40', sparkline: [28000, 30500, 32200, 33800, 35400, 37100, 38900, 40500, 42100, 43200, 44600, 45892] },
    { label: 'Resources Shared', value: 2341, trend: 8.2, trendLabel: '+178 this month', icon: <FolderOpen className="w-5 h-5" />, color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-900/40', sparkline: [1200, 1350, 1420, 1550, 1620, 1750, 1820, 1930, 2050, 2100, 2163, 2341] },
    { label: 'Events Hosted', value: 156, trend: 1.5, trendLabel: '+4 this month', icon: <CalendarDays className="w-5 h-5" />, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/40', sparkline: [98, 105, 112, 118, 124, 128, 132, 138, 142, 148, 152, 156] },
    { label: 'Countries', value: 52, trend: 4.0, trendLabel: '+2 this quarter', icon: <Globe className="w-5 h-5" />, color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-100 dark:bg-rose-900/40', sparkline: [38, 40, 41, 42, 43, 44, 45, 46, 48, 49, 50, 52] },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 px-4">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/3 w-80 h-80 bg-teal-200/40 dark:bg-teal-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-200/40 dark:bg-emerald-900/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/3 w-60 h-60 bg-rose-200/30 dark:bg-rose-900/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-semibold mb-6">
              <BarChart3 className="w-4 h-4" />
              Community Analytics
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="text-gradient bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Community Analytics
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Real-time insights into the FocusLinks global optometry community growth and engagement.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Overview Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => (
            <StatCardComponent key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Over Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Growth Over Time</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member, post, and event growth over 12 months</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span className="text-gray-500 dark:text-gray-400">Members</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-500 dark:text-gray-400">Posts</span>
                </span>
              </div>
            </div>
            <div className="h-72">
              {GROWTH_DATA.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={GROWTH_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradientTeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:opacity-20" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="members" stroke="#14b8a6" strokeWidth={2} fill="url(#gradientTeal)" />
                    <Area type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} fill="url(#gradientBlue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Growth Data Yet</h3>
                  <p className="text-sm text-slate-400">Growth analytics will appear here as the community grows</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Contributing Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Contributing Countries</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Distribution of members by country</p>
            </div>
            <div className="space-y-3">
              {COUNTRIES_DATA.length > 0 ? (
                COUNTRIES_DATA.map((country, index) => {
                  const maxMembers = COUNTRIES_DATA[0].members;
                  const percentage = (country.members / maxMembers) * 100;
                  const barColors = [
                    'bg-teal-500',
                    'bg-emerald-500',
                    'bg-teal-400',
                    'bg-emerald-400',
                    'bg-teal-300 dark:bg-teal-600',
                    'bg-emerald-300 dark:bg-emerald-600',
                    'bg-teal-200 dark:bg-teal-500',
                    'bg-emerald-200 dark:bg-emerald-500',
                  ];
                  return (
                    <motion.div
                      key={country.country}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.06 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{country.flag}</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{country.country}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">{country.members.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: index * 0.06, ease: 'easeOut' }}
                          className={`h-full rounded-full ${barColors[index]}`}
                        />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Globe className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Country Data Yet</h3>
                  <p className="text-sm text-slate-400">Country distribution will appear as members join</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Activity Section */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Activity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActivityMetric
              icon={<FileText className="w-4 h-4" />}
              label="Avg. Posts per Day"
              value="127"
              description="Posts created daily across the community"
              color="text-teal-600 dark:text-teal-400"
              bgColor="bg-teal-100 dark:bg-teal-900/40"
            />
            <ActivityMetric
              icon={<Clock className="w-4 h-4" />}
              label="Avg. Response Time"
              value="2.4 hrs"
              description="Average time for first reply on posts"
              color="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-100 dark:bg-blue-900/40"
            />
            <ActivityMetric
              icon={<Heart className="w-4 h-4" />}
              label="Satisfaction"
              value="94%"
              description="Community satisfaction survey score"
              color="text-rose-600 dark:text-rose-400"
              bgColor="bg-rose-100 dark:bg-rose-900/40"
            />
            <ActivityMetric
              icon={<Award className="w-4 h-4" />}
              label="Retention Rate"
              value="87%"
              description="Members active after 6 months"
              color="text-amber-600 dark:text-amber-400"
              bgColor="bg-amber-100 dark:bg-amber-900/40"
            />
          </div>
        </motion.div>
      </section>

      {/* Recent Milestones Timeline */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Milestones</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-emerald-300 to-gray-200 dark:from-teal-800 dark:via-emerald-800 dark:to-slate-700" />

            <div className="space-y-6">
              {MILESTONES.length > 0 ? (
                MILESTONES.map((milestone, index) => (
                  <motion.div
                    key={milestone.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="relative flex items-start gap-4 pl-0 sm:pl-0"
                  >
                    {/* Dot */}
                    <div className={`relative z-10 w-10 h-10 rounded-xl ${milestone.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      {milestone.icon}
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 flex-1 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{milestone.date}</span>
                      </div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">{milestone.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center pl-4">
                  <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400 mb-2">No Milestones Yet</h3>
                  <p className="text-sm text-slate-400">Platform milestones will be recorded here</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-8 sm:p-12 text-center"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />

          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Star className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Join the Community</h2>
            <p className="text-teal-100 text-lg max-w-lg mx-auto mb-8">
              Be part of a thriving global network of optometry professionals. Connect, learn, and grow together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/membership"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-700 font-bold text-sm hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <Users className="w-4 h-4" />
                Become a Member
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/directory"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-sm hover:bg-white/20 transition-all hover:-translate-y-0.5 border border-white/20"
              >
                Explore Directory
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
