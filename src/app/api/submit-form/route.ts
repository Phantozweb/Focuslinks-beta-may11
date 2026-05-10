import { NextRequest, NextResponse } from 'next/server';

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const GITHUB_PAT = process.env.GITHUB_PAT;

    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const mmm = String(d.getMilliseconds()).padStart(3, '0');
    const entryId = `${dd}${mm}${yy}${hh}${min}${ss}${mmm}`;

    let GITHUB_FILE_PATH = '';

    if (['prebook', 'ask', 'feedback', 'claim', 'certificate-claim', 'join'].includes(body.type)) {
      let typeFolder = body.type.toLowerCase();
      let filename = `${entryId}.json`;
      
      if (body.type === 'prebook') {
        typeFolder = 'Booked users';
        const membershipIdStr = body.membershipId ? `_${body.membershipId}` : '';
        filename = `${entryId}${membershipIdStr}.json`;
      }
      
      if (body.type === 'join') {
        typeFolder = 'Joined users';
        const membershipIdStr = body.membershipId ? `_${body.membershipId}` : '';
        filename = `${entryId}${membershipIdStr}.json`;
      }

      if (body.type === 'certificate-claim') {
        // Server-side enforcement: verify feedback was submitted before allowing certificate claim
        if (!body.feedbackSubmitted) {
          return NextResponse.json(
            { success: false, error: 'Feedback is required before claiming a certificate. Please submit your feedback first.' },
            { status: 400 }
          );
        }
        typeFolder = 'claim';
        const membershipIdStr = body.membershipId ? `_${body.membershipId}` : '';
        filename = `${entryId}${membershipIdStr}.json`;
      }
      
      GITHUB_FILE_PATH = `Webinar/${body.slug}/${typeFolder}/${filename}`;
    } else if (body.type === 'membership_application') {
      const membershipId = body.membershipId;
      GITHUB_FILE_PATH = `Profile/Users/${membershipId}_userdata.json`;
    } else if (body.type === 'profile_submission') {
      const membershipId = body.membershipId;
      GITHUB_FILE_PATH = `submitted profiles/${entryId}_${membershipId}.json`;
    } else if (body.type === 'feed_post') {
      const membershipId = body.membershipId;
      GITHUB_FILE_PATH = `Posts/${entryId}_${membershipId}.json`;
    } else if (body.type === 'odcam_feedback') {
      GITHUB_FILE_PATH = `Labs/OdCam/feedback/${entryId}.json`;
    } else if (body.type === 'optoscholar_waitlist') {
      GITHUB_FILE_PATH = `Labs/OptoScholar/waitlist/${entryId}.json`;
    } else if (body.type === 'optoscholar_access') {
      GITHUB_FILE_PATH = `Labs/OptoScholar/access/${entryId}.json`;
    } else if (body.type === 'team_application') {
      const membershipId = body.membershipId ? `_${body.membershipId}` : '';
      GITHUB_FILE_PATH = `TeamApplications/${entryId}${membershipId}.json`;
    } else if (body.type === 'rapd_simulator_feedback') {
      GITHUB_FILE_PATH = `Labs/RAPDSimulator/feedback/${entryId}.json`;
    }

    if (!GITHUB_FILE_PATH) {
      return NextResponse.json({ success: false, error: 'Missing GitHub file path configuration' }, { status: 400 });
    }

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
    
    const newEntry = {
      entryId,
      ...body,
      timestamp: new Date().toISOString()
    };

    const updatedContent = Buffer.from(JSON.stringify(newEntry, null, 2)).toString('base64');

    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'FocusLinks-App'
      },
      body: JSON.stringify({
        message: `Add new ${body.type} submission: ${entryId}`,
        content: updatedContent
      })
    });

    if (!putResponse.ok) {
      const errorData = await putResponse.json();
      console.error('GitHub API Error:', errorData);
      throw new Error(`Failed to create file on GitHub: ${errorData.message}`);
    }

    // Sync list_profiles.json for membership applications
    if (body.type === 'membership_application') {
      try {
        const listUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/list_profiles.json`;
        const listRes = await fetch(listUrl, {
          headers: {
            'Authorization': `token ${GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        let listData: any[] = [];
        let listSha: string | undefined = undefined;

        if (listRes.ok) {
          const listFile = await listRes.json();
          const listContent = Buffer.from(listFile.content, 'base64').toString('utf-8');
          listData = JSON.parse(listContent);
          listSha = listFile.sha;
        }

        const newMember = {
          ...newEntry,
          name: newEntry.fullName || newEntry.name,
          title: newEntry.profession,
          location: `${newEntry.cityState}, ${newEntry.region}, ${newEntry.country}`,
          verified: true,
          status: 'accepted'
        };
        
        listData.push(newMember);
        const updatedListContent = Buffer.from(JSON.stringify(listData, null, 2)).toString('base64');
        
        await fetch(listUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_PAT}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Sync list_profiles.json for new member ${newEntry.membershipId}`,
            content: updatedListContent,
            sha: listSha
          })
        });
      } catch (syncError) {
        console.error('Failed to sync list_profiles.json:', syncError);
      }
    }

    return NextResponse.json({ success: true, entryId });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
