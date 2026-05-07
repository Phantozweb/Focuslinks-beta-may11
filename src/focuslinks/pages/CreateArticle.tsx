'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  PenSquare,
  Eye,
  User,
  Calendar,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useNavigate, Link } from '../../context/NavigationContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { encodeImage } from '../../lib/imageEncoder';
import SEO from '../components/SEO';
import { generateSlug, useProfiles } from '../../hooks/useProfiles';

/* ─── Interfaces ─── */
interface ArticleComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

interface Article {
  id: string;
  slug: string;
  authorId: string;
  authorName: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImage?: string;
  images: string[];
  likes: string[];
  comments: ArticleComment[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── Constants ─── */
const CATEGORIES = [
  'Technology',
  'Clinical',
  'Research',
  'Career',
  'Education',
  'Practice',
  'General',
] as const;

const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB

const categoryColors: Record<string, string> = {
  Technology: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
  Clinical: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
  Research: 'bg-violet-50 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50',
  Career: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
  Practice: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50',
  Education: 'bg-cyan-50 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/50',
  General: 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50',
};

/* ─── Main Component ─── */
export default function CreateArticle() {
  const navigate = useNavigate();
  const { listProfiles, fetchListProfiles } = useProfiles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── State ─── */
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [hasPublicProfile, setHasPublicProfile] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [tagsInput, setTagsInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ─── Derived state ─── */
  const tags = useMemo(() => {
    return tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [tagsInput]);

  const slug = useMemo(() => generateSlug(title), [title]);

  const previewExcerpt = useMemo(() => {
    if (excerpt.trim()) return excerpt.trim();
    if (content.trim()) return content.trim().slice(0, 150) + (content.trim().length > 150 ? '...' : '');
    return 'No excerpt yet...';
  }, [excerpt, content]);

  /* ─── Check auth & profile ─── */
  useEffect(() => {
    fetchListProfiles();

    try {
      const storedUser = localStorage.getItem('fl_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      }
    } catch {
      // ignore
    }

    setIsChecking(false);
  }, [fetchListProfiles]);

  useEffect(() => {
    if (currentUser && listProfiles.length > 0) {
      const found = listProfiles.some(
        (p) => p.membershipId === currentUser.membershipId && p.type !== 'membership_application'
      );
      setHasPublicProfile(found);
    }
  }, [currentUser, listProfiles]);

  /* ─── Handlers ─── */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 6MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, GIF, WebP).');
      return;
    }

    setCoverFile(file);
    toast.info('Processing image...');
    const encoded = await encodeImage(file);
    if (encoded) {
      setCoverImage(encoded.dataUri);
      toast.success('Image uploaded successfully!');
    } else {
      toast.error('Failed to process image. It may be too large or unsupported.');
      setCoverFile(null);
    }

    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverFile(null);
  };

  const removeTag = (tagToRemove: string) => {
    setTagsInput(
      tags
        .filter((t) => t !== tagToRemove)
        .join(', ')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    if (!content.trim()) {
      toast.error('Content is required.');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to create an article.');
      return;
    }

    if (!hasPublicProfile) {
      toast.error('You need a public profile to create articles.');
      return;
    }

    setIsSubmitting(true);

    const autoExcerpt = excerpt.trim() || content.trim().slice(0, 150);

    const article: Article = {
      id: `article_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      slug,
      authorId: currentUser.membershipId || currentUser.id || '',
      authorName: currentUser.name || currentUser.fullName || 'Anonymous',
      title: title.trim(),
      excerpt: autoExcerpt,
      content: content.trim(),
      category,
      tags,
      coverImage: coverImage || undefined,
      images: coverImage ? [coverImage] : [],
      likes: [],
      comments: [],
      status,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/articles?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Failed to create article (HTTP ${res.status})`);
      }

      toast.success(status === 'published' ? 'Article published successfully!' : 'Article saved as draft!');
      navigate('/articles');
    } catch (err: any) {
      console.error('Failed to create article:', err);
      toast.error(err.message || 'Failed to create article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Auth Gate ─── */
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-gray-400 animate-pulse">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center"
          >
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Login Required</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-6">
              You need to be logged in to create articles. Please sign in with your FocusLinks account.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              Go to Login
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── No public profile gate ─── */
  if (!isChecking && !hasPublicProfile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center"
          >
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <User className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Public Profile Required</h2>
            <p className="text-slate-600 dark:text-gray-400 mb-6">
              You need a public profile to publish articles. Please create your profile first.
            </p>
            <Link
              to="/create-profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              Create Profile
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─── Main Editor ─── */
  return (
    <>
    <SEO title="Create Article" description="Write and publish an article for the FocusLinks optometry community." keywords="write article, publish, blog post, optometry article" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/articles')}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <PenSquare className="w-5 h-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Create Article
                </h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                Write and share your insights with the FocusLinks community
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border ${
              status === 'published'
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
            }`}>
              {status === 'published' ? '● Will Publish' : '● Draft'}
            </span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ─── Left: Form ─── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex-1 min-w-0 space-y-6"
            >
              {/* Title */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <label htmlFor="title" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a compelling title for your article..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:border-blue-700 transition-all text-lg font-medium"
                  required
                />
                {slug && (
                  <p className="text-xs text-slate-400 dark:text-gray-500 mt-2 truncate">
                    Slug: <span className="font-mono text-slate-500 dark:text-gray-400">{slug}</span>
                  </p>
                )}
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <label htmlFor="category" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:border-blue-700 transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => setStatus('draft')}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        status === 'draft'
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-gray-400 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('published')}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        status === 'published'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-gray-400 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      Published
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <label htmlFor="tags" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Enter tags separated by commas (e.g. optometry, myopia, research)"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:border-blue-700 transition-all"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <AnimatePresence>
                      {tags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-lg border border-blue-200 dark:border-blue-800/50"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-0.5 p-0.5 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <label htmlFor="excerpt" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  <span className="flex items-center gap-2">
                    Excerpt
                    {excerpt.trim() === '' && content.trim().length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] font-bold rounded-md border border-violet-200 dark:border-violet-800/50">
                        <Sparkles className="w-3 h-3" />
                        Auto-generated
                      </span>
                    )}
                  </span>
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
                  placeholder="Write a brief summary... (leave empty to auto-generate from content)"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:border-blue-700 transition-all resize-none"
                />
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1.5 text-right">
                  {excerpt.length}/300 characters
                </p>
              </div>

              {/* Content */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <label htmlFor="content" className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Content <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-slate-400 dark:text-gray-500 ml-2">Markdown supported</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article content here... You can use Markdown formatting."
                  rows={14}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 dark:focus:border-blue-700 transition-all resize-y leading-relaxed font-mono text-sm"
                  style={{ minHeight: '400px' }}
                  required
                />
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1.5">
                  {content.trim().split(/\s+/).filter(Boolean).length} words · {Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200))} min read
                </p>
              </div>

              {/* Cover Image */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Cover Image
                </label>

                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
                        aria-label="Remove cover image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-lg">
                        <ImageIcon className="w-3 h-3" />
                        {coverFile ? `${(coverFile.size / 1024).toFixed(0)} KB` : 'Cover image'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group"
                  >
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1">
                      Click to upload cover image
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      JPEG, PNG, GIF, WebP · Max {MAX_FILE_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>

              {/* Author Info (read-only) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Author
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {(currentUser.name || currentUser.fullName || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {currentUser.name || currentUser.fullName || 'Anonymous'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-500">
                      {currentUser.membershipId || 'No membership ID'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-900/40 transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <PenSquare className="w-5 h-5" />
                      {status === 'published' ? 'Publish Article' : 'Save Draft'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/articles')}
                  className="px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-gray-300 font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>

            {/* ─── Right: Live Preview ─── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="hidden lg:block w-[420px] shrink-0"
            >
              <div className="sticky top-24">
                {/* Preview Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg">Live Preview</h2>
                </div>

                {/* Preview Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Cover image preview */}
                  {coverImage ? (
                    <div className="h-44 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={coverImage}
                        alt={title || 'Cover preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 dark:text-gray-500">No cover image</p>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Category badge */}
                    <span className={`tag-pill border ${categoryColors[category] || categoryColors.General} mb-3 inline-block`}>
                      {category}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {title || 'Untitled Article'}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {previewExcerpt}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 text-[10px] font-semibold rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        {tags.length > 4 && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 text-[10px] font-semibold rounded-md">
                            +{tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                      {/* Author & date row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-gray-500">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {currentUser?.name || currentUser?.fullName || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status indicator */}
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                        }`}>
                          {status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview tips */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-0.5">Preview Tip</p>
                      <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                        This is how your article will appear in the articles list. The cover image, title, and excerpt are the first things readers will see.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Mobile Live Preview (below form) ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="lg:hidden mt-10"
          >
            {/* Mobile preview header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Live Preview</h2>
            </div>

            {/* Mobile preview card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              {coverImage ? (
                <div className="h-40 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={coverImage}
                    alt={title || 'Cover preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-7 h-7 text-slate-300 dark:text-gray-600 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-400 dark:text-gray-500">No cover image</p>
                  </div>
                </div>
              )}

              <div className="p-5">
                <span className={`tag-pill border ${categoryColors[category] || categoryColors.General} mb-2 inline-block`}>
                  {category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {title || 'Untitled Article'}
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                  {previewExcerpt}
                </p>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-gray-500">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {currentUser?.name || currentUser?.fullName || 'Anonymous'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      status === 'published'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                    }`}>
                      {status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  </>
  );
}
