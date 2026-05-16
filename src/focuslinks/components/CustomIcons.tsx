/**
 * FocusLinks Custom SVG Icon Components
 *
 * Premium icon set designed for FocusLinks — modern, bold, and recognizable.
 * Each icon uses a clean primary symbol with a subtle optometry accent.
 * Optimized for 20–28px rendering with clear silhouettes.
 * Supports both stroke and fill modes via className color inheritance.
 */

import React from 'react';

interface IconProps {
  className?: string;
}

const svgBase = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// ─── DirectoryIcon ──────────────────────────────────────────────────
// A sleek person card with a search lens — finding people in the network.
// Clean badge + magnifying glass silhouette.
export const DirectoryIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* ID Card body */}
    <rect x="2" y="5" width="20" height="15" rx="3" />
    {/* Person avatar circle */}
    <circle cx="8.5" cy="11.5" r="2.2" />
    {/* Person body arc */}
    <path d="M5 17.5c0-1.8 1.6-3 3.5-3s3.5 1.2 3.5 3" />
    {/* Divider line */}
    <line x1="14" y1="9" x2="19" y2="9" />
    <line x1="14" y1="12" x2="17" y2="12" />
    {/* Search lens accent */}
    <circle cx="17" cy="15.5" r="2" strokeWidth="1.6" />
    <path d="M18.4 17l1.6 1.4" strokeWidth="1.6" />
  </svg>
);

// ─── FeedIcon ────────────────────────────────────────────────────────
// Flowing conversation streams with a pulse wave — dynamic community feed.
export const FeedIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* Chat bubble - main */}
    <path d="M21 6.5c0-1.4-1.1-2.5-2.5-2.5h-13C4.1 4 3 5.1 3 6.5v7c0 1.4 1.1 2.5 2.5 2.5H8l4 3.5v-3.5h6.5c1.4 0 2.5-1.1 2.5-2.5v-7z" />
    {/* Signal wave lines — the pulse of community */}
    <path d="M7 10h2" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M11 10h2" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M15 10h2" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// ─── BlogIcon ────────────────────────────────────────────────────────
// An open book/article with a glowing pen — knowledge & writing.
export const BlogIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* Open pages */}
    <path d="M2 4c2-1 4.5-1.5 7-.5 1.2.5 2.3.5 3 0 .7.5 1.8.5 3 0 2.5-1 5-.5 7 .5" />
    <path d="M2 4v14c2-1 4.5-1.5 7-.5 1.2.5 2.3.5 3 0 .7.5 1.8.5 3 0 2.5-1 5-.5 7 .5V4" />
    {/* Center spine */}
    <path d="M12 3.5v14" strokeWidth="1.5" />
    {/* Text lines on left page */}
    <path d="M5 8.5h4" strokeWidth="1.4" opacity="0.6" />
    <path d="M5 11h4" strokeWidth="1.4" opacity="0.6" />
    <path d="M5 13.5h3" strokeWidth="1.4" opacity="0.6" />
    {/* Text lines on right page */}
    <path d="M15 8.5h4" strokeWidth="1.4" opacity="0.6" />
    <path d="M15 11h4" strokeWidth="1.4" opacity="0.6" />
    <path d="M16 13.5h3" strokeWidth="1.4" opacity="0.6" />
  </svg>
);

// ─── LabsIcon ────────────────────────────────────────────────────────
// A precision hexagonal molecule / lens element — innovation & science.
export const LabsIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* Hexagonal frame — precision lens element */}
    <path d="M12 2.5l8 4.5v9l-8 4.5-8-4.5v-9l8-4.5z" strokeWidth="1.8" />
    {/* Inner hexagon — secondary element */}
    <path d="M12 6.5l4.5 2.5v5l-4.5 2.5-4.5-2.5v-5l4.5-2.5z" strokeWidth="1.5" opacity="0.5" />
    {/* Central focal point — the eye of innovation */}
    <circle cx="12" cy="12" r="2" />
    {/* Crosshair precision lines */}
    <path d="M12 6.5v2" strokeWidth="1.2" />
    <path d="M12 15.5v2" strokeWidth="1.2" />
    <path d="M7.5 9l1.8 1" strokeWidth="1.2" />
    <path d="M14.7 14l1.8 1" strokeWidth="1.2" />
  </svg>
);

// ─── ProfilesIcon ────────────────────────────────────────────────────
// A person silhouette with a verified lens badge — professional identity.
export const ProfilesIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* Person head */}
    <circle cx="9" cy="7" r="3.5" />
    {/* Person shoulders */}
    <path d="M3 20.5v-1.5c0-3 2.7-5 6-5s6 2 6 5v1.5" />
    {/* Verification lens badge */}
    <circle cx="18" cy="17" r="4" strokeWidth="1.8" />
    {/* Checkmark inside badge */}
    <path d="M15.8 17l1.5 1.5 2.9-3" strokeWidth="2" />
    {/* Sparkle accents */}
    <circle cx="18" cy="12.5" r="0.6" fill="currentColor" stroke="none" opacity="0.5" />
    <circle cx="22" cy="14" r="0.4" fill="currentColor" stroke="none" opacity="0.35" />
  </svg>
);

// ─── EventsIcon ──────────────────────────────────────────────────────
// A modern calendar with a featured star event marker.
export const EventsIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* Calendar frame */}
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    {/* Header bar */}
    <path d="M3 9h18" strokeWidth="2" />
    {/* Calendar pins */}
    <path d="M8 2v4" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 2v4" strokeWidth="2" strokeLinecap="round" />
    {/* Star event marker */}
    <path d="M12 11.5l1.1 2.3 2.5.4-1.8 1.8.4 2.5L12 17.3l-2.2 1.2.4-2.5-1.8-1.8 2.5-.4z" fill="currentColor" stroke="none" opacity="0.85" />
    {/* Date dots */}
    <circle cx="6.5" cy="13" r="0.7" fill="currentColor" stroke="none" opacity="0.4" />
    <circle cx="17.5" cy="13" r="0.7" fill="currentColor" stroke="none" opacity="0.4" />
  </svg>
);

// ─── AcademyIcon ─────────────────────────────────────────────────────
// A graduation cap with a rising light ray — learning illuminates.
export const AcademyIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* Mortarboard — angled 3D perspective */}
    <path d="M2 10l10-6 10 6-10 6z" />
    {/* Cap body / side fold */}
    <path d="M7 12.5v4.5c0 2 2.2 3.5 5 3.5s5-1.5 5-3.5v-4.5" />
    {/* Tassel line */}
    <path d="M20 10v7" strokeWidth="1.8" />
    {/* Tassel end — glowing knowledge orb */}
    <circle cx="20" cy="18" r="1.8" fill="currentColor" opacity="0.7" />
    {/* Rising light rays from the cap — illumination of learning */}
    <path d="M12 4V1.5" strokeWidth="1.3" opacity="0.5" />
    <path d="M16 5.5l1.5-2" strokeWidth="1.3" opacity="0.35" />
    <path d="M8 5.5l-1.5-2" strokeWidth="1.3" opacity="0.35" />
  </svg>
);

// ─── CommunityIcon ───────────────────────────────────────────────────
// Connected people in a ring — community & collaboration.
export const CommunityIcon: React.FC<IconProps> = ({ className }) => (
  <svg {...svgBase} className={className}>
    {/* Center person */}
    <circle cx="12" cy="8" r="2.8" />
    <path d="M8 18c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" />
    {/* Left person (smaller, behind) */}
    <circle cx="4.5" cy="10.5" r="2" strokeWidth="1.5" opacity="0.65" />
    <path d="M2 17.5c0-1.6 1.2-2.8 2.5-2.8s2.5 1.2 2.5 2.8" strokeWidth="1.5" opacity="0.65" />
    {/* Right person (smaller, behind) */}
    <circle cx="19.5" cy="10.5" r="2" strokeWidth="1.5" opacity="0.65" />
    <path d="M17 17.5c0-1.6 1.2-2.8 2.5-2.8s2.5 1.2 2.5 2.8" strokeWidth="1.5" opacity="0.65" />
    {/* Connection arcs */}
    <path d="M7.5 9.5c-1 .3-2 .8-2.5 1.5" strokeWidth="1.2" opacity="0.4" />
    <path d="M16.5 9.5c1 .3 2 .8 2.5 1.5" strokeWidth="1.2" opacity="0.4" />
  </svg>
);
