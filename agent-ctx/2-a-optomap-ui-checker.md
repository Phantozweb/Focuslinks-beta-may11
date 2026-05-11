# Task 2-a: Cross-check OptoMap UI and Working

## Agent: optomap-ui-checker

## Summary
Reviewed the OptoMap page, API endpoint, and MapContainer component. Found and fixed 2 critical bugs that were causing the map to show only 155 out of 841 available data points.

## Bugs Fixed

### Bug 1: Empty GITHUB_PAT causes 401 errors (CRITICAL)
- **File**: `/src/app/api/opto-map/route.ts`
- **Problem**: `ghHeaders()` always sent `Authorization: token ` (empty string) to GitHub API, causing 401 even for public repos
- **Fix**: Only include Authorization header when `process.env.GITHUB_PAT` is non-empty; read PAT at runtime instead of module import time
- **Impact**: Map data increased from 155 → 841 points (155 profiles + 463 users + 223 clinics)

### Bug 2: `imageUrl` vs `image` field name mismatch (HIGH)
- **File**: `/src/app/api/opto-map/route.ts`
- **Problem**: API returned `imageUrl` for clinics but MapContainer component reads `profile.image`
- **Fix**: Changed `ClinicPoint.imageUrl` → `image`, removed `imageUrl` from `MapPoint`, updated clinic data mapping
- **Impact**: 41 clinic images now display correctly

## Robustness Improvements
1. Fallback for user directory listing: constructs user filenames from profile membershipIds
2. Fallback for clinic data: tries multiple known file paths via rawJson when directory listing fails

## Files Modified
- `/src/app/api/opto-map/route.ts` — Fixed auth headers, image field, added fallbacks

## Verification
- API returns: 155 profiles, 463 users, 223 clinics, 15 countries
- Lint: 0 errors, 0 warnings
- Dev server: No 401 errors after fix
