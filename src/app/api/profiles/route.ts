import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/profiles - List all profiles with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { membershipId: { contains: search } },
          ],
        }
      : {};

    const [profiles, total] = await Promise.all([
      db.userProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      }),
      db.userProfile.count({ where }),
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

// POST /api/profiles - Create or update a profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipId, name, email, bio, avatar, location, title, role, skills, website, socialLinks } = body;

    if (!membershipId || !name) {
      return NextResponse.json(
        { error: 'membershipId and name are required' },
        { status: 400 }
      );
    }

    // Upsert: create if doesn't exist, update if it does
    const profile = await db.userProfile.upsert({
      where: { membershipId },
      update: {
        name,
        email: email || undefined,
        bio: bio || undefined,
        avatar: avatar || undefined,
        location: location || undefined,
        title: title || undefined,
        role: role || undefined,
        skills: skills || undefined,
        website: website || undefined,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : undefined,
      },
      create: {
        membershipId,
        name,
        email: email || undefined,
        bio: bio || undefined,
        avatar: avatar || undefined,
        location: location || undefined,
        title: title || undefined,
        role: role || undefined,
        skills: skills || undefined,
        website: website || undefined,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : undefined,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update profile' },
      { status: 500 }
    );
  }
}
