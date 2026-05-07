'use client';
import React from 'react';
import { Link } from '../../context/NavigationContext';
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Target, 
  FileText, 
  ExternalLink,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function AcademyCourse() {
  const [activeTab, setActiveTab] = React.useState('overview');

  const modules = [
    {
      id: 1,
      title: "THE IDENTITY CRISIS BEHIND THE PHOROPTER",
      description: "Analyze the professional identity gap. Understand the public perception problem and learn to reframe your identity beyond the phoropter.",
      duration: "15 Minutes"
    },
    {
      id: 2,
      title: "THE INVISIBLE PROFESSION PROBLEM",
      description: "Deconstruct why optometry is often invisible. Learn to differentiate your role from opticians and ophthalmologists to control your professional narrative.",
      duration: "15 Minutes"
    },
    {
      id: 3,
      title: "BUILDING PROFESSIONAL AUTHORITY",
      description: "Authority is built, not given. Master the Authority Triangle and learn to turn routine exams into demonstrations of clinical expertise.",
      duration: "15 Minutes"
    },
    {
      id: 4,
      title: "VISIBILITY STRATEGY FOR OPTOMETRISTS",
      description: "Implement a sustainable visibility strategy. Learn personal branding and community positioning without needing to become a \"social influencer.\"",
      duration: "15 Minutes"
    }
  ];

  const outcomes = [
    {
      title: "Understand the \"Optometrist Identity Gap\"",
      desc: "Recognize why public perception of optometry often fails to reflect the true clinical expertise of the profession."
    },
    {
      title: "Articulate the Real Scope of Optometry",
      desc: "Confidently explain the diagnostic, clinical, and medical responsibilities of optometrists beyond refraction and spectacles."
    },
    {
      title: "Improve Professional Communication",
      desc: "Develop clear and compelling ways to describe their role to patients, colleagues, and the public."
    },
    {
      title: "Build Professional Visibility",
      desc: "Learn strategies to position themselves as healthcare professionals rather than technical service providers."
    },
    {
      title: "Strengthen Professional Confidence",
      desc: "Replace passive professional identity with intentional professional positioning."
    },
    {
      title: "Contribute to the Reputation of the Profession",
      desc: "Understand how individual optometrists collectively shape how the profession is perceived."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 relative">
      {/* Locked Content - Blurred */}
      <div className="blur-[8px] select-none pointer-events-none">
      <SEO title="Beyond the Phoropter | FocusLinks" description="Masterclass by FocusLinks Academy — advancing optometric clinical skills beyond traditional refraction techniques." keywords="beyond the phoropter, optometry masterclass, clinical optometry, refraction techniques" />
      {/* Hero Section */}
      <section className="bg-slate-900 py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                MASTERCLASS
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                Beyond the Phoropter: <br />
                <span className="text-blue-400 text-3xl lg:text-4xl">Redefining the Role of the Modern Optometrist</span>
              </h1>
              <p className="text-xl text-slate-300 dark:text-gray-600 mb-8 leading-relaxed">
                Professional Identity & Visibility for Optometrists. A masterclass on clinical authority and positioning.
              </p>
              
              <div className="flex flex-wrap gap-6 mb-10">
                <div className="flex items-center gap-3 text-slate-300 dark:text-gray-600">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="font-bold">1 Hour</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 dark:text-gray-600">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="font-bold">Advanced Level</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 dark:text-gray-600">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">Professional Certification</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://meet.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group"
                >
                  Attend Masterclass <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </a>
                <button className="px-8 py-4 bg-white/10 dark:bg-slate-900/10 text-white border border-white/20 rounded-2xl font-black text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                  Download Syllabus
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Certificate Preview */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-xl">F</span>
                      </div>
                      <div className="leading-none">
                        <p className="font-black text-lg tracking-tight text-slate-900 dark:text-white">Academy</p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-widest">focuslinks.in</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Official Credential</p>
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center ml-auto">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Certificate of Completion</h4>
                    <p className="text-slate-500 dark:text-gray-400 text-sm font-medium">Awarded To</p>
                    <div className="mt-4 py-2 border-b-2 border-slate-100 dark:border-slate-800">
                      <p className="text-3xl font-serif italic text-slate-800 dark:text-gray-200">Verified Professional</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-center text-slate-600 dark:text-gray-400 text-sm leading-relaxed">
                      For demonstrating expertise and completing the masterclass:
                    </p>
                    <p className="text-center text-lg font-bold text-slate-900 dark:text-white">
                      Beyond the Phoropter: <br />
                      Redefining the Role of the Modern Optometrist
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">April 12, 2026</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">Authority</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Focuslinks Academy</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">ID</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">FL-2026-OPT-151</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-3xl shadow-2xl shadow-blue-600/30 rotate-6">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">ACADEMY ACCESS</p>
                <p className="text-xl font-black">Reclaim your identity.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex gap-8 border-b border-slate-100 dark:border-slate-800 mb-8 overflow-x-auto hide-scrollbar">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600'}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab('curriculum')}
                    className={`pb-4 font-bold transition-all whitespace-nowrap ${activeTab === 'curriculum' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600'}`}
                  >
                    Curriculum
                  </button>
                  <button 
                    onClick={() => setActiveTab('outcomes')}
                    className={`pb-4 font-bold transition-all whitespace-nowrap ${activeTab === 'outcomes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 dark:text-gray-500 hover:text-slate-600'}`}
                  >
                    Outcomes
                  </button>
                </div>

                <div className="prose prose-slate max-w-none">
                  {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Webinar Overview</h3>
                      <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                        “Beyond the Phoropter” is a professional development webinar designed specifically for optometrists and optometry students who feel their role is misunderstood, undervalued, or poorly represented in public perception.
                      </p>
                      <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                        Despite years of rigorous training in ocular health, optics, and clinical diagnosis, many optometrists find their expertise reduced to a simplistic stereotype: “the person who prescribes glasses.”
                      </p>
                      <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed mb-6">
                        This webinar explores the deeper reason behind that perception and provides practical strategies to help optometrists reclaim their professional identity, communicate their expertise clearly, and build stronger credibility in both clinical and public environments.
                      </p>
                      <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed mb-8">
                        Through four focused modules, participants will learn how professional visibility, communication, and positioning shape how the profession is perceived — and how to actively influence that perception.
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-6 mt-12">
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <Target className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white mb-2">Strategic Objective</h4>
                          <p className="text-sm text-slate-600 dark:text-gray-400">Transform clinical expertise into professional authority and clear identity.</p>
                        </div>
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <h4 className="font-black text-slate-900 dark:text-white mb-2">Clinical Evidence</h4>
                          <p className="text-sm text-slate-600 dark:text-gray-400">Built on real-world clinical data and professional positioning research.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'curriculum' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Course Curriculum</h3>
                      <div className="space-y-6">
                        {modules.map((module) => (
                          <div key={module.id} className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-200 hover:bg-white dark:hover:bg-slate-800 transition-all">
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Module {module.id}</span>
                              <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-500 text-xs font-bold">
                                <Clock className="w-3.5 h-3.5" /> {module.duration}
                              </div>
                            </div>
                            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{module.title}</h4>
                            <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{module.description}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'outcomes' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">Learning Outcomes</h3>
                      <p className="text-slate-600 dark:text-gray-400 mb-8">By the end of this webinar, participants will be able to:</p>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {outcomes.map((outcome, idx) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white mb-1">{outcome.title}</h4>
                              <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{outcome.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6">Academy Portal</h4>
                <div className="space-y-4">
                  <Link to="/directory" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 transition-all group">
                    <span className="font-bold text-slate-700 dark:text-gray-300 group-hover:text-blue-600">Member Directory</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-500 group-hover:text-blue-600" />
                  </Link>
                  <Link to="/dashboard" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 transition-all group">
                    <span className="font-bold text-slate-700 dark:text-gray-300 group-hover:text-blue-600">My Dashboard</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 text-slate-400 dark:text-gray-500 group-hover:text-blue-600" />
                  </Link>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                <h4 className="text-xl font-black mb-4">Rate this Masterclass</h4>
                <p className="text-slate-400 dark:text-gray-500 text-sm mb-6">Verify your Membership ID to provide feedback and earn FL Credits.</p>
                <button className="w-full py-4 bg-white/10 dark:bg-slate-900/10 hover:bg-white/20 border border-white/20 rounded-2xl font-bold transition-all">
                  Verify ID to provide feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Locked Content */}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px]">
        <div className="text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">Coming Soon</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm max-w-md mx-auto">Academy access is currently restricted. Stay tuned for updates!</p>
        </div>
      </div>
    </div>
  );
}
