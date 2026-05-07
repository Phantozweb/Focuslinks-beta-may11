'use client';
import { useState } from 'react';
import { ArrowRight, Zap, Globe, Ticket, Gift, ShieldCheck, Layers, Users, Check, X, ChevronDown, Sparkles, Star, HelpCircle, Crown } from 'lucide-react';
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

// ─── Feature Check/X Mark ──────────────────────────────────────────
function FeatureMark({ included }: { included: boolean }) {
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
        included 
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
      }`}
    >
      {included ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <X className="w-3.5 h-3.5" strokeWidth={3} />}
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

  // Plan data
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for students and new professionals exploring the community.',
      icon: <Users className="w-6 h-6" />,
      color: 'from-slate-500 to-slate-600',
      popular: false,
      features: [
        { text: 'Basic Directory Profile', included: true },
        { text: 'Community Feed Access', included: true },
        { text: 'Blog Article Access', included: true },
        { text: 'Event Registration', included: true },
        { text: 'Member ID Card', included: true },
        { text: 'Priority Event Seating', included: false },
        { text: 'Career Center Access', included: false },
        { text: 'Verified Badge', included: false },
      ]
    },
    {
      name: 'Professional',
      price: '$9',
      period: '/month',
      description: 'For established professionals seeking deeper engagement and visibility.',
      icon: <Star className="w-6 h-6" />,
      color: 'from-blue-600 to-indigo-600',
      popular: true,
      features: [
        { text: 'Enhanced Directory Profile', included: true },
        { text: 'Community Feed Access', included: true },
        { text: 'Blog Article Access', included: true },
        { text: 'Priority Event Registration', included: true },
        { text: 'Digital Member ID Card', included: true },
        { text: 'Priority Event Seating', included: true },
        { text: 'Career Center Access', included: true },
        { text: 'Verified Badge', included: true },
      ]
    },
    {
      name: 'Enterprise',
      price: '$29',
      period: '/month',
      description: 'For institutions and teams managing multiple professional accounts.',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
      popular: false,
      features: [
        { text: 'Unlimited Team Profiles', included: true },
        { text: 'Community Feed Access', included: true },
        { text: 'Blog Publishing Rights', included: true },
        { text: 'VIP Event Access', included: true },
        { text: 'Premium Member ID Cards', included: true },
        { text: 'Dedicated Event Seating', included: true },
        { text: 'Career Center Access', included: true },
        { text: 'Verified Badge + Analytics', included: true },
      ]
    }
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
      question: 'Can I upgrade my plan later?',
      answer: 'Absolutely! You can start with the free Starter plan and upgrade to Professional or Enterprise at any time. All your data, connections, and profile information will carry over seamlessly.'
    },
    {
      question: 'How do I get my physical Member ID card?',
      answer: 'Digital ID cards are generated instantly. For Professional and Enterprise members, physical cards can be requested through your dashboard. We ship internationally with delivery in 7-14 business days.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'We take privacy seriously. Your personal information is encrypted and never shared with third parties without consent. You control what information is visible on your public profile through granular privacy settings.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your Professional or Enterprise subscription at any time with no penalties. You will retain access until the end of your billing period, and your free Starter features remain permanently.'
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

      {/* Pricing Plans Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-4 border border-blue-100 dark:border-blue-800/30">
              <Sparkles className="w-4 h-4" />
              Choose Your Plan
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start free and upgrade as you grow. Every plan includes our core community features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover-lift ${
                  plan.popular
                    ? 'bg-white dark:bg-slate-800 border-2 border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/10 scale-[1.02] lg:scale-105 z-10 hover-glow'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center text-xs font-bold py-1.5 uppercase tracking-widest flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3 h-3 sparkle-anim" />
                      Most Popular
                      <Sparkles className="w-3 h-3 sparkle-anim" style={{ animationDelay: '0.75s' }} />
                    </div>
                  </div>
                )}
                
                {/* Gradient border effect for popular */}
                {plan.popular && (
                  <div className="absolute -inset-[2px] bg-gradient-to-b from-blue-500/20 via-transparent to-indigo-500/20 rounded-2xl -z-10" />
                )}

                <div className={`p-8 flex flex-col flex-grow ${plan.popular ? 'pt-12' : ''}`}>
                  {/* Plan icon & name */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white shadow-lg`}>
                      {plan.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-slate-500 dark:text-gray-400 text-sm font-medium ml-1">{plan.period}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-8">{plan.description}</p>

                  {/* Feature list */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, fIdx) => (
                      <motion.li 
                        key={feature.text}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + fIdx * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <FeatureMark included={feature.included} />
                        <span className={`text-sm ${feature.included ? 'text-slate-700 dark:text-gray-300' : 'text-slate-400 dark:text-gray-600 line-through'}`}>
                          {feature.text}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <button className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                    {plan.popular ? 'Start Free Trial' : plan.price === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">Compare All Features</h2>
            <p className="text-slate-600 dark:text-gray-400">See exactly what's included in each plan.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8"
          >
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 sm:px-6 text-sm font-bold text-slate-900 dark:text-white">Feature</th>
                  <th className="text-center py-4 px-4 sm:px-6 text-sm font-bold text-slate-600 dark:text-gray-400">Starter</th>
                  <th className="text-center py-4 px-4 sm:px-6">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800/30">
                      <Star className="w-3 h-3" /> Professional
                    </span>
                  </th>
                  <th className="text-center py-4 px-4 sm:px-6 text-sm font-bold text-amber-600 dark:text-amber-400">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Directory Profile', starter: true, pro: true, enterprise: true },
                  { feature: 'Community Feed', starter: true, pro: true, enterprise: true },
                  { feature: 'Blog Access', starter: true, pro: true, enterprise: true },
                  { feature: 'Event Registration', starter: true, pro: true, enterprise: true },
                  { feature: 'Member ID Card', starter: 'Basic', pro: 'Digital', enterprise: 'Premium' },
                  { feature: 'Priority Seating', starter: false, pro: true, enterprise: true },
                  { feature: 'Career Center', starter: false, pro: true, enterprise: true },
                  { feature: 'Verified Badge', starter: false, pro: true, enterprise: true },
                  { feature: 'Blog Publishing', starter: false, pro: false, enterprise: true },
                  { feature: 'Team Management', starter: false, pro: false, enterprise: true },
                  { feature: 'Analytics Dashboard', starter: false, pro: false, enterprise: true },
                  { feature: 'Priority Support', starter: false, pro: true, enterprise: true },
                ].map((row, i) => (
                  <tr key={row.feature} className={`border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/50' : ''}`}>
                    <td className="py-3.5 px-4 sm:px-6 text-sm font-medium text-slate-700 dark:text-gray-300">{row.feature}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {typeof row.starter === 'boolean' ? (
                        <FeatureMark included={row.starter} />
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">{row.starter}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center bg-blue-50/30 dark:bg-blue-900/10">
                      {typeof row.pro === 'boolean' ? (
                        <FeatureMark included={row.pro} />
                      ) : (
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        <FeatureMark included={row.enterprise} />
                      ) : (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 relative">
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
