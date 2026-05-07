'use client';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download, RefreshCw, Globe } from 'lucide-react';
import { encryptMembershipId } from '../../lib/crypto';

export interface UserData {
  name: string;
  email: string;
  role: string;
  region: string;
  country: string;
  location: string;
  linkedin: string;
  title: string;
  education?: string;
  skills?: string[];
  bio: string;
  memberId: string;
  joinDate?: string;
}

export default function MembershipCard({ userData, previewMode = false }: { userData: UserData, previewMode?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const frontPrintRef = useRef<HTMLDivElement>(null);
  const backPrintRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (side: 'front' | 'back') => {
    const element = side === 'front' ? frontPrintRef.current : backPrintRef.current;
    if (!element) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 3, 
        backgroundColor: null,
        useCORS: true 
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
      const link = document.createElement('a');
      link.download = `FocusLinks_Membership_${side}_${userData.memberId}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const encryptedId = encryptMembershipId(userData.memberId);
  const qrData = `https://focuslinks.in/verify/${encryptedId}`;

  const formattedJoinDate = userData.joinDate 
    ? new Date(userData.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Active';

  const FrontContent = () => (
    <div className="absolute inset-0 bg-slate-950 overflow-hidden select-none">
      {/* Premium Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-slate-900/90 to-slate-950"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

      <div className="relative z-10 p-6 flex flex-col h-full">
        {/* Header - Fixed Height */}
        <div className="h-12 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50 border border-white/10">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-[0.2em] uppercase text-sm leading-none">Focus Links</span>
              <span className="text-blue-400/80 text-[8px] font-bold tracking-[0.1em] uppercase mt-1">Global Eye Care Network</span>
            </div>
          </div>
          <div className="px-3 py-1.5 shrink-0 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="text-white/90 text-[9px] font-black tracking-widest uppercase">Official Member</span>
          </div>
        </div>

        {/* Center Content - Fixed Area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="h-24 flex flex-col justify-center">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white drop-shadow-lg leading-tight line-clamp-2">
              {userData.name}
            </h2>
            <div className="h-px w-12 bg-blue-500/50 my-3"></div>
            <p className="text-blue-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase drop-shadow-md truncate">
              {userData.role}
            </p>
          </div>
        </div>
          
        {/* Footer - Fixed Bottom */}
        <div className="h-12 border-t border-white/10 flex justify-between items-end shrink-0">
          <div className="flex flex-col pb-1">
            <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] mb-1">Membership Status</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold text-[10px] md:text-xs tracking-[0.1em] text-emerald-400 uppercase">Verified Professional</span>
            </div>
          </div>
          <div className="text-right pb-1">
            <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] mb-1">Region</span>
            <p className="text-[10px] text-white font-bold tracking-wider uppercase truncate max-w-[100px]">{userData.country}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const BackContent = () => (
    <div className="absolute inset-0 bg-slate-900 overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-bl from-slate-800 via-slate-900 to-black"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Magnetic Stripe */}
        <div className="w-full h-10 bg-black/90 mt-6 shrink-0 shadow-inner border-y border-white/5"></div>
        
        <div className="flex-1 p-6 flex gap-6 items-center">
          {/* QR Code Container - Fixed Size with Quiet Zone */}
          <div className="shrink-0 bg-white p-3 rounded-xl shadow-2xl border-4 border-slate-800">
            <QRCodeSVG 
              value={qrData} 
              size={256} 
              level="H" 
              includeMargin={false} 
              className="w-16 h-16 md:w-24 md:h-24" 
            />
          </div>

          {/* Details - Fixed Layout */}
          <div className="flex flex-col justify-center flex-1 space-y-4">
            <div className="space-y-1">
              <p className="text-[8px] text-blue-400/60 uppercase tracking-[0.2em] font-bold">Verification</p>
              <p className="text-[10px] md:text-xs text-white font-bold tracking-wide uppercase">Scan QR Code to Verify!</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] text-blue-400/60 uppercase tracking-[0.2em] font-bold">Membership Since</p>
              <p className="text-[10px] md:text-xs text-white font-bold tracking-wide uppercase">{formattedJoinDate}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6 mt-auto">
          <div className="h-px bg-white/10 w-full mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-[7px] text-slate-500 tracking-wider uppercase font-bold mb-0.5">Official Portal</p>
              <p className="text-blue-500 font-black text-[10px] tracking-[0.2em] uppercase">focuslinks.in</p>
            </div>
            <div className="text-right max-w-[50%]">
              <p className="text-[6px] text-slate-600 leading-tight">
                This digital asset is non-transferable and property of Focus Links Network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* 3D Card Container */}
      <div 
        className="relative w-full aspect-[1.586/1] cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative duration-500"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden border border-white/20"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <FrontContent />
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl overflow-hidden border border-white/20"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <BackContent />
          </div>
        </motion.div>
      </div>

      <p className="text-sm text-slate-500 mt-6 flex items-center gap-2">
        <RefreshCw className="w-4 h-4" /> Tap card to flip
      </p>

      {!previewMode && (
        <>
          <div className="flex gap-4 mt-6 w-full">
            <button 
              onClick={() => handleDownload('front')}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {isDownloading ? 'Saving...' : 'Save Front'}
            </button>
            <button 
              onClick={() => handleDownload('back')}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-900 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {isDownloading ? 'Saving...' : 'Save Back'}
            </button>
          </div>

          {/* Hidden high-res versions for downloading */}
          <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none">
            <div 
              ref={frontPrintRef} 
              className="w-[600px] h-[378px] rounded-2xl overflow-hidden border border-white/20 relative"
            >
              <FrontContent />
            </div>
            <div 
              ref={backPrintRef} 
              className="w-[600px] h-[378px] rounded-2xl overflow-hidden border border-white/20 relative"
            >
              <BackContent />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
