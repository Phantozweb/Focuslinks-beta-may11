'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Heart, Share2, Send, Hash, User, Users, Clock,
  AlertCircle, Loader2, Bookmark, BookmarkCheck, TrendingUp,
  SmilePlus, ChevronDown, BarChart3, Filter, Sparkles, ImageIcon, X
} from 'lucide-react';
import { encodeImage, formatBytes } from '../../lib/imageEncoder';
import { toast } from 'sonner';
import { Link, useNavigate, useLocation, useParams } from '../../context/NavigationContext';
import { useProfiles, generateSlug } from '../../hooks/useProfiles';
import { fetchGitHubJson, updateGitHubFile } from '../../services/githubService';
import { getFeedUserIds } from '../../services/connectionsService';
import { createNotification } from '../../hooks/useNotifications';
import SEO from '../components/SEO';

interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
}

interface PollOption {
  label: string;
  votes: string[];
}

interface ImagePreview {
  dataUri: string;
  size: number;
  fileName: string;
}

interface Post {
  id: string;
  authorId: string;
  content: string;
  hashtags: string[];
  timestamp: string;
  likes: string[];
  comments: Comment[];
  poll?: PollOption[];
  images?: string[];
}

const EMOJI_LIST = ['👍', '👏', '🎉', '🔥', '💡', '👀', '❤️', '✅'];

const POSTS_PER_PAGE = 5;

type FilterTab = 'all' | 'connections' | 'trending' | 'mine' | 'bookmarked';
type SortOption = 'newest' | 'most_liked' | 'most_commented';

function getBookmarkedIds(): string[] {
  try {
    const stored = localStorage.getItem('fl_bookmarked_posts');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveBookmarkedIds(ids: string[]) {
  localStorage.setItem('fl_bookmarked_posts', JSON.stringify(ids));
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPollMode, setIsPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [sortOpen, setSortOpen] = useState(false);
  const [postImages, setPostImages] = useState<ImagePreview[]>([]);
  const [encodingImages, setEncodingImages] = useState(false);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const emojiRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { listProfiles, fetchListProfiles } = useProfiles();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchListProfiles();
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setBookmarkedIds(getBookmarkedIds());
    fetchPosts();
  }, [fetchListProfiles]);

  // Fetch connected user IDs for feed filtering
  useEffect(() => {
    if (!currentUser?.membershipId) return;
    getFeedUserIds(currentUser.membershipId).then(ids => {
      setConnectedUserIds(ids);
    }).catch(() => {
      setConnectedUserIds([]);
    });
  }, [currentUser?.membershipId]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/github/fetch?path=Posts');
      if (!response.ok) {
        if (response.status === 404) {
          setPosts([]);
          return;
        }
        throw new Error('Failed to fetch posts directory');
      }

      const dirData = await response.json();
      const fetchedPosts: Post[] = [];

      if (Array.isArray(dirData)) {
        for (const file of dirData) {
          if (file.name && file.name.endsWith('.json')) {
            const postData = await fetchGitHubJson<Post>(`Posts/${file.name}`);
            if (postData && postData.id) {
              fetchedPosts.push({
                ...postData,
                likes: postData.likes || [],
                comments: postData.comments || [],
                poll: postData.poll || undefined,
                images: postData.images || undefined,
              });
            }
          }
        }
      }

      fetchedPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPublicProfile = useMemo(() => {
    if (!currentUser) return false;
    return listProfiles.some(p => p.membershipId === currentUser.membershipId && p.type !== 'membership_application');
  }, [currentUser, listProfiles]);

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter
    if (activeFilter === 'connections') {
      result = result.filter(p => connectedUserIds.includes(p.authorId));
    } else if (activeFilter === 'trending') {
      result = result.filter(p => p.likes.length >= 5);
    } else if (activeFilter === 'mine') {
      result = result.filter(p => currentUser && p.authorId === currentUser.membershipId);
    } else if (activeFilter === 'bookmarked') {
      result = result.filter(p => bookmarkedIds.includes(p.id));
    }

    // Sort
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortOption === 'most_liked') {
      result.sort((a, b) => b.likes.length - a.likes.length);
    } else if (sortOption === 'most_commented') {
      result.sort((a, b) => b.comments.length - a.comments.length);
    }

    return result;
  }, [posts, activeFilter, sortOption, currentUser, bookmarkedIds, connectedUserIds]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const tag = currentTag.trim().replace(/^#/, '');
      if (tag && hashtags.length < 5 && !hashtags.includes(tag)) {
        setHashtags([...hashtags, tag]);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const addEmoji = (emoji: string) => {
    setNewPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setEncodingImages(true);
    try {
      for (const file of Array.from(files)) {
        if (postImages.length >= 4) {
          toast.warning('Maximum 4 images per post');
          break;
        }
        const encoded = await encodeImage(file);
        if (encoded) {
          setPostImages(prev => [...prev, {
            dataUri: encoded.dataUri,
            size: encoded.size,
            fileName: file.name,
          }]);
        } else {
          toast.error(`Failed to encode "${file.name}". File may be too large or unsupported.`);
        }
      }
    } catch (error) {
      console.error('Error encoding images:', error);
      toast.error('Failed to process images');
    } finally {
      setEncodingImages(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const removePostImage = (index: number) => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser || !hasPublicProfile) return;

    setSubmitting(true);
    try {
      const postId = Date.now().toString();
      const newPost: Post = {
        id: postId,
        authorId: currentUser.membershipId,
        content: newPostContent.trim(),
        hashtags,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: [],
      };

      // Add poll if enabled and has valid options
      if (isPollMode) {
        const validOptions = pollOptions.filter(o => o.trim());
        if (validOptions.length >= 2) {
          newPost.poll = validOptions.map(label => ({ label, votes: [] }));
        }
      }

      // Add images if any
      if (postImages.length > 0) {
        newPost.images = postImages.map(img => img.dataUri);
      }

      const filename = `Posts/${postId}_${currentUser.membershipId}.json`;
      const success = await updateGitHubFile(filename, newPost, `Create new post by ${currentUser.membershipId}`);

      if (success) {
        setPosts([newPost, ...posts]);
        setNewPostContent('');
        setHashtags([]);
        setIsPollMode(false);
        setPollOptions(['', '']);
        setPostImages([]);
        toast.success('Post published!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateUserCredits = async (membershipId: string, creditsToAdd: number) => {
    try {
      const userData = await fetchGitHubJson<any>(`Profile/Users/${membershipId}_userdata.json`);
      if (userData) {
        userData.flCredits = (userData.flCredits || 0) + creditsToAdd;
        await updateGitHubFile(`Profile/Users/${membershipId}_userdata.json`, userData, `Update FL credits for ${membershipId}`);
      }
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  const handleLike = async (post: Post) => {
    if (!currentUser) return;

    const hasLiked = post.likes.includes(currentUser.membershipId);
    let newLikes = [...post.likes];

    if (hasLiked) {
      newLikes = newLikes.filter(id => id !== currentUser.membershipId);
    } else {
      newLikes.push(currentUser.membershipId);
    }

    // Optimistic update
    setPosts(posts.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));

    try {
      const updatedPost = { ...post, likes: newLikes };
      const filename = `Posts/${post.id}_${post.authorId}.json`;
      await updateGitHubFile(filename, updatedPost, `${hasLiked ? 'Unlike' : 'Like'} post ${post.id} by ${currentUser.membershipId}`);

      if (!hasLiked) {
        // Notify post author (fire-and-forget, don't block UI)
        if (post.authorId !== currentUser.membershipId) {
          createNotification({
            userId: post.authorId,
            type: 'post_like',
            fromUserId: currentUser.membershipId,
            message: `${currentUser.name || 'Someone'} liked your post`,
            link: '/feed',
            postId: post.id,
          }).catch(() => {});

          if (newLikes.length % 10 === 0) {
            await updateUserCredits(post.authorId, 1);
          }
        }

        const userProfile = await fetchGitHubJson<any>(`Profile/Users/${currentUser.membershipId}_userdata.json`);
        if (userProfile) {
          const totalLikesGiven = (userProfile.totalLikesGiven || 0) + 1;
          userProfile.totalLikesGiven = totalLikesGiven;
          if (totalLikesGiven % 20 === 0) {
            userProfile.flCredits = (userProfile.flCredits || 0) + 1;
          }
          await updateGitHubFile(`Profile/Users/${currentUser.membershipId}_userdata.json`, userProfile, `Update likes tracking for ${currentUser.membershipId}`);
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setPosts(posts.map(p => p.id === post.id ? post : p));
    }
  };

  const handleComment = async (post: Post) => {
    if (!commentContent.trim() || !currentUser) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      authorId: currentUser.membershipId,
      content: commentContent.trim(),
      timestamp: new Date().toISOString(),
    };

    const newComments = [...post.comments, newComment];

    setPosts(posts.map(p => p.id === post.id ? { ...p, comments: newComments } : p));
    setCommentContent('');
    setCommentingOn(null);

    try {
      const updatedPost = { ...post, comments: newComments };
      const filename = `Posts/${post.id}_${post.authorId}.json`;
      await updateGitHubFile(filename, updatedPost, `Comment on post ${post.id} by ${currentUser.membershipId}`);

      // Notify post author about comment (fire-and-forget)
      if (post.authorId !== currentUser.membershipId) {
        createNotification({
          userId: post.authorId,
          type: 'post_comment',
          fromUserId: currentUser.membershipId,
          message: `${currentUser.name || 'Someone'} commented on your post: "${commentContent.trim().slice(0, 60)}${commentContent.trim().length > 60 ? '...' : ''}"`,
          link: '/feed',
          postId: post.id,
        }).catch(() => {});
      }

      if (newComments.length % 5 === 0 && post.authorId !== currentUser.membershipId) {
        await updateUserCredits(post.authorId, 2);
      }
    } catch (error) {
      console.error('Error commenting:', error);
      setPosts(posts.map(p => p.id === post.id ? post : p));
    }
  };

  const toggleBookmark = (postId: string) => {
    const newIds = bookmarkedIds.includes(postId)
      ? bookmarkedIds.filter(id => id !== postId)
      : [...bookmarkedIds, postId];
    setBookmarkedIds(newIds);
    saveBookmarkedIds(newIds);

    if (!bookmarkedIds.includes(postId)) {
      toast.success('Post bookmarked');
    }
  };

  const handleShare = (post: Post) => {
    const url = `${window.location.origin}${window.location.pathname}#/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const handleVotePoll = async (post: Post, optionIndex: number) => {
    if (!currentUser) return;

    const poll = post.poll;
    if (!poll) return;

    // Check if already voted
    const hasVoted = poll.some(opt => opt.votes.includes(currentUser.membershipId));
    if (hasVoted) return;

    const newPoll = poll.map((opt, i) => {
      if (i === optionIndex) {
        return { ...opt, votes: [...opt.votes, currentUser.membershipId] };
      }
      return opt;
    });

    const updatedPost = { ...post, poll: newPoll };
    setPosts(posts.map(p => p.id === post.id ? updatedPost : p));

    try {
      const filename = `Posts/${post.id}_${post.authorId}.json`;
      await updateGitHubFile(filename, updatedPost, `Vote on poll in post ${post.id} by ${currentUser.membershipId}`);
    } catch (error) {
      console.error('Error voting on poll:', error);
      setPosts(posts.map(p => p.id === post.id ? post : p));
    }
  };

  const getAuthorProfile = (membershipId: string) => {
    return listProfiles.find(p => p.membershipId === membershipId);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filterTabs: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Posts', icon: <MessageSquare className="w-4 h-4" /> },
    ...(currentUser && connectedUserIds.length > 0
      ? [{ key: 'connections' as FilterTab, label: 'For You', icon: <Users className="w-4 h-4" /> }]
      : []),
    { key: 'trending', label: 'Trending', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'mine', label: 'My Posts', icon: <User className="w-4 h-4" /> },
    { key: 'bookmarked', label: 'Bookmarked', icon: <Bookmark className="w-4 h-4" /> },
  ];

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest',
    most_liked: 'Most Liked',
    most_commented: 'Most Commented',
  };

  return (
    <>
      <SEO title="Community Feed" description="Stay updated with the latest posts, discussions, and clinical case sharing from the global optometry community." keywords="optometry feed, community posts, clinical cases" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Community Feed</h1>
          <p className="text-slate-600 dark:text-gray-400 mt-2">Share updates, ask questions, and connect with other professionals.</p>
        </motion.div>

        {/* Create Post Section */}
        {currentUser ? (
          hasPublicProfile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 p-4 sm:p-6 mb-8"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                  {(currentUser.name || currentUser.fullName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value.slice(0, 500))}
                    placeholder="What's on your mind?"
                    className="w-full bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[100px] placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white"
                  />

                  {/* Typing indicator dots */}
                  {!newPostContent && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 text-slate-300 dark:text-slate-600">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  )}

                  {/* Encoding spinner */}
                  {encodingImages && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing image{postImages.length > 0 ? 's' : ''}...</span>
                    </div>
                  )}

                  {/* Image Previews */}
                  <AnimatePresence>
                    {postImages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mt-3 ${postImages.length === 1 ? '' : 'grid grid-cols-2 gap-2'}`}
                      >
                        {postImages.map((img, i) => (
                          <div key={i} className="relative group/img rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img
                              src={img.dataUri}
                              alt={img.fileName}
                              className={`w-full ${postImages.length === 1 ? 'max-h-60' : 'h-28'} object-cover`}
                            />
                            <button
                              onClick={() => removePostImage(i)}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/80"
                              aria-label="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white truncate max-w-[70%]">{img.fileName}</span>
                                <span className={`text-[10px] font-medium ${img.size > 2 * 1024 * 1024 ? 'text-amber-300' : 'text-white/70'}`}>
                                  {formatBytes(img.size)}
                                  {img.size > 2 * 1024 * 1024 && ' ⚠️'}
                                </span>
                              </div>
                              {img.size > 2 * 1024 * 1024 && (
                                <p className="text-[10px] text-amber-300">Large file may slow upload</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Poll Options */}
                  {isPollMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2"
                    >
                      <div className="text-xs font-medium text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Poll Options ({pollOptions.length}/4)
                      </div>
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 dark:text-gray-500 w-4">{index + 1}.</span>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white"
                          />
                          {pollOptions.length > 2 && (
                            <button
                              onClick={() => removePollOption(index)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              aria-label="Remove option"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 4 && (
                        <button
                          onClick={addPollOption}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          + Add option
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Hashtags */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {hashtags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="ml-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200">
                          &times;
                        </button>
                      </span>
                    ))}
                    {hashtags.length < 5 && (
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">
                        <Hash className="w-3 h-3 text-slate-400 dark:text-gray-500 mr-1" />
                        <input
                          type="text"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyDown={handleAddTag}
                          placeholder="Add tag (Enter)"
                          className="bg-transparent border-none p-0 text-xs focus:ring-0 w-28 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {/* Emoji Picker */}
                      <div className="relative" ref={emojiRef}>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors text-sm"
                        >
                          <SmilePlus className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: 4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 4 }}
                              transition={{ duration: 0.15 }}
                              className="absolute bottom-full left-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 z-20"
                            >
                              <div className="grid grid-cols-4 gap-1">
                                {EMOJI_LIST.map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => addEmoji(emoji)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-lg transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Poll Toggle */}
                      <label className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPollMode}
                          onChange={(e) => {
                            setIsPollMode(e.target.checked);
                            if (!e.target.checked) setPollOptions(['', '']);
                          }}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-800"
                        />
                        <BarChart3 className="w-4 h-4" />
                        Poll
                      </label>

                      {/* Image Upload */}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={postImages.length >= 4 || encodingImages}
                        className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        title={postImages.length >= 4 ? 'Maximum 4 images' : 'Add images'}
                      >
                        {encodingImages ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </button>

                      <div className="text-xs text-slate-400 dark:text-gray-500">
                        {hashtags.length}/5 tags
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${newPostContent.length >= 450 ? 'text-amber-500' : 'text-slate-400 dark:text-gray-500'} ${newPostContent.length >= 500 ? 'text-rose-500' : ''}`}>
                        {newPostContent.length}/500
                      </span>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || submitting}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 p-6 mb-8 text-center">
              <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Create a Profile to Post</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">You need a public directory profile to share posts with the community.</p>
              <Link to="/dashboard" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                Go to Dashboard
              </Link>
            </div>
          )
        ) : (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Join the Conversation</h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">Log in to post, like, and comment on the feed.</p>
            <Link to="/login" className="inline-block px-6 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-semibold text-sm hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
              Log In
            </Link>
          </div>
        )}

        {/* Filter Tabs & Sort */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          {/* Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveFilter(tab.key); setVisibleCount(POSTS_PER_PAGE); }}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeFilter === tab.key
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeFilter === tab.key && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-gray-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {sortLabels[sortOption]}
              <ChevronDown className={`w-4 h-4 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden"
                >
                  {(Object.keys(sortLabels) as SortOption[]).map(option => (
                    <button
                      key={option}
                      onClick={() => { setSortOption(option); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortOption === option
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
                          : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {sortLabels[option]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Feed Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700"
              />
              <div className="absolute inset-3 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                {activeFilter === 'bookmarked' ? (
                  <Bookmark className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                ) : activeFilter === 'trending' ? (
                  <TrendingUp className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                ) : activeFilter === 'connections' ? (
                  <Users className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                ) : (
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-gray-600" />
                )}
              </div>
            </div>
            {activeFilter === 'connections' && connectedUserIds.length === 0 ? (
              <>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Connect with professionals to see their posts here</h3>
                <p className="text-slate-500 dark:text-gray-400 mb-4">Find and connect with other optometry professionals to personalize your feed.</p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/directory" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
                    Browse Directory
                  </Link>
                  <Link to="/connections" className="inline-flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    Manage Connections
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {activeFilter === 'bookmarked' ? 'No bookmarked posts' : activeFilter === 'trending' ? 'No trending posts yet' : activeFilter === 'mine' ? 'You haven\'t posted yet' : activeFilter === 'connections' ? 'No posts from your connections yet' : 'No posts yet'}
                </h3>
                <p className="text-slate-500 dark:text-gray-400">
                  {activeFilter === 'bookmarked' ? 'Bookmark posts to find them here later.' : activeFilter === 'trending' ? 'Posts with 5+ likes appear here.' : activeFilter === 'mine' ? 'Share something with the community!' : activeFilter === 'connections' ? 'Posts from people you follow or are connected with will appear here.' : 'Be the first to share something with the community!'}
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {visiblePosts.map(post => {
                const author = getAuthorProfile(post.authorId);
                const hasLiked = currentUser && post.likes.includes(currentUser.membershipId);
                const isBookmarked = bookmarkedIds.includes(post.id);
                const isTrending = post.likes.length >= 5;
                const totalPollVotes = post.poll?.reduce((sum, opt) => sum + opt.votes.length, 0) || 0;

                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`relative group bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      isBookmarked
                        ? 'border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Gradient border on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:via-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-300 pointer-events-none" />

                    <div className="relative p-4 sm:p-6">
                      {/* Trending Badge */}
                      {isTrending && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute top-4 right-4"
                        >
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                            🔥 Trending
                          </span>
                        </motion.div>
                      )}

                      {/* Post Header */}
                      <div className="flex items-center gap-3 mb-4">
                        {author?.image ? (
                          <img src={author.image} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold">
                            {(author?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {author ? (
                              <Link to={`/profile/${generateSlug(author.name)}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                                {author.name}
                              </Link>
                            ) : (
                              <span className="font-bold text-slate-900 dark:text-white">Unknown User</span>
                            )}
                            <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(post.timestamp)}
                            </span>
                          </div>
                          {author?.title && <p className="text-xs text-slate-500 dark:text-gray-400">{author.title}</p>}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="text-slate-800 dark:text-gray-200 whitespace-pre-wrap mb-4">
                        {post.content}
                      </div>

                      {/* Post Images */}
                      {post.images && post.images.length > 0 && (
                        <div className={`mb-4 ${post.images.length === 1 ? '' : post.images.length === 2 ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-2 gap-2'}`}>
                          {post.images.slice(0, 4).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Post image ${i + 1}`}
                              className={`rounded-xl object-cover w-full ${post.images!.length === 1 ? 'max-h-80' : 'max-h-60'}`}
                            />
                          ))}
                          {post.images.length > 4 && (
                            <div className="relative rounded-xl overflow-hidden max-h-60">
                              <img
                                src={post.images[3]}
                                alt="Post image 4"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-xl font-bold">+{post.images.length - 4}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Poll */}
                      {post.poll && post.poll.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {post.poll.map((option, optIndex) => {
                            const voteCount = option.votes.length;
                            const percentage = totalPollVotes > 0 ? Math.round((voteCount / totalPollVotes) * 100) : 0;
                            const hasVoted = currentUser && option.votes.includes(currentUser.membershipId);
                            const anyVoted = currentUser && post.poll!.some(o => o.votes.includes(currentUser.membershipId));

                            return (
                              <button
                                key={optIndex}
                                onClick={() => !anyVoted && handleVotePoll(post, optIndex)}
                                disabled={!!anyVoted}
                                className={`w-full relative rounded-xl border overflow-hidden text-left transition-all ${
                                  anyVoted
                                    ? 'cursor-default border-slate-200 dark:border-slate-700'
                                    : 'cursor-pointer border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                                } ${hasVoted ? 'border-blue-400 dark:border-blue-500' : ''}`}
                              >
                                {/* Progress bar */}
                                {anyVoted && (
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className={`absolute inset-y-0 left-0 ${hasVoted ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-700/50'}`}
                                  />
                                )}
                                <div className="relative flex items-center justify-between px-4 py-2.5">
                                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{option.label}</span>
                                  {anyVoted && (
                                    <span className={`text-xs font-semibold ${hasVoted ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-gray-400'}`}>
                                      {percentage}%
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                          <p className="text-xs text-slate-400 dark:text-gray-500">{totalPollVotes} vote{totalPollVotes !== 1 ? 's' : ''}</p>
                        </div>
                      )}

                      {/* Hashtags */}
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.hashtags.map(tag => (
                            <span key={tag} className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 sm:gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <button
                          onClick={() => handleLike(post)}
                          className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2 py-1 rounded-lg ${
                            hasLiked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                          }`}
                        >
                          <motion.div
                            whileTap={{ scale: 1.3 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                          >
                            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                          </motion.div>
                          {post.likes.length > 0 && <span>{post.likes.length}</span>}
                        </button>
                        <button
                          onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors px-2 py-1 rounded-lg"
                        >
                          <MessageSquare className="w-5 h-5" />
                          {post.comments.length > 0 && <span>{post.comments.length}</span>}
                        </button>
                        <button
                          onClick={() => toggleBookmark(post.id)}
                          className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2 py-1 rounded-lg ${
                            isBookmarked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                        >
                          <motion.div
                            whileTap={{ scale: 1.3 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                          >
                            {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                          </motion.div>
                          <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
                        </button>
                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors px-2 py-1 rounded-lg ml-auto"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {commentingOn === post.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700/50"
                        >
                          <div className="p-4 sm:p-6">
                            {/* Existing Comments */}
                            {post.comments.length > 0 && (
                              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {post.comments.map(comment => {
                                  const commentAuthor = getAuthorProfile(comment.authorId);
                                  return (
                                    <div key={comment.id} className="flex gap-3">
                                      {commentAuthor?.image ? (
                                        <img src={commentAuthor.image} alt={commentAuthor.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-gray-400 font-bold text-xs shrink-0">
                                          {(commentAuthor?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-baseline justify-between mb-1">
                                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{commentAuthor?.name || 'Unknown User'}</span>
                                          <span className="text-[10px] text-slate-400 dark:text-gray-500">{formatDate(comment.timestamp)}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-gray-300">{comment.content}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Add Comment */}
                            {currentUser ? (
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                  {(currentUser.name || currentUser.fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                                  <input
                                    type="text"
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleComment(post);
                                    }}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                                  />
                                  <button
                                    onClick={() => handleComment(post)}
                                    disabled={!commentContent.trim()}
                                    className="ml-2 text-blue-600 dark:text-blue-400 disabled:opacity-50 hover:text-blue-800 dark:hover:text-blue-300"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-gray-400 text-center">Log in to comment</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-4"
              >
                <button
                  onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                >
                  <Loader2 className="w-4 h-4" />
                  Load More ({filteredPosts.length - visibleCount} remaining)
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  </>
  );
}
