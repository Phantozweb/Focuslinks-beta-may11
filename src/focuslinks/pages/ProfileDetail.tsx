'use client';
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from '../../context/NavigationContext';
import { MapPin, BadgeCheck, ArrowLeft, Mail, Globe, Briefcase, GraduationCap, Award, Calendar, Linkedin, Flag, Mic, Video, Users, UserPlus, Check, X, UserCheck, MessageCircle, Clock, Link2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useProfiles, generateSlug } from '../../hooks/useProfiles';
import { getConnectionStatus, sendConnectionRequest, acceptConnection, rejectConnection, followUser, unfollowUser, cancelConnection, removeConnection, isFollowing as checkIsFollowing, fetchFollowing, fetchConnections, getMutualConnections, getFollowingCount } from '../../services/connectionsService';
import type { ConnectionStatus } from '../../services/connectionsService';
import { toast } from 'sonner';
import SEO from '../components/SEO';

export default function ProfileDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { listProfiles, loadingList: loading, fetchListProfiles } = useProfiles();
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('about');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('none');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ membershipId: string; name: string } | null>(null);
  const disconnectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('fl_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Close disconnect menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (disconnectRef.current && !disconnectRef.current.contains(e.target as Node)) {
        setShowDisconnectMenu(false);
      }
    };
    if (showDisconnectMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    <SEO title="Profile" description="View this optometry professional profile on FocusLinks." keywords="profile, optometrist, professional profile" />
    }
  }, [showDisconnectMenu]);

  useEffect(() => {
    fetchListProfiles();
  }, [fetchListProfiles]);
  
  const profile = listProfiles.find(p => generateSlug(p.name) === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (profile?.membershipId) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Profile/Users/${profile.membershipId}_userdata.json`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };
      
      const fetchUserPosts = async () => {
        try {
          const response = await fetch('/api/github/fetch?path=Posts');
          if (response.ok) {
            const dirData = await response.json();
            if (Array.isArray(dirData)) {
              const posts: any[] = [];
              for (const file of dirData) {
                if (file.name && file.name.endsWith(`_${profile.membershipId}.json`)) {
                  const postRes = await fetch(`https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Posts/${file.name}`);
                  if (postRes.ok) {
                    const postData = await postRes.json();
                    posts.push(postData);
                  }
                }
              }
              posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              setUserPosts(posts);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user posts:", error);
        }
      };

      fetchUserData();
      fetchUserPosts();
    }
  }, [profile?.membershipId]);

  // Fetch connection and follow status
  useEffect(() => {
    if (!profile?.membershipId || !currentUser?.membershipId) return;

    const fetchConnectionData = async () => {
      if (currentUser.membershipId === profile.membershipId) {
        setConnectionStatus('connected');
        try {
          const [ownConns, ownFollowing] = await Promise.all([
            fetchConnections(currentUser.membershipId),
            fetchFollowing(currentUser.membershipId),
          ]);
          if (ownConns) setConnectionCount(getMutualConnections(ownConns).length);
          setFollowingCount(getFollowingCount(ownFollowing));
        } catch { /* ignore */ }
        return;
      }

      const [status, following] = await Promise.all([
        getConnectionStatus(currentUser.membershipId, profile.membershipId),
        checkIsFollowing(currentUser.membershipId, profile.membershipId),
      ]);

      setConnectionStatus(status);
      setIsFollowing(following);

      try {
        const [targetConnections, targetFollowing] = await Promise.all([
          fetchConnections(profile.membershipId),
          fetchFollowing(profile.membershipId),
        ]);
        if (targetConnections) {
          setConnectionCount(getMutualConnections(targetConnections).length);
        }
        setFollowingCount(getFollowingCount(targetFollowing));
      } catch { /* ignore */ }
    };

    fetchConnectionData();
  }, [profile?.membershipId, currentUser?.membershipId]);

  const handleConnect = async () => {
    if (!currentUser || !profile?.membershipId || loadingAction) return;
    setLoadingAction(true);
    try {
      const ok = await sendConnectionRequest(currentUser.membershipId, profile.membershipId, currentUser.name);
      if (ok) {
        setConnectionStatus('pending_sent');
        toast.success('Connection request sent!');
      } else {
        toast.error('Could not send request. You may already have a pending request.');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAccept = async () => {
    if (!currentUser || !profile?.membershipId || loadingAction) return;
    setLoadingAction(true);
    try {
      const ok = await acceptConnection(currentUser.membershipId, profile.membershipId, currentUser.name);
      if (ok) {
        setConnectionStatus('connected');
        toast.success('You are now connected!');
      } else {
        toast.error('Failed to accept request');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async () => {
    if (!currentUser || !profile?.membershipId || loadingAction) return;
    setLoadingAction(true);
    try {
      const ok = await rejectConnection(currentUser.membershipId, profile.membershipId);
      if (ok) {
        setConnectionStatus('none');
        toast.success('Connection request declined');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancel = async () => {
    if (!currentUser || !profile?.membershipId || loadingAction) return;
    setLoadingAction(true);
    try {
      const ok = await cancelConnection(currentUser.membershipId, profile.membershipId);
      if (ok) {
        setConnectionStatus('none');
        toast.success('Connection request cancelled');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDisconnect = async () => {
    if (!currentUser || !profile?.membershipId || loadingAction) return;
    setLoadingAction(true);
    setShowDisconnectMenu(false);
    try {
      const ok = await removeConnection(currentUser.membershipId, profile.membershipId);
      if (ok) {
        setConnectionStatus('none');
        toast.success('Disconnected');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser || !profile?.membershipId || loadingAction) return;
    setLoadingAction(true);
    try {
      if (isFollowing) {
        const ok = await unfollowUser(currentUser.membershipId, profile.membershipId);
        if (ok) {
          setIsFollowing(false);
          toast.success('Unfollowed');
        }
      } else {
        const ok = await followUser(currentUser.membershipId, profile.membershipId, currentUser.name);
        if (ok) {
          setIsFollowing(true);
          toast.success('Now following!');
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReportProfile = () => {
    toast.success('Report submitted. Thank you!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Profile Not Found</h1>
        <p className="text-slate-600 dark:text-gray-400 mb-8">The profile you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const email = userData?.links?.email || userData?.email || profile.email || `${generateSlug(profile.name)}@example.com`;
  const linkedinUrl = userData?.links?.linkedin || userData?.linkedin || profile.linkedin || `https://linkedin.com/in/${generateSlug(profile.name)}`;
  const mailtoSubject = encodeURIComponent("Connecting via FocusLinks");
  const mailtoBody = encodeURIComponent(`Hi ${userData?.name || profile.name},\n\nI came across your profile on FocusLinks and would love to connect with you!\n\nBest regards,\n[Your Name]`);
  const mailtoLink = `mailto:${email}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-16">
      {/* Cover Photo Area */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex items-start pt-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
          <button onClick={handleReportProfile} className="absolute top-6 right-6 p-2 text-slate-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full transition-colors z-10" title="Report Profile">
            <Flag className="w-5 h-5" />
          </button>
          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                {!(userData?.image || profile.image) || (userData?.image || profile.image) === 'none' ? (
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-8 border-white dark:border-slate-900 shadow-lg">
                    <Users className="w-16 h-16 md:w-24 md:h-24 text-slate-400 dark:text-gray-500" />
                  </div>
                ) : (
                  <img 
                    src={userData?.image || profile.image} 
                    alt={userData?.name || profile.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || profile.name)}&background=e2e8f0&color=1e293b&size=300`;
                    }}
                    className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-8 border-white dark:border-slate-900 shadow-lg bg-white dark:bg-slate-900" 
                    referrerPolicy="no-referrer" 
                  />
                )}
                {(userData?.verified ?? profile.verified) && (
                  <BadgeCheck className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-8 h-8 md:w-10 md:h-10 text-blue-500 drop-shadow-md bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-grow pt-2 md:pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {userData?.name || profile.name}
                    </h1>
                    {(userData?.badges || profile.badges)?.includes('Speaker') && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 text-sm font-bold mt-1">
                        <Mic className="w-4 h-4 mr-1" /> Speaker
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Own profile */}
                    {currentUser?.membershipId === profile.membershipId ? (
                      <Link to="/dashboard" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center">
                        Edit Profile
                      </Link>
                    ) : currentUser ? (
                      <motion.div layout className="flex flex-wrap items-center gap-2">
                        {connectionStatus === 'none' || connectionStatus === 'rejected' ? (
                          <motion.button
                            key="connect-btn"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConnect}
                            disabled={loadingAction}
                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                          >
                            <UserPlus className="w-4 h-4" />
                            Connect
                          </motion.button>
                        ) : connectionStatus === 'pending_sent' ? (
                          <>
                            <motion.button
                              key="pending-btn"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              disabled
                              className="px-5 py-2.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-xl font-bold cursor-not-allowed flex items-center gap-2"
                            >
                              <Clock className="w-4 h-4" />
                              Pending
                            </motion.button>
                            <motion.button
                              key="cancel-btn"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={handleCancel}
                              disabled={loadingAction}
                              className="px-4 py-2 text-sm text-slate-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </motion.button>
                          </>
                        ) : connectionStatus === 'pending_received' ? (
                          <>
                            <motion.button
                              key="accept-btn"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleAccept}
                              disabled={loadingAction}
                              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              Accept
                            </motion.button>
                            <motion.button
                              key="reject-btn"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleReject}
                              disabled={loadingAction}
                              className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-300 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </motion.button>
                          </>
                        ) : connectionStatus === 'connected' ? (
                          <div className="relative" ref={disconnectRef}>
                            <motion.button
                              key="connected-btn"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => setShowDisconnectMenu(!showDisconnectMenu)}
                              className="px-5 py-2.5 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              Connected
                            </motion.button>
                            {showDisconnectMenu && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-full mt-2 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50 min-w-[140px]"
                              >
                                <button
                                  onClick={handleDisconnect}
                                  disabled={loadingAction}
                                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                                >
                                  Disconnect
                                </button>
                              </motion.div>
                            )}
                          </div>
                        ) : null}

                        {/* Follow / Unfollow */}
                        <motion.button
                          key={`follow-btn-${isFollowing}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleToggleFollow}
                          disabled={loadingAction}
                          className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 ${
                            isFollowing
                              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/50'
                              : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {isFollowing && <Check className="w-4 h-4" />}
                          {isFollowing ? 'Following' : 'Follow'}
                        </motion.button>
                      </motion.div>
                    ) : (
                      <a href={mailtoLink} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center">
                        Connect
                      </a>
                    )}

                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#0A66C2]/10 text-[#0A66C2] rounded-xl hover:bg-[#0A66C2]/20 transition-colors border border-[#0A66C2]/20" title="LinkedIn Profile">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
                
                <p className="text-xl text-blue-600 font-semibold mb-4">{userData?.title || profile.title}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-gray-400 font-medium text-sm md:text-base">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-slate-400 dark:text-gray-500" />
                    {userData?.location || profile.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5 text-slate-400 dark:text-gray-500" />
                    {((userData?.role || profile.type) || 'Member').charAt(0).toUpperCase() + ((userData?.role || profile.type) || 'Member').slice(1)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-slate-400 dark:text-gray-500" />
                    Joined {userData?.joinedDate || profile.joinedDate || '2024'}
                  </div>
                  {(userData?.flCredits || profile.flCredits) && (
                    <div className="flex items-center bg-amber-50 dark:bg-amber-950/50 text-amber-700 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/50">
                      <Award className="w-4 h-4 mr-1.5 text-amber-500" />
                      {userData?.flCredits || profile.flCredits} FL Credits
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto hide-scrollbar">
                <button 
                  onClick={() => setActiveTab('about')}
                  className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'about' ? 'text-blue-600 dark:text-blue-400 gradient-underline-animated' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  About
                </button>
                <button 
                  onClick={() => setActiveTab('posts')}
                  className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'posts' ? 'text-blue-600 dark:text-blue-400 gradient-underline-animated' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  Posts
                </button>
                <button 
                  onClick={() => setActiveTab('articles')}
                  className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'articles' ? 'text-blue-600 dark:text-blue-400 gradient-underline-animated' : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                  Articles
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                  {activeTab === 'about' && (
                    <>
                      <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mr-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          About
                        </h2>
                        <div className="prose prose-slate max-w-none text-slate-600 dark:text-gray-400 leading-relaxed">
                          <p>{userData?.bio || userData?.description || profile.description}</p>
                        </div>
                      </section>

                      <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mr-3">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          Experience
                        </h2>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                          {(userData?.experience || profile.experience) && (userData?.experience || profile.experience).length > 0 ? (
                            <div className="space-y-8">
                              {(userData?.experience || profile.experience).map((exp: any, idx: number) => (
                                <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-[-2rem] last:before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                                  <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900"></div>
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{exp.title}</h3>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 mb-3 text-sm text-slate-600 dark:text-gray-400">
                                    <span className="font-semibold text-indigo-600">{exp.company}</span>
                                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {exp.duration}</span>
                                    {exp.location && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {exp.location}</span>}
                                  </div>
                                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">{exp.description}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 dark:text-gray-400 italic text-center py-4">Experience details not available.</p>
                          )}
                        </div>
                      </section>

                      <section>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mr-3">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          Education
                        </h2>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                          {(userData?.education || profile.education) && (userData?.education || profile.education).length > 0 ? (
                            <div className="space-y-8">
                              {(userData?.education || profile.education).map((edu: any, idx: number) => (
                                <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-[-2rem] last:before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                                  <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900"></div>
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 mb-2 text-sm text-slate-600 dark:text-gray-400">
                                    <span className="font-semibold text-emerald-600">{edu.institution}</span>
                                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {edu.year}</span>
                                  </div>
                                  {edu.details && <p className="text-slate-600 dark:text-gray-400 text-sm md:text-base mt-2">{edu.details}</p>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-500 dark:text-gray-400 italic text-center py-4">Education details not available.</p>
                          )}
                        </div>
                      </section>
                    </>
                  )}
                  
                  {activeTab === 'posts' && (
                    <div className="space-y-6">
                      {userPosts.length > 0 ? (
                        userPosts.map(post => (
                          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              {userData?.image || profile.image ? (
                                <img src={userData?.image || profile.image} alt={userData?.name || profile.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-gray-400 font-bold">
                                  {(userData?.name || profile.name || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{userData?.name || profile.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-gray-400">
                                  {new Date(post.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-slate-800 dark:text-gray-200 whitespace-pre-wrap mb-4">{post.content}</p>
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {post.hashtags.map((tag: string) => (
                                  <span key={tag} className="text-sm text-blue-600">#{tag}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 dark:text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                {post.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Posts Yet</h3>
                          <p className="text-slate-500 dark:text-gray-400">This user hasn't posted anything to the feed yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'articles' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Articles Locked</h3>
                      <p className="text-slate-500 dark:text-gray-400">The articles feature is currently locked and will be available soon.</p>
                    </div>
                  )}
                </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Contact Info</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Linkedin className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">LinkedIn</p>
                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                          {linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Globe className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Website</p>
                        <Link to="/directory" className="text-sm text-blue-600 hover:underline">View Portfolio</Link>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Mail className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Email</p>
                        <a href={mailtoLink} className="text-sm text-blue-600 hover:underline break-all">{email}</a>
                      </div>
                    </li>
                    {(userData?.whatsapp || userData?.phone) && (
                      <li className="flex items-start">
                        <MessageCircle className="w-5 h-5 text-emerald-400 dark:text-emerald-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">WhatsApp</p>
                          <a
                            href={`https://wa.me/${(userData.whatsapp || userData.phone || '').replace(/[^0-9+]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-600 hover:underline"
                          >
                            {userData.whatsapp || userData.phone}
                          </a>
                        </div>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Link2 className="w-5 h-5 text-slate-400 dark:text-gray-500 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Connections</p>
                        <span className="text-sm text-slate-600 dark:text-gray-400">
                          {connectionCount} connection{connectionCount !== 1 ? 's' : ''} · {followingCount} following
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>

                {(userData?.interests || profile.interests) && (userData?.interests || profile.interests).length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Interests & Focus</h3>
                    <div className="flex flex-wrap gap-2">
                      {(userData?.interests || profile.interests).map((interest: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 text-sm font-medium shadow-sm hover:border-indigo-300 hover:text-indigo-700 transition-all cursor-default hover:scale-105 hover:shadow-md">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(userData?.skills || profile.skills) && (userData?.skills || profile.skills).length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {(userData?.skills || profile.skills).map((skill: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-gray-300 text-sm font-medium shadow-sm hover:border-blue-300 hover:text-blue-700 transition-all cursor-default hover:scale-105 hover:shadow-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 text-xs font-bold">
                      <Award className="w-3 h-3 mr-1" /> Top Contributor
                    </span>
                    {(userData?.verified ?? profile.verified) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 text-xs font-bold">
                        Verified Member
                      </span>
                    )}
                  </div>
                </div>

                {(userData?.events || profile.events) && (userData?.events || profile.events).length > 0 && (() => {
                  const now = new Date();
                  const events = userData?.events || profile.events;
                  const upcomingEvents = events.filter((e: any) => new Date(e.date) >= now);
                  const pastEvents = events.filter((e: any) => new Date(e.date) < now);

                  return (
                    <>
                      {upcomingEvents.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Upcoming Events</h3>
                          <div className="space-y-4">
                            {upcomingEvents.map((event, idx) => (
                              <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                                <div className="flex items-center gap-2 mb-2 relative z-10">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700">
                                    {event.role}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" /> {event.date}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-2 relative z-10">{event.title}</h4>
                                <div className="flex items-center text-xs text-slate-500 dark:text-gray-400 font-medium relative z-10">
                                  <Video className="w-3.5 h-3.5 mr-1" /> Google Meet
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {pastEvents.length > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Past Events</h3>
                          <div className="space-y-4">
                            {pastEvents.map((event, idx) => (
                              <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300">
                                    {event.role}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" /> {event.date}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-2">{event.title}</h4>
                                <div className="flex items-center text-xs text-slate-500 dark:text-gray-400 font-medium">
                                  <Video className="w-3.5 h-3.5 mr-1" /> Google Meet
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
