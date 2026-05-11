---
Task ID: 4
Agent: auth-gate-modal-dev
Task: Create sign-up/sign-in popup modal for non-logged-in users who try to use gated features (Connect, LinkedIn, Email)

Work Log:

### 1. Created AuthGateModal component
- New file: `/home/z/my-project/src/focuslinks/components/AuthGateModal.tsx`
- Reusable modal component with framer-motion animations (fade + scale entrance/exit)
- Props: `isOpen`, `onClose`, `actionType: 'connect' | 'linkedin' | 'email' | 'general'`
- Dynamic content based on action type:
  - connect: "Join FocusLinks to Connect" — "Sign in to connect with optometry professionals, send messages, and grow your network."
  - linkedin: "Join to View LinkedIn Profiles" — "Sign in to view LinkedIn profiles and expand your professional network."
  - email: "Join to Send Messages" — "Sign in to send messages to professionals on FocusLinks."
  - general: "Join FocusLinks" — "Sign in to access all features, connect with professionals, and grow your optometry network."
- Gradient header (teal-to-emerald) with FocusLinks eye logo SVG and action-specific icon badge
- Two CTA buttons:
  - "Sign In" → /login (gradient teal-to-emerald)
  - "Create Account" → /register (outlined)
- "Maybe later" dismiss link at bottom
- Body scroll lock when modal is open
- Mobile-friendly (full-width with padding)
- ARIA attributes for accessibility

### 2. Updated ProfileDetail.tsx
- Imported AuthGateModal and AuthGateAction type
- Added state: `authGateModal` with `{ open: boolean; action: AuthGateAction }`
- Replaced ALL `toast.error('Please log in to...')` calls with `setAuthGateModal({ open: true, action: '...' })`:
  - `handleGatedConnect` → opens modal with action 'connect'
  - `handleGatedEmail` → opens modal with action 'email'
  - `handleGatedLinkedIn` → opens modal with action 'linkedin'
  - Inline Connect button onClick → uses handleGatedConnect
  - Inline LinkedIn button onClick → uses handleGatedLinkedIn
- Added `<AuthGateModal>` component in JSX before closing div
- Fixed missing `}` in ternary closing (parsing error)

### 3. Updated Directory.tsx
- Imported AuthGateModal and AuthGateAction type
- Added `onAuthGate` prop to ConnectButton component
- Added `onAuthGate` prop to QuickViewPanel component
- Added `onAuthGate` prop to ProfileCardGrid component
- Added `onAuthGate` prop to ProfileCardList component
- Added state at Directory level: `authGateModal` and `openAuthGate` callback
- Replaced `toast.error('Please log in to connect with professionals')` in ConnectButton with `onAuthGate()` call
- Replaced `toast.error('Please log in to connect with professionals')` in QuickViewPanel with `onAuthGate()` call
- Passed `onAuthGate={openAuthGate}` through all component hierarchy
- Added `<AuthGateModal>` component in Directory JSX

### 4. Updated ProfessionalsDirectory.tsx
- Same pattern as Directory.tsx:
- Imported AuthGateModal and AuthGateAction type
- Added `onAuthGate` prop to ConnectButton, QuickViewPanel, ProfileCardGrid, ProfileCardList
- Added state and `openAuthGate` callback at ProfessionalsDirectory level
- Replaced all `toast.error('Please log in to connect with professionals')` with `onAuthGate()` calls
- Passed `onAuthGate={openAuthGate}` through all components
- Added `<AuthGateModal>` component in JSX

### 5. Lint Check
- Fixed missing `}` in ProfileDetail.tsx ternary (was `)` instead of `)}`)
- Final lint: 0 errors, 0 warnings

Stage Summary:
- AuthGateModal component created with beautiful teal-emerald gradient design and smooth framer-motion animations
- All 3 pages (ProfileDetail, Directory, ProfessionalsDirectory) now show the modal instead of toast messages
- Lock icons on buttons preserved (good UX) but clicking them opens the modal
- Modal dynamically changes title, description, and icon based on the gated action
- Both Sign In and Create Account CTAs link to appropriate pages
- Mobile-friendly and accessible design
