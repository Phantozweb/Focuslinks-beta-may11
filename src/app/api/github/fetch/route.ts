import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

/**
 * GET /api/github/fetch?path=xxx
 * Fetches file/directory content from GitHub using PUBLIC raw URL (no PAT needed).
 * This saves PAT rate limit usage — only write operations should use PAT.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) return NextResponse.json({ error: 'Path is required' }, { status: 400 });

    // ── Strategy 1: Use raw.githubusercontent.com for single files (no auth needed) ──
    // Check if path looks like a file (has extension)
    const isLikelyFile = path.includes('.');
    
    if (isLikelyFile) {
      const rawUrl = `${RAW_BASE_URL}/${path}?t=${Date.now()}`;
      const rawResponse = await fetch(rawUrl, { cache: 'no-store' });
      
      if (rawResponse.ok) {
        const contentType = rawResponse.headers.get('content-type') || '';
        const text = await rawResponse.text();
        
        // Try to parse as JSON
        if (contentType.includes('json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
          try {
            // Sanitize control characters before parsing
            const sanitizedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
            const json = JSON.parse(sanitizedText);
            return NextResponse.json(json);
          } catch {
            // Not valid JSON, return as text
            return new NextResponse(text, {
              headers: { 'Content-Type': 'text/plain' }
            });
          }
        }
        
        // Return as plain text for non-JSON files
        return new NextResponse(text, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      if (rawResponse.status === 404) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    }

    // ── Strategy 2: Use GitHub API for directory listing (also public, no auth) ──
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'FocusLinks-App'
    };

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Path not found' }, { status: 404 });
      }
      // If rate limited on public API, fall back to PAT
      if (response.status === 403) {
        const GITHUB_PAT = process.env.GITHUB_PAT;
        if (GITHUB_PAT) {
          headers['Authorization'] = `token ${GITHUB_PAT}`;
          const retryResponse = await fetch(apiUrl, { headers });
          if (!retryResponse.ok) {
            throw new Error(`GitHub API error: ${retryResponse.status}`);
          }
          const data = await retryResponse.json();
          return NextResponse.json(data);
        }
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/github/fetch:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
