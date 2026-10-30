const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(__dirname + '/../Index.html', 'utf8');
const elements = new Map();
const document = {
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, { value: '', innerHTML: '', textContent: '' });
    return elements.get(id);
  },
  addEventListener() {}
};
const context = vm.createContext({ document });
for (const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  vm.runInContext(script[1], context);
}
const run = code => vm.runInContext(code, context);
for (const [name, code] of Object.entries({
  'Kepegawaian': 'KEP', 'Keuangan': 'KEU', 'Layanan Komunikasi Publik': 'LKP',
  'Pengelola Informasi Publik': 'PIP', 'Aplikasi Informatika': 'APT',
  'Statistik dan Persandian': 'SPD'
})) {
  context.name = 'Register Bidang ' + name;
  assert.equal(run('sppdLabel({sppdNo:4,bidangAsal:name})'), '4' + code);
  assert.equal(run('bidangLabel(name)'), 'Bidang ' + name);
}
assert.equal(run("sppdLabel({sppdNo:'1LKP',bidangAsal:'LKP'})"), '1LKP');
assert.equal(run("sppdLabel({sppdNo:3,bidangAsal:'Bidang Lain'})"), '3');
run(`state.rows = [
  {sppdNo:1,bidangAsal:'Register Bidang Keuangan',tanggalMulai:'2026-01-02',nama:'Ani',rowIndex:8},
  {sppdNo:2,bidangAsal:'Register Bidang Aplikasi Informatika',tanggal:'3 Februari 2026',nama:'Budi',rowIndex:5},
  {sppdNo:3,bidangAsal:'Register Bidang Keuangan',tanggalMulai:'2026-01-20',nama:'Cici',rowIndex:9}
]; applyFilters();`);
assert.equal(run('state.filtered.map(r=>r.nama).join()'), 'Budi,Cici,Ani');
assert.match(document.getElementById('tableBody').innerHTML, /<td>1<\/td><td>2APT<\/td>/);
assert.doesNotMatch(document.getElementById('tableBody').innerHTML, /Register/);
run('state.size=1;state.page=2;renderTable();');
assert.match(document.getElementById('tableBody').innerHTML, /<td>2<\/td><td>3KEU<\/td>/);
document.getElementById('searchInput').value = '2APT';
run('applyFilters();');
assert.equal(run('state.filtered.length'), 1);
assert.equal(run('state.filtered[0].nama'), 'Budi');
document.getElementById('searchInput').value = '';
document.getElementById('filterBulan').value = '01';
run('applyFilters();');
assert.equal(run('state.filtered.map(r=>r.nama).join()'), 'Cici,Ani');
document.getElementById('searchInput').value = 'Tidak ditemukan';
run('applyFilters();');
assert.match(document.getElementById('tableBody').innerHTML, /colspan="11"/);
console.log('PASS: six field codes, labels, mixed-field date order, pagination numbers, search, month filter, empty table');
for (const name of ['Aptika','Aplikasi Informatika']) {
  context.name=name;assert.equal(run("sppdLabel({sppdNo:'2.',bidangAsal:name})"),'2APT');
}
for (const name of ['Standi','Statistik dan Persandian']) {
  context.name=name;assert.equal(run("sppdLabel({sppdNo:'4',bidangAsal:name})"),'4SPD');
}
assert.equal(run("sppdLabel({sppdNo:'17.PIP',bidangAsal:'PIP'})"),'17PIP');
assert.equal(run("sppdLabel({sppdNo:'17. pip',bidangAsal:'PIP'})"),'17PIP');
run(`state.rows=[
 {sppdId:'group',recordId:'a',bidangAsal:'PIP',nama:'Ani',rowIndex:5},
 {sppdId:'group',recordId:'b',bidangAsal:'PIP',nama:'Budi',rowIndex:6},
 {sppdId:'group',recordId:'c',bidangAsal:'APT',nama:'Lain',rowIndex:5},
 {sppdId:'other',recordId:'d',bidangAsal:'PIP',nama:'Lain',rowIndex:7}
];state.filtered=[state.rows[0]];`);
assert.equal(run('sppdMembers(state.rows[0]).map(r=>r.nama).join()'),'Ani,Budi');
document.getElementById('searchInput').value='an';
assert.equal(run("highlight('Anita dan Ani')"),'<mark class="search-match">An</mark>ita d<mark class="search-match">an</mark> <mark class="search-match">An</mark>i');
document.getElementById('searchInput').value='<img>';
assert.equal(run("highlight('<img>')"),'<mark class="search-match">&lt;img&gt;</mark>');
document.getElementById('searchInput').value='[';
assert.equal(run("highlight('[a]')"),'<mark class="search-match">[</mark>a]');
console.log('PASS: aliases, clean SPPD numbers, complete participant groups, safe literal search highlights');
context.Option=function(text,value){return {text,value};};
document.getElementById('filterTahun').replaceChildren=function() {this.value='';};
(async()=>{
  run("rpc=async()=>null;state.user={role:'Staf',bidang:'PIP'};state.size=10;");
  const before=run('state.rows');
  await run('loadData({afterSave:true})');
  assert.equal(run('state.rows'),before,'failed reload must retain existing data');
  assert.match(document.getElementById('message').textContent,/sudah berhasil disimpan/);
  assert.match(document.getElementById('message').textContent,/Jangan tambah ulang/);
  assert.equal(document.getElementById('loader').hidden,true);
  document.getElementById('searchInput').value='';document.getElementById('filterBulan').value='';
  run(`rpc=async()=>JSON.stringify({rawRows:[{nama:'Baru',sppdNo:2,bidangAsal:'PIP',tanggalMulai:'2026-10-30'}]});`);
  await run('loadData()');
  assert.equal(run('state.rows[0].nama'),'Baru');
  assert.match(document.getElementById('tableBody').innerHTML,/2PIP/);
  console.log('PASS: null reload preserves data, distinguishes saved SPPD, and valid JSON refreshes table');
})().catch(error=>{console.error(error);process.exitCode=1;});
