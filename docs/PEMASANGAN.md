# Pemasangan dan pemulihan

## Persiapan

1. Buat salinan spreadsheet melalui **File → Buat salinan**.
2. Simpan salinan kode Apps Script dan catat deployment yang sedang digunakan.
3. Pastikan setiap sheet bidang memiliki data mulai baris 5 dan kolom A–H sesuai struktur pada [panduan penggunaan](PENGGUNAAN.md).
4. Pastikan kolom I–P kosong atau belum digunakan untuk keperluan lain. Kode akan menulis metadata di kolom tersebut saat operasi tulis pertama.
5. Atur zona waktu proyek Apps Script dan spreadsheet sesuai lokasi instansi, misalnya Asia/Jakarta untuk WIB. Format tanggal backend mengikuti zona waktu proyek.

## Memasang kode

1. Buka spreadsheet, pilih **Ekstensi → Apps Script**. Backend memakai `getActiveSpreadsheet()`, sehingga proyek perlu terikat pada spreadsheet yang tepat.
2. Ganti seluruh isi file `Code.gs` dengan `Code.gs` dari repositori.
3. Buat atau gunakan file HTML bernama **Index**, lalu ganti seluruh isinya dengan `Index.html` dari repositori. Jangan tambahkan kode baru di bawah versi lama.
4. Simpan perubahan. Jalankan melalui deployment web app/pengujian, bukan dengan membuka HTML langsung.
5. Tinjau pengaturan siapa yang dapat mengakses deployment sesuai kebijakan instansi. Revisi ini belum menambahkan otorisasi server.
6. Untuk deployment yang sudah ada: **Deploy → Kelola deployment → Edit → Versi baru → Deploy**. Gunakan akun pemilik yang memiliki akses spreadsheet dan selesaikan otorisasi Google jika diminta.

HTML mengambil Bootstrap, Chart.js, dan font melalui `cdn.jsdelivr.net` serta `fonts.googleapis.com`/`fonts.gstatic.com`. Browser pengguna perlu dapat mengakses domain tersebut.

## Checklist pengujian di Google

- Login Atasan dan Staf berhasil; login yang salah menampilkan pesan.
- Logo dan Keluar berada di atas pada desktop dan ponsel; tabel digeser di dalam kontainernya.
- Atasan dapat memilih satu bidang atau Semua Bidang.
- Filter bulan/tahun, pencarian, urutan nama/biaya/tanggal, dan pagination berfungsi.
- KPI, grafik, peringkat, dan data terbaru mengikuti hasil filter.
- Staf hanya melihat dashboard bidang yang dikembalikan login pada antarmuka.
- Tambah SPPD dengan dua pegawai; keduanya memiliki ID SPPD yang sama dan ID baris berbeda.
- Coba rentang tanggal lintas bulan/tahun; label dan metadata sesuai.
- Biaya negatif dan tanggal selesai sebelum mulai ditolak.
- Hapus pegawai pertama; pegawai berikutnya tetap memiliki nomor dan kelompok SPPD.
- Atasan mengubah status melalui tombol Status di tabel; perubahan berlaku pada semua pegawai satu SPPD.
- Dikembalikan memerlukan catatan; pemeriksa dan waktu tercatat.
- Gangguan server menampilkan pesan dan tombol Simpan dapat dipakai lagi.

Checklist ini adalah langkah uji manual yang perlu dilakukan pada deployment asli, bukan klaim sudah lulus di Google.

## Backup dan pemulihan

GitHub menyimpan kode dan dokumentasi. Data spreadsheet dan proyek/deployment Google harus dicadangkan terpisah.

Untuk kembali ke revisi lama, ambil `Code.gs` dan `Index.html` dari commit yang diinginkan, pasang ke Apps Script, lalu buat versi deployment baru. Bila perlu memulihkan data, gunakan salinan spreadsheet atau histori versi Google Sheets. Mengembalikan kode tidak otomatis mengembalikan data yang diubah atau dihapus.

Jangan menyimpan password, isi sheet Pengguna, atau data pegawai ke repositori.
