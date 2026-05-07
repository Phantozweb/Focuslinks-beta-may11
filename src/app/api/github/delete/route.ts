import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';

export async function POST(request: NextRequest) {
  try {
    const { path, message } = await request.json();
    const GITHUB_PAT = process.env.GITHUB_PAT;

    if (!path) return NextResponse.json({ error: 'Path is required' }, { status: 400 });

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FocusLinks-App'
    };
    if (GITHUB_PAT) {
      headers['Authorization'] = `token ${GITHUB_PAT}`;
    }

    // Get SHA
    const getResponse = await fetch(url, { headers });

    if (!getResponse.ok) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileData = await getResponse.json();
    const sha = fileData.sha;

    // Delete
    const deleteResponse = await fetch(url, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        message: message || `Delete ${path}`,
        sha: sha
      })
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      throw new Error(errorData.message || 'Failed to delete GitHub file');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/github/delete:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
