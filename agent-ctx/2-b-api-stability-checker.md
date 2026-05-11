# Task 2-b: Cross-check API Stability

## Agent: api-stability-checker

## Summary
Conducted a thorough audit of all 4 API endpoints in the FocusLinks app, found 20+ issues across error handling, input validation, path traversal, caching, and type safety. Applied fixes to all 4 route files.

---

## Detailed Findings & Fixes

### 1. `/api/verify-certificate/route.ts`

| # | Issue | Severity | Fix Applied |
|---|-------|----------|-------------|
| 1 | **No JSON parse error handling**: `request.json()` throws cryptic error on invalid body | Medium | Added try/catch around `request.json()` with 400 response |
| 2 | **Slug not type-checked**: Only checked `!slug` (falsy), not `typeof slug !== 'string'` | Medium | Added `typeof slug !== 'string'` check |
| 3 | **No type validation for email/membershipId/name**: Numbers, objects etc. would cause runtime errors | Medium | Added `typeof` checks for each optional field |
| 4 | **Path traversal vulnerability**: `slug` from user input directly interpolated into GitHub API paths (`Webinar/${slug}/...`) | Critical | Added `sanitizePathSegment()` that strips `/`, `\\`, `..`, and control chars |
| 5 | **Cache stores empty results from failed fetches**: If `fetchUsersFromDirectory` returns `[]` due to API errors (403, 429, network), that empty result gets cached for 5 min | High | Changed `fetchUsersFromDirectory` to return `null` on failure vs `[]` on genuine 404. `getWebinarAttendees` only caches when both fetches succeed (non-null) |
| 6 | **No network error handling in fetchUsersFromDirectory**: `fetch()` calls can throw on network errors | High | Wrapped all `fetch` calls in try/catch, return `null` on network failure |
| 7 | **Directory listing parse error unhandled**: `listRes.json()` could throw | Medium | Wrapped in try/catch, return `null` |

### 2. `/api/verify-membership/route.ts`

| # | Issue | Severity | Fix Applied |
|---|-------|----------|-------------|
| 1 | **Case-insensitive comparison missing**: `findMember` used `trim()` but not `toUpperCase()`, while `/api/auth/login` normalizes to uppercase. A lookup for "fl2zxs6c" would fail here but succeed on login | High | Added `.toUpperCase()` normalization in `findMember()` to match login API |
| 2 | **Empty/whitespace membershipId passes validation**: `"   "` is truthy so passes `!membershipId` check | Medium | Added `membershipId.trim().length === 0` check |
| 3 | **No length limit on membershipId**: Very long strings could cause issues | Low | Added `membershipId.length > 50` check |
| 4 | **Internal error details leaked to client**: When raw URL fails and GITHUB_PAT is missing, error says "raw URL failed and GITHUB_PAT is not configured" | Medium | Changed all internal errors to generic "Service temporarily unavailable" messages |
| 5 | **No network error handling**: `fetch()` calls can throw on network errors | High | Wrapped all `fetch` calls in try/catch with appropriate fallback responses |
| 6 | **No JSON parse error handling on request body** | Medium | Added try/catch around `request.json()` |
| 7 | **Parse errors from GitHub responses not caught**: `JSON.parse(sanitizedText)` could throw | Medium | Wrapped in try/catch, falls through to next strategy |
| 8 | **Rate limit errors not differentiated**: 403/429 treated same as other errors | Medium | Added specific message for rate limiting (429/403) |

### 3. `/api/auth/login/route.ts`

| # | Issue | Severity | Fix Applied |
|---|-------|----------|-------------|
| 1 | **Empty/whitespace membershipId passes validation**: Same as verify-membership | Medium | Added `membershipId.trim().length === 0` check |
| 2 | **No length limit on membershipId**: Same as verify-membership | Low | Added `membershipId.length > 50` check |
| 3 | **Path traversal in fetchUserData**: `membershipId` directly used in `Profile/Users/${membershipId}_userdata.json` | Critical | Added `sanitizePathSegment()` in `fetchUserData()` |
| 4 | **Internal error details leaked to client**: Same as verify-membership | Medium | Changed to generic error messages |
| 5 | **No network error handling in fetchUserData**: `fetch()` can throw | High | Wrapped `fetch` calls in try/catch |
| 6 | **No JSON parse error handling on request body** | Medium | Added try/catch around `request.json()` |
| 7 | **Parse errors from GitHub responses not caught** | Medium | Wrapped in try/catch with fallback |

### 4. `/api/submit-form/route.ts` (Most Critical)

| # | Issue | Severity | Fix Applied |
|---|-------|----------|-------------|
| 1 | **No GITHUB_PAT validation before use**: If PAT is missing, the code sends `Authorization: token undefined` which gives confusing 401 error | Critical | Added early check for `GITHUB_PAT`, returns 503 with user-friendly message |
| 2 | **No input validation for `type`**: Missing or wrong type falls through to empty path with confusing error | Critical | Added type validation with explicit allowlist (`VALID_FORM_TYPES`), returns 400 with list of valid types |
| 3 | **Path traversal vulnerability in `slug`**: `body.slug` directly interpolated into `Webinar/${body.slug}/...` | Critical | Added `sanitizePathSegment()` for all path segments (slug, membershipId) |
| 4 | **Path traversal vulnerability in `membershipId`**: `body.membershipId` directly used in file paths | Critical | Sanitized all membershipId usage in path construction |
| 5 | **No validation for required fields per type**: Webinar types need `slug`, membership types need `membershipId` | High | Added `SLUG_REQUIRED_TYPES` and `MEMBERSHIP_ID_REQUIRED_TYPES` with validation |
| 6 | **`putResponse.json()` can throw**: If GitHub returns non-JSON body | High | Wrapped in try/catch, uses status-based fallback message |
| 7 | **GitHub API errors not mapped to user-friendly messages**: 401/403/409/422 all show raw GitHub error | High | Added mapping: 401/403→503, 409→conflict message, 422→invalid data message |
| 8 | **No JSON parse error handling on request body** | Medium | Added try/catch around `request.json()` |
| 9 | **Missing User-Agent header on list_profiles.json requests** | Low | Added `User-Agent: FocusLinks-App` to all GitHub API requests |
| 10 | **list_profiles.json sync failure is silently swallowed**: Only logged, no data consistency warning | Medium | Added explicit `DATA CONSISTENCY WARNING` log + check of `syncRes.ok` |
| 11 | **`any` type usage**: `listData: any[]` | Low | Changed to `Record<string, unknown>[]` |
| 12 | **No length validation on slug/membershipId** | Low | Added `slug.length > 200` and `membershipId.length > 50` checks |

---

## Additional Observations (Not Fixed — Out of Scope)

1. **No rate limiting**: All 4 endpoints have no rate limiting. A determined attacker could brute-force membership IDs or flood submissions. Consider adding rate limiting middleware.
2. **No authentication on submit-form**: Anyone can submit any form type without being logged in. Consider adding auth checks for sensitive operations.
3. **Race condition on list_profiles.json**: Two simultaneous membership applications could conflict on the SHA. The current code swallows this error. Consider a retry mechanism or queue.
4. **Body spread vulnerability in submit-form**: `...body` spreads ALL request body fields (including potentially malicious ones) into the stored JSON. Consider whitelisting known fields per form type.
5. **GITHUB_PAT missing from .env**: The `.env` file does not contain `GITHUB_PAT`. This means all GitHub API calls that require authentication will fail. Previous agents reported adding it, but it's not present. This is a deployment issue, not a code issue — the code now handles this gracefully.

## Lint Status
✅ Passes cleanly with 0 errors and 0 warnings.
