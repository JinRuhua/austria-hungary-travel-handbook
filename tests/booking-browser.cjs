const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({channel:'chrome', headless:true});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
    // This suite exercises user entry from an empty ledger; seeded public costs have their own suite.
    await page.evaluate(()=>localStorage.setItem('travel-handbook-budget-v1',JSON.stringify({...TravelBudget.defaultState(),confirmedCostsRevision:'2026-09-11'})));
    await page.reload();
    const hotel = page.locator('#bookings .card').filter({hasText:'Hotel Villa Carlton'});
    const flight = page.locator('#bookings .card').filter({hasText:'CA719 |'});
    const form = page.locator('#expense-form');
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('travel-handbook-budget-v1')));
    await hotel.getByRole('button',{name:'Add cost',exact:true}).click();
    await form.locator('[name="amount"]').fill('300');
    await form.getByRole('button',{name:/Save/}).click();
    assert.match(await hotel.locator('[data-booking-amount]').innerText(), /300\.00/, 'Saving hotel cost must immediately update that card');
    assert.equal(await hotel.getByRole('button').innerText(), 'Edit cost');
    assert.equal((await state()).bookingCosts.length,1);
    assert.equal((await state()).expenses.length,0);
    for (const day of ['10/04','10/05','10/06']) assert.match(await page.locator(`[data-day-spend="${day}"]`).innerText(),/100\.00/);
    await hotel.getByRole('button',{name:'Edit cost'}).click();
    assert.equal(await form.locator('[name="amount"]').inputValue(),'300');
    await form.locator('[name="amount"]').fill('450');
    await form.getByRole('button',{name:/Save/}).click();
    assert.equal((await state()).bookingCosts.length,1, 'Edit replaces the same booking');
    for (const day of ['10/04','10/05','10/06']) assert.match(await page.locator(`[data-day-spend="${day}"]`).innerText(),/150\.00/);
    const dailyBefore = await page.locator('#daily-spending').innerText();
    await flight.getByRole('button',{name:'Add cost'}).click();
    await form.locator('[name="amount"]').fill('600');
    await form.getByRole('button',{name:/Save/}).click();
    assert.match(await flight.locator('[data-booking-amount]').innerText(),/600\.00/);
    assert.equal(await page.locator('#daily-spending').innerText(),dailyBefore,'Flights do not change daily amounts');
    assert.match(await page.locator('#budget-total').innerText(),/1,050\.00/);
    await page.reload();
    assert.match(await hotel.locator('[data-booking-amount]').innerText(),/450\.00/);
    assert.equal(await hotel.getByRole('button').innerText(),'Edit cost');
    await hotel.screenshot({path:'/private/tmp/travel-booking-card-verified.png'});
    await page.locator('#budget-settings-panel summary').click();
    await page.locator('#budget-settings [name="totalBudget"]').fill('2000');
    await page.getByRole('button',{name:'Save budget',exact:true}).click();
    await page.locator('#budget-settings [name="baseCurrency"]').selectOption('CNY');
    await page.getByRole('button',{name:'Save budget',exact:true}).click();
    assert.match(await page.locator('#budget-total').innerText(),/8,333\.33/,'Totals must be converted, not relabeled');
    assert.equal((await state()).bookingCosts[0].currency,'EUR');
    await page.locator('#budget-settings [name="baseCurrency"]').selectOption('EUR');
    await page.getByRole('button',{name:'Save budget',exact:true}).click();
    assert.match(await page.locator('#budget-total').innerText(),/1,050\.00/);
    assert.equal(await page.locator('#expense-form [name="amount"]').evaluate(el=>getComputedStyle(el).fontSize),'16px');
    await page.evaluate(()=>localStorage.setItem('travel-handbook-budget-v1',JSON.stringify({version:1,confirmedCostsRevision:'2026-09-11',baseCurrency:'EUR',bookingCosts:[],expenses:[
      {id:'old-hotel',name:'Hotel Villa Carlton',amount:300,currency:'EUR',category:'Accommodation',dayId:'10/01',activityId:''},
      {id:'old-flight',name:'CA719 | Beijing → Budapest',amount:600,currency:'EUR',category:'Intercity Transport',dayId:'10/01',activityId:''},
      {id:'lunch',name:'Lunch',amount:20,currency:'EUR',category:'Food & Drink',dayId:'10/01'}
    ]})));
    await page.reload();
    assert.match(await hotel.locator('[data-booking-amount]').innerText(),/300\.00/);
    assert.match(await flight.locator('[data-booking-amount]').innerText(),/600\.00/);
    assert.match(await page.locator('[data-day-spend="10/01"]').innerText(),/20\.00/);
    for (const day of ['10/04','10/05','10/06']) assert.match(await page.locator(`[data-day-spend="${day}"]`).innerText(),/100\.00/);
    assert.match(await page.locator('#budget-total').innerText(),/920\.00/);
    assert.equal((await state()).expenses.length,1);
    await page.reload();
    assert.equal((await state()).bookingCosts.length,2,'Migration is idempotent');
    // Exercise the actual Save button for every flight/hotel, including rounding a three-night stay.
    for (let index=0;index<8;index++) {
      const card=page.locator('#bookings .card').nth(index);
      await card.getByRole('button').click();
      await form.locator('[name="amount"]').fill('100');
      await form.getByRole('button',{name:/Save/}).click();
      assert.match(await card.locator('[data-booking-amount]').innerText(),/100\.00/);
      assert.equal(await card.getByRole('button').innerText(),'Edit cost');
    }
    assert.equal((await state()).bookingCosts.length,8);
    assert.match(await page.locator('#budget-total').innerText(),/820\.00/);
    for (const [day,amount] of [['10/01','70.00'],['10/02','50.00'],['10/03','100.00'],['10/04','33.33'],['10/05','33.33'],['10/06','33.34'],['10/07','50.00'],['10/08','50.00'],['10/09','0.00']]) {
      assert.ok((await page.locator(`[data-day-spend="${day}"]`).innerText()).includes('€'+amount));
    }
    assert.deepEqual(errors,[]);
    await page.screenshot({path:'/private/tmp/travel-booking-verified.png',fullPage:true});
    console.log('PASS: all 8 cards save/edit, immediate amounts, nightly allocation incl. remainder, flights excluded, reload, currency round trip, old-data migration, mobile font; no browser errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
