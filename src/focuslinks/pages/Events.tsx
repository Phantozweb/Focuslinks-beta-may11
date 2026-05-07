'use client';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Zap, Monitor, Trophy, Filter, ChevronLeft, ChevronRight, Users, Sparkles, Timer } from 'lucide-react';
import { Link, useNavigate } from '../../context/NavigationContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import SEO from '../components/SEO';

const events: Array<{ id: number; title: string; date: string; dateObj: Date; location: string; type: string; description: string; image: string; link: string; attendees: number; seats: number }> = [];

// ─── Countdown Timer Component ─────────────────────────────────────
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calcTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    // Use interval with immediate first call via timeout(0) to avoid set-state-in-effect
    const timer = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    // Defer the initial set to avoid synchronous setState in effect body
    const immediate = setTimeout(() => setTimeLeft(calcTimeLeft()), 0);
    return () => { clearInterval(timer); clearTimeout(immediate); };
  }, [targetDate]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="countdown-digit text-2xl sm:text-3xl font-black text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center min-w-[3rem] sm:min-w-[4rem]">
              {String(unit.value).padStart(2, '0')}
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-blue-200/70 mt-1.5 uppercase tracking-widest">{unit.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-white/40 font-bold text-xl mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Simple Calendar View ──────────────────────────────────────────
function MiniCalendar({ events: eventList }: { events: typeof events }) {
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const today = new Date();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Get event days for current month
  const eventDays = eventList
    .filter(e => e.dateObj.getMonth() === viewMonth && e.dateObj.getFullYear() === viewYear)
    .map(e => e.dateObj.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-gray-400">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {monthNames[viewMonth]} {viewYear}
        </h3>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-gray-400">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map(d => (
          <div key={d} className="text-center text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-gray-500 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-7 sm:h-9" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const hasEvent = eventDays.includes(day);
          return (
            <div 
              key={day}
              className={`h-7 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium relative transition-colors
                ${isToday 
                  ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30' 
                  : hasEvent 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              {day}
              {hasEvent && !isToday && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 calendar-event-dot" />
              )}
              {hasEvent && isToday && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400">
          <div className="calendar-event-dot" />
          <span>{eventDays.length} event{eventDays.length !== 1 ? 's' : ''} this month</span>
        </div>
      </div>
    </div>
  );
}

// ─── Event Card with Register Button ───────────────────────────────
function EventCard({ event, index }: { event: typeof events[0]; index: number }) {
  const navigate = useNavigate();
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const isPast = event.dateObj < new Date();
  const isLive = !isPast && event.dateObj.toDateString() === new Date().toDateString();
  const isFull = event.attendees >= event.seats;
  const typeColors: Record<string, string> = {
    Competition: 'from-orange-500 to-rose-500',
    Conference: 'from-blue-500 to-indigo-500',
    Webinar: 'from-purple-500 to-pink-500',
    Workshop: 'from-emerald-500 to-teal-500',
  };

  const handleRegister = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      setRegistered(true);
      toast.success('Registration successful! 🎉', {
        description: `You're registered for ${event.title}`,
        duration: 4000,
      });
    }, 1500);
  }, [event.title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover-lift hover-glow flex flex-col h-full transition-all duration-300">
          <div className="h-48 overflow-hidden relative">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className={`bg-gradient-to-r ${typeColors[event.type] || 'from-blue-500 to-indigo-500'} px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm`}>
                {event.type}
              </span>
              {isPast && (
                <span className="px-2.5 py-0.5 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Past
                </span>
              )}
              {isLive && (
                <span className="px-2.5 py-0.5 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Live
                </span>
              )}
            </div>
            {/* Attendee count */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-semibold text-slate-700 dark:text-gray-300 shadow-sm">
              <Users className="w-3 h-3" />
              {event.attendees.toLocaleString()}
            </div>
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {event.title}
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-slate-600 dark:text-gray-400 text-sm">
                <Calendar className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
                {event.date}
              </div>
              <div className="flex items-center text-slate-600 dark:text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
                {event.location}
              </div>
            </div>
            <p className="text-slate-600 dark:text-gray-400 text-sm mb-6 flex-grow leading-relaxed">
              {event.description}
            </p>

            {/* Register / View Details CTA */}
            {!isPast && (
              <button
                onClick={handleRegister}
                disabled={registered || isFull}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 group/btn ${
                  registered 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                    : isFull
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                {registering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </>
                ) : registered ? (
                  <>
                    <span className="text-emerald-500">✓</span>
                    Registered
                  </>
                ) : isFull ? (
                  'Seats Full'
                ) : (
                  <>
                    Register Now
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}

            {isPast && (
              <button
                onClick={() => navigate(event.link)}
                className="inline-flex items-center justify-center w-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-gray-400 px-4 py-3 rounded-xl font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group/btn border border-slate-200 dark:border-slate-700"
              >
                View Recording
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
    </motion.div>
  );
}

// ─── Main Events Component ─────────────────────────────────────────
export default function Events() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCalendar, setShowCalendar] = useState(false);

  const filters = ['All', 'Upcoming', 'Past', 'Webinars', 'Competitions'];
  
  const now = new Date();
  
  const filteredEvents = events.filter(event => {
    switch (activeFilter) {
      case 'Upcoming': return event.dateObj >= now;
      case 'Past': return event.dateObj < now;
      case 'Webinars': return event.type === 'Webinar';
      case 'Competitions': return event.type === 'Competition';
      default: return true;
    }
  });

  // Next upcoming event for countdown
  const nextEvent = events
    .filter(e => e.dateObj >= now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

  const filterIcons: Record<string, React.ReactNode> = {
    All: <Filter className="w-3.5 h-3.5" />,
    Upcoming: <Zap className="w-3.5 h-3.5" />,
    Past: <Clock className="w-3.5 h-3.5" />,
    Webinars: <Monitor className="w-3.5 h-3.5" />,
    Competitions: <Trophy className="w-3.5 h-3.5" />,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <SEO title="Optometry Events & Webinars" description="Upcoming optometry events, webinars, conferences, and workshops. Connect with global eye care professionals at FocusLinks events." keywords="optometry events, eye care webinars, vision conferences, optometry workshops" />
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 pt-32 pb-20 lg:pt-40 lg:pb-28">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-float animation-delay-2000" />
          <div className="absolute -bottom-10 right-1/4 w-64 h-64 bg-purple-400/15 rounded-full blur-3xl animate-float animation-delay-4000" />
          {/* Grid pattern */}
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
              Learn, Compete & Connect
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Events &{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Webinars
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Discover upcoming conferences, competitions, and educational webinars to advance your career in optometry.
            </p>
          </motion.div>

          {/* Countdown for next event */}
          {nextEvent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 max-w-2xl mx-auto"
            >
              <div className="glass-card dark:bg-white/5 rounded-2xl p-6 border border-white/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Timer className="w-5 h-5 text-blue-200" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">Next Event</p>
                      <p className="text-sm font-bold text-white">{nextEvent.title}</p>
                    </div>
                  </div>
                  <CountdownTimer targetDate={nextEvent.dateObj} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-16">
        {/* Filter Tabs & Calendar Toggle */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-3 sm:p-4 mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {filterIcons[filter]}
                  {filter}
                </button>
              ))}
            </div>

            {/* Calendar toggle */}
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 shrink-0 ${
                showCalendar 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30' 
                  : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Event Cards Grid */}
          <div className={`lg:col-span-${showCalendar ? '3' : '4'}`}>
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeFilter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredEvents.map((event, idx) => (
                  <EventCard key={event.id} event={event} index={idx} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16 col-span-full">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-10 h-10 text-slate-300 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No events found</h3>
                <p className="text-slate-500 dark:text-gray-400">No events match the selected filter. Try a different category.</p>
              </div>
            )}
          </div>

          {/* Calendar Sidebar */}
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-1"
              >
                <div className="lg:sticky lg:top-28">
                  <MiniCalendar events={events} />
                  
                  {/* Event Stats */}
                  <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-gray-400">Total Events</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{events.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-gray-400">Upcoming</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{events.filter(e => e.dateObj >= now).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-gray-400">Total Attendees</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{events.reduce((sum, e) => sum + e.attendees, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
