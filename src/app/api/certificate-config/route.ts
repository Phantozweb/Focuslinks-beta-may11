import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const CONFIG_PATH = 'Certificate/certificate-config.json';
const GITHUB_RAW_TEMPLATE_URL = 'https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Certificate/certificate-template.png';

export async function GET() {
  try {
    const GITHUB_PAT = process.env.GITHUB_PAT;
    if (!GITHUB_PAT) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 503 });
    }

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONFIG_PATH}`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'FocusLinks-App',
      },
    });

    if (res.status === 404) {
      return NextResponse.json({
        success: true,
        config: {
          namePosition: { x: 50, y: 50 },
          fontSize: 36,
          fontFamily: 'Georgia, serif',
          fontColor: '#1e293b',
          textAlign: 'center',
          templateImage: GITHUB_RAW_TEMPLATE_URL,
        },
      });
    }

    if (!res.ok) {
      return NextResponse.json({ success: false, error: `GitHub API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const config = JSON.parse(content);

    return NextResponse.json({
      success: true,
      config,
      sha: data.sha,
    });
  } catch (error) {
    console.error('[certificate-config GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const GITHUB_PAT = process.env.GITHUB_PAT;
    if (!GITHUB_PAT) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 503 });
    }

    const body = await request.json();
    const { config, sha } = body;

    if (!config) {
      return NextResponse.json({ success: false, error: 'Config is required' }, { status: 400 });
    }

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONFIG_PATH}`;
    const content = Buffer.from(JSON.stringify(config, null, 2)).toString('base64');

    const requestBody: Record<string, unknown> = {
      message: 'Update certificate configuration',
      content,
    };

    if (sha) {
      requestBody.sha = sha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'FocusLinks-App',
      },
      body: JSON.stringify(requestBody),
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      console.error('[certificate-config POST] GitHub error:', errData);
      return NextResponse.json(
        { success: false, error: `GitHub API error: ${putRes.status}` },
        { status: 502 }
      );
    }

    const result = await putRes.json();
    return NextResponse.json({
      success: true,
      sha: result.content?.sha || result.commit?.sha,
    });
  } catch (error) {
    console.error('[certificate-config POST] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save config' }, { status: 500 });
  }
}
