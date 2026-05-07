/**
 * Admin utility for FocusLinks
 * Controls who can see and access the Admin panel
 * Admin access requires scanning a secure QR code (cryptographic token)
 * Only the physical QR code holder can authenticate — no passwords or IDs
 */

// The QR code contains a 128-char cryptographic token.
// This is the ONLY way to gain admin access.
const ADMIN_TOKEN = 'ae127f13de64f4d7a8d88b7594667c83a034447c23678595095ff2861dea0c79b478b56faa17760dfcbf8fa26fc4e296aace10f930281d8591d82dbc117a0523';

// Session storage key for admin session
const ADMIN_SESSION_KEY = 'fl_admin_session';

/**
 * Validate scanned QR token and create an admin session
 * Returns true if the token matches the stored admin token
 */
export function adminLoginWithToken(scannedToken: string): boolean {
  // Constant-time comparison to prevent timing attacks
  if (!scannedToken || scannedToken.length !== ADMIN_TOKEN.length) return false;

  let match = true;
  for (let i = 0; i < ADMIN_TOKEN.length; i++) {
    if (scannedToken.charCodeAt(i) !== ADMIN_TOKEN.charCodeAt(i)) {
      match = false;
    }
  }

  if (match) {
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        authenticated: true,
        loggedInAt: new Date().toISOString(),
        method: 'qr-scan',
      }));
    } catch { /* ignore */ }
    return true;
  }
  return false;
}

/**
 * Check if admin is currently logged in (has active session)
 */
export function isAdminLoggedIn(): boolean {
  try {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return false;
    const parsed = JSON.parse(session);
    // Check session is not older than 24 hours
    const loggedInAt = new Date(parsed.loggedInAt).getTime();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (now - loggedInAt > maxAge) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return !!parsed.authenticated;
  } catch {
    return false;
  }
}

/**
 * Logout admin session
 */
export function adminLogout(): void {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch { /* ignore */ }
}

