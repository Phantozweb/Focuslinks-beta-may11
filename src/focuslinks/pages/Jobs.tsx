'use client';
import { useState, useMemo } from 'react';
import {
  Search, MapPin, Briefcase, Clock, DollarSign, Building2, Mail,
  Plus, X, Filter, Sparkles, Eye, ChevronDown, Users, Globe2,
  Beaker, GraduationCap, ShoppingCart, BarChart3, AlertCircle,
  ArrowRight, Send, CheckCircle2, Star, Heart, Bookmark,
} from 'lucide-react';
import { Link } from '../../context/NavigationContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

// ─── Types ─────────────────────────────────────────────────────────
interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salary: string;
  category: string;
  description: string;
  requirements: string[];
  contactEmail: string;
  postedDate: string;
  featured: boolean;
  logoColor: string;
}

// ─── Category Config ───────────────────────────────────────────────
const categories = [
  { value: 'All', label: 'All Categories', icon: Briefcase },
  { value: 'Optometrist', label: 'Optometrist', icon: Eye },
  { value: 'Optician', label: 'Optician', icon: GlassesIcon },
  { value: 'Lab Technician', label: 'Lab Technician', icon: Beaker },
  { value: 'Practice Manager', label: 'Practice Manager', icon: Building2 },
  { value: 'Academic/Research', label: 'Academic / Research', icon: GraduationCap },
  { value: 'Sales Representative', label: 'Sales Rep', icon: ShoppingCart },
  { value: 'Clinical Research', label: 'Clinical Research', icon: BarChart3 },
  { value: 'Other', label: 'Other', icon: AlertCircle },
];

const jobTypes = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const locations = ['All', 'India', 'United States', 'United Kingdom', 'Remote'];

// ─── No Mock Jobs — show empty state ──────────────────────────────
const mockJobs: JobListing[] = [];

// ─── Glasses Icon Component ────────────────────────────────────────
function GlassesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="4" />
      <circle cx="18" cy="12" r="4" />
      <path d="M10 12h4" />
      <path d="M6 8V6a2 2 0 0 1 2-2h2l2 2" />
      <path d="M18 8V6a2 2 0 0 0-2-2h-2l-2 2" />
    </svg>
  );
}

// ─── Company Logo Placeholder ──────────────────────────────────────
function CompanyLogo({ name, gradient }: { name: string; gradient: string }) {
  const initials = name
    .split(/[\s&]+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Job Card Component ────────────────────────────────────────────
function JobCard({ job, index }: { job: JobListing; index: number }) {
  const [saved, setSaved] = useState(false);

  const typeColor: Record<string, string> = {
    'Full-time': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Part-time': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'Contract': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Internship': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const handleApply = () => {
    toast.success('Application submitted! 🎉', {
      description: `Your application for "${job.title}" at ${job.company} has been sent.`,
      duration: 4000,
    });
  };

  const handleSave = () => {
    setSaved(s => {
      toast(s ? 'Job removed from saved list' : 'Job saved! 🔖', { duration: 2000 });
      return !s;
    });
  };

  const daysAgo = Math.floor((Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover-lift hover-glow flex flex-col h-full transition-all duration-300">
        {/* Card header */}
        <div className="p-5 sm:p-6 flex flex-col flex-grow">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <CompanyLogo name={job.company} gradient={job.logoColor} />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {job.title}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-gray-400 mt-0.5">{job.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {job.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <Star className="w-3 h-3" />
                  Featured
                </span>
              )}
              <button
                onClick={handleSave}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 dark:text-gray-500 hover:text-rose-500 dark:hover:text-rose-400"
                aria-label="Save job"
              >
                {saved ? <Bookmark className="w-4 h-4 fill-rose-500 text-rose-500" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-sm text-slate-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              {job.type}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor[job.type]}`}>
              {job.type}
            </span>
          </div>

          {/* Salary & Remote */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
              {job.salary}
            </span>
            {job.remote && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 text-xs font-semibold rounded-full">
                <Globe2 className="w-3 h-3" />
                Remote
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed mb-5 line-clamp-3">
            {job.description}
          </p>

          {/* Requirements preview */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {job.requirements.slice(0, 3).map((req, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 text-[11px] font-medium rounded-lg">
                {req.length > 35 ? req.slice(0, 35) + '...' : req}
              </span>
            ))}
            {job.requirements.length > 3 && (
              <span className="px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                +{job.requirements.length - 3} more
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-gray-500">
              Posted {daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Apply Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Post a Job Modal ──────────────────────────────────────────────
function PostJobModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    remote: false,
    type: 'Full-time' as JobListing['type'],
    salaryMin: '',
    salaryMax: '',
    category: 'Optometrist',
    description: '',
    requirements: '',
    contactEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success('Job posted successfully! 🎉', {
        description: `"${formData.title}" is now live on FocusLinks Jobs.`,
        duration: 5000,
      });
    }, 1800);
  };

  const resetForm = () => {
    setFormData({ title: '', company: '', location: '', remote: false, type: 'Full-time', salaryMin: '', salaryMax: '', category: 'Optometrist', description: '', requirements: '', contactEmail: '' });
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={submitted ? resetForm : onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Post a Job</h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Reach thousands of eye care professionals</p>
                </div>
              </div>
              <button onClick={submitted ? resetForm : onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 dark:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                      Job Title <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Optometrist – Cornea Specialist"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                      Company / Organization <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="e.g. Aravind Eye Care"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Location + Remote */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Location</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g. Mumbai, India"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors whitespace-nowrap">
                        <input
                          type="checkbox"
                          name="remote"
                          checked={formData.remote}
                          onChange={handleChange}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-gray-300 font-medium">Remote</span>
                      </label>
                    </div>
                  </div>

                  {/* Type + Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Job Type</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none"
                        >
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Category</label>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none"
                        >
                          <option>Optometrist</option>
                          <option>Optician</option>
                          <option>Lab Technician</option>
                          <option>Practice Manager</option>
                          <option>Academic/Research</option>
                          <option>Sales Representative</option>
                          <option>Clinical Research</option>
                          <option>Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Salary Range</label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="salaryMin"
                          value={formData.salaryMin}
                          onChange={handleChange}
                          placeholder="Min"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                      <span className="text-slate-400 dark:text-gray-500 font-medium">to</span>
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          name="salaryMax"
                          value={formData.salaryMax}
                          onChange={handleChange}
                          placeholder="Max"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Requirements (one per line)</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={3}
                      placeholder={"OD degree from an accredited institution\n3+ years clinical experience\nLicensed to practice"}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                      Contact Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="hiring@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Job Posted Successfully!</h3>
                  <p className="text-slate-600 dark:text-gray-400 max-w-sm mb-8">
                    Your job listing is now live on FocusLinks. Thousands of eye care professionals will see it.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Post Another Job
                    </button>
                    <Link to="/jobs">
                      <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                        Browse Jobs
                      </button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {!submitted && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post Job
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Jobs Component ───────────────────────────────────────────
export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const matchesSearch = searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
      const matchesType = selectedType === 'All' || job.type === selectedType;

      const matchesLocation = selectedLocation === 'All' ||
        (selectedLocation === 'Remote' ? job.remote : job.location.includes(selectedLocation));

      return matchesSearch && matchesCategory && matchesType && matchesLocation;
    });
  }, [searchQuery, selectedCategory, selectedType, selectedLocation]);

  const activeFilterCount = [selectedCategory, selectedType, selectedLocation].filter(f => f !== 'All').length;

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedLocation('All');
    setSearchQuery('');
  };

  const uniqueCompanies = 0;

  return (
    <>
      <SEO title="Optometry Jobs & Careers" description="Find optometry job opportunities, residencies, and career resources." keywords="optometry jobs, eye care careers, optometrist employment, residency" />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-2000" />
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
              Eye Care Careers Hub
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Jobs &{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Opportunities
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto mb-8">
              Find your dream role in optometry and eye care. Connect with top employers worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => document.getElementById('job-listings')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 hover:shadow-lg hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <Search className="w-4 h-4" />
                Browse Jobs
              </button>
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Post a Job
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { label: 'Open Positions', value: mockJobs.length, icon: Briefcase },
              { label: 'Categories', value: categories.length - 1, icon: Filter },
              { label: 'Companies', value: uniqueCompanies, icon: Building2 },
            ].map((stat) => (
              <div key={stat.label} className="glass-card dark:bg-white/5 rounded-xl p-4 text-center border border-white/20">
                <stat.icon className="w-5 h-5 text-blue-200 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-medium text-blue-200/70 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div id="job-listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-20">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-4 sm:p-5 mb-8">
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, company, keyword, or location..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Post a Job
              </button>
            </div>
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Quick category chips */}
              <div className="hidden md:flex items-center gap-1.5">
                {['All', 'Optometrist', 'Clinical Research', 'Sales Representative', 'Academic/Research'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-gray-400 hidden sm:inline">
                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      {categories.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Job Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      {jobTypes.map(t => (
                        <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                    >
                      {locations.map(l => (
                        <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Featured Jobs (if any match) */}
        {selectedCategory === 'All' && selectedType === 'All' && selectedLocation === 'All' && searchQuery === '' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-5">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Featured Opportunities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockJobs.filter(j => j.featured).map((job, idx) => (
                <JobCard key={job.id} job={job} index={idx} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Job Listings Grid */}
        <div>
          {filteredJobs.length > 0 && (searchQuery || selectedCategory !== 'All' || selectedType !== 'All' || selectedLocation !== 'All') && (
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedCategory !== 'All' ? selectedCategory : 'All'} Jobs
              </h2>
              <span className="text-sm text-slate-500 dark:text-gray-400">
                Showing {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${selectedType}-${selectedLocation}-${searchQuery}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {/* If user is filtering, show all filtered jobs; otherwise show non-featured */}
              {(searchQuery || selectedCategory !== 'All' || selectedType !== 'All' || selectedLocation !== 'All'
                ? filteredJobs
                : filteredJobs.filter(j => !j.featured)
              ).map((job, idx) => (
                <JobCard key={job.id} job={job} index={idx} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No jobs found</h3>
              <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-4">
                No job listings are available yet. Be the first to post an opportunity!
              </p>
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Post a Job
              </button>
            </motion.div>
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-5 border border-white/20">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Hiring Eye Care Professionals?
            </h3>
            <p className="text-blue-100 max-w-lg mx-auto mb-6">
              Post your job listing on FocusLinks and reach thousands of qualified optometrists, opticians, and eye care specialists worldwide.
            </p>
            <button
              onClick={() => setShowPostModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 hover:shadow-lg hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Post a Job — It&apos;s Free
            </button>
          </div>
        </motion.div>
      </div>

      {/* Post a Job Modal */}
      <PostJobModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
    </div>
    </>
  );
}
