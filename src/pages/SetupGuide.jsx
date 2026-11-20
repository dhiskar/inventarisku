import { ArrowRight, Cloud, ExternalLink, KeyRound, ShieldCheck, Terminal } from 'lucide-react'
import { isFirebaseConfigured } from '../firebase.js'

const envExample = `VITE_FIREBASE_API_KEY=AIzaSy................
VITE_FIREBASE_AUTH_DOMAIN=nama-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nama-project
VITE_FIREBASE_STORAGE_BUCKET=nama-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
# measurementId tidak wajib, boleh kosong`

export default function SetupGuide() {
  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-icon"><Cloud size={30} /></div>
        <span className="eyebrow">Project Firebase baru</span>
        <h1>Siapkan koneksi Firebase dulu</h1>
        <p className="muted">
          Aplikasi ini sengaja dibuat terpisah dari project lain. Belum ada kunci Firebase yang terdeteksi,
          jadi data belum bisa disimpan. Ikuti 4 langkah singkat di bawah ini.
        </p>

        {isFirebaseConfigured && (
          <div className="alert alert--warning">
            Kunci sudah terbaca, tetapi Firebase gagal diinisialisasi. Cek kembali nilai di <code>.env.local</code>,
            lalu restart dev server.
          </div>
        )}

        <ol className="setup-steps">
          <li>
            <div className="step-number"><ExternalLink size={16} /></div>
            <div>
              <strong>Buat project Firebase baru</strong>
              <p>Di Firebase Console, klik <em>Add project</em>. Jangan gunakan project lama.</p>
              <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer">
                Buka Firebase Console <ArrowRight size={14} />
              </a>
            </div>
          </li>
          <li>
            <div className="step-number"><Terminal size={16} /></div>
            <div>
              <strong>Daftarkan aplikasi Web</strong>
              <p>Di halaman project, klik ikon <code>&lt;/&gt;</code> lalu salin nilai <code>firebaseConfig</code>.</p>
            </div>
          </li>
          <li>
            <div className="step-number"><KeyRound size={16} /></div>
            <div>
              <strong>Buat file <code>.env.local</code></strong>
              <p>Salin <code>.env.example</code> menjadi <code>.env.local</code> di folder project, lalu isi dengan kunci project baru kamu:</p>
              <pre>{envExample}</pre>
            </div>
          </li>
          <li>
            <div className="step-number"><ShieldCheck size={16} /></div>
            <div>
              <strong>Aktifkan layanan & aturan</strong>
              <p>Aktifkan <strong>Authentication</strong> (Email/Password + Google) dan <strong>Firestore Database</strong>. Lalu publish isi file <code>firestore.rules</code> di Firebase Console. <strong>Storage tidak diperlukan</strong> — foto kwitansi disimpan di Firestore.</p>
            </div>
          </li>
        </ol>

        <div className="setup-footer">
          <p>Setelah itu, jalankan ulang:</p>
          <pre className="inline-pre">npm run dev</pre>
          <p className="muted small">Panduan lengkap ada di file <code>FIREBASE_SETUP.md</code> dalam folder project ini.</p>
        </div>
      </div>
    </div>
  )
}
