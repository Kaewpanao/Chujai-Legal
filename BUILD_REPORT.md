# Chujai Legal — Build Report (Phase 1: Foundation)

**Date:** 2026-08-13
**Scope:** Foundation + Route Groups + Design System + Legal Data Layer + Marketing Landing
**Stack:** Next.js 16.3.0 (App Router, Turbopack) · React 19.2.8 · Tailwind CSS v4 · TypeScript 5
**Build status:** ✅ `npm run build` — compiled successfully, 0 errors, 0 type errors

---

## 1. What was built

### Route Groups (App Router shells)
| File | Purpose |
|------|---------|
| `app/(marketing)/layout.tsx` | Public marketing shell — sticky header (brand + nav + login/CTA), footer with link columns + PDPA disclaimer |
| `app/(consumer)/layout.tsx` | Consumer app shell — desktop sidebar + topbar + mobile bottom nav |
| `app/(lawyer)/layout.tsx` | Lawyer app shell — same structure, "ทนาย" role badge |
| `app/(admin)/layout.tsx` | Admin shell — "Admin" badge, admin nav set |

### Design System (`components/ui/`)
| Component | Variants / API |
|-----------|----------------|
| `button.tsx` | `primary` / `secondary` / `ghost` / `danger` / `upgrade` / `outline` · `sm`/`md`/`lg` |
| `card.tsx` | `base` / `hover` / `urgent` / `free` / `locked` + Header/Title/Description/Content/Footer |
| `input.tsx` | `base` / `error` / `success`, inline error message with `aria-invalid` |
| `badge.tsx` | `default` / `success` / `warning` / `danger` / `neutral` / `info` + optional emoji icon |
| `progress.tsx` | value/max/label/showValue, 4 colors, ARIA `progressbar` |
| `avatar.tsx` | initials fallback (Thai-aware) + optional image, `sm`/`md`/`lg` |

### Shared Layout Components (`components/layout/`)
- `sidebar.tsx` — client component, `usePathname` active highlighting, brand/badge/footer slots
- `topbar.tsx` — title/subtitle, notification bell with unread count, avatar + role
- `bottom-nav.tsx` — mobile bottom nav (client, active highlighting, safe-area padding)

### Shared State Components (`components/shared/`)
- `empty-state.tsx` — warm empty state with optional CTA (Link-based, server-safe)
- `loading-spinner.tsx` — accessible spinner with ARIA `status`
- `legal-disclaimer.tsx` — warm PDPA/disclaimer banner

### Legal Data Layer (`lib/`)
| File | Contents |
|------|----------|
| `lib/legal/categories.ts` | **12 categories** — id, number, title, icon, hint, description, social-proof count, accent color, sub-problems, keywords. Helpers: `getCategoryById`, `getCategoryByNumber`, `TOTAL_CASES_HELPED` |
| `lib/legal/guardrails.ts` | **15 safety rules** — severity (must-never/must-always/should-always/should-avoid), domain (legal-safety/tone/privacy/accuracy/process), wrong/right examples |
| `lib/legal/fear-calibration.ts` | **4 fear levels** — panic/urgent/concerned/planning with emoji, urgency badge, accent, tone rules, response style, urgency window |
| `lib/packages/definitions.ts` | **4 tiers** — Free / Action Pack (฿299) / Case Plus (฿999) / SME (฿2,990/mo) + full 17-row comparison matrix |
| `lib/utils.ts` | `cn`, `formatNumber`, `formatBaht`, `formatCompactNumber`, Thai `initials` |

### Config
- `config/navigation.ts` — central nav definitions (`MARKETING_NAV`, `CONSUMER_NAV`, `LAWYER_NAV`, `ADMIN_NAV`) shared by all three layout components.

### Marketing Landing (`app/(marketing)/page.tsx`)
Sections (all warm-toned, Thai):
1. **Hero** — gradient + search box + empathetic reassurance line
2. **Stats** — cases helped / users / rating / savings
3. **Categories** — 12 legal categories from data layer
4. **Features** — 6 core capabilities
5. **How it works** — 3 steps
6. **Pricing** — 4 tiers from package definitions
7. **Social proof** — 3 testimonials with avatars
8. **CTA banner** + legal disclaimer

### Loading / Error / Not-found states
- `app/loading.tsx` — root loading spinner
- `app/error.tsx` — root error boundary (client, warm copy + retry)
- `app/not-found.tsx` — 404 page
- `app/(marketing)/loading.tsx` — marketing skeleton
- `app/(marketing)/error.tsx` — marketing error boundary (client)

---

## 2. Design tokens

Added a Tailwind v4 `@theme` block to `app/globals.css` mapping LegalAI colors to
utilities (`bg-blue`, `text-ink`, `border-line`, `bg-canvas`, etc.):

```
--color-blue: #2563eb      --color-ink: #1c2231     --color-green: #0f9f6e
--color-blue-dark: #1746b3 --color-muted: #6b7280   --color-amber: #e88a08
--color-blue-50: #eff6ff   --color-line: #e8eaed    --color-red: #dc3e4b
--color-canvas: #f2f3f5
```

Plus `.gradient-blue` / `.gradient-blue-soft` utility classes for the brand gradient.
Font: Kanit (already wired in root `layout.tsx` via `next/font/google`).

---

## 3. Verification

- ✅ `npm run build` — **exit 0**, "Compiled successfully", TypeScript finished clean, all static pages generated.
- ✅ Runtime smoke test — `next start` → `GET /` returns **HTTP 200**, ~135 KB HTML.
- ✅ Landing sections confirmed in rendered HTML (hero, categories, pricing, how-it-works, social proof, reassurance).
- ✅ Tailwind `@theme` tokens confirmed in compiled CSS (`.bg-blue`, `.bg-canvas`, `.text-ink` present).

---

## 4. Files created / modified

**Created (25 files):**
- `app/(marketing)/layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`
- `app/(consumer)/layout.tsx`
- `app/(lawyer)/layout.tsx`
- `app/(admin)/layout.tsx`
- `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`
- `components/ui/button.tsx`, `card.tsx`, `input.tsx`, `badge.tsx`, `progress.tsx`, `avatar.tsx`
- `components/layout/sidebar.tsx`, `topbar.tsx`, `bottom-nav.tsx`
- `components/shared/empty-state.tsx`, `loading-spinner.tsx`, `legal-disclaimer.tsx`
- `lib/utils.ts`
- `lib/legal/categories.ts`, `guardrails.ts`, `fear-calibration.ts`
- `lib/packages/definitions.ts`
- `config/navigation.ts`

**Modified:**
- `app/globals.css` — added `@theme` tokens + gradient utility classes

**Removed:**
- `app/page.tsx` — superseded by `app/(marketing)/page.tsx` (both would otherwise map to `/`)

---

## 5. Notes & decisions

1. **Route collision resolution** — Route groups `(marketing)`, `(consumer)`, `(lawyer)`, and
   `(admin)` all live at the app root, so a `page.tsx` in each would collide on `/`. Only the
   marketing group gets a `page.tsx` in this phase (landing → `/`). The consumer/lawyer/admin
   groups provide **shell layouts only**; their index pages (consumer home, lawyer dashboard,
   admin overview) are intentionally deferred to later phases, where consumer pages will live at
   distinct paths (`/search`, `/documents`, `/concierge`, …) and the consumer home will be routed
   behind auth/middleware.

2. **Color palette** — Per the task instruction, the design system uses the **LegalAI** palette
   (`--blue #2563eb` etc.) rather than the blush-pink palette described in Master Design §F.2.
   The warm, empathetic tone rules and fear-calibration logic are preserved from §F.5 / §B.2.

3. **Thai-first** — All copy is Thai with warm tone ("เราเข้าใจ", "เราช่วยได้", "คุณไม่ได้อยู่คนเดียว"),
   per §F.5. Emoji used for warmth per §F.4.

4. **Data-layer source** — Category sub-problems and package features are transcribed from Master
   Design §C.1/§D.2 and §Appendix C; guardrails from §B.1 (7 safety rules) expanded to 15.

5. **Pre-existing server note** — a server was already listening on port 3000 before this work
   began (PID 23180, not started by this task). The build and the runtime smoke test both succeeded
   independently of it.
