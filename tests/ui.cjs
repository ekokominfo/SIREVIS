// Optional browser integration suite. Requires Playwright, Chromium, and curl.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const screenshotDir=fs.mkdtempSync(path.join(os.tmpdir(),'sirevis-ui-'));
const vendor=new Map([
 ['bootstrap.min.css','https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'],
 ['bootstrap.bundle.min.js','https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'],
 ['chart.umd','https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js']
].map(([key,url])=>[key,execFileSync('curl',['-fsSL',url])]));
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://**/*',async route=>{
 const url=route.request().url();
 if(url.includes('chart.umd'))return route.fulfill({body:vendor.get('chart.umd'),contentType:'application/javascript'});
 if(url.endsWith('/assets/sirevis-logo.png'))return route.fulfill({path:path.join(root,'assets/sirevis-logo.png'),contentType:'image/png'});
 if(url.includes('bootstrap.min.css'))return route.fulfill({body:vendor.get('bootstrap.min.css'),contentType:'text/css'});
 if(url.includes('bootstrap.bundle.min.js'))return route.fulfill({body:vendor.get('bootstrap.bundle.min.js'),contentType:'application/javascript'});
 return route.fulfill({body:url.includes('chart.umd')?'window.Chart=class {destroy(){}}':'',contentType:url.includes('chart.umd')?'application/javascript':'text/css'});
});
await page.addInitScript(()=>{
 window.calls=[];window.returnNull=false;
 const rows=Array.from({length:15},(_,i)=>({sppdNo:i<3?'17.':String(i),sppdId:i<3?'same':'g'+i,recordId:'r'+i,bidangAsal:'Register Bidang PIP',nama:i===0?'Ani':i===1?'Budi':'Pegawai '+i,biaya:100000,jenis:'Dalam Daerah',tanggalMulai:'2026-10-30',tanggalSelesai:'2026-10-31',tujuan:'Palangka Raya',keterangan:'Kegiatan',status:'Diverifikasi',verifikasi:'2026-05-25',rowIndex:i+5}));
 rows.slice(0,3).forEach(r=>{r.tanggalMulai='';r.tanggalSelesai='';r.tanggal='21 s/d22 Mei2026'});
 window.google={script:{run:{withSuccessHandler(ok){return {withFailureHandler(fail){return new Proxy({}, {get(_,method){return (...args)=>{window.calls.push({method,args});queueMicrotask(()=>ok(method==='prosesLogin'?{status:true,role:'Atasan',bidang:''}:method==='getSheetNames'?['Register Bidang PIP']:['hapusDataSppd','simpanDataSppd'].includes(method)?'Sukses':window.returnNull?null:JSON.stringify({rawRows:rows})));};}});}};}}}};
});
await page.route('http://localhost:8000/**',r=>r.fulfill({path:path.join(root,'Index.html'),contentType:'text/html'}));
await page.goto('http://localhost:8000/');
await page.locator('.login-logo').waitFor();assert(await page.locator('.login-logo').evaluate(e=>e.complete&&e.naturalWidth>0));
await page.locator('#username').fill('test');await page.locator('#password').fill('test');await page.locator('#loginButton').click();
await page.locator('#tableBody [data-action=detail]').first().waitFor();
assert(await page.locator('.brand-icon').evaluate(e=>e.complete&&e.naturalWidth>0));
assert.equal(await page.locator('#userLabel').innerText(),'');assert.equal(await page.locator('#pageTitle').innerText(),'Dashboard SIREVIS');assert.match(await page.locator('#tableBody').innerText(),/30 s\/d 31 Oktober 2026 \(2 hari\)/);
await page.locator('#searchInput').fill('ani');
assert.equal(await page.locator('#tableBody mark').count(),1);assert.match(await page.locator('#resultCount').innerText(),/1 dari 15/);assert.equal(await page.locator('#activeFilters button').count(),1);
await page.locator('#activeFilters button').click();assert.equal(await page.locator('#searchInput').inputValue(),'');assert.equal(await page.locator('#tableBody tr').count(),10);await page.locator('#searchInput').fill('ani');
await page.locator('#tableBody [data-action=detail]').click();
await page.locator('#detailModal.show').waitFor();
assert.equal(await page.locator('#detailParticipants tr').count(),3);assert.match(await page.locator('#detailParticipants').innerText(),/21 s\/d 22 Mei 2026 \(2 hari\)/);
assert.match(await page.locator('#detailTitle').innerText(),/17PIP/);
assert.match(await page.locator('#detailSummary').innerText(),/3 pegawai/);
assert.equal(await page.locator('#detailStatusForm').count(),0);
assert.match(await page.locator('#detailSummary').innerText(),/Total Anggaran Keluar/);
await page.locator('#detailModal .modal-footer button').click();await page.locator('#detailModal').waitFor({state:'hidden'});
const borders=await page.locator('.kpi').first().evaluate(e=>{const s=getComputedStyle(e);return [s.borderTopColor,s.borderRightColor,s.borderBottomColor,s.borderLeftColor]});
assert.equal(new Set(borders).size,1);
await page.locator('#resetButton').click();
assert.equal(await page.locator('#tableBody mark').count(),0);
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:900});
 await page.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth);
 const kpis=page.locator('.kpis>.kpi');
 assert.match(await kpis.last().innerText(),/Anggaran Dalam/);
 const finalCard=await kpis.last().boundingBox(),previousCard=await kpis.nth(3).boundingBox(),grid=await page.locator('.kpis').boundingBox();
 if(width<=390){assert(Math.abs(finalCard.width-grid.width)<1);assert(finalCard.y>=previousCard.y+previousCard.height);}
 else{assert(finalCard.x>previousCard.x);assert(Math.abs(finalCard.y-previousCard.y)<1);}

 if(!(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)))console.log(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth&&getComputedStyle(e).position!=='sticky').slice(0,15).map(e=>({tag:e.tagName,id:e.id,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))})));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(width<=767){
 await page.locator('#mobileSort').selectOption('nama:asc');assert.match(await page.locator('#mobileRecords .record-card').first().innerText(),/Ani/);
 await page.locator('#mobileSort').selectOption('tanggal:desc');
 await page.locator('#nextButton').click();assert.equal(await page.locator('#mobileRecords .record-card').count(),5);await page.locator('#prevButton').click();
 assert(await page.locator('#mobileRecords').isVisible());assert.equal(await page.locator('#mobileRecords .record-card').count(),10);assert(!(await page.locator('.record-desktop').isVisible()));}
 else{assert(await page.locator('.record-desktop').isVisible());assert(!(await page.locator('#mobileRecords').isVisible()));}
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(1100);await page.screenshot({path:path.join(screenshotDir,'desktop-mobile-'+width+'.png'),fullPage:true});await page.screenshot({path:path.join(screenshotDir,'viewport-'+width+'.png')});
 if(width<=390){
  const status=page.locator('#recentBody tr').first().locator('td').last();
  const geometry=await status.evaluate(e=>{const range=document.createRange();range.selectNode(e.firstChild);const r=range.getBoundingClientRect(),cell=e.getBoundingClientRect();return {text:e.firstChild.textContent,lines:range.getClientRects().length,left:r.left,right:r.right,cellRight:cell.right}});
  assert.equal(geometry.text,'Diverifikasi');assert.equal(geometry.lines,1);assert(geometry.left>=0&&geometry.right<=width&&geometry.right<=geometry.cellRight+1);
 }

 await page.locator('#searchInput').fill('Ani');await page.locator(width<=767?'#mobileRecords [data-action=detail]':'#tableBody [data-action=detail]').click();await page.locator('#detailModal.show').waitFor();
 assert(await page.locator('#detailParticipants').isVisible());await page.locator('#detailModal .modal-content').screenshot({path:path.join(screenshotDir,'detail-'+width+'.png')});
 await page.locator('#detailModal .modal-footer button').click();await page.locator('#detailModal').waitFor({state:'hidden'});await page.locator('#resetButton').click();
}
await page.evaluate(()=>{state.user={role:'Staf',bidang:'Register Bidang PIP'};renderTable()});
const del=page.locator('[data-action=delete]:visible').first();
assert.equal(await del.evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
assert.equal(await del.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(185, 28, 28)');
assert.match(await del.getAttribute('title'),/bukan seluruh SPPD/);
page.once('dialog',d=>d.dismiss());await del.click();
assert.equal(await page.evaluate(()=>window.calls.filter(c=>c.method==='hapusDataSppd').length),0);
page.once('dialog',d=>d.accept());await del.click();
await page.waitForFunction(()=>window.calls.some(c=>c.method==='hapusDataSppd'));
await page.evaluate(async()=>{window.returnNull=true;await loadData({afterSave:true})});
assert.match(await page.locator('#message').innerText(),/sudah berhasil disimpan/);
assert.match(await page.locator('#message').innerText(),/Jangan tambah ulang/);
assert(await page.locator('#tableBody tr').count()>0);
await page.evaluate(async()=>{window.returnNull=false;await loadData()});
await page.evaluate(()=>{$('addButton').hidden=false});
await page.locator('#addButton').click();await page.locator('#addModal.show').waitFor();
assert.equal(await page.locator('#inputStatus').count(),0);
await page.locator('#tripMulai').fill('2026-05-20');await page.locator('#tripSelesai').fill('2026-05-22');await page.locator('#tripTujuan').fill('Palangka Raya');
await page.locator('#inputBody [name=nama]').fill('Utama');await page.locator('#inputBody [name=biaya]').fill('100');
await page.locator('#addEmployee').click();
assert.equal(await page.locator('#inputBody input').count(),4);assert.equal(await page.locator('#inputBody [name=biaya]').first().evaluate(e=>getComputedStyle(e).appearance),'textfield');
await page.locator('#inputBody tr').nth(1).locator('[name=nama]').fill('Pengikut');await page.locator('#inputBody tr').nth(1).locator('[name=biaya]').fill('200');
await page.locator('#saveButton').click();
assert.equal(await page.evaluate(()=>window.calls.filter(c=>c.method==='simpanDataSppd').length),0);
assert.match(await page.locator('#inputTotal').innerText(),/300/);
await page.locator('#addEmployee').click();await page.locator('#inputBody tr').last().locator('[name=biaya]').fill('50');assert.match(await page.locator('#inputTotal').innerText(),/350/);await page.locator('#inputBody tr').last().locator('button').click();assert.match(await page.locator('#inputTotal').innerText(),/300/);assert.equal(await page.locator('#inputCount').innerText(),'2 pegawai');
await page.locator('#tanggalVerifikasi').fill('2026-05-25');await page.locator('#saveButton').click();await page.locator('#addModal').waitFor({state:'hidden'});
const saved=await page.evaluate(()=>window.calls.find(c=>c.method==='simpanDataSppd').args);
assert.equal(saved[2],'2026-05-25');assert.equal(saved[1].length,2);assert.equal(saved[1][1].namaPegawai,'Pengikut');assert.equal(saved[1][1].biaya,200);assert.equal(saved[1][1].tujuan,'Palangka Raya');
assert.equal(await page.locator('[data-sort=biaya]').count(),0);
await page.locator('[data-action=detail]:visible').first().click();await page.locator('#detailModal.show').waitFor();
assert.match(await page.locator('#detailTitle').innerText(),/Detail SPPD : /);assert.equal(await page.locator('#detailTitle mark').count(),1);
assert.equal(await page.locator('#detailParticipants .verification-date').first().evaluate(e=>getComputedStyle(e).textAlign),'center');
await page.locator('#detailModal .modal-footer button').click();await page.locator('#detailModal').waitFor({state:'hidden'});
assert.deepEqual(errors,[]);console.log('PASS: desktop/mobile layouts, mobile records and sorting, filter chips, grouped detail, deletion confirmation, live form budget, JSON reload and validation');console.log('Screenshots: '+screenshotDir);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
