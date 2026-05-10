'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap, Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight, Users, MapPin } from 'lucide-react';
import { Link } from '../../context/NavigationContext';

// ─── Types ───────────────────────────────────────────────────────────────
interface MapPoint {
  lat: number;
  lng: number;
  type: string;
  source?: string;
  name?: string;
  country?: string;
  id?: string;
}

// ─── Mini Marker Icon ────────────────────────────────────────────────────
function createMiniIcon(type: string): L.DivIcon {
  const color = type === 'student' ? '#D97706' : type === 'clinic' || type === 'institution' ? '#059669' : '#0D9488';
  return L.divIcon({
    className: 'mini-marker',
    html: `<div style="width:8px;height:8px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });
}

// ─── Mini Cluster Icon ───────────────────────────────────────────────────
function createMiniClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 10 ? 32 : count < 50 ? 40 : 50;
  return L.divIcon({
    className: 'mini-cluster',
    html: `<div style="width:${size}px;height:${size}px;background:#0D9488;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${size < 40 ? 10 : 12}px;font-weight:800;color:white;text-shadow:0 1px 2px rgba(0,0,0,0.3);box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:system-ui,sans-serif;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Cluster CSS Override ────────────────────────────────────────────────
function ClusterStyles() {
  return (
    <style>{`
      .mini-marker { background: none !important; border: none !important; }
      .mini-cluster { background: none !important; border: none !important; }
    `}</style>
  );
}

// ─── Fit Bounds ──────────────────────────────────────────────────────────

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || points.length === 0) return;
    fitted.current = true;
    const valid = points.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.35), { maxZoom: 3, animate: true });
  }, [map, points]);
  return null;
}

// ─── Main MiniMap Component (Pin Markers + Clustering) ───────────────────

interface MapStats {
  totalProfiles: number;
  totalUsers: number;
  totalClinics: number;
  countriesCount: number;
}

export default function MiniOptoMap() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapStats, setMapStats] = useState<MapStats | null>(null);

  // Detect dark mode
  useEffect(() => {
    const checkDark = () => { setDarkMode(document.documentElement.classList.contains('dark')); };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/opto-map');
        if (!res.ok) return;
        const data = await res.json();
        const all = [
          ...(data.profiles || []),
          ...(data.users || []),
          ...(data.clinics || []),
        ];
        const valid = all
          .filter((p: any) => p.lat && p.lng && Number.isFinite(p.lat) && Number.isFinite(p.lng))
          .map((p: any, idx: number) => ({
            lat: p.lat, lng: p.lng,
            type: p.type || 'professional', source: p.source,
            name: p.name, country: p.country || '',
            id: p.id || p.name || `pt-${idx}`,
          }));
        setPoints(valid);

        // Store real stats from the API
        if (data.stats) {
          setMapStats({
            totalProfiles: data.stats.totalProfiles || 0,
            totalUsers: data.stats.totalUsers || 0,
            totalClinics: data.stats.totalClinics || 0,
            countriesCount: data.stats.countriesCount || 0,
          });
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Count by type
  const professionalCount = points.filter(p => p.type !== 'student' && p.type !== 'clinic' && p.source !== 'clinic').length;
  const studentCount = points.filter(p => p.type === 'student').length;
  const clinicCount = points.filter(p => p.type === 'clinic' || p.source === 'clinic').length;

  // Real total members from API (profiles + users, deduplicated by API)
  const totalMembers = mapStats
    ? mapStats.totalProfiles + mapStats.totalUsers
    : points.length;
  // Real countries count from API
  const realCountries = mapStats
    ? mapStats.countriesCount
    : new Set(points.map(p => p.country).filter(Boolean)).size;

  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  if (loading) {
    return (
      <div className="w-full h-[350px] sm:h-[450px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 via-teal-50/30 to-emerald-50/30 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12 mb-3">
            <div className="absolute inset-0 rounded-full border-3 border-teal-200 dark:border-teal-800 animate-ping opacity-20" />
            <Users className="absolute inset-0 m-auto w-6 h-6 text-teal-500 animate-bounce" />
          </div>
          <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] sm:h-[450px] relative rounded-2xl overflow-hidden">
      <LeafletMap
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        style={{ background: darkMode ? '#1a1a2e' : '#e5e7eb' }}
      >
        <TileLayer url={tileUrl} maxZoom={19} />
        <FitBounds points={points} />

        {/* Pin markers with clustering */}
        <ClusterStyles />
        <MarkerClusterGroup
          maxClusterRadius={50}
          iconCreateFunction={createMiniClusterIcon}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          chunkedLoading={true}
        >
          {points.map((p, idx) => (
            <Marker
              key={p.id || idx}
              position={[p.lat, p.lng]}
              icon={createMiniIcon(p.type)}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <span className="text-xs font-semibold whitespace-nowrap">{p.name || p.type}</span>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </LeafletMap>

      {/* Top-left: Expansion stats */}
      <div className="absolute top-3 left-3 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-2.5 flex items-center gap-2.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50">
          <GlobeIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <div className="text-[11px] font-extrabold text-gray-800 dark:text-white leading-tight">
            {totalMembers} Members
          </div>
          <div className="text-[9px] font-semibold text-slate-400 dark:text-gray-500 leading-tight">
            across {realCountries} countries
          </div>
        </div>
      </div>

      {/* Bottom CTA: Prominent call to explore professionals */}
      <div className="absolute bottom-0 left-0 right-0 z-[400] p-3">
        <Link
          to="/opto-map"
          className="flex items-center justify-between w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all group/cta"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-white">{professionalCount > 0 ? 'OP' : 'MD'}</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-white">ST</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-gray-800 dark:text-white leading-tight group-hover/cta:text-teal-700 dark:group-hover/cta:text-teal-400 transition-colors">
                Explore Professionals Near You
              </div>
              <div className="text-[10px] font-medium text-slate-400 dark:text-gray-500 leading-tight mt-0.5">
                {professionalCount} optometrists · {studentCount} students · {clinicCount} clinics
              </div>
            </div>
          </div>
          <div className="shrink-0 w-8 h-8 rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center shadow-md group-hover/cta:bg-teal-700 dark:group-hover/cta:bg-teal-600 transition-colors">
            <ArrowRight className="w-4 h-4 text-white group-hover/cta:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Top-right: Pin legend (compact) */}
      <div className="absolute top-3 right-3 z-[400]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/40 dark:border-slate-700/40 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Pins</span>
            <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Inline Globe Icon (no external dep) ─────────────────────────────────

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
