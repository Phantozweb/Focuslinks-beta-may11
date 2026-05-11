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
let cachedSlug: string | null = null;
let cachedBookedUsers: WebinarUser[] | null = null;
let cachedJoinedUsers: WebinarUser[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Checks if a membershipId value is actually a name (not a real FL ID).
 * FL Membership IDs follow patterns like FL2ZXS6C, FL39BOKG, FLIPKUEP, etc.
 * A name-as-membershipId would contain spaces or be a full human name.
 */
function isNameNotMembershipId(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  // If it contains a space, it's almost certainly a name, not an ID
  if (trimmed.includes(' ')) return true;
  // If it doesn't start with "FL" and is longer than 10 chars without special chars, likely a name
  if (!trimmed.toUpperCase().startsWith('FL') && trimmed.length > 10) return true;
  return false;
}

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

  // Add 10s timeout to prevent hanging on GitHub API issues
  const listController = new AbortController();
  const listTimeout = setTimeout(() => listController.abort(), 10000);

  let listRes: Response;
  try {
    listRes = await fetch(`${API_BASE}/${encodedPath}`, { headers, cache: 'no-store', signal: listController.signal });
  } catch (err) {
    clearTimeout(listTimeout);
    console.error(`[verify-certificate] Timeout/error listing directory ${directoryPath}:`, err);
    return users;
  }
  clearTimeout(listTimeout);

  if (!listRes.ok) {
    console.error(`[verify-certificate] Failed to list directory ${directoryPath}: ${listRes.status}`);
    return users;
  }

  const files = await listRes.json();

  if (!Array.isArray(files)) {
    return users;
  }

  // Fetch each JSON file in parallel (batched) with timeout
  const filePromises = files
    .filter((file: { name?: string }) => file.name?.endsWith('.json'))
    .map(async (file: { name: string }) => {
      try {
        // Add 8s timeout per file fetch
        const fileController = new AbortController();
        const fileTimeout = setTimeout(() => fileController.abort(), 8000);

        // Try raw URL first (faster, works for public repos)
        let fileRes = await fetch(`${RAW_BASE}/${directoryPath}/${file.name}?t=${Date.now()}`, { cache: 'no-store', signal: fileController.signal });

        // If raw URL fails, try with PAT via Contents API
        if (!fileRes.ok && GITHUB_PAT) {
          clearTimeout(fileTimeout);
          const apiFileController = new AbortController();
          const apiFileTimeout = setTimeout(() => apiFileController.abort(), 8000);
          const apiFileRes = await fetch(`${API_BASE}/${encodedPath}/${file.name}`, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'FocusLinks-App',
              Authorization: `token ${GITHUB_PAT}`,
            },
            cache: 'no-store',
            signal: apiFileController.signal,
          });
          clearTimeout(apiFileTimeout);
          if (apiFileRes.ok) {
            const fileData = await apiFileRes.json();
            const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
            const sanitized = decoded.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            return JSON.parse(sanitized) as WebinarUser;
          }
        }

        if (fileRes.ok) {
          clearTimeout(fileTimeout);
          const text = await fileRes.text();
          const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          return JSON.parse(sanitized) as WebinarUser;
        }
        clearTimeout(fileTimeout);
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
 * Cache is per-slug (invalidated when slug changes).
 */
async function getWebinarAttendees(slug: string): Promise<{ booked: WebinarUser[]; joined: WebinarUser[] }> {
  const now = Date.now();

  // Invalidate cache if slug changed
  if (cachedSlug !== slug) {
    cachedBookedUsers = null;
    cachedJoinedUsers = null;
  }

  if (cachedBookedUsers !== null && cachedJoinedUsers !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return { booked: cachedBookedUsers, joined: cachedJoinedUsers };
  }

  const [booked, joined] = await Promise.all([
    fetchUsersFromDirectory(`Webinar/${slug}/Booked users`),
    fetchUsersFromDirectory(`Webinar/${slug}/Joined users`),
  ]);

  cachedSlug = slug;
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

    if (!email && !membershipId && !name) {
      return NextResponse.json({ eligible: false, error: 'Please provide your name, email address, or Membership ID.' }, { status: 400 });
    }

    const { booked, joined } = await getWebinarAttendees(slug);

    // Combine all attendees (booked + joined)
    const allAttendees = [...booked, ...joined];

    // Check eligibility by matching email OR membershipId OR name
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

      // Match by email (highest priority)
      if (normalizedEmail && attendeeEmail && attendeeEmail === normalizedEmail) {
        matchFound = true;
        matchedBy = 'email';
        matchedName = attendee.name || name || '';
        matchedEmail = attendee.email || email || '';
        // Only use the attendee's membershipId if it's a real FL ID (not a name)
        matchedMembershipId = (!isNameNotMembershipId(attendee.membershipId) && attendee.membershipId)
          ? attendee.membershipId
          : (membershipId || '');
        break;
      }

      // Match by membership ID (skip if the stored membershipId is actually a name)
      if (normalizedMembershipId && attendeeMembershipId && !isNameNotMembershipId(attendee.membershipId) && attendeeMembershipId === normalizedMembershipId) {
        matchFound = true;
        matchedBy = 'membershipId';
        matchedName = attendee.name || name || '';
        matchedEmail = attendee.email || email || '';
        matchedMembershipId = attendee.membershipId || membershipId || '';
        break;
      }

      // Match by name (works for users who may have name stored as membershipId, or no email/ID)
      if (normalizedName && attendeeName && attendeeName === normalizedName) {
        matchFound = true;
        matchedBy = 'name';
        matchedName = attendee.name || name || '';
        matchedEmail = attendee.email || email || '';
        matchedMembershipId = (!isNameNotMembershipId(attendee.membershipId) && attendee.membershipId)
          ? attendee.membershipId
          : (membershipId || '');
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
               (normalizedMembershipId && aMid === normalizedMembershipId && !isNameNotMembershipId(a.membershipId)) ||
               (normalizedName && aName === normalizedName);
      });
      const wasJoined = joined.some(a => {
        const aEmail = normalize(a.email);
        const aMid = normalize(a.membershipId);
        const aName = normalize(a.name);
        return (normalizedEmail && aEmail === normalizedEmail) ||
               (normalizedMembershipId && aMid === normalizedMembershipId && !isNameNotMembershipId(a.membershipId)) ||
               (normalizedName && aName === normalizedName);
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
      error: 'No booking or attendance record found. Please make sure you use the same email, Membership ID, or name you used when booking or joining the webinar.',
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
