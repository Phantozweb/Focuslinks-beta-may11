import { NextRequest, NextResponse } from 'next/server';

// ── In-memory cache for list_profiles.json (5-minute TTL) ──
interface MemberProfile {
  membershipId: string;
  name?: string;
  title?: string;
  location?: string;
  image?: string;
  [key: string]: unknown;
}

let cachedProfiles: MemberProfile[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/`;
const PROFILES_FILE = 'list_profiles.json';

/**
 * Fetches list_profiles.json from GitHub, using the in-memory cache when valid.
 * Falls back to PAT-authenticated requests if public fetch is rate-limited.
 */
async function fetchMemberProfiles(): Promise<MemberProfile[]> {
  const now = Date.now();

  // Return cached data if still fresh
  if (cachedProfiles && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedProfiles;
  }

  // Strategy 1: Try raw.githubusercontent.com first (no auth needed)
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${PROFILES_FILE}?t=${now}`;
  const rawResponse = await fetch(rawUrl, { cache: 'no-store' });

  if (rawResponse.ok) {
    const text = await rawResponse.text();
    const sanitizedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    const profiles = JSON.parse(sanitizedText) as MemberProfile[];

    // Update cache
    cachedProfiles = profiles;
    cacheTimestamp = now;
    return profiles;
  }

  // Strategy 2: Use GitHub Contents API with PAT as fallback
  const GITHUB_PAT = process.env.GITHUB_PAT;
  if (!GITHUB_PAT) {
    throw new Error(
      'Unable to fetch member profiles: raw URL failed and GITHUB_PAT is not configured.'
    );
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
    throw new Error(
      `GitHub API returned ${apiResponse.status} while fetching ${PROFILES_FILE}`
    );
  }

  // The Contents API returns { content, encoding, … } for files — decode base64
  const fileData = await apiResponse.json();
  const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const sanitizedDecoded = decoded.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  const profiles = JSON.parse(sanitizedDecoded) as MemberProfile[];

  // Update cache
  cachedProfiles = profiles;
  cacheTimestamp = now;
  return profiles;
}

/**
 * Looks up a membershipId across the profiles list.
 * Returns the matching member's public fields or null.
 */
function findMember(
  profiles: MemberProfile[],
  membershipId: string
): { name: string; title: string; location: string; image: string } | null {
  const normalized = membershipId.trim();

  for (const profile of profiles) {
    if (profile.membershipId?.trim() === normalized) {
      return {
        name: profile.name ?? 'Unknown',
        title: profile.title ?? 'Member',
        location: profile.location ?? '',
        image: profile.image ?? '',
      };
    }
  }

  return null;
}

// ── POST: Verify membership via JSON body ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipId } = body;

    if (!membershipId || typeof membershipId !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'membershipId is required and must be a string.' },
        { status: 400 }
      );
    }

    const profiles = await fetchMemberProfiles();
    const member = findMember(profiles, membershipId);

    if (member) {
      return NextResponse.json({ valid: true, member });
    }

    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error('Error in POST /api/verify-membership:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// ── GET: Verify membership via query parameter ?id=FL-XXXXX ──
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const membershipId = searchParams.get('id');

    if (!membershipId) {
      return NextResponse.json(
        { valid: false, error: 'Query parameter "id" is required (e.g. ?id=FL-XXXXX).' },
        { status: 400 }
      );
    }

    const profiles = await fetchMemberProfiles();
    const member = findMember(profiles, membershipId);

    if (member) {
      return NextResponse.json({ valid: true, member });
    }

    return NextResponse.json({ valid: false });
  } catch (error) {
    console.error('Error in GET /api/verify-membership:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
