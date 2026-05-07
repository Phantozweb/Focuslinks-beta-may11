import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/posts - List all posts with author info, pagination, and filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const authorId = searchParams.get('authorId') || '';

    const where = authorId ? { authorId } : {};

    const [posts, total] = await Promise.all([
      db.userPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              membershipId: true,
              avatar: true,
              title: true,
              location: true,
            },
          },
        },
      }),
      db.userPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorId, content, imageUrls } = body;

    if (!authorId || !content?.trim()) {
      return NextResponse.json(
        { error: 'authorId and content are required' },
        { status: 400 }
      );
    }

    // Verify the author profile exists
    const author = await db.userProfile.findUnique({
      where: { membershipId: authorId },
    });

    if (!author) {
      return NextResponse.json(
        { error: 'Author profile not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    const post = await db.userPost.create({
      data: {
        authorId,
        content: content.trim(),
        imageUrls: imageUrls ? JSON.stringify(imageUrls) : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            membershipId: true,
            avatar: true,
            title: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
