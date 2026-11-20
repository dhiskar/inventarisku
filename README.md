# InventarisKu 📦

Aplikasi web **inventaris barang pribadi** berbasis Firebase. Bisa diakses dari HP/laptop lewat browser, dan bisa di-install seperti aplikasi (PWA).

Project ini **baru dan berdiri sendiri**. Tidak terhubung dengan project lain di folderworkspace maupun Firebase lama. Kamu tinggal membuat Firebase project baru lalu memasukkan kuncinya lewat file `.env.local`.

## Fitur

### Barang
- Tambah, edit, hapus barang (laptop, HP, pakaian, dll).
- Field lengkap: nama, kategori, merek, model, nomor seri, jumlah, kondisi, lokasi, tanggal beli, harga beli, toko/sumber, dan catatan.
- Upload **foto kwitansi/nota** (dikompres otomatis dan disimpan langsung di **Firestore**, **tanpa Firebase Storage** — tetap dalam kuota gratis).
- Foto kwitansi bisa dilihat/dibuka langsung dari detail barang.
- Pencarian, filter status, filter kategori, dan pengurutan.
- Tampilan grid/list yang responsif di HP.

### Sirkulasi barang
- Tandai barang **Masih dipakai**, **Dijual**, **Diberikan**, **Hilang**, atau **Rusak/Dibuang**.
- Catat tanggal keluar, harga jual, nama penerima, dan catatan tambahan.
- Barang yang sudah keluar bisa **dipulihkan** kembali ke inventaris.
- Halaman **Riwayat** berisi semua barang keluar + total uang hasil penjualan.

### Ringkasan & data
- Dashboard: nilai inventaris, total pengeluaran, jumlah barang aktif/keluar, komposisi kategori (donut chart), dan aktivitas terbaru.
- Ekspor data ke **CSV** (bisa dibuka di Excel) dan **backup JSON**.
- Restore data dari file backup JSON.
- Login email/password + Google, data terpisah per akun (auth UID).
- Aturan keamanan Firestore: user hanya bisa mengakses datanya sendiri. Storage **tidak dipakai**.

## Clone dari GitHub

```bash
git clone https://github.com/dhiskar/inventarisku.git
cd inventarisku
npm install
copy .env.example .env.local   # Windows: salin dan isi dengan config Firebase kamu
npm run dev
```

> **Penting:** file `.env.local` **sengaja tidak ikut di-upload ke GitHub** demi keamanan. Setelah clone di komputer/laptop mana pun, buat ulang file itu dari `.env.example` dan isi dengan konfigurasi Firebase project kamu. File `.firebaserc` sudah ikut supaya `firebase deploy --only hosting` langsung tahu target projectnya.

## Menjalankan

```bash
npm install
npm run generate:icons   # hanya perlu sekali, membuat icon-192.png & icon-512.png
cp .env.example .env.local   # Windows: copy .env.example .env.local
# isi .env.local dengan konfigurasi Firebase BARU kamu
npm run dev
```

Buka `http://localhost:5173` di browser. Untuk diakses dari HP yang satu WiFi, gunakan alamat IP lokal yang ditampilkan Vite (mis. `http://192.168.1.5:5173`).

> Jika `.env.local` belum diisi, aplikasi akan menampilkan halaman panduan setup otomatis.

## Deploy (opsional)

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase use --add     # pilih Firebase project BARU kamu
npm run build
firebase deploy
```

### Build statis lain
`npm run build` menghasilkan folder `dist/` yang bisa di-upload ke hosting statis apa pun. Pastikan ada rewrite semua URL ke `index.html` agar routing tetap bekerja.

## Struktur folder

```
src/
  components/   Komponen UI (layout, kartu barang, modal, dll)
  context/      Auth, Data (Firestore realtime), Toast
  lib/          Format rupiah/tanggal, kategori, CRUD Firebase, ekspor, kompresi gambar
  pages/        Dashboard, Daftar Barang, Form, Detail, Riwayat, Pengaturan, Login, Setup
firestore.rules                 Aturan keamanan (dipakai)
storage.rules                   Opsional, tidak dipakai aplikasi ini
```

## Catatan biaya
Aplikasi ini hanya memakai **Authentication + Firestore + Hosting**, semuanya punya kuota gratis Spark. Foto kwitansi dikompres di browser sampai di bawah ~650 KB sebelum disimpan di Firestore, jadi tidak menyentuh Firebase Storage sama sekali.

## Catatan dependensi
`npm audit` mungkin melaporkan advisory pada `@grpc/grpc-js` (transitif dari Firebase Firestore). Itu hanya modul transport Node.js untuk server; aplikasi browser memakai koneksi web Firestore dan tidak menggabungkan modul tersebut ke bundle. Tidak ada perbaikan yang aman tanpa menurunkan Firebase ke versi sangat lama, jadi versi terbaru tetap digunakan.

Lihat **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** untuk langkah lengkap membuat project Firebase baru.
