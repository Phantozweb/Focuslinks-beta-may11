# Task 1: Fix MiniOptoMap z-index overlapping with navigation bars

**Agent:** minioptomap-zindex-fixer
**Date:** 2026-03-10

## Problem
The MiniOptoMap component used `z-[400]` on three overlay elements (stats badge, CTA bar, density legend), which was higher than the Navbar (`z-40`) and BottomNav (`z-[80]`), causing map overlays to sit on top of navigation bars.

Additionally, the Leaflet map creates elements with high z-index values that could leak outside the map container and overlap nav elements. On mobile, the map also captured scroll events, preventing users from scrolling past it.

## Changes Made

### File: `/src/focuslinks/components/MiniOptoMap.tsx`

1. **Reduced z-index on all three overlay elements** (`z-[400]` → `z-[10]`):
   - Line 347: Stats badge (top-left) — changed from `z-[400]` to `z-[10]`
   - Line 362: CTA bar (bottom) — changed from `z-[400]` to `z-[10]`
   - Line 392: Density legend (top-right) — changed from `z-[400]` to `z-[10]`
   - Rationale: Overlays only need to be above the Leaflet map tiles (z-0 to z-5), NOT above page navigation

2. **Added `isolate` class to outer wrapper div** (line 324):
   - Creates a new CSS stacking context, ensuring all internal z-indexes (including those created by Leaflet) stay within the map container
   - This prevents Leaflet's internal high z-index elements from leaking out and overlapping navigation bars

3. **Added `touchAction: 'pan-x pan-y'` style to outer wrapper div** (line 324):
   - Allows the browser to handle horizontal and vertical panning for scrolling past the map on mobile
   - Prevents the Leaflet map from capturing vertical scroll events, which would trap users on the map
   - Map interaction (drag, pinch-zoom) still works because Leaflet handles touch events directly

## Verification
- `bun run lint` passes with 0 errors, 0 warnings
- Dev server compiles successfully
- The component is loaded via dynamic import with `ssr: false` in Home.tsx — changes are compatible

## Z-Index Stack After Fix
- Navbar: `z-40` (sticky top)
- BottomNav: `z-[80]` (fixed bottom)
- MiniOptoMap wrapper: `isolate` (new stacking context, contains all children)
  - Leaflet tiles: z-0 to z-5 (internal)
  - Overlay elements: `z-[10]` (within isolated context only)
