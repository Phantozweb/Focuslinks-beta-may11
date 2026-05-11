# Task 2-c: Certificate Flow Checker

## Summary
Cross-checked the entire certificate claim flow in Webinar.tsx end-to-end.

## Findings

### All Passing ✅
1. **Event ended state**: `isEventEnded` logic is correct, hero badge and certificate section appear correctly
2. **Two-step flow**: Step 1 (feedback) → Step 2 (certificate claim) → Success, properly gated
3. **State management**: `certFeedback`, `certRating`, `certFeedbackSubmitted` all correct; `certName/email/membershipId` preserved between steps
4. **handleCertFeedbackSubmit**: Validates rating+text, submits with `source: 'certificate-claim-flow'`, sets `certFeedbackSubmitted = true`
5. **handleCertificateClaim guard**: Checks `certFeedbackSubmitted` first, shows error toast if missing
6. **Sidebar feedback form**: Uses separate `feedback`/`feedbackSubmitted` state — independent from cert flow
7. **Claim FL Credits form**: Uses separate `claimId`/`claimSubmitted` state and `isClaimOpen` condition — independent

### Fixed
- **Step 2 missing Name field**: Added Name input (pre-filled from Step 1) to Step 2's 3-col grid
- **Step 2 missing FL verification info**: Added `certFlVerified === true && certFlMemberInfo` display to Step 2
- **Helper text**: Updated from "email or Membership ID" to "name, email, or Membership ID"

## Lint
- 0 errors, 0 warnings
