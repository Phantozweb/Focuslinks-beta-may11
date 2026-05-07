'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Globe, Users, BookOpen, MessageSquare, Briefcase, ArrowRight, Sparkles, Target, Zap, Heart, Award, Linkedin, Twitter, Github, ChevronRight, Rocket } from 'lucide-react';
import { useNavigate } from '../../context/NavigationContext';
import SEO from '../components/SEO';

/* ─── Animated Counter Hook ─── */
function useAnimatedCounter(target: number, duration = 1200, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart || target <= 0) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
}

/* ─── Animated Stat Item ─── */
function AnimatedStat({ icon: Icon, label, value, suffix, color, delay }: { icon: any; label: string; value: number; suffix: string; color: string; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useAnimatedCounter(value, 1500, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
        {count}{suffix}
      </p>
      <p className="text-sm text-slate-500 dark:text-gray-400 font-medium mt-1">{label}</p>
    </motion.div>
  );
}

/* ─── Timeline Data ─── */
const milestones = [
  { year: '2023 Q1', title: 'The Spark', description: 'Founded by Janarthan Veeramani, an optometry student who saw the need for a unified platform.', icon: <Sparkles className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
  { year: '2023 Q3', title: 'First 100 Members', description: 'Crossed our first milestone, connecting optometrists and students across 5 countries.', icon: <Users className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
  { year: '2024 Q1', title: 'Academy Launch', description: 'Launched the FocusLinks Academy with expert-led webinars and the FL Credits system.', icon: <BookOpen className="w-5 h-5" />, color: 'from-violet-500 to-purple-500' },
  { year: '2024 Q3', title: 'AI Lab Tools', description: 'Introduced OD CAM, OptoScholar, and IPD Measure — AI-powered clinical tools.', icon: <Zap className="w-5 h-5" />, color: 'from-amber-500 to-orange-500' },
  { year: '2025 Q1', title: 'Eye Q Arena', description: 'Hosted the first international optometry knowledge championship with 5+ participating countries.', icon: <Award className="w-5 h-5" />, color: 'from-rose-500 to-pink-500' },
  { year: '2025 Q2', title: 'Growing Community', description: 'Growing our community with 500+ members globally. Launched Career Center and enhanced Directory.', icon: <Rocket className="w-5 h-5" />, color: 'from-blue-600 to-violet-600' },
];

/* ─── Team Data ─── */
const team = [
  { name: 'Janarthan Veeramani', role: 'Founder & CEO', initials: 'JV', color: 'from-slate-700 to-slate-900', bio: 'Optometry student turned entrepreneur. Building the platform he wished he had.' },
  { name: 'Dr. Priya Sharma', role: 'Head of Academy', initials: 'PS', color: 'from-blue-500 to-indigo-600', bio: 'Leading expert in clinical optometry education and curriculum design.' },
  { name: 'Arjun Krishnan', role: 'CTO', initials: 'AK', color: 'from-emerald-500 to-teal-600', bio: 'Full-stack engineer passionate about building scalable healthcare technology.' },
  { name: 'Sneha Patel', role: 'Community Manager', initials: 'SP', color: 'from-violet-500 to-purple-600', bio: 'Dedicated to fostering meaningful connections in the eye care community.' },
];

/* ─── Supporting Organizations Data ─── */
const partners = [
  { name: 'LV Prasad Eye Institute', initials: 'LV', color: 'bg-blue-600', desc: 'World-renowned eye care network' },
  { name: 'Aravind Eye Care', initials: 'AE', color: 'bg-emerald-600', desc: 'Largest eye care provider in the world' },
  { name: 'Bausch + Lomb', initials: 'BL', color: 'bg-violet-600', desc: 'Global eye health company' },
  { name: 'CooperVision', initials: 'CV', color: 'bg-amber-600', desc: 'Contact lens innovator' },
  { name: 'EssilorLuxottica', initials: 'EL', color: 'bg-rose-600', desc: 'Leader in eyeglasses & lenses' },
  { name: 'Alcon', initials: 'AL', color: 'bg-cyan-600', desc: 'Eye care products pioneer' },
];

export default function About() {
  const navigate = useNavigate();
  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: '-100px' });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-white pb-0 pt-0">
      <SEO title="About FocusLinks" description="Learn about FocusLinks, the world's first global platform for optometrists. Our mission, team, and vision for connecting eye care professionals worldwide." keywords="about focuslinks, optometry platform, eye care community, optometrist network" />
      {/* ─── Animated Gradient Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl animate-float animation-delay-2000" />
          <div className="absolute -bottom-10 right-1/4 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl animate-float animation-delay-4000" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-sm font-semibold mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Uniting the{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Eye Care
              </span>{' '}
              World
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              We are building a single, cohesive digital ecosystem where every student, professional, and organization can connect, learn, and grow.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* ─── Bento Grid Layout ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 -mt-8 relative z-10">
          {/* Main Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-10 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-500"></div>
            <Target className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-8" />
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">The Vision</h2>
            <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed max-w-xl relative z-10">
              Focus Links was born from a simple idea: the world of eye care is vast, but it doesn&apos;t have to be fragmented. As an optometry student, our founder saw the need for a unified platform—a place to break down silos between academia, clinical practice, and industry.
            </p>
          </motion.div>

          {/* Stats/Highlight Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-600 to-violet-700 rounded-[2rem] p-10 md:p-12 text-white shadow-lg relative overflow-hidden flex flex-col justify-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"></div>
            <div className="relative z-10">
              <div className="text-5xl font-black mb-2">500+</div>
              <div className="text-blue-100 font-medium text-lg">Professionals Connected</div>
              <div className="mt-8 pt-8 border-t border-blue-500/30">
                <div className="text-3xl font-bold mb-1">Global</div>
                <div className="text-blue-100 font-medium">Reach & Impact</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Our Numbers Animated Stats Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-16 mt-12"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4 border border-emerald-100 dark:border-emerald-800/30">
              <Target className="w-4 h-4" />
              Our Numbers
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Growing Every Day</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <AnimatedStat icon={Users} label="Members" value={10} suffix="K+" color="bg-blue-500" delay={0.1} />
            <AnimatedStat icon={Globe} label="Countries" value={50} suffix="+" color="bg-violet-500" delay={0.2} />
            <AnimatedStat icon={BookOpen} label="Resources" value={500} suffix="+" color="bg-emerald-500" delay={0.3} />
            <AnimatedStat icon={Award} label="Events Hosted" value={25} suffix="+" color="bg-amber-500" delay={0.4} />
          </div>
        </motion.div>

        {/* ─── Features Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: <Globe className="w-8 h-8" />, title: "Global Directory", desc: "A comprehensive database of students, professionals, and institutions.", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30" },
            { icon: <BookOpen className="w-8 h-8" />, title: "Academy & Events", desc: "Access expert-led webinars and compete in global knowledge competitions.", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/30" },
            { icon: <MessageSquare className="w-8 h-8" />, title: "Case Forum", desc: "Engage in clinical case discussions and share insights with peers.", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30" },
            { icon: <Briefcase className="w-8 h-8" />, title: "Career Center", desc: "Explore the job board to find your next role in the eye care industry.", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + (i * 0.1) }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── Animated Timeline / Roadmap ─── */}
        <motion.div
          ref={timelineRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-sm font-semibold mb-4 border border-violet-100 dark:border-violet-800/30">
              <Rocket className="w-4 h-4" />
              Our Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Platform Roadmap</h2>
            <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">From a student&apos;s idea to a global optometry community.</p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 md:-translate-x-px">
              <motion.div
                initial={{ height: 0 }}
                animate={timelineInView ? { height: '100%' } : {}}
                transition={{ duration: 2, ease: 'easeInOut' }}
                className="w-full bg-gradient-to-b from-blue-500 via-violet-500 to-purple-500"
              />
            </div>

            <div className="space-y-12">
              {milestones.map((milestone, i) => {
                const isLeft = i % 2 === 0;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                    animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    className={`relative flex items-start gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                  >
                    {/* Dot */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 z-10">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center text-white shadow-lg`}>
                        {milestone.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}`}>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{milestone.title}</h3>
                      <p className="text-slate-600 dark:text-gray-400 leading-relaxed">{milestone.description}</p>
                    </div>

                    {/* Spacer for opposite side */}
                    <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ─── Team Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4 border border-blue-100 dark:border-blue-800/30">
              <Users className="w-4 h-4" />
              The Team
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Meet Our Team</h2>
            <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">Passionate individuals working to transform the eye care community.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 text-center group"
              >
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-4">{member.bio}</p>
                {/* Social Icons */}
                <div className="flex items-center justify-center gap-2">
                  <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors">
                    <Twitter className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors">
                    <Linkedin className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">
                    <Github className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Founder & Collaboration Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Founder Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-md">
                JV
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Janarthan Veeramani</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">Founder & Visionary</p>
              </div>
            </div>
            <blockquote className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed italic flex-grow">
              &ldquo;I started Focus Links because I believe connection is the catalyst for innovation. My goal is to build the tools and the community that I wished I had as a student—a space where anyone in the eye care field can find their place, share their knowledge, and shape the future of vision.&rdquo;
            </blockquote>
          </motion.div>

          {/* Collaboration Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 rounded-[2rem] p-10 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30"></div>

            <Zap className="w-12 h-12 text-blue-400 mb-8 relative z-10" />
            <h2 className="text-3xl font-bold mb-4 relative z-10">A Hub for Global Collaboration</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 relative z-10 flex-grow">
              We offer a dedicated hub for every eye care association, college, and community group across the globe. Host your events, share knowledge, run competitions, and connect with a global audience—all free of charge.
            </p>
            <button onClick={() => navigate('/contactus')} className="self-start px-6 py-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-2 relative z-10 cursor-pointer">
              Collaborate With Us <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* ─── Partners Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-4 border border-amber-100 dark:border-amber-800/30">
              <Heart className="w-4 h-4" />
              Trusted By
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Supporting Organizations</h2>
            <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">We acknowledge these leading organizations advancing eye care worldwide.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {partners.map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.08, y: -4 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
              >
                <div className={`w-14 h-14 ${partner.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform`}>
                  {partner.initials}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-gray-300 text-center leading-tight">{partner.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-gray-500 text-center">{partner.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── Join Our Mission CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-700" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-300/10 rounded-full blur-[60px]" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Mission</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
              Whether you&apos;re a student seeking mentorship, a practitioner looking to collaborate, or an organization wanting to engage with the community, our platform is built for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/membership')} className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors shadow-lg flex items-center gap-2 cursor-pointer hover:-translate-y-0.5">
                Become a Member <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/directory')} className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 cursor-pointer">
                Explore the Directory <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
