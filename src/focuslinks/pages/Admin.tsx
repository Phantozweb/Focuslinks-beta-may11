'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Users,
  Search,
  Eye,
  EyeOff,
  Globe,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  GraduationCap,
  Video,
  UserCog,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Database,
  BadgeCheck,
  MessageSquare,
  TrendingUp,
  XCircle,
  FileJson,
  HelpCircle,
  UserX,
  Clock,
  UserPlus,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  IdCard,
  Copy,
  ChevronDown,
  Filter,
  PenLine,
  BookOpen,
  Archive,
  RotateCcw,
  Heart,
  MessageCircle,
  Trash2,
  Image as ImageIcon,
  Save,
  Pencil,
  ArrowLeft,
  LogOut,
  QrCode,
  Camera,
  Upload,
  Lock,
  Loader2,
  Link2,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link, useNavigate } from '../../context/NavigationContext';
import { toast } from 'sonner';
import { isAdminLoggedIn, adminLoginWithToken, adminLogout } from '../../lib/admin';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import SEO from '../components/SEO';

/* ─── Types ──────────────────────────────────────────────────────────────── */

type AdminTab = 'overview' | 'profiles' | 'not-created' | 'webinars' | 'users' | 'posts' | 'articles' | 'archive';

interface ProfileData {
  name: string;
  email: string;
  location: string;
  country: string;
  title: string;
  type: string;
  verified: boolean;
  skills: string[];
  interests: string[];
  image: string;
  id: string;
  membershipId: string;
  experience: Array<{ title: string; company: string; duration: string }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  bio: string;
  languages: string[];
  linkedin: string;
}

interface WebinarInfo {
  slug: string;
  displayName: string;
  bookedCount: number;
  questionsCount: number;
  latestBooking: string | null;
}

interface BookingRecord {
  entryId: string;
  type: string;
  webinar: string;
  name: string;
  email: string;
  membershipId: string;
  timestamp: string;
}

interface QuestionRecord {
  entryId: string;
  type: string;
  webinar: string;
  name: string;
  email: string;
  membershipId: string;
  question: string;
  timestamp: string;
}

interface UserData {
  membershipId: string;
  filename: string;
  fullName: string;
  email: string;
  profession: string;
  country: string;
  cityState: string;
  status: string;
  verified: boolean;
  type: string;
  submittedAt: string;
  phone?: string;
  collegeName?: string;
  yearsOfExperience?: string;
  specialization?: string;
  [key: string]: any;
}

interface AdminStats {
  profiles: { total: number; verified: number; countries: number; topSkills: Array<{ name: string; count: number }> };
  users: { totalFiles: number };
  webinars: { total: number; data: WebinarInfo[] };
  typeDistribution: Array<{ name: string; count: number }>;
}

interface PostData {
  id: string;
  authorId: string;
  content: string;
  hashtags: string[];
  timestamp: string;
  likes: string[];
  comments: any[];
  images?: string[];
 [key: string]: any;
}

interface ArticleData {
  id: string;
  slug: string;
  authorId: string;
  authorName: string;
  title: string;
  excerpt: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface ArchiveItem {
  name?: string;
  title?: string;
  email?: string;
  membershipId?: string;
  authorId?: string;
  archivedAt: string;
  [key: string]: any;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const TYPE_COLORS: Record<string, string> = {
  professional: '#3b82f6',
  student: '#10b981',
  researcher: '#8b5cf6',
  educator: '#f59e0b',
  academic: '#06b6d4',
  college: '#f97316',
  industry: '#ec4899',
  membership_application: '#6b7280',
  unknown: '#9ca3af',
};

/* ─── Chart Tooltip ──────────────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <>
    <SEO title="Admin Panel" description="FocusLinks admin panel for managing the platform." keywords="admin, management, platform admin" />
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 px-4 py-3 text-xs">
      <p className="font-bold text-gray-900 mb-1.5">{label}</p>
      {payload.map((e) => (
        <p key={e.dataKey} className="text-gray-500">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: e.color }} />
          <span className="font-medium text-gray-700">{e.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  </>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100" />
            <div className="w-6 h-3 bg-gray-100 rounded" />
          </div>
          <div className="h-7 bg-gray-100 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-50 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2" style={{ minHeight: `${count * 56}px` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-50 rounded w-1/5" />
          </div>
          <div className="h-5 w-16 bg-gray-50 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ─── Profile Detail Modal ──────────────────────────────────────────────── */

function ProfileModal({ profile, onClose }: { profile: ProfileData; onClose: () => void }) {
  if (!profile) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white truncate">{profile.name}</h3>
                {profile.verified && <BadgeCheck className="w-4 h-4 text-blue-400 shrink-0" />}
              </div>
              <p className="text-sm text-gray-300 truncate">{profile.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                {profile.membershipId && <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold">{profile.membershipId}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {profile.bio && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}
          {profile.skills?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1.5">{profile.skills.map((s, i) => <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">{s}</span>)}</div>
            </div>
          )}
          {profile.interests?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Interests</h4>
              <div className="flex flex-wrap gap-1.5">{profile.interests.map((t, i) => <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">{t}</span>)}</div>
            </div>
          )}
          {profile.experience?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Experience</h4>
              <div className="space-y-2.5">{profile.experience.map((exp, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                  <p className="text-xs text-gray-500">{exp.company} <span className="text-gray-400 ml-2">{exp.duration}</span></p>
                </div>
              ))}</div>
            </div>
          )}
          {profile.education?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Education</h4>
              <div className="space-y-2.5">{profile.education.map((edu, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-xs text-gray-500">{edu.institution} <span className="text-gray-400 ml-2">{edu.year}</span></p>
                </div>
              ))}</div>
            </div>
          )}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</h4>
            <div className="space-y-2">
              {profile.email && <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"><Mail className="w-4 h-4" />{profile.email}</a>}
              {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"><ExternalLink className="w-4 h-4" />LinkedIn Profile</a>}
            </div>
          </div>
          {profile.languages?.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Languages</h4>
              <div className="flex flex-wrap gap-1.5">{profile.languages.map((l, i) => <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">{l}</span>)}</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── User Detail Modal ──────────────────────────────────────────────── */

function UserDetailModal({ user, onClose, onEdit }: { user: UserData; onClose: () => void; onEdit?: (user: UserData) => void }) {
  if (!user) return null;

  const detailFields = [
    { key: 'fullName', label: 'Full Name', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { key: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
    { key: 'phone', label: 'Phone', icon: <Phone className="w-3.5 h-3.5" /> },
    { key: 'profession', label: 'Profession', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { key: 'collegeName', label: 'College/Institution', icon: <Building2 className="w-3.5 h-3.5" /> },
    { key: 'country', label: 'Country', icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'cityState', label: 'City / State', icon: <MapPin className="w-3.5 h-3.5" /> },
    { key: 'yearsOfExperience', label: 'Experience', icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'specialization', label: 'Specialization', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { key: 'membershipId', label: 'Membership ID', icon: <IdCard className="w-3.5 h-3.5" /> },
    { key: 'type', label: 'Type', icon: <UserCog className="w-3.5 h-3.5" /> },
    { key: 'status', label: 'Status', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: 'submittedAt', label: 'Submitted At', icon: <Calendar className="w-3.5 h-3.5" /> },
  ];

  // Get all extra keys not in the predefined fields
  const extraKeys = Object.keys(user).filter(
    (k) => !detailFields.some((f) => f.key === k) && k !== 'filename' && user[k] !== undefined && user[k] !== ''
  );

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(user, null, 2));
    toast.success('JSON copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-700 to-violet-800 p-6 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {(user.fullName || user.membershipId).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white truncate">{user.fullName || 'Unknown'}</h3>
                {user.verified && <BadgeCheck className="w-4 h-4 text-amber-300 shrink-0" />}
              </div>
              <p className="text-sm text-purple-200 truncate">{user.profession || 'N/A'} · {[user.cityState, user.country].filter(Boolean).join(', ') || 'N/A'}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-200 text-[10px] font-bold rounded-md capitalize">{user.status || 'pending'}</span>
                {user.membershipId && <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-bold rounded-md">{user.membershipId}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-5">
            <button onClick={copyJson} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              <Copy className="w-3.5 h-3.5" /> Copy JSON
            </button>
            <button onClick={() => { if (onEdit) onEdit(user); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit JSON
            </button>
            {user.email && (
              <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="w-3.5 h-3.5" /> Send Email
              </a>
            )}
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detailFields.map((field) => {
              const value = user[field.key];
              if (!value && value !== 0) return null;
              return (
                <div key={field.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                    {field.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{field.label}</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize break-words">{String(value)}</p>
                  </div>
                </div>
              );
            })}
            {/* Extra fields from JSON */}
            {extraKeys.map((key) => (
              <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shrink-0 mt-0.5">
                  <FileJson className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm font-semibold text-gray-900 break-words">{typeof user[key] === 'object' ? JSON.stringify(user[key]) : String(user[key])}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Raw JSON Toggle */}
          <JsonViewer data={user} />
        </div>
      </motion.div>
    </div>
  );
}

/* ─── JSON Editor Modal ────────────────────────────────────────────── */

function JsonEditorModal({ user, onClose, onSave }: { user: UserData; onClose: () => void; onSave: () => void }) {
  const [jsonText, setJsonText] = useState(JSON.stringify(user, null, 2));
  const [saving, setSaving] = useState(false);

  const isValidJson = useMemo(() => {
    try {
      JSON.parse(jsonText);
      return true;
    } catch {
      return false;
    }
  }, [jsonText]);

  const handleSave = async () => {
    if (!isValidJson || saving) return;
    setSaving(true);
    try {
      const parsed = JSON.parse(jsonText);
      const res = await fetch('/api/admin/edit-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: user.membershipId, data: parsed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }));
        throw new Error(err.error || 'Failed to save');
      }
      toast.success('User data saved to GitHub successfully');
      onSave();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save user data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Edit JSON</h3>
              <p className="text-xs text-emerald-200">{user.fullName || user.membershipId} · {user.membershipId}_userdata.json</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* JSON validity indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isValidJson ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-xs font-semibold ${isValidJson ? 'text-emerald-600' : 'text-red-600'}`}>
                {isValidJson ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">{user.membershipId}_userdata.json</span>
          </div>

          {/* Textarea */}
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-[400px] px-4 py-3 bg-gray-900 text-green-400 text-xs rounded-xl border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-mono leading-relaxed resize-y"
            spellCheck={false}
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValidJson || saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? 'Saving...' : 'Save to GitHub'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function JsonViewer({ data }: { data: Record<string, any> }) {
  const [showJson, setShowJson] = useState(false);
  return (
    <div className="mt-5">
      <button
        onClick={() => setShowJson(!showJson)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
      >
        <FileJson className="w-3.5 h-3.5" />
        {showJson ? 'Hide' : 'Show'} Raw JSON
        <ChevronDown className={`w-3 h-3 transition-transform ${showJson ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {showJson && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <pre className="mt-3 p-4 bg-gray-900 text-green-400 text-xs rounded-xl overflow-x-auto leading-relaxed font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Pagination Component (fixed height, no jumping) ──────────────────────── */

function Pagination({ page, total, limit = 20, onChange }: { page: number; total: number; limit?: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return <div className="h-12" />; // maintain height
  return (
    <div className="flex items-center justify-between pt-4 pb-1 border-t border-gray-100 h-12 shrink-0">
      <p className="text-xs text-gray-400">
        {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 5 && page > 3) p = Math.min(page - 2 + i, totalPages);
          if (p < 1) p = 1;
          if (p > totalPages) return null;
          return (
            <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${p === page ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
          );
        })}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

/* ─── Admin Login Gate (QR Code Only) ────────────────────────────────── */

function AdminLoginGate() {
  const [mode, setMode] = useState<'scan' | 'upload'>('scan');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (adminLoginWithToken(decodedText)) {
      setSuccess(true);
      setScanning(false);
      // Stop scanner
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
      toast.success('Admin access granted!');
      setTimeout(() => window.location.reload(), 800);
    } else {
      setError('QR code not recognized. Only the authorized admin QR code can grant access.');
      setError('');
    }
  }, []);

  const startScanner = useCallback(async () => {
    setError('');
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
      scannerRef.current.clear();
    }

    try {
      const html5QrCode = new Html5Qrcode('admin-qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {} // ignore scan errors (no QR found in frame)
      );
      setScanning(true);
    } catch (err) {
      setError('Camera access denied or unavailable. Try uploading the QR code image instead.');
      setMode('upload');
    }
  }, [handleScanSuccess]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
      scannerRef.current.clear();
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const html5QrCode = new Html5Qrcode('admin-qr-reader-hidden');
      const result = await html5QrCode.scanFile(file, true);
      handleScanSuccess(result);
    } catch {
      setError('No valid QR code found in the uploaded image.');
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleScanSuccess]);

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Access Granted</h2>
          <p className="text-gray-400 mt-2">Redirecting to admin panel...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-blue-500/20 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-sm text-gray-400 mt-1">FocusLinks Data Console</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">QR Code Required</h2>
              <p className="text-xs text-gray-500">Scan the admin QR code to authenticate</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            <button
              onClick={() => { setMode('scan'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'scan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Camera Scan
            </button>
            <button
              onClick={() => { setMode('upload'); stopScanner(); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
          </div>

          {/* Camera Scanner */}
          {mode === 'scan' && (
            <div className="space-y-4">
              <div
                id="admin-qr-reader"
                className="w-full rounded-xl overflow-hidden bg-gray-900"
                style={{ minHeight: scanning ? '280px' : '0' }}
              />
              {!scanning && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Open your camera to scan the QR code</p>
                  <button
                    onClick={startScanner}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    Start Camera
                  </button>
                </div>
              )}
              {scanning && (
                <button
                  onClick={stopScanner}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Stop Camera
                </button>
              )}
            </div>
          )}

          {/* File Upload */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all group"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                  <Upload className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700">Upload QR Code Image</p>
                <p className="text-xs text-gray-400 mt-1">Select the QR code image from your device</p>
                <p className="text-[10px] text-gray-300 mt-2">PNG, JPG, WEBP supported</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {/* Hidden element for html5-qrcode file scanning */}
              <div id="admin-qr-reader-hidden" className="hidden" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mt-4">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
              <p className="text-[10px] text-gray-400 leading-relaxed">
                This area is protected by QR code authentication. Only the physical QR code holder can access the admin panel.
                No passwords, no usernames — the QR code is the single key.
                All access attempts are monitored.
              </p>
            </div>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to FocusLinks
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Admin Component ────────────────────────────────────────────────── */

export default function Admin() {
  const [mounted, setMounted] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
      setAdminAuthenticated(isAdminLoggedIn());
    });
  }, []);

  if (!mounted || !adminAuthenticated) {
    return <AdminLoginGate />;
  }

  const handleAdminLogout = () => {
    adminLogout();
    setAdminAuthenticated(false);
    toast.success('Admin session ended.');
  };

  return <AdminContent onLogout={handleAdminLogout} />;
}

function AdminContent({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Profiles
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesPage, setProfilesPage] = useState(1);
  const [profilesTotal, setProfilesTotal] = useState(0);
  const [profilesSearch, setProfilesSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);

  // Not Created Profiles (membership_application)
  const [ncProfiles, setNcProfiles] = useState<ProfileData[]>([]);
  const [ncLoading, setNcLoading] = useState(false);
  const [ncPage, setNcPage] = useState(1);
  const [ncTotal, setNcTotal] = useState(0);
  const [ncSearch, setNcSearch] = useState('');

  // Webinars
  const [webinars, setWebinars] = useState<WebinarInfo[]>([]);
  const [webinarsLoading, setWebinarsLoading] = useState(false);
  const [selectedWebinar, setSelectedWebinar] = useState<WebinarInfo | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [webinarSubTab, setWebinarSubTab] = useState<'bookings' | 'questions'>('bookings');

  // Meeting link management
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState('Google Meet');
  const [meetingStatus, setMeetingStatus] = useState('scheduled');
  const [meetingLastUpdated, setMeetingLastUpdated] = useState<string | null>(null);
  const [meetingLinkLoading, setMeetingLinkLoading] = useState(false);
  const [meetingLinkSaving, setMeetingLinkSaving] = useState(false);

  // Users
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Posts
  const [posts, setPosts] = useState<PostData[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsSearch, setPostsSearch] = useState('');
  const [rawPostJson, setRawPostJson] = useState<any | null>(null);

  // Articles
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesPage, setArticlesPage] = useState(1);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articlesSearch, setArticlesSearch] = useState('');
  const [articlesCategory, setArticlesCategory] = useState('');

  // Archive
  const [archiveType, setArchiveType] = useState<'users' | 'posts' | 'articles'>('users');
  const [archiveItems, setArchiveItems] = useState<ArchiveItem[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archivePage, setArchivePage] = useState(1);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [archiveSearch, setArchiveSearch] = useState('');

  const fetchStats = useCallback(async () => {
    setStatsLoading(true); setStatsError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed');
      setStats(await res.json());
    } catch (err) { setStatsError(err instanceof Error ? err.message : 'Error'); }
    finally { setStatsLoading(false); }
  }, []);

  const fetchProfiles = useCallback(async (page = 1, search = '', type = 'professional') => {
    setProfilesLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search, type });
      const res = await fetch(`/api/admin/profiles?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setProfiles(data.profiles); setProfilesTotal(data.pagination.total); setProfilesPage(page);
    } catch { toast.error('Failed to load profiles'); }
    finally { setProfilesLoading(false); }
  }, []);

  const fetchNcProfiles = useCallback(async (page = 1, search = '') => {
    setNcLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search, type: 'membership_application' });
      const res = await fetch(`/api/admin/profiles?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setNcProfiles(data.profiles); setNcTotal(data.pagination.total); setNcPage(page);
    } catch { toast.error('Failed to load profiles'); }
    finally { setNcLoading(false); }
  }, []);

  // Meeting link: fetch from GitHub
  const fetchMeetingLinkInfo = useCallback(async () => {
    setMeetingLinkLoading(true);
    try {
      const res = await fetch('/api/webinar/meeting-info');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setMeetingLink(data.data.meetingLink || '');
          setMeetingPlatform(data.data.platform || 'Google Meet');
          setMeetingStatus(data.data.status || 'scheduled');
          setMeetingLastUpdated(data.data.lastUpdated || null);
        }
      }
    } catch { /* silently fail — fields will stay as defaults */ }
    finally { setMeetingLinkLoading(false); }
  }, []);

  // Meeting link: save to GitHub
  const saveMeetingLink = useCallback(async () => {
    if (!meetingLink.trim()) return;
    setMeetingLinkSaving(true);
    try {
      const res = await fetch('/api/webinar/meeting-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingLink: meetingLink.trim(),
          platform: meetingPlatform,
          status: meetingStatus,
          meetingTime: '2026-05-06T13:30:00Z',
          meetingEndTime: '2026-05-06T15:30:00Z',
          updatedBy: 'admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Meeting link saved to GitHub successfully!');
        setMeetingLastUpdated(data.data?.lastUpdated || new Date().toISOString());
      } else {
        toast.error(data.error || 'Failed to save meeting link');
      }
    } catch {
      toast.error('Failed to save meeting link to GitHub');
    }
    finally { setMeetingLinkSaving(false); }
  }, [meetingLink, meetingPlatform, meetingStatus]);

  const fetchWebinars = useCallback(async () => {
    setWebinarsLoading(true);
    try {
      const res = await fetch('/api/admin/webinars?action=list');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setWebinars(data.webinars);
    } catch { toast.error('Failed to load webinars'); }
    finally { setWebinarsLoading(false); }
  }, []);

  const fetchBookings = useCallback(async (slug: string, page = 1) => {
    setBookingsLoading(true);
    try {
      const params = new URLSearchParams({ action: 'bookings', slug, page: String(page), limit: '20' });
      const res = await fetch(`/api/admin/webinars?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setBookings(data.bookings);
      setBookingsTotal(data.pagination?.total || 0);
      setBookingsPage(page);
    } catch { toast.error('Failed to load bookings'); }
    finally { setBookingsLoading(false); }
  }, []);

  const fetchQuestions = useCallback(async (slug: string, page = 1) => {
    setQuestionsLoading(true);
    try {
      const params = new URLSearchParams({ action: 'questions', slug, page: String(page), limit: '20' });
      const res = await fetch(`/api/admin/webinars?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setQuestions(data.questions);
      setQuestionsTotal(data.pagination?.total || 0);
      setQuestionsPage(page);
    } catch { toast.error('Failed to load questions'); }
    finally { setQuestionsLoading(false); }
  }, []);

  const fetchUsers = useCallback(async (page = 1, search = '') => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', search });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setUsers(data.users); setUsersTotal(data.pagination.total); setUsersPage(page);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  }, []);

  const fetchPosts = useCallback(async (page = 1, search = '') => {
    setPostsLoading(true);
    try {
      const params = new URLSearchParams({ action: 'list', page: String(page), limit: '20', search });
      const res = await fetch(`/api/admin/posts?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPosts(data.posts); setPostsTotal(data.pagination?.total || 0); setPostsPage(page);
    } catch { toast.error('Failed to load posts'); }
    finally { setPostsLoading(false); }
  }, []);

  const fetchArticles = useCallback(async (page = 1, search = '', category = '') => {
    setArticlesLoading(true);
    try {
      const params = new URLSearchParams({ action: 'list', page: String(page), limit: '20', search });
      if (category) params.set('category', category);
      const res = await fetch(`/api/articles?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setArticles(data.articles); setArticlesTotal(data.pagination?.total || 0); setArticlesPage(page);
    } catch { toast.error('Failed to load articles'); }
    finally { setArticlesLoading(false); }
  }, []);

  const fetchArchive = useCallback(async (type: 'users' | 'posts' | 'articles', page = 1, search = '') => {
    setArchiveLoading(true);
    try {
      const params = new URLSearchParams({ type, page: String(page), limit: '20', search });
      const res = await fetch(`/api/admin/archive?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setArchiveItems(data.items); setArchiveTotal(data.pagination?.total || 0); setArchivePage(page);
    } catch { toast.error('Failed to load archive'); }
    finally { setArchiveLoading(false); }
  }, []);

  const deletePost = useCallback(async (id: string, authorId: string) => {
    try {
      const params = new URLSearchParams({ id, authorId });
      const res = await fetch(`/api/admin/posts?${params}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Post archived successfully');
      fetchPosts(postsPage, postsSearch);
    } catch { toast.error('Failed to archive post'); }
  }, [postsPage, postsSearch, fetchPosts]);

  const deleteArticle = useCallback(async (id: string) => {
    try {
      const params = new URLSearchParams({ id });
      const res = await fetch(`/api/articles?${params}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Article deleted successfully');
      fetchArticles(articlesPage, articlesSearch, articlesCategory);
    } catch { toast.error('Failed to delete article'); }
  }, [articlesPage, articlesSearch, articlesCategory, fetchArticles]);

  const toggleArticleStatus = useCallback(async (articleId: string, status: 'draft' | 'published') => {
    try {
      const res = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, updates: { status } }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Article ${status === 'published' ? 'published' : 'unpublished'}`);
      fetchArticles(articlesPage, articlesSearch, articlesCategory);
    } catch { toast.error('Failed to update article status'); }
  }, [articlesPage, articlesSearch, articlesCategory, fetchArticles]);

  const restoreArchiveItem = useCallback(async (type: 'users' | 'posts' | 'articles', index: number, item: ArchiveItem) => {
    try {
      const res = await fetch('/api/admin/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', type, index, item }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Item restored successfully');
      fetchArchive(archiveType, archivePage, archiveSearch);
    } catch { toast.error('Failed to restore item'); }
  }, [archiveType, archivePage, archiveSearch, fetchArchive]);

  const permanentDeleteArchiveItem = useCallback(async (type: 'users' | 'posts' | 'articles', index: number) => {
    try {
      const params = new URLSearchParams({ type, index: String(index) });
      const res = await fetch(`/api/admin/archive?${params}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Item permanently deleted');
      fetchArchive(archiveType, archivePage, archiveSearch);
    } catch { toast.error('Failed to delete item permanently'); }
  }, [archiveType, archivePage, archiveSearch, fetchArchive]);

  // Load on mount & tab switch
  useEffect(() => { if (mounted) fetchStats(); }, [mounted, fetchStats]);

  useEffect(() => {
    if (!mounted) return;
    if (activeTab === 'profiles' && profiles.length === 0) fetchProfiles(1, '');
    if (activeTab === 'not-created' && ncProfiles.length === 0) fetchNcProfiles(1, '');
    if (activeTab === 'webinars') {
      if (webinars.length === 0) fetchWebinars();
      if (!meetingLink && !meetingLinkLoading) fetchMeetingLinkInfo();
    }
    if (activeTab === 'users' && users.length === 0) fetchUsers(1, '');
    if (activeTab === 'posts' && posts.length === 0) fetchPosts(1, '');
    if (activeTab === 'articles' && articles.length === 0) fetchArticles(1, '');
    if (activeTab === 'archive' && archiveItems.length === 0) fetchArchive(archiveType, 1, '');
  }, [activeTab, mounted, profiles.length, ncProfiles.length, webinars.length, users.length, posts.length, articles.length, archiveItems.length, fetchProfiles, fetchNcProfiles, fetchWebinars, fetchUsers, fetchPosts, fetchArticles, fetchArchive, archiveType]);

  useEffect(() => {
    if (selectedWebinar) {
      fetchBookings(selectedWebinar.slug, 1);
      fetchQuestions(selectedWebinar.slug, 1);
      setWebinarSubTab('bookings');
    } else {
      setBookings([]); setQuestions([]);
    }
  }, [selectedWebinar, fetchBookings, fetchQuestions]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { if (mounted) fetchProfiles(1, profilesSearch); }, 400);
    return () => clearTimeout(t);
  }, [profilesSearch, mounted, fetchProfiles]);

  useEffect(() => {
    const t = setTimeout(() => { if (mounted) fetchNcProfiles(1, ncSearch); }, 400);
    return () => clearTimeout(t);
  }, [ncSearch, mounted, fetchNcProfiles]);

  useEffect(() => {
    const t = setTimeout(() => { if (mounted) fetchUsers(1, usersSearch); }, 400);
    return () => clearTimeout(t);
  }, [usersSearch, mounted, fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => { if (mounted) fetchPosts(1, postsSearch); }, 400);
    return () => clearTimeout(t);
  }, [postsSearch, mounted, fetchPosts]);

  useEffect(() => {
    const t = setTimeout(() => { if (mounted) fetchArticles(1, articlesSearch, articlesCategory); }, 400);
    return () => clearTimeout(t);
  }, [articlesSearch, articlesCategory, mounted, fetchArticles]);

  useEffect(() => {
    const t = setTimeout(() => { if (mounted) fetchArchive(archiveType, 1, archiveSearch); }, 400);
    return () => clearTimeout(t);
  }, [archiveSearch, mounted, fetchArchive]);

  // Reset archive items when type changes
  useEffect(() => {
    if (mounted) {
      setArchiveItems([]);
      setArchivePage(1);
      fetchArchive(archiveType, 1, archiveSearch);
    }
  }, [archiveType, mounted, fetchArchive, archiveSearch]);

  const handleRefresh = async () => {
    toast.info('Refreshing...');
    await Promise.all([
      fetchStats(),
      fetchProfiles(profilesPage, profilesSearch),
      fetchNcProfiles(ncPage, ncSearch),
      fetchWebinars(),
      fetchUsers(usersPage, usersSearch),
      fetchPosts(postsPage, postsSearch),
      fetchArticles(articlesPage, articlesSearch, articlesCategory),
      fetchArchive(archiveType, archivePage, archiveSearch),
    ]);
    toast.success('Refreshed!');
  };

  const totalBookings = webinars.reduce((s, w) => s + w.bookedCount, 0);
  const ncCount = stats?.typeDistribution?.find(t => t.name === 'membership_application')?.count || 0;

  const topTabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'profiles', label: 'Profiles', icon: <GraduationCap className="w-4 h-4" />, badge: stats ? stats.profiles.total - ncCount : undefined },
    { id: 'not-created', label: 'Not Created', icon: <UserX className="w-4 h-4" />, badge: ncCount || undefined },
    { id: 'webinars', label: 'Webinars', icon: <Video className="w-4 h-4" />, badge: totalBookings },
    { id: 'users', label: 'Users', icon: <UserCog className="w-4 h-4" />, badge: stats?.users.totalFiles },
    { id: 'posts', label: 'Posts', icon: <PenLine className="w-4 h-4" /> },
    { id: 'articles', label: 'Articles', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'archive', label: 'Archive', icon: <Archive className="w-4 h-4" /> },
  ];

  if (!mounted) return null;

  return (
    <>
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* ── Header ── */}
        <header className="bg-gray-900 text-white sticky top-0 z-40">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold tracking-tight leading-none">Admin Panel</h1>
                <p className="text-[10px] text-gray-400 mt-0.5">FocusLinks Data Console</p>
              </div>
              <span className="sm:hidden text-sm font-bold">Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/12 rounded-lg text-xs font-semibold transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
              </button>
              <a href="https://github.com/Phantozweb/Fldatas" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/12 rounded-lg text-xs font-semibold transition-colors">
                <FileJson className="w-3.5 h-3.5" /> <span className="hidden sm:inline">GitHub</span>
              </a>
              <button onClick={onLogout} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg text-xs font-semibold transition-colors">
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
              </button>
              <Link to="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/12 rounded-lg text-xs font-semibold transition-colors">
                <Home className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Site</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ── Top Tab Bar ── */}
        <div className="bg-white border-b border-gray-200 sticky top-14 z-30 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
              {topTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>{tab.badge > 999 ? `${(tab.badge / 1000).toFixed(1)}k` : tab.badge}</span>
                  )}
                </button>
              ))}
              {/* Spacer for right side info */}
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-gray-400 shrink-0 pl-4">
                <Database className="w-3 h-3" />
                <span className="font-medium uppercase tracking-wider hidden md:inline">Fldatas Repo</span>
                <a href="https://github.com/Phantozweb/Fldatas" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
          <div className="min-h-[600px]">

            {/* ════════════ OVERVIEW ════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {statsLoading ? (
                  <>
                    <SkeletonCards />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="animate-pulse bg-white rounded-xl border border-gray-100 p-6 h-80" />
                      <div className="animate-pulse bg-white rounded-xl border border-gray-100 p-6 h-80" />
                    </div>
                  </>
                ) : statsError ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">Failed to Load Data</h3>
                    <p className="text-sm text-gray-400 mb-4">{statsError}</p>
                    <button onClick={fetchStats} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors">Retry</button>
                  </div>
                ) : (
                  <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { label: 'Total Profiles', value: (stats?.profiles.total || 0) - ncCount, icon: <GraduationCap className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Verified', value: stats?.profiles.verified || 0, icon: <BadgeCheck className="w-4 h-4" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Users', value: stats?.users.totalFiles || 0, icon: <Users className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Bookings', value: totalBookings, icon: <Video className="w-4 h-4" />, color: 'text-rose-600', bg: 'bg-rose-50' },
                      ].map((s) => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-200/80 p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}>{s.icon}</div>
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          </div>
                          <p className="text-xl font-extrabold text-gray-900">{s.value.toLocaleString()}</p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl border border-gray-200/80 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Globe className="w-4 h-4" /></div>
                        <div><p className="text-lg font-extrabold text-gray-900">{stats?.profiles.countries || 0}</p><p className="text-[10px] text-gray-400 font-medium">Countries</p></div>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200/80 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600"><Video className="w-4 h-4" /></div>
                        <div><p className="text-lg font-extrabold text-gray-900">{stats?.webinars.total || 0}</p><p className="text-[10px] text-gray-400 font-medium">Webinars</p></div>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200/80 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600"><UserX className="w-4 h-4" /></div>
                        <div><p className="text-lg font-extrabold text-gray-900">{ncCount}</p><p className="text-[10px] text-gray-400 font-medium">Not Created</p></div>
                      </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">Top Skills</h3>
                        <p className="text-xs text-gray-400 mb-4">Most common across profiles</p>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(stats?.profiles.topSkills || []).slice(0, 8).map(s => ({ ...s, name: s.name.length > 18 ? s.name.slice(0, 16) + '..' : s.name }))} layout="vertical" margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={130} />
                              <Tooltip content={<ChartTooltip />} />
                              <Bar dataKey="count" fill="#3b82f6" radius={[0, 5, 5, 0]} barSize={16} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">Profile Types</h3>
                        <p className="text-xs text-gray-400 mb-4">Distribution by member type</p>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie data={(stats?.typeDistribution || []).map(t => ({ ...t, color: TYPE_COLORS[t.name] || '#9ca3af' }))} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="count" stroke="none">
                                {(stats?.typeDistribution || []).map((entry, index) => (
                                  <Cell key={index} fill={TYPE_COLORS[entry.name] || '#9ca3af'} />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                          {(stats?.typeDistribution || []).map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[item.name] || '#9ca3af' }} />
                              <span className="text-gray-500 capitalize truncate">{item.name === 'membership_application' ? 'Not Created' : item.name}</span>
                              <span className="font-bold text-gray-800 ml-auto">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Webinar Quick View */}
                    {webinars.length > 0 && (
                      <div className="bg-white rounded-xl border border-gray-200/80 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">Webinar Insights</h3>
                            <p className="text-xs text-gray-400">Booking & engagement summary</p>
                          </div>
                          <button onClick={() => setActiveTab('webinars')} className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All →</button>
                        </div>
                        <div className="space-y-2">
                          {webinars.slice(0, 3).map((w) => (
                            <div key={w.slug} onClick={() => { setSelectedWebinar(w); setActiveTab('webinars'); }} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shrink-0">
                                <Video className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">{w.displayName}</p>
                                <p className="text-[11px] text-gray-400">{w.bookedCount} booked · {w.questionsCount} questions</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ════════════ PROFILES (Created) ════════════ */}
            {activeTab === 'profiles' && (
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Profile Directory</h2>
                    <p className="text-[11px] text-gray-400">{profilesTotal} created profiles</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={profilesSearch} onChange={(e) => setProfilesSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 w-52" />
                  </div>
                </div>
                <div className="p-5 pt-4">
                  {profilesLoading ? (
                    <SkeletonRows />
                  ) : profiles.length === 0 ? (
                    <div className="text-center py-10"><GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No profiles found</p></div>
                  ) : (
                    <>
                      <div className="space-y-1" style={{ minHeight: '448px' }}>
                        {profiles.map((p, i) => (
                          <div key={p.membershipId || i} onClick={() => setSelectedProfile(p)} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{p.name?.charAt(0) || '?'}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                                {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-600 capitalize hidden sm:inline-block">{p.type}</span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{p.title}</p>
                            </div>
                            <div className="hidden md:flex items-center gap-1.5 shrink-0">
                              {(p.skills || []).slice(0, 2).map((s, j) => (
                                <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-md">{s}</span>
                              ))}
                            </div>
                            <div className="hidden lg:block text-[11px] text-gray-400 w-32 truncate shrink-0">{p.location}</div>
                            <Eye className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                          </div>
                        ))}
                      </div>
                      <Pagination page={profilesPage} total={profilesTotal} onChange={(p) => fetchProfiles(p, profilesSearch)} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ════════════ NOT CREATED PROFILES ════════════ */}
            {activeTab === 'not-created' && (
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-gray-900">Not Created Profiles</h2>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-md">Applied but no profile</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{ncTotal} membership applications without a profile page</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={ncSearch} onChange={(e) => setNcSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 w-52" />
                  </div>
                </div>
                <div className="p-5 pt-4">
                  {ncLoading ? <SkeletonRows /> : ncProfiles.length === 0 ? (
                    <div className="text-center py-10"><UserX className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No membership applications found</p></div>
                  ) : (
                    <>
                      <div className="space-y-1" style={{ minHeight: '448px' }}>
                        {ncProfiles.map((p, i) => (
                          <div key={p.membershipId || i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {p.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400 truncate">{p.email}</p>
                            </div>
                            <div className="hidden sm:block text-[11px] text-gray-400 w-28 truncate shrink-0">{p.location}</div>
                            {p.membershipId && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md shrink-0">{p.membershipId}</span>}
                          </div>
                        ))}
                      </div>
                      <Pagination page={ncPage} total={ncTotal} onChange={(p) => fetchNcProfiles(p, ncSearch)} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ════════════ WEBINARS ════════════ */}
            {activeTab === 'webinars' && (
              <div className="space-y-4">
                {/* ── Meeting Link Manager ── */}
                <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                  <div className="flex items-center justify-between p-5 pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">Meeting Link Manager</h2>
                        <p className="text-[11px] text-gray-400">Manage Google Meet link on GitHub — no code edits needed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meetingLastUpdated && (
                        <span className="text-[10px] text-gray-400">Updated: {new Date(meetingLastUpdated).toLocaleString()}</span>
                      )}
                      <button onClick={fetchMeetingLinkInfo} disabled={meetingLinkLoading} className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors disabled:opacity-50">
                        <RefreshCw className={`w-3 h-3 ${meetingLinkLoading ? 'animate-spin' : ''}`} /> Refresh
                      </button>
                    </div>
                  </div>
                  <div className="p-5 pt-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Meeting Link</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="https://meet.google.com/xxx-xxx-xxx"
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all"
                          />
                          {meetingLink && (
                            <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Platform</label>
                          <select value={meetingPlatform} onChange={(e) => setMeetingPlatform(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all">
                            <option>Google Meet</option>
                            <option>Zoom</option>
                            <option>Microsoft Teams</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                          <select value={meetingStatus} onChange={(e) => setMeetingStatus(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all">
                            <option value="scheduled">Scheduled</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={saveMeetingLink}
                        disabled={meetingLinkSaving || !meetingLink.trim()}
                        className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                      >
                        {meetingLinkSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving to GitHub...</> : <><Save className="w-4 h-4" /> Save Meeting Link to GitHub</>}
                      </button>
                      <p className="text-center text-[10px] text-gray-400">This updates <code className="px-1 py-0.5 rounded bg-gray-100 text-gray-500">Webinar/meeting-info.json</code> on GitHub. Changes take effect immediately.</p>
                    </div>
                  </div>
                </div>

                {/* ── Webinar Insights ── */}
                <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                  <div className="flex items-center justify-between p-5 pb-0">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Webinar Insights</h2>
                      <p className="text-[11px] text-gray-400">Data from GitHub Fldatas/Webinar</p>
                    </div>
                    <button onClick={() => { setSelectedWebinar(null); fetchWebinars(); }} className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"><RefreshCw className="w-3 h-3" /> Refresh</button>
                  </div>
                <div className="p-5 pt-4">
                  {webinarsLoading ? <SkeletonRows count={3} /> : webinars.length === 0 ? (
                    <div className="text-center py-10"><Video className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No webinars found</p></div>
                  ) : !selectedWebinar ? (
                    <div className="space-y-2" style={{ minHeight: '300px' }}>
                      {webinars.map((w) => (
                        <div key={w.slug} onClick={() => setSelectedWebinar(w)} className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shrink-0">
                            <Video className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{w.displayName}</p>
                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" />{w.bookedCount} bookings</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-blue-500" />{w.questionsCount} questions</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setSelectedWebinar(null)} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-4 transition-colors"><ChevronLeft className="w-3.5 h-3.5" /> Back to webinars</button>
                      <div className="mb-4 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shrink-0"><Video className="w-5 h-5" /></div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold truncate">{selectedWebinar.displayName}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" />{selectedWebinar.bookedCount}</span>
                              <span className="flex items-center gap-1 text-blue-400"><MessageSquare className="w-3 h-3" />{selectedWebinar.questionsCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-4">
                        {(['bookings', 'questions'] as const).map((tab) => (
                          <button key={tab} onClick={() => setWebinarSubTab(tab)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${webinarSubTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {tab}
                          </button>
                        ))}
                      </div>
                      {webinarSubTab === 'bookings' && (
                        bookingsLoading ? <SkeletonRows /> : bookings.length === 0 ? (
                          <div className="text-center py-8"><CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No bookings yet</p></div>
                        ) : (
                          <>
                            <div className="space-y-1" style={{ minHeight: '336px' }}>
                              {bookings.map((b, i) => (
                                <div key={b.entryId || i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">{b.name?.charAt(0) || '?'}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-600">{b.membershipId}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{b.email}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[10px] text-gray-400">{b.timestamp ? new Date(b.timestamp).toLocaleDateString() : ''}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{b.type}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Pagination page={bookingsPage} total={bookingsTotal} onChange={(p) => fetchBookings(selectedWebinar.slug, p)} />
                          </>
                        )
                      )}
                      {webinarSubTab === 'questions' && (
                        questionsLoading ? <SkeletonRows count={3} /> : questions.length === 0 ? (
                          <div className="text-center py-8"><HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No questions yet</p></div>
                        ) : (
                          <>
                            <div className="space-y-2" style={{ minHeight: '336px' }}>
                              {questions.map((q, i) => (
                                <div key={q.entryId || i} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{q.name?.charAt(0) || '?'}</div>
                                    <span className="text-xs font-semibold text-gray-900">{q.name}</span>
                                    <span className="text-[10px] text-gray-400">{q.membershipId}</span>
                                    <span className="text-[10px] text-gray-300 ml-auto">{q.timestamp ? new Date(q.timestamp).toLocaleDateString() : ''}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 pl-8">{q.question}</p>
                                </div>
                              ))}
                            </div>
                            <Pagination page={questionsPage} total={questionsTotal} onChange={(p) => fetchQuestions(selectedWebinar.slug, p)} />
                          </>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
              </div>
            )}

            {/* ════════════ POSTS ════════════ */}
            {activeTab === 'posts' && (
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Community Posts</h2>
                    <p className="text-[11px] text-gray-400">{postsTotal} posts from GitHub data</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={postsSearch} onChange={(e) => setPostsSearch(e.target.value)} placeholder="Search posts..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 w-52" />
                  </div>
                </div>
                <div className="p-5 pt-4">
                  {postsLoading ? <SkeletonRows /> : posts.length === 0 ? (
                    <div className="text-center py-10"><PenLine className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No posts found</p></div>
                  ) : (
                    <>
                      <div className="space-y-1" style={{ minHeight: '448px' }}>
                        {posts.map((p, i) => (
                          <div key={p.id || i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                              {p.authorId?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-900 truncate">{p.authorId || 'Unknown'}</span>
                                <span className="text-[10px] text-gray-400">{p.timestamp ? new Date(p.timestamp).toLocaleDateString() : ''}</span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mb-1.5">{p.content?.length > 100 ? p.content.slice(0, 100) + '...' : p.content}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                {p.hashtags?.length > 0 && p.hashtags.slice(0, 3).map((h, hi) => (
                                  <span key={hi} className="px-1.5 py-0.5 text-[10px] font-medium bg-teal-50 text-teal-700 rounded">#{h}</span>
                                ))}
                                <span className="flex items-center gap-1 text-[10px] text-gray-400"><Heart className="w-3 h-3" />{p.likes?.length || 0}</span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-400"><MessageCircle className="w-3 h-3" />{p.comments?.length || 0}</span>
                                {p.images && p.images.length > 0 && <span className="flex items-center gap-1 text-[10px] text-gray-400"><ImageIcon className="w-3 h-3" />{p.images.length}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setRawPostJson(p)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors" title="View raw JSON"><FileJson className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deletePost(p.id, p.authorId)} className="p-1.5 rounded-lg hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition-colors" title="Archive post"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Pagination page={postsPage} total={postsTotal} onChange={(pg) => fetchPosts(pg, postsSearch)} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Raw Post JSON Modal */}
            <AnimatePresence>
              {rawPostJson && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setRawPostJson(null)}>
                  <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900">Raw Post JSON</h3>
                      <button onClick={() => setRawPostJson(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><XCircle className="w-4 h-4 text-gray-500" /></button>
                    </div>
                    <pre className="p-4 bg-gray-900 text-green-400 text-xs rounded-b-2xl overflow-auto max-h-[calc(80vh-60px)] leading-relaxed font-mono">{JSON.stringify(rawPostJson, null, 2)}</pre>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ════════════ ARTICLES ════════════ */}
            {activeTab === 'articles' && (
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Articles</h2>
                    <p className="text-[11px] text-gray-400">{articlesTotal} articles from GitHub data</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <select value={articlesCategory} onChange={(e) => setArticlesCategory(e.target.value)} className="pl-7 pr-6 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 appearance-none cursor-pointer">
                        <option value="">All Categories</option>
                        <option value="clinical">Clinical</option>
                        <option value="research">Research</option>
                        <option value="education">Education</option>
                        <option value="technology">Technology</option>
                        <option value="practice">Practice</option>
                      </select>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input type="text" value={articlesSearch} onChange={(e) => setArticlesSearch(e.target.value)} placeholder="Search articles..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 w-44" />
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-4">
                  {articlesLoading ? <SkeletonRows /> : articles.length === 0 ? (
                    <div className="text-center py-10"><BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No articles found</p></div>
                  ) : (
                    <>
                      <div className="space-y-1" style={{ minHeight: '448px' }}>
                        {articles.map((a, i) => (
                          <div key={a.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md capitalize shrink-0 ${
                                  a.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                                  a.status === 'draft' ? 'bg-amber-50 text-amber-700' :
                                  'bg-gray-100 text-gray-500'
                                }`}>{a.status}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                <span className="text-gray-600 font-medium">{a.authorName || a.authorId || 'Unknown'}</span>
                                {a.category && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{a.category}</span>}
                                <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" />{a.likes?.length || 0}</span>
                                <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" />{a.comments?.length || 0}</span>
                                <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{a.views || 0}</span>
                                <span className="ml-auto">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {a.status !== 'published' && (
                                <button onClick={() => toggleArticleStatus(a.id, 'published')} className="p-1.5 rounded-lg hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 transition-colors" title="Publish"><RotateCcw className="w-3.5 h-3.5" /></button>
                              )}
                              {a.status === 'published' && (
                                <button onClick={() => toggleArticleStatus(a.id, 'draft')} className="p-1.5 rounded-lg hover:bg-amber-100 text-gray-400 hover:text-amber-600 transition-colors" title="Unpublish"><RotateCcw className="w-3.5 h-3.5" /></button>
                              )}
                              <button onClick={() => deleteArticle(a.id)} className="p-1.5 rounded-lg hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Pagination page={articlesPage} total={articlesTotal} onChange={(pg) => fetchArticles(pg, articlesSearch, articlesCategory)} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ════════════ ARCHIVE ════════════ */}
            {activeTab === 'archive' && (
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Archive</h2>
                    <p className="text-[11px] text-gray-400">{archiveTotal} archived items</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)} placeholder="Search archive..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 w-52" />
                  </div>
                </div>
                <div className="p-5 pt-4">
                  {/* Archive Sub-tabs */}
                  <div className="flex items-center gap-1 mb-4">
                    {(['users', 'posts', 'articles'] as const).map((tab) => (
                      <button key={tab} onClick={() => { setArchiveType(tab); setArchiveSearch(''); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${archiveType === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  {archiveLoading ? <SkeletonRows /> : archiveItems.length === 0 ? (
                    <div className="text-center py-10"><Archive className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No archived {archiveType} found</p></div>
                  ) : (
                    <>
                      <div className="space-y-1" style={{ minHeight: '448px' }}>
                        {archiveItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(item.name || item.title || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.name || item.title || 'Untitled'}</p>
                              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                <span>{item.email || item.membershipId || item.authorId || ''}</span>
                                {item.archivedAt && <span className="ml-auto">Archived {new Date(item.archivedAt).toLocaleDateString()}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => restoreArchiveItem(archiveType, i, item)} className="p-1.5 rounded-lg hover:bg-emerald-100 text-gray-400 hover:text-emerald-600 transition-colors" title="Restore"><RotateCcw className="w-3.5 h-3.5" /></button>
                              <button onClick={() => permanentDeleteArchiveItem(archiveType, i)} className="p-1.5 rounded-lg hover:bg-rose-100 text-gray-400 hover:text-rose-600 transition-colors" title="Permanent delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Pagination page={archivePage} total={archiveTotal} onChange={(pg) => fetchArchive(archiveType, pg, archiveSearch)} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ════════════ USERS ════════════ */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 pb-0">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Registered Users</h2>
                    <p className="text-[11px] text-gray-400">{usersTotal} approved members · Click to view details</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input type="text" value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} placeholder="Search by name, email, or ID..." className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 w-52" />
                  </div>
                </div>
                <div className="p-5 pt-4">
                  {usersLoading ? <SkeletonRows /> : users.length === 0 ? (
                    <div className="text-center py-10"><Users className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-400">No users found</p></div>
                  ) : (
                    <>
                      <div className="space-y-1" style={{ minHeight: '448px' }}>
                        {users.map((u, i) => (
                          <div key={u.membershipId || i} onClick={() => setSelectedUser(u)} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {(u.fullName || u.membershipId).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-gray-900 truncate">{u.fullName || 'Unknown'}</p>
                                {u.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" title="Approved" />
                              </div>
                              <p className="text-xs text-gray-400 truncate">{u.email || u.membershipId}</p>
                            </div>
                            <div className="hidden sm:flex flex-col items-end shrink-0 gap-0.5">
                              <span className="text-[11px] text-gray-500 capitalize">{u.profession || 'N/A'}</span>
                              <span className="text-[10px] text-gray-400">{[u.cityState, u.country].filter(Boolean).join(', ') || 'N/A'}</span>
                            </div>
                            <Eye className="w-4 h-4 text-gray-300 group-hover:text-purple-500 shrink-0 transition-colors" />
                          </div>
                        ))}
                      </div>
                      <Pagination page={usersPage} total={usersTotal} onChange={(p) => fetchUsers(p, usersSearch)} />
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedProfile && <ProfileModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} onEdit={(u) => setEditingUser(u)} />}
      </AnimatePresence>

      {/* JSON Editor Modal */}
      <AnimatePresence>
        {editingUser && <JsonEditorModal user={editingUser} onClose={() => setEditingUser(null)} onSave={() => { setEditingUser(null); fetchUsers(usersPage, usersSearch); }} />}
      </AnimatePresence>
    </>
  );
}
