# Task ID: 3 — Heatmap Density Improver

## Task
Improve the density heatmap layer in the MiniOptoMap component for better accuracy and visibility.

## Work Log

### Changes to `/src/focuslinks/components/MiniOptoMap.tsx`

**DensityHeatmapLayer improvements (Pass 1-3: base teal density):**

1. **Canvas resolution**: 2000×1200 → **3000×1800** for sharper global detail
2. **Grid size**: 18 → **10** for finer granularity (catches small clusters)
3. **Blur radius**: 3 → **5** for smoother density spread
4. **Gaussian falloff**: Changed `val * falloff * falloff` → `val * falloff` for gentler decay (no longer squaring, which was too steep)
5. **Intensity threshold**: 0.02 → **0.01** to show more low-density areas
6. **Radius range**: `Math.min(45 + intensity * 65, 130)` → `Math.min(35 + intensity * 100, 160)` for better spread
7. **Hot spot threshold**: `intensity > 0.5` → `intensity > 0.3` (hot spots appear earlier)
8. **Hot spot alpha**: Increased from `0.15 + hot * 0.2` to `0.2 + hot * 0.3` at center; overall higher alpha values across all color stops
9. **Moderate "pulse" zone** (NEW): `intensity > 0.12 && intensity <= 0.3` — cyan-teal pulse color transition between warm and hot zones
10. **Warm spot minimum alpha**: Raised from `0.3 + intensity * 0.5` to `0.15 + intensity * 0.55` (center), `0.06 + intensity * 0.12` → `0.08 + intensity * 0.35` (mid)
11. **Canvas overlay opacity**: 0.92 → **0.95**

**Student amber sparkles improvements (Pass 4):**
- Threshold: 0.15 → **0.10**
- Radius range: `Math.min(30 + intensity * 40, 80)` → `Math.min(35 + intensity * 55, 100)`
- Alpha values increased: center `0.15 + intensity * 0.2` → `0.2 + intensity * 0.3`
- Added extra color stop for smoother gradient falloff

**Clinic emerald pass (NEW — Pass 5):**
- Filters points where `p.type === 'clinic' || p.source === 'clinic'`
- Same density grid + blur approach as student pass
- Threshold: 0.10
- Radius: 30–90
- Colors: emerald-500 (rgb 16,185,129) → emerald-900 gradient
- Uses `screen` composite operation for additive blending

**UI updates:**
- Updated density legend: now shows 3 color-coded categories (Pro/teal, Stu/amber, Cli/emerald)
- Added clinic avatar badge (CL) in bottom CTA alongside professional (OP) and student (ST) avatars
- Changed professional avatar gradient from `teal-400 → emerald-500` to `teal-400 → teal-600` to visually distinguish from clinic emerald

### Lint Check
- No lint errors introduced (4 pre-existing errors in AuthGateModal.tsx are unrelated)
- Dev server compiles successfully

## Stage Summary
- Heatmap is now RICH and DENSE with 5 rendering passes (base density, blurred density, amber students, emerald clinics, overlay)
- India hotspot (majority of 841 points) should be clearly visible as a bright white-teal center
- Other countries (Nigeria, Kenya, US) should show as visible but softer teal/cyan glows
- Three distinct color channels: teal (professionals), amber (students), emerald (clinics)
- Finer grid + wider blur + gentler falloff = more accurate density representation
