'use client';
/**
 * Service for interacting with GitHub API to manage profile data.
 */

const GITHUB_OWNER = 'Phantozweb';
const GITHUB_REPO = 'Fldatas';
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main`;

/**
 * Fetches the raw content of a file from GitHub directly (for public files).
 */
export const fetchGitHubRawText = async (path: string): Promise<string | null> => {
  try {
    const response = await fetch(`${RAW_BASE_URL}/${path}?t=${Date.now()}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`File not found: ${path}. Returning null.`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
};

/**
 * Fetches the raw content of a JSON file from GitHub directly (for public files).
 */
export const fetchGitHubJson = async <T>(path: string): Promise<T | null> => {
  try {
    const text = await fetchGitHubRawText(path);
    
    // Handle empty or whitespace-only responses
    if (!text || !text.trim()) {
      return null;
    }
    
    try {
      // Sanitize: remove control characters
      const sanitizedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      return JSON.parse(sanitizedText);
    } catch (parseError) {
      // If it's not valid JSON, log it and return null instead of throwing
      console.error(`Error parsing JSON from ${path}:`, parseError);
      return null;
    }
  } catch (error) {
    // Only log actual network or fetch errors here
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
};

/**
 * Updates a file on GitHub using the server-side API proxy (requires PAT).
 */
export const updateGitHubFile = async (path: string, content: any, message: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/github/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        content,
        message
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update file');
    }

    return true;
  } catch (error) {
    console.error(`Error updating ${path}:`, error);
    return false;
  }
};

/**
 * Deletes a file on GitHub using the server-side API proxy (requires PAT).
 */
export const deleteGitHubFile = async (path: string, message: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/github/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        message
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete file');
    }

    return true;
  } catch (error) {
    console.error(`Error deleting ${path}:`, error);
    return false;
  }
};
