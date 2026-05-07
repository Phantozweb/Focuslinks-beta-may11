import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';

export async function POST(request: NextRequest) {
  try {
    const { path, content, message } = await request.json();
    const GITHUB_PAT = process.env.GITHUB_PAT;

    if (!path || !content) return NextResponse.json({ error: 'Path and content are required' }, { status: 400 });

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FocusLinks-App'
    };
    if (GITHUB_PAT) {
      headers['Authorization'] = `token ${GITHUB_PAT}`;
    }

    // Get current SHA if file exists
    let sha: string | undefined;
    const getResponse = await fetch(url, { headers });

    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const encodedContent = Buffer.from(contentStr).toString('base64');

    const putResponse = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: message || `Update ${path}`,
        content: encodedContent,
        sha: sha
      })
    });

    if (!putResponse.ok) {
      const errorData = await putResponse.json();
      throw new Error(errorData.message || 'Failed to update GitHub file');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/github/update:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
