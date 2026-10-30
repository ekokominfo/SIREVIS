const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
let data=[[],[],[],[],[1,'Ani','Dalam Daerah',100,'1 Januari 2026','A','K',''],['','Budi','Dalam Daerah',200,'1 Januari 2026','A','K','']];
const sheet={getLastRow:()=>data.length,getMaxColumns:()=>16,getRange:(row,col,n=1,w=1)=>({getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:w},(_,j)=>data[row+i-1]?.[col+j-1]??'')),setValues:values=>values.forEach((v,i)=>v.forEach((x,j)=>{(data[row+i-1]??=[])[col+j-1]=x;})),setValue:v=>{(data[row-1]??=[])[col-1]=v;}}),deleteRow:r=>data.splice(r-1,1)};
const context={console,SpreadsheetApp:{getActiveSpreadsheet:()=>({getSheetByName:()=>sheet,getSheets:()=>[{getName:()=> 'Bidang'}]})},LockService:{getDocumentLock:()=>({waitLock(){},releaseLock(){}})},Utilities:{getUuid:()=>crypto.randomUUID(),formatDate:()=> '2026-01-01'},Session:{getScriptTimeZone:()=> 'Asia/Jakarta'}};
vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/../Code.gs','utf8'),context);
let rows=context.getSheetData('Bidang').rawRows;assert.equal(context.summary_(rows).totalSppd,1);assert.equal(context.summary_(rows).totalAnggaran,300);
context.hapusDataSppd('Bidang',rows[0].recordId);rows=context.getSheetData('Bidang').rawRows;assert.equal(rows[0].no,'1');assert.equal(rows[0].nama,'Budi');const stable=rows[0].recordId;
context.simpanDataSppd('Bidang',[{namaPegawai:'Cici',jenisPerjalanan:'Luar Daerah',biaya:500,tanggalMulai:'2026-01-31',tanggalSelesai:'2026-02-02',tanggalHari:'31 Januari 2026 s/d 2 Februari 2026',tujuan:'B',keterangan:'K',status:'Diajukan'}],'2026-02-03');
rows=context.getSheetData('Bidang').rawRows;assert.equal(rows[0].recordId,stable);assert.equal(context.summary_(rows).totalSppd,2);assert.equal(rows[1].tanggalSelesai,'2026-02-02');
context.ubahStatusSppd('Bidang',rows[1].sppdId,'Diverifikasi','Pemeriksa','Sesuai');assert.equal(context.getSheetData('Bidang').rawRows[1].status,'Diverifikasi');
assert.throws(()=>context.simpanDataSppd('Bidang',[{namaPegawai:'X',biaya:-1}]));
const html=fs.readFileSync(__dirname+'/../Index.html','utf8');for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
console.log('PASS: legacy group totals, parent deletion, stable IDs, save, cross-month dates, verification, validation, JS syntax');
const jsonResponse=JSON.parse(context.getSheetDataJson('Bidang'));
assert.deepEqual(jsonResponse,JSON.parse(JSON.stringify(context.getSheetData('Bidang'))));
assert.equal(JSON.parse(context.getAllSheetsDataJson()).rawRows.length,rows.length);
// A Date nested in an RPC response cannot cross the Apps Script bridge directly.
// JSON transport must convert it before the success handler receives the payload.
const originalRecordId=data[4][9];data[4][9]=new Date('2026-05-07T00:00:00Z');
assert.equal(JSON.parse(context.getSheetDataJson('Bidang')).rawRows[0].recordId,'2026-05-07T00:00:00.000Z');
data[4][9]=originalRecordId;
console.log('PASS: JSON transport preserves rows and serializes nested Sheets dates');
const primary={namaPegawai:'Utama',biaya:100,jenisPerjalanan:'Dalam Daerah',tanggalMulai:'2026-05-20',tanggalSelesai:'2026-05-22',tanggalHari:'20 Mei 2026 s/d 22 Mei 2026',tujuan:'Palangka Raya',keterangan:'Rapat'};
const countBefore=data.length;
assert.throws(()=>context.simpanDataSppd('Bidang',[primary],''),/Tanggal verifikasi/);
assert.equal(data.length,countBefore);
context.simpanDataSppd('Bidang',[primary,{namaPegawai:'Pengikut',biaya:200}],'2026-05-25');
const added=context.getSheetData('Bidang').rawRows.slice(-2);
assert.equal(added[0].sppdId,added[1].sppdId);
assert.notEqual(added[0].recordId,added[1].recordId);
for(const row of added){
 assert.equal(row.status,'Diverifikasi');assert.equal(row.verifikasi,'2026-05-25');
 assert.equal(row.jenis,'Dalam Daerah');assert.equal(row.tanggalMulai,'2026-05-20');assert.equal(row.tanggalSelesai,'2026-05-22');
 assert.equal(row.tujuan,'Palangka Raya');assert.equal(row.keterangan,'Rapat');
}
assert.equal(added[1].nama,'Pengikut');assert.equal(added[1].biaya,200);
console.log('PASS: verified date required, verified status automatic, follower inherits trip while retaining name and cost');
// Reproduce deletion of old spreadsheet rows whose metadata is not text.
const realData=data;
for(const kind of ['number','date','zero']){
 const group=kind==='number'?17:kind==='zero'?0:new Date('2026-05-01T00:00:00Z');
 const firstId=kind==='number'?101:kind==='zero'?0:new Date('2026-05-02T00:00:00Z');
 const nextId=kind==='number'?102:kind==='zero'?1:new Date('2026-05-03T00:00:00Z');
 data=[[],[],[],[],[9,'Utama','Dalam Daerah',100,'20 Mei 2026','A','K','2026-05-25',group,firstId],['','Pengikut','Dalam Daerah',200,'20 Mei 2026','A','K','2026-05-25',group,nextId],[10,'Lain','Dalam Daerah',300,'20 Mei 2026','B','K','2026-05-25','other-group','other-record']];
 const fromBrowser=JSON.parse(context.getSheetDataJson('Bidang')).rawRows;
 assert.equal(typeof fromBrowser[0].sppdId,'string');assert.equal(typeof fromBrowser[0].recordId,'string');
 assert.equal(fromBrowser[0].sppdId,fromBrowser[1].sppdId);
 assert.equal(context.hapusDataSppd('Bidang',fromBrowser[0].recordId),'Sukses');
 const remaining=JSON.parse(context.getSheetDataJson('Bidang')).rawRows;
 assert.equal(remaining.length,2);assert.equal(remaining[0].nama,'Pengikut');assert.equal(remaining[0].no,'9');
 assert.equal(remaining[0].sppdId,fromBrowser[1].sppdId);assert.equal(remaining[0].recordId,fromBrowser[1].recordId);
 assert.equal(remaining[1].recordId,'other-record');assert.equal(remaining[1].sppdNo,'10');
 assert.equal(context.hapusDataSppd('Bidang',remaining[0].recordId),'Sukses');
 assert.equal(context.getSheetData('Bidang').rawRows[0].nama,'Lain');
}
data=realData;
console.log('PASS: delete numeric, zero and Date IDs through JSON roundtrip; preserve follower number, identity and other SPPD');
