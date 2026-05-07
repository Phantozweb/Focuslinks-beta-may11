'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
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

// ─── Vibrant Density Heatmap Layer ───────────────────────────────────────
// Single unified teal gradient with additive blending for a cohesive
// global-expansion look. Larger radii = spots bleed across country borders.

function DensityHeatmapLayer({ points }: { points: MapPoint[] }) {
  const map = useMap();
  const overlayRef = useRef<L.Layer | null>(null);
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  useEffect(() => {
    if (!map || points.length === 0) {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    // High-res canvas for crisp rendering
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const lngSpan = ne.lng - sw.lng;
    const latSpan = ne.lat - sw.lat;
    const safeLngSpan = Math.abs(lngSpan) < 1e-10 ? 1 : lngSpan;
    const safeLatSpan = Math.abs(latSpan) < 1e-10 ? 1 : latSpan;
    const toCanvasX = (lng: number) => ((lng - sw.lng) / safeLngSpan) * canvas.width;
    const toCanvasY = (lat: number) => ((ne.lat - lat) / safeLatSpan) * canvas.height;

    // ── Pass 1: Build density grid ──
    const gridSize = 18;
    const density: Record<string, number> = {};
    points.forEach(p => {
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return;
      const gx = Math.floor(toCanvasX(p.lng) / gridSize);
      const gy = Math.floor(toCanvasY(p.lat) / gridSize);
      const key = `${gx},${gy}`;
      density[key] = (density[key] || 0) + 1;
    });

    let maxDensity = 1;
    Object.values(density).forEach(d => { if (d > maxDensity) maxDensity = d; });

    // ── Pass 2: Gaussian blur spread for smooth density field ──
    // Spread density into neighboring cells for a softer look
    const blurred: Record<string, number> = {};
    const blurRadius = 3;
    Object.entries(density).forEach(([key, val]) => {
      const [gx, gy] = key.split(',').map(Number);
      for (let dx = -blurRadius; dx <= blurRadius; dx++) {
        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > blurRadius + 0.5) continue;
          const falloff = Math.max(0, 1 - dist / (blurRadius + 0.5));
          const nk = `${gx + dx},${gy + dy}`;
          blurred[nk] = (blurred[nk] || 0) + val * falloff * falloff;
        }
      }
    });

    let maxBlurred = 1;
    Object.values(blurred).forEach(d => { if (d > maxBlurred) maxBlurred = d; });

    // ── Pass 3: Render with additive blending ──
    ctx.globalCompositeOperation = 'screen';

    const canvasW = canvas.width;
    const canvasH = canvas.height;

    Object.entries(blurred).forEach(([key, val]) => {
      const [gx, gy] = key.split(',').map(Number);
      const x = gx * gridSize + gridSize / 2;
      const y = gy * gridSize + gridSize / 2;

      if (x < -150 || x > canvasW + 150 || y < -150 || y > canvasH + 150) return;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      const intensity = Math.pow(val / maxBlurred, 0.6); // Gamma for more visible spread
      if (intensity < 0.02) return;

      // Large radius for global spread feel
      const radius = Math.min(45 + intensity * 65, 130);
      if (!Number.isFinite(radius)) return;

      // Bright teal center → deep teal → transparent
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      if (intensity > 0.5) {
        // Hot spot: white-bright center
        const hot = (intensity - 0.5) * 2;
        const g1 = Math.round(148 + hot * 80);  // Brighter green
        const b1 = Math.round(136 + hot * 60);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.15 + hot * 0.2})`);
        gradient.addColorStop(0.15, `rgba(${Math.round(13 + hot * 100)}, ${g1}, ${b1}, ${0.5 + intensity * 0.35})`);
        gradient.addColorStop(0.4, `rgba(13, 148, 136, ${0.25 + intensity * 0.3})`);
        gradient.addColorStop(0.7, `rgba(6, 95, 90, ${0.1 + intensity * 0.15})`);
        gradient.addColorStop(1, `rgba(6, 78, 75, 0)`);
      } else {
        // Warm spot: teal glow
        gradient.addColorStop(0, `rgba(20, 184, 166, ${0.3 + intensity * 0.5})`);
        gradient.addColorStop(0.3, `rgba(13, 148, 136, ${0.15 + intensity * 0.3})`);
        gradient.addColorStop(0.6, `rgba(6, 95, 90, ${0.06 + intensity * 0.12})`);
        gradient.addColorStop(1, `rgba(6, 78, 75, 0)`);
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // ── Pass 4: Add tiny amber sparkles for student-heavy areas ──
    ctx.globalCompositeOperation = 'screen';
    const studentDensity: Record<string, number> = {};
    points.forEach(p => {
      if (p.type !== 'student') return;
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return;
      const gx = Math.floor(toCanvasX(p.lng) / gridSize);
      const gy = Math.floor(toCanvasY(p.lat) / gridSize);
      const key = `${gx},${gy}`;
      studentDensity[key] = (studentDensity[key] || 0) + 1;
    });

    let maxStudentDensity = 1;
    Object.values(studentDensity).forEach(d => { if (d > maxStudentDensity) maxStudentDensity = d; });

    Object.entries(studentDensity).forEach(([key, val]) => {
      const [gx, gy] = key.split(',').map(Number);
      const x = gx * gridSize + gridSize / 2;
      const y = gy * gridSize + gridSize / 2;
      if (x < -80 || x > canvasW + 80 || y < -80 || y > canvasH + 80) return;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      const intensity = val / maxStudentDensity;
      if (intensity < 0.15) return;

      const radius = Math.min(30 + intensity * 40, 80);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(251, 191, 36, ${0.15 + intensity * 0.2})`);
      gradient.addColorStop(0.4, `rgba(217, 119, 6, ${0.06 + intensity * 0.1})`);
      gradient.addColorStop(1, `rgba(180, 83, 9, 0)`);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    // ── Overlay on map ──
    const boundsLiteral = L.latLngBounds(sw, ne);
    const imgOverlay = L.imageOverlay(canvas.toDataURL(), boundsLiteral, { opacity: 0.92, interactive: false });

    if (overlayRef.current) map.removeLayer(overlayRef.current);
    overlayRef.current = imgOverlay;
    imgOverlay.addTo(map);

    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [map, points, redrawTrigger]);

  useEffect(() => {
    if (!map) return;
    const redraw = () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
        setRedrawTrigger(prev => prev + 1);
      }
    };
    map.on('moveend', redraw);
    map.on('zoomend', redraw);
    return () => {
      map.off('moveend', redraw);
      map.off('zoomend', redraw);
    };
  }, [map]);

  return null;
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

// ─── Main MiniMap Component (Heatmap Only) ───────────────────────────────

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

        {/* Vibrant density heatmap */}
        <DensityHeatmapLayer points={points} />
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

      {/* Top-right: Density legend (compact) */}
      <div className="absolute top-3 right-3 z-[400]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/40 dark:border-slate-700/40 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider">Density</span>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-teal-600" />
              <div className="w-2 h-2 rounded-full bg-teal-500 opacity-70 -ml-0.5" />
              <div className="w-2 h-2 rounded-full bg-teal-400 opacity-40 -ml-0.5" />
            </div>
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
