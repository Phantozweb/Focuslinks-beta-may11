---
Task ID: 1
Agent: Main Agent
Task: Fix and verify webinar certificate forms - ensure GITHUB_PAT is configured, API works correctly, and all forms function properly

Work Log:
- Added GITHUB_PAT to .env file
- Rewrote /src/app/api/verify-certificate/route.ts with improvements:
  - Added PAT-based fallback for raw content fetching
  - Added isNameNotMembershipId() helper to detect when a user's name was stored as membershipId
  - Fixed name matching - no longer requires !attendeeEmail && !attendeeMembershipId condition
  - Added per-slug cache invalidation
  - Improved matching logic: email > membershipId (real only) > name
- Fixed bug in handleCertificateClaim: changed `slug` (from useParams) to `WEBINAR_SLUG` constant
- Fixed same bug in all other form handlers: prebook, ask, feedback, claim
- Made certificate form more flexible:
  - Name field is full-width (required)
  - Email is optional (no longer required)
  - Membership ID is optional
  - At least one of name/email/membershipId needed for verification
- Tested API endpoints successfully (all pass)
- Lint passes cleanly

Stage Summary:
- GITHUB_PAT is configured and working for both read and write operations
- Certificate verification API properly matches users by email, membershipId, or name
- Edge case handled: users who had their name stored as membershipId
- All form handlers now consistently use WEBINAR_SLUG constant
- Certificate form accepts email, membershipId, or name for verification
