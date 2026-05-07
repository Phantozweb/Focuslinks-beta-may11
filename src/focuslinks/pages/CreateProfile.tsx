'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate, useLocation } from '../../context/NavigationContext';
import { useProfiles } from '../../hooks/useProfiles';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Mail, 
  Linkedin, 
  Globe, 
  Award, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Eye,
  Edit3,
  CheckCircle2,
  BadgeCheck,
  Calendar,
  Loader2,
  Download,
  Check,
  Clock,
  Sparkles,
  Upload,
  FileText,
  X
} from 'lucide-react';
interface Experience {
  title: string;
  company: string;
  duration: string;
  location: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  details: string;
}

interface ProfileData {
  name: string;
  title: string;
  location: string;
  type: 'professional' | 'student' | 'association';
  image: string;
  description: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  interests: string[];
  badges: string[];
  flCredits: number;
  verified: boolean;
  joinedDate: string;
  membershipId?: string;
}

const INITIAL_DATA: ProfileData = {
  name: '',
  title: '',
  location: '',
  type: 'professional',
  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  description: '',
  experience: [],
  education: [],
  skills: [],
  interests: [],
  badges: [],
  flCredits: 0,
  verified: false,
  joinedDate: new Date().getFullYear().toString()
};

const SUGGESTED_SKILLS = [
  'Clinical Optometry',
  'Contact Lens Fitting',
  'Pediatric Eye Care',
  'Low Vision Rehabilitation',
  'Ocular Disease Management',
  'Binocular Vision',
  'Retinoscopy',
  'Glaucoma Management',
  'Myopia Control',
  'Dry Eye Treatment',
  'Neuro-Optometry',
  'Sports Vision',
];

const BIO_MAX_LENGTH = 500;

const MOCK_RESUME_DATA: ProfileData = {
  name: 'Dr. Sarah Chen',
  title: 'Senior Optometrist & Contact Lens Specialist',
  location: 'Singapore',
  type: 'professional',
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  description: 'Experienced optometrist with 8+ years in clinical practice, specializing in contact lens fitting, myopia management, and pediatric eye care. Passionate about leveraging technology to improve patient outcomes and community eye health. Active member of the Singapore Optometric Association with a focus on early intervention for myopic children.',
  experience: [
    {
      title: 'Senior Optometrist',
      company: 'Eye Care Associates',
      duration: '2020 - Present',
      location: 'Singapore',
      description: 'Providing comprehensive eye care including contact lens fitting, myopia control programs, and pediatric assessments. Managing a team of 4 optometrists and overseeing clinical protocols.'
    },
    {
      title: 'Optometrist',
      company: 'VisionPlus Clinic',
      duration: '2016 - 2020',
      location: 'Singapore',
      description: 'Conducted routine eye examinations, prescribed corrective lenses, and managed ocular disease patients. Specialized in fitting specialty contact lenses for keratoconus patients.'
    }
  ],
  education: [
    {
      degree: 'Doctor of Optometry (OD)',
      institution: 'Singapore Polytechnic',
      year: '2012 - 2016',
      details: 'Graduated with honors. Thesis on orthokeratology efficacy in myopia control for school-age children.'
    }
  ],
  skills: ['Clinical Optometry', 'Contact Lens Fitting', 'Myopia Control', 'Pediatric Eye Care', 'Ocular Disease Management', 'Orthokeratology'],
  interests: ['Myopia Research', 'Digital Eye Strain', 'Community Health', 'AI in Diagnostics'],
  badges: ['Top Contributor', 'Verified Professional'],
  flCredits: 250,
  verified: true,
  joinedDate: '2024'
};

const PARSE_STEPS = [
  { label: 'Uploading resume...', icon: 'upload' },
  { label: 'Extracting information...', icon: 'scan' },
  { label: 'Building your profile...', icon: 'build' },
  { label: 'Done! ✨', icon: 'done' }
];

export default function CreateProfile() {
  const [formData, setFormData] = useState<ProfileData>(INITIAL_DATA);
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [createMode, setCreateMode] = useState<'quick' | 'manual'>('quick');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const navigate = useNavigate();
  const { submitProfile } = useProfiles();

  useEffect(() => {
    const storedUser = localStorage.getItem('fl_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Pre-fill form data from stored user if available
      setFormData(prev => ({ 
        ...prev, 
        name: parsedUser.name || parsedUser.fullName || '',
        title: parsedUser.profession || prev.title,
        location: parsedUser.cityState || parsedUser.location || prev.location,
        membershipId: parsedUser.membershipId
      }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Auto-save simulation
  const triggerAutoSave = useCallback(() => {
    setSaveStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  }, []);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    triggerAutoSave();
  };

  // Profile completion percentage
  const completionPercent = useMemo(() => {
    let filled = 0;
    let total = 8;
    if (formData.name.trim()) filled++;
    if (formData.title.trim()) filled++;
    if (formData.location.trim()) filled++;
    if (formData.description.trim()) filled++;
    if (formData.skills.length > 0) filled++;
    if (formData.experience.length > 0) filled++;
    if (formData.education.length > 0) filled++;
    if (formData.image && formData.image !== INITIAL_DATA.image) filled++;
    return Math.round((filled / total) * 100);
  }, [formData]);

  const addSuggestedSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      triggerAutoSave();
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    triggerAutoSave();
  };

  const handleImportLinkedIn = () => {
    toast.info('Coming soon!', {
      description: 'LinkedIn import integration is under development.',
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    try {
      trackEvent({
        action: 'Profile Submission Attempt',
        details: `User ${user.name || user.fullName} submitting profile update`,
        metadata: formData
      });

      const success = await submitProfile({
        ...formData,
        membershipId: user.membershipId,
        name: user.name || user.fullName,
        status: 'review',
        submittedAt: new Date().toISOString()
      });

      if (success) {
        trackEvent({
          action: 'Profile Submission Success',
          details: `User ${user.name || user.fullName} successfully updated profile`
        });
        setSubmitSuccess(true);
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('fl_user', JSON.stringify(updatedUser));
        
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        toast.error('Failed to submit profile. Please try again later.');
        trackEvent({
          action: 'Profile Submission Error',
          details: `Failed to submit profile for ${user.name || user.fullName}`
        });
      }
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast.error('An error occurred. Please try again.');
      trackEvent({
        action: 'Profile Submission Error',
        details: `Exception during profile submission for ${user.name || user.fullName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: User },
    { id: 'about', title: 'About You', icon: Edit3 },
    { id: 'experience', title: 'Experience', icon: Briefcase },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'skills', title: 'Skills & Interests', icon: Award },
  ];

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', location: '', description: '' }]
    }));
    triggerAutoSave();
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: newExp }));
    triggerAutoSave();
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
    triggerAutoSave();
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '', details: '' }]
    }));
    triggerAutoSave();
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData(prev => ({ ...prev, education: newEdu }));
    triggerAutoSave();
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    triggerAutoSave();
  };

  const handleListInput = (field: 'skills' | 'interests', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setFormData(prev => ({ ...prev, [field]: items }));
    triggerAutoSave();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      toast.error('Invalid file type', { description: 'Please upload a PDF, DOC, or DOCX file.' });
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', { description: 'Maximum file size is 5MB.' });
      return false;
    }
    return true;
  };

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    if (validateFile(file)) {
      setResumeFile(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleParseResume = async () => {
    if (!resumeFile) return;
    setIsParsing(true);
    setParseStep(0);

    // Animate through parse steps
    await new Promise(resolve => setTimeout(resolve, 800));
    setParseStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setParseStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setParseStep(3);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Pre-fill form with mock data
    setFormData(prev => ({
      ...prev,
      name: MOCK_RESUME_DATA.name,
      title: MOCK_RESUME_DATA.title,
      location: MOCK_RESUME_DATA.location,
      description: MOCK_RESUME_DATA.description,
      experience: MOCK_RESUME_DATA.experience,
      education: MOCK_RESUME_DATA.education,
      skills: MOCK_RESUME_DATA.skills,
      interests: MOCK_RESUME_DATA.interests,
      image: MOCK_RESUME_DATA.image,
    }));

    setResumeFile(null);
    setIsParsing(false);
    setCreateMode('manual');
    setActiveStep(0);
    toast.success('Profile created from resume!', { description: 'Review and edit the extracted information below.' });
  };

  const inputDarkClass = "dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700 dark:placeholder-gray-500";

  return (
    <>
    <SEO title="Create Profile" description="Create your professional optometry profile on FocusLinks and join the global directory." keywords="create profile, professional profile, optometrist registration" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Profile Completion Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Profile Completion</span>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-gray-400">
            {completionPercent === 100
              ? "🎉 Your profile is complete! Ready to submit."
              : `Complete your profile to make a great first impression. ${100 - completionPercent}% remaining.`}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Form */}
          <div className={`w-full lg:w-1/2 space-y-6 ${viewMode === 'preview' ? 'hidden lg:block' : 'block'}`}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Your Profile</h1>
                  <p className="text-slate-500 dark:text-gray-400 text-sm">Fill in your details to build your professional presence</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Auto-save indicator */}
                  <AnimatePresence mode="wait">
                    {saveStatus === 'saving' && (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                      </motion.div>
                    )}
                    {saveStatus === 'saved' && (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400"
                      >
                        <Check className="w-3 h-3" />
                        All changes saved
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-semibold text-sm"
                  >
                    {viewMode === 'edit' ? <><Eye className="w-4 h-4" /> Preview</> : <><Edit3 className="w-4 h-4" /> Edit</>}
                  </button>
                </div>
              </div>

              {/* Mode Tabs: Quick Create / Manual Setup */}
              <div className="px-6 pt-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreateMode('quick')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    createMode === 'quick'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Quick Create
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreateMode('manual')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    createMode === 'manual'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  Manual Setup
                </motion.button>
              </div>

              {/* Progress Steps - only in manual mode */}
              {createMode === 'manual' && (
              <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between overflow-x-auto no-scrollbar">
                {steps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`flex flex-col items-center gap-1 min-w-[80px] transition-all ${activeStep === idx ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeStep === idx ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{step.title}</span>
                  </button>
                ))}
              </div>
              )}

              <div className="p-8">
                {/* Quick Create Mode */}
                {createMode === 'quick' && (
                  <motion.div
                    key="quick-create"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/40"
                      >
                        <FileText className="w-8 h-8 text-white" />
                      </motion.div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Profile from Resume</h2>
                      <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Upload your resume and we'll auto-fill your profile in seconds</p>
                    </div>

                    {/* Drag-and-drop zone */}
                    <motion.div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      animate={{
                        borderColor: isDragging ? 'rgb(59, 130, 246)' : 'rgb(226, 232, 240)',
                        backgroundColor: isDragging ? 'rgba(239, 246, 255, 0.8)' : 'rgba(248, 250, 252, 0.5)'
                      }}
                      whileHover={{ borderColor: 'rgb(147, 197, 253)' }}
                      className="relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all dark:bg-slate-900/30 dark:border-slate-700"
                      style={isDragging ? {
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(219, 234, 254, 0.3)'
                      } : undefined}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        className="hidden"
                      />
                      <motion.div
                        animate={{ y: isDragging ? -5 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${
                          isDragging
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          <Upload className={`w-7 h-7 transition-colors ${
                            isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'
                          }`} />
                        </div>
                      </motion.div>
                      <p className="text-sm font-bold text-slate-700 dark:text-gray-300 mb-1">
                        {isDragging ? 'Drop your resume here' : 'Drag & drop your resume here'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">
                        or <span className="text-blue-600 dark:text-blue-400 font-semibold">browse files</span>
                      </p>
                      <p className="text-xs text-slate-400 dark:text-gray-500 mt-3">
                        Supports PDF, DOC, DOCX — Max 5MB
                      </p>
                    </motion.div>

                    {/* Selected file display */}
                    <AnimatePresence>
                      {resumeFile && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{resumeFile.name}</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">{formatFileSize(resumeFile.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setResumeFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Create from resume button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleParseResume}
                      disabled={!resumeFile || isParsing}
                      className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-sm font-bold transition-all shadow-lg ${
                        resumeFile && !isParsing
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-blue-200 dark:shadow-blue-900/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-gray-600 cursor-not-allowed shadow-none'
                      }`}
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Create Profile from Resume
                        </>
                      )}
                    </motion.button>

                    <div className="relative flex items-center justify-center my-2">
                      <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
                      <span className="bg-white dark:bg-slate-800 px-4 text-xs text-slate-400 dark:text-gray-500 absolute font-medium">or</span>
                    </div>

                    <button
                      onClick={() => setCreateMode('manual')}
                      className="w-full text-center text-sm font-semibold text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Fill in manually instead →
                    </button>
                  </motion.div>
                )}

                {/* Manual Mode Form Steps */}
                {createMode === 'manual' && (
                <AnimatePresence mode="wait">
                  {activeStep === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Full Name</label>
                          <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. John Doe"
                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${inputDarkClass}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Professional Title</label>
                          <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Senior Optometrist"
                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${inputDarkClass}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Location</label>
                          <input 
                            type="text" 
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g. London, UK"
                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${inputDarkClass}`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Member Type</label>
                          <select 
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white ${inputDarkClass}`}
                          >
                            <option value="professional">Professional</option>
                            <option value="student">Student</option>
                            <option value="association">Organization</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Profile Image URL</label>
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="https://images.unsplash.com/..."
                            className={`flex-grow px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${inputDarkClass}`}
                          />
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }} />
                          </div>
                        </div>
                      </div>

                      {/* Resume upload shortcut */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-100 dark:border-blue-800/50">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Or upload your resume to auto-fill</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400">We'll extract your details automatically</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setCreateMode('quick');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm flex-shrink-0"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Bio / About You</label>
                          <span className={`text-xs font-medium ${formData.description.length > BIO_MAX_LENGTH ? 'text-red-500' : 'text-slate-400 dark:text-gray-500'}`}>
                            {formData.description.length}/{BIO_MAX_LENGTH}
                          </span>
                        </div>
                        <textarea 
                          name="description"
                          value={formData.description}
                          onChange={(e) => {
                            if (e.target.value.length <= BIO_MAX_LENGTH) {
                              handleInputChange(e);
                            }
                          }}
                          rows={6}
                          placeholder="Tell the community about your background, goals, and expertise..."
                          className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none ${inputDarkClass}`}
                        />
                        {/* Character count bar */}
                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((formData.description.length / BIO_MAX_LENGTH) * 100, 100)}%` }}
                            transition={{ duration: 0.2 }}
                            className={`h-full rounded-full transition-colors ${
                              formData.description.length >= BIO_MAX_LENGTH
                                ? 'bg-red-500'
                                : formData.description.length >= BIO_MAX_LENGTH * 0.8
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Work Experience</h3>
                        <button 
                          onClick={addExperience}
                          className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Plus className="w-4 h-4" /> Add Experience
                        </button>
                      </div>
                      
                      {formData.experience.map((exp, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 relative group">
                          <button 
                            onClick={() => removeExperience(idx)}
                            className="absolute top-4 right-4 p-2 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                              placeholder="Job Title"
                              value={exp.title}
                              onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                            <input 
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                            <input 
                              placeholder="Duration (e.g. 2020 - Present)"
                              value={exp.duration}
                              onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                            <input 
                              placeholder="Location"
                              value={exp.location}
                              onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                            <textarea 
                              placeholder="Description"
                              value={exp.description}
                              onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                              className={`col-span-1 md:col-span-2 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none ${inputDarkClass}`}
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                      {formData.experience.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                          <Briefcase className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-slate-500 dark:text-gray-400">No experience added yet.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Education</h3>
                        <button 
                          onClick={addEducation}
                          className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          <Plus className="w-4 h-4" /> Add Education
                        </button>
                      </div>
                      
                      {formData.education.map((edu, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 relative group">
                          <button 
                            onClick={() => removeEducation(idx)}
                            className="absolute top-4 right-4 p-2 text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                              placeholder="Degree / Course"
                              value={edu.degree}
                              onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                            <input 
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                            <input 
                              placeholder="Year (e.g. 2018 - 2022)"
                              value={edu.year}
                              onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                            <input 
                              placeholder="Additional Details"
                              value={edu.details}
                              onChange={(e) => updateEducation(idx, 'details', e.target.value)}
                              className={`px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                            />
                          </div>
                        </div>
                      ))}
                      {formData.education.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                          <GraduationCap className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
                          <p className="text-slate-500 dark:text-gray-400">No education added yet.</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Import from LinkedIn */}
                      <motion.button
                        type="button"
                        onClick={handleImportLinkedIn}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Import from LinkedIn
                      </motion.button>

                      {/* Suggested Skills */}
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Suggested Skills</label>
                        <p className="text-xs text-slate-400 dark:text-gray-500">Click to add optometry-related skills</p>
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTED_SKILLS.map((skill) => {
                            const isAdded = formData.skills.includes(skill);
                            return (
                              <motion.button
                                key={skill}
                                type="button"
                                onClick={() => isAdded ? removeSkill(skill) : addSuggestedSkill(skill)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                              >
                                {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {skill}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Current skills */}
                      {formData.skills.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Your Skills ({formData.skills.length})</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skills.map((skill, i) => (
                              <motion.span
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Add Custom Skills (comma separated)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Clinical Optometry, Contact Lenses, Research"
                          onChange={(e) => handleListInput('skills', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-gray-300">Interests (comma separated)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. AI in Healthcare, Public Health, Photography"
                          onChange={(e) => handleListInput('interests', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none ${inputDarkClass}`}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.interests.map((interest, i) => (
                            <span key={i} className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-bold">{interest}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                )}

                {/* Navigation buttons - only in manual mode */}
                {createMode === 'manual' && (
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous
                  </button>
                  {activeStep < steps.length - 1 ? (
                    <button
                      onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                      className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all"
                    >
                      Next Step <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting || submitSuccess}
                      whileHover={!isSubmitting && !submitSuccess ? { scale: 1.02 } : undefined}
                      whileTap={!isSubmitting && !submitSuccess ? { scale: 0.98 } : undefined}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg ${
                        submitSuccess
                          ? 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-emerald-900/30'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 dark:shadow-emerald-900/30'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {submitSuccess ? (
                          <motion.span
                            key="success"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Profile Submitted!
                          </motion.span>
                        ) : isSubmitting ? (
                          <motion.span
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                          </motion.span>
                        ) : (
                          <motion.span
                            key="submit"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Submit for Review
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )}
                </div>
                )}
              </div>
            </div>

            {/* Parsing Overlay Modal */}
            <AnimatePresence>
              {isParsing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="mx-4 w-full max-w-md rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8"
                  >
                    {/* Animated spinner */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-6">
                      Creating your profile...
                    </h3>

                    {/* Step indicators */}
                    <div className="space-y-3">
                      {PARSE_STEPS.map((step, idx) => (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            idx < parseStep
                              ? 'bg-emerald-50 dark:bg-emerald-900/20'
                              : idx === parseStep
                              ? 'bg-blue-50 dark:bg-blue-900/20'
                              : 'bg-slate-50 dark:bg-slate-900/50 opacity-50'
                          }`}
                        >
                          {idx < parseStep ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </motion.div>
                          ) : idx === parseStep ? (
                            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            idx < parseStep
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : idx === parseStep
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-slate-400 dark:text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${((parseStep + 1) / PARSE_STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Live Preview */}
          <div className={`w-full lg:w-1/2 ${viewMode === 'edit' ? 'hidden lg:block' : 'block'}`}>
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Live Preview
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Real-time Sync</span>
                </div>
              </div>

              {/* Profile Preview Card */}
              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[80vh] overflow-y-auto no-scrollbar">
                {/* Cover Photo */}
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')]"></div>
                </div>

                <div className="px-6 -mt-12 relative z-10">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="relative shrink-0">
                        {!formData.image || formData.image === 'none' ? (
                          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md">
                            <User className="w-12 h-12 text-slate-400 dark:text-gray-500" />
                          </div>
                        ) : (
                          <img 
                            src={formData.image} 
                            alt="Avatar" 
                            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-700"
                          />
                        )}
                        {formData.verified && (
                          <BadgeCheck className="absolute bottom-1 right-1 w-6 h-6 text-blue-500 bg-white dark:bg-slate-800 rounded-full" fill="currentColor" stroke="white" />
                        )}
                      </div>
                      <div className="flex-grow pt-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formData.name || 'Your Name'}</h3>
                        <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-3">{formData.title || 'Professional Title'}</p>
                        <div className="flex flex-wrap gap-3 text-slate-500 dark:text-gray-400 text-xs font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {formData.location || 'Location'}</span>
                          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {formData.type}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {formData.joinedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-8">
                        <section>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            About
                          </h4>
                          <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                            {formData.description || 'Your bio will appear here...'}
                          </p>
                        </section>

                        <section>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                              <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            Experience
                          </h4>
                          <div className="space-y-4">
                            {formData.experience.length > 0 ? formData.experience.map((exp, i) => (
                              <div key={i} className="relative pl-6 border-l border-slate-100 dark:border-slate-700">
                                <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-indigo-500"></div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{exp.title || 'Position'}</h5>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{exp.company || 'Company'}</p>
                                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">{exp.duration} • {exp.location}</p>
                                <p className="text-xs text-slate-600 dark:text-gray-400 mt-2">{exp.description}</p>
                              </div>
                            )) : (
                              <p className="text-slate-400 dark:text-gray-500 text-xs italic">No experience added.</p>
                            )}
                          </div>
                        </section>

                        <section>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <GraduationCap className="w-3.5 h-3.5" />
                            </div>
                            Education
                          </h4>
                          <div className="space-y-4">
                            {formData.education.length > 0 ? formData.education.map((edu, i) => (
                              <div key={i} className="relative pl-6 border-l border-slate-100 dark:border-slate-700">
                                <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-emerald-500"></div>
                                <h5 className="text-sm font-bold text-slate-900 dark:text-white">{edu.degree || 'Degree'}</h5>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{edu.institution || 'Institution'}</p>
                                <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">{edu.year}</p>
                              </div>
                            )) : (
                              <p className="text-slate-400 dark:text-gray-500 text-xs italic">No education added.</p>
                            )}
                          </div>
                        </section>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Contact Info</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
                              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" /> Email
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
                              <Linkedin className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" /> LinkedIn
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
                              <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" /> Website
                            </div>
                          </div>
                        </div>

                        {formData.skills.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {formData.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-gray-300">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.interests.length > 0 && (
                          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Interests</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {formData.interests.map((interest, i) => (
                                <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-700 dark:text-gray-300">{interest}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-12"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
