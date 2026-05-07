import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const GITHUB_PAT = process.env.GITHUB_PAT;

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'FocusLinks-Admin',
  };
  if (GITHUB_PAT) h['Authorization'] = `token ${GITHUB_PAT}`;
  return h;
}

async function githubFetch(url: string) {
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const webinarSlug = searchParams.get('slug') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 1. List all webinars
    if (action === 'list') {
      const contents = await githubFetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Webinar`
      );
      const dirs = (Array.isArray(contents) ? contents : [])
        .filter((w: any) => w.type === 'dir' && w.name !== '.github');

      const webinars = await Promise.allSettled(
        dirs.slice(0, 10).map(async (w: any) => {
          const slug = w.name;
          const inner = await githubFetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Webinar/${encodeURIComponent(slug)}`
          );
          const innerDirs = (Array.isArray(inner) ? inner : []).filter((c: any) => c.type === 'dir');

          let bookedCount = 0;
          let questionsCount = 0;
          let latestBooking: string | null = null;

          for (const dir of innerDirs) {
            if (dir.name === 'Booked users') {
              const files = await githubFetch(dir.url);
              bookedCount = Array.isArray(files) ? files.length : 0;
              if (Array.isArray(files) && files.length > 0) {
                latestBooking = files[files.length - 1].name.split('_')[0];
              }
            }
            if (dir.name === 'ask') {
              const files = await githubFetch(dir.url);
              questionsCount = Array.isArray(files) ? files.length : 0;
            }
          }

          return {
            slug,
            displayName: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            bookedCount,
            questionsCount,
            latestBooking,
          };
        })
      );

      return NextResponse.json({
        webinars: webinars
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
          .map(r => r.value),
      });
    }

    // 2. Get specific webinar bookings (with pagination)
    if (action === 'bookings' && webinarSlug) {
      const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Webinar/${encodeURIComponent(webinarSlug)}/Booked%20users`;
      const files = await githubFetch(url);

      if (!Array.isArray(files)) {
        return NextResponse.json({ bookings: [], total: 0, page, limit, totalPages: 0 });
      }

      const total = files.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedFiles = files.slice(start, start + limit);

      const bookings = await Promise.allSettled(
        paginatedFiles.map(async (f: any) => {
          const res = await fetch(f.download_url);
          if (!res.ok) return null;
          return res.json();
        })
      );

      return NextResponse.json({
        bookings: bookings
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
          .map(r => r.value),
        pagination: { page, limit, total, totalPages },
      });
    }

    // 3. Get specific webinar questions (with pagination)
    if (action === 'questions' && webinarSlug) {
      const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Webinar/${encodeURIComponent(webinarSlug)}/ask`;
      const files = await githubFetch(url);

      if (!Array.isArray(files)) {
        return NextResponse.json({ questions: [], total: 0, page, limit, totalPages: 0 });
      }

      const total = files.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedFiles = files.slice(start, start + limit);

      const questions = await Promise.allSettled(
        paginatedFiles.map(async (f: any) => {
          const res = await fetch(f.download_url);
          if (!res.ok) return null;
          return res.json();
        })
      );

      return NextResponse.json({
        questions: questions
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
          .map(r => r.value),
        pagination: { page, limit, total, totalPages },
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use: list, bookings, questions' }, { status: 400 });
  } catch (error) {
    console.error('Admin webinars error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch webinar data' },
      { status: 500 }
    );
  }
}
