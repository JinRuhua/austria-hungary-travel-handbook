const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
    const getState=()=>page.evaluate(()=>TravelBudget.loadState());
    const verify=async()=>{
      const state=await getState();
      assert.equal(state.bookingCosts.length,8);
      assert.equal(state.expenses.filter(e=>e.category==='Intercity Transport').length,2);
      for(let i=0;i<4;i++){
        const cost=state.bookingCosts.find(b=>b.bookingId==='booking-'+(i+1));
        assert.equal(cost.actualAmount,4100);assert.equal(cost.currency,'CNY');
        assert.match(await page.locator('[data-booking-amount="booking-'+(i+1)+'"]').innerText(),/4,100\.00/);
      }
      for(const [id,amount] of [['booking-5',308.47],['booking-6',273],['booking-7',515.97],['booking-8',281]]) {
        const cost=state.bookingCosts.find(b=>b.bookingId===id);
        assert.equal(cost.actualAmount,amount);assert.equal(cost.currency,'EUR');
      }
      for(const [day,amount] of [['10/01','154.23'],['10/02','154.24'],['10/03','418.00'],['10/04','171.99'],['10/05','171.99'],['10/06','171.99'],['10/07','180.30'],['10/08','140.50'],['10/09','0.00']]){
        assert.ok((await page.locator(`[data-day-spend="${day}"]`).innerText()).includes('€'+amount),day+' nightly total');
      }
      assert.match(await page.locator('[data-rail-cost="rail-2026-10-03"]').innerText(),/145\.00/);
      assert.match(await page.locator('[data-rail-cost="rail-2026-10-07"]').innerText(),/39\.80/);
      for(const day of ['10/03','10/07']) assert.equal(await page.locator(`[data-route-day="${day}"] li`).filter({has: page.locator('[data-rail-cost]')}).locator('.badge').innerText(),'TICKET ISSUED');
      assert.doesNotMatch(await page.locator('#todo').innerText(),/Buy.*train ticket/);
      assert.match(await page.locator('#budget-total').innerText(),/3,629\.64/);
    };
    await verify();
    await page.reload();await verify();
    // Existing browser data gets the approved amounts once; unrelated spending remains.
    await page.evaluate(()=>localStorage.setItem('travel-handbook-budget-v1',JSON.stringify({version:2,baseCurrency:'EUR',bookingCosts:[{bookingId:'booking-5',actualAmount:1,currency:'EUR'}],expenses:[{id:'coffee',amount:5,currency:'EUR',category:'Food & Drink',name:'Coffee',dayId:'10/09'}]})));
    await page.reload();
    let state=await getState();
    assert.equal(state.bookingCosts.find(b=>b.bookingId==='booking-5').actualAmount,308.47);
    assert.equal(state.expenses.find(e=>e.id==='coffee').amount,5);
    assert.match(await page.locator('#budget-total').innerText(),/3,634\.64/);
    // Later local edits survive refresh and seed amounts do not get added again.
    const hotel=page.locator('[data-booking-id="booking-5"]');
    await hotel.getByRole('button',{name:'Edit cost'}).click();
    await page.locator('#expense-form [name="amount"]').fill('310');
    await page.locator('#expense-form').getByRole('button',{name:'Save cost'}).click();
    await page.reload();
    state=await getState();
    assert.equal(state.bookingCosts.length,8);
    assert.equal(state.bookingCosts.find(b=>b.bookingId==='booking-5').actualAmount,310);
    assert.equal(state.expenses.length,3);
    assert.deepEqual(errors,[]);
    await page.locator('#bookings').screenshot({path:'/private/tmp/confirmed-travel-costs.png'});
    console.log('PASS: public default amounts, original currencies, 8 bookings + 2 trains, nightly totals, reload, old-state upgrade, unrelated spending, later edits');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
