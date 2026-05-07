---
Task ID: 1
Agent: Main
Task: Remove paid plans from Membership page, fix URL hash routing, add certificate verification

Work Log:
- Removed 3-tier pricing (Starter/Professional/Enterprise) from Membership page, replaced with single free plan
- Converted hash routing (/#/) to clean History API routing (/) in NavigationContext
- Updated next.config.ts with SPA rewrite rules
- Fixed all files referencing window.location.hash
- Created /api/verify-certificate endpoint that checks Booked users + Joined users directories
- Updated Webinar.tsx certificate claim flow to verify eligibility before allowing claim
- Added "Check Eligibility" button and visual eligibility status in certificate form
- Updated submit-form API to handle certificate-claim type properly
- Certificate claims now verified against: email, membership ID, or name matching booked/joined records

Stage Summary:
- Membership page now shows single free plan with all features
- URLs are clean (/ instead of /#/)
- Certificate claiming requires verification - checks Booked users and Joined users from GitHub data
- Backend API at /api/verify-certificate fetches all user records from GitHub and matches by email/membershipId/name
- Frontend shows clear eligibility status before allowing certificate claim
