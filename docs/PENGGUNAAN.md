# Struktur data dan penggunaan

## Sheet Pengguna

Baris 1 adalah header; data mulai baris 2.

| Kolom | Isi |
| --- | --- |
| A | Username |
| B | Password yang dibandingkan sebagai teks |
| C | Role; nilai tepat `Atasan` membuka dashboard eksekutif |
| D | Nama sheet bidang untuk staf |

Role selain `Atasan` memakai tampilan staf. Nama bidang harus cocok dengan nama sheet. Semua sheet selain Pengguna dianggap sheet bidang; jangan tambahkan sheet catatan atau rekap lain tanpa menyesuaikan kode.

## Sheet bidang

Baris 1–4 disisihkan untuk judul/header. Data dimulai pada baris 5.

| Kolom | Isi |
| --- | --- |
| A | Nomor SPPD; ditulis pada pegawai pertama |
| B | Nama pegawai |
| C | Dalam Daerah atau Luar Daerah |
| D | Biaya numerik |
| E | Tanggal/rentang tanggal untuk tampilan |
| F | Tujuan |
| G | Keterangan |
| H | Tanggal verifikasi atau `-` |
| I | ID SPPD bersama untuk satu kelompok |
| J | ID tetap baris pegawai |
| K | Tanggal mulai, format ISO yyyy-MM-dd |
| L | Tanggal selesai, format ISO yyyy-MM-dd atau kosong |
| M | Status |
| N | Nama pemeriksa |
| O | Waktu pemeriksaan |
| P | Catatan pemeriksaan |

Data lama tanpa ID dibaca sebagai kelompok berdasarkan nomor pada kolom A. ID lama dipersistenkan sebelum operasi tulis pertama pada bidang tersebut. Jangan menyisipkan ID secara acak atau mengubah kolom I–J setelah migrasi.

## Staf

Login menggunakan akun dalam Pengguna. Tekan Tambah SPPD, isi pegawai dan gunakan Pegawai Pengikut untuk menambahkan peserta dalam kelompok yang sama. Tanggal mulai wajib, tanggal selesai opsional. Status awal yang tersedia adalah Draf atau Diajukan.

Tombol Hapus menghapus satu baris pegawai, bukan seluruh kelompok. Bila pegawai pertama dihapus, nomor diteruskan ke pegawai berikutnya. Penghapusan bersifat permanen pada spreadsheet; fitur arsip belum dibuat.

## Atasan

Pilih bidang atau Semua Bidang untuk melihat rekap. Tombol Detail tersedia pada setiap baris tabel. Popup menampilkan seluruh pegawai dalam SPPD tersebut, jumlah peserta, total biaya, serta rincian perjalanan dan verifikasi masing-masing peserta. Form Ubah status SPPD di dalam popup memperbarui seluruh kelompok SPPD terkait. Pilihan status: Draf, Diajukan, Diverifikasi, atau Dikembalikan. Pemeriksa diisi manual dan wajib; Dikembalikan juga mewajibkan catatan.

Pilihan status belum menerapkan pembatasan urutan transisi. Diverifikasi mengisi tanggal verifikasi; status lainnya mengosongkannya menjadi `-`.

## Arti perhitungan

- Total SPPD menghitung ID kelompok unik pada hasil filter.
- Total anggaran menjumlahkan biaya baris pegawai hasil filter.
- Dalam/Luar Daerah menghitung ID kelompok unik per jenis; bila satu kelompok memiliki kedua jenis, dapat masuk kedua hitungan.
- Peringkat pegawai menghitung jumlah baris pegawai per nama, bukan identitas kepegawaian unik.
- Peringkat tujuan menghitung satu tujuan dari baris pertama yang ditemukan per kelompok hasil filter.
- Pagination menampilkan jumlah baris pegawai, bukan jumlah SPPD.
- Filter bulan dan tahun mengikuti tanggal mulai. Kegiatan lintas bulan masuk bulan tanggal mulai.
- Pencarian dan filter juga memperbarui KPI, grafik, peringkat, serta lima SPPD terbaru. Pencarian nama dapat membuat rekap hanya mencakup baris pegawai yang cocok.
- Lima SPPD terbaru diurutkan menurut tanggal mulai kegiatan, bukan waktu input; bila tanggal sama, nomor baris menjadi pembanding tambahan.

Data tanggal lama dikenali bila berupa tanggal ISO/Date atau teks dengan nama bulan Indonesia, hari, dan tahun. Format lain perlu dirapikan agar filter dan urutan tanggal akurat.

## Tampilan rincian data

Judul dashboard, deskripsi, dan pilihan bidang berada dalam header. Filter bulan, tahun, dan pencarian berada di Rincian Data SPPD dan tetap memperbarui rekap dashboard. Urutan awal rincian mengikuti tanggal mulai kegiatan terbaru lintas bidang; Reset filter juga mengembalikan urutan ini. Tombol pengurutan kolom tetap tersedia.

Kolom No menunjukkan nomor urut baris hasil filter, berlanjut pada halaman berikutnya. No SPPD menambahkan kode bidang pada nomor asli: KEP (Kepegawaian), KEU (Keuangan), LKP (Layanan Komunikasi Publik), PIP (Pengelola Informasi Publik), APT (Aplikasi Informatika), SPD (Statistik dan Persandian). Contoh: 1LKP, 4KEU, 2APT. Nama bidang lain tetap memakai nomor asli.

Kata Register dihilangkan pada label tampilan. Nama sheet, nomor dalam spreadsheet, dan ID internal tetap digunakan seperti sebelumnya.

Uji lokal tambahan untuk urutan, nomor, dan filter: `node tests/frontend.cjs`.

Nama Aptika dikenali sebagai Aplikasi Informatika (APT), dan Standi sebagai Statistik dan Persandian (SPD). Titik/spasi pemisah sebelum kode bidang dihilangkan pada tampilan, misalnya 17.PIP menjadi 17PIP. Pencarian menyorot kecocokan teks pada tabel rincian tanpa membedakan huruf besar/kecil.

Popup Detail mengambil seluruh peserta dari bidang dan ID SPPD yang sama, bukan hanya peserta yang lolos filter/pencarian atau halaman aktif. Jumlah peserta tidak digabung hanya berdasarkan nomor tampilan. Staf tetap dapat membuka Detail serta menghapus baris pegawai melalui tombol Hapus; pengubahan status di popup tersedia untuk Atasan.
