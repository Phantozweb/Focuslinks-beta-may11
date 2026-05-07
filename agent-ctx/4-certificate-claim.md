# Task 4: Add Certificate Claiming Feature for Beyond OrthoK Webinar

## Summary
Added certificate claiming feature for the ended Beyond OrthoK webinar. The webinar event date (May 6, 2026) has passed, so `isEventEnded` is always true, rendering the page in "ended" mode.

## Changes Made
- **File:** `src/focuslinks/pages/Webinar.tsx`
- Added `GraduationCap` import
- Added certificate form state (certName, certEmail, certMembershipId, certSubmitted, certSubmitting, certFlVerified, certFlVerifying, certFlMemberInfo)
- Pre-filled cert form from localStorage user data
- Added `handleVerifyCertMembership` callback + debounced effect
- Added `handleCertificateClaim` handler (POST to `/api/submit-form` with type `certificate-claim`)
- Updated hero CTA: "Claim Your Certificate" button → scrolls to `#certificate-claim`, with descriptive subtitle
- Added certificate claim section (between About and What You'll Learn sections)
- Added "Recording Coming Soon" banner with Video icon
- Success state shows checkmark + "Certificate Claimed!" message

## Lint: PASS (no errors)
