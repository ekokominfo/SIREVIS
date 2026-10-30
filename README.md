# SIREVIS

Sistem Informasi Registrasi SPPD untuk DISKOMINFOSTANDI, menggunakan Google Apps Script sebagai backend dan Google Sheets sebagai penyimpanan data.

Repositori ini menyimpan kode revisi yang dibahas dalam percakapan: navbar di atas, layout responsif, ID SPPD tetap, tanggal mulai/selesai terpisah, status verifikasi, pencarian, pengurutan, pagination, serta filter dashboard yang seragam.

## Isi repositori

- `Code.gs`: backend Apps Script, login, pembacaan spreadsheet, rekap, simpan, hapus, dan perubahan status.
- `Index.html`: tampilan login dan dashboard Atasan/Staf.
- `tests/check.cjs`: pengujian backend dengan simulasi spreadsheet dan pemeriksaan sintaks JavaScript.
- [Panduan pemasangan](docs/PEMASANGAN.md).
- [Struktur data dan penggunaan](docs/PENGGUNAAN.md).
- [Catatan revisi dan batasan](docs/REVISI.md).

## Mulai

Gunakan proyek Apps Script yang terikat pada spreadsheet. Cadangkan spreadsheet dan kode lama, pastikan kolom I–P belum dipakai, lalu ganti isi `Code.gs` dan file HTML bernama `Index` dengan berkas dalam repositori ini. Detail tersedia di panduan pemasangan.

Untuk memeriksa kode secara lokal, gunakan Node.js 24:

```sh
node tests/check.cjs
```

Aplikasi perlu dijalankan pada Google Apps Script. Membuka HTML langsung atau memakai server statis tidak menyediakan `google.script.run`, `SpreadsheetApp`, atau layanan Google lainnya.

## Status validasi

Pengujian lokal dengan simulasi spreadsheet lulus. Belum diuji pada spreadsheet Google asli dan deployment pengguna. Backup GitHub ini berisi kode serta dokumentasi; tidak mencakup isi spreadsheet, akun pengguna, atau deployment Apps Script.

Keamanan akses server, penggantian mekanisme password, serta audit/arsip ditunda sesuai lingkup revisi.
