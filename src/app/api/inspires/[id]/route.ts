import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;
const GITHUB_PAT = process.env.GITHUB_PAT;

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

async function fetchPost(id: string): Promise<InspirePost | null> {
  // Try to find the post file by listing the directory
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Inspires`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'FocusLinks-App'
  };
  if (GITHUB_PAT) headers['Authorization'] = `token ${GITHUB_PAT}`;

  const dirResponse = await fetch(apiUrl, { headers, cache: 'no-store' });
  if (!dirResponse.ok) return null;

  const dirData = await dirResponse.json();
  if (!Array.isArray(dirData)) return null;

  // Find the file that starts with the post id
  const targetFile = dirData.find((f: any) => f.name && f.name.startsWith(id) && f.name.endsWith('.json'));
  if (!targetFile) return null;

  const rawUrl = `${RAW_BASE_URL}/Inspires/${targetFile.name}?t=${Date.now()}`;
  const rawResponse = await fetch(rawUrl, { cache: 'no-store' });
  if (!rawResponse.ok) return null;

  const text = await rawResponse.text();
  const sanitized = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  return JSON.parse(sanitized) as InspirePost;
}

async function findPostFilename(id: string): Promise<string | null> {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/Inspires`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'FocusLinks-App'
  };
  if (GITHUB_PAT) headers['Authorization'] = `token ${GITHUB_PAT}`;

  const dirResponse = await fetch(apiUrl, { headers, cache: 'no-store' });
  if (!dirResponse.ok) return null;

  const dirData = await dirResponse.json();
  if (!Array.isArray(dirData)) return null;

  const targetFile = dirData.find((f: any) => f.name && f.name.startsWith(id) && f.name.endsWith('.json'));
  return targetFile ? targetFile.name : null;
}

async function savePost(post: InspirePost): Promise<boolean> {
  const filename = await findPostFilename(post.id);
  if (!filename) return false;

  const filePath = `Inspires/${filename}`;
  const contentStr = JSON.stringify(post, null, 2);
  const encodedContent = Buffer.from(contentStr).toString('base64');

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'FocusLinks-App'
  };
  if (GITHUB_PAT) headers['Authorization'] = `token ${GITHUB_PAT}`;

  // Get current SHA
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const getResponse = await fetch(url, { headers });
  if (!getResponse.ok) return false;
  const fileData = await getResponse.json();

  const putResponse = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Update inspire post ${post.id}`,
      content: encodedContent,
      sha: fileData.sha,
    })
  });

  return putResponse.ok;
}

// PUT /api/inspires/[id] — Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, type, tags } = body;

    const post = await fetchPost(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (content !== undefined) post.content = content.trim().slice(0, 2000);
    if (type) post.type = type;
    if (tags) post.tags = tags.slice(0, 5);

    const success = await savePost(post);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating inspire post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/inspires/[id] — Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filename = await findPostFilename(id);
    if (!filename) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const filePath = `Inspires/${filename}`;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FocusLinks-App'
    };
    if (GITHUB_PAT) headers['Authorization'] = `token ${GITHUB_PAT}`;

    // Get SHA
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    const getResponse = await fetch(url, { headers });
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    const fileData = await getResponse.json();

    const deleteResponse = await fetch(url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        message: `Delete inspire post ${id}`,
        sha: fileData.sha,
      })
    });

    if (!deleteResponse.ok) {
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inspire post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

// POST /api/inspires/[id] — Like or comment on a post (body.action: 'like' | 'comment')
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, userId, authorName, authorImage, content, sources } = body;

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'action and userId are required' },
        { status: 400 }
      );
    }

    const post = await fetchPost(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (action === 'like') {
      // Toggle like
      const hasLiked = post.likedBy.includes(userId);
      if (hasLiked) {
        post.likedBy = post.likedBy.filter(uid => uid !== userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy.push(userId);
        post.likes += 1;
      }

      const success = await savePost(post);
      if (!success) {
        return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
      }

      return NextResponse.json({
        liked: !hasLiked,
        likes: post.likes,
        likedBy: post.likedBy
      });
    }

    if (action === 'comment') {
      if (!content?.trim() || !authorName) {
        return NextResponse.json(
          { error: 'authorName and content are required for comments' },
          { status: 400 }
        );
      }

      const newComment: InspireComment = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        userId,
        authorName,
        authorImage: authorImage || undefined,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        sources: Array.isArray(sources) ? sources.slice(0, 3).filter((s: string) => typeof s === 'string' && s.trim().length > 0) : undefined,
      };

      post.comments.push(newComment);

      const success = await savePost(post);
      if (!success) {
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
      }

      return NextResponse.json({ comment: newComment, totalComments: post.comments.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in inspire action:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
