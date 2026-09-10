# Travel Budget System Design

## Goal

Add a lightweight travel budget and expense loop to the existing single-file Austria–Hungary Travel Handbook without changing its editorial travel-journal identity or offline-first deployment model.

## Product decisions

- Budget is a new top-level section and navigation item.
- The first version is browser-local: editable budget and expense data is stored in `localStorage`; nothing financial is uploaded or synchronized between devices.
- Confirmed itinerary facts remain shared page content. Monetary values are never invented; booking cost fields begin empty until entered by the user.
- Planned, paid, and spent values are separate. An actual expense linked to a booking takes precedence over that booking's actual cost, which takes precedence over planned cost.
- The first version supports one base currency, per-expense original currency, trip exchange rates, two travelers, paid-by, and shared-by count.
- Quick Add is the primary mobile action and uses a bottom sheet with progressive disclosure.

## Data model

```js
{
  baseCurrency: 'EUR',
  travelerCount: 2,
  totalBudget: 0,
  categoryBudgets: { Accommodation: 0, 'Intercity Transport': 0, 'Local Transport': 0, 'Food & Drink': 0, Activities: 0, Shopping: 0, Other: 0 },
  tripRates: { EUR: 1 },
  bookingCosts: [],
  expenses: []
}
```

Each expense stores `id, dayId, activityId?, bookingId?, name, category, amount, currency, convertedAmount, exchangeRate, date, time, city, paidBy, sharedBy, paymentMethod?, note?`. Booking costs store `bookingId, name, plannedAmount, actualAmount?, currency, category, paymentStatus, paymentDate?, refundable?`.

## Statistics

- `planned = planned booking costs + unlinked planned items`.
- `paid = booking costs whose status is Paid or Partially Paid, using actual amount when present and planned amount otherwise`.
- `spent = actual expenses + actual booking costs not represented by a linked expense + planned booking costs only when marked paid-as-cost`.
- A linked expense wins over a booking's actual amount to prevent double counting.
- `remaining = totalBudget - spent`; usage is `spent / totalBudget`.
- Category and day totals aggregate converted amounts; original amount/currency remain visible in rows.

## UI composition

- Add `Budget` to the existing pill navigation.
- Add a compact home budget card near the current overview with spent/total/remaining and a link to the Budget section.
- Budget section: overview metrics, category progress rows, daily spending bars, recent expenses, and an inline trip report summary.
- Booking cards gain a cost/status row and an `Add cost` control.
- Day cards gain a `Spent today` summary and `Add expense` control.
- Activities can expose `Add expense` through existing timeline rows where present.
- Global floating `+` opens Quick Expense bottom sheet. Default fields: amount, currency, category, save. More details: merchant, paid by, shared by, linked day/activity, payment method, note.
- Mobile is single-column; desktop uses a calm two-column budget layout. All controls meet a 44px touch target and retain visible focus states.
- Empty states explain how to set a budget or add an expense. Destructive delete requires confirmation.

## Files

- `index.html`: add budget markup, styles, state/aggregation helpers, localStorage persistence, sheet interactions, and booking/day affordances.
- `tests/travel-handbook.test.mjs`: extend static and runtime-oriented assertions for budget structure, formulas, local persistence, and Quick Add controls.

## Non-goals

No receipt OCR, bank imports, live financial rates, backend synchronization, account system, or Splitwise-style settlement.
