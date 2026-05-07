'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Search, Globe, Users, Building2, GraduationCap,
  Stethoscope, X, ArrowUpDown,
  Crosshair, Navigation, Map as MapIcon, Phone, Clock, Star,
  SlidersHorizontal, Maximize2, Minimize2, ChevronDown,
} from 'lucide-react';
import SEO from '../components/SEO';
import type { MapProfile, MapData } from '../components/MapContainer';

// Dynamic import of MapContainer - MUST use ssr: false because Leaflet needs window
const MapContainer = dynamic(() => import('../components/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 via-teal-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-800 animate-ping opacity-20" />
          <MapPin className="absolute inset-0 m-auto w-8 h-8 text-teal-500 dark:text-teal-400 animate-bounce" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 animate-pulse">Initializing map...</p>
      </div>
    </div>
  ),
});

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'professional' | 'student' | 'clinic';
type NearbySortBy = 'distance' | 'name';

interface NearbyItem extends MapProfile {
  distance: number;
}

// ─── Haversine Distance ─────────────────────────────────────────────────────

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Nearby Card ─────────────────────────────────────────────────────────────

function NearbyCard({ item, onViewOnMap }: { item: NearbyItem; onViewOnMap: (p: MapProfile) => void }) {
  const isClinic = item.type === 'clinic' || item.source === 'clinic';
  const isStudent = item.type === 'student';

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onViewOnMap(item)}
      className="w-full bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-3 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isClinic ? 'bg-emerald-50 dark:bg-emerald-900/30' : isStudent ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-teal-50 dark:bg-teal-900/30'
        }`}>
          {isClinic ? <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> :
           isStudent ? <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" /> :
           <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
          {item.title && <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">{item.title}</p>}
          <div className="flex items-center gap-2 mt-1">
            {item.location && (
              <span className="text-[11px] text-slate-400 dark:text-gray-500 truncate flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" /> {item.city || item.location}
              </span>
            )}
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 ml-auto shrink-0">
              {item.distance < 1 ? `${Math.round(item.distance * 1000)}m` : `${item.distance.toFixed(1)} km`}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Nearby Panel ─────────────────────────────────────────────────────────────

function NearbyPanel({
  isOpen,
  onClose,
  items,
  sortBy,
  onSortChange,
  radius,
  onRadiusChange,
  onViewOnMap,
}: {
  isOpen: boolean;
  onClose: () => void;
  items: NearbyItem[];
  sortBy: NearbySortBy;
  onSortChange: (s: NearbySortBy) => void;
  radius: number;
  onRadiusChange: (r: number) => void;
  onViewOnMap: (p: MapProfile) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 z-[500]" onClick={onClose} />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-[501] max-h-[55vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /></div>

            {/* Header */}
            <div className="px-4 pb-2.5 border-b border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-rose-400" />
                  Nearby
                </h2>
                <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Sort + Radius */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as NearbySortBy)}
                    className="w-full py-1.5 px-2 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="distance">Nearest</option>
                    <option value="name">Name</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400">Radius:</span>
                  <select
                    value={radius}
                    onChange={(e) => onRadiusChange(Number(e.target.value))}
                    className="py-1.5 px-2 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                    <option value={100}>100 km</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-3 space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-400 dark:text-gray-500">No results nearby</p>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">Try increasing the radius</p>
                </div>
              ) : (
                items.map(item => <NearbyCard key={item._nearbyKey} item={item} onViewOnMap={onViewOnMap} />)
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main OptoMap Page ──────────────────────────────────────────────────────

export default function OptoMap() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<MapProfile | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [nearbySortBy, setNearbySortBy] = useState<NearbySortBy>('distance');
  const [nearbyLat, setNearbyLat] = useState<number | null>(null);
  const [nearbyLng, setNearbyLng] = useState<number | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState(25);
  const [centerOn, setCenterOn] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(3);
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Toast dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => { setDarkMode(document.documentElement.classList.contains('dark')); };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch map data
  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/opto-map');
      if (!response.ok) throw new Error('Failed to fetch map data');
      const data = await response.json();
      setMapData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMapData(); }, [fetchMapData]);

  // Nearby items: ALL types (professionals + students + clinics)
  const nearbyItems = useMemo(() => {
    if (!mapData || nearbyLat === null || nearbyLng === null) return [];
    const all = [
      ...mapData.profiles,
      ...mapData.users,
      ...(mapData.clinics || []),
    ].filter(p => p.lat && p.lng);

    let items = all.map((p, idx) => ({
      ...p,
      _nearbyKey: `${p.source || 'profile'}-${p.id || idx}-${p.name}`,
      distance: haversineDistance(nearbyLat, nearbyLng, p.lat, p.lng),
    })).filter(p => p.distance <= nearbyRadius);

    // Deduplicate by name+location to avoid showing same entry twice
    const seen = new Set<string>();
    items = items.filter(p => {
      const key = `${p.name}|${p.location}|${p.lat.toFixed(2)}|${p.lng.toFixed(2)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort
    if (nearbySortBy === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      items.sort((a, b) => a.distance - b.distance);
    }

    return items.slice(0, 50); // Cap at 50 for performance
  }, [mapData, nearbyLat, nearbyLng, nearbyRadius, nearbySortBy]);

  // Find nearby handler
  const handleFindNearby = useCallback(() => {
    if (!navigator.geolocation) {
      setToastMessage('Geolocation is not supported.');
      return;
    }
    setToastMessage('Locating you...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setNearbyLat(lat);
        setNearbyLng(lng);
        setNearbySortBy('distance');
        setShowNearby(true);
        setCenterOn({ lat, lng, zoom: 11 });
        setToastMessage('Showing nearby professionals, students & clinics.');
      },
      () => {
        setToastMessage('Location access denied.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // View on map handler
  const handleViewOnMap = useCallback((profile: MapProfile) => {
    setSelectedProfile(profile);
    setCenterOn({ lat: profile.lat, lng: profile.lng, zoom: 14 });
    setShowNearby(false);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!mapWrapperRef.current) return;
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const FILTER_OPTIONS: { key: FilterType; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'all', label: 'All', icon: Globe, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-300' },
    { key: 'professional', label: 'Optometrists', icon: Stethoscope, color: 'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400' },
    { key: 'student', label: 'Students', icon: GraduationCap, color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' },
    { key: 'clinic', label: 'Clinics', icon: Building2, color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' },
  ];

  const activeFilter = FILTER_OPTIONS.find(f => f.key === filterType);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <SEO title="Opto Map | FocusLinks" description="Discover optometrists, clinics, and community members around the world" />

      {/* ─── Mobile Header (top bar) ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 lg:hidden">
        <div className="px-3 py-2.5 flex items-center gap-2">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shrink-0">
            <MapIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-white">Opto Map</h1>
          <div className="flex-1" />

          {/* Nearby */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFindNearby}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              showNearby
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nearby</span>
          </motion.button>

          {/* Fullscreen */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-gray-400"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Search bar */}
        <div className="px-3 pb-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Search..."
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-3.5 h-3.5" /></button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-3 pb-2.5 flex gap-1.5 overflow-x-auto hide-scrollbar">
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 border ${
                filterType === f.key
                  ? `${f.color} border-current`
                  : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-gray-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              <f.icon className="w-3 h-3" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Desktop Header ────────────────────────────────────────────── */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-[1920px] mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <MapIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Opto Map</h1>
                <p className="text-xs text-slate-500 dark:text-gray-400 hidden xl:block">Discover optometrists, clinics & students worldwide</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-72 xl:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Search by city, name..."
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {FILTER_OPTIONS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === f.key
                      ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Active filter badge */}
            {activeFilter && filterType !== 'all' && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${activeFilter.color}`}>
                {React.createElement(activeFilter.icon, { className: 'w-3.5 h-3.5' })}
                {activeFilter.label}
                <button onClick={() => setFilterType('all')} className="ml-0.5"><X className="w-3 h-3" /></button>
              </div>
            )}

            <div className="flex-1" />

            {/* Nearby */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFindNearby}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                showNearby
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              Find Nearby
            </motion.button>

            {/* Fullscreen */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-gray-400"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ─── Map ──────────────────────────────────────────────────────── */}
      <div ref={mapWrapperRef} className="flex-1 relative" style={{ minHeight: 'calc(100vh - 130px)', height: 'calc(100vh - 130px)' }}>
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center px-6">
              <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-600 dark:text-gray-300 mb-1">Unable to load</h3>
              <p className="text-sm text-slate-400 dark:text-gray-500 mb-4">{error}</p>
              <button onClick={fetchMapData} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold">Retry</button>
            </div>
          </div>
        ) : (
          <MapContainer
            data={mapData}
            loading={loading}
            filterType={filterType}
            searchQuery={searchQuery}
            darkMode={darkMode}
            selectedProfile={selectedProfile}
            onSelectProfile={setSelectedProfile}
            centerOn={centerOn}
            onZoomChange={setCurrentZoom}
          />
        )}

        {/* Zoom hint (bottom center, mobile only) */}
        {currentZoom < 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center gap-2 lg:hidden"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">Zoom in for details</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </motion.div>
        )}

        {/* Nearby Panel */}
        <NearbyPanel
          isOpen={showNearby}
          onClose={() => setShowNearby(false)}
          items={nearbyItems}
          sortBy={nearbySortBy}
          onSortChange={setNearbySortBy}
          radius={nearbyRadius}
          onRadiusChange={setNearbyRadius}
          onViewOnMap={handleViewOnMap}
        />
      </div>

      {/* ─── Toast ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
