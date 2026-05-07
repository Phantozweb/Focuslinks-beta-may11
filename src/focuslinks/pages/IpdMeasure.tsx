'use client';
import { Link, useNavigate } from '../../context/NavigationContext';
import { Camera, Brain, Zap, Shield, Download, ArrowLeft, ScanFace } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

export default function IpdMeasure() {
  const navigate = useNavigate();

  const handleLaunch = () => {
    toast.success('Opening tool...');
    navigate('/labs/ipd-measure');
  };

  return (
    <>
      <SEO title="IPD Measure Pro" description="Professional Interpupillary Distance measurement tool for optometrists using device camera." keywords="IPD measure, interpupillary distance, optometry tool, pupillary distance" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/labs" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-blue-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Labs
        </Link>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm mb-16 text-center py-16 px-4 sm:px-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 mb-8 shadow-inner">
              <ScanFace className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              IPD Measure <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Pro</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-gray-400 mb-10 leading-relaxed">
              An AI-powered tool to accurately measure interpupillary distance using your webcam. Leveraging advanced on-device processing for accurate and private measurements.
            </p>
            <button 
              onClick={handleLaunch}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Camera className="w-5 h-5 mr-2" /> Launch IPD Measure Pro
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Tool Features</h2>
            <p className="text-lg text-slate-600 dark:text-gray-400">Everything you need for quick, accurate, and private IPD measurements.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex gap-6">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Face Landmark Detection</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                  Utilizes advanced AI to accurately detect pupil positions in real-time, ensuring high precision.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex gap-6">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Real-Time IPD Calculation</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                  Provides an instant estimation of the interpupillary distance in millimeters as soon as your face is detected.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex gap-6">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">On-Device Processing</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                  All calculations are done directly in your browser. Your camera feed never leaves your device, ensuring complete privacy.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex gap-6">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Result History & Download</h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                  Save multiple readings, view your measurement history, and download your results as an image for your records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
