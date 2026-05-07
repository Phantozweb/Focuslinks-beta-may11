'use client';
import { useEffect, useState } from 'react';
import { Link, useParams } from '../../context/NavigationContext';
import { CheckCircle2, XCircle, Loader2, Globe, ShieldCheck, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { decryptProfileToken } from '../../lib/crypto';
import MembershipCard from '../components/MembershipCard';

export default function Verify() {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<'loading' | 'verified' | 'not_found' | 'error'>('loading');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const verifyMember = async () => {
      if (!id) {
        setStatus('error');
        return;
      }

      const decryptedId = decryptProfileToken(id);
      if (!decryptedId) {
        setStatus('not_found');
        return;
      }

      try {
        const response = await fetch(`https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Profile/Users/${decryptedId}_userdata.json`);
        
        if (response.status === 404) {
          setStatus('not_found');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch membership data');
        }

        const member = await response.json();
        
        if (member) {
          setUserData(member);
          setStatus('verified');
        } else {
          setStatus('not_found');
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
      }
    };

    verifyMember();
  }, [id]);

  return (
    <>
    <SEO title="Verify Account" description="Verify your FocusLinks account." keywords="verify, account verification" />
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-8 text-center border-b border-white/5">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Focus Links</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium tracking-widest uppercase">Verification Portal</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {status === 'loading' && (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-300 font-medium">Authenticating credentials...</p>
              </div>
            )}

            {status === 'verified' && userData && (
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Verified Member</h2>
                  <p className="text-emerald-400 text-sm font-bold tracking-widest uppercase mt-1">Authentic FocusLinks ID</p>
                </div>

                {/* Digital Card Preview */}
                <div className="scale-90 md:scale-100 origin-center">
                  <MembershipCard 
                    previewMode={true} 
                    userData={{
                      name: userData.name,
                      email: userData.email,
                      role: userData.role,
                      region: userData.country,
                      country: userData.country,
                      location: userData.location,
                      linkedin: userData.linkedin,
                      title: userData.role,
                      bio: '',
                      memberId: userData.membershipId,
                      joinDate: userData.timestamp
                    }} 
                  />
                </div>

                <div className="space-y-4 pt-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Full Name</p>
                    <p className="text-white font-bold text-lg">{userData.name}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Email Address</p>
                      <div className="flex items-center gap-2 text-slate-200">
                        <span className="text-xs font-bold truncate">{userData.email}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Member Since</p>
                      <div className="flex items-center gap-2 text-slate-200">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-bold">
                          {new Date(userData.timestamp).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-500/80 text-xs font-bold uppercase tracking-widest bg-emerald-500/5 py-3 rounded-xl border border-emerald-500/10">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Global Credentials
                  </div>
                </div>
              </div>
            )}

            {status === 'not_found' && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white">Invalid Credentials</h2>
                <p className="text-slate-400 text-sm mt-2">The membership ID provided could not be verified in our global database.</p>
                <Link to="/" className="mt-8 px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors border border-white/10">
                  Return Home
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                  <XCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-xl font-bold text-white">System Error</h2>
                <p className="text-slate-400 text-sm mt-2">We encountered a problem while connecting to the verification server.</p>
                <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-600/20">
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              © 2026 Focus Links Network • focuslinks.in
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </>
  );
}
