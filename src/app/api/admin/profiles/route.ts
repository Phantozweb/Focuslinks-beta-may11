import { NextRequest, NextResponse } from 'next/server';

const GITHUB_RAW = 'https://raw.githubusercontent.com/Phantozweb/Fldatas/main/list_profiles.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const type = searchParams.get('type') || '';

    const res = await fetch(GITHUB_RAW, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
    
    let profiles: any[] = await res.json();

    // Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      profiles = profiles.filter((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.membershipId?.toLowerCase().includes(q) ||
        (p.skills || []).some((s: string) => s.toLowerCase().includes(q))
      );
    }
    if (country) {
      profiles = profiles.filter((p: any) => {
        const loc = (p.country || p.location || '').toLowerCase();
        return loc.includes(country.toLowerCase());
      });
    }
    if (type) {
      profiles = profiles.filter((p: any) => p.type === type);
    }

    // Pagination
    const total = profiles.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = profiles.slice(start, start + limit);

    // Extract unique countries & types for filters
    return NextResponse.json({
      profiles: paginated,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error('Admin profiles error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
