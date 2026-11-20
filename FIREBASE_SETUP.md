# Panduan Setup Firebase Baru (Penting)

Ikuti langkah ini agar data aplikasi terpisah dari project Firebase lama kamu.

## 1. Buat Firebase project BARU

1. Buka https://console.firebase.google.com/
2. Klik **Add project** / **Buat project**.
3. Nama bebas, misalnya `inventarisku-pribadi`. **Jangan pilih project lama**.
4. Google Analytics boleh dimatikan kalau tidak diperlukan.
5. Tunggu sampai project selesai dibuat.

## 2. Daftarkan aplikasi web

1. Di halaman ringkasan project, klik ikon **Web** (`</>`).
2. Beri nama aplikasi, misalnya `inventarisku-web`.
3. **Centang juga "Also set up Firebase Hosting"** kalau mau deploy nanti (opsional).
4. Setelah selesai, akan muncul kode `firebaseConfig`. Salin nilai-nilainya.

## 3. Isi file `.env.local`

Di folder project ini:

```powershell
copy .env.example .env.local
notepad .env.local
```

Isi seperti contoh (pakai nilai dari langkah 2, bukan nilai lama):

```env
VITE_FIREBASE_API_KEY=AIzaSy................
VITE_FIREBASE_AUTH_DOMAIN=inventarisku-pribadi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=inventarisku-pribadi
VITE_FIREBASE_STORAGE_BUCKET=inventarisku-pribadi.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
# MeasurementId opsional, tidak semua project memilikinya
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

 > Catatan: untuk project baru, `STORAGE_BUCKET` biasanya berakhir `.firebasestorage.app`. Kalau project lama kamu memakai `.appspot.com`, itu tidak masalah — pakai apa yang tertulis di console project **baru** ini.

Simpan, lalu **restart** `npm run dev` (tekan Ctrl+C lalu jalankan lagi).

## 4. Aktifkan Authentication

1. Menu **Build → Authentication** → **Get started**.
2. Tab **Sign-in method**.
3. Aktifkan **Email/Password** → Enable → Save.
4. Aktifkan juga **Google** → Enable → pilih email support → Save.
5. Tab **Settings → Authorized domains** — `localhost` sudah ada. Kalau deploy, tambahkan domain hostingmu.

## 5. Buat Cloud Firestore

1. Menu **Build → Firestore Database** → **Create database**.
2. Pilih lokasi terdekat (mis. `asia-southeast1` / Singapura).
3. Mulai dalam **production mode**.
4. Tab **Rules**, hapus semua isinya lalu paste isi file [`firestore.rules`](./firestore.rules), lalu **Publish**.
5. (Opsional) Buat komposit index tidak diperlukan karena query sudah disederhanakan.

Aturan ini memastikan user hanya bisa membaca/menulis data yang berada di `users/{uid}-nya` sendiri.

## 6. Storage — TIDAK perlu diaktifkan

Aplikasi ini **sengaja tidak memakai Firebase Storage**. Foto kwitansi dikompres di browser (maks. ~650 KB) lalu disimpan langsung sebagai field `receiptData` di dokumen Firestore. Jadi cukup Authentication + Firestore saja, keduanya gratis di plan Spark. File `storage.rules` dan `firebase.json` masih ada sebagai cadangan, tapi tidak diperlukan.

> Kalau kamu sudah menekan "Get started" di Storage, tidak apa-apa —biarkan saja, aplikasi tidak akan menggunakannya dan tidak ada biaya selama tidak ada file yang diupload ke sana.

## 7. Coba aplikasi

1. Jalankan `npm run dev`.
2. Buka `http://localhost:5173`.
3. Klik **Daftar**, buat akun dengan email & password.
4. Tambah barang pertama, coba upload kwitansi, lalu tandai sebagai dijual/diberikan.
5. Buka Firebase Console → **Firestore Database → Data** untuk memastikan dokumen `users/{uid}/items` masuk.

## 8. (Opsional) Deploy ke Firebase Hosting

```powershell
npm install -g firebase-tools
firebase login
firebase use --add        # pilih project BARU
npm run build
firebase deploy
```

Setelah deploy, tambahkan domain yang diberikan Firebase ke **Authentication → Settings → Authorized domains**.

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Halaman "Panduan Setup" tetap muncul | Pastikan variabel wajib di `.env.local` sudah terisi (API key, auth domain, project id, storage bucket, sender id, app id). `measurementId` opsional. Lalu restart dev server. |
| Error `permission-denied` | Rules Firestore belum dipublish. Ulangi langkah 5. |
| Error `auth/popup-closed-by-user` | Izinkan popup untuk situs di browser, atau gunakan login email/password. |
| Foto gagal upload | Pastikan tipe file gambar (JPG/PNG/WebP), ukuran asli < 5 MB, dan rules Firestore sudah dipublish. Foto besar akan dikompres otomatis; kalau tetap gagal, pakai foto dengan resolusi lebih rendah. |
| Data tidak muncul di HP | Pastikan HP dan komputer satu WiFi, dan gunakan IP lokal yang ditampilkan Vite (bukan `localhost`). |
| Tidak bisa install di HP | Butuh HTTPS (Firebase Hosting sudah HTTPS) atau `localhost`. Buka lewat Chrome → menu → **Install app**. |
