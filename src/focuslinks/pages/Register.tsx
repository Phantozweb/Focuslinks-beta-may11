'use client';

import { useState, useMemo } from 'react';
import { Link, useNavigate } from '../../context/NavigationContext';
import { Eye, EyeOff, Mail, Lock, Shield, User, Globe, Briefcase, ArrowRight, ArrowLeft, Loader2, Github, Check, X, Clock, AlertCircle, ShieldCheck, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
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

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh',
  'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark',
  'Egypt', 'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Hong Kong',
  'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica',
  'Japan', 'Jordan', 'Kenya', 'Kuwait', 'Lebanon', 'Malaysia', 'Mexico', 'Morocco',
  'Nepal', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Panama',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia',
  'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Taiwan', 'Tanzania', 'Thailand', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Venezuela',
  'Vietnam', 'Zambia', 'Zimbabwe', 'Other',
];

const roles = [
  'Optometry Student',
  'Optometrist',
  'Contact Lens Specialist',
  'Pediatric Optometrist',
  'Practice Owner',
  'Academic/Researcher',
  'Other',
];

function getPasswordStrength(pwd: string): { label: string; color: string; width: string; score: number } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3', score: 1 };
  if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3', score: 2 };
  return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full', score: 3 };
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
  role?: string;
  terms?: string;
}

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordRequirements = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!country) newErrors.country = 'Please select your country/region';
    if (!role) newErrors.role = 'Please select your role/title';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!termsAccepted) newErrors.terms = 'You must accept the Terms & Conditions';
    if (!captchaChecked) toast.error('Please complete the CAPTCHA verification');
    setErrors(newErrors);
    if (!captchaChecked) return false;
    return Object.keys(newErrors).length === 0;
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email address';
    if (!password.trim()) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!country) newErrors.country = 'Please select your country/region';
    if (!role) newErrors.role = 'Please select your role/title';
    if (!termsAccepted) newErrors.terms = 'You must accept the Terms & Conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3() || !validate()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockUser = {
      id: '1',
      name: fullName,
      fullName: fullName,
      email: email,
      membershipId: 'FL07K2M',
      role: role,
      country: country,
      location: '',
      linkedin: '',
      whatsapp: '',
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem('fl_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('storage'));
    setIsLoading(false);
    toast.success('Account created successfully!');
    navigate('/dashboard');
  };

  const totalErrors = Object.keys(errors).length;

  const allFields = [email, password, confirmPassword, fullName, country, role];
  const filledFields = allFields.filter(f => f && f.trim() !== '').length;

  // Auto-calculated step based on field completion (no useEffect)
  const step1Done = !!(fullName.trim() && email.trim() && password.trim());
  const step2Done = !!(country && role);
  const step3Done = !!termsAccepted;
  const autoStep = step3Done ? 3 : step2Done ? 2 : step1Done ? 2 : 1;
  const autoStepLabel = ['Create Account', 'Your Details', 'Confirm'][autoStep - 1];
  const autoProgressItems = 7; // fullName, email, password, confirmPassword, country, role, terms
  const autoProgressFilled = filledFields + (termsAccepted ? 1 : 0);
  const autoProgressPercent = Math.round((autoProgressFilled / autoProgressItems) * 100);

  const inputClass = (field: keyof FormErrors) =>
    `w-full pl-11 pr-4 py-3 border rounded-xl bg-white dark:bg-slate-900 placeholder-gray-300 dark:placeholder-gray-600 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
      errors[field]
        ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
        : 'border-gray-200 dark:border-slate-700'
    }`;

  return (
    <>
    <SEO title="Create Account" description="Join FocusLinks and connect with optometry professionals worldwide. Create your free account today." keywords="register, sign up, join focuslinks, optometry account, create account" />
    <div className="min-h-[calc(100vh-4rem)] flex -mt-16">
      {/* Left Panel - Registration Form */}
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
          className="w-full max-w-md relative z-10 glass-panel animate-glow-border rounded-2xl"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
              <Eye className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Join the FocusLinks optometry community
            </p>
            {/* Estimated completion time */}
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400">
              <Clock className="w-3.5 h-3.5" />
              Estimated completion time: 2 minutes
            </div>
          </motion.div>

          {/* Step Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8"
          >
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Step {autoStep} of 3:{' '}
                  <span className="text-blue-600 dark:text-blue-400">{autoStepLabel}</span>
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
                  {autoProgressPercent}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${autoProgressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Validation Error Summary */}
          <AnimatePresence>
            {totalErrors > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/50 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">Please fix {totalErrors} error{totalErrors > 1 ? 's' : ''}</span>
                </div>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 ml-6 list-disc">
                  {errors.email && <li>{errors.email}</li>}
                  {errors.password && <li>{errors.password}</li>}
                  {errors.confirmPassword && <li>{errors.confirmPassword}</li>}
                  {errors.fullName && <li>{errors.fullName}</li>}
                  {errors.country && <li>{errors.country}</li>}
                  {errors.role && <li>{errors.role}</li>}
                  {errors.terms && <li>{errors.terms}</li>}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Login Buttons */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.4 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <motion.button
                type="button"
                onClick={() => toast.info('Social sign-up coming soon!')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 cursor-pointer"
              >
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
                onClick={() => toast.info('Social sign-up coming soon!')}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 cursor-pointer"
              >
                <Github className="w-5 h-5" />
                GitHub
              </motion.button>
            </motion.div>
          )}

          {/* Divider - only on step 1 */}
          {currentStep === 1 && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                  Or sign up with email
                </span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <AnimatePresence mode="wait">
              {/* Step 1: Account */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                        className={inputClass('email')}
                      />
                    </div>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5">
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                        className={inputClass('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {password.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-1.5">
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
                    {/* Password requirements checklist */}
                    {password.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                        <ul className="space-y-1.5">
                          {passwordRequirements.map((req) => (
                            <motion.li
                              key={req.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-2 text-xs"
                            >
                              {req.met ? (
                                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                  <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                  <X className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                              <span className={req.met ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                                {req.label}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                    {errors.password && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5">
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Shield className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                        className={`w-full pl-11 pr-11 py-3 border rounded-xl bg-white dark:bg-slate-900 placeholder-gray-300 dark:placeholder-gray-600 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                          errors.confirmPassword
                            ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                            : confirmPassword && password === confirmPassword
                              ? 'border-emerald-300 dark:border-emerald-700'
                              : 'border-gray-200 dark:border-slate-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {confirmPassword && password === confirmPassword && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 text-xs text-emerald-500 dark:text-emerald-400 font-medium ml-0.5 flex items-center gap-1">
                        <Check className="w-3 h-3 bounce-check" /> Passwords match
                      </motion.p>
                    )}
                    {errors.confirmPassword && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5">
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>

                  {/* Step 1 Next Button */}
                  <motion.div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Profile */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Dr. Jane Doe"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }}
                        className={inputClass('fullName')}
                      />
                    </div>
                    {errors.fullName && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5">
                        {errors.fullName}
                      </motion.p>
                    )}
                  </div>

                  {/* Country & Role - Side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Country */}
                    <div>
                      <label htmlFor="country" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                        Country/Region
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                          <Globe className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <select
                          id="country"
                          value={country}
                          onChange={(e) => { setCountry(e.target.value); clearError('country'); }}
                          className={`w-full pl-11 pr-8 py-3 border rounded-xl bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer ${
                            errors.country
                              ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                              : !country ? 'text-gray-400 dark:text-gray-500' : 'border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="">Select country</option>
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.country && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5">
                          {errors.country}
                        </motion.p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5">
                        Role/Title
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                          <Briefcase className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <select
                          id="role"
                          value={role}
                          onChange={(e) => { setRole(e.target.value); clearError('role'); }}
                          className={`w-full pl-11 pr-8 py-3 border rounded-xl bg-white dark:bg-slate-900 text-sm text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer ${
                            errors.role
                              ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
                              : !role ? 'text-gray-400 dark:text-gray-500' : 'border-gray-200 dark:border-slate-700'
                          }`}
                        >
                          <option value="">Select role</option>
                          {roles.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.role && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5">
                          {errors.role}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Step 2 Navigation */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 font-semibold text-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Review Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      Review Your Information
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Name', value: fullName || '—' },
                        { label: 'Email', value: email || '—' },
                        { label: 'Country', value: country || '—' },
                        { label: 'Role', value: role || '—' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
                          <span className="text-gray-900 dark:text-white font-semibold text-right">{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit details
                    </button>
                  </div>

                  {/* Terms & Conditions */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => { setTermsAccepted(e.target.checked); clearError('terms'); }}
                        className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 focus:ring-2 bg-white dark:bg-slate-900 accent-blue-600 cursor-pointer shrink-0"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/terms'); }}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline p-0 bg-transparent border-0 cursor-pointer"
                        >
                          Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/privacy'); }}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline p-0 bg-transparent border-0 cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                    {errors.terms && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium ml-0.5">
                        {errors.terms}
                      </motion.p>
                    )}
                  </div>

                  {/* Social Sign Up Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                        Or sign up with
                      </span>
                    </div>
                  </div>

                  {/* Social Sign Up Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => toast.info('Google signup coming soon!')}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 cursor-pointer"
                    >
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
                      onClick={() => toast.info('GitHub signup coming soon!')}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 cursor-pointer"
                    >
                      <Github className="w-5 h-5" />
                      GitHub
                    </motion.button>
                  </div>

                  {/* CAPTCHA Placeholder */}
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 shrink-0">
                        <Bot className="w-5 h-5 text-gray-400" />
                        <input
                          type="checkbox"
                          checked={captchaChecked}
                          onChange={(e) => setCaptchaChecked(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/20 focus:ring-2 bg-white dark:bg-slate-900 accent-blue-600 cursor-pointer"
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">I&apos;m not a robot</span>
                      <div className="ml-auto flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        reCAPTCHA
                      </div>
                    </div>
                  </div>

                  {/* Step 3 Navigation */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 font-semibold text-sm transition-all hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:shadow-xl active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Bottom Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Branding (hidden on mobile) */}
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
              Join the Global Platform For Optometrists
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
              'Connect with 500+ optometrists worldwide',
              'Access clinical tools & learning resources',
              'Build your professional directory profile',
              'Earn FL Credits through community participation',
              'Stay updated with the latest in eye care',
            ].map((text, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
                className="flex items-center gap-3 text-blue-100/60 text-sm"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                {text}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  </>
  );
}
