# Travel Handbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build the Austria and Hungary offline public handbook and Worker deployment.

**Architecture:** `index.html` contains all public content, CSS, JavaScript and SVG. `worker.js`, `wrangler.toml`, and a GitHub Actions workflow publish it.

**Spec:** `docs/superpowers/specs/2026-09-08-austria-hungary-travel-handbook-design.md`

## Global Constraints

- Exactly one self-contained public `index.html`, with no external assets, fonts, scripts, or data calls.
- No confirmation/document/room numbers, prices, logs, or version labels.
- Content works without JavaScript; JavaScript only enhances countdown and route disclosure.
- Display CEST or CST with every itinerary time; countdown uses ISO timestamps with UTC offsets.
- Google Maps is user-activated outbound navigation; never embed a map.

### Task 1: Implement the entire local handbook

**Files:** Create `index.html`; create `tests/travel-handbook.test.mjs`.

**Interfaces:** produce semantic `#now`, `#overview`, `#bookings`, `#days`, `#todo`, and `#tips` sections; `const events`; `function updateCountdown(nowMs)`; `data-route-day` panels and `data-map-link` anchors.

- [ ] Write a Node built-in test that requires all six sections, four hotel names, an inline overview SVG labelled `行程总览路线图`, a native `<details class="day-route">`, Google directions URLs, `@media (prefers-color-scheme: dark)`, `aria-live="polite"`, and no iframe/external script/sensitive labels.
- [ ] Run `node --test tests/travel-handbook.test.mjs`; record the expected initial failure.
- [ ] Create `index.html` implementing the full approved schedule, confirmed flight/hotel cards with public addresses/phones, pending labels for all unpurchased items, a colorful hand-drawn overview and daily SVG routes, all navigation links, an ordinary text-only todo list, tips, responsive styling, and absolute-time countdown.
- [ ] Run `node --test tests/travel-handbook.test.mjs`; record passing output.
- [ ] Commit with `feat: add offline travel handbook`.

### Task 2: Configure deployment and final verification

**Files:** Create `worker.js`, `wrangler.toml`, `.github/workflows/deploy.yml`; modify `tests/travel-handbook.test.mjs`.

**Interfaces:** Worker must call `env.ASSETS.fetch(request)` and add safe static response headers. Workflow triggers `push` to `main` and uses `cloudflare/wrangler-action@v3` with only `${{ secrets.CLOUDFLARE_API_TOKEN }}`.

- [ ] Add failing tests reading the Worker/config/workflow and asserting no public credentials.
- [ ] Create a minimal static-assets Worker; configure root assets excluding docs/tests; add the GitHub Action.
- [ ] Run `node --test tests/travel-handbook.test.mjs` and `npx --yes wrangler deploy --dry-run`.
- [ ] Visually inspect direct-file loading at 320px and 390px in light/dark mode; confirm countdown and route disclosures.
- [ ] Commit with `ci: deploy handbook with Cloudflare Workers`.
