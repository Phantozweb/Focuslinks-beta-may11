import { NextResponse } from 'next/server';

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
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`);
  return res.json();
}

export async function GET() {
  try {
    // Parallel fetch all data sources
    const [profilesRaw, usersListing, webinarsListing] = await Promise.allSettled([
      // 1. Fetch list_profiles.json (raw)
      fetch(`https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/list_profiles.json`)
        .then(r => { if (!r.ok) throw new Error('profiles fetch failed'); return r.json(); }),
      // 2. List Profile/Users/ directory
      githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Profile/Users`),
      // 3. List Webinar/ directory
      githubFetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Webinar`),
    ]);

    const profiles: any[] = profilesRaw.status === 'fulfilled' ? profilesRaw.value : [];
    const usersListingData: any[] = usersListing.status === 'fulfilled' ? usersListing.value : [];
    const webinarsListingData: any[] = webinarsListing.status === 'fulfilled' ? webinarsListing.value : [];

    // Filter out non-directory entries
    const webinarDirs = webinarsListingData.filter((w: any) => w.type === 'dir' && w.name !== '.github');

    // Fetch each webinar's booked users count (limit to avoid rate limiting)
    const webinarStats = await Promise.allSettled(
      webinarDirs.slice(0, 10).map(async (w: any) => {
        const slug = w.name;
        // List contents of the webinar dir
        const contents = await githubFetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Webinar/${encodeURIComponent(slug)}`
        );
        
        let bookedCount = 0;
        let questionsCount = 0;
        const dirs = (Array.isArray(contents) ? contents : []).filter((c: any) => c.type === 'dir');
        
        for (const dir of dirs) {
          if (dir.name === 'Booked users') {
            const bookedFiles = await githubFetch(dir.url);
            bookedCount = Array.isArray(bookedFiles) ? bookedFiles.length : 0;
          }
          if (dir.name === 'ask') {
            const askFiles = await githubFetch(dir.url);
            questionsCount = Array.isArray(askFiles) ? askFiles.length : 0;
          }
        }

        return {
          slug,
          name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          bookedCount,
          questionsCount,
        };
      })
    );

    const webinars = webinarStats
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    // Parse user data for stats
    const userFiles = Array.isArray(usersListingData) ? usersListingData : [];
    const verifiedProfiles = profiles.filter((p: any) => p.verified === true);
    const countries = new Set(profiles.map((p: any) => p.country || p.location?.split(',').pop()?.trim()).filter(Boolean));
    const skillsMap = new Map<string, number>();
    profiles.forEach((p: any) => {
      (p.skills || []).forEach((s: string) => {
        skillsMap.set(s, (skillsMap.get(s) || 0) + 1);
      });
    });
    const topSkills = [...skillsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Profession/type distribution
    const typeMap = new Map<string, number>();
    profiles.forEach((p: any) => {
      const t = p.type || 'unknown';
      typeMap.set(t, (typeMap.get(t) || 0) + 1);
    });
    const typeDistribution = [...typeMap.entries()].map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      profiles: {
        total: profiles.length,
        verified: verifiedProfiles.length,
        countries: countries.size,
        topSkills,
      },
      users: {
        totalFiles: userFiles.length,
      },
      webinars: {
        total: webinarDirs.length,
        data: webinars,
      },
      typeDistribution,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
