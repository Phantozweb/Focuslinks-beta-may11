import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const GITHUB_PAT = process.env.GITHUB_PAT;

/**
 * POST /api/admin/edit-user
 * Edit a user's raw JSON and save it back to GitHub
 * Body: { membershipId: string, data: object }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { membershipId, data } = body;

    if (!membershipId || !data) {
      return NextResponse.json({ error: 'membershipId and data are required' }, { status: 400 });
    }

    // Validate data is valid JSON (it should already be parsed from the body, but validate structure)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return NextResponse.json({ error: 'data must be a valid JSON object' }, { status: 400 });
    }

    const filePath = `Profile/Users/${membershipId}_userdata.json`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

    // Step 1: Get current file SHA
    const getRes = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_PAT}`,
        'User-Agent': 'FocusLinks-App',
      },
    });

    if (!getRes.ok) {
      const errorData = await getRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: `File not found on GitHub: ${errorData?.message || getRes.statusText}` },
        { status: 404 }
      );
    }

    const fileData = await getRes.json();
    const sha = fileData.sha;

    // Step 2: Update the file via PUT
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const commitMessage = `Admin edit user data: ${membershipId}`;

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Authorization': `token ${GITHUB_PAT}`,
        'User-Agent': 'FocusLinks-App',
      },
      body: JSON.stringify({
        message: commitMessage,
        content,
        sha,
      }),
    });

    if (!putRes.ok) {
      const errorData = await putRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Failed to update file on GitHub: ${errorData?.message || putRes.statusText}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error in POST /api/admin/edit-user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
