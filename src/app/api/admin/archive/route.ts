import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const GITHUB_PAT = process.env.GITHUB_PAT;
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

/**
 * Helper: Get file SHA from GitHub API (uses PAT)
 */
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

/**
 * Helper: Write file to GitHub using PAT
 */
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

/**
 * Helper: Fetch raw JSON (public, no PAT)
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

type ArchiveType = 'users' | 'posts' | 'articles';

/**
 * GET /api/admin/archive?action=list&type=users|posts|articles
 * List archived items of a specific type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ArchiveType;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    if (!type || !['users', 'posts', 'articles'].includes(type)) {
      return NextResponse.json({ error: 'Valid type required (users, posts, articles)' }, { status: 400 });
    }

    const archivePath = `Archive/${type}.json`;
    const archive = await fetchRawJson<any[]>(archivePath) || [];

    // Search filter
    let filtered = archive;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(item => {
        const searchable = [
          item.name, item.title, item.fullName, item.authorName,
          item.email, item.membershipId, item.content
        ].filter(Boolean).join(' ').toLowerCase();
        return searchable.includes(q);
      });
    }

    // Sort by archived date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.archivedAt || a.deletedAt || '';
      const dateB = b.archivedAt || b.deletedAt || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Paginate
    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
      items: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/archive:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/archive?action=restore
 * Restore an archived item by removing it from the archive and re-creating the original file
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, type, index, item } = body;

    if (action === 'restore') {
      const archiveType = type as ArchiveType;
      if (!archiveType || !item) {
        return NextResponse.json({ error: 'type and item required' }, { status: 400 });
      }

      const archivePath = `Archive/${archiveType}.json`;
      const archive = await fetchRawJson<any[]>(archivePath) || [];

      // Remove from archive
      const updatedArchive = archive.filter((_, i) => i !== index);

      // Re-create the original file
      const restoredItem = { ...item };
      delete restoredItem.archivedAt;
      delete restoredItem.deletedAt;
      delete restoredItem.status;
      restoredItem.restoredAt = new Date().toISOString();

      let originalPath = '';
      let commitMessage = '';

      if (archiveType === 'users' && item.membershipId) {
        originalPath = `Profile/Users/${item.membershipId}_userdata.json`;
        commitMessage = `Restore user profile: ${item.name || item.membershipId}`;
      } else if (archiveType === 'posts' && item.id && item.authorId) {
        originalPath = `Posts/${item.id}_${item.authorId}.json`;
        commitMessage = `Restore post: ${item.id}`;
      } else if (archiveType === 'articles' && item.id) {
        originalPath = `Articles/${item.id}.json`;
        commitMessage = `Restore article: ${item.title || item.id}`;
      }

      // Restore the original file
      if (originalPath) {
        await writeGitHubFile(
          originalPath,
          JSON.stringify(restoredItem, null, 2),
          commitMessage
        );
      }

      // Update archive (remove restored item)
      await writeGitHubFile(
        archivePath,
        JSON.stringify(updatedArchive, null, 2),
        `Remove restored item from ${archiveType} archive`
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/admin/archive:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/archive?type=users|posts|articles&index=0
 * Permanently delete an item from the archive
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ArchiveType;
    const index = parseInt(searchParams.get('index') || '0');

    if (!type || !['users', 'posts', 'articles'].includes(type)) {
      return NextResponse.json({ error: 'Valid type required' }, { status: 400 });
    }

    const archivePath = `Archive/${type}.json`;
    const archive = await fetchRawJson<any[]>(archivePath) || [];

    if (index < 0 || index >= archive.length) {
      return NextResponse.json({ error: 'Invalid index' }, { status: 400 });
    }

    // Remove the item
    const updatedArchive = archive.filter((_, i) => i !== index);

    const success = await writeGitHubFile(
      archivePath,
      JSON.stringify(updatedArchive, null, 2),
      `Permanently delete item from ${type} archive`
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete from archive' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/archive:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
