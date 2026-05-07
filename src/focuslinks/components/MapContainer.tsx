'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BadgeCheck, ExternalLink, Building2, GraduationCap, Stethoscope, MapPin, X, MessageCircle, Star, Phone, Clock, Navigation, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from '../../context/NavigationContext';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MapProfile {
  id: string;
  name: string;
  title?: string;
  location?: string;
  country?: string;
  city?: string;
  lat: number;
  lng: number;
  type: 'professional' | 'student' | 'clinic' | 'institution' | string;
  verified?: boolean;
  skills?: string[];
  image?: string;
  flCredits?: number;
  source: 'profile' | 'user' | 'clinic';
  description?: string;
  slug?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  openHours?: string;
  googleMapsUrl?: string;
  state?: string;
  specialties?: string[];
  category?: string;
}

export interface MapStats {
  totalProfiles?: number;
  totalUsers?: number;
  geocodedProfiles?: number;
  geocodedUsers?: number;
  countriesCount?: number;
  profilesOnMap?: number;
  usersOnMap?: number;
}

export interface MapData {
  profiles: MapProfile[];
  users: MapProfile[];
  clinics: MapProfile[];
  stats: MapStats;
}

export interface MapContainerProps {
  data: MapData | null;
  loading: boolean;
  filterType: string;
  searchQuery: string;
  darkMode: boolean;
  selectedProfile: MapProfile | null;
  onSelectProfile: (profile: MapProfile | null) => void;
  centerOn?: { lat: number; lng: number; zoom?: number } | null;
  /** Expose current zoom to parent */
  onZoomChange?: (zoom: number) => void;
}

// ─── Zoom thresholds ───────────────────────────────────────────────────────
const CLUSTER_ZOOM_THRESHOLD = 4;  // Below this: show country cluster circles (global overview)
// No MARKERS_ZOOM_THRESHOLD — individual pins show at all zooms

// ─── Marker Colors ──────────────────────────────────────────────────────────

const MARKER_COLORS: Record<string, string> = {
  professional: '#0D9488',
  student: '#D97706',
  clinic: '#059669',
  institution: '#059669',
};

// ─── Country Centroids (for clustering) ──────────────────────────────────

const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  'india': { lat: 20.5937, lng: 78.9629 },
  'nigeria': { lat: 9.082, lng: 8.6753 },
  'kenya': { lat: -0.0236, lng: 37.9062 },
  'bangladesh': { lat: 23.685, lng: 90.3563 },
  'pakistan': { lat: 30.3753, lng: 69.3451 },
  'saudi arabia': { lat: 23.8859, lng: 45.0792 },
  'kuwait': { lat: 29.3117, lng: 47.4818 },
  'united arab emirates': { lat: 23.4241, lng: 53.8478 },
  'united states': { lat: 37.0902, lng: -95.7129 },
  'uk': { lat: 55.3781, lng: -3.436 },
  'united kingdom': { lat: 55.3781, lng: -3.436 },
  'canada': { lat: 56.1304, lng: -106.3468 },
  'australia': { lat: -25.2744, lng: 133.7751 },
  'china': { lat: 35.8617, lng: 104.1954 },
  'egypt': { lat: 26.8206, lng: 30.8025 },
  'ghana': { lat: 7.9465, lng: -1.0232 },
  'south africa': { lat: -30.5595, lng: 22.9375 },
  'tanzania': { lat: -6.369, lng: 34.8888 },
  'uganda': { lat: 1.3733, lng: 32.2903 },
  'malaysia': { lat: 4.2105, lng: 101.9758 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'philippines': { lat: 12.8797, lng: 121.774 },
  'indonesia': { lat: -0.7893, lng: 113.9213 },
  'thailand': { lat: 15.87, lng: 100.9925 },
  'nepal': { lat: 28.3949, lng: 84.124 },
  'sri lanka': { lat: 7.8731, lng: 80.7718 },
  'germany': { lat: 51.1657, lng: 10.4515 },
  'france': { lat: 46.6034, lng: 1.8883 },
  'qatar': { lat: 25.2769, lng: 51.52 },
  'oman': { lat: 21.4735, lng: 55.9754 },
  'bahrain': { lat: 26.0667, lng: 50.5577 },
  'jordan': { lat: 30.5852, lng: 36.2384 },
  'iraq': { lat: 33.2232, lng: 43.6793 },
  'syria': { lat: 34.8021, lng: 38.9968 },
  'lebanon': { lat: 33.8547, lng: 35.8623 },
  'ethiopia': { lat: 9.1498, lng: 40.4989 },
  'rwanda': { lat: -1.9403, lng: 29.8739 },
  'zambia': { lat: -13.1339, lng: 27.8491 },
  'zimbabwe': { lat: -19.0154, lng: 29.1549 },
  'cameroon': { lat: 7.3697, lng: 12.3547 },
  'morocco': { lat: 31.7917, lng: -7.0926 },
  'tunisia': { lat: 33.8869, lng: 9.5375 },
  'algeria': { lat: 28.0339, lng: 1.6596 },
  'sudan': { lat: 12.8628, lng: 30.2176 },
  'myanmar': { lat: 21.9162, lng: 95.956 },
  'vietnam': { lat: 14.0583, lng: 108.2772 },
  'japan': { lat: 36.2048, lng: 138.2529 },
  'south korea': { lat: 35.9078, lng: 127.7669 },
  'italy': { lat: 41.8719, lng: 12.5674 },
  'spain': { lat: 40.4637, lng: -3.7492 },
  'netherlands': { lat: 52.1326, lng: 5.2913 },
  'brazil': { lat: -14.235, lng: -51.9253 },
  'mexico': { lat: 23.6345, lng: -102.5528 },
  'iran': { lat: 32.4279, lng: 53.688 },
  'turkey': { lat: 38.9637, lng: 35.2433 },
  'israel': { lat: 31.0461, lng: 34.8516 },
  'new zealand': { lat: -40.9006, lng: 174.886 },
  'ireland': { lat: 53.1424, lng: -7.6921 },
  'portugal': { lat: 39.3999, lng: -8.2245 },
  'sweden': { lat: 60.1282, lng: 18.6435 },
  'norway': { lat: 60.472, lng: 8.4689 },
  'denmark': { lat: 56.2639, lng: 9.5018 },
  'finland': { lat: 61.9241, lng: 25.7482 },
  'russia': { lat: 61.524, lng: 105.3188 },
  'ukraine': { lat: 48.3794, lng: 31.1656 },
  'poland': { lat: 51.9194, lng: 19.1451 },
  'romania': { lat: 45.9432, lng: 24.9668 },
  'czech republic': { lat: 49.8175, lng: 15.473 },
  'hungary': { lat: 47.1625, lng: 19.5033 },
  'austria': { lat: 47.5162, lng: 14.5501 },
  'switzerland': { lat: 46.8182, lng: 8.2275 },
  'argentina': { lat: -38.4161, lng: -63.6167 },
  'colombia': { lat: 4.5709, lng: -74.2973 },
  'peru': { lat: -9.19, lng: -75.0152 },
  'chile': { lat: -35.6751, lng: -71.543 },
  'ecuador': { lat: -1.8312, lng: -78.1834 },
  'cambodia': { lat: 12.5657, lng: 104.991 },
};

// ─── Country Cluster Type ──────────────────────────────────────────────────

interface CountryCluster {
  country: string;
  lat: number;
  lng: number;
  pros: number;
  students: number;
  clinics: number;
  total: number;
}

function isClinicType(type: string, source?: string): boolean {
  return type === 'clinic' || source === 'clinic';
}

// ─── Marker Icon Creators (detailed SVG icons) ─────────────────────────────

function createClinicIcon(size: number = 28, verified: boolean = false): L.DivIcon {
  const color = '#059669';
  const s = size;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:${s + 4}px;height:${s + 6}px;">
        ${verified ? `<div style="position:absolute;top:-4px;right:-4px;z-index:10;width:12px;height:12px;background:#3B82F6;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.3);">
          <svg width="7" height="7" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>` : ''}
        <svg width="${s + 4}" height="${s + 6}" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17c0 12.17 15 19 17 19s17-6.83 17-19C34 7.61 26.39 0 17 0z" fill="${color}" stroke="white" stroke-width="2.5"/>
          <rect x="10" y="10" width="14" height="17" rx="2" fill="white" opacity="0.95"/>
          <rect x="15" y="10" width="4" height="17" fill="${color}" opacity="0.7"/>
          <rect x="10" y="18" width="14" height="4" fill="${color}" opacity="0.7"/>
        </svg>
      </div>
    `,
    iconSize: [s + 4, s + 6],
    iconAnchor: [(s + 4) / 2, s + 6],
    popupAnchor: [0, -(s + 6)],
  });
}

function createOptometristIcon(size: number = 28, verified: boolean = false): L.DivIcon {
  const color = '#0D9488';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:${size + 4}px;height:${size + 6}px;">
        ${verified ? `<div style="position:absolute;top:-4px;right:-4px;z-index:10;width:12px;height:12px;background:#3B82F6;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.3);">
          <svg width="7" height="7" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>` : ''}
        <svg width="${size + 4}" height="${size + 6}" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17c0 12.17 15 19 17 19s17-6.83 17-19C34 7.61 26.39 0 17 0z" fill="${color}" stroke="white" stroke-width="2.5"/>
          <circle cx="17" cy="14" r="8" stroke="white" stroke-width="2" fill="none"/>
          <circle cx="17" cy="14" r="3.5" fill="white"/>
          <path d="M9 14c-2-3-4-1.5-4 0s2 3 4 0z" fill="white" opacity="0.9"/>
          <path d="M25 14c2-3 4-1.5 4 0s-2 3-4 0z" fill="white" opacity="0.9"/>
          <path d="M8 19c1.5 3.5 5.5 5.5 9 5.5s7.5-2 9-5.5" stroke="white" stroke-width="1.5" fill="none" opacity="0.7"/>
        </svg>
      </div>
    `,
    iconSize: [size + 4, size + 6],
    iconAnchor: [(size + 4) / 2, size + 6],
    popupAnchor: [0, -(size + 6)],
  });
}

function createStudentIcon(size: number = 28, verified: boolean = false): L.DivIcon {
  const color = '#D97706';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:${size + 4}px;height:${size + 6}px;">
        ${verified ? `<div style="position:absolute;top:-4px;right:-4px;z-index:10;width:12px;height:12px;background:#3B82F6;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.3);">
          <svg width="7" height="7" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>` : ''}
        <svg width="${size + 4}" height="${size + 6}" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17c0 12.17 15 19 17 19s17-6.83 17-19C34 7.61 26.39 0 17 0z" fill="${color}" stroke="white" stroke-width="2.5"/>
          <path d="M17 8L6 14l11 6 11-6-11-6z" fill="white"/>
          <path d="M9 16v5.5c0 1.5 3.5 4 8 4s8-2.5 8-4V16" stroke="white" stroke-width="2" fill="none"/>
          <line x1="26" y1="13" x2="26" y2="20" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <circle cx="26" cy="21" r="1.5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [size + 4, size + 6],
    iconAnchor: [(size + 4) / 2, size + 6],
    popupAnchor: [0, -(size + 6)],
  });
}

function createCountryClusterIcon(cluster: CountryCluster, size: number = 48): L.DivIcon {
  const total = cluster.total;
  const s = Math.min(size + Math.floor(total / 5), 70);
  const fontSize = total > 100 ? 11 : total > 50 ? 12 : 14;

  let mainColor = '#0D9488';
  if (cluster.students >= cluster.pros && cluster.students >= cluster.clinics) {
    mainColor = '#D97706';
  } else if (cluster.clinics >= cluster.pros && cluster.clinics >= cluster.students) {
    mainColor = '#059669';
  }

  return L.divIcon({
    className: 'country-cluster-marker',
    html: `
      <div style="
        position:relative;
        width:${s}px;height:${s}px;
        background:${mainColor};
        border:3px solid white;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;flex-direction:column;
        box-shadow:0 3px 14px rgba(0,0,0,0.4);
        font-weight:800;font-size:${fontSize}px;color:white;
        text-shadow:0 1px 2px rgba(0,0,0,0.3);
        font-family:system-ui,sans-serif;
      ">
        <span>${total}</span>
        <div style="position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;font-weight:700;color:#475569;background:white;padding:2px 8px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.15);font-family:system-ui,sans-serif;">
          ${cluster.country.length > 15 ? cluster.country.slice(0, 15) + '..' : cluster.country}
        </div>
      </div>
    `,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
    popupAnchor: [0, -s / 2],
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getAvatarColor(name: string): string {
  const gradients = [
    'from-teal-400 to-emerald-500',
    'from-cyan-400 to-blue-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-violet-400 to-purple-500',
    'from-emerald-400 to-green-500',
    'from-sky-400 to-indigo-500',
    'from-fuchsia-400 to-pink-500',
  ];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % gradients.length;
  return gradients[idx];
}

// ─── Heatmap Layer ───────────────────────────────────────────────────────────

function HeatmapLayer({ points, visible, fadeOnZoom }: { points: MapProfile[]; visible: boolean; fadeOnZoom: boolean }) {
  const map = useMap();
  const overlayRef = useRef<L.Layer | null>(null);
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  useEffect(() => {
    if (!map || !visible || points.length === 0) {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const lngSpan = ne.lng - sw.lng;
    const latSpan = ne.lat - sw.lat;
    // Guard against zero-span bounds which produce non-finite values
    const safeLngSpan = Math.abs(lngSpan) < 1e-10 ? 1 : lngSpan;
    const safeLatSpan = Math.abs(latSpan) < 1e-10 ? 1 : latSpan;
    const toCanvasX = (lng: number) => ((lng - sw.lng) / safeLngSpan) * canvas.width;
    const toCanvasY = (lat: number) => ((ne.lat - lat) / safeLatSpan) * canvas.height;

    // Separate points by type for colored heatmap
    const typeColors: Record<string, { r: number; g: number; b: number }> = {
      professional: { r: 13, g: 148, b: 136 },   // teal
      student: { r: 217, g: 119, b: 6 },         // amber
      clinic: { r: 5, g: 150, b: 105 },           // emerald
    };

    const gridSize = 25;
    const grid: Record<string, { professional: number; student: number; clinic: number }> = {};
    points.forEach(p => {
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return; // Skip invalid
      const gx = Math.floor(toCanvasX(p.lng) / gridSize);
      const gy = Math.floor(toCanvasY(p.lat) / gridSize);
      const key = `${gx},${gy}`;
      if (!grid[key]) grid[key] = { professional: 0, student: 0, clinic: 0 };
      const t = (p.type === 'clinic' || p.source === 'clinic') ? 'clinic' : p.type || 'professional';
      grid[key][t] = (grid[key][t] || 0) + 1;
    });

    // Find max density across all types
    let maxDensity = 1;
    Object.values(grid).forEach(g => {
      const total = g.professional + g.student + g.clinic;
      if (total > maxDensity) maxDensity = total;
    });

    const canvasW = canvas.width;
    const canvasH = canvas.height;
    const maxRadius = 50;

    Object.entries(grid).forEach(([key, counts]) => {
      const [gx, gy] = key.split(',').map(Number);
      const x = gx * gridSize + gridSize / 2;
      const y = gy * gridSize + gridSize / 2;

      // Skip if coordinates are outside canvas or non-finite
      if (x < -maxRadius || x > canvasW + maxRadius || y < -maxRadius || y > canvasH + maxRadius) return;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      // Draw each type as a separate colored dot
      Object.entries(counts).forEach(([type, count]) => {
        if (count === 0) return;
        const c = typeColors[type] || typeColors.professional;
        const total = counts.professional + counts.student + counts.clinic;
        const intensity = total / maxDensity;
        const radius = Math.min(Math.max(12 + intensity * 35, 1), maxRadius);

        if (!Number.isFinite(radius)) return;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.3 + intensity * 0.35})`);
        gradient.addColorStop(0.5, `rgba(${c.r}, ${c.g}, ${c.b}, ${0.1 + intensity * 0.15})`);
        gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
    });

    const boundsLiteral = L.latLngBounds(sw, ne);
    // Fade heatmap when zoomed in (markers visible)
    const opacity = fadeOnZoom ? Math.max(0, 1 - (map.getZoom() - CLUSTER_ZOOM_THRESHOLD) * 0.25) : 0.75;
    const imgOverlay = L.imageOverlay(canvas.toDataURL(), boundsLiteral, { opacity, interactive: false });

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
    }
    overlayRef.current = imgOverlay;
    imgOverlay.addTo(map);

    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [map, points, visible, fadeOnZoom, redrawTrigger]);

  // Redraw on zoom/pan
  useEffect(() => {
    if (!map) return;
    const redraw = () => {
      // Force re-render by toggling a counter (handled by removing + re-adding overlay)
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
        // The main effect will re-run on next render cycle
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

// ─── Detail Side Panel (Desktop) ───────────────────────────────────────────────

function DetailPanel({ profile, onClose }: { profile: MapProfile; onClose: () => void }) {
  const initials = getInitials(profile.name);
  const avatarGradient = getAvatarColor(profile.name);
  const slug = profile.slug || generateSlug(profile.name);
  const isClinic = isClinicType(profile.type, profile.source);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1000] hidden lg:block"
        onClick={onClose}
      />
      <AnimatePresence>
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-[1001] overflow-y-auto lg:block hidden"
        >
          <div className={`relative h-28 ${isClinic ? 'bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 dark:from-emerald-900/30 dark:via-slate-800 dark:to-green-900/20' : 'bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-100 dark:from-teal-900/30 dark:via-slate-800 dark:to-emerald-900/20'}`}>
            <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-white transition-colors">
              <X className="w-4 h-4 text-slate-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="px-5 pb-6 -mt-12 relative">
            <div className="relative inline-block mb-3">
              {profile.image && profile.image !== 'none' ? (
                <img src={profile.image} alt={profile.name} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} className="w-20 h-20 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-lg bg-white" referrerPolicy="no-referrer" />
              ) : (
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg`}>
                  <span className="text-white font-bold text-xl">{initials}</span>
                </div>
              )}
              {profile.verified && <BadgeCheck className="absolute -top-1 -right-1 w-6 h-6 text-blue-500 bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />}
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-0.5">{profile.name}</h2>
            {profile.title && <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-1 line-clamp-1">{profile.title}</p>}

            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-3 ${
              profile.type === 'professional' ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' :
              profile.type === 'student' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
              'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}>
              {profile.type === 'professional' && <Stethoscope className="w-3 h-3 inline mr-1" />}
              {profile.type === 'student' && <GraduationCap className="w-3 h-3 inline mr-1" />}
              {(profile.type === 'clinic' || profile.type === 'institution') && <Building2 className="w-3 h-3 inline mr-1" />}
              {profile.type}
            </span>

            {isClinic && profile.rating != null && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                <RatingStars rating={profile.rating} />
                {profile.reviews != null && profile.reviews > 0 && <span className="text-xs text-slate-500 dark:text-gray-400">({profile.reviews} reviews)</span>}
              </div>
            )}

            {profile.location && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-gray-400 text-sm mb-4">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-1">{profile.location}</span>
              </div>
            )}

            {isClinic && (
              <div className="space-y-2.5 mb-4">
                {profile.phone && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400"><Phone className="w-4 h-4 text-emerald-500 shrink-0" /><a href={`tel:${profile.phone}`} className="hover:text-teal-600 transition-colors">{profile.phone}</a></div>}
                {profile.website && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400"><Globe className="w-4 h-4 text-emerald-500 shrink-0" /><a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors truncate">{profile.website.replace(/^https?:\/\//, '')}</a></div>}
                {profile.openHours && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400"><Clock className="w-4 h-4 text-emerald-500 shrink-0" /><span className="line-clamp-1">{profile.openHours}</span></div>}
              </div>
            )}

            {!isClinic && profile.flCredits && profile.flCredits > 0 && (
              <div className="flex items-center gap-1.5 mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{profile.flCredits} FL Credits</span>
              </div>
            )}

            {profile.description && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">About</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-4">{profile.description}</p>
              </div>
            )}

            {!isClinic && profile.skills && profile.skills.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map(skill => <span key={skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 text-xs font-semibold rounded-lg">{skill}</span>)}
                </div>
              </div>
            )}

            <div className="flex gap-2.5 mt-6">
              {isClinic ? (
                <>
                  {profile.googleMapsUrl && <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all text-center flex items-center justify-center gap-2"><Navigation className="w-4 h-4" /> Directions</a>}
                  {profile.phone && <a href={`tel:${profile.phone}`} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> Call</a>}
                </>
              ) : (
                <>
                  <Link to={`/profile/${slug}`} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all text-center flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" /> View Profile</Link>
                  <Link to="/messages" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-center flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Message</Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

// ─── Mobile Bottom Sheet ────────────────────────────────────────────────────

function MobileBottomSheet({ profile, onClose }: { profile: MapProfile; onClose: () => void }) {
  const initials = getInitials(profile.name);
  const avatarGradient = getAvatarColor(profile.name);
  const slug = profile.slug || generateSlug(profile.name);
  const isClinic = isClinicType(profile.type, profile.source);

  return (
    <AnimatePresence>
      <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] lg:hidden" onClick={onClose} />
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-[1001] max-h-[70vh] overflow-y-auto lg:hidden">
          <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" /></div>
          <div className="px-5 pb-8">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="relative shrink-0">
                {profile.image && profile.image !== 'none' ? (
                  <img src={profile.image} alt={profile.name} className="w-14 h-14 rounded-xl object-cover shadow-sm bg-white" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-sm`}><span className="text-white font-bold text-sm">{initials}</span></div>
                )}
                {profile.verified && <BadgeCheck className="absolute -top-1 -right-1 w-5 h-5 text-blue-500 bg-white dark:bg-slate-900 rounded-full" fill="currentColor" stroke="white" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{profile.name}</h3>
                {profile.title && <p className="text-sm text-teal-600 dark:text-teal-400 font-medium line-clamp-1">{profile.title}</p>}
                {profile.location && <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</p>}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            {isClinic && profile.rating != null && <div className="flex items-center gap-2 mb-3"><RatingStars rating={profile.rating} />{profile.reviews != null && profile.reviews > 0 && <span className="text-xs text-slate-400 dark:text-gray-500">({profile.reviews})</span>}</div>}

            {isClinic && (
              <div className="space-y-1.5 mb-4">
                {profile.phone && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400"><Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" /><a href={`tel:${profile.phone}`} className="hover:text-teal-600">{profile.phone}</a></div>}
                {profile.openHours && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400"><Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" /><span className="line-clamp-1">{profile.openHours}</span></div>}
                {profile.website && <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400"><Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" /><a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 truncate">{profile.website.replace(/^https?:\/\//, '')}</a></div>}
              </div>
            )}

            {!isClinic && profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {profile.skills.slice(0, 4).map(skill => <span key={skill} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-gray-400 text-xs font-semibold rounded-lg">{skill}</span>)}
                {profile.skills.length > 4 && <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 text-xs font-semibold rounded-lg">+{profile.skills.length - 4}</span>}
              </div>
            )}

            {isClinic && profile.description && <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4">{profile.description}</p>}

            <div className="flex gap-2.5">
              {isClinic ? (
                <>
                  {profile.googleMapsUrl && <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white shadow-md text-center flex items-center justify-center gap-2"><Navigation className="w-4 h-4" /> Directions</a>}
                  {profile.phone && <a href={`tel:${profile.phone}`} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-center flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> Call</a>}
                </>
              ) : (
                <>
                  <Link to={`/profile/${slug}`} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-teal-600 text-white shadow-md text-center flex items-center justify-center gap-2"><ExternalLink className="w-4 h-4" /> View Profile</Link>
                  <Link to="/messages" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 text-center flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> Message</Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

// ─── Marker Popup ────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}`} />
      ))}
      <span className="text-xs font-semibold text-slate-600 dark:text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProfilePopup({ profile, onSelect }: { profile: MapProfile; onSelect: (p: MapProfile) => void }) {
  const initials = getInitials(profile.name);
  const avatarGradient = getAvatarColor(profile.name);
  const slug = profile.slug || generateSlug(profile.name);
  const isClinic = isClinicType(profile.type, profile.source);

  return (
    <div className="min-w-[200px] max-w-[260px]" onClick={() => onSelect(profile)}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="relative shrink-0">
          {profile.image && profile.image !== 'none' ? (
            <img src={profile.image} alt={profile.name} className={`object-cover shadow-sm bg-white ${isClinic ? 'w-10 h-10 rounded-xl' : 'w-10 h-10 rounded-full'}`} referrerPolicy="no-referrer" />
          ) : (
            <div className={`w-10 h-10 bg-gradient-to-br ${avatarGradient} flex items-center justify-center ${isClinic ? 'rounded-xl' : 'rounded-full'}`}><span className="text-white font-bold text-xs">{initials}</span></div>
          )}
          {profile.verified && <BadgeCheck className="absolute -top-1 -right-1 w-4 h-4 text-blue-500 bg-white rounded-full" fill="currentColor" stroke="white" />}
        </div>
        <div className="min-w-0">
          <span className="font-bold text-slate-800 dark:text-white text-sm truncate block">{profile.name}</span>
          {profile.title && <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{profile.title}</p>}
        </div>
      </div>

      {isClinic && profile.rating != null && <div className="mb-2"><RatingStars rating={profile.rating} /></div>}

      {profile.location && <div className="flex items-center gap-1 text-xs text-slate-400 mb-2"><MapPin className="w-3 h-3" /><span className="line-clamp-1">{profile.location}</span></div>}

      {isClinic && profile.phone && <div className="flex items-center gap-1 text-xs text-slate-400 mb-1.5"><Phone className="w-3 h-3 shrink-0" /><a href={`tel:${profile.phone}`} className="hover:text-teal-500 truncate" onClick={(e: React.MouseEvent) => e.stopPropagation()}>{profile.phone}</a></div>}

      {!isClinic && profile.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {profile.skills.slice(0, 3).map(skill => <span key={skill} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-gray-400 text-[10px] font-semibold rounded">{skill}</span>)}
        </div>
      )}

      {isClinic ? (
        <div className="flex flex-col gap-1.5 mt-1">
          {profile.googleMapsUrl && <a href={profile.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400" onClick={(e: React.MouseEvent) => e.stopPropagation()}><Navigation className="w-3 h-3" /> Directions</a>}
          {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400" onClick={(e: React.MouseEvent) => e.stopPropagation()}><Globe className="w-3 h-3" /> Website</a>}
        </div>
      ) : (
        <Link to={`/profile/${slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400" onClick={(e: React.MouseEvent) => e.stopPropagation()}>View Profile <ExternalLink className="w-3 h-3" /></Link>
      )}
    </div>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function MapLegend({ showMarkers }: { showMarkers: boolean }) {
  return (
    <div className="absolute bottom-20 lg:bottom-6 right-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2.5">
      <h4 className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Legend</h4>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg width="14" height="16" viewBox="0 0 34 36" fill="none">
              <path d="M17 0C7.61 0 0 7.61 0 17c0 12.17 15 19 17 19s17-6.83 17-19C34 7.61 26.39 0 17 0z" fill="#0D9488"/>
              <circle cx="17" cy="14" r="5" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="17" cy="14" r="2" fill="white"/>
            </svg>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-gray-400">Optometrists</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg width="14" height="16" viewBox="0 0 34 36" fill="none">
              <path d="M17 0C7.61 0 0 7.61 0 17c0 12.17 15 19 17 19s17-6.83 17-19C34 7.61 26.39 0 17 0z" fill="#D97706"/>
              <path d="M17 10l-7 4 7 4 7-4-7-4z" fill="white"/>
              <path d="M11 15v4c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-4" stroke="white" strokeWidth="1.2" fill="none"/>
            </svg>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-gray-400">Students</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg width="14" height="16" viewBox="0 0 34 36" fill="none">
              <path d="M17 0C7.61 0 0 7.61 0 17c0 12.17 15 19 17 19s17-6.83 17-19C34 7.61 26.39 0 17 0z" fill="#059669"/>
              <rect x="11" y="11" width="12" height="14" rx="1.5" fill="white" opacity="0.95"/>
              <rect x="15" y="11" width="4" height="14" fill="#059669" opacity="0.7"/>
              <rect x="11" y="17" width="12" height="3" fill="#059669" opacity="0.7"/>
            </svg>
          </div>
          <span className="text-[11px] text-slate-600 dark:text-gray-400">Clinics</span>
        </div>
        {showMarkers && (
          <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 dark:text-gray-500 italic">Zoom in for details</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FlyTo Controller ───────────────────────────────────────────────────

function FlyToController({ target }: { target: { lat: number; lng: number; zoom?: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target && map) {
      map.flyTo([target.lat, target.lng], target.zoom || 12, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// ─── Zoom Tracker (exposes zoom level to parent) ──────────────────────

function ZoomTracker({ onZoomChange }: { onZoomChange?: (zoom: number) => void }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const onZoom = () => {
      const z = map.getZoom();
      setZoom(z);
      onZoomChange?.(z);
    };
    map.on('zoomend', onZoom);
    return () => {
      map.off('zoomend', onZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

// ─── Coordinate Detail Detection ───────────────────────────────────────
// A "raw" point has lat/lng matching the country centroid (no city-level geocode)
// A "detailed" point has unique city-level coordinates

function isRawCoordinate(lat: number, lng: number, country: string): boolean {
  const key = (country || '').toLowerCase().trim();
  const centroid = COUNTRY_CENTROIDS[key];
  if (!centroid) return false; // Unknown country → assume detailed
  return Math.abs(lat - centroid.lat) < 0.05 && Math.abs(lng - centroid.lng) < 0.05;
}

// ─── Overlapping Marker Spread ─────────────────────────────────────────
// Spreads markers that are too close together in a circular pattern

function spreadOverlappingMarkers(points: MapProfile[], clusterRadius: number = 0.06): MapProfile[] {
  if (points.length === 0) return points;

  const used = new Set<string>();
  const result: MapProfile[] = [];
  const groups: MapProfile[][] = [];

  for (let i = 0; i < points.length; i++) {
    if (used.has(points[i].id)) continue;
    const group: MapProfile[] = [points[i]];
    used.add(points[i].id);

    for (let j = i + 1; j < points.length; j++) {
      if (used.has(points[j].id)) continue;
      const dLat = Math.abs(points[i].lat - points[j].lat);
      const dLng = Math.abs(points[i].lng - points[j].lng);
      if (dLat < clusterRadius && dLng < clusterRadius) {
        group.push(points[j]);
        used.add(points[j].id);
      }
    }

    if (group.length > 1) {
      groups.push(group);
    } else {
      result.push(group[0]);
    }
  }

  // Spread each group in a circle
  groups.forEach(group => {
    const centerLat = group.reduce((s, p) => s + p.lat, 0) / group.length;
    const centerLng = group.reduce((s, p) => s + p.lng, 0) / group.length;
    const n = group.length;
    // Dynamic radius: more points = bigger circle
    const spreadRadius = Math.max(0.02, 0.008 * Math.sqrt(n));

    group.forEach((p, idx) => {
      const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
      result.push({
        ...p,
        lat: centerLat + spreadRadius * Math.cos(angle),
        lng: centerLng + spreadRadius * Math.sin(angle),
      });
    });
  });

  return result;
}

// ─── Main MapContainer Component ────────────────────────────────────────────

export default function MapContainer({
  data,
  loading,
  filterType,
  searchQuery,
  darkMode,
  selectedProfile,
  onSelectProfile,
  centerOn,
  onZoomChange,
}: MapContainerProps) {
  const [currentZoom, setCurrentZoom] = useState(5);

  // ─── Split points by type ─────────────────────────────────────────────
  // Clinics: ALWAYS show as individual pins (never clustered)
  // Detailed profiles: show as individual pins (unique city-level coordinates)
  // Raw profiles: only cluster India's at low zoom; others show individually too

  const baseFilter = useCallback((p: MapProfile) => {
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return false;
    if (filterType === 'professional' && p.type !== 'professional') return false;
    if (filterType === 'student' && p.type !== 'student') return false;
    if (filterType === 'clinic' && p.source !== 'clinic' && p.type !== 'clinic' && p.type !== 'institution') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (p.name || '').toLowerCase();
      const country = (p.country || '').toLowerCase();
      const city = (p.city || '').toLowerCase();
      const location = (p.location || '').toLowerCase();
      if (!name.includes(q) && !country.includes(q) && !city.includes(q) && !location.includes(q)) return false;
    }
    return true;
  }, [filterType, searchQuery]);

  // Clinic pins — always individual, never clustered
  const clinicPins = useMemo(() => {
    if (!data) return [];
    return (data.clinics || []).filter(p => baseFilter(p) && Number.isFinite(p.lat) && Number.isFinite(p.lng));
  }, [data, baseFilter]);

  // Non-clinic profiles (professionals + students)
  const profilePoints = useMemo(() => {
    if (!data) return [];
    const combined = [...data.profiles, ...data.users];
    return combined.filter(baseFilter);
  }, [data, baseFilter]);

  // Split profiles into detailed vs raw
  const { detailedPins, rawPins } = useMemo(() => {
    const detailed: MapProfile[] = [];
    const raw: MapProfile[] = [];
    profilePoints.forEach(p => {
      if (isRawCoordinate(p.lat, p.lng, p.country || '')) {
        raw.push(p);
      } else {
        detailed.push(p);
      }
    });
    return { detailedPins: detailed, rawPins: raw };
  }, [profilePoints]);

  // Split raw pins into India (needs spread due to many overlapping at centroid) vs others
  const { indiaRawPins, otherRawPins } = useMemo(() => {
    const india: MapProfile[] = [];
    const other: MapProfile[] = [];
    rawPins.forEach(p => {
      const key = (p.country || '').toLowerCase().trim();
      if (key === 'india') {
        india.push(p);
      } else {
        other.push(p);
      }
    });
    return { indiaRawPins: india, otherRawPins: other };
  }, [rawPins]);

  // Apply circular spread ONLY to India's raw pins (they all share same centroid)
  const spreadIndiaRaw = useMemo(() => spreadOverlappingMarkers(indiaRawPins, 0.06), [indiaRawPins]);

  // All individual markers = clinics + detailed + spread India raw + other countries raw (no spread)
  const allIndividualPins = useMemo(() => [...clinicPins, ...detailedPins, ...spreadIndiaRaw, ...otherRawPins], [clinicPins, detailedPins, spreadIndiaRaw, otherRawPins]);

  // Heatmap points: use original points — heatmap handles density via grid-based intensity
  // No spread needed; overlapping raw coords just create stronger heat intensity
  const heatmapPoints = useMemo(() => allIndividualPins, [allIndividualPins]);

  // India-only cluster for raw members (shown at very low zoom as a count bubble)
  const indiaCluster = useMemo(() => {
    if (!data) return null;
    const indiaRaw = rawPins.filter(p => {
      const key = (p.country || '').toLowerCase().trim();
      return key === 'india';
    });
    if (indiaRaw.length < 3) return null; // Only cluster if significant
    const centroid = COUNTRY_CENTROIDS['india'];
    let pros = 0, students = 0;
    indiaRaw.forEach(p => {
      if (p.type === 'student') students++;
      else pros++;
    });
    return { country: 'India', lat: centroid.lat, lng: centroid.lng, pros, students, clinics: 0, total: indiaRaw.length };
  }, [data, rawPins]);

  // Country clusters for OTHER countries (non-India) — shown at low zoom for global overview
  const otherCountryClusters = useMemo(() => {
    if (!data) return [];
    const countryMap = new Map<string, CountryCluster>();
    // Use ALL non-clinic points to count per country (including detailed)
    [...data.profiles, ...data.users].filter(baseFilter).forEach(p => {
      const countryKey = (p.country || '').toLowerCase().trim();
      if (!countryKey || countryKey === 'india') return; // Skip India (handled separately)
      const centroid = COUNTRY_CENTROIDS[countryKey];
      if (!centroid) return;
      let cluster = countryMap.get(countryKey);
      if (!cluster) {
        cluster = { country: p.country || countryKey, lat: centroid.lat, lng: centroid.lng, pros: 0, students: 0, clinics: 0, total: 0 };
        countryMap.set(countryKey, cluster);
      }
      const type = p.type === 'student' ? 'student' : 'professional';
      if (type === 'student') cluster.students++;
      else cluster.pros++;
      cluster.total++;
    });
    return Array.from(countryMap.values()).filter(c => c.total >= 1).sort((a, b) => b.total - a.total);
  }, [data, baseFilter]);

  // Zoom-based visibility
  const showCountryClusters = currentZoom < CLUSTER_ZOOM_THRESHOLD;
  // Individual pins: always visible (no zoom restriction)
  const showIndividualMarkers = true;

  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  const handleSelect = useCallback((profile: MapProfile) => { onSelectProfile(profile); }, [onSelectProfile]);
  const handleClose = useCallback(() => { onSelectProfile(null); }, [onSelectProfile]);
  const handleZoomChange = useCallback((z: number) => { setCurrentZoom(z); onZoomChange?.(z); }, [onZoomChange]);

  if (loading) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-slate-100 via-teal-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-800 animate-ping opacity-20" />
            <MapPin className="absolute inset-0 m-auto w-8 h-8 text-teal-500 dark:text-teal-400 animate-bounce" />
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 animate-pulse">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-slate-100 via-teal-50/30 to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center px-6">
          <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-600 dark:text-gray-300 mb-1">Map Unavailable</h3>
          <p className="text-sm text-slate-400 dark:text-gray-500">Unable to load map data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        center={[20, 78]}
        zoom={3}
        minZoom={2}
        maxZoom={18}
        className="w-full h-full"
        zoomControl={false}
        style={{ background: darkMode ? '#1a1a2e' : '#e5e7eb' }}
      >
        <TileLayer url={tileUrl} attribution={tileAttribution} maxZoom={19} />

        <FlyToController target={centerOn} />
        <ZoomTracker onZoomChange={handleZoomChange} />

        {/* Heatmap: uses spread coordinates to avoid diagonal blobs */}
        <HeatmapLayer points={heatmapPoints} visible={true} fadeOnZoom={true} />

        {/* India cluster bubble: only at very low zoom for raw members */}
        {showCountryClusters && indiaCluster && (
          <Marker
            position={[indiaCluster.lat, indiaCluster.lng]}
            icon={createCountryClusterIcon(indiaCluster)}
          >
            <Tooltip direction="top" offset={[0, -30]}>
              <div className="text-xs">
                <div className="font-bold text-gray-800">{indiaCluster.country}</div>
                <div className="text-gray-500 mt-0.5">
                  {indiaCluster.pros > 0 && <span className="text-teal-600">{indiaCluster.pros} Optometrists</span>}
                  {indiaCluster.students > 0 && <span className="text-amber-600 ml-1.5">{indiaCluster.students} Students</span>}
                </div>
              </div>
            </Tooltip>
          </Marker>
        )}

        {/* Other country cluster circles: at low zoom for global overview */}
        {showCountryClusters && otherCountryClusters.map(cluster => (
          <Marker
            key={`cluster-${cluster.country}`}
            position={[cluster.lat, cluster.lng]}
            icon={createCountryClusterIcon(cluster)}
          >
            <Tooltip direction="top" offset={[0, -30]}>
              <div className="text-xs">
                <div className="font-bold text-gray-800">{cluster.country}</div>
                <div className="text-gray-500 mt-0.5">
                  {cluster.pros > 0 && <span className="text-teal-600">{cluster.pros} Pros</span>}
                  {cluster.students > 0 && <span className="text-amber-600 ml-1.5">{cluster.students} Students</span>}
                </div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* Individual markers: clinics + detailed profiles + spread India raw + other raw — ALWAYS visible */}
        {allIndividualPins.map((profile, idx) => {
          const isClinic = isClinicType(profile.type, profile.source);
          return (
            <Marker
              key={`${profile.id}-${idx}`}
              position={[profile.lat, profile.lng]}
              icon={isClinic ? createClinicIcon(28, profile.verified) : profile.type === 'student' ? createStudentIcon(28, profile.verified) : createOptometristIcon(28, profile.verified)}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -8]}>
                <span className="text-xs font-semibold text-slate-800 dark:text-white whitespace-nowrap">{profile.name}</span>
              </Tooltip>
              <Popup maxWidth={300} minWidth={220}>
                <ProfilePopup profile={profile} onSelect={handleSelect} />
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>

      {/* Legend */}
      <MapLegend showMarkers={true} />

      {/* Detail Panel (desktop) */}
      <AnimatePresence>
        {selectedProfile && <DetailPanel profile={selectedProfile} onClose={handleClose} />}
      </AnimatePresence>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {selectedProfile && <MobileBottomSheet profile={selectedProfile} onClose={handleClose} />}
      </AnimatePresence>
    </div>
  );
}
