# Catatan revisi

## Perubahan

- Navbar logo dan Keluar ditempatkan di atas. Kontainer utama menggunakan alur blok; sebelumnya perubahan display menjadi flex mendatar membuat navbar mengambil ruang di kiri.
- Kartu dashboard responsif; tabel lebar digeser di dalam kontainer.
- Grafik anggaran horizontal dengan pemendekan label panjang dan tooltip bawaan Chart.js.
- Nama pegawai dan lokasi pada daftar peringkat dapat membungkus baris.
- Pencarian, pengurutan, pagination, dan filter bulan/tahun memakai hasil data yang sama.
- Filter menyinkronkan tabel, KPI, grafik, peringkat dan data terbaru.
- ID SPPD dan ID baris disimpan terpisah dari nomor baris spreadsheet.
- Menghapus pegawai pertama meneruskan nomor kepada anggota berikutnya.
- Tanggal mulai dan selesai disimpan terpisah; label lintas bulan/tahun benar.
- Status dan pemeriksaan tersedia melalui tombol Status pada tabel Atasan.
- Validasi biaya, tanggal, status, dan nama; tombol Simpan dinonaktifkan selama permintaan berlangsung.
- Operasi tulis memakai lock untuk mengurangi benturan penyimpanan bersamaan.

## Bukti pengujian lokal

Perintah: `node tests/check.cjs`.

Lulus: agregasi kelompok data lama dan biaya, penghapusan pegawai pertama, kestabilan ID setelah simpan, penambahan SPPD, tanggal selesai lintas bulan, perubahan status verifikasi, penolakan input tidak valid, serta sintaks backend dan JavaScript dalam HTML.

Pengujian menggunakan simulasi SpreadsheetApp. Tidak membuktikan akses Google, rendering browser, otorisasi deployment, atau perilaku pada data produksi. Gunakan checklist pemasangan untuk pengujian langsung.

## Ditunda dan batasan

- Otorisasi server dan sesi aman belum diimplementasikan. Role saat ini mengatur antarmuka; endpoint belum memeriksa identitas pemanggil.
- Password masih dibandingkan dengan teks dalam sheet Pengguna.
- Audit perubahan dan arsip/soft delete belum dibuat.
- Nama pemeriksa masih diisi manual.
- Status dapat dipilih langsung tanpa pembatasan urutan transisi.
- Tidak ada halaman edit data perjalanan; revisi ini menyediakan tambah, hapus pegawai, dan perubahan status.
- Proteksi klik ganda bekerja selama permintaan browser berlangsung; belum ada idempotency key untuk mencegah duplikasi bila respons hilang lalu pengguna mengirim ulang.
- Dua pengguna yang menulis sebelum migrasi ID pertama selesai mungkin perlu memuat ulang jika ID sementara sudah tidak cocok.
- Migrasi ID menggunakan rentang kolom I–J; kolom I–P harus dicadangkan untuk aplikasi.
- Belum ada validasi kalender ketat di server selain pola ISO dan urutan tanggal; input normal dibatasi oleh elemen date di browser.

Backup ini tidak mempublikasikan deployment Google Apps Script dan tidak memindahkan data spreadsheet.
