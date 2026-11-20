import { useRef, useState } from 'react'
import {
  Database, Download, FileJson, FileSpreadsheet, Info, Loader2,
  LogOut, Smartphone, Upload, UserRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { exportBackupJSON, exportItemsCSV, readBackupFile } from '../lib/export.js'
import { formatDateTime } from '../lib/format.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Settings() {
  const { user, logout } = useAuth()
  const { items, activities, importBackup } = useData()
  const { showToast } = useToast()
  const fileRef = useRef(null)
  const [pendingRecords, setPendingRecords] = useState(null)
  const [busy, setBusy] = useState(false)

  const name = user?.displayName || user?.email?.split('@')[0] || 'Pengguna'

  const handleCSV = () => {
    exportItemsCSV(items)
    showToast('Data CSV berhasil diunduh.')
  }

  const handleBackup = () => {
    exportBackupJSON(items, activities)
    showToast('Backup JSON berhasil diunduh.')
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const records = await readBackupFile(file)
      setPendingRecords(records)
    } catch (err) {
      showToast('File backup tidak valid.', 'error')
    } finally {
      event.target.value = ''
    }
  }

  const confirmImport = async () => {
    setBusy(true)
    try {
      const count = await importBackup(pendingRecords)
      showToast(`${count} barang berhasil dipulihkan. Foto kwitansi tidak ikut ter-backup.`)
      setPendingRecords(null)
    } catch (err) {
      showToast(err.message || 'Gagal memulihkan backup.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page settings-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Akun & data</span>
          <h1>Pengaturan</h1>
          <p className="muted">Kelola profil, cadangkan data, dan aplikasi.</p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel">
          <div className="panel-head"><h2><UserRound size={18} /> Profil</h2></div>
          <div className="profile-row">
            <span className="avatar avatar--large"><UserRound size={26} /></span>
            <div>
              <strong>{name}</strong>
              <p className="muted small">{user?.email}</p>
              <span className="muted small">UID: {user?.uid?.slice(0, 12)}…</span>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2><Database size={18} /> Data inventaris</h2></div>
          <p className="muted small">Data tersimpan realtime di Firebase milik akunmu. Unduh salinan kapan saja.</p>
          <div className="settings-actions">
            <button className="btn btn--outline" onClick={handleCSV} disabled={!items.length}>
              <FileSpreadsheet size={17} /> Ekspor CSV
            </button>
            <button className="btn btn--outline" onClick={handleBackup} disabled={!items.length}>
              <FileJson size={17} /> Backup JSON
            </button>
            <button className="btn btn--outline" onClick={() => fileRef.current?.click()}>
              <Upload size={17} /> Pulihkan dari JSON
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleFile} />
          </div>
          <div className="data-stats">
            <div><strong>{items.length}</strong><span>barang</span></div>
            <div><strong>{activities.length}</strong><span>aktivitas</span></div>
            <div><strong>{items.filter((item) => item.receiptUrl).length}</strong><span>foto kwitansi</span></div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2><Smartphone size={18} /> Aplikasi</h2></div>
          <div className="app-info">
            <p><strong>InventarisKu</strong> v1.0</p>
            <p className="muted small">Web app + PWA. Bisa di-install di HP lewat menu browser <em>Add to Home Screen</em> / <em>Install app</em>.</p>
            <p className="muted small">Firebase project: <code>{import.meta.env.VITE_FIREBASE_PROJECT_ID}</code></p>
            <p className="muted small">Terakhir disimpan (data lokal): {formatDateTime(Date.now())}</p>
          </div>
          <div className="alert alert--info">
            <Info size={17} />
            <span>File backup JSON berisi data barang, foto kwitansi (sudah terkompres), dan catatan aktivitas. Semuanya tersimpan di Firestore — Storage tidak dipakai.</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2><LogOut size={18} /> Keluar</h2></div>
          <p className="muted small">Data tetap aman di Firebase. Kamu bisa masuk lagi kapan saja.</p>
          <button className="btn btn--danger-ghost" onClick={logout}><LogOut size={17} /> Keluar dari akun</button>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingRecords)}
        title="Pulihkan data backup?"
        message={`File berisi ${pendingRecords?.length || 0} barang. Data akan ditambahkan ke inventaris saat ini (tidak menimpa yang sudah ada).`}
        confirmLabel="Pulihkan sekarang"
        busy={busy}
        onConfirm={confirmImport}
        onClose={() => setPendingRecords(null)}
      />

      {busy && <div className="busy-overlay"><Loader2 size={28} className="spin" /></div>}
    </div>
  )
}
