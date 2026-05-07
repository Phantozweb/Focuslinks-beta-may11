'use client';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import MembershipForm from '../components/MembershipForm';

export default function MembershipApplication() {
  return (
    <>
    <SEO title="Membership Application" description="Apply for FocusLinks professional membership and unlock exclusive community features." keywords="membership application, professional membership, apply" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight"
          >
            Become a <span className="text-blue-600">Focus Links</span> Member
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium"
          >
            Join the global network of eye care professionals. Complete the application below to claim your universal digital ID.
          </motion.p>
        </div>

        <MembershipForm />
      </div>
    </div>
  </>
  );
}
