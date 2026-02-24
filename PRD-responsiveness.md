# PRD: Full Responsive Design for My Rituals

## Executive Summary

The "My Rituals" Next.js application currently uses a fixed-width desktop-only layout with a permanently visible 224px sidebar and rigid grid structures that do not adapt to smaller screens. This PRD documents a comprehensive analysis of the codebase, identifies every file requiring modification, and provides a detailed responsive strategy using Tailwind CSS v4's mobile-first breakpoint system to make the application fully usable across mobile (320px+), tablet (768px+), and desktop (1024px+) viewports.

## Research Metadata

- **Date**: 2026-02-20
- **Feature Request**: Add full responsiveness to the My Rituals web application -- mobile-friendly and responsive across all screen sizes (mobile, tablet, desktop)
- **Technology Stack**: Next.js 16.1.6, React 19.2.3, Tailwind CSS v4, Radix UI, Lucide React, Supabase
- **Next Step**: Product Manager Specification Phase

---

## 1. Current State Analysis

### 1.1 Critical Problem: No Responsive Breakpoints Exist

A codebase-wide search for responsive breakpoint prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) returned **zero results** across all application files. The only matches were for border-radius size tokens (`sm`, `md`, `lg`) in `tailwind.config.ts` and button size variants in `components/ui/button.tsx`. The application is entirely designed for desktop viewports with no responsive adaptations whatsoever.

### 1.2 Fixed Sidebar Layout Blocks Mobile Use

The root layout (`app/layout.tsx`) uses `ml-56` (margin-left: 14rem / 224px) to offset content from a permanently fixed sidebar. On any screen narrower than approximately 900px, the content area becomes unusably compressed. On mobile screens (320-480px), only ~100-250px of horizontal space remains for content -- making the app completely non-functional on phones.

```tsx
// app/layout.tsx -- line 17
<main className="ml-56 min-h-screen bg-[#F7F7F7]">
```

### 1.3 Rigid Grid Structures

Multiple pages use fixed column grids without responsive variants:

- **Dashboard stats**: `grid-cols-4` (4 equal columns, no stacking on mobile)
- **Dashboard content**: `grid-cols-3` (3-column layout, no stacking)
- **WeekGrid**: `grid-cols-[48px_repeat(5,1fr)]` with `min-w-[700px]` (5-day grid, minimum 700px wide)
- **Weekly Review stats**: `grid-cols-4` inside a dark card
- **Week Entry form**: `grid-cols-2` for form fields

### 1.4 Header Layouts Prone to Overflow

Every page uses `flex items-start justify-between` for the header row (title on left, action buttons on right). On narrow screens, these will overlap or overflow since there is no wrapping or stacking behavior defined.

---

## 2. Affected Codebase Files

### Critical Files (Direct Modification Required)

| File Path | Purpose | Modification Type | Priority |
|-----------|---------|-------------------|----------|
| `app/layout.tsx` | Root layout with fixed sidebar offset | **Modify** -- Conditional sidebar margin, responsive container | P0 |
| `components/Navigation.tsx` | Fixed 224px sidebar | **Modify** -- Mobile hamburger menu, collapsible sidebar, overlay | P0 |
| `app/page.tsx` | Dashboard with 4-col stats + 3-col content | **Modify** -- Responsive grids, stacking, text sizing | P0 |
| `components/WeekGrid.tsx` | 5-day calendar grid with 700px minimum | **Modify** -- Mobile alternative view (day-by-day or horizontal scroll) | P1 |
| `app/week/entry/page.tsx` | Weekly plan form with 2-col grid | **Modify** -- Single column on mobile, responsive header | P1 |
| `app/daily/entry/page.tsx` | Daily check-in form | **Modify** -- Responsive header, touch-friendly buttons | P1 |
| `app/review/entry/page.tsx` | Weekly review with 4-col stats card | **Modify** -- Responsive stats grid, stacking | P1 |
| `app/history/page.tsx` | History list with flex layouts | **Modify** -- Responsive card headers, text truncation | P2 |
| `app/globals.css` | Global styles, Tailwind v4 `@theme` config | **Modify** -- Add viewport meta considerations, possible breakpoint customization | P1 |

### Supporting Files (May Require Updates)

| File Path | Purpose | Potential Changes |
|-----------|---------|-------------------|
| `components/ui/button.tsx` | Button component with size variants | May need mobile-specific touch target sizes (min 44px) |
| `components/ui/card.tsx` | Card component | Possibly reduce padding on mobile (`p-5` to `p-3` or `p-4`) |
| `components/ui/select.tsx` | Radix Select | Verify mobile dropdown positioning and touch usability |
| `components/ui/textarea.tsx` | Textarea component | Verify `min-h` values work on mobile |
| `components/ui/input.tsx` | Input component | Verify font-size >= 16px to prevent iOS zoom |
| `components/CategoryBadge.tsx` | Category badge/dot | Already compact; may need minor size adjustments |
| `tailwind.config.ts` | Tailwind configuration | No changes needed -- v4 default breakpoints are adequate |
| `lib/types.ts` | Type definitions | No changes needed |
| `lib/utils.ts` | Utility functions | No changes needed |

### Test Files

No test files currently exist in the project. Responsive testing will need to be manual or via new tests.

---

## 3. Existing Implementation Patterns

### Pattern: `cn()` Utility for Class Merging
**Location**: `lib/utils.ts` (line 12-14)
**Relevance**: All responsive classes should be added through this utility to ensure proper Tailwind class merging without conflicts.
```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Pattern: Card-Based Layout Composition
**Location**: Used across all pages via `components/ui/card.tsx`
**Relevance**: Cards already use rounded borders and padding. Responsive changes should reduce `p-5` to `p-3` on mobile via Tailwind responsive prefixes. The consistent Card pattern means changes can be applied uniformly.
```tsx
// Card padding pattern: p-5 on desktop, could become p-3 on mobile
<CardContent className="p-5 pt-0">
```

### Pattern: Header Row with Title + Actions
**Location**: Every page uses this identical layout pattern
**Relevance**: Must be converted to a responsive stacking pattern on mobile.
```tsx
// Found in: app/page.tsx, app/daily/entry/page.tsx, app/week/entry/page.tsx, app/review/entry/page.tsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="font-heading text-3xl font-bold text-[#080D00]">...</h1>
    <p className="text-[#686B63] mt-1">...</p>
  </div>
  <Button>...</Button>
</div>
```

### Pattern: Fixed Sidebar Navigation
**Location**: `components/Navigation.tsx`
**Relevance**: The sidebar is the single biggest blocker for mobile responsiveness. It uses `fixed top-0 left-0 h-screen w-56` with no conditional rendering or breakpoint-based visibility.
```tsx
<aside className="fixed top-0 left-0 h-screen w-56 bg-[#421E06] flex flex-col z-40">
```

### Pattern: Grid Column Layouts
**Location**: `app/page.tsx` (lines 92, 141)
**Relevance**: Fixed column counts need responsive variants.
```tsx
// Stats row: 4 columns on desktop, should be 2x2 on tablet, 1 column on mobile
<div className="grid grid-cols-4 gap-4">

// Content: 3 columns (2+1) on desktop, should stack on mobile
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2 space-y-3">...</div>
  <div className="space-y-3">...</div>
</div>
```

---

## 4. Technology Documentation Excerpts

### Tailwind CSS v4 Responsive Design
**Source**: [Tailwind CSS Responsive Design Docs](https://tailwindcss.com/docs/responsive-design)

**Default Breakpoints** (These are already available -- no configuration needed):
| Prefix | Min Width | Typical Device |
|--------|-----------|----------------|
| `sm:` | 640px | Large phones, landscape |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

**Mobile-First Principle**: Unprefixed utilities apply to ALL screen sizes. Prefixed utilities apply at that breakpoint AND ABOVE. This means you write mobile styles first (unprefixed), then layer on larger-screen overrides:

```html
<!-- Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

**Targeting Specific Ranges**: Use `max-*` variant to cap a range:
```html
<!-- Only applies between md and lg -->
<div class="md:max-lg:grid-cols-2">
```

### Tailwind CSS v4 @theme Configuration
**Source**: [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme)

The project already uses `@theme inline` in `globals.css` for custom tokens. If custom breakpoints are needed, they can be added:
```css
@theme inline {
  --breakpoint-xs: 20rem; /* 320px -- optional, for very small phones */
  /* Default breakpoints (sm: 40rem, md: 48rem, lg: 64rem, xl: 80rem, 2xl: 96rem) are already available */
}
```

However, the default breakpoints should be sufficient for this project.

### Next.js Viewport Meta Tag
**Source**: [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

Next.js 16 automatically adds a viewport meta tag. The current project relies on this default behavior, which generates:
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```
This is correct and sufficient. No changes needed.

### iOS Input Zoom Prevention
**Source**: Common mobile UX best practice

iOS Safari automatically zooms in on form inputs with font-size below 16px. The project's inputs use Tailwind's default `text-sm` (14px), which will trigger zoom. Inputs should use `text-base` (16px) on mobile or apply the CSS workaround:
```css
@media screen and (max-width: 767px) {
  input, select, textarea { font-size: 16px !important; }
}
```

---

## 5. External Implementation Patterns

### Responsive Sidebar to Mobile Drawer Pattern
**Source**: [Building a Responsive Aside Navbar in Next.js and Tailwind CSS](https://medium.com/@ryaddev/building-a-responsive-aside-navbar-in-nextjs-and-tailwindcss-d8da77ec237c)

**Pattern Summary**: The sidebar remains fixed on desktop (`lg:` and above) but converts to a slide-in overlay drawer on mobile, triggered by a hamburger button.

**Recommended Implementation Approach**:
```tsx
// Navigation.tsx -- Conceptual structure
"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#421E06] flex items-center px-4 z-50">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6 text-[#FFD115]" />
        </button>
        <span className="font-heading font-bold text-lg text-[#FFD115] ml-3">My Rituals</span>
      </header>

      {/* Overlay backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: always visible on lg+, slide-in drawer on mobile */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-56 bg-[#421E06] flex flex-col z-50 transition-transform duration-300",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Close button for mobile */}
        <button className="lg:hidden absolute top-4 right-4" onClick={() => setMobileOpen(false)}>
          <X className="h-5 w-5 text-[#C7C8C6]" />
        </button>
        {/* ... existing nav content ... */}
      </aside>
    </>
  );
}
```

**Adaptation Notes**: The existing `Navigation.tsx` already uses `"use client"` and `lucide-react`, so `Menu` and `X` icons are readily available. The `cn()` utility is already imported. Close the mobile drawer on route changes using Next.js `usePathname()` (already imported).

### Responsive Layout Wrapper Pattern
**Source**: Common pattern in Next.js + Tailwind applications

**Recommended Implementation for `app/layout.tsx`**:
```tsx
<main className="lg:ml-56 min-h-screen bg-[#F7F7F7] pt-14 lg:pt-0">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    {children}
  </div>
</main>
```

**Key changes**:
- `ml-56` becomes `lg:ml-56` (no left margin on mobile)
- `pt-14 lg:pt-0` adds top padding for the mobile header bar
- `px-6` becomes `px-4 sm:px-6` for tighter mobile horizontal padding

### Responsive Week Grid Alternative: Horizontal Scroll + Day Selector
**Source**: [Tailwind CSS Calendar Components](https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/calendars)

The current `WeekGrid` component requires a minimum of 700px. On mobile, two alternative approaches are viable:

**Option A -- Horizontal scroll (simplest)**: Keep `min-w-[700px]` inside `overflow-x-auto`. Already partially implemented but needs visual scroll indicators.

**Option B -- Day-by-day view (better UX)**: Show a day selector row at the top and display one day's schedule at a time on mobile.

```tsx
// Conceptual mobile day view
<div className="lg:hidden">
  {/* Day selector tabs */}
  <div className="flex gap-1 overflow-x-auto pb-2">
    {days.map(date => (
      <button key={date} onClick={() => setSelectedDay(date)}
        className={cn("px-3 py-2 rounded-lg text-sm whitespace-nowrap",
          selectedDay === date ? "bg-[#FFD115] text-[#421E06]" : "text-[#686B63]"
        )}>
        {getDayName(date).slice(0, 3)}
      </button>
    ))}
  </div>
  {/* Single day timeline */}
  <div className="relative border rounded-lg" style={{ height: "500px" }}>
    {/* ... render tasks for selectedDay only ... */}
  </div>
</div>

{/* Desktop: full 5-day grid */}
<div className="hidden lg:block">
  {/* ... existing WeekGrid ... */}
</div>
```

**Adaptation Notes**: `WeekGrid` is already a `"use client"` component, so adding `useState` for `selectedDay` is straightforward. The `getWeekDays`, `getDayName`, and other utilities are already imported.

---

## 6. Component-by-Component Breakdown

### 6.1 Navigation (`components/Navigation.tsx`)
**Current**: Fixed sidebar, 224px wide, always visible
**Required Changes**:
- Add `useState` for mobile menu open/close
- Add mobile top bar with hamburger icon (visible `lg:hidden`)
- Add backdrop overlay when mobile menu is open
- Convert sidebar to slide-in drawer on mobile (translate-x transform)
- Auto-close drawer on route change (listen to `pathname` changes)
- Hide category legend on mobile to save space, or move it to a collapsible section

### 6.2 Root Layout (`app/layout.tsx`)
**Current**: `ml-56` fixed left margin, `px-6 py-8` padding
**Required Changes**:
- `ml-56` -> `lg:ml-56` (remove sidebar offset on mobile)
- Add `pt-14 lg:pt-0` for mobile header height
- `px-6` -> `px-4 sm:px-6` for tighter mobile padding
- `py-8` -> `py-4 sm:py-6 lg:py-8` for graduated vertical spacing

### 6.3 Dashboard Page (`app/page.tsx`)
**Current**: `grid-cols-4` stats, `grid-cols-3` content, `text-3xl` title
**Required Changes**:
- Page title: `text-2xl sm:text-3xl`
- Header row: `flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`
- Stats grid: `grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`
- Content grid: `grid-cols-1 lg:grid-cols-3 gap-4`
- `col-span-2` -> `lg:col-span-2`
- Stat card text: `text-2xl sm:text-3xl` for the big numbers
- Buttons in header: stack vertically on mobile, horizontal on larger screens

### 6.4 WeekGrid (`components/WeekGrid.tsx`)
**Current**: 5-column grid, 700px minimum, 660px fixed height
**Required Changes**:
- Mobile: Show single-day view with day selector tabs (see pattern in Section 5)
- Tablet: Keep horizontal scroll with scroll indicator
- Desktop: No changes needed (current layout is fine)
- Reduce fixed height on mobile: `style={{ height: "500px" }}` on mobile vs `660px` on desktop
- Consider adding swipe gesture support (future enhancement)

### 6.5 Weekly Plan Entry (`app/week/entry/page.tsx`)
**Current**: `max-w-3xl`, header with title + hours + save button, 2-col form grid
**Required Changes**:
- Header: Stack title / hours summary / button vertically on mobile
- `flex items-start justify-between` -> `flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`
- Form grid: `grid-cols-1 sm:grid-cols-2 gap-4`
- `col-span-2` -> `sm:col-span-2`
- Category summary badges: already uses `flex-wrap`, should work
- Task accordion header: verify truncation works on narrow screens
- "Add task" button: ensure full-width touch target

### 6.6 Daily Check-in (`app/daily/entry/page.tsx`)
**Current**: `max-w-2xl`, header with title + save button
**Required Changes**:
- Header: Stack on mobile
- Energy buttons: Already `flex-1`, should adapt well; verify min touch target size (44px)
- Task status pill buttons: `flex gap-1.5 flex-wrap` -- already wraps, but verify on small screens
- Task note input: ensure 16px font on mobile to prevent iOS zoom
- Bottom save button: Make full-width on mobile `w-full sm:w-auto`

### 6.7 Weekly Review (`app/review/entry/page.tsx`)
**Current**: `max-w-2xl`, dark stats card with `grid-cols-4`
**Required Changes**:
- Stats card: `grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4`
- Stats text: `text-xl sm:text-2xl`
- Completed tasks list: verify horizontal scrolling does not break
- Header: Stack title + button on mobile
- Bottom save: Full width on mobile

### 6.8 History Page (`app/history/page.tsx`)
**Current**: Card headers with `flex items-start justify-between`
**Required Changes**:
- Card header: Stack on mobile -- move completion percentage below title
- Category badges: Already uses `flex-wrap`, should work
- "Current" and "Reviewed" badges: verify they don't overflow on mobile
- Review excerpt text: `line-clamp-2` is already good for mobile

---

## 7. Proposed Responsive Breakpoint Strategy

### Use Tailwind CSS v4 Default Breakpoints (No Custom Configuration Needed)

| Breakpoint | Min Width | Layout Behavior |
|------------|-----------|-----------------|
| (default)  | 0px       | **Mobile**: Single column, stacked layouts, hamburger nav, day-by-day calendar |
| `sm:`      | 640px     | **Large phone/small tablet**: 2-column form grids, slightly more padding |
| `md:`      | 768px     | **Tablet**: 2-column stat grids, horizontal scroll calendar |
| `lg:`      | 1024px    | **Laptop**: Sidebar visible, 3-4 column grids, full week calendar |
| `xl:`      | 1280px    | **Desktop**: Same as lg, `max-w-6xl` container provides comfortable reading width |

### Design Principles
1. **Mobile-first**: Write all base styles for mobile (unprefixed), then add larger breakpoint overrides
2. **Content-driven breakpoints**: Use `sm:` and `lg:` as the primary breakpoints; `md:` and `xl:` for refinements only where needed
3. **Progressive enhancement**: Mobile gets a functional but simplified experience (single-day calendar, stacked cards); desktop gets the full experience

---

## 8. Technical Considerations

### Architecture Alignment
- The project uses Next.js App Router with server components (dashboard, history) and client components (forms, navigation). Responsive changes are purely CSS/Tailwind class changes and do not affect the server/client architecture.
- The `"use client"` boundary for `Navigation.tsx` already exists; adding mobile state management (open/close) fits naturally.
- The `WeekGrid.tsx` is already a client component with state management capabilities.

### Potential Challenges

1. **WeekGrid complexity**: The 5-day calendar grid is the most complex responsive challenge. The fixed 660px height and absolute positioning of tasks make a simple CSS-only responsive approach difficult. A mobile-specific day view (Option B from Section 5) requires adding state and conditional rendering.

2. **iOS form zoom**: Multiple form fields use `text-sm` (14px), which triggers iOS Safari auto-zoom. All inputs, selects, and textareas need `text-base` (16px) on mobile or a global CSS fix.

3. **Sidebar-to-drawer transition**: Requires careful z-index management. The current sidebar uses `z-40`. The mobile overlay needs to be `z-40` with the drawer itself at `z-50` to layer correctly.

4. **Touch targets**: Several interactive elements (status pills in daily ops, expand/collapse chevrons in weekly plan) are smaller than the recommended 44x44px minimum for touch interfaces.

5. **Scroll behavior**: The `overflow-x-auto` on WeekGrid needs visual scroll indicators on mobile (e.g., gradient fade or scroll shadow) to signal that horizontal scrolling is possible.

### Dependencies
No new packages are required. All responsive changes use existing Tailwind CSS v4 utilities and React state management. The `lucide-react` package already includes `Menu` and `X` icons needed for the hamburger menu.

### Security Considerations
No security implications. All changes are client-side layout and styling modifications.

### Performance Considerations
- Mobile drawer animation uses CSS `transform` (GPU-accelerated, no layout thrashing)
- No additional JavaScript bundles needed
- Consider lazy-loading the full WeekGrid on mobile if using the day-view approach (defer the 5-column grid render until `lg:` viewport is detected)

---

## 9. Success Criteria

### Functional Requirements
- [ ] App is fully usable on viewports from 320px to 2560px+ wide
- [ ] Navigation is accessible via hamburger menu on mobile (<1024px)
- [ ] All forms (weekly plan, daily check-in, weekly review) can be completed on a mobile phone
- [ ] Week calendar is viewable on mobile (either via horizontal scroll or day-by-day view)
- [ ] All text is readable without horizontal scrolling on mobile
- [ ] All interactive elements meet the 44x44px minimum touch target on mobile
- [ ] iOS Safari does not auto-zoom on form input focus

### Visual Requirements
- [ ] No content is clipped or overflowing at any standard viewport width
- [ ] Spacing (padding, margins, gaps) is visually proportional at each breakpoint
- [ ] Typography scales appropriately (headings smaller on mobile, body text remains readable)
- [ ] Cards and containers use full available width on mobile (no excessive side padding)

### Technical Requirements
- [ ] No new npm packages introduced
- [ ] All responsive changes use Tailwind CSS v4 mobile-first breakpoint system
- [ ] No `!important` overrides or custom media queries outside Tailwind's system
- [ ] Existing desktop layout is unchanged (no visual regressions on large screens)
- [ ] No custom breakpoints needed -- default Tailwind breakpoints are sufficient

### Testing Criteria
- [ ] Tested on Chrome DevTools responsive mode at: 320px, 375px, 414px, 768px, 1024px, 1280px, 1440px
- [ ] Tested on Safari (iOS) for form zoom behavior
- [ ] Tested sidebar drawer open/close animation and route-change auto-close
- [ ] Tested WeekGrid mobile view interaction

---

## 10. Recommended Approach Summary

The implementation should follow this sequence:

**Phase 1 -- Foundation (P0)**:
1. Convert `Navigation.tsx` to a responsive sidebar/drawer pattern
2. Update `app/layout.tsx` to conditionally apply sidebar margin and add mobile header padding
3. These two changes unblock all other pages from being viewable on mobile

**Phase 2 -- Page Layouts (P1)**:
4. Update all page headers to stack on mobile (`flex-col` -> `sm:flex-row`)
5. Convert all fixed-column grids to responsive grids (dashboard stats, content areas, review stats)
6. Make `WeekGrid.tsx` responsive with a mobile day-view
7. Ensure all form fields use 16px font on mobile

**Phase 3 -- Polish (P2)**:
8. Fine-tune spacing and typography at each breakpoint
9. Add scroll indicators for horizontal-scroll areas
10. Verify touch target sizes on all interactive elements
11. Test and fix any edge cases on real devices

This approach delivers a functional mobile experience after Phase 1 (2 files changed), a complete responsive experience after Phase 2 (6 more files), and a polished production-ready experience after Phase 3.

---

## Appendix: External Sources

- [Tailwind CSS v4 Responsive Design Documentation](https://tailwindcss.com/docs/responsive-design)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme)
- [Tailwind CSS v4.0 Release Blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [Building a Responsive Aside Navbar in Next.js and Tailwind CSS](https://medium.com/@ryaddev/building-a-responsive-aside-navbar-in-nextjs-and-tailwindcss-d8da77ec237c)
- [Create a Responsive Animated Sidebar Using React/Next.js and Tailwind CSS](https://medium.com/designly/create-a-responsive-animated-sidebar-using-react-next-js-and-tailwind-css-bd5a0f42f103)
- [How to Create a Responsive Tailwind Sidebar Layout in Next.js](https://reacthustle.com/blog/next-js-tailwind-responsive-sidebar-layout)
- [Tailwind CSS Calendar Components](https://tailwindcss.com/plus/ui-blocks/application-ui/data-display/calendars)
- [Tailwind CSS Breakpoints Guide](https://tailkits.com/blog/tailwind-css-breakpoints-guide/)
- [Tailwind CSS v4 Tips Every Developer Should Know](https://www.nikolailehbr.ink/blog/tailwindcss-v4-tips/)

---

*This PRD is ready for Product Manager specification phase.*
