'use client';
import { Link, useParams } from '../../context/NavigationContext';
import SEO from '../components/SEO';
import { CheckCircle2, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Booked() {
  const { id } = useParams();

  return (
    <>
    <SEO title="Booking Confirmed" description="Your booking has been confirmed on FocusLinks." keywords="booking, confirmed, reservation" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 max-w-2xl w-full text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
          Booking Confirmed!
        </h1>
        
        <p className="text-lg text-slate-600 mb-8">
          Thank you for pre-booking your spot for the webinar. Your booking ID is:
        </p>
        
        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-8 inline-block">
          <span className="font-mono text-xl font-bold text-slate-800 dark:text-slate-200 tracking-wider">
            {id}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Date</p>
              <p className="text-blue-700">May 6, 2026</p>
            </div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-900">Time</p>
              <p className="text-indigo-700">7:00 PM IST</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/dashboard" 
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            Go to Dashboard
          </Link>
          <Link 
            to="/" 
            className="px-8 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  </>
  );
}
