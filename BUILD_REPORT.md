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

---

# Phase 2: Consumer App — 10 Core Pages

**Date:** 2026-08-13
**Scope:** Consumer home + search + diagnosis (8-phase) + concierge (8-phase) + documents + tax + lawyers + profile + pricing + notifications
**Build status:** ✅ `npm run build` — 0 errors, 0 type errors, 14 static pages generated
**Runtime:** ✅ `next start` → all 10 pages return HTTP 200; content spot-checks pass

## Routing decision (documented)

`app/(marketing)/page.tsx` already owns `/` (the landing page). `app/(consumer)/page.tsx`
would collide with it on `/` and fail the build ("two parallel pages resolving to the same path").
Resolution: the consumer home dashboard lives at **`/home`** (`app/(consumer)/home/page.tsx`) and
`CONSUMER_NAV` "หน้าหลัก" now points to `/home`. All other consumer pages live at their own
distinct paths (`/search`, `/diagnosis`, `/concierge`, `/documents`, `/tax`, `/lawyers`,
`/profile`, `/pricing`, `/notifications`). This mirrors the Phase 1 note that the consumer home
would be "routed behind auth/middleware" — pending a real middleware, `/home` is the working index.

## Pages built (all under `app/(consumer)/`)

| Page | Route | Type | Key states |
|------|-------|------|------------|
| Home dashboard | `/home` | Server | welcome + fear-calibration entry, search box → `/search`, 12-category grid, active cases, social proof |
| AI search | `/search` | Client | idle / loading spinner / result (answer + sources + next steps) / error; document sidebar; disclaimer |
| Diagnosis wizard | `/diagnosis` | Client | 8-phase progress, 4 fear levels, category → questions → AI analysis (loading/error/success) |
| Concierge flow | `/concierge` | Client | 8-phase container, monetization gate at phase 3 (locks 4–8 on free plan) |
| Document library | `/documents` | Client | search + 10 category grid + cards; loading / empty / error |
| Tax calculator | `/tax` | Client | income + deduction checkboxes → result card; loading / error; brackets; cite รัษฎากร |
| Lawyer marketplace | `/lawyers` | Client | search + specialty/province/sort filters; neutral (no ranking); loading / empty / error |
| Profile | `/profile` | Client | info form (save confirm), package display, settings tabs; loading / error |
| Pricing | `/pricing` | Server | 4 tier cards + 17-row comparison table from `lib/packages/definitions.ts` |
| Notifications | `/notifications` | Client | filter tabs (all/unread/case/system), mark-read, empty / loading / error |

## New data modules

| File | Purpose |
|------|---------|
| `lib/legal/sources.ts` | 9 real Thai law sources + `sourceForCategory()` + `cite()` — backs every citation |
| `lib/legal/search.ts` | `matchCategory()` keyword matcher + `buildSearchResult()` warm sourced mock answer |
| `lib/legal/tax.ts` | 8 progressive brackets, 10 deductions, `calculateTax()` |
| `lib/documents/categories.ts` | 10 document categories + 12 templates |
| `lib/lawyers.ts` | 8 neutral lawyer profiles + specialty/province helpers |

## Guardrail compliance

- Every legal claim cites a registered source (`ป.อาญา ม.341`, `ป.พ.พ. ม.420`, `พ.ร.บ.คุ้มครองแรงงาน ม.118`, etc.) — no fabricated sections.
- "No lawyer ranking" — marketplace is neutral (user-chosen sort), with an explicit neutral notice.
- "Warn perjury" — concierge phase 7 shows the มาตรา 177 warning.
- AI disclosure + legal disclaimer present on search/diagnosis/concierge/documents/tax/lawyers.
- Warm, empathetic Thai copy throughout ("เราเข้าใจ", "คุณไม่ได้อยู่คนเดียว").

## Files created / modified

**Created (15 files):**
- `app/(consumer)/home/page.tsx`, `search/page.tsx`, `diagnosis/page.tsx`, `concierge/page.tsx`,
  `documents/page.tsx`, `tax/page.tsx`, `lawyers/page.tsx`, `profile/page.tsx`,
  `pricing/page.tsx`, `notifications/page.tsx`
- `lib/legal/sources.ts`, `lib/legal/search.ts`, `lib/legal/tax.ts`,
  `lib/documents/categories.ts`, `lib/lawyers.ts`

**Modified:**
- `config/navigation.ts` — consumer nav: หน้าหลัก → `/home`, added วินิจฉัย/ภาษี/ทนายความ/ราคา/แจ้งเตือน

## Verification

- ✅ `npm run build` — exit 0, TypeScript clean, 14/14 static pages generated.
- ✅ Runtime: all 10 consumer routes return HTTP 200.
- ✅ Content spot-checks: `/home` (categories, cases), `/pricing` (Action Pack/Case Plus/SME),
  `/search` (heading + doc sidebar), `/diagnosis` (phases), `/tax` (รัษฎากร), `/lawyers` (heading).

---

# Phase 4 + 5: API Routes + Integration Layer

**Date:** 2026-08-13
**Scope:** AI / auth / cases / documents / payments / tax API routes + AI provider (DeepSeek) + Supabase clients + LINE & Omise integrations
**Build status:** ✅ `npm run build` — 0 errors, 0 type errors, 16 API routes registered
**Runtime:** ✅ `next start` → all routes smoke-tested; graceful fallback verified (no env keys set)

## Design decision — zero new dependencies

The project ships **no `@supabase/supabase-js`, `@ai-sdk/*`, or Omise/LINE SDKs**.
Every integration is a thin **native `fetch`** wrapper. Rationale: keeps `npm run build`
hermetic (no network install), and every wrapper degrades to a deterministic local
mock when its env key is unset — so the whole API layer runs end-to-end offline.

## API routes built (`app/api/`)

| Route | Method | Behavior |
|-------|--------|----------|
| `/api/ai/diagnose` | POST | Case answers → DeepSeek → legal analysis (summary, rights, options, urgentSteps, sources). Guardrail-checked; falls back to a source-cited analysis from the legal data layer |
| `/api/ai/search` | POST | Free-text query → DeepSeek → answer + sources + next steps; falls back to `buildSearchResult()` |
| `/api/ai/generate` | POST | Template + merge fields → DeepSeek-polished document; falls back to merged template |
| `/api/ai/assistant` | POST | Multi-turn chat with context; canned warm reply when unconfigured |
| `/api/auth/login` | POST | Email/password via Supabase GoTrue; sets `chujai-access-token`/`refresh-token` cookies; mock demo session fallback |
| `/api/auth/register` | POST | Supabase signup; mock fallback |
| `/api/auth/line` | GET | LINE Login: redirects to OAuth URL, or exchanges `code` → profile → session; mock fallback |
| `/api/cases` | GET/POST | List / create cases (Supabase `cases` table or in-memory mock store) |
| `/api/cases/[caseId]` | GET/PUT/DELETE | CRUD one case |
| `/api/documents/generate` | POST | Merge template + persist document (AI polish optional) |
| `/api/documents/[docId]` | GET | Fetch one document |
| `/api/payments/create` | POST | Omise PromptPay source + charge (QR); mock intent fallback |
| `/api/payments/webhook` | POST | Verify Omise webhook (HMAC when `OMISE_WEBHOOK_SECRET` set) → update payment status |
| `/api/payments/verify` | POST | Retrieve charge status (Omise or mock) |
| `/api/tax/calculate` | POST | `calculateTax()` + brackets + cites ประมวลรัษฎากร ม.40/47 |
| `/api/tax/optimize` | POST | DeepSeek deduction suggestions; rule-based fallback from `TAX_DEDUCTIONS` |

## Integration layer (`lib/`)

| File | Purpose |
|------|---------|
| `lib/ai/deepseek.ts` | DeepSeek client (`chat`, `generate`, `parseJsonFromText`) — real OpenAI-compatible call, `AbortSignal.timeout`, typed `DeepSeekError`, `live`/`fallbackReason` result |
| `lib/ai/prompt.ts` | System prompt (warm Thai + guardrail block + fear-calibration tone) + diagnosis/search/document/assistant/tax prompt builders |
| `lib/legal/guardrails-check.ts` | Runtime checker: regex-maps must-never violations (outcome prediction, false promise, direct advice, lawyer ranking, fabricated citations) → `{ violations, blocked }` |
| `lib/supabase/rest.ts` | Fetch-based Supabase core (GoTrue auth + PostgREST CRUD), `{ data, error }` result envelope, `not_configured` sentinel |
| `lib/supabase/client.ts` | Browser client (`NEXT_PUBLIC_*`) |
| `lib/supabase/server.ts` | Server client (service-role key preferred) |
| `lib/supabase/middleware.ts` | `updateSession()` auth middleware helper (cookie refresh; no-op when unconfigured) |
| `lib/line/notify.ts` | LINE Messaging API (`pushMessage`/`replyMessage`/`broadcast`) + LINE Login helpers (`buildLineAuthUrl`/`exchangeLineCode`) |
| `lib/payments/omise.ts` | Omise wrapper: PromptPay source, charge, retrieve, HMAC webhook verify; mock fallbacks |
| `lib/documents/templates.ts` | 12 real Thai legal-document bodies with `{{field}}` placeholders |
| `lib/documents/merge.ts` | Merge engine + standard disclaimer + unresolved-field tracking |
| `lib/mock/store.ts` | In-memory mock store (cases / documents / payments) for offline dev |
| `lib/api.ts` | Shared route helpers (`json`, `error`, `unauthorized`, `readJson`, `bearerToken`) |

## Guardrail compliance

- Every AI route runs `checkGuardrails()` on the model output and **blocks** on any
  must-never violation (substitutes a safe data-layer answer).
- Every generated document appends the "ไม่ใช่คำปรึกษาทางกฎหมาย" disclaimer (always-disclaimer).
- Every legal claim is source-cited (ป.อาญา, ป.พ.พ., พ.ร.บ.คุ้มครองแรงงาน, ประมวลรัษฎากร, …) — no fabricated sections.
- Police-report template embeds the ป.อาญา ม.177 (แจ้งความเท็จ) warning (warn-perjury).
- Thai-first, warm, empathetic copy throughout.

## Files created / modified

**Created (24 files):**
- `app/api/ai/{diagnose,search,generate,assistant}/route.ts`
- `app/api/auth/{login,register,line}/route.ts`
- `app/api/cases/route.ts`, `app/api/cases/[caseId]/route.ts`
- `app/api/documents/generate/route.ts`, `app/api/documents/[docId]/route.ts`
- `app/api/payments/{create,webhook,verify}/route.ts`
- `app/api/tax/{calculate,optimize}/route.ts`
- `lib/ai/deepseek.ts`, `lib/ai/prompt.ts`
- `lib/legal/guardrails-check.ts`
- `lib/supabase/{rest,client,server,middleware}.ts`
- `lib/line/notify.ts`, `lib/payments/omise.ts`
- `lib/documents/templates.ts`, `lib/documents/merge.ts`
- `lib/mock/store.ts`, `lib/api.ts`, `.env.example`

**Modified:** none (purely additive).

## Verification

- ✅ `npm run build` — exit 0, TypeScript clean; all 16 API routes registered as `ƒ` (dynamic).
- ✅ Runtime smoke tests (no env keys → full mock/fallback path):
  - `/api/ai/search` → sourced Thai answer + next steps
  - `/api/ai/diagnose` → fear-calibrated summary + rights + sources
  - `/api/tax/calculate` → correct progressive tax (600k → ฿6,549.95)
  - `/api/auth/login` + `/register` → mock sessions
  - `/api/payments/create` → mock PromptPay intent + QR
  - `/api/documents/generate` → merged document (unresolved fields tracked)
  - `/api/cases` GET/POST + DELETE, `/api/documents/[docId]` GET, `/api/payments/webhook` → all 200

## Notes

1. **Auth is "soft" on data routes** — cases/documents read an optional bearer token /
   cookie to tag `userId`, but don't hard-block unauthenticated requests, so the API
   stays usable without Supabase. Route-level RBAC is a later phase.
2. **`params` are Promises** in Next 16 — all dynamic routes `await params` (breaking
   change vs. Next 14/15 sync params).
3. **`server-only` package is not installed**, so `lib/supabase/server.ts` documents its
   server-only contract via a comment instead of a hard import.
4. **`next start` runs on 127.0.0.1** — the default `::` (IPv6) bind fails with
   `EADDRNOTAVAIL` in this Windows environment; use `-H 127.0.0.1`.
