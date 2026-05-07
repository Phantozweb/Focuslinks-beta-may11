'use client';
import { ExternalLink, Instagram, ShieldCheck, BadgeCheck, Sparkles, Heart, Users, Quote, MessageCircle, ArrowRight, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { Link } from '../../context/NavigationContext';
import SEO from '../components/SEO';

const supporters = [
  {
    id: 1,
    name: "Dhristikit",
    role: "Verified Supporter",
    description: "Empowering eye care professionals with innovative clinical tools and resources for better patient outcomes.",
    icon: <ShieldCheck className="w-10 h-10 text-blue-600 dark:text-blue-400" />,
    link: null,
    verified: true,
    testimonial: "FocusLinks is revolutionizing how optometry students and professionals connect, learn, and grow together.",
    styles: {
      gradient: 'from-blue-500 to-cyan-500',
      bgLight: "bg-blue-50 dark:bg-blue-950/30",
      textDark: "text-blue-700 dark:text-blue-400",
      borderLight: "border-blue-100 dark:border-blue-900/40",
      borderHover: "hover:border-blue-300 dark:hover:border-blue-700",
      shadow: "hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10"
    }
  },
  {
    id: 2,
    name: "Optom.monalisa",
    role: "Verified Supporter",
    description: "Spreading awareness and sharing valuable optometry insights through engaging social media content.",
    icon: <Instagram className="w-10 h-10 text-pink-600 dark:text-pink-400" />,
    link: "https://instagram.com/optom.monalisa",
    verified: true,
    testimonial: "Being part of the FocusLinks community has amplified my ability to reach and educate optometry enthusiasts worldwide.",
    styles: {
      gradient: 'from-pink-500 to-rose-500',
      bgLight: "bg-pink-50 dark:bg-pink-950/30",
      textDark: "text-pink-700 dark:text-pink-400",
      borderLight: "border-pink-100 dark:border-pink-900/40",
      borderHover: "hover:border-pink-300 dark:hover:border-pink-700",
      shadow: "hover:shadow-pink-500/20 dark:hover:shadow-pink-500/10"
    }
  },
  {
    id: 3,
    name: "Optometry_inspires",
    role: "Verified Supporter",
    description: "Inspiring the next generation of optometrists with educational posts and community highlights.",
    icon: <Instagram className="w-10 h-10 text-pink-600 dark:text-pink-400" />,
    link: "https://instagram.com/optometry_inspires",
    verified: true,
    testimonial: "FocusLinks provides the perfect platform to share knowledge and inspire future optometrists around the globe.",
    styles: {
      gradient: 'from-purple-500 to-indigo-500',
      bgLight: "bg-purple-50 dark:bg-purple-950/30",
      textDark: "text-purple-700 dark:text-purple-400",
      borderLight: "border-purple-100 dark:border-purple-900/40",
      borderHover: "hover:border-purple-300 dark:hover:border-purple-700",
      shadow: "hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10"
    }
  }
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let current = 0;
          const step = Math.max(1, Math.floor(target / 20));
          const interval = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(interval);
            }
            setCount(current);
          }, 60);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-extrabold">
      {count}{suffix}
    </div>
  );
}

export default function Supporters() {
  const handleApplyClick = () => {
    toast.success('Application submitted! We\'ll review your supporter request shortly.', {
      description: 'Thank you for your interest in supporting FocusLinks.',
    });
  };

  const handleVisitClick = (name: string, link: string | null) => {
    if (!link) {
      toast.info(`${name}'s page is coming soon!`, {
        description: 'We\'ll notify you when their dedicated page is live.',
      });
    }
  };

  return (
    <>
      <SEO title="Supporters & Partners" description="FocusLinks supporters and partners in the global optometry community." keywords="focuslinks supporters, optometry partners, sponsors" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-24 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -50, 25, 0], scale: [1, 1.15, 0.9, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-400/15 dark:bg-blue-600/8 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -35, 40, 0], y: [0, 35, -35, 0], scale: [1, 0.9, 1.15, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-purple-400/10 dark:bg-purple-600/6 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 25, -20, 0], y: [0, -15, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-pink-400/10 dark:bg-pink-600/6 rounded-full blur-[120px]"
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30 - i * 10, 0],
              x: [0, 10 + i * 5, -5, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
            className={`absolute w-${1 + (i % 2)} h-${1 + (i % 2)} rounded-full bg-blue-400 dark:bg-blue-300`}
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 16}%`,
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12 text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full mb-8 shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-bold uppercase tracking-widest">Community Backers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight leading-tight"
          >
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient-text">
              Verified Supporters
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            We collaborate with amazing organizations and creators who share our vision of advancing the optometry profession globally.
          </motion.p>

          {/* Stats Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-6 px-8 py-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  <AnimatedCounter target={3} />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified Supporters</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Supporter Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {supporters.map((supporter, i) => (
            <motion.div
              key={supporter.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`bg-white dark:bg-slate-900 rounded-[2rem] p-8 sm:p-10 shadow-sm border ${supporter.styles.borderLight} hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center group relative overflow-hidden hover:shadow-2xl ${supporter.styles.shadow} rotating-gradient-border-animated`}
            >
              {/* Gradient border glow on hover */}
              <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${supporter.styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px] -z-10`}>
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[2rem]" />
              </div>

              {/* Decorative background blur */}
              <div className={`absolute -top-24 -right-24 w-64 h-64 ${supporter.styles.bgLight} rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 ease-in-out pointer-events-none`} />

              {/* Icon */}
              <div className={`w-24 h-24 rounded-3xl ${supporter.styles.bgLight} flex items-center justify-center mb-8 shadow-inner border ${supporter.styles.borderLight} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
                {supporter.icon}
                {supporter.verified && (
                  <div className="absolute -bottom-3 -right-3 bg-white dark:bg-slate-900 rounded-full p-1 shadow-md border border-slate-100 dark:border-slate-800">
                    <BadgeCheck className="w-7 h-7 text-blue-500 dark:text-blue-400 fill-blue-50 dark:fill-blue-950/50" />
                  </div>
                )}
              </div>

              {/* Name & Role */}
              <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-gray-200 transition-colors tracking-tight">
                  {supporter.name}
                </h3>
              </div>

              <span className={`inline-flex items-center px-4 py-1.5 ${supporter.styles.bgLight} ${supporter.styles.textDark} text-xs font-bold rounded-full uppercase tracking-widest mb-6 border ${supporter.styles.borderLight} relative z-10`}>
                {supporter.role}
              </span>

              {/* Description */}
              <p className="text-slate-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed text-base relative z-10">
                {supporter.description}
              </p>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 + 0.3 }}
                className={`w-full ${supporter.styles.bgLight} rounded-2xl p-5 mb-8 relative z-10 border ${supporter.styles.borderLight}`}
              >
                <Quote className={`w-6 h-6 ${supporter.styles.textDark} opacity-30 mb-2 animate-float-quote`} />
                <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed italic">
                  &ldquo;{supporter.testimonial}&rdquo;
                </p>
              </motion.div>

              {/* Action Button */}
              {supporter.link ? (
                <a
                  href={supporter.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative z-10 inline-flex items-center justify-center w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300 px-6 py-4 rounded-2xl font-bold transition-all duration-300 border border-slate-200 dark:border-slate-700 ${supporter.styles.borderHover} hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent hover:shadow-lg hover:-translate-y-0.5`}
                >
                  Visit Page
                  <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                </a>
              ) : (
                <button
                  onClick={() => handleVisitClick(supporter.name, null)}
                  className={`relative z-10 inline-flex items-center justify-center w-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300 px-6 py-4 rounded-2xl font-bold transition-all duration-300 border border-slate-200 dark:border-slate-700 ${supporter.styles.borderHover} hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent hover:shadow-lg hover:-translate-y-0.5`}
                >
                  Visit Page
                  <ExternalLink className="w-5 h-5 ml-2" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Become a Supporter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-[2rem] overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_60%)]" />

            {/* Floating orbs */}
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-8 right-12 w-20 h-20 bg-white/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-8 left-12 w-16 h-16 bg-white/10 rounded-full blur-xl"
            />

            <div className="relative z-10 px-8 py-14 sm:px-12 sm:py-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Become a Supporter
              </h2>
              <p className="text-blue-100 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Join our growing network of verified supporters and help us advance optometry education, innovation, and community worldwide.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleApplyClick}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-lg"
                >
                  <Send className="w-5 h-5" />
                  Apply to be a Supporter
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/contactus"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
