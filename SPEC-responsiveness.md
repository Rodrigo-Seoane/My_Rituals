# Specification: Full Responsive Design

## Overview

This spec translates the requirements in `PRD-responsiveness.md` into exact, file-level code changes. The goal is to make the My Rituals application fully functional on all viewports from 320px to 2560px using Tailwind CSS v4's mobile-first breakpoint system. Zero new npm packages are introduced. Every change is a targeted Tailwind class substitution or a React state addition; no architectural changes to data fetching, routing, or component boundaries are required.

The implementation is divided into three phases. Complete Phase 1 before beginning Phase 2, because the layout shift in `app/layout.tsx` and `components/Navigation.tsx` unblocks all other pages from being visible on mobile at all.

---

## Implementation Phases

| Phase | Files | Outcome |
|-------|-------|---------|
| Phase 1 — Foundation | `components/Navigation.tsx`, `app/layout.tsx` | App is navigable on mobile |
| Phase 2 — Page Layouts | `app/page.tsx`, `components/WeekGrid.tsx`, `app/week/entry/page.tsx`, `app/daily/entry/page.tsx`, `app/review/entry/page.tsx`, `app/history/page.tsx`, `app/globals.css` | All pages are usable on mobile |
| Phase 3 — Polish | `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/button.tsx`, `components/ui/card.tsx` | Touch targets, iOS zoom prevention, spacing refinements |

---

## Phase 1 — Foundation

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/components/Navigation.tsx`

This file requires the most significant change. The sidebar must become a slide-in drawer on screens below `lg` (1024px), triggered by a hamburger button in a new mobile top bar. The file already has `"use client"`, `usePathname`, `cn`, and `lucide-react` imports — no new import sources are needed, only new named imports from existing packages.

#### Step 1 — Add new imports at the top of the file

Add `useState` to the React import and add `Menu` and `X` to the lucide-react import line.

Current line 1-4:
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, RotateCcw, History, Plus } from "lucide-react";
```

Replace with:
```tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, RotateCcw, History, Plus, Menu, X } from "lucide-react";
```

#### Step 2 — Add mobile state inside the component function

Add the following two lines immediately after the existing `const pathname = usePathname();` declaration on line 17:

```tsx
const [mobileOpen, setMobileOpen] = useState(false);

useEffect(() => {
  setMobileOpen(false);
}, [pathname]);
```

The `useEffect` closes the drawer automatically whenever the user navigates to a new route. This is critical: without it, the drawer stays open after a nav link is tapped.

#### Step 3 — Replace the entire return statement

Replace the current `return (` block (lines 19-73) with the following complete implementation:

```tsx
  return (
    <>
      {/* Mobile top bar — only visible below lg breakpoint */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#421E06] flex items-center px-4 z-50 border-b border-[#5a2a08]">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-[#C7C8C6] hover:bg-[#5a2a08] hover:text-white transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-heading font-bold text-lg text-[#FFD115] ml-3 tracking-tight">
          My Rituals
        </span>
      </header>

      {/* Backdrop overlay — only rendered when drawer is open on mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — always visible on lg+, slide-in drawer on mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-56 bg-[#421E06] flex flex-col z-50",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / Brand */}
        <div className="px-6 py-6 border-b border-[#5a2a08] flex items-center justify-between">
          <div>
            <span className="font-heading font-bold text-xl text-[#FFD115] tracking-tight">
              My Rituals
            </span>
            <p className="text-xs text-[#C7C8C6] mt-0.5 opacity-70">Designer workflow</p>
          </div>
          {/* Close button — only visible on mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#C7C8C6] hover:bg-[#5a2a08] hover:text-white transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#FFD115] text-[#421E06]"
                    : "text-[#C7C8C6] hover:bg-[#5a2a08] hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Category legend */}
        <div className="px-5 py-5 border-t border-[#5a2a08]">
          <p className="text-xs font-semibold text-[#C7C8C6] uppercase tracking-wider mb-3 opacity-60">
            Categories
          </p>
          {[
            { label: "Personal", color: "#FFD115" },
            { label: "Management", color: "#686B63" },
            { label: "Creation", color: "#7C6B5A" },
            { label: "Consumption", color: "#3D6B4F" },
            { label: "Ideation", color: "#7C5230" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-[#C7C8C6] opacity-70">{label}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
```

#### Gotchas for Navigation.tsx

- The sidebar `z-index` is `z-50` (50). The backdrop overlay is `z-40` (40). The mobile top bar header is also `z-50`. This layering ensures the drawer renders on top of the backdrop, which renders on top of all page content. Do not change these values without adjusting all three together.
- The `lg:translate-x-0` class on the `<aside>` must be present at all times (not only when `mobileOpen` is false). The `cn()` conditional only toggles between `translate-x-0` and `-translate-x-full` for mobile; the `lg:translate-x-0` always overrides both on large screens.
- The `transition-transform` CSS property only transitions the `transform` property. The `duration-300 ease-in-out` controls the animation speed. Do not add `transition-all` as it would trigger layout transitions unnecessarily.
- The `useEffect` dependency array must contain only `[pathname]` — not `[pathname, setMobileOpen]`. `setMobileOpen` is a stable setter from `useState` and including it can cause lint warnings.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/app/layout.tsx`

This file has two changes: the sidebar offset and the inner container padding.

#### Change 1 — `<main>` element classes

Current (line 17):
```tsx
<main className="ml-56 min-h-screen bg-[#F7F7F7]">
```

Replace with:
```tsx
<main className="lg:ml-56 min-h-screen bg-[#F7F7F7] pt-14 lg:pt-0">
```

- `ml-56` becomes `lg:ml-56`: removes the 224px left margin on mobile and tablet; re-applies it at the `lg` breakpoint (1024px) where the sidebar is always visible.
- `pt-14 lg:pt-0`: adds 56px top padding to clear the fixed mobile top bar (which is `h-14`). The `lg:pt-0` resets this when the top bar is hidden on desktop.

#### Change 2 — Inner container classes

Current (line 18):
```tsx
<div className="max-w-6xl mx-auto px-6 py-8">
```

Replace with:
```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
```

- `px-6` becomes `px-4 sm:px-6`: tighter horizontal padding on phones (16px), standard padding at `sm` and above (24px).
- `py-8` becomes `py-4 sm:py-6 lg:py-8`: graduated vertical spacing — 16px on mobile, 24px on tablet, 32px on desktop.

#### Gotcha for layout.tsx

After these changes, the `<Navigation />` component renders both the hidden-on-desktop mobile top bar (`<header className="lg:hidden ...">`) and the sidebar (`<aside>`). The `pt-14` on `<main>` accounts for the 56px mobile header height. If the mobile header height is ever changed from `h-14`, the `pt-14` value on `<main>` must be updated to match.

---

## Phase 2 — Page Layouts

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/app/page.tsx`

Four targeted changes. No imports need to change.

#### Change 1 — Page header row (line 42)

Current:
```tsx
<div className="flex items-start justify-between">
```

Replace with:
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
```

On mobile the title block stacks above the button group. At `sm` (640px) and above it returns to the side-by-side layout.

#### Change 2 — Page title (line 44)

Current:
```tsx
<h1 className="font-heading text-3xl font-bold text-[#080D00]">
```

Replace with:
```tsx
<h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">
```

#### Change 3 — Stats grid (line 92)

Current:
```tsx
<div className="grid grid-cols-4 gap-4">
```

Replace with:
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
```

On mobile and tablet, stats display in a 2x2 grid. At `lg` (1024px) they return to the 4-column row.

#### Change 4 — Content grid and col-span (lines 141, 143)

Current:
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="col-span-2 space-y-3">
```

Replace with:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2 space-y-3">
```

On mobile the task list and today's sidebar stack vertically in a single column. At `lg` the two-thirds / one-third split is restored. The `col-span-2` must be guarded with `lg:` otherwise a `col-span-2` inside a `grid-cols-1` has no effect but is misleading — updating it to `lg:col-span-2` is explicit and correct.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/components/WeekGrid.tsx`

This is the most complex change. The 5-day absolute-positioned grid cannot be made responsive with CSS alone because each day column uses a 660px fixed `height` with percentage-based `top` positioning for tasks. The solution is a mobile day-selector view that renders one day at a time, alongside the existing 5-day grid which is shown only on `lg` and above.

The component is already `"use client"` with state. One new piece of state is required: `selectedDay`.

#### Step 1 — Add `useState` to the existing React import

The file currently imports `cn` and utilities but has no explicit React import line — it relies on the JSX transform. Add the `useState` import from React.

Add at line 1 (before the existing imports):
```tsx
import { useState } from "react";
```

#### Step 2 — Add `selectedDay` state inside the component function

Add the following after `const today = getToday();` (currently line 35):

```tsx
const [selectedDay, setSelectedDay] = useState<string>(
  days.includes(today) ? today : days[0]
);
```

This initialises the selected day to today if today is in the current week, otherwise defaults to Monday. The `days` array comes from `getWeekDays(mondayISO)` which is already computed on the line above.

#### Step 3 — Wrap the existing grid in a `hidden lg:block` container

The existing `return` block currently starts with:
```tsx
return (
  <div className="w-full overflow-x-auto">
    <div className="min-w-[700px]">
```

Change the outer wrapper to hide on mobile:
```tsx
return (
  <div className="w-full">

    {/* Mobile day-selector view — hidden on lg and above */}
    <div className="lg:hidden">
      {/* Day tab selector */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {days.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDay(date)}
            className={cn(
              "flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              selectedDay === date
                ? "bg-[#FFD115] text-[#421E06] font-semibold"
                : date === today
                ? "bg-[#FFF9D6] text-[#421E06]"
                : "bg-white text-[#686B63] border border-[#C7C8C6]"
            )}
          >
            <span className="font-heading font-semibold block">{getDayName(date).slice(0, 3)}</span>
            <span className="text-xs opacity-70 block">{formatDate(date, "MMM d")}</span>
          </button>
        ))}
      </div>

      {/* Single day column */}
      <div
        className={cn(
          "relative rounded-lg border w-full",
          selectedDay === today
            ? "border-[#FFD115] bg-[#FFFEF5]"
            : "border-[#C7C8C6] bg-white"
        )}
        style={{ height: "500px" }}
      >
        {/* Hour grid lines */}
        {HOUR_LABELS.map((label) => (
          <div
            key={label}
            className="absolute w-full border-t border-[#F0F0EF] flex items-center"
            style={{ top: `${timePercent(label)}%` }}
          >
            <span className="text-[10px] text-[#C7C8C6] pl-1 leading-none -translate-y-1/2">
              {label}
            </span>
          </div>
        ))}

        {/* Lunch block */}
        <div
          className="absolute w-full bg-[#F7F7F7] border-y border-[#EBEBEA] flex items-center justify-center"
          style={{ top: `${lunchTop}%`, height: `${lunchHeight}%` }}
        >
          <span className="text-[10px] text-[#C7C8C6] font-medium">Lunch</span>
        </div>

        {/* Tasks for the selected day */}
        {tasks
          .filter((t) => t.scheduledSlot?.day === selectedDay)
          .map((task) => {
            if (!task.scheduledSlot) return null;
            const top = timePercent(task.scheduledSlot.start);
            const height =
              timePercent(task.scheduledSlot.end) -
              timePercent(task.scheduledSlot.start);
            const meta = CATEGORY_META[task.category];
            const isDone = task.status === "done";
            return (
              <div
                key={task.id}
                className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 overflow-hidden cursor-pointer transition-opacity"
                style={{
                  top: `${top}%`,
                  height: `${Math.max(height, 4)}%`,
                  backgroundColor: meta.bg,
                  borderLeft: `3px solid ${meta.color}`,
                  opacity: isDone ? 0.5 : 1,
                }}
                title={`${task.title}\n${task.scheduledSlot.start}–${task.scheduledSlot.end}`}
              >
                <p
                  className="text-[10px] font-medium leading-tight truncate"
                  style={{ color: meta.text }}
                >
                  {isDone ? "✓ " : ""}
                  {task.title}
                </p>
                {height > 8 && (
                  <p className="text-[9px] opacity-60" style={{ color: meta.text }}>
                    {task.scheduledSlot.start}–{task.scheduledSlot.end}
                  </p>
                )}
              </div>
            );
          })}
      </div>
    </div>

    {/* Desktop 5-day grid — hidden below lg */}
    <div className="hidden lg:block overflow-x-auto">
      <div className="min-w-[700px]">
        {/* ... all existing grid content goes here unchanged ... */}
      </div>
    </div>

  </div>
);
```

The "existing grid content" comment above means the full existing inner JSX starting from `{/* Day headers */}` down to the closing `</div>` of `min-w-[700px]` is moved inside the `hidden lg:block` wrapper. Do not duplicate this markup — move it.

#### Gotchas for WeekGrid.tsx

- The mobile day column uses `height: "500px"` (inline style) instead of the desktop `660px`. This is intentional — it fits a phone screen without requiring vertical scrolling inside the grid. The hour grid lines and task positions still use `timePercent()` percentages, which are correct regardless of the container height.
- The day tab selector row uses `overflow-x-auto` with `flex-shrink-0` on each button so all 5 day tabs are accessible without wrapping, even on 320px screens.
- `selectedDay` is initialised from `days`, which is derived from `mondayISO`. If `mondayISO` changes (it won't mid-session, but theoretically), `selectedDay` would be stale. This is acceptable for this use case.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/app/week/entry/page.tsx`

Three targeted changes.

#### Change 1 — Page header row (line 114)

Current:
```tsx
<div className="flex items-start justify-between">
```

Replace with:
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
```

#### Change 2 — Page title (line 116)

Current:
```tsx
<h1 className="font-heading text-3xl font-bold text-[#080D00]">Weekly Plan</h1>
```

Replace with:
```tsx
<h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">Weekly Plan</h1>
```

#### Change 3 — Task form inner grid (line 211)

Current:
```tsx
<div className="grid grid-cols-2 gap-4 mt-4">
```

Replace with:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
```

The two `col-span-2` divs inside this grid (title field at line 213, blocks field at line 296, notes field at line 312) must also be updated:

Current (all three instances):
```tsx
<div className="col-span-2">
```

Replace with:
```tsx
<div className="sm:col-span-2">
```

There are exactly three `col-span-2` divs inside the task form: wrapping the title `Input`, the blocks `Textarea`, and the notes `Textarea`. All three need the `sm:` prefix. A bare `col-span-2` inside a `grid-cols-1` is harmless but semantically incorrect; guard it.

#### Change 4 — Bottom save button wrapper (line 341)

Current:
```tsx
<div className="flex justify-end pt-2">
```

Replace with:
```tsx
<div className="flex justify-end sm:justify-end pt-2">
```

No visual change on desktop. On mobile `justify-end` already right-aligns the button, which is acceptable. If full-width mobile save button is desired, replace with:
```tsx
<div className="flex pt-2">
  <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto">
```

The PRD notes this as optional polish. Implement the full-width variant for a better mobile experience.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/app/daily/entry/page.tsx`

Three targeted changes.

#### Change 1 — Page header row (line 145)

Current:
```tsx
<div className="flex items-start justify-between">
```

Replace with:
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
```

#### Change 2 — Page title (line 147)

Current:
```tsx
<h1 className="font-heading text-3xl font-bold text-[#080D00]">Daily Check-in</h1>
```

Replace with:
```tsx
<h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">Daily Check-in</h1>
```

#### Change 3 — Bottom save button (line 307)

Current:
```tsx
<div className="flex justify-end">
  <Button onClick={handleSave} disabled={saving} size="lg">
```

Replace with:
```tsx
<div className="flex justify-end">
  <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto">
```

The task note `<input>` on line 279 is a bare `<input>` element (not using the `Input` component). It already has `text-xs` (12px), which will trigger iOS Safari zoom. This is addressed in Phase 3 via `globals.css`.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/app/review/entry/page.tsx`

Three targeted changes.

#### Change 1 — Page header row (line 96)

Current:
```tsx
<div className="flex items-start justify-between">
```

Replace with:
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
```

#### Change 2 — Page title (line 98)

Current:
```tsx
<h1 className="font-heading text-3xl font-bold text-[#080D00]">Weekly Review</h1>
```

Replace with:
```tsx
<h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">Weekly Review</h1>
```

#### Change 3 — Stats grid inside the dark card (line 111)

Current:
```tsx
<div className="grid grid-cols-4 gap-4 mb-4">
```

Replace with:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
```

The four stat values inside this grid (`completionPct`, `doneTasks.length`, `doneHours`, `blockedTasks.length`) use `text-2xl`. On mobile with a 2-column layout, `text-2xl` is fine. No font-size change needed here.

#### Change 4 — Bottom save button (line 261)

Current:
```tsx
<div className="flex justify-end">
  <Button onClick={handleSave} disabled={saving} size="lg">
```

Replace with:
```tsx
<div className="flex justify-end">
  <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto">
```

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/app/history/page.tsx`

Two targeted changes.

#### Change 1 — Page title (line 61)

Current:
```tsx
<h1 className="font-heading text-3xl font-bold text-[#080D00]">History</h1>
```

Replace with:
```tsx
<h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#080D00]">History</h1>
```

#### Change 2 — Week card header row (line 97)

Current:
```tsx
<div className="flex items-start justify-between">
```

Replace with:
```tsx
<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
```

This causes the completion percentage block (right side) to stack below the week title (left side) on mobile. Both blocks are already internally coherent, so no changes to their inner content are needed.

#### Gotcha for history/page.tsx

The title + badge row inside the left block uses `flex items-center gap-2`. On very narrow screens (320px), the "Current" and "Reviewed" badges may push onto a new line. This is acceptable — `flex` will wrap naturally. No change needed.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/app/globals.css`

One addition to fix iOS Safari auto-zoom on form inputs.

#### Change — Add mobile font-size override after the existing `body` block

Append the following at the end of the file, after the `::-webkit-scrollbar-thumb:hover` rule:

```css
/* Prevent iOS Safari from auto-zooming on form input focus.
   iOS zooms when font-size is below 16px. This targets mobile only. */
@media screen and (max-width: 767px) {
  input,
  select,
  textarea {
    font-size: 16px;
  }
}
```

This is the only place in the project that should use a custom `@media` query. All other responsive changes use Tailwind breakpoint prefixes directly on elements. This CSS rule is acceptable as an exception because it targets a browser rendering quirk that cannot be addressed via Tailwind utility classes (which are component-scoped, while this needs to be global).

Do not add `!important` to these rules. The specificity of `input`, `select`, `textarea` selectors is sufficient to override the `text-sm` Tailwind class because this rule applies only within the `@media` block.

---

## Phase 3 — Polish

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/components/ui/input.tsx`

The `Input` component uses `text-sm` (14px) in its base class string. The global CSS fix in `globals.css` already handles the iOS zoom issue, but for completeness add a responsive class override.

#### Change — Add `text-base` for mobile to the input base class

Current (line 10):
```tsx
"flex h-9 w-full rounded-md border border-[#C7C8C6] bg-white px-3 py-1 text-sm text-[#080D00] placeholder:text-[#686B63] focus:outline-none focus:ring-2 focus:ring-[#FFD115] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
```

Replace with:
```tsx
"flex h-9 w-full rounded-md border border-[#C7C8C6] bg-white px-3 py-1 text-base sm:text-sm text-[#080D00] placeholder:text-[#686B63] focus:outline-none focus:ring-2 focus:ring-[#FFD115] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
```

`text-base` (16px) on mobile, `sm:text-sm` (14px) restores the original size at 640px and above. This Tailwind-level fix is the correct approach. The CSS global rule in `globals.css` serves as a fallback safety net.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/components/ui/textarea.tsx`

Same iOS zoom fix as `input.tsx`.

#### Change — Add `text-base` for mobile to the textarea base class

Current (line 9):
```tsx
"flex min-h-[80px] w-full rounded-md border border-[#C7C8C6] bg-white px-3 py-2 text-sm text-[#080D00] placeholder:text-[#686B63] focus:outline-none focus:ring-2 focus:ring-[#FFD115] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors",
```

Replace with:
```tsx
"flex min-h-[80px] w-full rounded-md border border-[#C7C8C6] bg-white px-3 py-2 text-base sm:text-sm text-[#080D00] placeholder:text-[#686B63] focus:outline-none focus:ring-2 focus:ring-[#FFD115] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors",
```

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/components/ui/button.tsx`

The `default` size variant uses `h-9` (36px height). The minimum recommended touch target on mobile is 44px. This is a judgment call — the button height is below the 44px minimum but the `px-4` horizontal padding provides a large enough tap area in most cases.

To meet the strict 44px minimum without changing the visual size on desktop, add a responsive height to the default size variant:

#### Change — Update `default` size in `buttonVariants`

Current (line 19):
```tsx
default: "h-9 px-4 py-2",
```

Replace with:
```tsx
default: "h-11 sm:h-9 px-4 py-2",
```

`h-11` is 44px. On mobile all default-size buttons will be 44px tall. On `sm` and above they return to 36px. This is a global change that affects every `<Button>` in the app with `size="default"` (which is the implicit default). Verify visually that this does not break any layouts before committing.

If any header layout looks broken because buttons are taller on mobile, the stacking layout added in Phase 2 (header `flex-col` on mobile) provides the vertical space to absorb the taller button.

---

### `/Users/rodrigo.seoane/local-sites/design_daily_records/My_Rituals/components/ui/card.tsx`

`CardHeader` and `CardContent` both use `p-5` as their base padding (lines 17 and 43 respectively). On mobile, this is 20px of padding on each side — consuming 40px of horizontal space on a 320px viewport. Reducing to `p-3` on mobile (12px) recovers 16px per side.

#### Change 1 — `CardHeader` base class (line 17)

Current:
```tsx
<div ref={ref} className={cn("flex flex-col space-y-1 p-5", className)} {...props} />
```

Replace with:
```tsx
<div ref={ref} className={cn("flex flex-col space-y-1 p-3 sm:p-5", className)} {...props} />
```

#### Change 2 — `CardContent` base class (line 43)

Current:
```tsx
<div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
```

Replace with:
```tsx
<div ref={ref} className={cn("p-3 sm:p-5 pt-0", className)} {...props} />
```

#### Gotcha for card.tsx

Every page that overrides `CardContent` padding with an explicit class (e.g., `py-3 px-4`, `py-4`, `pt-5`, `py-0 pb-3`) passes those classes via `className` prop. The `cn()` merge means the explicit class wins over the base class. These page-level overrides do not need to change — `twMerge` inside `cn()` correctly drops the base `p-3 sm:p-5` when an explicit padding is passed via `className`. Verify each card visually to confirm no double-padding.

---

## Implementation Notes

### Tailwind v4 Breakpoint Reminder

In Tailwind v4, breakpoint prefixes are still mobile-first. `sm:` means "at 640px and above". The project's `globals.css` uses `@theme inline` for custom tokens; no custom breakpoints need to be added. The defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`) are sufficient.

### Class Application Order in `cn()`

The project uses `cn()` from `lib/utils.ts` which wraps `clsx` + `twMerge`. When adding responsive variants to component base classes, the mobile-first class must appear before the breakpoint-prefixed override in the string. For example: `"text-base sm:text-sm"` — `text-base` sets the mobile default; `sm:text-sm` overrides at 640px. `twMerge` handles deduplication correctly when both class names conflict (`text-base` vs `text-sm` are both in the `fontSize` group, so only the last one applied wins per breakpoint).

### The Bare `<input>` in `app/daily/entry/page.tsx`

Line 279 of `app/daily/entry/page.tsx` is a bare `<input>` element (not the `<Input>` UI component). It has hardcoded `text-xs` in its `className` string. The global CSS rule in `globals.css` covers this element. If a Tailwind-level fix is preferred, change `text-xs` to `text-base sm:text-xs` on that specific element.

### No New Files Required

This entire feature is implemented through modifications to existing files only. No new components, no new hooks, no new utility files.

### Desktop Visual Regression Check

After implementing all phases, verify the following on a 1280px viewport to confirm zero regressions:
- Sidebar is visible and navigation works
- Dashboard shows 4-column stats grid
- Dashboard shows 3-column content grid (2+1 split)
- WeekGrid shows the full 5-day view (not the day selector)
- All form headers show title and button side-by-side
- Weekly Plan task form shows 2-column grid inside expanded tasks
- No buttons are unexpectedly taller than their desktop sizes (the `h-11 sm:h-9` button change is the one to verify)

---

## Testing Requirements

No automated test files exist in this project. All testing is manual via browser DevTools responsive mode.

### Viewport Test Matrix

Test each of the following pages at each viewport width below:

| Viewport | Pages to Test |
|----------|---------------|
| 320px | Dashboard, Weekly Plan, Daily Check-in, Weekly Review, History |
| 375px | Dashboard, Weekly Plan, Daily Check-in, Weekly Review, History |
| 768px | Dashboard, WeekGrid section |
| 1024px | Dashboard (breakpoint where sidebar appears) |
| 1280px | All pages (desktop regression) |

### Interaction Test Cases

1. At 375px: Tap hamburger icon -> drawer slides in from left -> tap a nav link -> drawer closes automatically -> correct page is loaded.
2. At 375px: Tap hamburger icon -> tap the dark backdrop overlay -> drawer closes without navigation.
3. At 375px on Dashboard: WeekGrid shows day-selector tabs -> tap each day tab -> tasks for that day appear -> no horizontal overflow of the page.
4. At 375px on iOS Safari: Tap any form input -> verify the viewport does not zoom in.
5. At 1024px: Sidebar is always visible without hamburger -> `pt-14` top padding is not present -> content starts at the top of the viewport.
6. At 375px: Weekly Plan, Daily Check-in, Weekly Review all show "Save" button as full-width.
7. At 320px: History page week cards stack completion percentage below the week title -> no horizontal overflow.

### Browser Targets

- Chrome (DevTools device emulation)
- Safari on iOS 16+ (real device preferred; browser stack acceptable)
- Firefox (DevTools responsive mode)
