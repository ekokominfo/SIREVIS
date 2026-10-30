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
