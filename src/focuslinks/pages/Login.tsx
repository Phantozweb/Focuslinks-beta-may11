'use client';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from '../../context/NavigationContext';
import { Eye, ArrowRight, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '../components/SEO';

function FloatingOrb({ delay, x, y, size, color }: {
  delay: number;
  x: string;
  y: string;
  size: number;
  color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-xl pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
      animate={{
        y: [0, -15, 0],
        x: [0, 8, 0],
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function FloatingShape({ delay, x, y, type, color }: {
  delay: number;
  x: string;
  y: string;
  type: 'circle' | 'square' | 'triangle' | 'diamond';
  color: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, color: color }}
      animate={{
        y: [0, -20, 5, -10, 0],
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 0.95, 1.05, 1],
        opacity: [0.15, 0.3, 0.2, 0.35, 0.15],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {type === 'circle' && <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: color }} />}
      {type === 'square' && <div className="w-5 h-5 rounded-sm border-2 rotate-45" style={{ borderColor: color }} />}
      {type === 'triangle' && (
        <div className="w-0 h-0" style={{ borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: `14px solid ${color}` }} />
      )}
      {type === 'diamond' && <div className="w-4 h-4 rotate-45 border-2" style={{ borderColor: color }} />}
    </motion.div>
  );
}

function LoginSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex -mt-16">
      {/* Left skeleton */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
      {/* Right skeleton */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 bg-gray-50 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Skeleton className="w-14 h-14 rounded-xl" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [membershipId, setMembershipId] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedRemember = localStorage.getItem('fl_remember_me');
      if (storedRemember === 'true') {
        return localStorage.getItem('fl_remembered_membership_id') || '';
      }
    }
    return '';
  });
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fl_remember_me') === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

  // Show skeleton for 800ms
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = membershipId.trim().toUpperCase();

    if (!trimmed) {
      setError('Membership ID is required');
      return;
    }

    // Basic format check (FL followed by alphanumeric)
    if (!/^FL[A-Z0-9]+$/i.test(trimmed)) {
      setError('Invalid Membership ID format. It should look like "FL2ZXS6C"');
      return;
    }

    // Save remember me preference
    if (rememberMe) {
      localStorage.setItem('fl_remember_me', 'true');
      localStorage.setItem('fl_remembered_membership_id', trimmed);
    } else {
      localStorage.removeItem('fl_remember_me');
      localStorage.removeItem('fl_remembered_membership_id');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId: trimmed }),
      });

      const data = await response.json();

      if (!data.valid) {
        setError(data.error || 'Membership ID not found. Please check your ID or apply for membership.');
        setIsLoading(false);
        return;
      }

      // Store full user object in localStorage
      const user = data.user;
      localStorage.setItem('fl_user', JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));

      toast.success(`Welcome back, ${user.name || 'Member'}!`);
      setIsLoading(false);
      navigate('/dashboard');
    } catch {
      setError('Unable to connect. Please check your internet connection and try again.');
      setIsLoading(false);
    }
  };

  if (isInitialLoading) return <LoginSkeleton />;

  return (
    <>
    <SEO title="Sign In" description="Sign in to your FocusLinks account using your FL Membership ID." keywords="sign in, login, focuslinks account, membership id, optometry" />
    <div className="min-h-[calc(100vh-4rem)] flex -mt-16">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Floating orbs */}
        <FloatingOrb delay={0} x="10%" y="20%" size={120} color="rgba(59,130,246,0.15)" />
        <FloatingOrb delay={1} x="70%" y="15%" size={80} color="rgba(147,51,234,0.12)" />
        <FloatingOrb delay={0.5} x="20%" y="70%" size={100} color="rgba(59,130,246,0.1)" />
        <FloatingOrb delay={1.5} x="80%" y="65%" size={60} color="rgba(147,51,234,0.08)" />
        <FloatingOrb delay={2} x="50%" y="40%" size={140} color="rgba(59,130,246,0.06)" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Animated floating geometric shapes */}
        <FloatingShape delay={0} x="8%" y="12%" type="circle" color="rgba(59,130,246,0.25)" />
        <FloatingShape delay={1.5} x="82%" y="8%" type="square" color="rgba(147,51,234,0.2)" />
        <FloatingShape delay={3} x="15%" y="75%" type="diamond" color="rgba(59,130,246,0.2)" />
        <FloatingShape delay={4.5} x="70%" y="70%" type="triangle" color="rgba(147,51,234,0.18)" />
        <FloatingShape delay={2} x="50%" y="30%" type="circle" color="rgba(59,130,246,0.15)" />
        <FloatingShape delay={5} x="35%" y="85%" type="square" color="rgba(147,51,234,0.15)" />

        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Logo */}
            <div className="mb-8 inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <Eye className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              FocusLinks
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-6" />
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed max-w-sm mx-auto">
              Connecting the Global Platform For Optometrists
            </p>
          </motion.div>

          {/* Feature bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 space-y-4"
          >
            {[
              'Access your professional dashboard',
              'Connect with optometrists worldwide',
              'Explore clinical tools & resources',
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
                className="flex items-center gap-3 text-blue-100/60 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                {text}
              </motion.div>
            ))}
          </motion.div>

          {/* Membership ID info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-blue-300" />
              <span className="text-sm font-semibold text-blue-200">Your FL Membership ID</span>
            </div>
            <p className="text-xs text-blue-100/50 leading-relaxed">
              Your unique Membership ID (e.g. FL2ZXS6C) was assigned when you joined FocusLinks. It grants you full access to all platform features.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 bg-gray-50 dark:bg-slate-950 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md relative z-10 rotating-gradient-border rounded-2xl"
        >
          {/* Back to home link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4 group"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back to home
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
              <Eye className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Sign in with your FL Membership ID
            </p>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onSubmit={handleLogin}
            className="space-y-4"
            noValidate
          >
            {/* Membership ID Field */}
            <div>
              <label htmlFor="membershipId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                FL Membership ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CreditCard className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="membershipId"
                  name="membershipId"
                  type="text"
                  autoComplete="username"
                  placeholder="e.g. FL2ZXS6C"
                  value={membershipId}
                  onChange={(e) => {
                    setMembershipId(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white dark:bg-slate-900 placeholder-gray-300 dark:placeholder-gray-600 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500 input-glow uppercase tracking-wider font-mono ${
                    error
                      ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/50 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
                    {error}
                  </p>
                </motion.div>
              )}
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 ml-0.5">
                Enter the Membership ID you received when you joined FocusLinks
              </p>
            </div>

            {/* Remember me */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 focus:ring-2 bg-white dark:bg-slate-900 accent-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Remember my Membership ID</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-xl active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>

            {/* Terms of Service and Privacy Policy */}
            <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed pt-1">
              By signing in, you agree to our{' '}
              <Link
                to="/terms"
                className="font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline underline-offset-2 decoration-gray-300 dark:decoration-slate-600"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline underline-offset-2 decoration-gray-300 dark:decoration-slate-600"
              >
                Privacy Policy
              </Link>
            </p>
          </motion.form>

          {/* Bottom Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                to="/membership"
                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Join Now
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </>
  );
}
