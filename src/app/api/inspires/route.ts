import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;
const GITHUB_PAT = process.env.GITHUB_PAT;

// In-memory cache
let cachedPosts: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

interface InspireComment {
  id: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  sources?: string[];
}

interface InspirePost {
  id: string;
  userId: string;
  authorName: string;
  authorImage?: string;
  authorType: 'professional' | 'student' | 'clinic';
  content: string;
  type: 'question' | 'insight' | 'case_study' | 'achievement' | 'discussion' | 'general';
  tags?: string[];
  likes: number;
  likedBy: string[];
  comments: InspireComment[];
  createdAt: string;
  parentId?: string;
}

// GET /api/inspires — List all inspire posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const sort = searchParams.get('sort') || 'latest';
    const userId = searchParams.get('userId') || '';

    // Fetch from GitHub
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Inspires`;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'FocusLinks-App'
    };
    if (GITHUB_PAT) headers['Authorization'] = `token ${GITHUB_PAT}`;

    const dirResponse = await fetch(apiUrl, { headers, cache: 'no-store' });

    if (!dirResponse.ok) {
      if (dirResponse.status === 404) {
        return NextResponse.json({ posts: [], total: 0 });
      }
      throw new Error(`GitHub API error: ${dirResponse.status}`);
    }

    const dirData = await dirResponse.json();
    const allPosts: InspirePost[] = [];

    if (Array.isArray(dirData)) {
      // Fetch each post file
      const jsonFiles = dirData.filter((f: any) => f.name && f.name.endsWith('.json'));

      // Fetch in parallel batches of 10
      for (let i = 0; i < jsonFiles.length; i += 10) {
        const batch = jsonFiles.slice(i, i + 10);
        const results = await Promise.allSettled(
          batch.map(async (file: any) => {
            const rawUrl = `${RAW_BASE_URL}/Inspires/${file.name}?t=${Date.now()}`;
            const res = await fetch(rawUrl, { cache: 'no-store' });
            if (!res.ok) return null;
            const text = await res.text();
            const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
            return JSON.parse(sanitized) as InspirePost;
          })
        );
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value && result.value.id) {
            allPosts.push(result.value);
          }
        }
      }
    }

    // Filter: only top-level posts (not replies)
    let filtered = allPosts.filter(p => !p.parentId);

    // Filter by type
    if (type !== 'all') {
      filtered = filtered.filter(p => p.type === type);
    }

    // Filter by user
    if (userId) {
      filtered = filtered.filter(p => p.userId === userId);
    }

    // Sort
    if (sort === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      posts: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error fetching inspires:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspire posts' },
      { status: 500 }
    );
  }
}

// POST /api/inspires — Create a new inspire post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, authorName, authorImage, authorType, content, type, tags, parentId } = body;

    if (!userId || !content?.trim()) {
      return NextResponse.json(
        { error: 'userId and content are required' },
        { status: 400 }
      );
    }

    const postId = Date.now().toString() + Math.random().toString(36).substring(2, 7);

    const newPost: InspirePost = {
      id: postId,
      userId,
      authorName: authorName || 'Anonymous',
      authorImage: authorImage || undefined,
      authorType: authorType || 'professional',
      content: content.trim().slice(0, 2000),
      type: type || 'general',
      tags: tags?.slice(0, 5) || [],
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      parentId: parentId || undefined,
    };

    // Save to GitHub
    const filePath = `Inspires/${postId}.json`;
    const contentStr = JSON.stringify(newPost, null, 2);
    const encodedContent = Buffer.from(contentStr).toString('base64');

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FocusLinks-App'
    };
    if (GITHUB_PAT) headers['Authorization'] = `token ${GITHUB_PAT}`;

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    const putResponse = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Create inspire post by ${userId}`,
        content: encodedContent,
      })
    });

    if (!putResponse.ok) {
      const errorData = await putResponse.json();
      throw new Error(errorData.message || 'Failed to create post');
    }

    // Invalidate cache
    cachedPosts = null;

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating inspire post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    );
  }
}
