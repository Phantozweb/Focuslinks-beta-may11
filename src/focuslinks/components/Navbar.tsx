'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Menu, X, ArrowRight, LogIn, UserPlus, User, LogOut, LayoutDashboard, Moon, Sun, Bell, Search, PenSquare, Settings, MessageCircle, Bookmark, Trophy, Library, ShoppingBag, ChevronDown, MoreHorizontal, Home, Users, Rss, FlaskConical, GraduationCap, BookOpen, Info, MessageSquare, Calendar, Heart, Briefcase, MapPin, Link2, Stethoscope } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useNavigate, useLocation } from '../../context/NavigationContext';
import { motion, AnimatePresence } from 'motion/react';
import { useUnreadCount } from '../../hooks/useNotifications';
import { generateSlug } from '../../hooks/useProfiles';

export default function Navbar() {
  const [menuOpenedAtPath, setMenuOpenedAtPath] = useState('/');
  const [menuToggle, setMenuToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dropdownOpenedAtPath, setDropdownOpenedAtPath] = useState('/');
  const [dropdownToggle, setDropdownToggle] = useState(false);
  const [moreDropdownOpenedAtPath, setMoreDropdownOpenedAtPath] = useState('/');
  const [moreDropdownToggle, setMoreDropdownToggle] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Derive open state - automatically closes when path changes
  const isMobileMenuOpen = menuToggle && menuOpenedAtPath === location.pathname;
  const isProfileDropdownOpen = dropdownToggle && dropdownOpenedAtPath === location.pathname;
  const isMoreDropdownOpen = moreDropdownToggle && moreDropdownOpenedAtPath === location.pathname;

  const openMobileMenu = () => { setMenuToggle(true); setMenuOpenedAtPath(location.pathname); };
  const closeMobileMenu = () => { setMenuToggle(false); };
  const openProfileDropdown = () => { setDropdownToggle(true); setDropdownOpenedAtPath(location.pathname); };
  const closeProfileDropdown = () => { setDropdownToggle(false); };
  const openMoreDropdown = () => { setMoreDropdownToggle(true); setMoreDropdownOpenedAtPath(location.pathname); };
  const closeMoreDropdown = () => { setMoreDropdownToggle(false); };
  const toggleMobileMenu = () => { if (isMobileMenuOpen) closeMobileMenu(); else openMobileMenu(); };
  const toggleProfileDropdown = () => { if (isProfileDropdownOpen) closeProfileDropdown(); else openProfileDropdown(); };
  const toggleMoreDropdown = () => { if (isMoreDropdownOpen) closeMoreDropdown(); else openMoreDropdown(); };

  const unreadCount = useUnreadCount(user?.membershipId);

  // isActive with prefix matching support
  const isActive = useCallback((path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  const isMoreActive = isActive('/community') || isActive('/academy') || isActive('/about') || isActive('/supporters') || isActive('/events') || isActive('/opto-map') || isActive('/professionals');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check login status
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('fl_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeProfileDropdown();
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        closeMoreDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuToggle && menuOpenedAtPath === location.pathname) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuToggle, menuOpenedAtPath, location.pathname]);

  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => { setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'); };

  const handleLogout = () => {
    localStorage.removeItem('fl_user');
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  // Primary nav links (shown directly in the pill)
  const primaryNavLinks = [
    { name: 'Home', path: user ? '/home' : '/', icon: Home },
    { name: 'Profiles', path: '/directory', icon: Users },
    { name: 'Feed', path: '/feed', icon: Rss },
    { name: 'Labs', path: '/labs', icon: FlaskConical, badge: 'New', badgeColor: 'emerald' },
    { name: 'Blog', path: '/blog', icon: BookOpen },
  ];

  // Secondary nav links (shown in More dropdown)
  const moreNavLinks = [
    { name: 'Professionals', path: '/professionals', icon: Stethoscope },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Community', path: '/community', icon: MessageSquare },
    { name: 'Academy', path: '/academy', icon: GraduationCap },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Opto Map', path: '/opto-map', icon: MapPin, badge: 'New', badgeColor: 'emerald' },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Supporters', path: '/supporters', icon: Heart },
  ];

  // Mobile nav links (all links shown in drawer)
  const mobileNavLinks = [
    ...primaryNavLinks,
    ...moreNavLinks,
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white text-xs sm:text-sm py-2 px-4 text-center flex items-center justify-center gap-2 relative z-50">
        <span className="font-medium text-blue-50">New to Focus Links? Join our global network of eye care professionals.</span>
        <Link to="/membership" className="font-bold text-white hover:text-blue-200 transition-colors flex items-center group shrink-0">
          Get Started <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Main Navbar */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-blue-100 dark:border-blue-900/30 py-2.5'
            : 'bg-white dark:bg-slate-900 border-b border-transparent py-3 backdrop-blur-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <Link to={user ? '/home' : '/'} className="flex items-center gap-2.5 group shrink-0">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">FocusLinks</span>
            </Link>

            {/* Desktop Center Navigation */}
            <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center space-x-0.5 bg-gray-50/80 dark:bg-slate-800/80 p-1 rounded-full border border-gray-100 dark:border-slate-700 backdrop-blur-md">
                {primaryNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-3 py-2 rounded-full text-sm font-medium nav-link-hover flex items-center gap-1.5 transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-slate-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <link.icon className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">{link.name}</span>
                    {link.badge && (
                      <span className={`ml-0.5 px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full ${
                        link.badgeColor === 'emerald'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                          : link.badgeColor === 'teal'
                            ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}

                {/* More Dropdown */}
                <div className="relative" ref={moreDropdownRef}>
                  <button
                    onClick={toggleMoreDropdown}
                    className={`relative px-3 py-2 rounded-full text-sm font-medium nav-link-hover flex items-center gap-1.5 transition-all duration-200 ${
                      isMoreActive
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-slate-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">More</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isMoreDropdownOpen && moreDropdownOpenedAtPath === location.pathname && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden z-50 py-1.5"
                      >
                        {moreNavLinks.map((link) => (
                          <Link
                            key={link.name}
                            to={link.path}
                            onClick={closeMoreDropdown}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                              isActive(link.path)
                                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive(link.path)
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
                            }`}>
                              <link.icon className="h-4 w-4" />
                            </div>
                            <span className="flex-1">{link.name}</span>
                            {link.badge && (
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full ${
                                link.badgeColor === 'emerald'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                  : link.badgeColor === 'teal'
                                    ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
                                    : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                              }`}>
                                {link.badge}
                              </span>
                            )}
                            {isActive(link.path) && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                            )}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Desktop Right Actions */}
            <div className="hidden lg:flex items-center space-x-2 shrink-0">
              {/* Search Button */}
              <Link
                to="/search"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200 border border-gray-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800/40"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Link>

              {/* Create Post Button (logged in) */}
              {user && (
                <button
                  onClick={() => navigate('/feed')}
                  className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  Create Post
                </button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200 border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none min-w-[18px] h-[18px]">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 hover:-translate-y-0.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{(user.name || 'User').split(' ')[0]}</span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user.membershipId}</span>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileDropdownOpen && dropdownOpenedAtPath === location.pathname && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="p-4 border-b border-gray-50 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-900/10">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>

                        {/* Quick Actions Section */}
                        <div className="py-1.5">
                          <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Quick Actions</p>
                          <Link
                            to={`/user/${generateSlug(user.name)}`}
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            My Profile
                          </Link>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            </div>
                            Dashboard
                          </Link>
                          <Link
                            to="/messages"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <MessageCircle className="w-3.5 h-3.5" />
                            </div>
                            Messages
                          </Link>
                          <Link
                            to="/connections"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <Link2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="flex-1">Connections</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">New</span>
                          </Link>
                          <Link
                            to="/bookmarks"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <Bookmark className="w-3.5 h-3.5" />
                            </div>
                            Bookmarks
                          </Link>
                        </div>

                        {/* Explore Section */}
                        <div className="py-1.5 border-t border-gray-100 dark:border-slate-700">
                          <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Explore</p>
                          <Link
                            to="/leaderboard"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <Trophy className="w-3.5 h-3.5" />
                            </div>
                            <span className="flex-1">Leaderboard</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">New</span>
                          </Link>
                          <Link
                            to="/resources"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                              <Library className="w-3.5 h-3.5" />
                            </div>
                            <span className="flex-1">Resources</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">New</span>
                          </Link>
                          <Link
                            to="/marketplace"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </div>
                            <span className="flex-1">Marketplace</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">New</span>
                          </Link>
                        </div>

                        {/* Settings & Logout */}
                        <div className="py-1.5 border-t border-gray-100 dark:border-slate-700">
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
                              <Settings className="w-3.5 h-3.5" />
                            </div>
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mx-1"
                          >
                            <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                              <LogOut className="w-3.5 h-3.5" />
                            </div>
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 px-3 py-2"
                  >
                    <LogIn className="w-4 h-4" /> <span className="hidden xl:inline">Login</span>
                  </Link>

                  <Link
                    to="/membership"
                    className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 text-sm font-bold rounded-full transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 transform hover:-translate-y-0.5"
                  >
                    <UserPlus className="w-4 h-4" /> <span className="hidden xl:inline">Join Now</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center gap-3">
              {user && (
                <Link to="/home" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </Link>
              )}
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors border border-gray-200 dark:border-slate-700"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-slate-900 shadow-2xl z-[70] lg:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link to={user ? '/home' : '/'} onClick={closeMobileMenu} className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">FocusLinks</span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-grow overflow-y-auto p-4 space-y-1 custom-scrollbar">
                {/* Main Navigation Links */}
                <div className="space-y-0.5">
                  {mobileNavLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={closeMobileMenu}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
                        isActive(link.path)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                          : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive(link.path)
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400'
                      }`}>
                        <link.icon className="h-4 w-4" />
                      </div>
                      <span className="flex-1">{link.name}</span>
                      {link.badge && (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full ${
                          link.badgeColor === 'emerald'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                            : link.badgeColor === 'teal'
                              ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                        }`}>
                          {link.badge}
                        </span>
                      )}
                      {isActive(link.path) && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
                    </Link>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-3" />

                {/* User Actions */}
                <div className="space-y-0.5">
                  {user ? (
                    <>
                      {/* User Card */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-sm shrink-0">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name || 'User'}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 font-mono truncate">{user.membershipId}</p>
                        </div>
                      </div>

                      <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Account</p>
                      <Link
                        to={`/user/${generateSlug(user.name)}`}
                        onClick={closeMobileMenu}
                        className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="flex-1">My Profile</span>
                      </Link>
                      {(
                        [
                          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
                          { to: '/messages', icon: MessageCircle, label: 'Messages', iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
                          { to: '/notifications', icon: Bell, label: 'Notifications', iconBg: 'bg-orange-50 dark:bg-orange-900/30', iconColor: 'text-orange-600 dark:text-orange-400', badge: unreadCount },
                          { to: '/connections', icon: Link2, label: 'Connections', iconBg: 'bg-emerald-50 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
                          { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks', iconBg: 'bg-indigo-50 dark:bg-indigo-900/30', iconColor: 'text-indigo-600 dark:text-indigo-400' },
                          { to: '/settings', icon: Settings, label: 'Settings', iconBg: 'bg-gray-100 dark:bg-slate-700', iconColor: 'text-gray-600 dark:text-gray-400' },
                        ] as const
                      ).map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={closeMobileMenu}
                          className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-all"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1">{item.label}</span>
                          {'badge' in item && item.badge && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{item.badge}</span>
                          )}
                        </Link>
                      ))}

                      {/* Explore Section */}
                      <p className="px-4 py-1.5 mt-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Explore</p>
                      {[
                        { to: '/opto-map', icon: MapPin, label: 'Opto Map', badge: true },
                        { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', badge: true },
                        { to: '/resources', icon: Library, label: 'Resources', badge: true },
                        { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace', badge: true },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={closeMobileMenu}
                          className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-3 transition-all"
                        >
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold leading-none rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">New</span>
                          )}
                        </Link>
                      ))}

                      {/* Logout */}
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-3" />
                      <button
                        onClick={() => { handleLogout(); closeMobileMenu(); }}
                        className="w-full px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-all text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                          <LogOut className="h-4 w-4" />
                        </div>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="px-4 py-3.5 rounded-xl text-sm font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-50 flex items-center gap-3 transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-gray-400">
                          <LogIn className="h-4 w-4" />
                        </div>
                        Log In
                      </Link>
                      <Link
                        to="/membership"
                        onClick={closeMobileMenu}
                        className="px-4 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3 shadow-lg shadow-blue-200 transition-all active:scale-95"
                      >
                        <UserPlus className="h-5 w-5" /> Join Now
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-center text-xs text-slate-400 dark:text-gray-500 font-medium">
                  &copy; {new Date().getFullYear()} FocusLinks. All rights reserved.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


