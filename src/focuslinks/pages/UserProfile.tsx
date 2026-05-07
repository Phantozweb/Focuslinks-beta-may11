'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from '../../context/NavigationContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  User,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Share2,
  Star,
  Award,
  FileText,
  MessageSquare,
  Heart,
  Plus,
  X,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Download,
  Trash2,
  Briefcase,
  GraduationCap,
  Globe,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Github,
  Upload,
  File,
  AlertCircle,
  Sparkles,
  Loader2,
  Send,
  ChevronRight,
  Pencil,
  BadgeCheck,
} from 'lucide-react';
import SEO from '../components/SEO';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
  details: string;
}

interface PostItem {
  id: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
}

interface UploadedFile {
  name: string;
  size: number;
}

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  No mock data — profiles fetch real data or show empty states     */
/* ------------------------------------------------------------------ */

const suggestedSkills = [
  'Pediatric Optometry',
  'Myopia Management',
  'Contact Lenses',
  'Clinical Research',
  'Low Vision',
  'Binocular Vision',
  'Ocular Disease',
  'Dry Eye Treatment',
  'Glaucoma Management',
  'Sports Vision',
];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function UserProfile() {
  const navigate = useNavigate();

  // Tab state
  type TabType = 'about' | 'experience' | 'education' | 'posts' | 'resume';
  const [activeTab, setActiveTab] = useState<TabType>('about');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    linkedin: '',
    github: '',
    website: '',
  });

  // Posts
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Resume
  const [resumeFile, setResumeFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form states
  const [editName, setEditName] = useState(name);
  const [editTitle, setEditTitle] = useState(title);
  const [editLocation, setEditLocation] = useState(location);
  const [editBio, setEditBio] = useState(bio);
  const [editSkills, setEditSkills] = useState<string[]>(skills);
  const [editSocialTwitter, setEditSocialTwitter] = useState(socialLinks.twitter);
  const [editSocialLinkedin, setEditSocialLinkedin] = useState(socialLinks.linkedin);
  const [editSocialGithub, setEditSocialGithub] = useState(socialLinks.github);
  const [editSocialWebsite, setEditSocialWebsite] = useState(socialLinks.website);

  // Experience edit form
  const [showExpForm, setShowExpForm] = useState(false);
  const [expForm, setExpForm] = useState<Omit<ExperienceItem, 'id'>>({ title: '', company: '', period: '', location: '', description: '' });

  // Education edit form
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduForm, setEduForm] = useState<Omit<EducationItem, 'id'>>({ degree: '', institution: '', year: '', details: '' });

  // Profile completion
  const completion = useMemo(() => {
    let filled = 0;
    const total = 8;
    if (name.trim()) filled++;
    if (title.trim()) filled++;
    if (location.trim()) filled++;
    if (bio.trim()) filled++;
    if (skills.length > 0) filled++;
    if (experience.length > 0) filled++;
    if (education.length > 0) filled++;
    if (resumeFile) filled++;
    return Math.round((filled / total) * 100);
  }, [name, title, location, bio, skills, experience, education, resumeFile]);

  const completionItems = useMemo(() => [
    { label: 'Name', done: !!name.trim() },
    { label: 'Title', done: !!title.trim() },
    { label: 'Location', done: !!location.trim() },
    { label: 'Bio', done: !!bio.trim() },
    { label: 'Skills', done: skills.length > 0 },
    { label: 'Experience', done: experience.length > 0 },
    { label: 'Education', done: education.length > 0 },
    { label: 'Resume', done: !!resumeFile },
  ], [name, title, location, bio, skills, experience, education, resumeFile]);

  // Sync edit form when toggling edit mode
  const handleToggleEdit = useCallback(() => {
    if (isEditing) {
      // Save
      setSaving(true);
      setTimeout(() => {
        setName(editName);
        setTitle(editTitle);
        setLocation(editLocation);
        setBio(editBio);
        setSkills(editSkills);
        setSocialLinks({ twitter: editSocialTwitter, linkedin: editSocialLinkedin, github: editSocialGithub, website: editSocialWebsite });
        setSaving(false);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }, 800);
    } else {
      setEditName(name);
      setEditTitle(title);
      setEditLocation(location);
      setEditBio(bio);
      setEditSkills(skills);
      setEditSocialTwitter(socialLinks.twitter);
      setEditSocialLinkedin(socialLinks.linkedin);
      setEditSocialGithub(socialLinks.github);
      setEditSocialWebsite(socialLinks.website);
      setIsEditing(true);
    }
  }, [isEditing, editName, editTitle, editLocation, editBio, editSkills, editSocialTwitter, editSocialLinkedin, editSocialGithub, editSocialWebsite, name, title, location, bio, skills, socialLinks]);

  // Skill management (edit mode)
  const addSkill = useCallback((skill: string) => {
    if (!editSkills.includes(skill)) {
      setEditSkills(prev => [...prev, skill]);
    }
  }, [editSkills]);

  const removeSkill = useCallback((skill: string) => {
    setEditSkills(prev => prev.filter(s => s !== skill));
  }, []);

  // Experience management
  const handleAddExperience = useCallback(() => {
    if (!expForm.title.trim() || !expForm.company.trim()) {
      toast.error('Title and company are required.');
      return;
    }
    setExperience(prev => [...prev, { ...expForm, id: `e${Date.now()}` }]);
    setExpForm({ title: '', company: '', period: '', location: '', description: '' });
    setShowExpForm(false);
    toast.success('Experience added!');
  }, [expForm]);

  const handleRemoveExperience = useCallback((id: string) => {
    setExperience(prev => prev.filter(e => e !== id));
    toast.success('Experience removed.');
  }, []);

  // Education management
  const handleAddEducation = useCallback(() => {
    if (!eduForm.degree.trim() || !eduForm.institution.trim()) {
      toast.error('Degree and institution are required.');
      return;
    }
    setEducation(prev => [...prev, { ...eduForm, id: `ed${Date.now()}` }]);
    setEduForm({ degree: '', institution: '', year: '', details: '' });
    setShowEduForm(false);
    toast.success('Education added!');
  }, [eduForm]);

  const handleRemoveEducation = useCallback((id: string) => {
    setEducation(prev => prev.filter(e => e.id !== id));
    toast.success('Education removed.');
  }, []);

  // Post creation
  const handleCreatePost = useCallback(() => {
    if (!newPostContent.trim()) return;
    setSubmittingPost(true);
    setTimeout(() => {
      setPosts(prev => [{ id: `p${Date.now()}`, content: newPostContent.trim(), likes: 0, comments: 0, time: 'Just now' }, ...prev]);
      setNewPostContent('');
      setSubmittingPost(false);
      toast.success('Post published!');
    }, 600);
  }, [newPostContent]);

  // Resume file handling
  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10 MB.');
      return;
    }
    setResumeFile({ name: file.name, size: file.size });
    toast.success(`Resume "${file.name}" selected successfully!`);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleRemoveResume = useCallback(() => {
    setResumeFile(null);
    toast.success('Resume removed.');
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFileSelect]);

  // Share
  const handleShare = useCallback(() => {
    const url = `${window.location.origin}${window.location.hash}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast.success('Profile link copied!')).catch(() => toast.success('Profile link copied!'));
    } else {
      toast.success('Profile link copied!');
    }
  }, []);

  // Edit cover/avatar handlers
  const handleEditCover = useCallback(() => toast.info('Cover photo editor coming soon!'), []);
  const handleEditAvatar = useCallback(() => toast.info('Avatar editor coming soon!'), []);

  // Tab items
  const tabs: { key: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'about', label: 'About', icon: User },
    { key: 'experience', label: 'Experience', icon: Briefcase },
    { key: 'education', label: 'Education', icon: GraduationCap },
    { key: 'posts', label: 'Posts', icon: FileText },
    { key: 'resume', label: 'Resume', icon: File },
  ];

  // Input class helper
  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm';

  return (
    <>
    <SEO title="User Profile" description="View user profile on FocusLinks." keywords="user profile, member profile" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-white">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto">

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 1. COVER PHOTO                                             */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="relative">
          <div className="h-56 sm:h-64 md:h-72 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500 relative overflow-hidden">
            {/* Decorative elements */}
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
          <button
            onClick={handleEditCover}
            className="absolute top-6 right-6 inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md text-white/90 rounded-full text-sm font-medium hover:bg-black/60 transition-all border border-white/10"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Cover</span>
          </button>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-6 sm:left-8 md:left-10">
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl shadow-violet-500/30 border-4 border-slate-50 dark:border-slate-950">
                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <button
                onClick={handleEditAvatar}
                className="absolute bottom-1 right-1 w-9 h-9 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center shadow-lg transition-colors border-2 border-slate-50 dark:border-slate-950"
                aria-label="Edit avatar"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-50 dark:border-slate-950">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 2. PROFILE INFO + COMPLETION                               */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="p-5 sm:p-6 md:p-8">

              {/* Profile Completion Bar */}
              <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 rounded-xl border border-violet-100 dark:border-violet-800/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Profile Completion</span>
                  </div>
                  <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{completion}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-violet-100 dark:bg-violet-900/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {completionItems.map(item => (
                    <span key={item.label} className={`text-xs font-medium ${item.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {item.done ? <Check className="w-3 h-3 inline mr-1" /> : null}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Name, role, location */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="min-w-0">
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-transparent border-b-2 border-violet-500 outline-none w-full mb-1 dark:text-white"
                      placeholder="Your name"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
                        {name}
                      </h1>
                      <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0 hidden sm:block" />
                    </div>
                  )}
                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="text-violet-600 dark:text-violet-400 font-semibold text-sm sm:text-base bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none w-full mt-1"
                      placeholder="Your title"
                    />
                  ) : (
                    <p className="text-violet-600 dark:text-violet-400 font-semibold mt-1 text-sm sm:text-base">
                      {title}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {isEditing ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <input
                          value={editLocation}
                          onChange={e => setEditLocation(e.target.value)}
                          className="bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none dark:text-gray-300 w-40"
                          placeholder="Location"
                        />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Member since Jan 2023
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleToggleEdit}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-lg ${
                      isEditing
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                        : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20'
                    }`}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isEditing ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : isEditing ? 'Save Profile' : 'Edit Profile'}
                  </button>
                  {!isEditing && (
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center justify-center p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-slate-700"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Posts', value: 0, icon: FileText },
                  { label: 'Connections', value: 0, icon: User },
                  { label: 'FL Credits', value: 0, icon: Star },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-slate-700/50 hover:border-violet-200 dark:hover:border-violet-800 transition-colors group">
                    <div className="flex items-center gap-2 mb-1">
                      <stat.icon className="w-4 h-4 text-violet-500 dark:text-violet-400 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{stat.label}</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB NAVIGATION                                              */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-1 border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="profileTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB CONTENT                                                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="px-4 sm:px-6 md:px-8 pb-16">
          <AnimatePresence mode="wait">

            {/* ── ABOUT TAB ── */}
            {activeTab === 'about' && (
              <motion.div key="about" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                {/* Bio */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-violet-500" /> About
                    </h2>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 dark:text-gray-500">Bio</span>
                          <span className={`text-xs font-medium ${editBio.length > 500 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {editBio.length}/500
                          </span>
                        </div>
                        <textarea
                          value={editBio}
                          onChange={e => { if (e.target.value.length <= 500) setEditBio(e.target.value); }}
                          rows={5}
                          className={inputClass + ' resize-none'}
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{bio}</p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6 md:p-8">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-violet-500" /> Skills & Interests
                    </h3>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {editSkills.map(skill => (
                            <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 text-sm font-medium">
                              {skill}
                              <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Click to add suggested skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedSkills
                              .filter(s => !editSkills.includes(s))
                              .slice(0, 6)
                              .map(skill => (
                                <button
                                  key={skill}
                                  onClick={() => addSkill(skill)}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                >
                                  <Plus className="w-3 h-3" /> {skill}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6 md:p-8">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-violet-500" /> Social Links
                    </h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center shrink-0">
                            <Twitter className="w-4 h-4 text-sky-500" />
                          </div>
                          <input value={editSocialTwitter} onChange={e => setEditSocialTwitter(e.target.value)} className={inputClass} placeholder="Twitter URL" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
                            <Linkedin className="w-4 h-4 text-blue-600" />
                          </div>
                          <input value={editSocialLinkedin} onChange={e => setEditSocialLinkedin(e.target.value)} className={inputClass} placeholder="LinkedIn URL" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                            <Github className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </div>
                          <input value={editSocialGithub} onChange={e => setEditSocialGithub(e.target.value)} className={inputClass} placeholder="GitHub URL" />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center shrink-0">
                            <LinkIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <input value={editSocialWebsite} onChange={e => setEditSocialWebsite(e.target.value)} className={inputClass} placeholder="Website URL" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[
                          { label: 'Twitter', url: socialLinks.twitter, icon: Twitter, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' },
                          { label: 'LinkedIn', url: socialLinks.linkedin, icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                          { label: 'GitHub', url: socialLinks.github, icon: Github, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800' },
                          { label: 'Website', url: socialLinks.website, icon: LinkIcon, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
                        ].map(social => (
                          <div key={social.label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                            <div className={`w-9 h-9 rounded-lg ${social.bg} flex items-center justify-center`}>
                              <social.icon className={`w-4 h-4 ${social.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{social.label}</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{social.url}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── EXPERIENCE TAB ── */}
            {activeTab === 'experience' && (
              <motion.div key="experience" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-violet-500" />
                        Work Experience
                        <span className="text-sm font-normal text-gray-400">({experience.length})</span>
                      </h2>
                      <button
                        onClick={() => setShowExpForm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl text-sm font-semibold hover:bg-violet-100 dark:hover:bg-violet-950/50 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    {/* Add Experience Form */}
                    <AnimatePresence>
                      {showExpForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="p-5 bg-violet-50/50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-800/30 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input value={expForm.title} onChange={e => setExpForm(p => ({ ...p, title: e.target.value }))} className={inputClass} placeholder="Job Title *" />
                              <input value={expForm.company} onChange={e => setExpForm(p => ({ ...p, company: e.target.value }))} className={inputClass} placeholder="Company *" />
                              <input value={expForm.period} onChange={e => setExpForm(p => ({ ...p, period: e.target.value }))} className={inputClass} placeholder="Duration (e.g. 2020 - Present)" />
                              <input value={expForm.location} onChange={e => setExpForm(p => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="Location" />
                            </div>
                            <textarea value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} className={inputClass + ' resize-none'} rows={3} placeholder="Description" />
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setShowExpForm(false); setExpForm({ title: '', company: '', period: '', location: '', description: '' }); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                Cancel
                              </button>
                              <button onClick={handleAddExperience} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors">
                                Add Experience
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Timeline */}
                    <div className="relative">
                      {experience.length > 0 && (
                        <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-slate-700" />
                      )}
                      <div className="space-y-6">
                        {experience.map((exp, idx) => (
                          <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08, duration: 0.35 }}
                            className="relative flex gap-4 pl-10"
                          >
                            <div className={`absolute left-0 top-1 w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm ${
                              idx === 0
                                ? 'bg-violet-100 dark:bg-violet-900/50'
                                : idx === 1
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50'
                                  : idx === 2
                                    ? 'bg-amber-100 dark:bg-amber-900/50'
                                    : 'bg-gray-100 dark:bg-gray-800'
                            }`}>
                              <Briefcase className={`w-4 h-4 ${
                                idx === 0
                                  ? 'text-violet-600 dark:text-violet-400'
                                  : idx === 1
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : idx === 2
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-gray-500 dark:text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 pb-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{exp.title}</p>
                                  <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">{exp.company}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {exp.period && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md font-medium">
                                      {exp.period}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRemoveExperience(exp.id)}
                                    className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    aria-label="Remove experience"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              {exp.location && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {exp.location}
                                </p>
                              )}
                              {exp.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {experience.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                          <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No experience added yet</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">Click "Add" to start building your timeline</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── EDUCATION TAB ── */}
            {activeTab === 'education' && (
              <motion.div key="education" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-emerald-500" />
                        Education
                        <span className="text-sm font-normal text-gray-400">({education.length})</span>
                      </h2>
                      <button
                        onClick={() => setShowEduForm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add
                      </button>
                    </div>

                    {/* Add Education Form */}
                    <AnimatePresence>
                      {showEduForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 overflow-hidden"
                        >
                          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input value={eduForm.degree} onChange={e => setEduForm(p => ({ ...p, degree: e.target.value }))} className={inputClass} placeholder="Degree / Course *" />
                              <input value={eduForm.institution} onChange={e => setEduForm(p => ({ ...p, institution: e.target.value }))} className={inputClass} placeholder="Institution *" />
                              <input value={eduForm.year} onChange={e => setEduForm(p => ({ ...p, year: e.target.value }))} className={inputClass} placeholder="Year (e.g. 2016)" />
                              <input value={eduForm.details} onChange={e => setEduForm(p => ({ ...p, details: e.target.value }))} className={inputClass} placeholder="Additional Details" />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setShowEduForm(false); setEduForm({ degree: '', institution: '', year: '', details: '' }); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                Cancel
                              </button>
                              <button onClick={handleAddEducation} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors">
                                Add Education
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Education Cards */}
                    <div className="space-y-4">
                      {education.map((edu, idx) => (
                        <motion.div
                          key={edu.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{edu.degree}</p>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{edu.institution}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {edu.year && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md font-medium">
                                    {edu.year}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleRemoveEducation(edu.id)}
                                  className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                  aria-label="Remove education"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {edu.details && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{edu.details}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {education.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl">
                          <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No education added yet</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">Click "Add" to add your education history</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── POSTS TAB ── */}
            {activeTab === 'posts' && (
              <motion.div key="posts" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                {/* Create Post */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                        {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newPostContent}
                          onChange={e => setNewPostContent(e.target.value.slice(0, 500))}
                          placeholder="Share something with the community..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none text-sm transition-all"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-xs ${newPostContent.length >= 450 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'} ${newPostContent.length >= 500 ? '!text-red-500' : ''}`}>
                            {newPostContent.length}/500
                          </span>
                          <button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() || submittingPost}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:cursor-not-allowed"
                          >
                            {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Posts List */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                      <FileText className="w-5 h-5 text-violet-500" />
                      Posts <span className="text-sm font-normal text-gray-400">({posts.length})</span>
                    </h2>
                    <div className="space-y-4">
                      {posts.map((post, idx) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:border-violet-200 dark:hover:border-violet-800 transition-colors"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{post.time}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Heart className="w-3.5 h-3.5" /> {post.likes}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── RESUME TAB ── */}
            {activeTab === 'resume' && (
              <motion.div key="resume" variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                  <div className="p-5 sm:p-6 md:p-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <File className="w-5 h-5 text-violet-500" /> Resume
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Upload your resume (PDF) to let others learn more about your professional background.
                    </p>

                    {/* Upload Zone */}
                    {!resumeFile && (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                          isDragOver
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                            : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/30 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/10'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleInputChange}
                        />
                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${
                          isDragOver
                            ? 'bg-violet-100 dark:bg-violet-900/40'
                            : 'bg-gray-100 dark:bg-slate-700'
                        }`}>
                          <Upload className={`w-8 h-8 transition-colors ${isDragOver ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-gray-500'}`} />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {isDragOver ? 'Drop your resume here' : 'Drag & drop your resume here'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                          or click to browse from your device
                        </p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          <File className="w-4 h-4" /> Browse Files
                        </button>
                        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1">
                            <File className="w-3 h-3" /> PDF only
                          </span>
                          <span className="flex items-center gap-1">
                            Max 10 MB
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Uploaded File Card */}
                    {resumeFile && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                            <File className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{resumeFile.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatFileSize(resumeFile.size)} &bull; PDF Document</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => toast.info('Download coming soon!')}
                              className="inline-flex items-center justify-center p-2.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-950/50 rounded-xl transition-colors"
                              aria-label="Download resume"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleRemoveResume}
                              className="inline-flex items-center justify-center p-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                              aria-label="Remove resume"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Resume uploaded and visible on your public profile
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                        >
                          Replace with a different file
                        </button>
                      </motion.div>
                    )}

                    {/* Resume Tips */}
                    <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Resume Tips</p>
                          <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                            <li>Use a clean, professional format</li>
                            <li>Include relevant clinical experience and certifications</li>
                            <li>Keep it to 1-2 pages for best results</li>
                            <li>Save as PDF to preserve formatting</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  </>
  );
}
