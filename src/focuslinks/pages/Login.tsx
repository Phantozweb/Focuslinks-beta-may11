'use client';

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from '../../context/NavigationContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Github, ShieldAlert, RefreshCw, X, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '../components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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

function getPasswordStrength(pwd: string): { label: string; color: string; score: number } {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', score: 1 };
  if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', score: 2 };
  return { label: 'Strong', color: 'bg-emerald-500', score: 3 };
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
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-32 mx-auto" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedRemember = localStorage.getItem('fl_remember_me');
      if (storedRemember === 'true') {
        return localStorage.getItem('fl_remembered_email') || '';
      }
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fl_remember_me') === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  // Show skeleton for 800ms
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Save remember me preference
    if (rememberMe) {
      localStorage.setItem('fl_remember_me', 'true');
      localStorage.setItem('fl_remembered_email', email);
    } else {
      localStorage.removeItem('fl_remember_me');
      localStorage.removeItem('fl_remembered_email');
    }

    setIsLoading(true);

    // Mock login: wait 2 seconds, then save mock user and navigate
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockUser = {
      id: '1',
      name: 'Dr. Sarah Mitchell',
      email: email,
      membershipId: 'FL07K2M',
      role: 'Optometrist',
      avatar: null,
    };

    localStorage.setItem('fl_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('storage'));
    setIsLoading(false);
    navigate('/home');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSendingReset(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSendingReset(false);
    setForgotSent(true);
    toast.success('Password reset link sent! Check your inbox.');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  };

  if (isInitialLoading) return <LoginSkeleton />;

  return (
    <>
    <SEO title="Sign In" description="Sign in to your FocusLinks account to access the global optometry community." keywords="sign in, login, focuslinks account" />
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
              Sign in to your FocusLinks account
            </p>
          </div>

          {/* Social Login Buttons with hover animations */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <motion.button
              type="button"
              onClick={() => toast.info('Social login coming soon!')}
              whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              {/* Google icon SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </motion.button>
            <motion.button
              type="button"
              onClick={() => toast.info('Social login coming soon!')}
              whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <Github className="w-5 h-5" />
              GitHub
            </motion.button>
          </motion.div>

          {/* Divider with gradient lines */}
          <div className="relative mb-6 flex items-center gap-3">
            <div className="gradient-line-divider" />
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap">
                Or continue with email
              </span>
            </div>
            <div className="gradient-line-divider" />
          </div>

          {/* Forgot Password Inline Form */}
          <AnimatePresence mode="wait">
            {showForgotPassword ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                {forgotSent ? (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/40 rounded-full flex items-center justify-center mx-auto mb-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Reset link sent!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Check {forgotEmail} for instructions.</p>
                    <button
                      onClick={() => { setShowForgotPassword(false); setForgotSent(false); setForgotEmail(''); }}
                      className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">Reset Password</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="p-1 rounded-lg text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">Enter your email address and we&apos;ll send you a link to reset your password.</p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-amber-200 dark:border-amber-700 rounded-lg bg-white dark:bg-slate-900 placeholder-gray-300 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={isSendingReset}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg disabled:opacity-70 transition-colors shrink-0"
                      >
                        {isSendingReset ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Login Form */}
          <AnimatePresence mode="wait">
            {!showForgotPassword || forgotSent ? (
              <motion.form
                key="login-form"
                initial={showForgotPassword ? { opacity: 0 } : undefined}
                animate={{ opacity: 1 }}
                onSubmit={handleLogin}
                className="space-y-4"
                noValidate
              >
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl bg-white dark:bg-slate-900 placeholder-gray-300 dark:placeholder-gray-600 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500 input-glow ${
                        errors.email
                          ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-gray-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      onKeyDown={handleKeyDown}
                      className={`w-full pl-11 pr-11 py-3 border rounded-xl bg-white dark:bg-slate-900 placeholder-gray-300 dark:placeholder-gray-600 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-500 input-glow ${
                        errors.password
                          ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-gray-200 dark:border-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors eye-icon-transition"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <motion.div
                        key={showPassword ? 'visible' : 'hidden'}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </motion.div>
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1">
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: passwordStrength.score === 1 ? '33%' : passwordStrength.score === 2 ? '66%' : '100%' }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-full ${passwordStrength.color}`}
                        />
                      </div>
                      <p className={`text-xs font-medium ${
                        passwordStrength.score === 1 ? 'text-red-500 dark:text-red-400' :
                        passwordStrength.score === 2 ? 'text-amber-500 dark:text-amber-400' :
                        'text-emerald-500 dark:text-emerald-400'
                      }`}>
                        Password strength: {passwordStrength.label}
                      </p>
                    </motion.div>
                  )}
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 focus:ring-2 bg-white dark:bg-slate-900 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
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
                        Signing in...
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
            ) : null}
          </AnimatePresence>

          {/* Having Trouble? FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6 border border-gray-100 dark:border-slate-800 rounded-xl overflow-hidden"
          >
            <button
              type="button"
              onClick={(e) => {
                const content = e.currentTarget.nextElementSibling;
                if (content) content.classList.toggle('hidden');
                const chevron = e.currentTarget.querySelector('svg');
                if (chevron) chevron.classList.toggle('rotate-180');
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-gray-400" />
                Having trouble?
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
            </button>
            <div className="hidden">
              <Accordion type="single" collapsible className="px-4">
                <AccordionItem value="faq-1" className="border-b border-gray-100 dark:border-slate-800">
                  <AccordionTrigger className="text-xs py-2.5 text-gray-600 dark:text-gray-400 hover:no-underline">
                    I can&apos;t remember my password
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-500 dark:text-gray-500 pb-2.5">
                    Click &quot;Forgot password?&quot; above to receive a password reset link via email. The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2" className="border-b border-gray-100 dark:border-slate-800">
                  <AccordionTrigger className="text-xs py-2.5 text-gray-600 dark:text-gray-400 hover:no-underline">
                    My account is locked
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-500 dark:text-gray-500 pb-2.5">
                    Accounts are temporarily locked after 5 failed login attempts. Wait 30 minutes and try again, or contact support for immediate assistance.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger className="text-xs py-2.5 text-gray-600 dark:text-gray-400 hover:no-underline">
                    Two-factor authentication not working
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-500 dark:text-gray-500 pb-2.5">
                    Ensure your device&apos;s time is synced correctly. You can use a backup code if your authenticator app is unavailable. Contact support if issues persist.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.div>

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
