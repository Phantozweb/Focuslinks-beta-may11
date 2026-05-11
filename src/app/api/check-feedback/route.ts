import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const API_BASE = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

// ── In-memory cache for feedback check (2-minute TTL) ──
let cachedSlug: string | null = null;
let cachedFeedbackUsers: Set<string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

/**
 * Fetches all feedback JSON files from a GitHub directory and checks
 * if a given user (by email or membershipId) has already submitted feedback.
 */
async function checkFeedbackExists(slug: string, email?: string, membershipId?: string): Promise<{ submitted: boolean; matchBy?: string }> {
  if (!email && !membershipId) {
    return { submitted: false };
  }

  const GITHUB_PAT = process.env.GITHUB_PAT;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'FocusLinks-App',
  };
  if (GITHUB_PAT) {
    headers.Authorization = `token ${GITHUB_PAT}`;
  }

  try {
    const encodedPath = `Webinar/${slug}/feedback`;
    const listRes = await fetch(`${API_BASE}/${encodedPath}`, { headers, cache: 'no-store' });

    if (!listRes.ok) {
      console.error(`[check-feedback] Failed to list feedback directory: ${listRes.status}`);
      return { submitted: false };
    }

    const files = await listRes.json();
    if (!Array.isArray(files)) {
      return { submitted: false };
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedMid = (membershipId || '').trim().toLowerCase();

    // Check each feedback file for a match
    for (const file of files) {
      if (!file.name?.endsWith('.json')) continue;
      try {
        let fileRes = await fetch(`${RAW_BASE}/${encodedPath}/${file.name}?t=${Date.now()}`, { cache: 'no-store' });
        let content: any = null;

        if (fileRes.ok) {
          const text = await fileRes.text();
          content = JSON.parse(text);
        } else if (GITHUB_PAT) {
          const apiRes = await fetch(`${API_BASE}/${encodedPath}/${file.name}`, {
            headers: { ...headers, Authorization: `token ${GITHUB_PAT}` },
            cache: 'no-store',
          });
          if (apiRes.ok) {
            const fileData = await apiRes.json();
            const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
            content = JSON.parse(decoded);
          }
        }

        if (content) {
          const fbEmail = (content.email || '').trim().toLowerCase();
          const fbMid = (content.membershipId || '').trim().toLowerCase();

          if (normalizedEmail && fbEmail === normalizedEmail) {
            return { submitted: true, matchBy: 'email' };
          }
          if (normalizedMid && fbMid === normalizedMid) {
            return { submitted: true, matchBy: 'membershipId' };
          }
        }
      } catch (e) {
        console.error(`[check-feedback] Error parsing ${file.name}:`, e);
      }
    }
  } catch (error) {
    console.error('[check-feedback] Error:', error);
  }

  return { submitted: false };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email, membershipId } = body;

    if (!slug) {
      return NextResponse.json({ submitted: false, error: 'Webinar slug is required.' }, { status: 400 });
    }

    const result = await checkFeedbackExists(slug, email, membershipId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[check-feedback] Error:', error);
    return NextResponse.json(
      { submitted: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
