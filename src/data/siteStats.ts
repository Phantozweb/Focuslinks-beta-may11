/**
 * Static site statistics — hardcoded from GitHub data snapshot.
 *
 * Last updated: 2026-03-05
 * Source: Phantozweb/Fldatas repository
 *
 * WHY HARDCODED?
 * - The /api/opto-map endpoint fetches 600+ files from GitHub every time,
 *   causing 5-6s load times and 401 errors when PAT is missing.
 * - Stats change slowly (new members join weekly, not hourly).
 * - Update these numbers periodically by running:
 *     curl -s "https://api.github.com/repos/Phantozweb/Fldatas/contents/Profile/Users" \
 *       -H "Authorization: token $GITHUB_PAT" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"
 *     curl -s "https://raw.githubusercontent.com/Phantozweb/Fldatas/main/ClinicListings/india_clinics.json" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"
 */

export const SITE_STATS = {
  /** Total registered FocusLinks members (unique FL IDs in Profile/Users/) */
  totalMembers: 643,

  /** Total listed clinics (from ClinicListings/india_clinics.json) */
  totalClinics: 223,

  /** Unique countries represented by members + clinics (geocoded) */
  totalCountries: 15,

  /** Breakdown by member type (from list_profiles.json curated entries) */
  professionalCount: 15,
  studentCount: 9,
  academicCount: 1,
  industryCount: 1,
  collegeCount: 1,

  /** Map data points (geocoded successfully) */
  geocodedProfiles: 155,
  geocodedUsers: 463,
  clinicsOnMap: 223,

  /** Last verified date */
  lastUpdated: '2026-03-05',
} as const;

/**
 * Total active members shown on the landing page.
 * Uses the static count instead of fetching from /api/opto-map.
 */
export const DISPLAY_MEMBER_COUNT = SITE_STATS.totalMembers;
export const DISPLAY_CLINIC_COUNT = SITE_STATS.totalClinics;
export const DISPLAY_COUNTRY_COUNT = SITE_STATS.totalCountries;
