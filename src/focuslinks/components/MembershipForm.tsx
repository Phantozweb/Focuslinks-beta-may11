'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Link as LinkIcon, Briefcase, Globe, MapPin, Send, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, GraduationCap, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation, useParams } from '../../context/NavigationContext';
import MembershipCard from './MembershipCard';
import { fetchGitHubJson } from '../../services/githubService';
import { trackEvent } from '@/lib/analytics';
export default function MembershipForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [existingIds, setExistingIds] = useState<string[]>([]);
  const [generatedId, setGeneratedId] = useState('');
  const navigate = useNavigate();

  const generateMembershipId = (ids: string[]) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    let isUnique = false;
    
    while (!isUnique) {
      result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const fullId = `FL${result}`;
      if (!ids.includes(fullId)) {
        isUnique = true;
        return fullId;
      }
    }
    return `FL${result}`;
  };

  useEffect(() => {
    const loadExistingIds = async () => {
      try {
        const profiles = await fetchGitHubJson<any[]>('list_profiles.json');
        // If profiles is null (fetch failed), use an empty array
        const ids = Array.isArray(profiles) ? profiles.map(p => p.membershipId).filter(Boolean) : [];
        setExistingIds(ids);
        const newId = generateMembershipId(ids);
        setGeneratedId(newId);
      } catch (err) {
        console.error('Failed to load existing IDs:', err);
        // Fallback to a random ID if everything fails
        setGeneratedId(`FL${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
      }
    };
    loadExistingIds();
    
    // Safety timeout: if after 3 seconds we still don't have an ID, generate one
    const timer = setTimeout(() => {
      setGeneratedId(prev => prev || `FL${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    profession: '',
    country: '',
    otherCountry: '',
    region: '',
    cityState: ''
  });

  const roles = [
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'optometrist', label: 'Optometrist', icon: Eye },
    { id: 'ophthalmologist', label: 'Ophthalmologist', icon: ShieldCheck },
    { id: 'researcher', label: 'Researcher', icon: Sparkles },
    { id: 'clinic', label: 'Clinic / Hospital', icon: MapPin },
    { id: 'industry', label: 'Industry Partner', icon: Briefcase },
    { id: 'association', label: 'Association', icon: Globe },
    { id: 'other', label: 'Other', icon: User }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const membershipId = generatedId || generateMembershipId(existingIds);
    
    const data = {
      type: 'membership_application',
      membershipId,
      ...formData,
      // Do NOT auto-publish to public directory.
      // Users must explicitly create a public profile via CreateProfile.
      status: 'pending',
      verified: false,
      country: formData.country === 'OTHER' ? formData.otherCountry : formData.country,
      submittedAt: new Date().toISOString()
    };

    try {
      // Track the submission attempt
      trackEvent({
        action: 'Membership Form Submission',
        details: `User ${formData.fullName} submitted membership form`,
        metadata: {
          name: formData.fullName,
          email: formData.email,
          profession: formData.profession,
          city: formData.cityState,
          membershipId
        }
      });

      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        // Auto-login: store user data in localStorage
        // Profile is NOT yet published to directory — user must complete profile separately
        const userData = {
          membershipId,
          name: formData.fullName,
          email: formData.email,
          role: formData.profession,
          title: formData.profession,
          country: formData.country === 'OTHER' ? formData.otherCountry : formData.country,
          location: `${formData.cityState}${formData.cityState && formData.region ? ', ' : ''}${formData.region}`,
          verified: false,
          status: 'pending',
          joinedAt: new Date().toISOString()
        };
        localStorage.setItem('fl_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));

        setIsSubmitted(true);
        trackEvent({
          action: 'Membership Form Success',
          details: `Successfully processed membership for ${formData.fullName} (ID: ${membershipId})`
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit application');
        trackEvent({
          action: 'Membership Form Error',
          details: `Error submitting application for ${formData.fullName}: ${errorData.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error submitting application:', error);
      trackEvent({
        action: 'Membership Form Error',
        details: `Exception during form submission for ${formData.fullName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Mock data for preview
  const previewUserData = {
    name: formData.fullName || 'Your Name',
    email: formData.email || 'email@example.com',
    role: formData.profession || 'Your Profession',
    region: formData.region || 'Region',
    country: formData.country === 'OTHER' ? (formData.otherCountry || 'Specified Country') : (formData.country || 'Country'),
    location: `${formData.cityState || 'City'}, ${formData.region || 'Region'}`,
    linkedin: formData.linkedin || '',
    title: formData.profession || 'Professional',
    bio: '',
    memberId: generatedId || 'FL-XXXXXX'
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 md:p-16 text-center border border-slate-100 dark:border-slate-800"
      >
        <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Welcome to the Community!</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto text-lg font-medium leading-relaxed">
          Your membership is now active. Your unique Membership ID is:
        </p>
        <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-10 inline-block">
          <span className="text-4xl font-black text-blue-600 tracking-widest">{generatedId}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm">
          You are now logged in. Your ID has been saved — you can use it anytime to access your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/my-profile')}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30 active:scale-95"
          >
            Go to My Profile <ArrowRight className="w-6 h-6" />
          </button>
          <button 
            onClick={() => navigate('/directory')}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            View Directory
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">
      {/* Form Side */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 w-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
            initial={{ width: '33.33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>

        <form className="p-8 md:p-12" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <User className="w-3 h-3" /> Step 1 of 3
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Basic Information</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Let's start with your identity.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        autoComplete="off"
                        placeholder="Dr. Jane Doe" 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="off"
                        placeholder="your@email.com" 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">WhatsApp Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        autoComplete="off"
                        placeholder="Enter your number" 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.fullName || !formData.email}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Briefcase className="w-3 h-3" /> Step 2 of 3
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Professional Details</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Tell us about your background.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Select Your Primary Role</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, profession: role.id }))}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                            formData.profession === role.id 
                              ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100' 
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900'
                          }`}
                        >
                          <role.icon className={`w-6 h-6 ${formData.profession === role.id ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-center">{role.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">LinkedIn / Website (Optional)</label>
                    <div className="relative group">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        autoComplete="off"
                        placeholder="linkedin.com/in/..." 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Back
                  </button>
                  <button 
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.profession}
                    className="py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Globe className="w-3 h-3" /> Step 3 of 3
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Location</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Where are you based?</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Country</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                      <select 
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-10 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500 appearance-none"
                      >
                        <option value="" disabled>Select your country...</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                        <option value="SG">Singapore</option>
                        <option value="MY">Malaysia</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="ZA">South Africa</option>
                        <option value="OTHER">Other (Specify below)</option>
                      </select>
                    </div>
                  </div>

                  {formData.country === 'OTHER' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Specify Country</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                          type="text" 
                          name="otherCountry"
                          value={formData.otherCountry}
                          onChange={handleInputChange}
                          placeholder="Enter your country name" 
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Region / State</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                          type="text" 
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          placeholder="e.g. California" 
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">City</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                          type="text" 
                          name="cityState"
                          value={formData.cityState}
                          onChange={handleInputChange}
                          placeholder="e.g. San Francisco" 
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 font-medium dark:placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></div>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !formData.country}
                    className="py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        Submit Application
                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Preview Side */}
      <div className="lg:col-span-2 space-y-6 sticky top-32">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-white font-bold tracking-tight">Live Preview</h4>
              <p className="text-slate-500 text-xs font-medium">See your card as you type</p>
            </div>
          </div>

          <div className="transform scale-90 sm:scale-100 origin-top">
            <MembershipCard userData={previewUserData} previewMode={true} />
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Official Digital ID</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Professional Status</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Global Network Access</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-sm font-bold opacity-80 mb-1">Did you know?</p>
          <p className="font-medium leading-relaxed">
            Your Membership ID is 100% free and gives you instant access to all Focus Links clinical tools and events.
          </p>
        </div>
      </div>
    </div>
  );
}
