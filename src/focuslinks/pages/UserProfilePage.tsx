'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, MapPin, Calendar, Edit3, Heart, MessageSquare, Send,
  ArrowLeft, Loader2, Globe, Briefcase, Trash2, Clock, X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation } from '../../context/NavigationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SEO from '../components/SEO';
import { generateSlug, useProfiles } from '../../hooks/useProfiles';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ProfileData {
  id: string;
  name: string;
  email: string | null;
  membershipId: string;
  bio: string | null;
  avatar: string | null;
  location: string | null;
  title: string | null;
  role: string | null;
  skills: string | null;
  website: string | null;
  socialLinks: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { posts: number };
}

interface PostData {
  id: string;
  authorId: string;
  content: string;
  imageUrls: string | null;
  likes: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    membershipId: string;
    avatar: string | null;
    title: string | null;
    location: string | null;
  } | null;
}

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function parseSkills(skills: string | null): string[] {
  if (!skills) return [];
  return skills.split(',').map(s => s.trim()).filter(Boolean);
}

function parseSocialLinks(links: string | null): Record<string, string> {
  if (!links) return {};
  try {
    return JSON.parse(links);
  } catch {
    return {};
  }
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMemberSince(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function UserProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split('/').filter(Boolean);
  const urlId = segments[1] || '';

  // State
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get list profiles for slug-based lookup
  const { listProfiles, fetchListProfiles } = useProfiles();
  const [resolvedMembershipId, setResolvedMembershipId] = useState<string | null>(null);

  // Edit profile dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    title: '',
    location: '',
    role: '',
    skills: '',
    website: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // New post
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Current user check
  useEffect(() => {
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch list profiles for slug resolution
  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);

  // Resolve URL param to membershipId: try slug match first, then direct membershipId
  useEffect(() => {
    if (!urlId) return;

    // First, try to match by name slug from list_profiles
    const slugMatch = listProfiles.find(p => generateSlug(p.name) === urlId);
    if (slugMatch?.membershipId) {
      setResolvedMembershipId(slugMatch.membershipId);
      return;
    }

    // Fall back: treat urlId as a membershipId directly (backward compatibility)
    setResolvedMembershipId(urlId);
  }, [urlId, listProfiles]);

  // Determine ownership
  useEffect(() => {
    if (currentUser && resolvedMembershipId) {
      setIsOwner(currentUser.membershipId === resolvedMembershipId);
    }
  }, [currentUser, resolvedMembershipId]);

  // Fetch profile
  useEffect(() => {
    if (!resolvedMembershipId) return;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch('/api/profiles');
        if (res.ok) {
          const data = await res.json();
          const found = data.profiles.find((p: ProfileData) => p.membershipId === resolvedMembershipId);
          setProfile(found || null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [resolvedMembershipId]);

  // Fetch posts
  useEffect(() => {
    if (!resolvedMembershipId) return;
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await fetch(`/api/posts?authorId=${encodeURIComponent(resolvedMembershipId)}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [resolvedMembershipId]);

  // Populate edit form when profile loads
  useEffect(() => {
    if (profile && editOpen) {
      setEditForm({
        name: profile.name || '',
        bio: profile.bio || '',
        title: profile.title || '',
        location: profile.location || '',
        role: profile.role || '',
        skills: parseSkills(profile.skills).join(', '),
        website: profile.website || '',
      });
    }
  }, [profile, editOpen]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [urlId]);

  // Stats
  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
    return { totalPosts, totalLikes };
  }, [posts]);

  // Edit profile handler
  const handleSaveProfile = useCallback(async () => {
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: currentUser.membershipId,
          name: editForm.name,
          bio: editForm.bio,
          title: editForm.title,
          location: editForm.location,
          role: editForm.role,
          skills: editForm.skills,
          website: editForm.website,
          email: currentUser.email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setEditOpen(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }, [currentUser, editForm]);

  // Create post handler
  const handleCreatePost = useCallback(async () => {
    if (!newPostContent.trim() || !currentUser) return;
    setSubmittingPost(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.membershipId,
          content: newPostContent.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setNewPostContent('');
        toast.success('Post published!');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error('Failed to create post');
    } finally {
      setSubmittingPost(false);
    }
  }, [currentUser, newPostContent, posts]);

  // Like post handler
  const handleLike = useCallback(async (post: PostData) => {
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === post.id ? data.post : p));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }, []);

  // Delete post handler
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        toast.success('Post deleted');
      } else {
        toast.error('Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    }
  }, []);

  // Loading state
  if (loadingProfile) {
    return (
      <>
      <SEO title="User Profile" description="View user profile on FocusLinks." keywords="user profile, member profile" />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-400 dark:text-slate-500 animate-pulse">Loading profile...</p>
        </div>
      </div>
    </>
    );
  }

  // Not found state
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Profile Not Found</h1>
          <p className="text-slate-500 dark:text-gray-400 mb-6 text-center max-w-md">
            The profile you are looking for does not exist or has not been created yet.
          </p>
          <Button variant="outline" onClick={() => navigate('/feed')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const skills = parseSkills(profile.skills);
  const socialLinks = parseSocialLinks(profile.socialLinks);
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">

        {/* ══════════════════════════════════════════════════════════ */}
        {/* Cover Photo                                                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="relative -mt-24">
          <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
            </div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-violet-400/15 rounded-full blur-2xl" />

            {/* Back button */}
            <button
              onClick={() => navigate('/feed')}
              className="absolute top-4 left-4 inline-flex items-center text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-6 sm:left-8">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl object-cover"
                />
              ) : null}
              <div className={`${profile.avatar ? 'hidden' : ''} w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl border-4 border-white dark:border-slate-900`}>
                {initials}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* Profile Info Card                                           */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="pt-20 sm:pt-24">
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80">
            <CardContent className="p-5 sm:p-6 md:p-8">
              {/* Name row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                    {profile.name}
                  </h1>
                  {profile.title && (
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 text-sm sm:text-base">
                      {profile.title}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {profile.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> {profile.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> Member since {formatMemberSince(profile.createdAt)}
                    </span>
                    {profile.role && (
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" /> {profile.role}
                      </span>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                        <Edit3 className="w-4 h-4" /> Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information below.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                          <Input
                            value={editForm.name}
                            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Your name"
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                          <Input
                            value={editForm.title}
                            onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. Pediatric Optometrist"
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                          <Input
                            value={editForm.location}
                            onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g. San Francisco, CA"
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                          <Input
                            value={editForm.role}
                            onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="e.g. Optometrist"
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                          <Textarea
                            value={editForm.bio}
                            onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 resize-none"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Skills (comma separated)</label>
                          <Input
                            value={editForm.skills}
                            onChange={e => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                            placeholder="e.g. Myopia Management, Contact Lenses"
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
                          <Input
                            value={editForm.website}
                            onChange={e => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://..."
                            className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={savingProfile || !editForm.name.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Posts</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalPosts}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700/50 hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Likes</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalLikes}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Joined</span>
                  </div>
                  <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {new Date(profile.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* Bio & Skills Sidebar + Posts                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <motion.section variants={itemVariants} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column: Bio & Skills */}
            <div className="space-y-6">
              {/* Bio */}
              {(profile.bio || profile.website || Object.keys(socialLinks).length > 0) && (
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {profile.bio && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">About</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{profile.bio}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Skills & Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(skill => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 hover:scale-105 transition-transform cursor-default"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Website */}
                    {profile.website && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Website</h3>
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <Globe className="w-4 h-4" /> Visit Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Social Links */}
                    {Object.keys(socialLinks).length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Social Links</h3>
                        <div className="space-y-2">
                          {Object.entries(socialLinks).map(([platform, url]) => (
                            <a
                              key={platform}
                              href={String(url).startsWith('http') ? String(url) : `https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="capitalize">{platform}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Share Profile Card */}
              <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80">
                <CardContent className="p-5">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      const slug = profile?.name ? generateSlug(profile.name) : urlId;
                      const url = `${window.location.origin}/user/${slug}`;
                      navigator.clipboard.writeText(url).then(() => {
                        toast.success('Profile link copied!');
                      }).catch(() => {
                        toast.success('Profile link copied!');
                      });
                    }}
                  >
                    <ExternalLink className="w-4 h-4" /> Share Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Posts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post (owner only) */}
              {isOwner && (
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={newPostContent}
                          onChange={e => setNewPostContent(e.target.value.slice(0, 500))}
                          placeholder="Share something with the community..."
                          rows={3}
                          className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 resize-none placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white"
                        />
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-xs ${newPostContent.length >= 450 ? 'text-amber-500' : 'text-slate-400 dark:text-gray-500'} ${newPostContent.length >= 500 ? 'text-rose-500' : ''}`}>
                            {newPostContent.length}/500
                          </span>
                          <Button
                            onClick={handleCreatePost}
                            disabled={!newPostContent.trim() || submittingPost}
                            size="sm"
                            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          >
                            {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts List Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Posts
                  <span className="text-sm font-normal text-gray-400">({posts.length})</span>
                </h2>
              </div>

              {/* Posts List */}
              {loadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Posts Yet</h3>
                    <p className="text-slate-500 dark:text-gray-400 text-sm">
                      {isOwner ? 'Share something with the community!' : 'This user hasn\'t posted anything yet.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {posts.map((post, idx) => (
                      <motion.div
                        key={post.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:shadow-md transition-shadow group">
                          <CardContent className="p-4 sm:p-6">
                            {/* Post Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                                {post.author?.name ? post.author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                                    {post.author?.name || 'Unknown User'}
                                  </span>
                                  {post.author?.title && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">· {post.author.title}</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {formatDate(post.createdAt)}
                                </span>
                              </div>
                              {/* Delete button (owner only) */}
                              {isOwner && (
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="ml-auto p-1.5 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  aria-label="Delete post"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {/* Post Content */}
                            <p className="text-slate-800 dark:text-gray-200 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                              {post.content}
                            </p>

                            {/* Post Images */}
                            {post.imageUrls && (
                              <div className="mt-3">
                                {(() => {
                                  try {
                                    const urls: string[] = JSON.parse(post.imageUrls);
                                    if (urls.length > 0) {
                                      return (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                          {urls.map((url, i) => (
                                            <img
                                              key={i}
                                              src={url}
                                              alt={`Post image ${i + 1}`}
                                              className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg object-cover shrink-0"
                                            />
                                          ))}
                                        </div>
                                      );
                                    }
                                  } catch {
                                    // ignore parse error
                                  }
                                  return null;
                                })()}
                              </div>
                            )}

                            {/* Post Actions */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                              <button
                                onClick={() => handleLike(post)}
                                className="flex items-center gap-1.5 text-sm font-medium transition-colors px-2 py-1 rounded-lg text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                              >
                                <Heart className="w-4 h-4" />
                                {post.likes > 0 && <span>{post.likes}</span>}
                              </button>
                              <button
                                className="flex items-center gap-1.5 text-sm font-medium transition-colors px-2 py-1 rounded-lg text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <MessageSquare className="w-4 h-4" />
                                {post.commentCount > 0 && <span>{post.commentCount}</span>}
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.section>

      </div>
    </motion.div>
  );
}
