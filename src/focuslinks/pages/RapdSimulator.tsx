'use client';
import { useState, useEffect, useRef } from 'react';
import { Link } from '../../context/NavigationContext';
import { Eye, Activity, Sun, Settings, MessageSquare, ArrowLeft, Share2, PlayCircle, CheckCircle2, Brain, PauseCircle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';

export default function RapdSimulator() {
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulator State
  const [lightPosition, setLightPosition] = useState<'left' | 'right' | 'none'>('none');
  const [rapdEye, setRapdEye] = useState<'left' | 'right' | 'none'>('left');
  const [rapdSeverity, setRapdSeverity] = useState<number>(2); // 1-4
  const [isAutoSwinging, setIsAutoSwinging] = useState(false);
  const autoSwingRef = useRef<NodeJS.Timeout | null>(null);

  const handleFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rapd_simulator_feedback',
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

  // Auto Swing Logic
  useEffect(() => {
    if (isAutoSwinging) {
      let currentPos: 'left' | 'right' = 'right';
      setLightPosition(currentPos);
      
      autoSwingRef.current = setInterval(() => {
        currentPos = currentPos === 'right' ? 'left' : 'right';
        setLightPosition(currentPos);
      }, 1500); // Swing every 1.5s
    } else {
      if (autoSwingRef.current) clearInterval(autoSwingRef.current);
      setLightPosition('none');
    }
    
    return () => {
      if (autoSwingRef.current) clearInterval(autoSwingRef.current);
    };
  }, [isAutoSwinging]);

  // Calculate Pupil Size (in pixels)
  const getPupilSize = () => {
    const baseSize = 56; // Dilated in dark
    const normalConstrict = 20; // Fully constricted
    
    if (lightPosition === 'none') return baseSize;

    // If light is on the healthy eye (or no RAPD), both constrict fully
    if (rapdEye === 'none' || lightPosition !== rapdEye) {
      return normalConstrict;
    }

    // If light is on the RAPD eye, constriction is weaker based on severity
    // Severity 1: 28px, Severity 2: 36px, Severity 3: 44px, Severity 4: 56px (no constriction)
    const severityScale = [20, 28, 36, 44, 56];
    return severityScale[rapdSeverity];
  };

  const pupilSize = getPupilSize();

  return (
    <>
      <SEO title="RAPD Simulator" description="Interactive RAPD simulator for optometry education and clinical training." keywords="RAPD simulator, pupillary defect, optometry education, clinical simulator" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <Link to="/labs" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Labs
          </Link>
          <button className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors w-fit">
            <Share2 className="w-4 h-4 mr-2" /> Share on WhatsApp
          </button>
        </div>

        {/* Hero / Simulator Preview */}
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl mb-16 border border-slate-800 canvas-gradient-glow">
          <div className="p-8 sm:p-12 text-center text-white border-b border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mb-6 ring-1 ring-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <Eye className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                RAPD Simulator
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                An interactive tool for practicing the swinging flashlight test to identify Relative Afferent Pupillary Defects (RAPD).
              </p>
            </div>
          </div>
          
          {/* Interactive Simulator Area */}
          <div className="bg-slate-950 p-8 sm:p-16 relative overflow-hidden">
            {/* Ambient background glow based on light position */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 w-96 h-96 bg-amber-200/5 rounded-full blur-[100px] transition-all duration-1000 ${
                lightPosition === 'left' ? 'left-1/4' : lightPosition === 'right' ? 'right-1/4' : 'left-1/2 -translate-x-1/2 opacity-0'
              }`}
            />

            <div className="max-w-4xl mx-auto">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-12 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 relative z-20">
                <div className="flex items-center gap-3 mr-4">
                  <span className="text-sm font-medium text-slate-400">Pathology:</span>
                  <select 
                    value={rapdEye}
                    onChange={(e) => setRapdEye(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 outline-none"
                  >
                    <option value="none">Normal (Healthy)</option>
                    <option value="left">Left Eye RAPD</option>
                    <option value="right">Right Eye RAPD</option>
                  </select>
                </div>

                {rapdEye !== 'none' && (
                  <div className="flex items-center gap-3 mr-4">
                    <span className="text-sm font-medium text-slate-400">Severity:</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="4" 
                      value={rapdSeverity}
                      onChange={(e) => setRapdSeverity(parseInt(e.target.value))}
                      className="w-24 accent-amber-500"
                    />
                    <span className="text-xs font-bold text-amber-400 w-4">{rapdSeverity}+</span>
                  </div>
                )}

                <div className="h-8 w-px bg-slate-800 mx-2 hidden sm:block"></div>

                <button 
                  onClick={() => setIsAutoSwinging(!isAutoSwinging)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all button-press-smooth ${
                    isAutoSwinging 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                  }`}
                >
                  {isAutoSwinging ? <PauseCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                  {isAutoSwinging ? 'Stop Auto Swing' : 'Auto Swing'}
                </button>
              </div>

              {/* Eyes Container */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 relative z-10">
                
                {/* Left Eye */}
                <div 
                  className="text-center relative group cursor-pointer"
                  onMouseEnter={() => !isAutoSwinging && setLightPosition('left')}
                  onMouseLeave={() => !isAutoSwinging && setLightPosition('none')}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-slate-400 text-sm font-bold tracking-widest uppercase flex flex-col items-center gap-1">
                    Left Eye (OS)
                    {rapdEye === 'left' && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">RAPD {rapdSeverity}+</span>}
                  </div>
                  
                  {/* Iris */}
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-900 to-slate-800 border-4 border-slate-700 flex items-center justify-center relative shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
                    {/* Iris texture lines */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(255,255,255,0.1) 10deg 20deg)' }}></div>
                    
                    {/* Pupil */}
                    <motion.div 
                      className="rounded-full bg-black relative z-10"
                      animate={{ 
                        width: pupilSize, 
                        height: pupilSize 
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 20,
                        mass: 0.8
                      }}
                    >
                      {/* Pupil reflection */}
                      <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/20 rounded-full blur-[1px]"></div>
                    </motion.div>

                    {/* Flashlight Beam Overlay */}
                    <AnimatePresence>
                      {lightPosition === 'left' && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-amber-200/30 mix-blend-overlay z-20 rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Flashlight Icon Indicator */}
                  <AnimatePresence>
                    {lightPosition === 'left' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-amber-400 flex flex-col items-center"
                      >
                        <Lightbulb className="w-8 h-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                        <span className="text-xs font-bold mt-1">Illuminated</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Right Eye */}
                <div 
                  className="text-center relative group cursor-pointer"
                  onMouseEnter={() => !isAutoSwinging && setLightPosition('right')}
                  onMouseLeave={() => !isAutoSwinging && setLightPosition('none')}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-slate-400 text-sm font-bold tracking-widest uppercase flex flex-col items-center gap-1">
                    Right Eye (OD)
                    {rapdEye === 'right' && <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">RAPD {rapdSeverity}+</span>}
                  </div>
                  
                  {/* Iris */}
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-900 to-slate-800 border-4 border-slate-700 flex items-center justify-center relative shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
                    {/* Iris texture lines */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 10deg, rgba(255,255,255,0.1) 10deg 20deg)' }}></div>
                    
                    {/* Pupil */}
                    <motion.div 
                      className="rounded-full bg-black relative z-10"
                      animate={{ 
                        width: pupilSize, 
                        height: pupilSize 
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 20,
                        mass: 0.8
                      }}
                    >
                      {/* Pupil reflection */}
                      <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/20 rounded-full blur-[1px]"></div>
                    </motion.div>

                    {/* Flashlight Beam Overlay */}
                    <AnimatePresence>
                      {lightPosition === 'right' && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-amber-200/30 mix-blend-overlay z-20 rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Flashlight Icon Indicator */}
                  <AnimatePresence>
                    {lightPosition === 'right' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-amber-400 flex flex-col items-center"
                      >
                        <Lightbulb className="w-8 h-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                        <span className="text-xs font-bold mt-1">Illuminated</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
              
              {!isAutoSwinging && (
                <div className="mt-24 text-center">
                  <p className="text-slate-500 text-sm animate-pulse">Hover over an eye to shine the light</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Key Simulator Features</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">A comprehensive tool designed for both teaching and self-assessment.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Core Features */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Core Features</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Physics-Based Pupillary Reflex:</strong> Simulates realistic physiological responses including latency, constriction velocity, and redilation.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Accurate Swinging Flashlight Test:</strong> Perform the gold-standard examination for detecting Relative Afferent Pupillary Defects (RAPD).</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Direct & Consensual Response:</strong> Visualizes how both eyes react simultaneously to unilateral stimulation, essential for understanding neural pathways.</p>
                </li>
              </ul>
            </div>

            {/* Pathology Simulation */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mr-4">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pathology Simulation</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Gradable RAPD Severity:</strong> Adjust the defect from Grade 1+ (Mild) to Grade 4+ (Amaurotic) to see how subtle vs. severe defects present clinically.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Customizable Pathology:</strong> Apply defects to either the Left (OS) or Right (OD) eye, or reset to a healthy normal state.</p>
                </li>
              </ul>
            </div>

            {/* Advanced Physiological Phenomena */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mr-4">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Advanced Phenomena</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Pupil Escape:</strong> Simulates the subtle dilation after initial constriction in mild RAPD.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Hippus:</strong> Toggles natural physiological pupil unrest (oscillation) for added realism.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Fixed Pupils:</strong> Simulate non-reactive eyes (e.g., pharmacological dilation or nerve palsy).</p>
                </li>
              </ul>
            </div>

            {/* Examination Controls & Feedback */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mr-4">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Controls & Feedback</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Dynamic Room Lighting:</strong> Adjust ambient light from 'Dark' to 'Bright' to observe baseline pupil size changes.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Automated Testing:</strong> 'Auto Swing' mode performs a perfect rhythmic test for you.</p>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Real-Time Feedback:</strong> Live digital readout of pupil diameter and automatic diagnostic interpretation (e.g., 'Normal', '3+ RAPD').</p>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/labs" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              View Full User Manual <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-6">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Share Your Feedback</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Help us improve this tool. Let us know what you think!</p>
          
          <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Feedback</label>
              <textarea 
                rows={4} 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                placeholder="What did you like? What could be better?"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Name or Email (Optional)</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="So we can follow up if needed"
              />
            </div>
            <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md mt-2">
              Send Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  </>
  );
}
