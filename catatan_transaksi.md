# Catatan Transaksi UMKM Foto Copy & Print
> Dokumen ini merupakan buku kas harian lokal untuk usaha Fotocopy & Percetakan.
> File ini dapat dibaca oleh aplikasi web lokal untuk memperbarui data transaksi.

---

## Ringkasan Keuangan
- **Unit Usaha**: Berkah Fotocopy & Digital Printing
- **Mata Uang**: IDR (Rupiah)
- **Status Data**: Aktif & Tersinkronisasi

---

## Data Transaksi

<!-- DATA_START -->
| ID | Tanggal | Tipe | Kategori | Keterangan | Nominal (Rp) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TRX-1728821001 | 2026-10-13 | PEMASUKAN | print | Print Skripsi Berwarna 45 Lembar & Jilid Mika | 75000 |
| TRX-1728821002 | 2026-10-13 | PEMASUKAN | fotocopy | Fotocopy Modul Materi Pelatihan 120 Lembar | 36000 |
| TRX-1728821003 | 2026-10-13 | PENGELUARAN | kertas | Beli Kertas HVS SiDU A4 75gsm (2 Rim) | 110000 |
| TRX-1728821004 | 2026-10-13 | PEMASUKAN | scan | Scan Dokumen Ijazah & Cetak Pas Foto 3x4 | 25000 |
| TRX-1728821005 | 2026-10-13 | PENGELUARAN | tinta_toner | Isi Ulang Tinta Printer Hitam & Cyan | 85000 |
| TRX-1728821006 | 2026-10-13 | PEMASUKAN | atk | Penjualan Stopmap Folio, Pulpen, & Amplop Coklat | 22000 |
| TRX-1728821007 | 2026-10-13 | PEMASUKAN | jilid_laminating | Jilid Hardcover Tugas Akhir Mahasiswa | 60000 |
| TRX-1728821008 | 2026-10-13 | PENGELUARAN | listrik_operasional | Token Listrik Operasional Mesin Fotocopy | 100000 |
<!-- DATA_END -->

---

## Petunjuk Penggunaan untuk Aplikasi:
1. Aplikasi secara otomatis dapat membaca tabel di atas melalui parser lokal.
2. Kolom `Tipe` hanya bernilai `PEMASUKAN` atau `PENGELUARAN`.
3. Kolom `Kategori` yang didukung:
   - Pemasukan: `fotocopy`, `print`, `jilid_laminating`, `scan`, `atk`, `pemasukan_lain`
   - Pengeluaran: `kertas`, `tinta_toner`, `service_mesin`, `listrik_operasional`, `stok_atk`, `pengeluaran_lain`
4. Anda dapat mengedit langsung file ini secara manual atau melakukan ekspor langsung dari aplikasi web.
