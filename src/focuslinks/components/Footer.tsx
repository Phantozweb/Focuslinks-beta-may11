'use client';
import { useState, useCallback } from 'react';
import {
  Eye,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Heart,
  Mail,
  Compass,
  BookOpen,
  ShieldCheck,
  Building2,
  ArrowRight,
  Send,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from '../../context/NavigationContext';
import { toast } from 'sonner';

const socialLinks = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/Phantozweb/Newfocuslinks', hoverBg: 'hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900' },
  { icon: Twitter, label: 'Twitter / X', href: '#', comingSoon: true, hoverBg: 'hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white' },
  { icon: Linkedin, label: 'LinkedIn', href: '#', comingSoon: true, hoverBg: 'hover:bg-blue-700 hover:text-white dark:hover:bg-blue-700 dark:hover:text-white' },
  { icon: Instagram, label: 'Instagram', href: '#', comingSoon: true, hoverBg: 'hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white' },
];

const platformLinks = [
  { label: 'Home', to: '/' },
  { label: 'Directory', to: '/directory' },
  { label: 'Feed', to: '/feed' },
  { label: 'Blog', to: '/blog' },
  { label: 'Labs', to: '/labs' },
  { label: 'Events', to: '/events' },
  { label: 'Community', to: '/community' },
];

const resourceLinks = [
  { label: 'Academy', to: '/academy' },
  { label: 'Webinars', to: '/webinar' },
  { label: 'Articles', to: '/blog' },
  { label: 'Help Center', to: '/help-center' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contactus' },
  { label: 'Supporters', to: '/supporters' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Team Application', to: '/team-application' },
];

const legalLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Accessibility', to: '/accessibility' },
];

function FooterLinkItem({ label, to, comingSoon }: { label: string; to: string; comingSoon?: boolean }) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (comingSoon) {
        e.preventDefault();
        toast.info('Coming Soon!', { description: `"${label}" is launching soon. Stay tuned!` });
      }
    },
    [comingSoon, label]
  );

  return (
    <li>
      <Link
        to={to}
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:translate-x-1 group"
      >
        <ChevronRight className="w-3 h-3 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-200 group-hover:translate-x-0.5" />
        {label}
        {comingSoon && (
          <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            SOON
          </span>
        )}
      </Link>
    </li>
  );
}

function SocialButton({
  icon: Icon,
  label,
  href,
  hoverBg,
  onComingSoon,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  hoverBg: string;
  onComingSoon?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (onComingSoon) {
      e.preventDefault();
      onComingSoon();
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all duration-300 shadow-sm hover:-translate-y-1 hover:shadow-lg focus-ring ${hoverBg}`}
      aria-label={`Follow us on ${label}`}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      toast.success('Subscribed!', {
        description: `You've been subscribed with ${newsletterEmail}. Welcome aboard!`,
      });
      setNewsletterEmail('');
    }, 800);
  };

  const handleSocialToast = (platform: string) => {
    toast.info('Coming Soon!', {
      description: `Our ${platform} channel is launching soon. Follow us on GitHub in the meantime!`,
    });
  };

  return (
    <>
      {/* Animated gradient line separator above footer */}
      <div className="gradient-separator-animated" />

      <footer
        className="bg-white dark:bg-slate-950 pt-0 pb-8 relative"
        role="contentinfo"
        aria-label="Site footer"
      >
        {/* ─── Newsletter Section with Gradient Background ─── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700">
          {/* Decorative floating circles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl float-circle-anim" />
            <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-white/5 rounded-full blur-2xl float-circle-anim float-circle-anim-delay-2" />
            <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl float-circle-anim float-circle-anim-delay-1" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left max-w-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Stay in the Loop
                </h3>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed">
                  Get the latest optometry insights, webinars, and community updates delivered to your inbox.
                </p>
              </div>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex w-full md:w-auto gap-2"
              >
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 min-w-0 md:w-72 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-200/60 text-sm focus:ring-2 focus:ring-white/40 focus:border-white/40 outline-none transition-all"
                  aria-label="Newsletter email address"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={subscribing}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-bold text-sm transition-all duration-200 hover:shadow-lg flex items-center gap-2 shrink-0 focus-ring disabled:opacity-70"
                  aria-label="Subscribe to newsletter"
                >
                  {subscribing ? (
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-700 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Subscribe
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          {/* ─── 5-Column Grid ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-14">

            {/* Column 1: FocusLinks Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-sm">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  FocusLinks
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                Connecting the global optometry community. Find peers, discover opportunities, and grow your career with us.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-2.5" role="list" aria-label="Social media links">
                {socialLinks.map((social) => (
                  <SocialButton
                    key={social.label}
                    icon={social.icon}
                    label={social.label}
                    href={social.href}
                    hoverBg={social.hoverBg}
                    onComingSoon={social.comingSoon ? () => handleSocialToast(social.label) : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Column 2: Platform */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-500" />
                Platform
              </h4>
              <ul className="space-y-3" role="list" aria-label="Platform links">
                {platformLinks.map((link) => (
                  <FooterLinkItem key={link.label} {...link} />
                ))}
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Resources
              </h4>
              <ul className="space-y-3" role="list" aria-label="Resource links">
                {resourceLinks.map((link) => (
                  <FooterLinkItem key={link.label} {...link} />
                ))}
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                Company
              </h4>
              <ul className="space-y-3" role="list" aria-label="Company links">
                {companyLinks.map((link) => (
                  <FooterLinkItem key={link.label} {...link} />
                ))}
              </ul>
            </div>

            {/* Column 5: Legal */}
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                Legal
              </h4>
              <ul className="space-y-3" role="list" aria-label="Legal links">
                {legalLinks.map((link) => (
                  <FooterLinkItem key={link.label} {...link} />
                ))}
              </ul>
            </div>
          </div>

          {/* ─── Bottom Bar ─── */}
          <div className="border-t border-gray-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-500 font-medium flex items-center gap-1.5">
              &copy; {currentYear} Focus Links. Made with{' '}
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 heart-pulse" />{' '}
              for optometrists worldwide.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
              <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <span aria-hidden="true">&middot;</span>
              <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <span aria-hidden="true">&middot;</span>
              <Link to="/help-center" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>



      <style jsx>{`
        .gradient-separator-animated {
          height: 3px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            #3b82f6 20%,
            #8b5cf6 40%,
            #ec4899 60%,
            #f59e0b 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: gradient-x 4s ease infinite;
        }
        .dark .gradient-separator-animated {
          background: linear-gradient(
            90deg,
            transparent 0%,
            #3b82f680 20%,
            #8b5cf680 40%,
            #ec489980 60%,
            #f59e0b80 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: gradient-x 4s ease infinite;
        }
      `}</style>
    </>
  );
}
