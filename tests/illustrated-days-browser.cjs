const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fs=require('node:fs');

// Catches missing/broken remotely dependent photographs in the offline handbook,
// over-wide mobile cards, broken route controls, and lost booking-cost hydration.
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  for(const [width,colorScheme] of [[390,'light'],[1280,'dark']]){
   const context=await browser.newContext({viewport:{width,height:844},colorScheme,offline:true});
   const page=await context.newPage();const errors=[];const remote=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
   const days=page.locator('[data-route-day]');assert.equal(await days.count(),9);
   for(const day of await days.all()){
    const photos=day.locator('.sight-card img');
    assert.ok(await photos.count()>0,'Each travel day needs a real offline photo');
    for(const photo of await photos.all()){
     await photo.scrollIntoViewIfNeeded();
     await photo.evaluate(i=>i.decode());
     assert.ok(await photo.evaluate(i=>i.naturalWidth>=320&&i.naturalHeight>=240));
     assert.match(await photo.getAttribute('src'),/^data:image\/webp;base64,/);
     assert.ok((await photo.getAttribute('alt')).length>15);
    }
    assert.ok(await day.locator('.sight-card figcaption a').count()>0,'Visible photo credits');
    await day.locator('.day-route summary').click();
    assert.ok(await day.locator('.day-route svg').isVisible());
    await day.locator('.day-route summary').click();
   }
   assert.equal(await page.locator('.budget-disclosure[open]').count(),0);
   assert.match(await page.locator('#budget-total').innerText(),/3,629\.64/);
   assert.match(await page.locator('[data-rail-cost="rail-2026-10-03"]').innerText(),/145\.00/);
   assert.match(await page.locator('[data-rail-cost="rail-2026-10-07"]').innerText(),/39\.80/);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow');
   assert.deepEqual(errors,[]);assert.deepEqual(remote,[],'No network dependencies');
   await page.locator('[data-route-day="10/04"]').screenshot({path:`/private/tmp/illustrated-day4-${width}.png`});
   await page.locator('[data-route-day="10/08"]').screenshot({path:`/private/tmp/illustrated-day8-${width}.png`});
   await context.close();
  }
  assert.ok(fs.statSync(path.resolve(__dirname,'../index.html')).size<2*1024*1024,'Keep the offline document below 2 MiB');
  console.log('PASS: nine illustrated days, offline photo decoding, credits, route controls, mobile/dark layout, original costs, zero network requests, <2 MiB');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
