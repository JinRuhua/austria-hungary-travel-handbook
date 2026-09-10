# Travel Budget System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an offline-first, browser-local travel budget and expense workflow to the single-file Austria–Hungary Travel Handbook.

**Architecture:** Keep `index.html` as the only shipped asset. Add a small pure state/aggregation layer inside its existing script, persist editable data in `localStorage`, and render the Budget section plus Quick Add sheet from that state. Existing itinerary facts remain static and act as day/booking references; no backend or external dependency is introduced.

**Tech Stack:** HTML, CSS, inline SVG, vanilla JavaScript, Node built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-10-travel-budget-system-design.md`

## Global Constraints

- Preserve the single-file, zero-external-dependency, offline-first page.
- Preserve the existing editorial travel-journal visual language and navigation structure.
- Store user-entered financial data only in browser `localStorage`.
- Never invent booking or ticket prices; unknown costs remain editable empty fields.
- Keep Planned, Paid, and Spent separate and prevent linked booking/expense double counting.
- Support EUR base currency, original expense currencies, fixed trip rates, two travelers, paid-by, and shared-by count.
- Mobile-first; every primary control is at least 44px and accessible by keyboard.

### Task 1: Add failing tests for budget structure and formulas

**Files:**
- Modify: `tests/travel-handbook.test.mjs`
- Modify: `index.html` only after the tests fail

**Interfaces:**
- Tests will look for `#budget`, `#quick-expense`, `#budget-total`, `data-budget-category`, `data-expense-row`, and a pure browser-global `window.TravelBudget` with `calculateSummary(state)` and `saveState(state)`.

- [ ] **Step 1: Write failing assertions** for Budget navigation/section, empty states, Quick Add controls, booking/day hooks, localStorage key, and a formula fixture where a linked expense supersedes a booking actual amount.
- [ ] **Step 2: Run** `/Users/ruhua/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/travel-handbook.test.mjs` and confirm the new assertions fail.
- [ ] **Step 3: Commit** the red tests with `git add tests/travel-handbook.test.mjs && git commit -m "test: define travel budget behavior"`.

### Task 2: Implement state, currency conversion, and aggregation helpers

**Files:**
- Modify: `index.html` script block

**Interfaces:**
- Produce `window.TravelBudget.defaultState()`, `loadState()`, `saveState(state)`, `calculateSummary(state)`, `formatMoney(amount, currency)`, and `convertToBase(item, state)`.
- `calculateSummary` returns `{planned, paid, spent, remaining, usage, byCategory, byDay, recent, report}`.

- [ ] **Step 1: Add the minimal state module** with defaults, safe JSON parsing, stable IDs, and a versioned `travel-handbook-budget-v1` localStorage key.
- [ ] **Step 2: Implement exact aggregation precedence**: linked actual expense → booking actual → paid/planned booking cost; exclude a booking from fallback totals when a linked expense exists.
- [ ] **Step 3: Run the tests** and confirm formula/persistence assertions pass while DOM assertions remain red.
- [ ] **Step 4: Commit** with `git add index.html tests/travel-handbook.test.mjs && git commit -m "feat: add local budget state and summaries"`.

### Task 3: Add Budget overview, home card, and booking/day cost hooks

**Files:**
- Modify: `index.html` markup and CSS

**Interfaces:**
- Add `#budget` with overview metrics, editable total/category budget controls, category rows, daily spending list, recent expenses, and report summary.
- Add `#home-budget-card`, `data-booking-id`, `data-day-id`, `.add-cost`, and `.add-expense` hooks.

- [ ] **Step 1: Add static semantic markup** using current `.wrap`, `.card`, `.cards`, `.day`, `.badge`, and spacing tokens; include calm neutral/amber/muted-red states.
- [ ] **Step 2: Add responsive CSS** for mobile single-column and desktop summary/category split, tabular money numerals, progress bars, empty states, and reduced-motion behavior.
- [ ] **Step 3: Add `renderBudget(state)`** to update all metrics, category bars, day bars, recent rows, and report values without replacing unrelated itinerary DOM.
- [ ] **Step 4: Run tests** and confirm overview/visual structure assertions pass.
- [ ] **Step 5: Commit** with `git add index.html tests/travel-handbook.test.mjs && git commit -m "feat: add budget overview and itinerary hooks"`.

### Task 4: Implement Quick Add bottom sheet and inline expense actions

**Files:**
- Modify: `index.html` script, markup, and CSS

**Interfaces:**
- Add fixed `#quick-expense` button and `#expense-sheet` with amount, currency, category, save, cancel, and expandable details.
- Produce `openExpenseSheet(context)`, `closeExpenseSheet()`, `saveExpenseFromForm(form)`, `deleteExpense(id)`, and `editExpense(id)`.

- [ ] **Step 1: Add failing interaction assertions** for default category, date/time/city auto-fill, save-to-localStorage, and delete confirmation.
- [ ] **Step 2: Implement the bottom sheet** with autofocus, keyboard escape, click-outside dismissal, `aria-modal`, and `aria-live` confirmation.
- [ ] **Step 3: Wire Day and Booking buttons** to prefill day/city/category/booking context and render updated summaries.
- [ ] **Step 4: Run tests** and verify Quick Add behavior; fix only failures exposed by the tests.
- [ ] **Step 5: Commit** with `git add index.html tests/travel-handbook.test.mjs && git commit -m "feat: add quick expense entry"`.

### Task 5: Verify, review, and deploy

**Files:**
- Modify: only files required by verification feedback

- [ ] **Step 1: Run the full Node test suite** and record the passing result.
- [ ] **Step 2: Inspect `git diff --check` and verify no secrets, booking confirmation numbers, or room numbers entered the page.
- [ ] **Step 3: Test the local file in the in-app browser at `file:///private/tmp/austria-hungary-travel-handbook/index.html`: mobile layout, Budget navigation, Quick Add, persistence after reload, dark theme, and back-to-top.
- [ ] **Step 4: Commit the verified implementation** with `git add index.html tests/travel-handbook.test.mjs docs/superpowers/specs/2026-09-10-travel-budget-system-design.md docs/superpowers/plans/2026-09-10-travel-budget-system.md && git commit -m "feat: add offline travel budget system"`.
- [ ] **Step 5: Push `main` over the existing SSH remote and verify the GitHub Actions deployment concludes `success` before reporting completion.

