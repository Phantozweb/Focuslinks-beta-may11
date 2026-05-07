import { NextRequest, NextResponse } from 'next/server';
import { geocodeLocation, geocodeCountryCode } from '@/lib/geoUtils';

// ─── Constants ───────────────────────────────────────────────────────────────

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;
const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;
const GITHUB_PAT = process.env.GITHUB_PAT || '';

const BATCH_SIZE = 50; // Larger batches for faster fetching
const MAX_USERS_TO_FETCH = 700; // Fetch ALL real user files (no faking, no limit)

// ─── In-memory cache (5 min TTL) ────────────────────────────────────────────

interface CacheEntry {
  data: OptoMapResponse;
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfilePoint {
  id: string;
  name: string;
  title?: string;
  location: string;
  country?: string;
  city?: string;
  lat: number;
  lng: number;
  type?: string;
  verified?: boolean;
  skills?: string[];
  image?: string;
  flCredits?: number;
  source: 'profile';
  description?: string;
  slug?: string;
}

interface UserPoint {
  id: string;
  name: string;
  title?: string;
  location: string;
  country?: string;
  city?: string;
  lat: number;
  lng: number;
  type: string;
  verified?: boolean;
  skills?: string[];
  image?: string;
  source: 'user';
}

interface ClinicPoint {
  id: string;
  name: string;
  title?: string;
  location: string;
  city: string;
  state: string;
  country?: string;
  lat: number;
  lng: number;
  type: 'clinic';
  source: 'clinic';
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  openHours?: string;
  googleMapsUrl?: string;
  description?: string;
  specialties?: string[];
  category?: string;
}

interface OptoMapStats {
  totalProfiles: number;
  totalUsers: number;
  totalClinics?: number;
  geocodedProfiles: number;
  geocodedUsers: number;
  countriesCount: number;
  profilesOnMap: number;
  usersOnMap: number;
}

interface MapPoint {
  id: string;
  name: string;
  title?: string;
  location?: string;
  country?: string;
  city?: string;
  lat: number;
  lng: number;
  type: string;
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
  imageUrl?: string;
  openHours?: string;
  googleMapsUrl?: string;
  specialties?: string[];
  category?: string;
  state?: string;
}

interface OptoMapResponse {
  profiles: MapPoint[];
  users: MapPoint[];
  clinics: MapPoint[];
  stats: OptoMapStats;
}

// ─── GitHub helpers ──────────────────────────────────────────────────────────

function ghHeaders(): Record<string, string> {
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'FocusLinks-OptoMap',
    Authorization: `token ${GITHUB_PAT}`,
  };
}

async function ghJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${url}`);
  return res.json();
}

async function rawJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${RAW_BASE}/${path}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''));
  } catch {
    return null;
  }
}

/**
 * Fetch a batch of user files in parallel, returning parsed JSON objects.
 */
async function fetchUserBatch(
  filenames: string[],
): Promise<Array<{ filename: string; data: any }>> {
  const results = await Promise.allSettled(
    filenames.map(async (fn) => {
      const data = await rawJson(`Profile/Users/${fn}`);
      return { filename: fn, data };
    }),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<{ filename: string; data: any }> => {
      return r.status === 'fulfilled' && r.value.data != null;
    })
    .map((r) => r.value);
}

// ─── Jitter helper ──────────────────────────────────────────────────────────

// Deterministic pseudo-random based on a seed string (for consistent jitter per user)
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Normalize to 0-1 range
  return (Math.abs(hash) % 10000) / 10000;
}

/**
 * Add small random jitter to coordinates so same-country users don't stack on one pixel.
 * Only applies when no city-level geocoding was found.
 * Jitter spread: ±0.8 degrees (enough to spread within country borders without diagonal chaos)
 */
function applyJitter(lat: number, lng: number, seed: string, spread: number = 0.8): { lat: number; lng: number } {
  const r1 = seededRandom(seed + '_lat');
  const r2 = seededRandom(seed + '_lng');
  return {
    lat: lat + (r1 - 0.5) * 2 * spread,
    lng: lng + (r2 - 0.5) * 2 * spread,
  };
}

// ─── Main GET handler ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filterType = searchParams.get('type'); // 'profiles' | 'users' | undefined (both)
  const filterCountry = searchParams.get('country'); // ISO code e.g. 'IN'

  // Return cached data if still fresh
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(filterResponse(cache.data, filterType, filterCountry));
  }

  try {
    const data = await buildOptoMapData();
    cache = { data, timestamp: Date.now() };
    return NextResponse.json(filterResponse(data, filterType, filterCountry));
  } catch (error) {
    console.error('[/api/opto-map] Error:', error);

    // Return stale cache if available
    if (cache) {
      return NextResponse.json(filterResponse(cache.data, filterType, filterCountry), {
        headers: { 'X-Cache': 'stale' },
      });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load map data' },
      { status: 500 },
    );
  }
}

// ─── Data builder ────────────────────────────────────────────────────────────

async function buildOptoMapData(): Promise<OptoMapResponse> {
  // 1. Fetch profiles from list_profiles.json (single request)
  const profilesRaw = await rawJson<any[]>('list_profiles.json');
  const profiles: any[] = Array.isArray(profilesRaw) ? profilesRaw : [];

  // 2. Fetch user directory listing from GitHub API (single request)
  let userFiles: string[] = [];
  try {
    const listing = await ghJson(`${API_BASE}/Profile/Users`);
    userFiles = Array.isArray(listing)
      ? listing
          .map((f: any) => f.name)
          .filter((n: string) => /^FL[A-Za-z0-9]+_userdata\.json$/i.test(n))
      : [];
  } catch (err) {
    console.warn('[/api/opto-map] Could not list users directory:', err);
  }

  // 3. Geocode profiles using their location strings
  const profileMembershipIds = new Set(
    profiles
      .map((p) => p.membershipId || p.id)
      .filter(Boolean)
      .map(String),
  );

  const profilePoints: ProfilePoint[] = profiles
    .map((p) => {
      const location = p.location || p.country || '';
      if (!location) return null;

      const geo = geocodeLocation(location);
      if (!geo) return null;

      // Apply jitter if no city-level geocoding (country centroid only)
      const hasCity = !!geo.city;
      const seed = String(p.id ?? '') + '_' + (p.name || '');
      const coords = hasCity ? { lat: geo.lat, lng: geo.lng } : applyJitter(geo.lat, geo.lng, seed);

      return {
        id: String(p.id ?? ''),
        name: p.name || 'Unknown',
        title: p.title || p.profession || undefined,
        location,
        country: geo.country,
        city: geo.city,
        lat: coords.lat,
        lng: coords.lng,
        type: p.type || 'professional',
        verified: p.verified === true,
        skills: Array.isArray(p.skills) ? p.skills : [],
        image: p.image || undefined,
        flCredits: typeof p.flCredits === 'number' ? p.flCredits : 0,
        source: 'profile' as const,
        description: p.description || p.bio || undefined,
        slug: p.slug || undefined,
      };
    })
    .filter(Boolean) as ProfilePoint[];

  // 4. Fetch real user files — exclude those already in profiles to avoid duplicates
  const unmatchedFiles = userFiles.filter((fn) => {
    const match = fn.match(/^(FL[A-Za-z0-9]+)_userdata\.json$/i);
    if (!match) return false;
    return !profileMembershipIds.has(match[1].toUpperCase());
  });

  // Fetch up to MAX_USERS_TO_FETCH real user files (NO faking, NO extrapolation)
  const filesToFetch = unmatchedFiles.slice(0, MAX_USERS_TO_FETCH);
  const usersData: UserPoint[] = [];

  // Process in batches
  for (let i = 0; i < filesToFetch.length; i += BATCH_SIZE) {
    const batch = filesToFetch.slice(i, i + BATCH_SIZE);
    const results = await fetchUserBatch(batch);
    for (const { filename, data } of results) {
      const membershipId = filename.replace(/_userdata\.json$/i, '');

      // Build the user's actual location string from their data
      const city = data?.city || data?.location || '';
      const state = data?.state || '';
      const countryRaw = data?.country || data?.countryCode || '';

      // Try multiple location strategies
      let locationString = '';
      let geo: { lat: number; lng: number; country?: string; city?: string } | null = null;

      // Strategy 1: Try geocoding the full location if provided
      const userLocation = data?.location || '';
      if (userLocation) {
        geo = geocodeLocation(userLocation);
        if (geo) locationString = userLocation;
      }

      // Strategy 2: Build from city + state + country
      if (!geo && (city || countryRaw)) {
        const parts = [city, state, countryRaw].filter(Boolean).join(', ');
        geo = geocodeLocation(parts);
        if (geo) locationString = parts;
      }

      // Strategy 3: Just country code/name
      if (!geo && countryRaw) {
        const code = countryRaw.length <= 3 ? countryRaw.toUpperCase() : '';
        geo = code ? geocodeCountryCode(code) : geocodeLocation(countryRaw);
        if (geo) locationString = geo.country || countryRaw;
      }

      if (!geo) continue; // Skip users we can't geocode — NO fake entries

      // Apply jitter if no city-level geocoding (country centroid only)
      const hasCityGeo = !!geo.city;
      const userSeed = membershipId + '_' + (data?.fullName || data?.name || '');
      const userCoords = hasCityGeo ? { lat: geo.lat, lng: geo.lng } : applyJitter(geo.lat, geo.lng, userSeed);

      usersData.push({
        id: membershipId,
        name: data?.fullName || data?.name || 'FocusLinks Member',
        title: data?.profession || data?.role || data?.specialization || undefined,
        location: locationString,
        country: geo.country,
        city: geo.city || city || undefined,
        lat: userCoords.lat,
        lng: userCoords.lng,
        type: data?.profession?.toLowerCase()?.includes('student') ||
              data?.role?.toLowerCase()?.includes('student') ||
              data?.type?.toLowerCase()?.includes('student')
          ? 'student' : 'professional',
        verified: false,
        source: 'user',
      });
    }
  }

  // 6. Fetch clinics from GitHub ClinicListings directory (list all JSON files)
  const clinics: ClinicPoint[] = [];
  try {
    const clinicListing = await ghJson(`${API_BASE}/ClinicListings`);
    const clinicFiles: string[] = Array.isArray(clinicListing)
      ? clinicListing
          .map((f: any) => f.name)
          .filter((n: string) => /\.json$/i.test(n))
      : [];

    // Fetch all clinic JSON files in parallel batches
    for (let i = 0; i < clinicFiles.length; i += BATCH_SIZE) {
      const batch = clinicFiles.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (fn) => {
          const data = await rawJson<any[]>(`ClinicListings/${fn}`);
          return { filename: fn, data };
        }),
      );
      for (const result of results) {
        if (result.status !== 'fulfilled' || !result.value.data) continue;
        const fileData = result.value.data;
        const items = Array.isArray(fileData) ? fileData : [fileData];
        for (const c of items) {
          const lat = parseFloat(c.lat) || 0;
          const lng = parseFloat(c.lng) || 0;
          if (!lat || !lng || !c.name) continue;

          // Geocode country from country field or location
          let countryName = c.country || '';
          if (!countryName && c.location) {
            const geo = geocodeLocation(c.location);
            if (geo) countryName = geo.country || '';
          }
          if (!countryName && c.city) {
            const geo = geocodeLocation(c.city);
            if (geo) countryName = geo.country || '';
          }

          clinics.push({
            id: c.id || `clinic_${c.name.replace(/\s+/g, '_').slice(0, 20)}_${Math.random().toString(36).slice(2, 6)}`,
            name: c.name,
            title: c.category || c.specialty || 'Optometry Clinic',
            location: c.address || [c.city, c.state, c.country].filter(Boolean).join(', '),
            city: c.city || '',
            state: c.state || '',
            country: countryName || undefined,
            lat,
            lng,
            type: 'clinic' as const,
            source: 'clinic' as const,
            phone: c.phone || undefined,
            website: c.website || undefined,
            rating: parseFloat(c.rating) || 0,
            reviews: parseInt(c.reviews) || 0,
            imageUrl: c.imageUrl || c.image || undefined,
            openHours: c.openHours || c.hours || undefined,
            googleMapsUrl: c.googleMapsUrl || c.mapsUrl || undefined,
            description: c.description || c.about || undefined,
            specialties: Array.isArray(c.specialties) ? c.specialties :
              (typeof c.specialty === 'string' ? [c.specialty] : undefined),
            category: c.category || undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[/api/opto-map] Could not fetch clinics directory:', err);
  }

  // 7. Compute honest stats — NO fake/extrapolated numbers, NO double counting
  const countriesSet = new Set<string>();
  profilePoints.forEach((p) => {
    if (p.country) countriesSet.add(p.country);
  });
  usersData.forEach((u) => {
    if (u.country) countriesSet.add(u.country);
  });
  clinics.forEach((c) => {
    if (c.country) countriesSet.add(c.country);
  });

  // totalProfiles = curated profiles from list_profiles.json (real entries)
  const totalProfiles = profiles.length;
  // totalUsers = user files NOT already in profiles (deduplicated)
  const totalUsers = unmatchedFiles.length;
  const geocodedProfiles = profilePoints.length;
  const geocodedUsers = usersData.length;

  return {
    profiles: profilePoints,
    users: usersData,
    clinics,
    stats: {
      totalProfiles,
      totalUsers,
      totalClinics: clinics.length,
      geocodedProfiles,
      geocodedUsers,
      countriesCount: countriesSet.size,
      profilesOnMap: profilePoints.length,
      usersOnMap: usersData.length,
    },
  };
}

// ─── Response filtering ──────────────────────────────────────────────────────

function filterResponse(
  data: OptoMapResponse,
  type?: string | null,
  country?: string | null,
): OptoMapResponse {
  const countryUpper = country?.toUpperCase().trim();

  let profiles = data.profiles;
  let users = data.users;
  let clinics = data.clinics;

  if (countryUpper) {
    profiles = profiles.filter(
      (p) =>
        p.country?.toUpperCase() === countryUpper,
    );
    users = users.filter(
      (u) =>
        u.country?.toUpperCase() === countryUpper,
    );
    clinics = clinics.filter(
      (c) =>
        c.country?.toUpperCase() === countryUpper,
    );
  }

  if (type === 'profiles') {
    return { ...data, profiles, users: [], clinics: [] };
  }
  if (type === 'users') {
    return { ...data, profiles: [], users, clinics: [] };
  }

  return { ...data, profiles, users, clinics };
}
