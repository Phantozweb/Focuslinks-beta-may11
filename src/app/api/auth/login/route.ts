import { NextRequest, NextResponse } from 'next/server';

// ── In-memory cache for list_profiles.json (5-minute TTL) ──
interface MemberProfile {
  membershipId: string;
  name?: string;
  title?: string;
  location?: string;
  image?: string;
  email?: string;
  [key: string]: unknown;
}

let cachedProfiles: MemberProfile[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/`;
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;
const PROFILES_FILE = 'list_profiles.json';

/**
 * Fetches list_profiles.json from GitHub, using the in-memory cache when valid.
 */
async function fetchMemberProfiles(): Promise<MemberProfile[]> {
  const now = Date.now();

  if (cachedProfiles && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedProfiles;
  }

  // Strategy 1: raw.githubusercontent.com (no auth needed)
  const rawUrl = `${RAW_BASE_URL}/${PROFILES_FILE}?t=${now}`;
  const rawResponse = await fetch(rawUrl, { cache: 'no-store' });

  if (rawResponse.ok) {
    const text = await rawResponse.text();
    const sanitizedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    const profiles = JSON.parse(sanitizedText) as MemberProfile[];
    cachedProfiles = profiles;
    cacheTimestamp = now;
    return profiles;
  }

  // Strategy 2: GitHub Contents API with PAT as fallback
  const GITHUB_PAT = process.env.GITHUB_PAT;
  if (!GITHUB_PAT) {
    throw new Error('Unable to fetch member profiles: raw URL failed and GITHUB_PAT is not configured.');
  }

  const apiUrl = `${GITHUB_API_BASE}${PROFILES_FILE}`;
  const apiResponse = await fetch(apiUrl, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'FocusLinks-App',
      Authorization: `token ${GITHUB_PAT}`,
    },
    cache: 'no-store',
  });

  if (!apiResponse.ok) {
    throw new Error(`GitHub API returned ${apiResponse.status} while fetching ${PROFILES_FILE}`);
  }

  const fileData = await apiResponse.json();
  const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const sanitizedDecoded = decoded.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  const profiles = JSON.parse(sanitizedDecoded) as MemberProfile[];
  cachedProfiles = profiles;
  cacheTimestamp = now;
  return profiles;
}

/**
 * Fetches the full user data JSON from GitHub:
 * Profile/Users/{membershipId}_userdata.json
 */
async function fetchUserData(membershipId: string): Promise<Record<string, unknown> | null> {
  const GITHUB_PAT = process.env.GITHUB_PAT;
  const userDataPath = `Profile/Users/${membershipId}_userdata.json`;

  // Strategy 1: raw.githubusercontent.com (no auth needed)
  const rawUrl = `${RAW_BASE_URL}/${userDataPath}?t=${Date.now()}`;
  const rawResponse = await fetch(rawUrl, { cache: 'no-store' });

  if (rawResponse.ok) {
    try {
      const text = await rawResponse.text();
      const sanitizedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      return JSON.parse(sanitizedText) as Record<string, unknown>;
    } catch {
      // Invalid JSON, return null
      return null;
    }
  }

  // Strategy 2: GitHub Contents API with PAT
  if (GITHUB_PAT) {
    const apiUrl = `${GITHUB_API_BASE}${userDataPath}`;
    const apiResponse = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'FocusLinks-App',
        Authorization: `token ${GITHUB_PAT}`,
      },
      cache: 'no-store',
    });

    if (apiResponse.ok) {
      try {
        const fileData = await apiResponse.json();
        const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const sanitizedDecoded = decoded.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        return JSON.parse(sanitizedDecoded) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }

  return null;
}

/**
 * POST /api/auth/login
 * Verifies a membership ID and returns full user profile data.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipId } = body;

    if (!membershipId || typeof membershipId !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Membership ID is required.' },
        { status: 400 }
      );
    }

    const normalized = membershipId.trim().toUpperCase();

    // 1. Verify membership ID exists in list_profiles.json
    const profiles = await fetchMemberProfiles();
    const memberProfile = profiles.find(
      (p) => p.membershipId?.trim().toUpperCase() === normalized
    );

    if (!memberProfile) {
      return NextResponse.json({
        valid: false,
        error: 'Membership ID not found. Please check your ID or apply for membership.',
      });
    }

    // 2. Fetch full user data from GitHub (optional enrichment)
    const userData = await fetchUserData(normalized);

    // 3. Build the full user object
    const userTitle = memberProfile.title ?? (userData?.title as string) ?? (userData?.profession as string) ?? 'Member';
    const user = {
      membershipId: normalized,
      name: memberProfile.name ?? (userData?.name as string) ?? (userData?.fullName as string) ?? 'Unknown',
      title: userTitle,
      role: userTitle, // Alias for compatibility with MembershipForm
      location: memberProfile.location ?? (userData?.location as string) ?? '',
      image: memberProfile.image ?? (userData?.image as string) ?? '',
      email: memberProfile.email ?? (userData?.email as string) ?? '',
      country: (userData?.country as string) ?? '',
      verified: true,
      // Merge any extra fields from userData
      ...(userData ? { userData } : {}),
    };

    return NextResponse.json({ valid: true, user });
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
