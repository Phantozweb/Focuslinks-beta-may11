# Task 2: Fix GettingStartedModal - Bugs & Interaction Issues

## Work Record

**Date:** 2025-03-04
**Agent:** Main Agent
**Files Modified:**
- `/home/z/my-project/src/focuslinks/components/GettingStartedModal.tsx`
- `/home/z/my-project/src/app/globals.css`

## Summary of Bugs Fixed

### 1. Auto-open on first visit
- **Bug:** `isOpen` started as `false` with no effect to auto-open, so new users never saw the modal automatically.
- **Fix:** Added a `useEffect` that checks if the user is a first-time visitor (not logged in, not permanently dismissed) and auto-opens the modal after a 2-second delay. Introduced `hasAutoOpened` state to track whether the auto-open has occurred.

### 2. FAB ping animation too aggressive
- **Bug:** Used `animate-ping` which creates a constant, distracting rapid ring expansion.
- **Fix:** Created a new CSS animation `fab-breathe-ring` in `globals.css` with a much slower, subtler expanding ring effect (2.8s duration, gentler scale from 1 to 1.35 with smooth fade). Applied via `animate-fab-ring` class.

### 3. FAB appearing on first load when modal should auto-open
- **Bug:** The FAB would appear alongside the page before the modal auto-opened, causing a jumpy appearance.
- **Fix:** The FAB now only appears after `hasAutoOpened` is true AND the modal is closed. This means on first visit, the FAB doesn't show at all — the modal auto-opens instead, and the FAB only appears after the user dismisses it.

### 4. Confusing dismiss logic
- **Bug:** Clicking X or backdrop would call `dismiss(dontShowAgain)` which could permanently dismiss if the checkbox was checked, but the behavior was unclear and inconsistent.
- **Fix:** Separated dismiss logic into three clear paths:
  - **"Get Started" button** → Always permanently dismisses (sets `fl_guide_dismissed=true`)
  - **X or backdrop click** → Temporarily dismisses (FAB appears), unless "Don't show again" is checked, in which case it permanently dismisses
  - **Step card click** → Permanently dismisses and navigates to the clicked step's page

### 5. Step cards not clickable
- **Bug:** Step cards were plain `motion.div` elements with no click handler.
- **Fix:** Changed StepCard from `motion.div` to `motion.button`, added `onClick` prop, added an arrow indicator that appears on hover, and made each step navigate to its corresponding route:
  - "Create Your Profile" → `/membership`
  - "Explore the Directory" → `/directory`
  - "Join the Community" → `/community`
  - "Discover Clinical Tools" → `/labs`

### 6. Janky animations
- **Bug:** Used basic `duration` transitions and spring params that could feel stiff/jerky.
- **Fix:** Switched all animation transitions to use spring physics with tuned parameters:
  - Modal: `stiffness: 280, damping: 26, mass: 0.8` (smooth open/close)
  - Step cards: `stiffness: 200, damping: 22` (natural staggered entrance)
  - Header: `stiffness: 200, damping: 22` (gentle fade-in)
  - FAB: `stiffness: 220, damping: 20` (bouncy entrance)
  - Backdrop: `duration: 0.25, ease: 'easeOut'` (clean fade)

## New CSS Added to globals.css

```css
/* FAB breathing ring - subtle expanding ring for GettingStarted FAB */
@keyframes fab-breathe-ring {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
.animate-fab-ring {
  animation: fab-breathe-ring 2.8s ease-in-out infinite;
}
```

## State Management Changes

| State | Before | After |
|-------|--------|-------|
| `isDismissed` | Single boolean for permanent dismiss | Split into `isPermanentlyDismissed` for clarity |
| `hasAutoOpened` | N/A | New state tracking if auto-open occurred (controls FAB visibility) |
| `dismiss()` | Single function with `permanent` param | Split into `dismissPermanently()`, `dismissTemporarily()`, `handleDismiss()` |
| StepCard | No `onClick` prop | Now accepts `onClick` callback for navigation |
