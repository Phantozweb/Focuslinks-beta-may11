'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Mail, MessageSquare, Handshake, ArrowRight, User,
  Send, ChevronDown, Twitter, Github, Linkedin, MapPin, Clock,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    question: 'How do I create a public profile on FocusLinks?',
    answer: 'After signing up and logging in, navigate to your Dashboard. From there, you can create a public directory profile that will be visible to other community members. You\'ll need to fill in your professional details, including your title, institution, and specialties.',
  },
  {
    question: 'Is FocusLinks free to use?',
    answer: 'Yes! FocusLinks is completely free for optometry students and professionals. Our community features — including the feed, directory, and resources — are accessible to all members at no cost.',
  },
  {
    question: 'How can I collaborate with FocusLinks for an event or partnership?',
    answer: 'We\'re always open to collaborations! Please use the contact form and select "Partnership" as the subject, or email us directly at partnerships@focuslinks.in. We typically respond within 48 hours for partnership inquiries.',
  },
  {
    question: 'How do I report a bug or request a feature?',
    answer: 'You can use the contact form and select "Bug Report" or "Feature Request" as the subject. Alternatively, you can open an issue on our GitHub repository. We appreciate all feedback and aim to address bugs within 72 hours.',
  },
];

const subjectOptions = [
  'General Inquiry',
  'Partnership',
  'Bug Report',
  'Feature Request',
  'Membership',
  'Other',
];

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.subject) newErrors.subject = 'Please select a subject';
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Message sent successfully!', {
      description: 'We\'ll get back to you within 24 hours.',
    });
    // Reset form after delay
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      <SEO title="Contact FocusLinks" description="Get in touch with the FocusLinks team. We're here to help optometry professionals and students worldwide." keywords="contact focuslinks, optometry support, help center, feedback" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 shadow-inner">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Us</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            We&apos;d love to hear from you! Whether you have a question about features, partnerships, or anything else, our team is ready to answer all your questions.
          </p>
        </motion.div>

        {/* Main 3-column layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-8"
        >
          {/* Left Column - Contact Info Cards */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
            {/* General Contact */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800/50 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">General Contact</h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                For general questions, feedback, or support inquiries.
              </p>
              <a
                href="mailto:hello@focuslinks.in"
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                hello@focuslinks.in
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </a>
            </div>

            {/* Partnerships */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800/50 group-hover:scale-110 transition-transform duration-300">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Partnerships</h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                For event hosting, collaborations, or partnership proposals.
              </p>
              <a
                href="mailto:partnerships@focuslinks.in"
                className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                partnerships@focuslinks.in
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </a>
            </div>

            {/* Location Card */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800/50 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Location</h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">
                FocusLinks Community<br />
                Global Remote Team<br />
                Available Worldwide
              </p>
            </div>

            {/* Social Media */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a
                  href="https://twitter.com/focuslinks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com/company/focuslinks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/Phantozweb/Newfocuslinks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Center Column - Contact Form */}
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-600 dark:text-gray-400">Thank you for reaching out. We&apos;ll respond within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-gray-500" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Doe"
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white ${
                          errors.name ? 'border-rose-400 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-gray-500" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white ${
                          errors.email ? 'border-rose-400 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-gray-500 pointer-events-none" />
                      <select
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        className={`w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none text-slate-900 dark:text-white ${
                          !formData.subject ? 'text-slate-400 dark:text-gray-500' : ''
                        } ${
                          errors.subject ? 'border-rose-400 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <option value="" disabled>Select a subject...</option>
                        {subjectOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
                    </div>
                    {errors.subject && (
                      <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1.5">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none placeholder:text-slate-400 dark:placeholder:text-gray-500 text-slate-900 dark:text-white ${
                        errors.message ? 'border-rose-400 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    <div className="flex justify-between mt-1.5">
                      {errors.message ? (
                        <p className="text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-slate-400 dark:text-gray-500">
                        {formData.message.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>

                  {/* Response note */}
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>We typically respond within 24 hours</span>
                  </div>
                </form>
              )}
            </div>
          </motion.div>

          {/* Right Column - Map placeholder & FAQ */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-8">
            {/* Decorative Map Placeholder */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="h-56 bg-gradient-to-br from-blue-50 via-slate-100 to-indigo-100 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-900/20 flex flex-col items-center justify-center relative">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10 dark:opacity-5">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-gray-500" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-blue-200/40 dark:bg-blue-800/20 animate-pulse" />
                <div className="absolute bottom-12 right-12 w-24 h-24 rounded-full bg-indigo-200/40 dark:bg-indigo-800/20 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-emerald-200/40 dark:bg-emerald-800/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                {/* Pin */}
                <div className="relative z-10">
                  <MapPin className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">FocusLinks HQ</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Global Remote Team</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border-slate-200 dark:border-slate-700">
                    <AccordionTrigger className="text-sm font-medium text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
