import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const GITHUB_PAT = process.env.GITHUB_PAT;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

async function getFileSha(path: string): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${GITHUB_PAT}`,
      'User-Agent': 'FocusLinks-App'
    }
  });
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.sha;
}

async function writeGitHubFile(path: string, content: string, message: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const sha = await getFileSha(path);
  const encodedContent = Buffer.from(content).toString('base64');
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Authorization': `token ${GITHUB_PAT}`,
      'User-Agent': 'FocusLinks-App'
    },
    body: JSON.stringify({ message, content: encodedContent, sha })
  });
  return res.ok;
}

async function deleteGitHubFile(path: string, message: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const sha = await getFileSha(path);
  if (!sha) return false;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Authorization': `token ${GITHUB_PAT}`,
      'User-Agent': 'FocusLinks-App'
    },
    body: JSON.stringify({ message, sha })
  });
  return res.ok;
}

async function fetchRawJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${RAW_BASE}/${path}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    return JSON.parse(sanitized);
  } catch {
    return null;
  }
}

async function listDirectory(path: string): Promise<any[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'FocusLinks-App'
    }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  hashtags: string[];
  timestamp: string;
  likes: string[];
  comments: any[];
  images?: string[];
  poll?: any[];
}

/**
 * GET /api/admin/posts?action=list
 * List all posts with optional search and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const files = await listDirectory('Posts');
    const posts: Post[] = [];

    for (const file of files) {
      if (file.name.endsWith('.json')) {
        const post = await fetchRawJson<Post>(`Posts/${file.name}`);
        if (post && post.id) {
          posts.push(post);
        }
      }
    }

    // Search filter
    let filtered = posts;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.content.toLowerCase().includes(q) ||
        p.authorId.toLowerCase().includes(q) ||
        (p.hashtags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      posts: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/posts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts?id=xxx&authorId=xxx
 * Delete (archive) a post
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const authorId = searchParams.get('authorId');

    if (!id || !authorId) {
      return NextResponse.json({ error: 'id and authorId required' }, { status: 400 });
    }

    // Archive first
    const post = await fetchRawJson<Post>(`Posts/${id}_${authorId}.json`);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const archivedPost = { ...post, archivedAt: new Date().toISOString() };
    const archive = await fetchRawJson<any[]>('Archive/posts.json') || [];
    archive.push(archivedPost);
    await writeGitHubFile(
      'Archive/posts.json',
      JSON.stringify(archive, null, 2),
      `Archive post ${id}`
    );

    // Delete from Posts
    const success = await deleteGitHubFile(
      `Posts/${id}_${authorId}.json`,
      `Delete (archive) post ${id}`
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/posts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/posts — Update a post content
 */
export async function PATCH(request: NextRequest) {
  try {
    const { postId, authorId, updates } = await request.json();

    if (!postId || !authorId || !updates) {
      return NextResponse.json({ error: 'postId, authorId, and updates required' }, { status: 400 });
    }

    const post = await fetchRawJson<Post>(`Posts/${postId}_${authorId}.json`);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updated = { ...post, ...updates };
    const success = await writeGitHubFile(
      `Posts/${postId}_${authorId}.json`,
      JSON.stringify(updated, null, 2),
      `Admin update post ${postId}`
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error('Error in PATCH /api/admin/posts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
