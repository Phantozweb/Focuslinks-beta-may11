import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const GITHUB_PAT = process.env.GITHUB_PAT;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

/**
 * Helper: Get file SHA from GitHub API
 */
async function getFileSha(path: string): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GITHUB_PAT}`,
    'User-Agent': 'FocusLinks-App'
  };
  const res = await fetch(url, { headers });
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.sha;
}

/**
 * Helper: Write file to GitHub using PAT
 */
async function writeGitHubFile(path: string, content: string, message: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'Authorization': `token ${GITHUB_PAT}`,
    'User-Agent': 'FocusLinks-App'
  };

  const sha = await getFileSha(path);
  const encodedContent = Buffer.from(content).toString('base64');

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ message, content: encodedContent, sha })
  });

  return res.ok;
}

/**
 * Helper: Delete file from GitHub using PAT
 */
async function deleteGitHubFile(path: string, message: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'Authorization': `token ${GITHUB_PAT}`,
    'User-Agent': 'FocusLinks-App'
  };

  const sha = await getFileSha(path);
  if (!sha) return false;

  const res = await fetch(url, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ message, sha })
  });

  return res.ok;
}

/**
 * Helper: Fetch raw file from GitHub (public, no PAT)
 */
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

/**
 * Helper: List directory from GitHub API
 */
async function listDirectory(path: string): Promise<any[]> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'FocusLinks-App'
  };
  const res = await fetch(url, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ─── Article Type ───
export interface Article {
  id: string;
  slug: string;
  authorId: string;
  authorName: string;
  title: string;
  excerpt: string;
  content: string; // Markdown content
  category: string;
  tags: string[];
  coverImage?: string; // base64 data URI
  images: string[]; // base64 data URIs
  likes: string[]; // membership IDs
  comments: ArticleComment[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

/**
 * GET /api/articles?action=list|get|list-published
 * - list: All articles (admin)
 * - get: Single article by id or slug
 * - list-published: Only published articles (public)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list-published';
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (action === 'get') {
      // Fetch single article
      if (id) {
        const article = await fetchRawJson<Article>(`Articles/${id}.json`);
        if (!article) {
          return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }
        return NextResponse.json({ article });
      }

      if (slug) {
        // Search by slug across all files
        const files = await listDirectory('Articles');
        for (const file of files) {
          if (file.name.endsWith('.json')) {
            const article = await fetchRawJson<Article>(`Articles/${file.name}`);
            if (article && article.slug === slug) {
              return NextResponse.json({ article });
            }
          }
        }
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      return NextResponse.json({ error: 'id or slug required' }, { status: 400 });
    }

    // List articles
    const files = await listDirectory('Articles');
    const articles: Article[] = [];

    for (const file of files) {
      if (file.name.endsWith('.json')) {
        const article = await fetchRawJson<Article>(`Articles/${file.name}`);
        if (article && article.id) {
          articles.push(article);
        }
      }
    }

    // Filter
    let filtered = articles;

    if (action === 'list-published') {
      filtered = filtered.filter(a => a.status === 'published');
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(a => a.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Increment view count for published articles list
    if (action === 'list-published' && !search && !category) {
      // Lazy increment (don't block the response)
      filtered.slice(0, 5).forEach(article => {
        writeGitHubFile(
          `Articles/${article.id}.json`,
          JSON.stringify({ ...article, views: (article.views || 0) + 1 }, null, 2),
          `Increment view for article ${article.id}`
        ).catch(() => {});
      });
    }

    // Paginate
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      articles: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error in GET /api/articles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/articles?action=create|like|comment|increment-view
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { article } = body as { article: Article };
      if (!article || !article.id || !article.title) {
        return NextResponse.json({ error: 'Article data required' }, { status: 400 });
      }

      const articleWithMeta = {
        ...article,
        createdAt: article.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: article.likes || [],
        comments: article.comments || [],
        images: article.images || [],
        tags: article.tags || [],
        status: article.status || 'draft',
      };

      const success = await writeGitHubFile(
        `Articles/${articleWithMeta.id}.json`,
        JSON.stringify(articleWithMeta, null, 2),
        `Create article: ${articleWithMeta.title}`
      );

      if (!success) {
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
      }

      return NextResponse.json({ success: true, article: articleWithMeta });
    }

    if (action === 'like') {
      const { articleId, membershipId } = body;
      if (!articleId || !membershipId) {
        return NextResponse.json({ error: 'articleId and membershipId required' }, { status: 400 });
      }

      const article = await fetchRawJson<Article>(`Articles/${articleId}.json`);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      const liked = article.likes.includes(membershipId);
      const newLikes = liked
        ? article.likes.filter(id => id !== membershipId)
        : [...article.likes, membershipId];

      const updated = { ...article, likes: newLikes, updatedAt: new Date().toISOString() };
      const success = await writeGitHubFile(
        `Articles/${articleId}.json`,
        JSON.stringify(updated, null, 2),
        `${liked ? 'Unlike' : 'Like'} article ${articleId}`
      );

      if (!success) {
        return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
      }

      return NextResponse.json({ success: true, liked: !liked, likesCount: newLikes.length });
    }

    if (action === 'comment') {
      const { articleId, comment } = body as {
        articleId: string;
        comment: ArticleComment;
      };
      if (!articleId || !comment || !comment.authorId || !comment.content) {
        return NextResponse.json({ error: 'Valid comment data required' }, { status: 400 });
      }

      const article = await fetchRawJson<Article>(`Articles/${articleId}.json`);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      const newComment: ArticleComment = {
        id: comment.id || Date.now().toString(),
        authorId: comment.authorId,
        authorName: comment.authorName || 'Unknown',
        content: comment.content,
        timestamp: comment.timestamp || new Date().toISOString(),
      };

      const updated = {
        ...article,
        comments: [...(article.comments || []), newComment],
        updatedAt: new Date().toISOString()
      };

      const success = await writeGitHubFile(
        `Articles/${articleId}.json`,
        JSON.stringify(updated, null, 2),
        `Comment on article ${articleId}`
      );

      if (!success) {
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
      }

      return NextResponse.json({ success: true, comment: newComment, commentsCount: updated.comments.length });
    }

    if (action === 'increment-view') {
      const { articleId } = body;
      if (!articleId) {
        return NextResponse.json({ error: 'articleId required' }, { status: 400 });
      }

      const article = await fetchRawJson<Article>(`Articles/${articleId}.json`);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      const updated = { ...article, views: (article.views || 0) + 1 };
      // Fire and forget
      writeGitHubFile(
        `Articles/${articleId}.json`,
        JSON.stringify(updated, null, 2),
        `View article ${articleId}`
      ).catch(() => {});

      return NextResponse.json({ success: true, views: updated.views });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/articles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/articles — Update an article
 */
export async function PATCH(request: NextRequest) {
  try {
    const { articleId, updates } = await request.json();

    if (!articleId || !updates) {
      return NextResponse.json({ error: 'articleId and updates required' }, { status: 400 });
    }

    const article = await fetchRawJson<Article>(`Articles/${articleId}.json`);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const updated = { ...article, ...updates, updatedAt: new Date().toISOString() };
    const success = await writeGitHubFile(
      `Articles/${articleId}.json`,
      JSON.stringify(updated, null, 2),
      `Update article ${articleId}`
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }

    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    console.error('Error in PATCH /api/articles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/articles — Delete an article (archive it first)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('id');

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    }

    // Archive the article first
    const article = await fetchRawJson<Article>(`Articles/${articleId}.json`);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const archivedArticle = { ...article, status: 'archived', archivedAt: new Date().toISOString() };

    // Add to archive
    const archive = await fetchRawJson<any[]>('Archive/articles.json') || [];
    archive.push(archivedArticle);
    await writeGitHubFile(
      'Archive/articles.json',
      JSON.stringify(archive, null, 2),
      `Archive article ${articleId}`
    );

    // Delete from Articles
    const success = await deleteGitHubFile(
      `Articles/${articleId}.json`,
      `Delete (archive) article ${articleId}`
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/articles:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
