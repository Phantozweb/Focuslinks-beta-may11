'use client';

import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from '../../context/NavigationContext';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import {
  User,
  MapPin,
  Camera,
  Loader2,
  CheckCircle2,
  Bell,
  Lock,
  EyeOff,
  Eye,
  Shield,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Type,
  Sparkles,
  RotateCcw,
  Crown,
  Download,
  HardDrive,
  Briefcase,
  Palette,
  X,
  KeyRound,
  Smartphone,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  const id = `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 py-3 cursor-pointer group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="relative shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 rounded-full bg-gray-200 dark:bg-slate-700 peer-checked:bg-violet-600 dark:peer-checked:bg-violet-500 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar Navigation Items                                           */
/* ------------------------------------------------------------------ */
const sidebarSections = [
  { id: 'profile', label: 'Profile', icon: User, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { id: 'privacy', label: 'Privacy', icon: Shield, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { id: 'security', label: 'Security', icon: Lock, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
  { id: 'data', label: 'Data & Storage', icon: HardDrive, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30' },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /* ---- Logged-in user ---- */
  const [user] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const storedUser = localStorage.getItem('fl_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch { return null; }
  });

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userMembershipId = user?.membershipId || '';
  const userInitials = userName.split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2).toUpperCase();

  /* ---- Profile state ---- */
  const [profileState, setProfileState] = useState(() => {
    if (typeof window === 'undefined') return { displayName: '', professionalTitle: '', bio: '', location: '' };
    try {
      const storedUser = JSON.parse(localStorage.getItem('fl_user') || '{}');
      const data = JSON.parse(localStorage.getItem('fl_settings_profile') || '{}');
      return {
        displayName: data.displayName || storedUser.name || '',
        professionalTitle: data.professionalTitle || '',
        bio: data.bio || '',
        location: data.location || '',
      };
    } catch { return { displayName: '', professionalTitle: '', bio: '', location: '' }; }
  });
  const displayName = profileState.displayName;
  const setDisplayName = (v: string) => setProfileState(p => ({ ...p, displayName: v }));
  const professionalTitle = profileState.professionalTitle;
  const setProfessionalTitle = (v: string) => setProfileState(p => ({ ...p, professionalTitle: v }));
  const bio = profileState.bio;
  const setBio = (v: string) => setProfileState(p => ({ ...p, bio: v }));
  const location = profileState.location;
  const setLocation = (v: string) => setProfileState(p => ({ ...p, location: v }));
  const email = userEmail;
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  /* ---- Notification state ---- */
  const [notifState, setNotifState] = useState(() => {
    if (typeof window === 'undefined') return { notifEmail: true, notifPush: true, notifFeed: true, notifEvents: false, notifFollowers: true, notifWeekly: false };
    try {
      const data = JSON.parse(localStorage.getItem('fl_settings_notif') || '{}');
      return { notifEmail: data.notifEmail ?? true, notifPush: data.notifPush ?? true, notifFeed: data.notifFeed ?? true, notifEvents: data.notifEvents ?? false, notifFollowers: data.notifFollowers ?? true, notifWeekly: data.notifWeekly ?? false };
    } catch { return { notifEmail: true, notifPush: true, notifFeed: true, notifEvents: false, notifFollowers: true, notifWeekly: false }; }
  });
  const notifEmail = notifState.notifEmail;
  const setNotifEmail = (v: boolean) => setNotifState(p => ({ ...p, notifEmail: v }));
  const notifPush = notifState.notifPush;
  const setNotifPush = (v: boolean) => setNotifState(p => ({ ...p, notifPush: v }));
  const notifFeed = notifState.notifFeed;
  const setNotifFeed = (v: boolean) => setNotifState(p => ({ ...p, notifFeed: v }));
  const notifEvents = notifState.notifEvents;
  const setNotifEvents = (v: boolean) => setNotifState(p => ({ ...p, notifEvents: v }));
  const notifFollowers = notifState.notifFollowers;
  const setNotifFollowers = (v: boolean) => setNotifState(p => ({ ...p, notifFollowers: v }));
  const notifWeekly = notifState.notifWeekly;
  const setNotifWeekly = (v: boolean) => setNotifState(p => ({ ...p, notifWeekly: v }));
  const [isSavingNotif, setIsSavingNotif] = useState(false);

  /* ---- Appearance state ---- */
  const [compactMode, setCompactMode] = useState(false);
  const [showAnimations, setShowAnimations] = useState(true);

  /* ---- Privacy state ---- */
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [showEmail, setShowEmail] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  /* ---- Security state ---- */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  /* ---- Data state ---- */
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  /* ---- Handlers ---- */
  const handleSaveProfile = useCallback(async () => {
    setIsSavingProfile(true);
    const settingsData = { displayName, professionalTitle, bio, location };
    localStorage.setItem('fl_settings_profile', JSON.stringify(settingsData));
    await new Promise((r) => setTimeout(r, 1200));
    setIsSavingProfile(false);
    toast.success('Profile settings saved!');
  }, [displayName, professionalTitle, bio, location]);

  const handleSaveNotif = useCallback(async () => {
    setIsSavingNotif(true);
    const notifData = { notifEmail, notifPush, notifFeed, notifEvents, notifFollowers, notifWeekly };
    localStorage.setItem('fl_settings_notif', JSON.stringify(notifData));
    await new Promise((r) => setTimeout(r, 1000));
    setIsSavingNotif(false);
    toast.success('Notification preferences saved!');
  }, [notifEmail, notifPush, notifFeed, notifEvents, notifFollowers, notifWeekly]);

  const handleChangePassword = useCallback(async () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    setIsChangingPassword(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password changed successfully!');
  }, [currentPassword, newPassword, confirmPassword]);

  const handleToggle2FA = useCallback(() => {
    setTwoFactorEnabled(prev => {
      const next = !prev;
      toast.info(next ? '2FA enabled successfully!' : '2FA has been disabled.');
      return next;
    });
  }, []);

  const handleDownloadData = useCallback(async () => {
    setIsDownloading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsDownloading(false);
    toast('Preparing your data export...');
  }, []);

  const handleClearCache = useCallback(async () => {
    setIsClearingCache(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsClearingCache(false);
    toast.success('Cache cleared successfully!');
  }, []);

  const handleDeleteAccount = useCallback(() => {
    setShowDeleteDialog(false);
    toast.error('Account deletion requires email confirmation.');
  }, []);

  const handleRestartTour = useCallback(() => {
    localStorage.removeItem('fl_tour_completed');
    window.dispatchEvent(new Event('restart-tour'));
    toast.success('Tour will restart on your next visit');
  }, []);

  /* ---- Glass card ---- */
  const glassCard = 'bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden';

  /* ---- Animation variants ---- */
  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <motion.section key="profile" variants={itemVariants} initial="hidden" animate="visible" className={glassCard}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Profile Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Update your personal information and public profile</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-violet-600/20">
                    {displayName.charAt(0)}
                  </div>
                  <button className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" aria-label="Change avatar" onClick={() => toast('Avatar upload coming soon!')}>
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Profile Photo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">JPG, PNG or GIF. Max 5MB.</p>
                  <button className="mt-2 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors" onClick={() => toast('Avatar upload coming soon!')}>Upload new photo</button>
                </div>
              </div>
              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Display Name</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Professional Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input type="email" value={email} disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bio <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">{bio.length}/280</span></label>
                <textarea rows={3} maxLength={280} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={handleSaveProfile} disabled={isSavingProfile} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md">
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.section>
        );

      case 'appearance':
        return (
          <motion.section key="appearance" variants={itemVariants} initial="hidden" animate="visible" className={glassCard}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Appearance
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize the look and feel of your experience</p>
            </div>
            <div className="p-6 space-y-8">
              {/* Theme selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'light', icon: <Sun className="w-5 h-5" />, label: 'Light', bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-800', active: theme === 'light' },
                    { value: 'dark', icon: <Moon className="w-5 h-5" />, label: 'Dark', bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-white', active: theme === 'dark' },
                    { value: 'system', icon: <Monitor className="w-5 h-5" />, label: 'System', bg: 'bg-gradient-to-br from-white to-slate-900', border: 'border-gray-300', text: 'text-gray-600', active: theme === 'system' },
                  ] as const).map((opt) => (
                    <button key={opt.value} onClick={() => setTheme(opt.value)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md ${opt.active ? 'border-violet-500 ring-2 ring-violet-500/20 shadow-md' : `${opt.border} hover:border-gray-300 dark:hover:border-slate-600`}`}>
                      <div className={`w-16 h-10 rounded-lg ${opt.bg} ${opt.border} border flex items-center justify-center`}>
                        <span className={opt.text}>{opt.icon}</span>
                      </div>
                      <span className={`text-xs font-bold ${opt.active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {opt.label}
                        {opt.active && <CheckCircle2 className="w-3 h-3 ml-1 inline text-violet-600 dark:text-violet-400" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Toggles */}
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                <ToggleSwitch checked={compactMode} onChange={setCompactMode} label="Compact Mode" description="Reduce spacing and padding for denser layouts" />
                <ToggleSwitch checked={showAnimations} onChange={setShowAnimations} label="Show Animations" description="Enable smooth transitions and motion effects" />
              </div>
              {/* Restart Tour */}
              <div className="pt-4">
                <button onClick={handleRestartTour} className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all group bg-gray-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Restart Onboarding Tour</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Replay the interactive product tour</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                </button>
              </div>
            </div>
          </motion.section>
        );

      case 'notifications':
        return (
          <motion.section key="notifications" variants={itemVariants} initial="hidden" animate="visible" className={glassCard}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Notification Preferences
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Choose how and when you want to be notified</p>
            </div>
            <div className="px-6 py-2 divide-y divide-gray-100 dark:divide-slate-800">
              <ToggleSwitch checked={notifEmail} onChange={setNotifEmail} label="Email Notifications" description="Receive updates and alerts via email" />
              <ToggleSwitch checked={notifPush} onChange={setNotifPush} label="Push Notifications" description="Browser push notifications for real-time alerts" />
              <ToggleSwitch checked={notifFeed} onChange={setNotifFeed} label="Community Updates" description="Get notified about new posts and discussions in your feed" />
              <ToggleSwitch checked={notifEvents} onChange={setNotifEvents} label="Event Reminders" description="Reminders for upcoming webinars and community events" />
              <ToggleSwitch checked={notifFollowers} onChange={setNotifFollowers} label="New Followers" description="When someone starts following your profile" />
              <ToggleSwitch checked={notifWeekly} onChange={setNotifWeekly} label="Weekly Digest" description="A curated weekly summary of top content and activity" />
            </div>
            <div className="px-6 py-4 flex justify-end border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
              <button onClick={handleSaveNotif} disabled={isSavingNotif} className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md">
                {isSavingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isSavingNotif ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </motion.section>
        );

      case 'privacy':
        return (
          <motion.section key="privacy" variants={itemVariants} initial="hidden" animate="visible" className={glassCard}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Privacy
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Control who can see your information</p>
            </div>
            <div className="px-6 py-2 divide-y divide-gray-100 dark:divide-slate-800">
              <ToggleSwitch checked={profileVisibility === 'public'} onChange={(v) => setProfileVisibility(v ? 'public' : 'private')} label="Public Profile" description="Make your profile visible to the public or keep it private" />
              <ToggleSwitch checked={showEmail} onChange={setShowEmail} label="Show Email Address" description="Display your email on your public profile page" />
              <ToggleSwitch checked={showOnlineStatus} onChange={setShowOnlineStatus} label="Show Activity Status" description="Let others see when you are currently active on the platform" />
            </div>
          </motion.section>
        );

      case 'security':
        return (
          <motion.section key="security" variants={itemVariants} initial="hidden" animate="visible" className={glassCard}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500 dark:text-red-400" /> Security
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account security settings</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 dark:text-red-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Change Password</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Last changed 30 days ago</p>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                    <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                    <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                    <input type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleChangePassword} disabled={isChangingPassword} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md">
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-slate-800" />

              {/* 2FA */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <button onClick={handleToggle2FA} className={`relative w-12 h-6 rounded-full transition-colors ${twoFactorEnabled ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${twoFactorEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        );

      case 'data':
        return (
          <motion.section key="data" variants={itemVariants} initial="hidden" animate="visible" className={glassCard}>
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Data &amp; Storage
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your personal data and local storage</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Download My Data</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Export all your posts, profile data, and settings</p>
                  </div>
                </div>
                <button onClick={handleDownloadData} disabled={isDownloading} className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 hover:bg-sky-100 dark:hover:bg-sky-950/50 rounded-xl transition-colors disabled:opacity-60">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloading ? 'Preparing...' : 'Download'}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Clear Cache</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Clear locally stored data, preferences, and temp files</p>
                  </div>
                </div>
                <button onClick={handleClearCache} disabled={isClearingCache} className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-950/50 rounded-xl transition-colors disabled:opacity-60">
                  {isClearingCache ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                </button>
              </div>
            </div>
          </motion.section>
        );

      case 'danger':
        return (
          <motion.section key="danger" variants={itemVariants} initial="hidden" animate="visible" className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-200 dark:border-red-900/50 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
              <h2 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h2>
              <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-0.5">These actions are permanent and cannot be undone.</p>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delete Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Permanently remove your account and all associated data</p>
                  </div>
                </div>
                <button onClick={() => setShowDeleteDialog(true)} className="shrink-0 px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm hover:shadow-md inline-flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>
          </motion.section>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <SEO title="Settings" description="Manage your FocusLinks account settings, preferences, and privacy options." keywords="settings, account settings, privacy, preferences" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your account preferences and privacy</p>
          </div>
          <Link to="/dashboard" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
          </Link>
        </motion.div>

        {/* Profile Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/20">
                {userInitials || 'FL'}
              </div>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName || userName}</h2>
              {professionalTitle && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{professionalTitle}</p>
                </div>
              )}
              {location && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/30">
                  <Crown className="w-3 h-3" /> {userMembershipId}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.nav
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:w-64 shrink-0"
          >
            <div className="lg:sticky lg:top-10 space-y-1">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? section.bg : 'bg-gray-100 dark:bg-slate-800'}`}>
                      <Icon className={`w-4 h-4 ${isActive ? section.color : 'text-gray-400 dark:text-gray-500'}`} />
                    </div>
                    <span>{section.label}</span>
                    {section.id === 'danger' && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {renderSection()}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
                <button onClick={() => setShowDeleteDialog(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  Cancel
                </button>
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
