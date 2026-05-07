'use client';
import { useState } from 'react';
import { ArrowRight, Zap, Globe, Ticket, Gift, ShieldCheck, Layers, Users, Check, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MembershipForm from '../components/MembershipForm';
import MembershipCard from '../components/MembershipCard';
import SEO from '../components/SEO';

// ─── FAQ Accordion Item ────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800/40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pr-4">{question}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pl-14">
              <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Feature Check Mark ──────────────────────────────────────────
function FeatureCheck({ text }: { text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3"
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </div>
      <span className="text-sm text-slate-700 dark:text-gray-300">{text}</span>
    </motion.div>
  );
}

// ─── Main Membership Component ─────────────────────────────────────
export default function Membership() {
  const dummyUser = {
    name: "Alex Vision",
    email: "alex@example.com",
    role: "Clinical Optometrist",
    region: "North America",
    country: "Canada",
    location: "Toronto, ON",
    linkedin: "linkedin.com/in/alexvision",
    title: "Senior Optometrist | Vision Care",
    education: "Doctor of Optometry, University of Waterloo",
    skills: ["Clinical Optometry", "Contact Lenses", "Ocular Disease"],
    bio: "Passionate about eye care.",
    memberId: "FL-XX-XX-0000"
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  // All features included for free
  const features = [
    'Basic Directory Profile',
    'Community Feed Access',
    'Blog Article Access',
    'Event Registration',
    'Digital Member ID Card',
    'Priority Event Seating',
    'Career Center Access',
    'Verified Badge',
  ];

  // FAQ data
  const faqs = [
    {
      question: 'Is the Membership ID really free?',
      answer: 'Yes! The FocusLinks Membership ID is completely free forever. We believe connection in the eye care community should have no barriers. Your ID gives you access to events, networking, and community features at no cost.'
    },
    {
      question: 'What does the Membership ID give me access to?',
      answer: 'Your ID serves as a universal passport to the FocusLinks ecosystem. Use it to register for webinars and competitions, appear in the global professional directory, join community discussions, and access member-only perks from our industry partners.'
    },
    {
      question: 'How do I get my Member ID card?',
      answer: 'Your digital ID card is generated instantly when you sign up. You can access it anytime from your dashboard and share it with peers.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'We take privacy seriously. Your personal information is encrypted and never shared with third parties without consent. You control what information is visible on your public profile through granular privacy settings.'
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time. All your data will be permanently removed from our systems. You can always sign up again if you change your mind.'
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <SEO title="FocusLinks Membership" description="Join FocusLinks membership and unlock premium features, global networking, clinical tools, and professional growth opportunities for optometrists." keywords="optometry membership, join focuslinks, professional membership, eye care benefits" />
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        {/* Animated decorative blobs */}
        <div className="absolute top-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-float animation-delay-2000" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="initial"
              animate="animate"
              variants={{
                animate: { transition: { staggerChildren: 0.1 } }
              }}
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-6 shadow-sm border border-blue-200 dark:border-blue-800/30">
                <Zap className="w-4 h-4" /> 100% Free Forever
              </motion.div>
              <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 tracking-tight">
                Your Universal Passport to the <span className="text-gradient">Eye Care World.</span>
              </motion.h1>
              <motion.p variants={fadeIn} className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed mb-10">
                The Focus Links Membership ID is your single key to unlock our entire ecosystem. Join exclusive events, connect with global peers, and access member-only perks—all completely free.
              </motion.p>
              <motion.div variants={fadeIn}>
                <a href="#claim-id" className="inline-flex justify-center items-center px-8 py-4 text-lg font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  Claim Your Free ID
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden md:block"
            >
              {/* Decorative background glow */}
              <div className="absolute inset-0 bg-blue-500 blur-[100px] opacity-20 rounded-full transform scale-110"></div>
              <div className="relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <MembershipCard userData={dummyUser} previewMode={true} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You Get - Free Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4 border border-blue-100 dark:border-blue-800/30">
              <Zap className="w-4 h-4" />
              Everything Included
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              One Plan. Everything Free.
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
              No tiers, no paywalls, no hidden fees. Every member gets full access to the entire FocusLinks ecosystem.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <div className="p-8">
                {/* Plan header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">FocusLinks Member</h3>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">Free</span>
                  <span className="text-slate-500 dark:text-gray-400 text-sm font-medium ml-1">forever</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-8">
                  Join the global eye care community with full access to all features. No credit card required.
                </p>

                {/* Feature list */}
                <div className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <FeatureCheck key={feature} text={feature} />
                  ))}
                </div>

                {/* CTA button */}
                <a href="#claim-id" className="block w-full py-3.5 px-6 rounded-xl font-bold text-sm text-center text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-300">
                  Get Your Free ID
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-slate-900 relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4 border border-blue-100 dark:border-blue-800/30">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-gray-400">
              Everything you need to know about FocusLinks membership.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <FAQItem question={faq.question} answer={faq.answer} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Ecosystem / Perks Section */}
      <section className="py-24 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">One ID. Infinite Connections.</h2>
            <p className="text-xl text-slate-400 dark:text-gray-500">
              Your Membership ID is more than just a number. It's the engine that powers your experience across the entire Focus Links platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Ticket className="w-8 h-8 text-blue-400" />,
                title: "Instant Event Access",
                description: "Use your ID to seamlessly register for webinars, global competitions, and local meetups with a single click."
              },
              {
                icon: <Globe className="w-8 h-8 text-indigo-400" />,
                title: "Global Networking",
                description: "Your ID places you in our global directory, making it easy for peers, mentors, and organizations to find and connect with you."
              },
              {
                icon: <Gift className="w-8 h-8 text-emerald-400" />,
                title: "Member-Only Perks",
                description: "Unlock exclusive discounts, early access to clinical tools, and special offers from our verified industry supporters."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-amber-400" />,
                title: "Verified Identity",
                description: "Stand out with a verified professional profile. Your digital ID card proves your status in the eye care community."
              },
              {
                icon: <Layers className="w-8 h-8 text-purple-400" />,
                title: "Unified Ecosystem",
                description: "Whether you are browsing articles, joining the Case Forum, or exploring the Career Center, your ID ties it all together."
              },
              {
                icon: <Users className="w-8 h-8 text-pink-400" />,
                title: "Community Driven",
                description: "By claiming your ID, you strengthen the global network. It's 100% free because we believe connection should have no barriers."
              }
            ].map((perk, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-900/50 flex items-center justify-center mb-6 border border-slate-700">
                  {perk.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{perk.title}</h3>
                <p className="text-slate-400 dark:text-gray-500 leading-relaxed">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Application Section */}
      <section id="claim-id" className="py-24 bg-white dark:bg-slate-900 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Get Your Free ID in 60 Seconds</h2>
            <p className="text-lg text-slate-600 dark:text-gray-400">Complete the form below to generate your personalized Membership Card.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="transform hover:scale-[1.005] transition-transform duration-300"
          >
            <MembershipForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
