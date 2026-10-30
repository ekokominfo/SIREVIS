function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('SIREVIS - Diskominfostandi')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function prosesLogin(username, password) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Pengguna");
  if (!sheet) return { status: false, pesan: "Sheet 'Pengguna' belum dibuat!" };

  if(sheet.getLastRow()<2)return {status:false,pesan:"Belum ada pengguna."};
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0].toString().trim() === username && data[i][1].toString().trim() === password) {
      return {
        status: true,
        role: data[i][2].toString().trim(),
        bidang: data[i][3].toString().trim()
      };
    }
  }
  return { status: false, pesan: "Username atau Password salah!" };
}

function getSheetNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets().map(sheet => sheet.getName()).filter(name => name !== "Pengguna");
}

// A–H tetap kompatibel. I–P: ID SPPD, ID baris, mulai, selesai,
// status, pemeriksa, waktu pemeriksaan, catatan.
function dateKey_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) ? String(v) : '';
}
function money_(v) { return typeof v === 'number' ? v : Number(String(v || '').replace(/[^0-9,-]/g, '').replace(',', '.')) || 0; }
function readRows_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 5) return [];
  var width = Math.min(16, sheet.getMaxColumns());
  var values = sheet.getRange(5, 1, sheet.getLastRow()-4, width).getValues();
  var active = '', number = '', result = [];
  values.forEach(function(r, i) {
    if (!r.some(function(v){return v !== '';})) return;
    if (r[0] !== '') { active = r[8] || 'legacy:' + name + ':' + (i+5); number = String(r[0]); }
    result.push({rowIndex:i+5, no:String(r[0] || ''), sppdNo:number,
      sppdId:r[8] || active || 'legacy:' + name + ':' + (i+5),
      recordId:r[9] || 'legacy:' + name + ':' + (i+5), nama:String(r[1] || ''),
      jenis:String(r[2] || ''), biaya:money_(r[3]), tanggal:r[4] instanceof Date ? Utilities.formatDate(r[4],Session.getScriptTimeZone(),'dd MMMM yyyy') : String(r[4] || '-'),
      tujuan:String(r[5] || ''), keterangan:String(r[6] || ''), verifikasi:r[7] instanceof Date ? dateKey_(r[7]) : String(r[7] || '-'),
      bidangAsal:name, tanggalMulai:dateKey_(r[10]) || dateKey_(r[4]), tanggalSelesai:dateKey_(r[11]),
      status:String(r[12] || (r[7] && r[7] !== '-' ? 'Diverifikasi' : 'Draf')),
      pemeriksa:String(r[13] || ''), waktuVerifikasi:dateKey_(r[14]), catatan:String(r[15] || '')});
  });
  return result;
}
function summary_(rows) {
  var ids={}, dalam={}, luar={}, tujuan={}, pegawai={}, bidang={}, years={};
  var s={totalSppd:0,totalAnggaran:0,anggaranDalam:0,anggaranLuar:0,dalamDaerah:0,luarDaerah:0};
  rows.forEach(function(r){
    var id=r.sppdId;
    if (!ids[id]) {ids[id]=true;tujuan[r.tujuan || 'Lainnya']=(tujuan[r.tujuan || 'Lainnya']||0)+1;}
    var isDalam=r.jenis.toLowerCase()==='dalam daerah';
    if(isDalam) dalam[id]=true; else if(r.jenis.toLowerCase()==='luar daerah') luar[id]=true;
    s.totalAnggaran+=r.biaya; if(isDalam)s.anggaranDalam+=r.biaya;else if(r.jenis.toLowerCase()==='luar daerah')s.anggaranLuar+=r.biaya;
    if(r.nama){var p=pegawai[r.nama]||(pegawai[r.nama]={name:r.nama,total:0,dalam:0,luar:0});p.total++;if(isDalam)p.dalam++;else if(r.jenis.toLowerCase()==='luar daerah')p.luar++;}
    var b=bidang[r.bidangAsal]||(bidang[r.bidangAsal]={bidang:r.bidangAsal,totalAnggaran:0,ids:{}}); b.totalAnggaran+=r.biaya;b.ids[id]=true;
    var y=(r.tanggalMulai || r.tanggal).match(/\b20\d{2}\b/);if(y)years[y[0]]=true;
  });
  s.totalSppd=Object.keys(ids).length;s.dalamDaerah=Object.keys(dalam).length;s.luarDaerah=Object.keys(luar).length;
  s.tujuanList=Object.keys(tujuan).map(function(k){return {name:k,count:tujuan[k]};}).sort(function(a,b){return b.count-a.count;});
  s.pegawaiList=Object.keys(pegawai).map(function(k){return pegawai[k];}).sort(function(a,b){return b.total-a.total;});
  s.bidangStats=Object.keys(bidang).map(function(k){var b=bidang[k];return {bidang:k,totalAnggaran:b.totalAnggaran,totalSppd:Object.keys(b.ids).length};});
  s.availableYears=Object.keys(years).sort().reverse();return s;
}
function response_(rows){return {rawRows:rows,summary:summary_(rows),recentSppd:[]};}
function getSheetData(name){if(name==='Pengguna')throw new Error('Sheet bukan data SPPD.');return response_(readRows_(name));}
function getAllSheetsData(){var rows=[];getSheetNames().forEach(function(n){rows=rows.concat(readRows_(n));});return response_(rows);}
// Kirim teks JSON agar nilai tanggal dari Sheets aman melewati google.script.run.
function getSheetDataJson(name){return JSON.stringify(getSheetData(name));}
function getAllSheetsDataJson(){return JSON.stringify(getAllSheetsData());}
function withSheetLock_(name, action){
  var lock=LockService.getDocumentLock() || LockService.getScriptLock();lock.waitLock(30000);
  try {var sheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);if(!sheet || name==='Pengguna')throw new Error('Bidang tidak valid.');
    if(sheet.getMaxColumns()<16)sheet.insertColumnsAfter(sheet.getMaxColumns(),16-sheet.getMaxColumns());
    // Persist legacy identities before mutations so row deletion cannot change identity.
    var rows=readRows_(name);rows.forEach(function(r){sheet.getRange(r.rowIndex,9,1,2).setValues([[r.sppdId.indexOf('legacy:')===0 ? 'migrated:'+r.sppdId : r.sppdId,r.recordId.indexOf('legacy:')===0 ? 'migrated:'+r.recordId : r.recordId]]);});
    return action(sheet);
  } finally {lock.releaseLock();}
}
function simpanDataSppd(name, rows){
  return withSheetLock_(name,function(sheet){
    if(!Array.isArray(rows)||!rows.length)throw new Error('Data kosong.');
    rows.forEach(function(r){if(!String(r.namaPegawai||'').trim()||!dateKey_(r.tanggalMulai)||!Number.isFinite(r.biaya)||r.biaya<0||!['Dalam Daerah','Luar Daerah'].includes(r.jenisPerjalanan)||r.tanggalSelesai && (!dateKey_(r.tanggalSelesai)||r.tanggalSelesai<r.tanggalMulai)||!['Draf','Diajukan'].includes(r.status))throw new Error('Nama, biaya, jenis, tanggal atau status tidak valid.');});
    var old=readRows_(name), next=old.reduce(function(n,r){return Math.max(n,parseInt(r.sppdNo)||0);},0)+1,id=Utilities.getUuid();
    var values=rows.map(function(r,i){return [i===0?next:'',r.namaPegawai,r.jenisPerjalanan,r.biaya,r.tanggalHari,r.tujuan,r.keterangan,'-',id,Utilities.getUuid(),r.tanggalMulai,r.tanggalSelesai||'',r.status,'','',''];});
    sheet.getRange(Math.max(5,sheet.getLastRow()+1),1,values.length,16).setValues(values);return 'Sukses';
  });
}
function hapusDataSppd(name, id){return withSheetLock_(name,function(sheet){
  var rows=readRows_(name), normalized=String(id).indexOf('legacy:')===0?'migrated:'+id:id;
  var r=rows.find(function(x){return x.recordId===normalized;});if(!r)throw new Error('Data sudah berubah. Muat ulang.');
  var rest=rows.filter(function(x){return x.sppdId===r.sppdId && x.recordId!==r.recordId;});
  if(r.no && rest.length)sheet.getRange(rest[0].rowIndex,1).setValue(r.no);
  sheet.deleteRow(r.rowIndex);return 'Sukses';
});}
function ubahStatusSppd(name,id,status,pemeriksa,catatan){return withSheetLock_(name,function(sheet){
  if(!['Draf','Diajukan','Diverifikasi','Dikembalikan'].includes(status))throw new Error('Status tidak valid.');
  if(!String(pemeriksa||'').trim())throw new Error('Nama pemeriksa wajib diisi.');
  if(status==='Dikembalikan'&&!String(catatan||'').trim())throw new Error('Catatan pengembalian wajib diisi.');
  var normalized=id.indexOf('legacy:')===0?'migrated:'+id:id;
  var rows=readRows_(name).filter(function(r){return r.sppdId===normalized;});if(!rows.length)throw new Error('SPPD tidak ditemukan.');
  rows.forEach(function(r){sheet.getRange(r.rowIndex,13,1,4).setValues([[status,pemeriksa,new Date(),catatan||'']]);sheet.getRange(r.rowIndex,8).setValue(status==='Diverifikasi'?new Date():'-');});return 'Sukses';
});}
