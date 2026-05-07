'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MapPin, BadgeCheck, Award, Users, Grid3X3, List, ChevronDown, MessageCircle, UserPlus, Eye, Download, Star, Clock, Zap, X, XCircle, ExternalLink, MapPinned, Stethoscope, FlaskConical, GraduationCap, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from '../../context/NavigationContext';
import { useProfiles, generateSlug } from '../../hooks/useProfiles';
import { Profile } from '../../hooks/useProfiles';
import SEO from '../components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';

const PROFILES_PER_PAGE = 12;

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'name-asc' | 'name-desc';
type ConnectState = 'idle' | 'connecting' | 'pending' | 'connected';
type ProCategory = 'all' | 'optometrist' | 'researcher' | 'academic' | 'specialist';

const OPTOMETRY_SKILLS = [
  'Refraction',
  'Contact Lenses',
  'Low Vision',
  'Pediatric Optometry',
  'Binocular Vision',
  'Myopia Management',
  'Glaucoma',
  'Dry Eye',
  'Retinal Imaging',
  'Neuro-Optometry',
];

function getResponseTime(_seed: number): string {
  return '—';
}

function getLastActive(_seed: number): string {
  return '—';
}

const PRO_CATEGORIES: { key: ProCategory; label: string; icon: React.ReactNode; keywords: string[] }[] = [
  { key: 'all', label: 'All Professionals', icon: <Users className="w-4 h-4" />, keywords: [] },
  { key: 'optometrist', label: 'Optometrists', icon: <Stethoscope className="w-4 h-4" />, keywords: ['optometrist', 'optometry', 'optometric', 'od ', 'b.optom', 'bsc optometry', 'm.optom'] },
  { key: 'researcher', label: 'Researchers', icon: <FlaskConical className="w-4 h-4" />, keywords: ['research', 'researcher', 'phd', 'scientist', 'postdoctoral', 'fellowship', 'principal investigator'] },
  { key: 'academic', label: 'Academic', icon: <GraduationCap className="w-4 h-4" />, keywords: ['professor', 'lecturer', 'faculty', 'dean', 'head of', 'academic', 'university', 'college', 'institute', 'tutor', 'instructor'] },
  { key: 'specialist', label: 'Specialists', icon: <Microscope className="w-4 h-4" />, keywords: ['specialist', 'specialist', 'cornea', 'retina', 'glaucoma', 'paediatric', 'pediatric', 'low vision', 'neuro', 'contact lens', 'refractive', 'vision therapy', 'binocular'] },
];



function getProfileCategory(profile: Profile): ProCategory {
  const title = (profile.title || '').toLowerCase();
  const desc = (profile.description || '').toLowerCase();
  const combined = `${title} ${desc}`;
  for (const cat of PRO_CATEGORIES) {
    if (cat.key === 'all') continue;
    if (cat.keywords.some(kw => combined.includes(kw))) return cat.key;
  }
  return 'all';
}

function SkeletonCard({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3.5 w-56 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
      <Skeleton className="h-24 w-full" />
      <div className="px-5 pb-6 flex flex-col flex-grow relative">
        <div className="-mt-10 mb-3">
          <Skeleton className="w-20 h-20 rounded-full border-4 border-white" />
        </div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-3 w-16 mb-3" />
        <Skeleton className="h-3.5 w-full mb-1" />
        <Skeleton className="h-3.5 w-3/4 mb-3" />
        <Skeleton className="h-3 w-24 mb-6" />
        <div className="mt-auto">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function OnlineStatusIndicator({ seed }: { seed: number }) {
  const isOnline = seed % 3 !== 0;
  return (
    <span className="relative flex h-3 w-3" title={isOnline ? 'Online' : 'Offline'}>
      {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
    </span>
  );
}

function ConnectButton({ profile, onConnect }: { profile: Profile; onConnect: (id: string) => void }) {
  const [state, setState] = useState<ConnectState>('idle');
  const id = profile.membershipId || profile.name || '';

  const handleClick = () => {
    if (state === 'idle') {
      setState('connecting');
      setTimeout(() => {
        setState('pending');
        toast.info(`Connection request sent to ${profile.name}`, {
          description: 'They will be notified.',
        });
      }, 800);
    } else if (state === 'pending') {
      setState('connected');
      toast.success(`You are now connected with ${profile.name}!`);
      onConnect(id);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      disabled={state === 'connected'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
        state === 'idle'
          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 hover:bg-teal-100 border border-teal-200 dark:border-teal-800'
          : state === 'connecting'
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 cursor-wait'
            : state === 'pending'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-amber-200 dark:border-amber-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 cursor-default'
      }`}
    >
      {state === 'idle' && <><UserPlus className="w-3.5 h-3.5" /> Connect</>}
      {state === 'connecting' && <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block"><Clock className="w-3.5 h-3.5" /></motion.span> Sending...</>}
      {state === 'pending' && <><Clock className="w-3.5 h-3.5" /> Pending</>}
      {state === 'connected' && <><BadgeCheck className="w-3.5 h-3.5" /> Connected</>}
    </motion.button>
  );
}

function QuickViewPanel({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const seed = profile.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const responseTime = getResponseTime(seed);
  const lastActive = getLastActive(seed + 3);
  const isOnline = seed % 3 !== 0;
  const [connectState, setConnectState] = useState<ConnectState>('idle');

  const handleConnect = () => {
    if (connectState === 'idle') {
      setConnectState('connecting');
      setTimeout(() => {
        setConnectState('connected');
        toast.success(`Connected with ${profile.name}!`);
      }, 1000);
    }
  };

  const category = getProfileCategory(profile);
  const categoryLabel = PRO_CATEGORIES.find(c => c.key === category)?.label || 'Professional';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-teal-100 via-emerald-50 to-cyan-100 dark:from-teal-900/30 dark:via-slate-900/50 dark:to-cyan-900/30">
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-white transition-colors">
            <X className="w-5 h-5 text-slate-600 dark:text-gray-300" />
          </button>
          {profile.flCredits && (
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-amber-200/50 flex items-center gap-1.5 z-10">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{profile.flCredits} FL Credits</span>
            </div>
          )}
        </div>

        <div className="px-6 pb-8 -mt-14">
          {/* Avatar */}
          <div className="relative inline-block mb-4">
            {!profile.image || profile.image === 'none' ? (
              <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
            ) : (
              <img
                src={profile.image}
                alt={profile.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e2e8f0&color=1e293b&size=200`;
                }}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-lg"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute -bottom-1 -right-1">
              <OnlineStatusIndicator seed={seed} />
            </div>
            {profile.verified && (
              <BadgeCheck className="absolute -top-1 -right-1 w-6 h-6 text-teal-500 bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />
            )}
          </div>

          {/* Name & Status */}
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">{profile.name}</h2>
          <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-2">{profile.title}</p>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
              {categoryLabel}
            </span>
            {isOnline && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <OnlineStatusIndicator seed={seed} /> Online
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-center flex-1">
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                <Zap className="w-4 h-4 inline mr-1 text-amber-500" />
                {responseTime}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Response Time</p>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center flex-1">
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{lastActive}</p>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Last Active</p>
            </div>
          </div>

          {/* Location */}
          {profile.location && (
            <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400 text-sm mb-5">
              <MapPinned className="w-4 h-4 text-slate-400" />
              <span>{profile.location}</span>
            </div>
          )}

          {/* Bio */}
          {profile.description && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">About</h3>
              <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{profile.description}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 text-xs font-semibold rounded-lg">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              disabled={connectState === 'connected'}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                connectState === 'idle'
                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
                  : connectState === 'connecting'
                    ? 'bg-amber-500 text-white cursor-wait'
                    : 'bg-emerald-600 text-white shadow-md'
              }`}
            >
              {connectState === 'idle' && <><UserPlus className="w-4 h-4" /> Connect</>}
              {connectState === 'connecting' && 'Connecting...'}
              {connectState === 'connected' && <><BadgeCheck className="w-4 h-4" /> Connected</>}
            </motion.button>
            <Link
              to={`/profile/${generateSlug(profile.name)}`}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Full Profile
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function FeaturedProfileCard({ profile }: { profile: Profile }) {
  const seed = profile.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const category = getProfileCategory(profile);
  const categoryLabel = PRO_CATEGORIES.find(c => c.key === category)?.label || 'Professional';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-10 p-[2px] rounded-3xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 overflow-hidden"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 rounded-full -translate-y-1/3 translate-x-1/3 opacity-70"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {!profile.image || profile.image === 'none' ? (
              <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-lg">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
            ) : (
              <img
                src={profile.image}
                alt={profile.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e2e8f0&color=1e293b&size=200`;
                }}
                className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute -bottom-1 -right-1">
              <OnlineStatusIndicator seed={seed} />
            </div>
            {profile.verified && (
              <BadgeCheck className="absolute -top-1 -right-1 w-6 h-6 text-teal-500 bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h3>
              <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured
              </span>
            </div>
            <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-1">{profile.title}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
              {profile.location && (
                <span className="flex items-center gap-1 text-slate-500 dark:text-gray-400 text-sm">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </span>
              )}
            </div>
            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 mb-3">
              {categoryLabel}
            </span>
            <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{profile.description}</p>
          </div>

          <div className="flex sm:flex-col gap-3 shrink-0">
            <Link
              to={`/profile/${generateSlug(profile.name)}`}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> View
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileCardGrid({ profile, onQuickView }: { profile: Profile; onQuickView: (p: Profile) => void }) {
  const seed = profile.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const responseTime = getResponseTime(seed);
  const lastActive = getLastActive(seed + 3);
  const category = getProfileCategory(profile);
  const categoryLabel = PRO_CATEGORIES.find(c => c.key === category)?.label || 'Professional';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-full hover:shadow-xl transition-all duration-300 group overflow-hidden relative cursor-pointer"
      onClick={() => onQuickView(profile)}
    >
      {/* Hover action buttons */}
      <div className="absolute top-3 left-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button className="w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
          <UserPlus className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400 hover:text-teal-600" />
        </button>
        <button className="w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
          <MessageCircle className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400 hover:text-teal-600" />
        </button>
      </div>

      <div className="h-24 bg-gradient-to-r from-teal-100 via-emerald-50 to-cyan-100 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-200/40 to-transparent rounded-bl-full opacity-50"></div>
        {profile.flCredits && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-amber-200/50 flex items-center gap-1.5 z-10">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{profile.flCredits} FL</span>
          </div>
        )}
      </div>

      <div className="px-5 pb-6 flex flex-col flex-grow relative">
        <div className="relative -mt-12 mb-3 inline-block self-start">
          {!profile.image || profile.image === 'none' ? (
            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-4 border-white shadow-sm">
              <Users className="w-10 h-10 text-slate-400 dark:text-gray-500" />
            </div>
          ) : (
            <img
              src={profile.image}
              alt={profile.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e2e8f0&color=1e293b&size=150`;
              }}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm bg-white dark:bg-slate-900"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute bottom-1 right-1">
            <OnlineStatusIndicator seed={seed} />
          </div>
          {profile.verified && (
            <BadgeCheck className="absolute bottom-0 right-0 w-6 h-6 text-teal-500 drop-shadow-sm bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-teal-600 transition-colors line-clamp-1">{profile.name}</h3>
          </div>
          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
            {categoryLabel}
          </span>
          <p className="text-sm text-slate-600 dark:text-gray-400 font-medium line-clamp-2 min-h-[40px]">{profile.title}</p>
          <div className="flex items-center text-slate-500 dark:text-gray-400 text-xs mt-2">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{profile.location}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Responds {responseTime}</span>
            <span>·</span>
            <span>{lastActive}</span>
          </div>
        </div>

        <p className="text-slate-500 dark:text-gray-400 text-sm flex-grow line-clamp-3 mt-3 mb-4">
          {profile.description}
        </p>

        <div className="flex gap-2 mt-auto">
          <Link to={`/profile/${generateSlug(profile.name)}`} className="flex-1 py-2.5 px-4 bg-slate-50 dark:bg-slate-900 hover:bg-teal-50 text-slate-700 dark:text-gray-300 hover:text-teal-700 font-bold rounded-xl text-sm transition-all border border-slate-200 dark:border-slate-700 hover:border-teal-200 text-center block" onClick={(e) => e.stopPropagation()}>
            View Profile
          </Link>
          <ConnectButton profile={profile} onConnect={() => {}} />
        </div>
      </div>
    </motion.div>
  );
}

function ProfileCardList({ profile, onQuickView }: { profile: Profile; onQuickView: (p: Profile) => void }) {
  const seed = profile.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const responseTime = getResponseTime(seed);
  const lastActive = getLastActive(seed + 3);
  const category = getProfileCategory(profile);
  const categoryLabel = PRO_CATEGORIES.find(c => c.key === category)?.label || 'Professional';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: 0.03 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group overflow-hidden relative cursor-pointer"
      onClick={() => onQuickView(profile)}
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div className="relative shrink-0">
          {!profile.image || profile.image === 'none' ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-slate-100 dark:border-slate-800">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400 dark:text-gray-500" />
            </div>
          ) : (
            <img
              src={profile.image}
              alt={profile.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=e2e8f0&color=1e293b&size=150`;
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute -bottom-0.5 -right-0.5">
            <OnlineStatusIndicator seed={seed} />
          </div>
          {profile.verified && (
            <BadgeCheck className="absolute -bottom-0.5 -left-0.5 w-5 h-5 text-teal-500 bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-teal-600 transition-colors truncate">{profile.name}</h3>
            {profile.flCredits && (
              <span className="shrink-0 inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200/50">
                <Award className="w-3 h-3" />
                {profile.flCredits} FL
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-gray-400 font-medium truncate mb-1">{profile.title}</p>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
              {categoryLabel}
            </span>
            {profile.location && (
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 dark:text-gray-500">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> {responseTime}</span>
            <span>·</span>
            <span>{lastActive}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <ConnectButton profile={profile} onConnect={() => {}} />
          <button className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors" onClick={(e) => { e.stopPropagation(); onQuickView(profile); }}>
            <Eye className="w-4 h-4 text-slate-500 dark:text-gray-400 hover:text-teal-600" />
          </button>
        </div>
      </div>

      {profile.description && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
          <p className="text-slate-500 dark:text-gray-400 text-sm line-clamp-2 pl-0 sm:pl-20">{profile.description}</p>
        </div>
      )}

      <div className="hidden sm:block border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50" onClick={(e) => e.stopPropagation()}>
        <Link to={`/profile/${generateSlug(profile.name)}`} className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors inline-flex items-center gap-1">
          View Profile
          <ChevronDown className="w-3.5 h-3.5 rotate-[-90deg]" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProfessionalsDirectory() {
  const { listProfiles, loadingList, errorList, fetchListProfiles } = useProfiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [proCategory, setProCategory] = useState<ProCategory>('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [visibleCount, setVisibleCount] = useState(PROFILES_PER_PAGE);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  const filteredProfiles = useMemo(() => {
    let profiles = listProfiles.filter(profile => {
      // Only show professionals - exclude students and membership_application
      if (profile.type === 'student' || profile.type === 'membership_application') return false;

      const name = (profile.name || '').toLowerCase();
      const title = (profile.title || '').toLowerCase();
      const location = (profile.location || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = name.includes(query) ||
                            title.includes(query) ||
                            location.includes(query);

      // Filter by professional sub-category
      let matchesCategory = true;
      if (proCategory !== 'all') {
        const catDef = PRO_CATEGORIES.find(c => c.key === proCategory);
        if (catDef) {
          const combined = `${title} ${(profile.description || '').toLowerCase()}`;
          matchesCategory = catDef.keywords.some(kw => combined.includes(kw));
        }
      }

      const matchesSkill = skillFilter === 'all' || (profile.skills || []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
      return matchesSearch && matchesCategory && matchesSkill;
    });

    switch (sortOption) {
      case 'name-asc':
        profiles.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        profiles.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'recent':
      default:
        break;
    }

    return profiles;
  }, [listProfiles, searchQuery, proCategory, sortOption, skillFilter]);

  // Featured professional - rotates among filtered professionals
  const featuredProfile = useMemo(() => {
    const verified = filteredProfiles.filter(p => p.verified);
    const pool = verified.length > 0 ? verified : filteredProfiles;
    if (pool.length === 0) return null;
    const index = Math.floor(Date.now() / 100000) % pool.length;
    return pool[index];
  }, [filteredProfiles]);

  const visibleProfiles = filteredProfiles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProfiles.length;
  const totalCount = filteredProfiles.length;
  const showingCount = Math.min(visibleCount, totalCount);

  const hasActiveFilters = searchQuery !== '' || proCategory !== 'all' || skillFilter !== 'all';

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setVisibleCount(PROFILES_PER_PAGE);
  };

  const handleCategoryChange = (val: ProCategory) => {
    setProCategory(val);
    setVisibleCount(PROFILES_PER_PAGE);
  };

  const handleSkillFilterChange = (val: string) => {
    setSkillFilter(val);
    setVisibleCount(PROFILES_PER_PAGE);
  };

  const handleSortChange = (val: string) => {
    setSortOption(val as SortOption);
    setVisibleCount(PROFILES_PER_PAGE);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setProCategory('all');
    setSkillFilter('all');
    setVisibleCount(PROFILES_PER_PAGE);
  };

  const handleExport = useCallback(() => {
    const headers = ['Name', 'Title', 'Category', 'Location', 'Description', 'Skills', 'Verified', 'FL Credits'];
    const rows = filteredProfiles.map(p => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${PRO_CATEGORIES.find(c => c.key === getProfileCategory(p))?.label || 'Professional'}"`,
      `"${(p.location || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${(p.skills || []).join('; ').replace(/"/g, '""')}"`,
      p.verified ? 'Yes' : 'No',
      p.flCredits || 0,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focuslinks_professionals.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Professionals directory exported!', {
      description: `${filteredProfiles.length} professional profiles downloaded as CSV.`,
    });
  }, [filteredProfiles]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 pb-20 md:pb-12">
      <SEO
        title="Professionals Directory"
        description="Connect with verified optometrists and eye care professionals worldwide"
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-950/30 rounded-full mb-6 border border-teal-200 dark:border-teal-800">
            <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-bold text-teal-700 dark:text-teal-300">Eye Care Professionals</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Professionals Directory
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
            Connect with verified optometrists and eye care professionals worldwide
          </p>
          {!loadingList && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> professionals
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                <BadgeCheck className="w-4 h-4 text-teal-500" />
                <span className="font-bold text-slate-900 dark:text-white">{filteredProfiles.filter(p => p.verified).length}</span> verified
              </div>
            </div>
          )}
        </motion.div>

        {/* Featured Professional */}
        {!loadingList && !errorList && featuredProfile && !hasActiveFilters && (
          <FeaturedProfileCard profile={featuredProfile} />
        )}

        {/* Search, Filters & Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-11 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                placeholder="Search by name, title, or location..."
              />
              {searchQuery && (
                <button onClick={() => handleSearchChange('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort, Skill filter, View Toggle & Export */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <Select value={skillFilter} onValueChange={handleSkillFilterChange}>
                <SelectTrigger className="w-[150px] text-sm rounded-xl border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-gray-400 truncate">
                    {skillFilter === 'all' ? 'All Skills' : skillFilter}
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-72">
                  <SelectItem value="all">All Skills</SelectItem>
                  {OPTOMETRY_SKILLS.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[150px] text-sm rounded-xl border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-gray-400">
                    {sortOption === 'recent' ? 'Recently Added' :
                     sortOption === 'name-asc' ? 'Name (A-Z)' :
                     'Name (Z-A)'}
                  </span>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 dark:hover:border-emerald-800 transition-all text-sm font-semibold"
                title="Export Professionals as CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>

              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(val) => { if (val) setViewMode(val as ViewMode); }}
                className="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
              >
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="data-[state=on]:bg-white data-[state=on]:text-teal-600 data-[state=on]:shadow-sm rounded-l-xl rounded-r-none px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  aria-label="List view"
                  className="data-[state=on]:bg-white data-[state=on]:text-teal-600 data-[state=on]:shadow-sm rounded-r-xl rounded-l-none px-3"
                >
                  <List className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex gap-2 w-full overflow-x-auto pb-1 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            {PRO_CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  proCategory === cat.key
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 flex items-center gap-1.5 ml-auto"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loadingList && (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            : 'flex flex-col gap-4'
          }>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Error State */}
        {errorList && !loadingList && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Failed to load professionals</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">{errorList}</p>
            <button
              onClick={fetchListProfiles}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingList && !errorList && filteredProfiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No professionals found</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more professionals.'
                : 'No professional profiles are available yet. Check back soon!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Results */}
        {!loadingList && !errorList && filteredProfiles.length > 0 && (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Showing <span className="font-bold text-slate-900 dark:text-white">{showingCount}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> professionals
              </p>
            </div>

            {/* Profile Grid / List */}
            <AnimatePresence mode="wait">
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-4'
              }>
                {visibleProfiles.map(profile => (
                  viewMode === 'grid'
                    ? <ProfileCardGrid key={profile.membershipId || profile.name} profile={profile} onQuickView={setSelectedProfile} />
                    : <ProfileCardList key={profile.membershipId || profile.name} profile={profile} onQuickView={setSelectedProfile} />
                ))}
              </div>
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setVisibleCount(prev => prev + PROFILES_PER_PAGE)}
                  className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-teal-600/20"
                >
                  Load More Professionals
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick View Panel */}
      <AnimatePresence>
        {selectedProfile && (
          <QuickViewPanel
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
