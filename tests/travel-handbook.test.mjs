import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const handbookPath = new URL('../index.html', import.meta.url);
const html = await readFile(handbookPath, 'utf8');

test('renders the required handbook sections and confirmed stays', () => {
  for (const id of ['now', 'overview', 'bookings', 'days', 'todo', 'tips']) {
    assert.match(html, new RegExp(`<section[^>]+id=["']${id}["']`, 'i'));
  }

  for (const hotel of [
    'Hotel GIN Budapest',
    'Strandhotel Margaretha',
    'Hotel Villa Carlton',
    'MAXX by Steigenberger Vienna',
  ]) {
    assert.match(html, new RegExp(hotel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('provides offline-accessible route maps and user-initiated navigation', () => {
  assert.match(html, /<svg[^>]+aria-label=["']Trip overview route map["']/i);
  assert.match(html, /<details\s+class=["']day-route["']/i);
  assert.match(html, /data-route-day=["']10\/01["']/i);
  assert.match(html, /data-map-link(?:=["'][^"']*["'])?[^>]*href=["']https:\/\/www\.google\.com\/maps\/dir\//i);
  assert.doesNotMatch(html, /<iframe\b/i);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc\s*=/i);
});

test('supports a live, absolute-time countdown and mobile color themes', () => {
  assert.match(html, /const\s+events\s*=/);
  assert.match(html, /function\s+updateCountdown\s*\(\s*nowMs\s*\)/);
  assert.match(html, /2026-10-01T07:00:00\+02:00/);
  assert.match(html, /aria-live=["']polite["']/i);
  assert.match(html, /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)/i);
  assert.match(html, /days/);
  assert.match(html, /hours/);
  assert.match(html, /minutes/);
  assert.match(html, /seconds/);
});

test('contains the approved daily scope without sensitive fields or interactive todo controls', () => {
  for (const item of [
    'Buda Castle', 'Fisherman', 'Central Market', 'Parliament', 'Shoes', 'St. Stephen',
    'St. Wolfgang', 'Schafberg', 'Wolfgangsee', 'Hallstatt', 'Königssee', 'Salzburg',
    'Schönbrunn', 'Vienna', 'Airport', 'CONFIRMED', 'TICKET TO BUY', 'RESERVATION NEEDED', 'CEST', 'CST',
  ]) {
    assert.match(html, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }

  assert.doesNotMatch(html, /<(?:input|button)\b[^>]*(?:checkbox|type=["']checkbox)/i);
  assert.doesNotMatch(html, /(?:确认号|预订号|订单号|房间号|证件号|护照号|confirmation\s*(?:number|no\.?|code)|booking\s*(?:number|no\.?|code)|room\s*(?:number|no\.?|code)|document\s*(?:number|no\.?|code)|price|价格)/i);
});

test('adds the offline travel budget workspace and entry points', () => {
  assert.match(html, /<a[^>]+href=["']#budget["'][^>]*>Budget<\/a>/i);
  assert.match(html, /<section[^>]+id=["']budget["']/i);
  assert.match(html, /id=["']budget-total["']/i);
  assert.match(html, /data-budget-category=["']Food & Drink["']/i);
  assert.match(html, /id=["']quick-expense["']/i);
  assert.match(html, /id=["']expense-sheet["']/i);
  assert.match(html, /data-add-expense/i);
  assert.match(html, /data-add-cost/i);
  assert.match(html, /travel-handbook-budget-v1/);
  assert.match(html, /localStorage/);
});

test('defines budget aggregation precedence and local persistence helpers', () => {
  assert.match(html, /window\.TravelBudget/);
  assert.match(html, /calculateSummary\s*[:=]\s*function|function\s+calculateSummary/);
  assert.match(html, /saveState\s*[:=]\s*function|function\s+saveState/);
  assert.match(html, /linked|bookingId/);
  assert.match(html, /convertedAmount|exchangeRate/);
  assert.match(html, /Actual Expense|actual expense|actualAmount/i);
});
