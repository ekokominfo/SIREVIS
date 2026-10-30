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

Pilih bidang atau Semua Bidang untuk melihat rekap. Tombol Status tersedia pada setiap baris tabel dan memperbarui seluruh kelompok SPPD terkait. Pilihan status: Draf, Diajukan, Diverifikasi, atau Dikembalikan. Pemeriksa diisi manual dan wajib; Dikembalikan juga mewajibkan catatan.

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
