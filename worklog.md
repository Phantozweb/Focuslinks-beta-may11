---
Task ID: 1
Agent: main
Task: Make feedback mandatory for getting certificate — popup approach

Work Log:
- Analyzed existing certificate claim flow in Webinar.tsx (two-step: feedback then certificate, with Step 2 locked)
- Redesigned flow: certificate form is now always accessible, feedback popup appears only when user clicks "Claim Certificate" without having submitted feedback
- Added state variables: showFeedbackPopup, popupFeedback, popupSubmitting
- Updated handleCertificateClaim: shows popup if feedback not submitted, otherwise proceeds directly
- Added submitCertificateClaim: actual claim logic (separated from popup trigger)
- Added handlePopupFeedbackSubmit: submits feedback from popup, then auto-proceeds to claim certificate
- Removed the two-step locked UI (Step 1 feedback + Step 2 locked certificate form)
- Made certificate form always visible with name, email, membership ID, check eligibility, claim button
- Added feedback notice below claim button: amber "Feedback is required" / emerald "Feedback submitted"
- Added feedback popup modal with AnimatePresence, backdrop, textarea, "Submit & Claim Certificate" button
- Added /api/check-feedback route.ts — server-side check if user already submitted feedback by email/membershipId
- Added server-side enforcement in /api/submit-form — certificate-claim type requires feedbackSubmitted=true
- Added check on page load: if user is logged in, automatically checks if they already submitted feedback for this webinar
- Added X icon to lucide-react imports
- Updated header description text

Stage Summary:
- Feedback is now mandatory for certificate claiming via popup approach
- Server-side enforcement prevents bypassing the feedback requirement
- Feedback status persists across page refreshes (checks server on load)
- Certificate form is always accessible — no lock/dimming
- All lint checks pass, server running on port 3000
