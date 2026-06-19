# GM Group — QA Report

**Scope:** full exercise of the unified Next.js demo (`apps/web`) on `main`.
**Date:** 2026-06-19 · **Tester:** QA pass (automated Playwright + direct API + manual reasoning).
**Environment:** Windows 11 · Node v24.14.0 · pnpm 11.6.0 · Next 16.2.9 (Turbopack) · React 19.2.4.
**Method:** production build (`next build` + `next start -p 3000`), exercised headless with
Playwright (Chromium 1.61) from a scratch dir (`c:/tmp/pwcheck`, never touched the repo lockfile).
APIs hit directly with `curl`/`page.request` (deterministic, key-independent).

> **Verdict: PASS.** Build/lint/typecheck green; all routes render and are interactive with **no
> AI key**; maps render; the 3 demos work deterministically; deck + Demo-AI menu behave per spec.
> 2 minor a11y issues found **and fixed** (section-owned code). 1 low-severity responsive finding
> left **open** because it lives in the shared zone (see §6).

---

## 0. How testing was set up (reproducibility note)

- `apps/web/.env.local` ships with a **real `AI_API_KEY`** (provider `deepseek`). The checklist
  requires verifying the **no-key deterministic path** (the demo's core guarantee), so the env file
  was temporarily moved aside, the no-key suite was run, and the file was **restored** afterwards.
  The live-LLM path was intentionally **not** POST-tested to avoid spending the owner's API credits;
  the env *contract* was verified both ways via the key-free `GET` endpoints (see §4).
- Port 3000 was **free**; the served page `<title>` was confirmed to contain **“GM Group”** before
  every test run (port-3000 gotcha guarded).

---

## 1. Tooling / quality gates

| Check | Result | Notes |
|---|---|---|
| `pnpm install` | ✅ PASS | Clean, 6 workspace projects, no errors. |
| `pnpm build` (turbo) | ✅ PASS | Next 16.2.9 Turbopack, compiled in ~6.5s, **26 pages** generated, all routes present. |
| `pnpm lint` (turbo) | ✅ PASS | ESLint green across `ui`/`web`/`lib`. |
| `pnpm typecheck` (turbo) | ✅ PASS | `tsc --noEmit` green across packages (incl. after fixes). |

Build route table confirmed: `/`, `/_not-found`, `/solar`, `/solar/lead`, `/solar/analytics`,
`/mobility`, `/mobility/agent`, `/shop`, `/shop/[id]` (12 SSG PDPs), plus `ƒ` dynamic API routes
(`analytics`, `cable-finder`, `lead-qualifier`) and `○` `charging-points` (revalidate 1h).

## 2. Per-route smoke (production build, **no AI key**)

Detected rendered text via `innerText` (not `textContent`, per the not-found RSC false-positive note).

| Route | HTTP | Content | `data-theme` | one `<h1>` | header/main/footer | hydration | console |
|---|---|---|---|---|---|---|---|
| `/` (hub) | 200 | ✅ | `hub` | ✅ | ✅ | ✅ none | ✅ none |
| `/solar` | 200 | ✅ | `solar` | ✅ | ✅ | ✅ none | ✅ none |
| `/solar/lead` | 200 | ✅ | `solar` | ✅ | ✅ | ✅ none | ✅ none |
| `/solar/analytics` | 200 | ✅ | `solar` | ✅ *(after fix §5)* | ✅ | ✅ none | ✅ none |
| `/mobility` | 200 | ✅ | `mobility` | ✅ | ✅ | ✅ none | ✅ none |
| `/mobility/agent` | 200 | ✅ | `mobility` | ✅ | ✅ | ✅ none | ✅ none |
| `/shop` | 200 | ✅ | `shop` | ✅ | ✅ | ✅ none | ✅ none |
| `/shop/modo3-t2-trifase-liscio` | 200 | ✅ | `shop` | ✅ | ✅ | ✅ none | ✅ none |

**No React hydration errors (#418/#423/#425…), no error overlay, no console/page errors on any route.**
Theming matches the route on every page (no-flash inline script + ThemeProvider working).

## 3. Maps regression (were broken once — height collapsed to 0)

| Map | `.maplibregl-map` clientHeight | `<canvas>` | CARTO tiles | console |
|---|---|---|---|---|
| `/solar` (projects) | **430px** (>100 ✅) | ✅ 1 | ✅ **27 × HTTP 200**, 0 errors | ✅ none |
| `/mobility` (network) | **430px** (>100 ✅) | ✅ 1 | ✅ **12 × HTTP 200**, 0 errors | ✅ none |

✅ No regression. The documented fix (`h-full w-full` instead of `absolute inset-0`, so MapLibre's
forced `position:relative` doesn't collapse the box) holds. The container is `h-[60vh] min-h-[420px]`.

> ℹ️ **Test note (not a bug):** in the first broad pass the `/solar` tile assertion read *0 tiles*
> because its 2.5s settle window was too short for the heavier (video) page — a **false positive**.
> Re-run with a 6s window: **27 CARTO tiles @200**. The map always rendered (canvas + height OK).

## 4. The 3 demos **without** an AI key (deterministic path) + API contract

| Assertion | Result | Evidence |
|---|---|---|
| `lead`: “villetta a Novara, 4 in famiglia, …sera” ⇒ Monofase+Accumulo, `isOutOfScope=false` | ✅ | `recommendedProduct="Impianto Monofase + Batterie di Accumulo"`, `toolUsed="PS_Agent + Context Tool"` |
| `lead`: “consigliami un film di fantascienza” ⇒ `isOutOfScope=true` | ✅ | `toolUsed="Out-of-Scope Filter"`, status “Analisi Bloccata - Fuori Tema” |
| `analytics`: `scenarioId="fase1"` ⇒ `authorized=true`, `chartType="line"`, data non-empty | ✅ | `chartData.length=3` |
| `analytics`: `scenarioId="fase2"` (PIN/PII) ⇒ `authorized=false`, audit `BLOCKED` | ✅ | `auditTrail` status = `BLOCKED` |
| EV agent: welcome shows | ✅ | “Benvenuto a bordo…” rendered on load |
| EV agent: “quanto costa ricaricare?” ⇒ cost receipt | ✅ | receipt/“prospetto … costo complessivo” UI |
| EV agent: charging-time question ⇒ animated timer | ✅ | “entro 10 minuti … 150 kW”, live countdown + SoC |
| EV agent: off-topic (recipe) ⇒ guardrail | ✅ | “Non posso darti ricette di cucina…” deflection |
| `GET /api/lead-qualifier` ⇒ `{aiEnabled:boolean}` | ✅ | `{"aiEnabled":false}` (no key) |
| `GET /api/analytics` ⇒ `{aiEnabled:boolean}` | ✅ | `{"aiEnabled":false}` (no key) |
| `GET /api/cable-finder` | ✅ | `{"aiEnabled":false,"provider":null}` (no key) |
| `POST /api/cable-finder` with no key ⇒ 503 (UI falls back to wizard) | ✅ | HTTP 503 — by design; Shop shows deterministic wizard |
| `GET /api/charging-points` with no OCM key ⇒ curated fallback | ✅ | `source:"curated"`, 12 points (map never empty) |
| **Env contract both ways** | ✅ | key removed ⇒ `aiEnabled:false`; key restored ⇒ `aiEnabled:true`, `provider:"deepseek"` |

EV agent ran with **0 console/page errors** across all four flows.

## 5. UI / interaction

| Feature | Result | Evidence |
|---|---|---|
| Header “Demo AI” menu — `aria-expanded` toggles | ✅ | `false → true` on open |
| …lists exactly the 3 demos | ✅ | 3 `<a>` items (lead / analytics / agent) |
| …Esc closes / click-outside closes | ✅ | both close the menu |
| …navigates from a deep page (`/shop` → `/mobility/agent`) | ✅ | URL changed |
| …menu closes after navigation | ✅ | menu gone post-nav |
| Deck: `?deck=1` opens | ✅ | region “Regia della presentazione” visible |
| Deck: `Shift+D` opens | ✅ | toggles open |
| Deck: arrow keys **don’t** fire while typing in an input | ✅ | `ArrowRight` in chat input did **not** navigate |
| Deck: `←/→` walk stops | ✅ | `ArrowRight` (after blur) → `/solar/analytics` |
| Deck: Esc closes | ✅ | region removed |
| Shop: product cards render | ✅ | 12 product links |
| Shop: deterministic cable-finder present (no key) | ✅ | `#cable-finder` section present |
| Shop: PDP `/shop/[id]` loads | ✅ | renders with `<h1>` |
| Shop: cart add | ✅ | add-to-cart click, no crash |

## 6. Quality attributes

| Check | Result | Notes |
|---|---|---|
| `prefers-reduced-motion` honored | ✅ | `/solar` renders cleanly under emulated reduced motion, 0 errors |
| One `<h1>` per page | ✅ | after fix §7 (analytics had 2) |
| Landmarks (header/main/footer) | ✅ | present on all routes |
| Buttons have accessible names | ✅ | after fix §7 (EV agent send button was icon-only) |
| Keyboard reachable / focus | ✅ | menu + deck fully keyboard-operable; deck respects typing focus |
| 404 unknown route | ✅ | HTTP **404** + not-found content rendered |
| Mobile 390×844 — no scroll-trap | ✅ | `scrollX` maxes at **0** on `/`, `/solar`, `/mobility`, `/shop` — **no horizontal scrollbar** |
| Mobile 390×844 — nothing visually clipped | ⚠️ **FINDING** | header right cluster bleeds ~25px past a 390px viewport → see Finding F1 |

---

## 7. Fixes applied (small, low-risk, section-owned — not the shared zone)

Both verified on a fresh production rebuild; lint + typecheck still green.

### F-fix-1 — `/solar/analytics` had **two** `<h1>`
- **File:** `apps/web/components/solar/analytics/AnalyticsApp.tsx` (Solar-owned).
- **Was:** page section heading `<h1>Analytics che parlano la tua lingua</h1>` **plus** the framed
  ERP-window title `<h1>GM Charge Analytics v1.12-MVP</h1>` → two `<h1>` on one route.
- **Change:** demoted the ERP-window title (UI chrome inside the device frame) from `<h1>` to a
  styled `<div>`. Zero visual/runtime change; page now has a single `<h1>`.
- **Verified:** `h1` count = 1 (“Analytics che parlano la tua lingua”).

### F-fix-2 — `/mobility/agent` chat **send** button had no accessible name
- **File:** `apps/web/components/mobility/agent/DeviceSimulator.tsx` (Mobility-owned).
- **Was:** `<button type="submit">` containing only the `<Send>` icon → screen readers announce
  “button” with no label.
- **Change:** added `aria-label="Invia messaggio"` and `aria-hidden` on the decorative icon.
- **Verified:** unnamed-button count on `/mobility/agent` = 0.

---

## 8. Open finding (NOT fixed — lives in the SHARED zone, needs authorization)

### F1 — Header control cluster overflows narrow phones (~≤390px) — **Severity: LOW**
- **File:** `packages/ui/src/Header.tsx` — **shared zone** (`/components/ui` equivalent). Per
  `CLAUDE.md` / `NOTES-shared.md` ownership rules, the shared zone must not be modified unilaterally,
  so this is **reported, not patched**.
- **Symptom:** at a 390px (and narrower) viewport, the header’s right cluster (the Solar/Mobility/Shop
  segmented switcher + the “✨ Demo” button) is ~25px wider than the viewport. The **Demo AI button
  is clipped at the right edge** (chevron + right border cut off). Confirmed visually via screenshot.
- **Not a scroll-trap:** there is **no horizontal scrollbar** — `window.scrollTo(9999,0)` leaves
  `scrollX = 0` on every page; `document.documentElement.scrollWidth` reports 415 vs 390 but the
  page is not actually horizontally scrollable. So usability impact is limited to the clipped chip.
- **Repro:** `next start`, open `http://localhost:3000/` at 390×844; the `button[aria-controls="demo-ai-menu"]`
  right edge sits at x≈415 (also at a 360px viewport — the cluster has a fixed minimum width).
- **Suggested fix (for the shared-zone owner):** let the switcher shrink/wrap on `xs`, hide the
  Demo-button text earlier, or reduce the gap/padding below `sm`. → **Logged in `NOTES-shared.md`** for
  whoever owns the shared zone; awaiting authorization.
- **Note:** `/shop` additionally reports `scrollWidth=780` at 390px, but that is the **off-canvas cart
  drawer** (`position:fixed`, translated 100% off-screen) — a non-scrollable measurement artifact, not
  a real overflow (`scrollX=0`).

---

## 9. Non-blocking observations (from code review / NOTES-shared.md — informational)

- **Placeholders by design** (project rule): solar project map coordinates, case-study photos,
  trust-band logos/certs, footer contacts (`info@gmgroup.it`), video posters. Structured for 1:1
  replacement. Not defects.
- **`/mobility` Lighthouse Performance score** is a known measurement artifact (R3F `<Canvas>` in
  `frameloop="always"` → no CPU-idle period → `NO_TTI_CPU_IDLE_PERIOD`); paint metrics are healthy and
  the page is interactive (documented in `NOTES-shared.md`). Not re-measured here.
- **Open Charge Map** needs a server-only `OCM_API_KEY` for live points; without it the map uses the
  curated Piemonte fallback (verified: `source:"curated"`, 12 points). Working as designed.

---

## 10. Repro cheat-sheet

```bash
pnpm install
pnpm build                                   # green, 26 pages
pnpm --filter @gmgroup/web exec next start -p 3000
curl http://localhost:3000/ | grep -i '<title>'          # must contain "GM Group"
curl http://localhost:3000/api/lead-qualifier            # {"aiEnabled":...}
# deterministic demo (no key needed — pre-baked scenarios):
curl -s -X POST http://localhost:3000/api/analytics \
  -H 'content-type: application/json' -d '{"query":"x","scenarioId":"fase2"}'   # authorized:false, BLOCKED
```

Browser suite used for this report: `c:/tmp/pwcheck/qa.mjs` (89 assertions; 82 green on the first
pass, the 7 “fails” resolved to: 2 fixed, 1 false positive, 4 reduced to the single LOW finding F1).
