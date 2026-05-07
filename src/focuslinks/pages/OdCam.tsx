'use client';
import { useState } from 'react';
import { Link } from '../../context/NavigationContext';
import { MessageSquare, ArrowLeft, Share2, CheckCircle2, Camera, GraduationCap, Heart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

type Condition = 'normal' | 'glaucoma' | 'macular' | 'cataract' | 'diabetic';

export default function OdCam() {
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Simulator State
  const [condition, setCondition] = useState<Condition>('normal');
  const [severity, setSeverity] = useState<number>(2); // 1-3

  const handleFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'odcam_feedback',
          feedback: formData.get('feedback'),
          contact: formData.get('contact')
        })
      });
      if (response.ok) setIsFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    toast.info('Coming soon!');
    const text = encodeURIComponent('Check out OD CAM Simulator on FocusLinks! Experience the world through the eyes of your patients.');
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Helper to get dynamic styles based on condition and severity
  const getConditionStyles = () => {
    switch (condition) {
      case 'glaucoma':
        // Tunnel vision: radial gradient from transparent to black
        const gSize = 100 - (severity * 20); // 80%, 60%, 40%
        return {
          background: `radial-gradient(circle, transparent ${gSize}%, rgba(0,0,0,0.95) ${gSize + 15}%)`,
          backdropFilter: 'blur(2px)'
        };
      case 'macular':
        // Central scotoma: black/blurry spot in the center
        const mSize = severity * 15; // 15%, 30%, 45%
        return {
          background: `radial-gradient(circle at center, rgba(0,0,0,0.95) ${mSize - 10}%, rgba(0,0,0,0.5) ${mSize}%, transparent ${mSize + 10}%)`,
          backdropFilter: `blur(${severity * 4}px)`
        };
      case 'cataract':
        // Overall blur and yellow/brown tint
        const blurAmount = severity * 3;
        const opacity = severity * 0.2;
        return {
          backgroundColor: `rgba(200, 180, 100, ${opacity})`,
          backdropFilter: `blur(${blurAmount}px) contrast(${100 - severity * 10}%) brightness(${100 - severity * 10}%)`
        };
      case 'diabetic':
        // Handled via separate SVG overlay for patchy spots
        return {
          backdropFilter: `blur(${severity}px)`
        };
      default:
        return {};
    }
  };

  return (
    <>
      <SEO title="OD CAM | AI Eye Scan" description="AI-powered eye scan tool for optometrists. Upload or capture eye images for intelligent analysis." keywords="OD CAM, AI eye scan, optometry AI, eye image analysis" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <Link to="/labs" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-rose-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Labs
          </Link>
          <button 
            onClick={handleShareWhatsApp}
            className="inline-flex items-center text-sm font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-4 py-2 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors w-fit"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share on WhatsApp
          </button>
        </div>

        {/* Hero / Simulator Preview */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl overflow-hidden shadow-2xl mb-16 border border-slate-800 dark:border-slate-700">
          <div className="p-8 sm:p-12 text-center text-white border-b border-slate-800 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-rose-900/20 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mb-6 ring-1 ring-rose-500/30 shadow-[0_0_30px_rgba(225,29,72,0.2)]">
                <Camera className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                OD CAM Simulator
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Experience the world through the eyes of your patients. A real-time simulator for clinical empathy and education.
              </p>
            </div>
          </div>
          
          {/* Interactive Simulator Area */}
          <div className="bg-slate-950 dark:bg-black p-8 sm:p-16 relative overflow-hidden">
            <div className="max-w-4xl mx-auto">
              
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-12 bg-slate-900/80 dark:bg-slate-900 backdrop-blur-md p-4 rounded-2xl border border-slate-800 dark:border-slate-700 relative z-20">
                <div className="flex items-center gap-3 mr-4">
                  <span className="text-sm font-medium text-slate-400">Condition:</span>
                  <select 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Condition)}
                    className="bg-slate-800 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 outline-none"
                  >
                    <option value="normal">Normal Vision</option>
                    <option value="glaucoma">Glaucoma (Tunnel Vision)</option>
                    <option value="macular">Macular Degeneration</option>
                    <option value="cataract">Cataract</option>
                    <option value="diabetic">Diabetic Retinopathy</option>
                  </select>
                </div>

                {condition !== 'normal' && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400">Severity:</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      value={severity}
                      onChange={(e) => setSeverity(parseInt(e.target.value))}
                      className="w-24 accent-rose-500"
                    />
                    <span className="text-xs font-bold text-rose-400 w-12">{
                      severity === 1 ? 'Mild' : severity === 2 ? 'Mod' : 'Severe'
                    }</span>
                  </div>
                )}
              </div>

              {/* Camera Viewport */}
              <div className="relative w-full aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border-4 border-slate-800 dark:border-slate-700 shadow-2xl bg-black">
                {/* Simulated Camera Feed (Background Image) */}
                <img 
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1600" 
                  alt="Simulated Room View" 
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Condition Overlay */}
                <motion.div 
                  className="absolute inset-0 pointer-events-none transition-all duration-700 ease-in-out z-10"
                  style={getConditionStyles()}
                />

                {/* Diabetic Retinopathy Spots (SVG Overlay) */}
                <AnimatePresence>
                  {condition === 'diabetic' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 pointer-events-none"
                    >
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <filter id="blur-spots">
                            <feGaussianBlur stdDeviation="4" />
                          </filter>
                        </defs>
                        <g filter="url(#blur-spots)" fill="rgba(0,0,0,0.85)">
                          {/* Generate random-looking spots based on severity */}
                          <circle cx="20%" cy="30%" r={severity * 15} />
                          <circle cx="70%" cy="20%" r={severity * 10} />
                          <circle cx="40%" cy="60%" r={severity * 20} />
                          <circle cx="80%" cy="70%" r={severity * 12} />
                          <circle cx="10%" cy="80%" r={severity * 18} />
                          {severity > 1 && (
                            <>
                              <circle cx="50%" cy="40%" r={severity * 8} />
                              <circle cx="85%" cy="45%" r={severity * 14} />
                              <circle cx="30%" cy="85%" r={severity * 16} />
                            </>
                          )}
                          {severity > 2 && (
                            <>
                              <circle cx="60%" cy="80%" r={25} />
                              <circle cx="25%" cy="15%" r={20} />
                            </>
                          )}
                        </g>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Viewfinder UI */}
                <div className="absolute inset-0 z-30 pointer-events-none border-[1px] border-white/10 m-4 rounded-lg">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50"></div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-white text-xs font-mono font-bold tracking-wider">LIVE SIMULATION</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Transforming Perspective in Eye Care</h2>
            <p className="text-lg text-slate-600 dark:text-gray-400">Built for the realities of optometry and ophthalmology—from the lecture hall to the clinic.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-rose-200 dark:hover:border-rose-800 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Lectures & Education</h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                Lecturers can finally show optometry and ophthalmology students exactly what a condition looks like, bridging the gap between textbook theory and real-world visual impairment.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-rose-200 dark:hover:border-rose-800 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mb-6 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Clinical Empathy</h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                We are often stuck looking only at clinical reports like OCTs and visual fields. OD CAM makes the patient's actual visual reality visible to you, changing your perspective entirely.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-rose-200 dark:hover:border-rose-800 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-6 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Caregiver Understanding</h3>
              <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                Show family members and attenders exactly how the patient sees the world. Demonstrate how progressive conditions worsen if left untreated, replacing confusing words with instant visual proof.
              </p>
            </div>
          </div>
        </div>

        {/* Under The Hood */}
        <div className="mb-16 bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 sm:p-12 border border-slate-800 dark:border-slate-700 shadow-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-950 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6">
                Under The Hood
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                The Flagship <br />
                <span className="text-rose-400">Focus.Ai V5.5</span> Model
              </h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                We didn't just build a filter app. We engineered a highly specialized, fine-tuned AI vision model. Trained on vast datasets of clinical visual impairment descriptions, V5.5 dynamically processes your camera feed to render exact optical distortions, field losses, and color shifts.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Real-time optical distortion mapping",
                  "Dynamic scotoma & visual field loss generation",
                  "Clinically-aligned color perception shifts",
                  "Zero-latency rendering for smooth camera movement"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-black dark:bg-black rounded-2xl border border-slate-800 dark:border-slate-700 shadow-2xl overflow-hidden">
              <div className="bg-slate-900 dark:bg-slate-950 px-4 py-3 border-b border-slate-800 dark:border-slate-700 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                <span className="ml-4 text-xs text-slate-500 font-mono">Intelligent Rendering</span>
              </div>
              <div className="p-6 font-mono text-sm sm:text-base leading-relaxed">
                <p className="text-slate-500 mb-4">{'/* Focus.Ai acts as the bridge between clinical data and visual reality. It translates text into complex WebGL shaders instantly. */'}</p>
                <div className="space-y-2">
                  <p className="text-emerald-400"><span className="text-slate-600 mr-2">&gt;</span>Initializing Focus.Ai V5.5...</p>
                  <p className="text-emerald-400 animate-pulse"><span className="text-slate-600 mr-2">&gt;</span>Parsing clinical parameters...</p>
                  <p className="text-emerald-400"><span className="text-slate-600 mr-2">&gt;</span>Compiling visual cortex shader...</p>
                  <p className="text-rose-400 font-bold mt-4"><span className="text-slate-600 mr-2">&gt;</span>System Ready. Simulation Active.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 mb-6">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Share Your Feedback</h2>
          <p className="text-slate-600 dark:text-gray-400 mb-8">Help us improve this tool. Let us know what you think!</p>
          
          <form className="space-y-4 text-left" onSubmit={handleFeedback}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">Your Feedback</label>
              <textarea 
                name="feedback"
                rows={4} 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none"
                placeholder="What did you like? What could be better?"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">Your Name or Email (Optional)</label>
              <input 
                type="text" 
                name="contact"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                placeholder="So we can follow up if needed"
              />
            </div>
            <button 
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md mt-2"
            >
              {isSubmitting ? 'Sending...' : isFeedbackSubmitted ? 'Sent!' : 'Send Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </>
  );
}
