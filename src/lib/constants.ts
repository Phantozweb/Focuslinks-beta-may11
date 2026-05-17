/**
 * Site-wide constants.
 *
 * Use `SITE_URL` instead of `window.location.origin` everywhere a public URL
 * is constructed (share links, copied URLs, etc.) so that production links
 * always resolve to focuslinks.in even when the app is served from localhost
 * during development / preview.
 */

export const SITE_URL = 'https://focuslinks.in';

/**
 * Sanitize a URL that may contain localhost or broken values.
 * Returns the URL with localhost/127.0.0.1 replaced by the production domain,
 * or an empty string if the URL is clearly invalid.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'none') return '';
  // Replace localhost or 127.0.0.1 with production domain
  return trimmed
    .replace(/https?:\/\/localhost(:\d+)?/g, SITE_URL)
    .replace(/https?:\/\/127\.0\.0\.1(:\d+)?/g, SITE_URL);
}
