'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Target, Globe, Award, Send, CheckCircle2, User, Briefcase, Check } from 'lucide-react';
import SEO from '../components/SEO';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Professional', icon: Briefcase },
  { label: 'Submit', icon: Send },
];

const CHAR_LIMIT = 500;

function SkeletonRow({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-xl bg-gray-200 dark:bg-slate-700 ${className}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-16 space-y-4">
          <SkeletonRow className="h-12 w-[70%] mx-auto" />
          <SkeletonRow className="h-6 w-[50%] mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left column skeleton */}
          <div className="md:col-span-5 space-y-10">
            <div className="space-y-4">
              <SkeletonRow className="h-8 w-40" />
              <SkeletonRow className="h-5 w-full" />
              <SkeletonRow className="h-5 w-[80%]" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <SkeletonRow className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <SkeletonRow className="h-5 w-32" />
                    <SkeletonRow className="h-4 w-full" />
                    <SkeletonRow className="h-4 w-[60%]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right column skeleton */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-8 sm:p-10 space-y-6">
              <SkeletonRow className="h-8 w-52" />
              <SkeletonRow className="h-4 w-full" />
              <SkeletonRow className="h-4 w-[70%]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SkeletonRow className="h-12 w-full" />
                <SkeletonRow className="h-12 w-full" />
              </div>
              <SkeletonRow className="h-12 w-full" />
              <SkeletonRow className="h-12 w-full" />
              <SkeletonRow className="h-12 w-full" />
              <SkeletonRow className="h-24 w-full" />
              <SkeletonRow className="h-24 w-full" />
              <SkeletonRow className="h-14 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-slate-700'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                Step {idx + 1}
              </span>
              <span
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                  idx < currentStep ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TeamApplication() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);
  const [contributionCount, setContributionCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const updateStepFromFields = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: 'team_application',
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      position: formData.get('position'),
      linkedin: formData.get('linkedin'),
      whyJoin: formData.get('whyJoin'),
      role: formData.get('role'),
      skills: formData.get('skills'),
      contribution: formData.get('contribution'),
    };

    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: 'Application Submitted!',
          description: 'Thank you for applying to join the FocusLinks team. We will review your application shortly.',
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: 'Something went wrong. Please try again later.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Network Error',
        description: 'Unable to connect. Please check your internet and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
    <SEO title="Join Our Team" description="Apply to join the FocusLinks team." keywords="join team, careers, volunteer" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header*/}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Let&apos;s Build the Future of Eye Care, Together
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We are a passionate, non-commercial team building the world&apos;s largest digital community for eye care. This is a volunteer opportunity to make a global impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Column: Info */}
          <div className="md:col-span-5 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Why Join Us?</h2>
              <p className="text-slate-600 dark:text-gray-400 mb-6">
                This is more than a volunteer role. It&apos;s a chance to lead, innovate, and grow.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Target className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gain Real Experience</h3>
                    <p className="mt-1 text-slate-600 dark:text-gray-400 text-sm leading-relaxed">Lead projects, manage teams, and build a portfolio that showcases your skills to a global audience.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expand Your Network</h3>
                    <p className="mt-1 text-slate-600 dark:text-gray-400 text-sm leading-relaxed">Connect with industry leaders, educators, and peers from around the world.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Globe className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Make a Global Impact</h3>
                    <p className="mt-1 text-slate-600 dark:text-gray-400 text-sm leading-relaxed">Your contributions will directly help thousands of students and professionals advance their careers.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Official Recognition</h3>
                    <p className="mt-1 text-slate-600 dark:text-gray-400 text-sm leading-relaxed">Receive a verified badge on your profile and a virtual ID card to share your professional role.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Open Volunteer Roles</h3>
              <ul className="space-y-3">
                {[
                  'Regional Leader / Ambassador',
                  'National Head',
                  'College Ambassador',
                  'Event Coordinator',
                  'Job Board Curator',
                  'Clinical Content Creator',
                  'Tech Contributor (Web/AI/App)',
                  'Community & Social Media Roles',
                ].map((role, idx) => (
                  <li key={idx} className="flex items-center text-sm text-slate-600 dark:text-gray-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-8 sm:p-10">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Volunteer Application</h2>
                <p className="text-slate-500 dark:text-gray-400 text-sm mb-6">
                  This is a volunteer, non-commercial team. We are driven by passion, not profit. Fill out the form below to join us. Limited seats are available.
                </p>

                {isSubmitted ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Application Received!</h3>
                    <p className="text-slate-600 dark:text-gray-400">
                      Thank you for your interest in joining Focus Links. Our team will review your application and get back to you soon.
                    </p>
                  </div>
                ) : (
                  <>
                    <StepIndicator currentStep={currentStep} />
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Step 1: Personal */}
                      <fieldset className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              required
                              onFocus={() => updateStepFromFields(0)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              required
                              onFocus={() => updateStepFromFields(0)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="position" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            Current Position
                          </label>
                          <input
                            type="text"
                            id="position"
                            name="position"
                            placeholder="e.g., Optometry Student, Optometrist"
                            required
                            onFocus={() => updateStepFromFields(0)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label htmlFor="linkedin" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            LinkedIn Profile (Optional)
                          </label>
                          <input
                            type="url"
                            id="linkedin"
                            name="linkedin"
                            placeholder="e.g., linkedin.com/in/your-profile"
                            onFocus={() => updateStepFromFields(0)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          />
                        </div>
                      </fieldset>

                      {/* Step 2: Professional */}
                      <fieldset className="space-y-6">
                        <div>
                          <label htmlFor="resume" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            Resume/CV
                          </label>
                          <input
                            type="file"
                            id="resume"
                            onFocus={() => updateStepFromFields(1)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                          />
                        </div>

                        <div>
                          <label htmlFor="role" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            Preferred Role
                          </label>
                          <select
                            id="role"
                            name="role"
                            required
                            onFocus={() => updateStepFromFields(1)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="">Select a role you&apos;re interested in...</option>
                            <option value="regional">Regional Leader / Ambassador</option>
                            <option value="national">National Head</option>
                            <option value="college">College Ambassador</option>
                            <option value="event">Event Coordinator</option>
                            <option value="job">Job Board Curator</option>
                            <option value="content">Clinical Content Creator</option>
                            <option value="tech">Tech Contributor (Web/AI/App)</option>
                            <option value="social">Community & Social Media Roles</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="skills" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            Your Skills &amp; Experience
                          </label>
                          <textarea
                            id="skills"
                            name="skills"
                            rows={3}
                            maxLength={CHAR_LIMIT}
                            placeholder="Tell us what you're great at (e.g., content writing, social media, React, clinical research)."
                            required
                            onFocus={() => updateStepFromFields(1)}
                            onChange={(e) => setSkillsCount(e.target.value.length)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                          />
                          <p className={`text-xs mt-1.5 text-right font-medium ${skillsCount > CHAR_LIMIT * 0.9 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {skillsCount}/{CHAR_LIMIT}
                          </p>
                        </div>

                        <div>
                          <label htmlFor="contribution" className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                            How would you like to contribute?
                          </label>
                          <textarea
                            id="contribution"
                            name="contribution"
                            rows={3}
                            maxLength={CHAR_LIMIT}
                            placeholder="Share your ideas and how you envision yourself helping our mission."
                            required
                            onFocus={() => updateStepFromFields(2)}
                            onChange={(e) => setContributionCount(e.target.value.length)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                          />
                          <p className={`text-xs mt-1.5 text-right font-medium ${contributionCount > CHAR_LIMIT * 0.9 ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {contributionCount}/{CHAR_LIMIT}
                          </p>
                        </div>
                      </fieldset>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        onClick={() => updateStepFromFields(2)}
                        className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center group focus-ring"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </span>
                        ) : (
                          <>
                            Submit Application
                            <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
