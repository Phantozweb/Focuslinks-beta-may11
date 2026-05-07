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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Profile/Users`;
    const files = await githubFetch(url);
    
    if (!Array.isArray(files)) {
      return NextResponse.json({ users: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    // Extract membership IDs and types from filenames
    let userData = files.map((f: any) => {
      const name = f.name.replace('_userdata.json', '');
      return { membershipId: name, filename: f.name, downloadUrl: f.download_url };
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      userData = userData.filter((u: any) => u.membershipId.toLowerCase().includes(q));
    }

    const total = userData.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = userData.slice(start, start + limit);

    // Fetch details for paginated users
    const detailedUsers = await Promise.allSettled(
      paginated.map(async (u: any) => {
        try {
          const res = await fetch(u.downloadUrl);
          if (!res.ok) return { ...u, type: 'unknown', status: 'error' };
          const data = await res.json();
          return {
            membershipId: u.membershipId,
            filename: u.filename,
            fullName: data.fullName || data.name || '',
            email: data.email || '',
            profession: data.profession || '',
            country: data.country || '',
            cityState: data.cityState || '',
            status: data.status || 'pending',
            verified: data.verified || false,
            type: data.type || data.membership_application ? 'application' : 'user',
            submittedAt: data.submittedAt || data.timestamp || '',
          };
        } catch {
          return { ...u, type: 'unknown', status: 'error' };
        }
      })
    );

    return NextResponse.json({
      users: detailedUsers
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .map(r => r.value),
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
