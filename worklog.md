---
Task ID: 2
Agent: main
Task: Replace Optomap heatmaps with pinpoint markers + zoom-based clustering

Work Log:
- Explored entire MapContainer.tsx (1128 lines) and MiniOptoMap.tsx (423 lines)
- Installed react-leaflet-cluster@4.1.3 for proper zoom-based marker clustering
- Rewrote MapContainer.tsx: removed HeatmapLayer (custom canvas), removed manual country cluster circles, removed spreadOverlappingMarkers and isRawCoordinate functions
- Added MarkerClusterGroup from react-leaflet-cluster wrapping all individual markers
- Created createClusterIcon function: dynamic sizing by count (40-70px), colored by dominant type (teal/amber/emerald)
- Added ClusterStyles component for CSS injection to hide default leaflet backgrounds
- Kept all existing features: marker icons (optometrist/student/clinic SVG), DetailPanel, MobileBottomSheet, ProfilePopup, MapLegend, filtering, search
- Updated MiniOptoMap.tsx: removed DensityHeatmapLayer, added small 8px colored circle markers + MarkerClusterGroup with mini cluster icons
- Replaced "Density" legend with "Pins" legend on mini map
- All lint checks pass, server running on port 3000

Stage Summary:
- Heatmaps completely removed from both main OptoMap and MiniOptoMap
- Pinpoint markers now used everywhere with proper clustering
- As users zoom out, pins merge into cluster bubbles showing total count
- As users zoom in, clusters break apart into individual pins
- Members without specific area/state/district naturally cluster together at country level
- Members with details show as individual pinpoint markers
- Click cluster to zoom in and expand; spiderfy at max zoom

---
Task ID: 5
Agent: main
Task: Fix certificate image loading — upload to GitHub, use raw URL, build certificate generation

Work Log:
- Checked uploaded certificate template: "Head of Contact Lens and Myopia Department Visual Eyez India.png" (1.2MB, 1536x1024 RGB)
- Uploaded certificate template image to GitHub at path `Certificate/certificate-template.png` using GitHub Contents API
- Raw URL: https://raw.githubusercontent.com/Phantozweb/Fldatas/main/Certificate/certificate-template.png
- Copied the image to /public/certificate-template.png as fallback
- Updated CertificateEditor.tsx: changed template URL from local `/certificate-template.png` to GitHub raw URL, added fallback on error, updated dimensions to 1536x1024, added `unoptimized` prop
- Updated certificate-config/route.ts: default templateImage now uses GitHub raw URL
- Updated GitHub stored config (certificate-config.json) to use the new GitHub raw URL
- Created `/src/lib/certificateGenerator.ts` — full certificate generation utility:
  - Fetches config from `/api/certificate-config`
  - Loads template image from GitHub raw URL (with fallback to local)
  - Creates HTML5 Canvas, draws template as background
  - Overlays user's name at configured position with proper scaling
  - Returns PNG data URL
  - Includes `downloadCertificate()` and `generateCertificateBlob()` helpers
- Updated Webinar.tsx certificate claim flow:
  - Added `certImageUrl` and `certGenerating` state
  - After successful claim, auto-generates certificate image via `generateCertificate()`
  - Success view now shows: certificate image preview, Download button, View Full Size button
  - If generation fails, shows retry button
  - If generation takes time, shows loading spinner
- Added `Download` and `Eye` icons to Webinar imports
- All lint checks pass, server running without errors on port 3000

Stage Summary:
- Certificate template image uploaded to GitHub and accessible via raw URL
- Certificate Editor uses GitHub raw URL with local fallback
- Full certificate generation pipeline: template background + name overlay via Canvas API
- Users can view, download, and open their certificate in full size after claiming
- Config on GitHub updated with new template URL

---
Task ID: 6
Agent: main
Task: Remove certificate editor page, fix certificate PNG download functionality

Work Log:
- Removed CertificateEditor lazy import from src/app/page.tsx
- Removed `/certificate` route from route map in page.tsx
- Removed `certificate: 'Certificate Editor'` from Breadcrumbs.tsx ROUTE_LABELS
- Improved certificateGenerator.ts:
  - Added in-memory config caching (avoid refetch on every generation)
  - Added `downloadExistingCertificate()` — reuses already-generated data URL instead of regenerating
  - Added `downloadDataUrl()` — clean download helper with proper cleanup
  - Made font bold (`bold ${fontSize}px`) for better visibility on certificate
  - Set PNG quality to 1.0 for maximum quality
  - Cleaned up redundant text alignment code
- Updated Webinar.tsx download button:
  - Changed from `downloadCertificate()` (regenerates) to `downloadExistingCertificate()` (reuses data URL)
  - Import updated to use `downloadExistingCertificate` instead of `downloadCertificate`
- Verified all tests: home 200, config API returns GitHub raw URL, template image 200 (1.2MB), lint clean

Stage Summary:
- Certificate Editor page completely removed (no /certificate route)
- Certificate download is now efficient: generates once, reuses data URL for download
- Bold font for name text, maximum PNG quality
- All lint checks pass, server running on port 3000

---
Task ID: 2 (sub-agent: frontend-styling-expert)
Task: Build custom SVG icon components for FocusLinks hero section menu items

Work Log:
- Analyzed Home.tsx to identify current icon usage: Lucide icons (Users, Rss, PenLine, Beaker, Calendar, FlaskConical, GraduationCap) used in two sections:
  1. Quick Links Row (lines 989-1018): Directory, Feed, Blog, Labs — uses Users, Rss, PenLine, Beaker
  2. Quick Links Floating Bar (lines 1020-1056): Profiles, Blog, Events, Labs, Academy — uses Users, Rss, Calendar, FlaskConical, GraduationCap
- Created `/src/focuslinks/components/CustomIcons.tsx` with 8 custom optometry-themed SVG icon components:
  1. **DirectoryIcon** — Person silhouette + magnifying glass with eye/iris inside (finding people + vision)
  2. **FeedIcon** — Flowing speech-bubble streams with central iris ring (dynamic feed + eye motif)
  3. **BlogIcon** — Quill pen with iris detail at the nib tip (writing + vision creation point)
  4. **LabsIcon** — Lab flask with contact lens/iris pattern at the base (scientific + optometry fusion)
  5. **ProfilesIcon** — ID badge card with person silhouette + eye watermark (professional identity + vision)
  6. **EventsIcon** — Calendar page with iris ring as featured date + small date dots (events + eye marks date)
  7. **AcademyIcon** — Graduation cap with eye/iris as tassel charm (learning + gaining vision)
  8. **CommunityIcon** — Connected people forming triangle around central eye/iris (community + shared vision)
- All icons share consistent design:
  - viewBox="0 0 24 24" for Lucide compatibility
  - stroke="currentColor" + fill="none" for Tailwind color inheritance
  - strokeWidth={2}, strokeLinecap="round", strokeLinejoin="round"
  - Accept `className?: string` prop for sizing and coloring
  - Subtle but recognizable eye/iris motifs throughout the set
- TypeScript compilation verified (tsc --noEmit with JSX/ESModule flags — zero errors)
- Next.js build verified — compiled successfully, no new errors introduced

Stage Summary:
- 8 custom SVG icon components created in CustomIcons.tsx
- Each icon has a unique optometry/eye-themed design while maintaining visual cohesion
- Icons are ready to replace Lucide icons in Home.tsx Quick Links sections
- Drop-in replacement: same API pattern as Lucide (className prop, currentColor stroke)
- Build passes, no regressions

---
Task ID: 1
Agent: main
Task: Build comprehensive multi-step OnboardingWizard component for FocusLinks

Work Log:
- Read worklog.md, existing GettingStartedModal.tsx, NavigationContext.tsx, submit-form API route, and page.tsx to understand project patterns
- Created `/src/focuslinks/components/OnboardingWizard.tsx` — full 6-step onboarding wizard:
  - Step 1: Welcome + Name & Email (with validation, icon inputs)
  - Step 2: Choose Your Status (6 cards: Student, Practicing Optometrist, Researcher, Clinic Owner, Educator, Other — each with unique icon, color, description)
  - Step 3: Your Purpose on FocusLinks (8 toggleable chips: Career, Visibility, Clinical, Education, Research, Management, Mentorship, Community)
  - Step 4: Specialty/Interests (12 toggleable pills: Contact Lenses, Myopia Control, Pediatric Optometry, etc.)
  - Step 5: Profile Details (Country dropdown, City/State, Organization, Membership ID)
  - Step 6: Discover Features (personalized feature recommendations based on selections)
- Features:
  - Slide animations between steps (carousel-style, direction-aware)
  - Progress bar at top showing current step (animated width)
  - Spring animations for cards, chips, and feature items
  - Subtle "Skip for now" button
  - Auto-opens for new users (checks `fl_onboarding_complete` localStorage key)
  - Persists partial data to `fl_onboarding_data` in localStorage on change
  - On completion: sets `fl_onboarding_complete='true'`, sets `fl_user` with name/email/role/location
  - Submits data to `/api/submit-form` with type `onboarding`
  - Navigates to most relevant page based on user selections
  - Full dark mode support
  - Mobile responsive design
  - Glass morphism backdrop with blur
  - Teal/emerald gradient accent colors matching FocusLinks theme
- Updated `/src/app/api/submit-form/route.ts`: added `onboarding` type handler saving to `Onboarding/{entryId}_{emailSlug}.json`
- Updated `/src/app/page.tsx`: added OnboardingWizard import and rendered alongside GettingStartedModal
- Fixed lint error: moved localStorage data restoration from useEffect into useState lazy initializer
- All lint checks pass, dev server running on port 3000

Stage Summary:
- Production-quality 6-step onboarding wizard built with motion/react animations
- Each step focused and quick (~5 min total experience)
- Personalized feature recommendations in final step based on user selections
- Data saved to GitHub via submit-form API on completion
- Auto-opens for new users, with subtle skip option
- Full dark mode, mobile responsive, glass morphism design

---
Task ID: 1
Agent: Main Agent
Task: Fix onboarding page - duplicate navbar, banner image, mobile layout

Work Log:
- Took screenshots of mobile (390x844) and desktop (1440x900) onboarding pages
- Used VLM to analyze issues: confirmed duplicate Navbar showing on /onboarding, banner overflow on mobile, no banner on desktop left panel
- Found root cause of duplicate navbar: `useLocation()` was called in `Page` component OUTSIDE of `NavigationProvider`, so it always returned default `/` instead of `/onboarding`
- Fixed by extracting `AppLayout` inner component that reads NavigationContext inside the Provider
- Generated new desktop-optimized banner image (1152x864 landscape) at `/public/images/onboarding/desktop-banner.png`
- Updated DecorativePanel to include desktop-banner.png as both background overlay and featured illustration at bottom
- Reduced mobile banner height from h-44 to h-28 with scale-110 and object-top for subtle head peek
- Removed all icon.png references (user hated it)
- Enhanced gradient overlay on mobile banner for seamless blending
- Verified fixes with VLM analysis: no duplicate navbar, banner well-blended, desktop has illustration

Stage Summary:
- Critical bug fixed: Navbar was always showing on /onboarding because useLocation() was called outside NavigationProvider
- Desktop left panel now features the cute 2D optometrist illustration
- Mobile shows a subtle head-area peek of the banner, blending cleanly
- icon.png removed from all usages
- Lint passes clean

---
Task ID: 2
Agent: Main Agent
Task: Fix desktop duplicate overlay and mobile invisible banner

Work Log:
- VLM confirmed desktop had character showing twice: once as faded background overlay, once as foreground illustration
- Removed the background overlay img (opacity-20 mix-blend-luminosity) from DecorativePanel, kept only the featured illustration at bottom
- VLM confirmed mobile banner was completely invisible — the heavy gradient overlay (from-blue-600/50 via-blue-700/30 to-white) covered everything
- Increased mobile banner height from h-28 to h-52 (208px) for better visibility
- Changed object-top scale-110 to object-center for natural framing
- Lightened gradient overlay to from-blue-900/30 via-transparent to-white — character now clearly visible
- Verified with VLM: desktop shows single illustration, mobile shows cute character clearly

Stage Summary:
- Desktop: Single illustration only, no more duplicate
- Mobile: Banner with cute character clearly visible at top, blends into white content below

---
Task ID: 3
Agent: Main Agent
Task: Redesign desktop DecorativePanel with premium blending, layout, and image integration

Work Log:
- VLM analyzed current desktop: rated 7/10, issues were illustration not seamlessly fading, glassmorphism too opaque, stats too muted
- Completely redesigned DecorativePanel with:
  - Layered gradient background with radial glow for depth
  - Subtle noise texture overlay for premium feel
  - Soft floating orbs (blur-3xl) instead of hard circles
  - Illustration with aggressive mask gradient (black 30% → rgba 60% → transparent) for seamless fade
  - Soft glow behind illustration (bg-blue-400/20 blur-3xl) for depth
  - Glassmorphism card reduced to bg-white/[0.08] with backdrop-blur-2xl and stronger border
  - Stats with hover effect, extrabold values, semibold labels, backdrop-blur
  - Gradient text on "With You" heading
- VLM rated final design 8/10 for both desktop and mobile
- Mobile still looks great with visible cute character banner, no duplicate navbar

Stage Summary:
- Desktop left panel: premium glassmorphism + seamlessly fading illustration + polished stats
- Mobile: cute character banner clearly visible, blends into white form
- Both scored 8/10 by VLM evaluation

---
Task ID: 4
Agent: Main Agent
Task: Fill desktop whitespace, center form, add more animations

Work Log:
- VLM analysis confirmed right panel had whitespace below form, form was not centered, left panel lacked visual cards
- Added 2x2 feature card grid to left panel (Clinical Tools, Academy, Directory, Events) with glassmorphism style and hover animations
- Added "Free & Trusted" badge with Shield icon to bottom stats row
- Added floating dot particles with infinite float animation on left panel
- Centered form with lg:max-w-lg lg:mx-auto on step content and nav buttons
- Added desktop step dot indicator (Welcome → Role → Purpose → Specialty → Location → Ready) with active/complete states
- Added staggered field animations (opacity + x-slide) on Step 1 (Welcome)
- Added whileHover and whileTap animations on all interactive buttons
- Added social proof mini-avatar row on Step 1 ("Join 600+ optometrists worldwide")
- Made Step 5 (Location) use 2-col grid for Org + Membership fields on desktop
- Feature recommendation cards on Step 6 now have whileHover x-shift animation
- VLM rated both desktop and mobile 8/10

Stage Summary:
- Desktop left panel: filled with headline card + feature cards grid + stats + trust badge + illustration
- Desktop right panel: form centered (max-w-lg), step dot indicator at top
- More animations: staggered reveals, whileHover/whileTap, floating particles, spring rotations
- Mobile still 8/10, banner still visible and cute

---
Task ID: 1
Agent: Main Agent
Task: Redesign desktop onboarding left panel with image generation, step-aware content, better animations

Work Log:
- Read current OnboardingPage.tsx (1018 lines) to understand the existing DecorativePanel and right-side form layout
- Took screenshot of current desktop view and analyzed with VLM - identified too much white space, static content
- Generated 5 new AI images using z-ai image generation:
  - desktop-pattern.png (1152x864) - abstract eye/vision geometric pattern for background
  - clinical-tools.png (1024x1024) - clinical optometry equipment illustration
  - global-network.png (1024x1024) - global professional network nodes
  - academy-learn.png (1024x1024) - digital learning/education illustration
  - dashboard-hologram.png (1024x1024) - futuristic holographic dashboard
- Completely redesigned DecorativePanel with:
  - Step-aware content system (stepDescriptions object) - headline, sub, and feature cards change per step
  - Animated background pattern image with screen blend mode
  - Animated radial glow that moves position based on current step
  - More floating orbs with 3 speed variants (fast, normal, slow)
  - Pulse ring animations and expanding ring effects
  - Step indicator pill showing current step number
  - Feature cards with AI-generated image overlays (mixBlendMode: overlay)
  - Dashboard hologram preview card with animated arrow
  - Hover animations on stats cards
  - Wider panel (52% instead of 48%)
- Improved right panel:
  - Added subtle blue gradient background on desktop (radial-gradient)
  - Animated step dots with spring animations (width morphing)
  - Skip button with hover/tap animations
- Verified mobile view completely untouched with VLM analysis
- Lint passes clean
- VLM rated final design 8/10

Stage Summary:
- 5 new AI-generated images in /public/images/onboarding/
- DecorativePanel now accepts currentStep prop and shows step-aware content
- All 6 steps have unique headlines, descriptions, and feature cards
- Much richer animations: floating orbs, pulse rings, step transitions, hover effects
- Mobile view confirmed unchanged and looking great
- Desktop layout now fills space properly with no awkward white space

---
Task ID: 2
Agent: Main Agent
Task: Redesign desktop onboarding - girl as background, overlapping cards, visuals on right below forms, edge blends

Work Log:
- User rated previous design 1/10 - "too boring and weird layout, not overlapping, remove eye icon, girl as background, move visuals to right below forms, edge blends"
- Completely rewrote DecorativePanel:
  - Girl (desktop-banner.png) now FULL background with object-cover object-top
  - Removed Eye icon, only "FocusLinks" text as brand
  - Multi-layer gradient overlays for edge blending (from-blue-900/80, to-transparent, right edge blend into white)
  - 4 overlapping glassmorphism cards stacked with visible offset layers (peeking from top-right, trailing from bottom-left)
  - Stats row overlaps bottom edge of headline card with -mb-12
  - Step-aware content still changes per step (6 unique headlines)
  - Floating particles and pulse ring animations
- Right panel now has visual elements below form:
  - 4 colored feature cards (Clinical Tools, Academy, Directory, Events) with gradient backgrounds
  - AI-Powered Personalization card with rotating sparkles icon
  - Blended separator line between form and cards
  - Edge blend at bottom of each card
- Removed unused imports (floatAnimationFast, pulseGlow, old stepDescriptions with features/images)
- VLM rated final design 8/10
- Mobile view confirmed completely untouched and good
- Step-aware content verified working (headline changes to "Your Role Shapes Your Experience" for step 2)

Stage Summary:
- Left panel: Girl as full background with glassmorphism overlays, no eye icon, 4 visible overlapping card layers
- Right panel: Feature cards below form with colored gradients and edge blends
- Edge blend between left/right panels via gradient fade
- Step-aware content continues to work
- Mobile untouched
- VLM rating: 8/10
---
Task ID: 1
Agent: Main Agent
Task: Redesign desktop onboarding - left panel card alignment + right side scattered papers mood board

Work Log:
- Read full OnboardingPage.tsx to understand current state
- Generated 2 new images: cute-doodle.png (kawaii optometry workspace), sticky-collage.png (brainstorm sticky notes)
- Fixed left panel DecorativePanel: better card alignment with flex justify-between for branding + step pill, removed messy absolute positioning for cards, made overlapping glassmorphism cards more visible with higher opacity and spring animations
- Replaced right side 2x2 feature card grid with scattered papers/mood board aesthetic:
  - 5 scattered image thumbnails (clinical-tools, cute-doodle, global-network, sticky-collage, academy-learn) at various angles with pin dots on top
  - 6 speech bubble text labels (AI Tools, Learn & Grow, Connect Globally, Your Career, Events & Talks, Free Forever) with colored pill shapes
  - 3 SVG dotted arrow lines connecting elements with animated path drawing
  - Cute animated elements: stars, sparkles, lightbulb icons with floating/rotating animations
  - AI-Powered Personalization badge at bottom center
  - Grid dots background pattern
- Fixed invalid Tailwind classes: border-white/22 → border-white/20, border-white/12 → border-white/10
- Fixed speech bubble tail CSS (removed invalid current-border)
- Replaced Math.random() with deterministic floatDur values to prevent hydration mismatches
- Verified: lint passes, no compilation errors, VLM rates 8/10
- Mobile view confirmed untouched and still looking great (8/10)

Stage Summary:
- Desktop onboarding redesigned with scattered papers mood board aesthetic
- Left panel: girl character background with properly aligned overlapping glassmorphism cards
- Right panel: form at top, scattered papers/bubbles/arrows below
- All 5 requested elements visible: scattered images, text bubbles, dotted arrows, cute animations, AI badge
---
Task ID: 2
Agent: Main Agent
Task: Redesign right side with matching cartoon visuals, tag-style labels, proper centering and alignment

Work Log:
- Generated 6 matching cartoon-style visuals: cartoon-clinical.png, cartoon-academy.png, cartoon-global.png, cartoon-events.png, cartoon-career.png, cartoon-trust.png (all flat cartoon kawaii style with consistent aesthetic)
- Replaced scattered papers/mood board layout with clean 3x2 grid of cartoon visual cards
- Each card has a colored tag pill label (AI Tools=amber, Academy=emerald, Community=sky, Events=purple, Career=orange, Free & Safe=blue) connected with visible dotted connector line + dot
- Removed old scatteredPapers, scatteredBubbles, dottedArrows data — replaced with single visualTagCards array
- Removed SVG arrow rendering code (was confusing, not really "tagging")
- Added hover effects: cards scale up and straighten on hover, overlay gradient appears
- Added AI-Powered Personalization badge below grid with spinning sparkle icon
- Fixed tag connector visibility: using repeating-linear-gradient for visible dotted line + small dot at connection point
- Grid is well-centered within the max-w-lg container
- VLM rates: Left panel 8/10, Right panel 9/10, Overall 9/10
- Mobile untouched, still 8/10

Stage Summary:
- Right side now has clean, centered 3x2 grid of matching cartoon visuals with tag labels
- Tag labels are properly "tagged" to images (not random arrows linking unrelated elements)
- Matching cartoon style across all 6 visuals (consistent kawaii/flat style)
- Clean alignment, proper centering, cute animations (floating, spring entry)

---
Task ID: 3
Agent: Main Agent
Task: Move Continue button below email field, centered in right panel for easy access

Work Log:
- Analyzed current layout: Continue button was only in the bottom nav bar, requiring scroll to reach
- Added inline Continue button right below the email field in Step 1 (Welcome)
- Button is centered with justify-center and has matching gradient style (from-blue-600 to-blue-700)
- On mobile: full-width button (w-full sm:w-auto sm:min-w-[200px])
- On desktop: centered with min-width for clean look
- Bottom nav bar with Continue button still preserved for all steps
- Social proof hint moved below the inline Continue button
- VLM rated layout 8/10 — form is centered, Continue button easy to access

Stage Summary:
- Continue button now appears right below email field, centered in right panel
- No scrolling needed to find the Continue button on Step 1
- Bottom navigation bar still present for all steps
- Lint passes clean

---
Task ID: 4
Agent: Main Agent
Task: Fix blurry perception on right panel - remove constant floating animations and visual noise

Work Log:
- Identified root cause: 6 visual tag cards had continuous floating animations (y: [0, -3, 0] repeat Infinity) making everything appear blurry
- Rotating sparkle icon in AI badge also contributed to "everything moving" feel
- Dotted connector lines on tag labels added visual noise
- Removed all continuous floating animations from visual tag cards — they now stay static and sharp
- Removed rotation from cards (no more wobble/tilt)
- Replaced motion.div with plain div for card images (no infinite animation)
- Cleaned up tag labels: removed dotted connector lines, placed clean pill tags below cards with mt-2
- Removed infinite rotation from AI badge sparkle icon
- Kept only entry animations (spring fade-in) and hover effects
- Cleaned up visualTagCards data: removed unused rotate, floatDur, delay properties
- VLM rates clarity 9/10

Stage Summary:
- Right panel is now crisp and sharp — no constant animations causing blur perception
- Cards are static with clean entry animations only
- Tag labels are simple pills below each card
- AI badge sparkle is static (no rotation)
- Lint passes clean

---
Task ID: 5
Agent: Main Agent
Task: Add Profile Completion widget to Dashboard + redirect to /dashboard after onboarding/login

Work Log:
- Read existing Dashboard.tsx (~725 lines) — already has welcome banner, quick actions, community feed, user info card, public profile status, edit profile modals
- Added Profile Completion widget between Welcome Banner and Quick Actions:
  - Animated progress bar (gradient blue-purple-fuchsia) showing completion percentage
  - 6-item checklist: Name, Email, Role, Location, Photo, Publish Public Profile
  - Each item shows checkmark (emerald) if done, or clickable card with arrow if not
  - Clicking incomplete items opens edit profile modal or navigates to /create-profile
  - Widget auto-hides when profile is 100% complete
  - "Publish My Profile" CTA button links to /create-profile
  - Gradient top accent bar for visual polish
- Changed onboarding redirects: all 3 scenarios now go to /dashboard instead of /home or feature-specific routes
  - Already complete redirect: /dashboard
  - Skip onboarding: /dashboard
  - Complete onboarding: /dashboard (removed smart route recommendation)
- Changed Login.tsx redirect: /dashboard instead of /home
- Changed root / redirect in page.tsx: /dashboard instead of /home
- Lint passes clean, dev server running without errors

Stage Summary:
- Dashboard now has prominent "Complete Your Profile" widget with progress bar and actionable checklist
- Users are always redirected to /dashboard after onboarding, login, or visiting /
- Profile completion tracked: name, email, role, location, photo, public profile
- Widget disappears when profile is 100% complete
- Publish My Profile CTA drives users to create their directory listing
