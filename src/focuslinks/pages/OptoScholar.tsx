'use client';
import { useState } from 'react';
import { Link } from '../../context/NavigationContext';
import { Search, ArrowLeft, Lock, ChevronRight, GraduationCap, Stethoscope, Microscope, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function OptoScholar() {
  const [isWaitlistSubmitted, setIsWaitlistSubmitted] = useState(false);
  const [isAccessSubmitted, setIsAccessSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlist = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'optoscholar_waitlist' })
      });
      if (response.ok) setIsWaitlistSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'optoscholar_access',
          email: formData.get('email'),
          code: formData.get('code')
        })
      });
      if (response.ok) setIsAccessSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="OptoScholar | Research Tool" description="Search and explore optometry research papers with an AI-powered literature search tool." keywords="optoscholar, optometry research, academic search, vision science" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/labs" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-blue-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Labs
        </Link>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm mb-16">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6 w-fit">
                <Search className="w-3.5 h-3.5 mr-1.5" /> Research Engine
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                Opto<span className="text-blue-600">Scholar</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-gray-400 mb-4 leading-relaxed">
                The specialized clinical search engine for optometry and ophthalmology. Access over 1 million indexed articles, curated for students, clinicians, and researchers.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-8 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 w-fit">
                <CheckCircle2 className="w-5 h-5" />
                <span>Live on OptoScholor.focuslinks.in</span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center mb-4">
                  <Lock className="w-5 h-5 mr-2 text-slate-400 dark:text-gray-500" /> OptoScholar Access
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">The tool is now live. I will visit it to explore the latest research.</p>
                
                <div className="space-y-4">
                  {isWaitlistSubmitted ? (
                    <div className="w-full py-3 px-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Joined Waitlist
                    </div>
                  ) : (
                    <button 
                      onClick={handleWaitlist}
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                    >
                      {isSubmitting ? 'Processing...' : 'Join Waitlist'}
                    </button>
                  )}
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-gray-400">Already have a code?</span>
                    </div>
                  </div>

                  {isAccessSubmitted ? (
                    <div className="w-full py-3 px-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Code Submitted
                    </div>
                  ) : (
                    <form className="space-y-3" onSubmit={handleAccess}>
                      <input type="email" name="email" required placeholder="Your Email Address" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                      <input type="text" name="code" required placeholder="Your Access Code" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        {isSubmitting ? 'Verifying...' : 'Access Tool'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 dark:bg-slate-950 p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-6">Why a Specialized Research Engine?</h2>
                <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                  General academic search engines are powerful but often diluted with non-clinical data. OptoScholar is built to eliminate noise and accelerate precision.
                </p>
                
                <h3 className="text-xl font-semibold mb-4 text-blue-200">Structured specifically for:</h3>
                <ul className="space-y-3">
                  {[
                    "Clinical optometry research",
                    "Ophthalmic disease management",
                    "Evidence-based practice",
                    "Vision science literature",
                    "Cornea & contact lenses",
                    "Retina and vitreous",
                    "Glaucoma management",
                    "Pediatrics & binocular vision",
                    "Low vision rehabilitation"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-slate-300">
                      <ChevronRight className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Who Is OptoScholar Built For?</h2>
            <p className="text-lg text-slate-600 dark:text-gray-400">Designed to meet the unique needs of every eye-care professional.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Optometry Students</h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                Exam prep, thesis literature review, case study referencing, and clinical assignment research.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Practicing Clinicians</h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                Chair-side condition lookup, drug interaction review, updated management protocols, and rare case reference.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Microscope className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Researchers & Academics</h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                Citation tracking, impact-based filtering, comprehensive literature reviews, and export-ready references.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
