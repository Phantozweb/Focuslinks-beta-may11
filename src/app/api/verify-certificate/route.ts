import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;
const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

interface WebinarUser {
  entryId?: string;
  name?: string;
  email?: string;
  membershipId?: string;
  [key: string]: unknown;
}

// ── In-memory cache for webinar attendees (5-minute TTL) ──
let cachedBookedUsers: WebinarUser[] | null = null;
let cachedJoinedUsers: WebinarUser[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches all JSON files from a GitHub directory and parses them into an array.
 * Uses GitHub Contents API with PAT for directory listing, then fetches each file.
 */
async function fetchUsersFromDirectory(directoryPath: string): Promise<WebinarUser[]> {
  const GITHUB_PAT = process.env.GITHUB_PAT;
  const users: WebinarUser[] = [];

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'FocusLinks-App',
  };
  if (GITHUB_PAT) {
    headers.Authorization = `token ${GITHUB_PAT}`;
  }

  const encodedPath = directoryPath.split('/').map(encodeURIComponent).join('/');
  const listRes = await fetch(`${API_BASE}/${encodedPath}`, { headers, cache: 'no-store' });

  if (!listRes.ok) {
    console.error(`[verify-certificate] Failed to list directory ${directoryPath}: ${listRes.status}`);
    return users;
  }

  const files = await listRes.json();

  if (!Array.isArray(files)) {
    return users;
  }

  // Fetch each JSON file in parallel (batched)
  const filePromises = files
    .filter((file: { name?: string }) => file.name?.endsWith('.json'))
    .map(async (file: { name: string }) => {
      try {
        const fileRes = await fetch(`${RAW_BASE}/${directoryPath}/${file.name}?t=${Date.now()}`, { cache: 'no-store' });
        if (fileRes.ok) {
          const text = await fileRes.text();
          const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          return JSON.parse(sanitized) as WebinarUser;
        }
      } catch (e) {
        console.error(`[verify-certificate] Error parsing ${file.name}:`, e);
      }
      return null;
    });

  const results = await Promise.all(filePromises);
  for (const result of results) {
    if (result) users.push(result);
  }

  return users;
}

/**
 * Returns cached webinar attendee data or fetches fresh data.
 */
async function getWebinarAttendees(slug: string): Promise<{ booked: WebinarUser[]; joined: WebinarUser[] }> {
  const now = Date.now();

  if (cachedBookedUsers !== null && cachedJoinedUsers !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return { booked: cachedBookedUsers, joined: cachedJoinedUsers };
  }

  const [booked, joined] = await Promise.all([
    fetchUsersFromDirectory(`Webinar/${slug}/Booked users`),
    fetchUsersFromDirectory(`Webinar/${slug}/Joined users`),
  ]);

  cachedBookedUsers = booked;
  cachedJoinedUsers = joined;
  cacheTimestamp = now;

  return { booked, joined };
}

/**
 * Normalizes a string for comparison (lowercase, trimmed).
 */
function normalize(str: string | undefined | null): string {
  return (str || '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email, membershipId, name } = body;

    if (!slug) {
      return NextResponse.json({ eligible: false, error: 'Webinar slug is required.' }, { status: 400 });
    }

    if (!email && !membershipId) {
      return NextResponse.json({ eligible: false, error: 'Please provide an email address or Membership ID.' }, { status: 400 });
    }

    const { booked, joined } = await getWebinarAttendees(slug);

    // Combine all attendees (booked + joined)
    const allAttendees = [...booked, ...joined];

    // Check eligibility by matching email OR membershipId
    let matchFound = false;
    let matchedBy = '';
    let matchedName = '';
    let matchedEmail = '';
    let matchedMembershipId = '';

    const normalizedEmail = normalize(email);
    const normalizedMembershipId = normalize(membershipId);
    const normalizedName = normalize(name);

    for (const attendee of allAttendees) {
      const attendeeEmail = normalize(attendee.email);
      const attendeeMembershipId = normalize(attendee.membershipId);
      const attendeeName = normalize(attendee.name);

      // Match by email
      if (normalizedEmail && attendeeEmail && attendeeEmail === normalizedEmail) {
        matchFound = true;
        matchedBy = 'email';
        matchedName = attendee.name || name || '';
        matchedEmail = attendee.email || email || '';
        matchedMembershipId = attendee.membershipId || '';
        break;
      }

      // Match by membership ID
      if (normalizedMembershipId && attendeeMembershipId && attendeeMembershipId === normalizedMembershipId) {
        matchFound = true;
        matchedBy = 'membershipId';
        matchedName = attendee.name || name || '';
        matchedEmail = attendee.email || email || '';
        matchedMembershipId = attendee.membershipId || membershipId || '';
        break;
      }

      // Match by name (fallback - some booked users have name as membershipId field)
      if (normalizedName && attendeeName && attendeeName === normalizedName && !attendeeEmail && !attendeeMembershipId) {
        matchFound = true;
        matchedBy = 'name';
        matchedName = attendee.name || name || '';
        matchedEmail = attendee.email || email || '';
        matchedMembershipId = attendee.membershipId || membershipId || '';
        break;
      }
    }

    if (matchFound) {
      // Determine source (booked, joined, or both)
      const wasBooked = booked.some(a => {
        const aEmail = normalize(a.email);
        const aMid = normalize(a.membershipId);
        const aName = normalize(a.name);
        return (normalizedEmail && aEmail === normalizedEmail) ||
               (normalizedMembershipId && aMid === normalizedMembershipId) ||
               (normalizedName && aName === normalizedName && !aEmail && !aMid);
      });
      const wasJoined = joined.some(a => {
        const aEmail = normalize(a.email);
        const aMid = normalize(a.membershipId);
        const aName = normalize(a.name);
        return (normalizedEmail && aEmail === normalizedEmail) ||
               (normalizedMembershipId && aMid === normalizedMembershipId) ||
               (normalizedName && aName === normalizedName && !aEmail && !aMid);
      });

      let source = '';
      if (wasBooked && wasJoined) source = 'Registered & Attended';
      else if (wasJoined) source = 'Attended';
      else if (wasBooked) source = 'Registered';

      return NextResponse.json({
        eligible: true,
        matchedBy,
        name: matchedName,
        email: matchedEmail,
        membershipId: matchedMembershipId,
        source,
        totalBooked: booked.length,
        totalJoined: joined.length,
      });
    }

    return NextResponse.json({
      eligible: false,
      error: 'No booking or attendance record found. Please make sure you use the same email or Membership ID you used when booking or joining the webinar.',
      totalBooked: booked.length,
      totalJoined: joined.length,
    });

  } catch (error) {
    console.error('[verify-certificate] Error:', error);
    return NextResponse.json(
      { eligible: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
