'use client';
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from '../../context/NavigationContext';
import { Calendar, Clock, Award, ArrowRight, CheckCircle2, ExternalLink, MessageSquare, Loader2, Monitor, Globe, Users, Zap, Lock, Send, Star, Video, ShieldCheck, User, Mail, BadgeCheck, AlertCircle, GraduationCap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfiles } from '../../hooks/useProfiles';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { fetchGitHubJson } from '../../services/githubService';

/* ═══════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
═══════════════════════════════════════════════════════════════════════ */
interface MeetingInfo {
  meetingLink: string;
  meetingTime: string;
  meetingEndTime: string;
  platform: string;
  status: string;
}

const WEBINAR_SLUG = 'beyond-orthok-practical-and-affordable-myopia-management-with-contact-lens';
const WEBINAR_TITLE = 'Beyond Ortho-K: Practical & Affordable Myopia Management with Contact Lenses';
const GOOGLE_MEET_LINK = 'https://meet.google.com/gim-ngct-gwv';

const learningPoints = [
  { icon: '🔬', title: 'Ortho-K vs. Soft Multifocals', desc: 'Clinical comparison of Ortho-K vs. soft multifocal/simultaneous vision lenses for myopia control.' },
  { icon: '🎯', title: 'Patient Selection Strategies', desc: 'Case-based decision making for identifying ideal candidates for different lens modalities.' },
  { icon: '💰', title: 'Cost vs. Efficacy Analysis', desc: 'Real-world practice insights comparing treatment costs with clinical outcomes.' },
  { icon: '⚙️', title: 'Fitting & Troubleshooting', desc: 'Advanced fitting strategies and practical solutions for common clinical challenges.' },
  { icon: '📊', title: 'Long-term Myopia Control', desc: 'Comprehensive review of long-term outcomes across different lens modalities.' },
];

const globalTimings = [
  { zone: 'India', abbr: 'IST', time: '7:00 PM', flag: '🇮🇳' },
  { zone: 'Dubai', abbr: 'GST', time: '5:30 PM', flag: '🇦🇪' },
  { zone: 'London', abbr: 'BST', time: '2:30 PM', flag: '🇬🇧' },
  { zone: 'New York', abbr: 'EDT', time: '9:30 AM', flag: '🇺🇸' },
  { zone: 'Sydney', abbr: 'AEST', time: '11:30 PM', flag: '🇦🇺' },
];

const eventMeta = [
  { icon: Calendar, label: 'Date', value: 'May 6, 2026' },
  { icon: Clock, label: 'Time', value: '7:00 PM IST' },
  { icon: Monitor, label: 'Format', value: 'Google Meet' },
  { icon: Clock, label: 'Duration', value: '2 Hours' },
  { icon: Award, label: 'Credits', value: '50 FL' },
];

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function Webinar() {
  const { slug } = useParams();
  const { listProfiles, fetchListProfiles } = useProfiles();

  /* state */
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPrebooked, setIsPrebooked] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', membershipId: '' });
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [askName, setAskName] = useState('');
  const [askEmail, setAskEmail] = useState('');
  const [askSubmitted, setAskSubmitted] = useState(false);
  const [claimId, setClaimId] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo | null>(null);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  /* join meeting form state */
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinMembershipId, setJoinMembershipId] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [flVerified, setFlVerified] = useState<boolean | null>(null);
  const [flVerifying, setFlVerifying] = useState(false);
  const [flMemberInfo, setFlMemberInfo] = useState<{ name: string; title: string } | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);

  /* certificate claim form state */
  const [certName, setCertName] = useState('');
  const [certEmail, setCertEmail] = useState('');
  const [certMembershipId, setCertMembershipId] = useState('');
  const [certSubmitted, setCertSubmitted] = useState(false);
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [certFlVerified, setCertFlVerified] = useState<boolean | null>(null);
  const [certFlVerifying, setCertFlVerifying] = useState(false);
  const [certFlMemberInfo, setCertFlMemberInfo] = useState<{ name: string; title: string } | null>(null);
  const [certEligibility, setCertEligibility] = useState<{ eligible: boolean; matchedBy?: string; source?: string; error?: string } | null>(null);
  const [certVerifying, setCertVerifying] = useState(false);

  /* feedback popup state */
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [popupFeedback, setPopupFeedback] = useState('');
  const [popupSubmitting, setPopupSubmitting] = useState(false);

  /* user from localStorage + check feedback status on load */
  useEffect(() => {
    fetchListProfiles();
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setFormData({ name: user.name || '', email: user.email || '', membershipId: user.membershipId || '' });
        setAskName(user.name || '');
        setAskEmail(user.email || '');
        setClaimId(user.membershipId || '');
        setCertName(user.name || '');
        setCertEmail(user.email || '');
        setCertMembershipId(user.membershipId || '');

        // Check if user already submitted feedback for this webinar
        if (user.email || user.membershipId) {
          fetch('/api/check-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: WEBINAR_SLUG, email: user.email, membershipId: user.membershipId }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.submitted) {
                setFeedbackSubmitted(true);
              }
            })
            .catch(() => { /* ignore */ });
        }
      } catch { /* ignore */ }
    }
  }, [fetchListProfiles]);

  /* timeline */
  const targetDate = new Date('2026-05-06T13:30:00Z').getTime();
  const eventEndDate = targetDate + 2 * 60 * 60 * 1000;
  const prebookCloseDate = targetDate - 5 * 60 * 60 * 1000;
  const claimStartDate = new Date('2026-05-06T18:30:00Z').getTime();
  const formsCloseDate = targetDate + 5 * 24 * 60 * 60 * 1000;

  const isPrebookOpen = now < prebookCloseDate;
  const isEventLive = now >= targetDate && now < eventEndDate;
  const isEventEnded = now >= eventEndDate;
  const isAskOpen = now < targetDate;
  const isFeedbackOpen = now >= targetDate && now < formsCloseDate;
  const isClaimOpen = now >= claimStartDate && now < formsCloseDate;
  const isNearEvent = now >= targetDate - 30 * 60 * 1000;

  /* countdown tick */
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      const diff = targetDate - t;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 864e5),
          hours: Math.floor((diff % 864e5) / 36e5),
          minutes: Math.floor((diff % 36e5) / 6e4),
          seconds: Math.floor((diff % 6e4) / 1e3),
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  /* fetch meeting link from GitHub */
  const fetchMeetingInfo = useCallback(async () => {
    setMeetingLoading(true);
    try {
      const data = await fetchGitHubJson<MeetingInfo>('Webinar/meeting-info.json');
      setMeetingInfo(data);
    } catch (err) { console.error('Meeting info fetch error', err); }
    finally { setMeetingLoading(false); }
  }, []);

  useEffect(() => { fetchMeetingInfo(); }, [fetchMeetingInfo]);
  useEffect(() => {
    if (!isNearEvent && !isEventLive) return;
    const id = setInterval(fetchMeetingInfo, 30000);
    return () => clearInterval(id);
  }, [isNearEvent, isEventLive, fetchMeetingInfo]);

  const hasMeetingLink = meetingInfo?.meetingLink?.trim() !== '' && meetingInfo?.meetingLink;
  const activeMeetLink = hasMeetingLink ? meetingInfo!.meetingLink : GOOGLE_MEET_LINK;

  /* speaker */
  const sp = listProfiles.find(p => p.id === 'manish-bhagat');
  const speakerName = sp?.name || 'Manish Bhagat';
  const speakerTitle = sp?.title || 'Head — Visual Eyez India | Consultant Optometrist';
  const speakerBio = sp?.description || 'Manish Bhagat is a Contact Lens Specialist and Orthokeratologist with extensive experience in myopia management. He completed his Contact Lens Residency at LV Prasad Eye Institute (LVPEI) and is an active member of the International Academy of Orthokeratology and Myopia Control (IAOMC).';
  const speakerImg = sp?.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300';

  /* form handlers */
  const handlePrebook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMessage(null);
    try {
      trackEvent({ action: 'Webinar Prebook Attempt', details: `${formData.name} prebooking ${WEBINAR_TITLE}`, metadata: { ...formData, webinar: WEBINAR_TITLE, slug } });
      const res = await fetch('/api/submit-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'prebook', webinar: WEBINAR_TITLE, slug: WEBINAR_SLUG, ...formData }) });
      const data = await res.json();
      if (res.ok) { trackEvent({ action: 'Webinar Prebook Success', details: `${formData.name} prebooked` }); if (data.success && data.entryId) window.location.href = `/booked/${data.entryId}`; else setIsPrebooked(true); }
      else { setErrorMessage(data.error || 'Failed'); trackEvent({ action: 'Webinar Prebook Error', details: data.error }); }
    } catch { setErrorMessage('Unexpected error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'ask', webinar: WEBINAR_TITLE, slug: WEBINAR_SLUG, name: askName, email: askEmail, membershipId: formData.membershipId, question: askQuestion }) });
      if (res.ok) { setAskSubmitted(true); toast.success('Question submitted!'); }
      else { const d = await res.json(); setErrorMessage(d.error || 'Failed'); }
    } catch { setErrorMessage('Unexpected error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'feedback', webinar: WEBINAR_TITLE, slug: WEBINAR_SLUG, name: formData.name, email: formData.email, membershipId: formData.membershipId, feedback }) });
      if (res.ok) { setFeedbackSubmitted(true); toast.success('Feedback submitted!'); }
      else { const d = await res.json(); setErrorMessage(d.error || 'Failed'); }
    } catch { setErrorMessage('Unexpected error.'); }
    finally { setIsSubmitting(false); }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'claim', webinar: WEBINAR_TITLE, slug: WEBINAR_SLUG, name: formData.name, email: formData.email, membershipId: claimId }) });
      if (res.ok) { setClaimSubmitted(true); toast.success('Claim submitted!'); }
      else { const d = await res.json(); setErrorMessage(d.error || 'Failed'); }
    } catch { setErrorMessage('Unexpected error.'); }
    finally { setIsSubmitting(false); }
  };

  /* FL membership verification */
  const handleVerifyMembership = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed || trimmed.length < 3) { setFlVerified(null); setFlMemberInfo(null); return; }
    setFlVerifying(true);
    try {
      const res = await fetch('/api/verify-membership', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ membershipId: trimmed }) });
      const data = await res.json();
      if (data.valid) { setFlVerified(true); setFlMemberInfo({ name: data.member.name, title: data.member.title }); }
      else { setFlVerified(false); setFlMemberInfo(null); }
    } catch { setFlVerified(false); setFlMemberInfo(null); }
    finally { setFlVerifying(false); }
  }, []);

  /* debounced verify on typing */
  useEffect(() => {
    if (!joinMembershipId.trim()) { setFlVerified(null); setFlMemberInfo(null); return; }
    const timer = setTimeout(() => handleVerifyMembership(joinMembershipId), 600);
    return () => clearTimeout(timer);
  }, [joinMembershipId, handleVerifyMembership]);

  /* certificate FL membership verification */
  const handleVerifyCertMembership = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed || trimmed.length < 3) { setCertFlVerified(null); setCertFlMemberInfo(null); return; }
    setCertFlVerifying(true);
    try {
      const res = await fetch('/api/verify-membership', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ membershipId: trimmed }) });
      const data = await res.json();
      if (data.valid) { setCertFlVerified(true); setCertFlMemberInfo({ name: data.member.name, title: data.member.title }); }
      else { setCertFlVerified(false); setCertFlMemberInfo(null); }
    } catch { setCertFlVerified(false); setCertFlMemberInfo(null); }
    finally { setCertFlVerifying(false); }
  }, []);

  /* debounced verify for cert membership id */
  useEffect(() => {
    if (!certMembershipId.trim()) { setCertFlVerified(null); setCertFlMemberInfo(null); return; }
    const timer = setTimeout(() => handleVerifyCertMembership(certMembershipId), 600);
    return () => clearTimeout(timer);
  }, [certMembershipId, handleVerifyCertMembership]);

  /* certificate eligibility verification */
  const verifyCertificateEligibility = useCallback(async () => {
    if (!certEmail.trim() && !certMembershipId.trim() && !certName.trim()) {
      setCertEligibility({ eligible: false, error: 'Please enter your name, email, or Membership ID to verify.' });
      return;
    }
    setCertVerifying(true);
    setCertEligibility(null);
    try {
      const res = await fetch('/api/verify-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: WEBINAR_SLUG, email: certEmail, membershipId: certMembershipId, name: certName }),
      });
      const data = await res.json();
      setCertEligibility(data);
    } catch {
      setCertEligibility({ eligible: false, error: 'Failed to verify. Please try again.' });
    } finally {
      setCertVerifying(false);
    }
  }, [certEmail, certMembershipId, certName]);

  /* actual certificate claim logic (called after feedback is confirmed) */
  const submitCertificateClaim = async () => {
    setCertSubmitting(true);
    try {
      const verifyRes = await fetch('/api/verify-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: WEBINAR_SLUG, email: certEmail, membershipId: certMembershipId, name: certName }),
      });
      const verifyData = await verifyRes.json();
      setCertEligibility(verifyData);

      if (!verifyData.eligible) {
        toast.error(verifyData.error || 'You are not eligible for a certificate. Please check your details.');
        setCertSubmitting(false);
        return;
      }

      // If eligible, submit the claim
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'certificate-claim',
          webinar: WEBINAR_TITLE,
          slug: WEBINAR_SLUG,
          name: verifyData.name || certName,
          email: verifyData.email || certEmail,
          membershipId: verifyData.membershipId || certMembershipId,
          flVerified: certFlVerified,
          matchedBy: verifyData.matchedBy,
          source: verifyData.source,
          feedbackSubmitted: true,
        }),
      });
      if (res.ok) { setCertSubmitted(true); toast.success('Certificate claimed successfully!'); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to claim certificate'); }
    } catch { toast.error('Unexpected error. Please try again.'); }
    finally { setCertSubmitting(false); }
  };

  /* certificate claim handler — shows feedback popup if needed */
  const handleCertificateClaim = async (e: React.FormEvent) => {
    e.preventDefault();

    // If feedback not yet submitted, show the popup first
    if (!feedbackSubmitted) {
      setShowFeedbackPopup(true);
      return;
    }

    // Feedback already done, proceed directly
    await submitCertificateClaim();
  };

  /* handle feedback submission from popup */
  const handlePopupFeedbackSubmit = async () => {
    if (!popupFeedback.trim()) {
      toast.error('Please write some feedback before proceeding.');
      return;
    }
    setPopupSubmitting(true);
    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'feedback', webinar: WEBINAR_TITLE, slug: WEBINAR_SLUG, name: formData.name, email: formData.email, membershipId: formData.membershipId, feedback: popupFeedback }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
        setFeedback(popupFeedback);
        setShowFeedbackPopup(false);
        toast.success('Feedback submitted! Claiming your certificate…');
        // Now proceed with the certificate claim
        await submitCertificateClaim();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to submit feedback');
      }
    } catch {
      toast.error('Unexpected error submitting feedback.');
    } finally {
      setPopupSubmitting(false);
    }
  };

  /* join meeting handler */
  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault(); setJoinSubmitting(true); setErrorMessage(null);
    try {
      trackEvent({ action: 'Webinar Join Attempt', details: `${joinName} joining ${WEBINAR_TITLE}`, metadata: { name: joinName, email: joinEmail, membershipId: joinMembershipId, verified: flVerified } });
      const res = await fetch('/api/submit-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'join', webinar: WEBINAR_TITLE, slug: WEBINAR_SLUG, name: joinName, email: joinEmail, membershipId: joinMembershipId, flVerified, meetingLink: activeMeetLink }) });
      const data = await res.json();
      if (res.ok) {
        setJoinSubmitted(true);
        trackEvent({ action: 'Webinar Join Success', details: `${joinName} joined` });
        window.open(activeMeetLink, '_blank', 'noopener,noreferrer');
      }
      else { setErrorMessage(data.error || 'Failed to join'); trackEvent({ action: 'Webinar Join Error', details: data.error }); }
    } catch { setErrorMessage('Unexpected error.'); }
    finally { setJoinSubmitting(false); }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <SEO title="Beyond Ortho-K Masterclass | FocusLinks" description="Join our expert speaker for a deep dive into modern myopia control techniques, orthokeratology, and specialty contact lens fitting." keywords="Beyond Ortho-K, myopia management, contact lenses, orthokeratology, FocusLinks webinar" />

      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">

        {/* ══════════════════ HERO ══════════════════ */}
        <section className="relative w-full overflow-hidden bg-slate-950">

          {/* Animated background mesh */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-slate-950 to-violet-950/80" />
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[80px]" />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32">

              {/* Left: Title + Meta */}
              <div className="flex-1 text-center lg:text-left max-w-2xl">
                {/* Status badge */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 sm:mb-6">
                  {isEventLive ? (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-red-500" /></span>
                      Live Now
                    </span>
                  ) : isEventEnded ? (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-500/20 border border-slate-400/30 text-slate-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/25 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5" /> Registration Closed
                    </span>
                  )}
                </motion.div>

                {/* Title */}
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-4 sm:mb-5"
                >
                  <span className="text-white">Beyond </span>
                  <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">Ortho-K</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="text-lg sm:text-xl md:text-2xl text-slate-300 font-medium mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                >
                  Practical & Affordable Myopia Management with Contact Lenses
                </motion.p>

                {/* Event meta chips */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3 mb-8 sm:mb-10"
                >
                  {[
                    { icon: Users, text: speakerName },
                    { icon: Calendar, text: 'May 6, 2026' },
                    { icon: Clock, text: '7:00 PM IST' },
                    { icon: Award, text: '50 FL Credits' },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-xs sm:text-sm font-medium backdrop-blur-sm">
                      <Icon className="w-3.5 h-3.5 text-teal-400" />
                      {text}
                    </span>
                  ))}
                </motion.div>

                {/* CTA / Join */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="flex flex-col items-center justify-center lg:justify-start gap-3"
                >
                  {isEventLive ? (
                    joinSubmitted ? (
                      <a href={activeMeetLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
                      >
                        <Video className="w-5 h-5" />
                        Rejoin Session
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : showJoinForm ? (
                      /* Join Form */
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-5 sm:p-6 shadow-2xl"
                      >
                        <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Video className="w-4 h-4 text-teal-400" /> Join the Session
                        </h3>
                        {errorMessage && (
                          <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMessage}
                          </div>
                        )}
                        <form onSubmit={handleJoinMeeting} className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input type="text" required placeholder="Full Name *" value={joinName} onChange={e => setJoinName(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all" />
                            </div>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                              <input type="email" required placeholder="Email Address *" value={joinEmail} onChange={e => setJoinEmail(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-white/30 outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all" />
                            </div>
                          </div>
                          {/* FL Membership ID (optional) */}
                          <div className="relative">
                            <ShieldCheck className={`absolute left-3 top-3 w-4 h-4 transition-colors ${flVerified === true ? 'text-emerald-400' : flVerified === false ? 'text-red-400' : 'text-white/30'}`} />
                            <input type="text" placeholder="FL Membership ID (optional)" value={joinMembershipId} onChange={e => { setJoinMembershipId(e.target.value); setErrorMessage(null); }}
                              className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/[0.06] border text-white text-sm placeholder:text-white/30 outline-none transition-all ${flVerified === true ? 'border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/50' : flVerified === false ? 'border-red-400/40 focus:ring-2 focus:ring-red-400/50' : 'border-white/[0.08] focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50'}`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {flVerifying && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
                              {flVerified === true && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                              {flVerified === false && <AlertCircle className="w-4 h-4 text-red-400" />}
                            </div>
                          </div>
                          {flVerified === true && flMemberInfo && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                            >
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="text-xs text-emerald-300">Verified: <strong>{flMemberInfo.name}</strong> — {flMemberInfo.title}</span>
                            </motion.div>
                          )}
                          {flVerified === false && joinMembershipId.trim().length >= 3 && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-xs text-amber-300">Membership ID not found. You can still join without it.</span>
                            </motion.div>
                          )}
                          <button type="submit" disabled={joinSubmitting}
                            className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                          >
                            {joinSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</> : <><span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75" /><span className="relative rounded-full h-2 w-2 bg-white" /></span> Join Live Session</>}
                          </button>
                          <p className="text-center text-[10px] text-white/25">By joining, your name and email will be recorded for attendance.</p>
                        </form>
                        <button onClick={() => { setShowJoinForm(false); setErrorMessage(null); }} className="w-full mt-2 text-center text-xs text-white/40 hover:text-white/60 transition-colors py-1">
                          Cancel
                        </button>
                      </motion.div>
                    ) : (
                      <button onClick={() => setShowJoinForm(true)}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-red-500/25 hover:shadow-red-500/40 transition-all hover:-translate-y-0.5"
                      >
                        <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75" /><span className="relative rounded-full h-2.5 w-2.5 bg-white" /></span>
                        Join Live Session
                        <Video className="w-5 h-5" />
                      </button>
                    )
                  ) : isEventEnded ? (
                    <div className="flex flex-col items-center lg:items-start gap-3">
                      <a
                        href="#certificate-claim"
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5"
                      >
                        <GraduationCap className="w-5 h-5" />
                        Claim Your Certificate
                        <ArrowRight className="w-4 h-4" />
                      </a>
                      <p className="text-sm text-white/50 max-w-md text-center lg:text-left">
                        The Beyond Ortho-K masterclass has concluded. Claim your certificate of participation below.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/[0.07] border border-white/10 text-white/60 rounded-2xl font-medium text-sm sm:text-base">
                        <Lock className="w-4 h-4" /> Prebooking has closed
                      </span>
                      <span className="text-[11px] text-white/30 flex items-center gap-1.5">
                        <Video className="w-3 h-3" /> Google Meet link will appear here at 7:00 PM IST
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right: Countdown + Visual Card */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                className="w-full max-w-md lg:max-w-sm shrink-0"
              >
                {!isEventEnded && (
                  <div className="relative bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl">
                    {/* Glow effect */}
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

                    <div className="relative">
                      {isEventLive ? (
                        <>
                          <div className="flex items-center gap-2 mb-5">
                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative rounded-full h-3 w-3 bg-red-500" /></span>
                            <span className="text-sm font-bold text-red-300 uppercase tracking-wider">Session Live</span>
                          </div>
                          <p className="text-white/60 text-sm">The session is in progress. Use the Join button to enter.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-4">Event Starts In</p>
                          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
                            {[
                              { v: timeLeft.days, l: 'Days' },
                              { v: timeLeft.hours, l: 'Hrs' },
                              { v: timeLeft.minutes, l: 'Min' },
                              { v: timeLeft.seconds, l: 'Sec' },
                            ].map(({ v, l }) => (
                              <div key={l} className="text-center">
                                <div className="bg-white/[0.08] border border-white/[0.06] rounded-2xl py-3 sm:py-4 mb-1.5">
                                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tabular-nums leading-none">
                                    {v.toString().padStart(2, '0')}
                                  </span>
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold text-white/30 uppercase tracking-widest">{l}</span>
                              </div>
                            ))}
                          </div>
                          <div className="h-px bg-white/[0.06] mb-4" />
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{(timeLeft.days * 24 + timeLeft.hours).toLocaleString()} hours remaining</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Bottom wave / fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
        </section>

        {/* ══════════════════ MAIN CONTENT ══════════════════ */}
        <section className="py-10 sm:py-14 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">

              {/* ── LEFT COLUMN ── */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-10 sm:space-y-14">

                {/* About */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 flex items-center gap-2.5">
                    <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-teal-500 to-emerald-600 shrink-0" />
                    About the Masterclass
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base max-w-3xl">
                    In this exclusive masterclass, our expert speaker will walk you through the latest advancements in clinical optometry, focusing on myopia management and specialty contact lenses. We will cover practical applications of new diagnostic tools, patient communication strategies for complex cases, and a comprehensive review of recent clinical studies.
                  </p>
                </motion.div>

                {/* Certificate Claim Section — shown when event ended */}
                {isEventEnded && (
                  <motion.div id="certificate-claim" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-200/60 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/80 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30"
                  >
                    {/* Decorative blurs */}
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative p-6 sm:p-8">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                          <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Claim Your Attendance Certificate</h2>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Enter your details below to claim your certificate of participation.</p>
                        </div>
                      </div>

                      {/* Form or Success — Certificate Claim (always accessible) */}
                      {certSubmitted ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-3 py-6 text-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">Certificate Claimed!</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">Check your email for your certificate of participation.</p>
                          {certEligibility?.source && (
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Status: {certEligibility.source}</p>
                          )}
                        </motion.div>
                      ) : (
                        <form onSubmit={handleCertificateClaim} className="space-y-4">

                          {/* Certificate Claim Form — always visible */}
                          <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/30 bg-white/50 dark:bg-slate-900/30 p-4">
                            <div className="space-y-3">
                              {/* Name */}
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" required placeholder="Full Name *" value={certName} onChange={e => { setCertName(e.target.value); setCertEligibility(null); }}
                                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-400" />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Email */}
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <input type="email" placeholder="Email Address" value={certEmail} onChange={e => { setCertEmail(e.target.value); setCertEligibility(null); }}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-slate-400" />
                                </div>
                                {/* FL Membership ID */}
                                <div className="relative">
                                  <ShieldCheck className={`absolute left-3 top-3 w-4 h-4 transition-colors ${certFlVerified === true ? 'text-emerald-500' : certFlVerified === false ? 'text-red-400' : 'text-slate-400'}`} />
                                  <input type="text" placeholder="FL Membership ID" value={certMembershipId} onChange={e => { setCertMembershipId(e.target.value); setCertEligibility(null); }}
                                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 ${certFlVerified === true ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500/50' : certFlVerified === false ? 'border-red-300 focus:ring-2 focus:ring-red-400/50' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50'}`}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {certFlVerifying && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                                    {certFlVerified === true && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                                    {certFlVerified === false && <AlertCircle className="w-4 h-4 text-red-400" />}
                                  </div>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-1">Provide at least your email or Membership ID so we can verify your attendance.</p>
                              {certFlVerified === true && certFlMemberInfo && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30"
                                >
                                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span className="text-xs text-emerald-700 dark:text-emerald-300">Verified: <strong>{certFlMemberInfo.name}</strong> — {certFlMemberInfo.title}</span>
                                </motion.div>
                              )}

                              {/* Check Eligibility Button */}
                              <button type="button" onClick={verifyCertificateEligibility} disabled={certVerifying || (!certEmail.trim() && !certMembershipId.trim() && !certName.trim())}
                                className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                              >
                                {certVerifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking…</> : <><ShieldCheck className="w-4 h-4" /> Check Eligibility</>}
                              </button>

                              {/* Eligibility Result */}
                              <AnimatePresence>
                                {certEligibility && certEligibility.eligible && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Eligible for certificate!</p>
                                      {certEligibility.source && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Status: {certEligibility.source}</p>}
                                      {certEligibility.matchedBy && <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Matched by: {certEligibility.matchedBy === 'email' ? 'Email' : certEligibility.matchedBy === 'membershipId' ? 'Membership ID' : 'Name'}</p>}
                                    </div>
                                  </motion.div>
                                )}
                                {certEligibility && !certEligibility.eligible && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                                  >
                                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-bold text-red-700 dark:text-red-300">Not eligible</p>
                                      <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">{certEligibility.error || 'No booking or attendance record found with your details.'}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <button type="submit" disabled={certSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                              >
                                {certSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying & Claiming…</> : <><GraduationCap className="w-4 h-4" /> Claim Certificate</>}
                              </button>

                              {/* Feedback notice below Claim button */}
                              {feedbackSubmitted ? (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Feedback submitted — your certificate will be issued upon verification.
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/15 text-amber-700 dark:text-amber-300 text-xs font-medium">
                                  <MessageSquare className="w-4 h-4 shrink-0" /> Feedback is required before your certificate can be issued.
                                </div>
                              )}

                              <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">We verify your booking or attendance record before issuing the certificate. You can use your email, Membership ID, or name for verification.</p>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Recording Coming Soon Banner */}
                    <div className="relative border-t border-emerald-200/40 dark:border-emerald-800/20 bg-emerald-100/40 dark:bg-emerald-900/10 px-6 sm:px-8 py-3.5">
                      <div className="flex items-center gap-2.5 text-sm text-emerald-700 dark:text-emerald-300">
                        <Video className="w-4 h-4 shrink-0" />
                        <span className="font-medium">Session recording will be available soon. Stay tuned!</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* What You'll Learn */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6 flex items-center gap-2.5">
                    <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-violet-500 to-purple-600 shrink-0" />
                    What You&apos;ll Learn
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {learningPoints.map((item, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }}
                        className="group flex gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-teal-50/60 dark:hover:bg-teal-950/20 hover:border-teal-200 dark:hover:border-teal-800/40 transition-all duration-200"
                      >
                        <span className="text-xl sm:text-2xl mt-0.5 shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold mb-1 leading-snug">{item.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Speaker */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6 flex items-center gap-2.5">
                    <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 shrink-0" />
                    Your Speaker
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent dark:from-teal-900/10 dark:to-transparent rounded-bl-full" />
                    <div className="relative flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left w-full">
                      <div className="relative shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white dark:ring-slate-800">
                          <img src={speakerImg} alt={speakerName} onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(speakerName)}&background=e2e8f0&color=1e293b&size=300`; }} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800">
                          <Star className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold mb-0.5">{speakerName}</h3>
                        <p className="text-teal-600 dark:text-teal-400 font-semibold text-xs sm:text-sm mb-3">{speakerTitle}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 max-w-xl">{speakerBio}</p>
                        <Link to="/profile/manish-bhagat" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold transition-colors">
                          View Full Profile <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Forms: Ask / Feedback / Claim */}
                {(isAskOpen || isFeedbackOpen || isClaimOpen) && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div className={`grid grid-cols-1 ${isFeedbackOpen && isClaimOpen ? 'md:grid-cols-2' : ''} gap-4 sm:gap-6`}>
                      {isAskOpen && (
                        <div className="p-5 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                            <div><h3 className="text-base sm:text-lg font-bold">Ask the Speaker</h3><p className="text-xs text-slate-500">Submit questions before the event</p></div>
                          </div>
                          {askSubmitted ? <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Submitted!</div> : (
                            <form onSubmit={handleAskSubmit} className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input type="text" required placeholder="Name" value={askName} onChange={e => setAskName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400" />
                                <input type="email" required placeholder="Email" value={askEmail} onChange={e => setAskEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400" />
                              </div>
                              <textarea required rows={3} placeholder="Your question…" value={askQuestion} onChange={e => setAskQuestion(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none placeholder:text-slate-400" />
                              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-70 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Submit</>}
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                      {isFeedbackOpen && !feedbackSubmitted && (
                        <div className="p-5 sm:p-6 rounded-2xl border border-violet-100 dark:border-violet-800/30 bg-gradient-to-br from-violet-50/80 to-purple-50/80 dark:from-violet-900/20 dark:to-purple-900/20">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
                            <div><h3 className="text-base sm:text-lg font-bold">Share Feedback</h3><p className="text-xs text-slate-500">Required for certificate</p></div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Feedback is now required before claiming your certificate. Please use the feedback form in the certificate section above.</p>
                          <a href="#certificate-claim" className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors">
                            <MessageSquare className="w-4 h-4" /> Go to Certificate & Feedback
                          </a>
                        </div>
                      )}
                      {isFeedbackOpen && feedbackSubmitted && (
                        <div className="p-5 sm:p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
                            <div><h3 className="text-base sm:text-lg font-bold">Feedback Submitted</h3><p className="text-xs text-slate-500">Thank you for your feedback</p></div>
                          </div>
                        </div>
                      )}
                      {isClaimOpen && (
                        <div className="p-5 sm:p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><Award className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
                            <div><h3 className="text-base sm:text-lg font-bold">Claim FL Credits</h3><p className="text-xs text-slate-500">Earn 50 credits</p></div>
                          </div>
                          {claimSubmitted ? <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Claimed!</div> : (
                            <form onSubmit={handleClaimSubmit} className="space-y-3">
                              <input type="text" required placeholder="Membership ID (FL-XXXXX)" value={claimId} onChange={e => setClaimId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-slate-400" />
                              <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-70 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Claiming…</> : <><Award className="w-4 h-4" /> Claim 50 Credits</>}
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <aside className="lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-5">

                {/* Event Details */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950"
                >
                  <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-5">Event Details</h3>
                  <div className="space-y-3">
                    {eventMeta.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                          <p className="text-sm font-bold truncate">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isPrebookOpen && !isEventLive && !isEventEnded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Lock className="w-3.5 h-3.5" /> Prebooking has closed
                      </div>
                      <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400">
                        <Video className="w-3.5 h-3.5" /> Google Meet link activates at 7:00 PM IST
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Global Timings */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950"
                >
                  <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                    <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <h3 className="text-base sm:text-lg font-bold">Global Timings</h3>
                  </div>
                  <div className="space-y-1">
                    {globalTimings.map(t => (
                      <div key={t.zone} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                        <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="text-base leading-none">{t.flag}</span>
                          <span className="font-medium">{t.zone}</span>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{t.abbr}</span>
                        </span>
                        <span className="text-sm font-bold tabular-nums">{t.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* FL Credits Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 overflow-hidden shadow-lg shadow-teal-600/10"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Earn 50 FL Credits</h3>
                    <p className="text-sm text-teal-100/80 leading-relaxed mb-4">Attend this live session and earn FL Credits that boost your Knowledge Score on the leaderboard.</p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-start gap-2.5 border border-white/10">
                      <Award className="w-4 h-4 text-teal-200 shrink-0 mt-0.5" />
                      <span className="text-xs text-teal-100 font-medium">Membership ID required for automatic credit allocation.</span>
                    </div>
                  </div>
                </motion.div>

                {/* Speaker Quick Card — mobile only */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="lg:hidden p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950"
                >
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Speaker</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={speakerImg} alt={speakerName} onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(speakerName)}&background=e2e8f0&color=1e293b&size=300`; }} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0"><p className="text-sm font-bold truncate">{speakerName}</p><p className="text-xs text-teal-600 dark:text-teal-400 truncate">{speakerTitle}</p></div>
                  </div>
                </motion.div>
              </aside>
            </div>
          </div>
        </section>
      </div>

      {/* Feedback Popup Modal */}
      <AnimatePresence>
        {showFeedbackPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => { if (!popupSubmitting) setShowFeedbackPopup(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => { if (!popupSubmitting) setShowFeedbackPopup(false); }}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-2 pr-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share Your Feedback</h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  Your feedback is required to receive your certificate. Let us know how the session was!
                </p>

                {/* Textarea */}
                <textarea
                  required
                  rows={4}
                  placeholder="How was the session? What did you learn? Any suggestions?"
                  value={popupFeedback}
                  onChange={e => setPopupFeedback(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none placeholder:text-slate-400 dark:text-slate-300 mb-4"
                />

                {/* Submit button */}
                <button
                  onClick={handlePopupFeedbackSubmit}
                  disabled={popupSubmitting || !popupFeedback.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  {popupSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit & Claim Certificate</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
