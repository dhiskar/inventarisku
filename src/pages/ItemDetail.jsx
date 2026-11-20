import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowUpRight, CalendarDays, Camera, Edit3, ExternalLink,
  Hash, Info, MapPin, Package, RotateCcw, Store, Tag, Trash2, Wallet,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import ExitModal from '../components/ExitModal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { exitTypes, getCategory, statuses } from '../lib/categories.js'
import { formatDate, formatDateTime, formatRupiah } from '../lib/format.js'
import LoadingScreen from '../components/LoadingScreen.jsx'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { items, activities, loading, setExit, restore, removeItem } = useData()
  const { showToast } = useToast()
  const [exitOpen, setExitOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const item = items.find((entry) => entry.id === id)

  if (loading && !item) return <LoadingScreen label="Memuat detail barang…" />

  if (!item) {
    return (
      <div className="panel">
        <h2>Barang tidak ditemukan</h2>
        <p className="muted">Barang mungkin sudah dihapus dari inventaris.</p>
        <Link to="/barang" className="btn btn--primary">Kembali ke daftar barang</Link>
      </div>
    )
  }

  const category = getCategory(item.category)
  const Icon = category.icon
  const exitLabel = exitTypes.find((type) => type.id === item.status)?.label || 'Keluar'
  const itemActivities = activities.filter((activity) => activity.itemId === item.id).slice(0, 5)

  const handleExit = async (form) => {
    setBusy(true)
    try {
      await setExit(item, form)
    } finally {
      setBusy(false)
    }
  }

  const handleRestore = async () => {
    setBusy(true)
    try {
      await restore(item)
      showToast('Barang kembali menjadi aktif.')
    } catch (err) {
      showToast(err.message || 'Gagal memulihkan barang.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await removeItem(item)
      showToast('Barang berhasil dihapus.')
      navigate('/barang')
    } catch (err) {
      showToast(err.message || 'Gagal menghapus barang.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const infoRows = [
    { icon: Tag, label: 'Kategori', value: category.label },
    { icon: Package, label: 'Kondisi', value: item.condition || '—' },
    { icon: Hash, label: 'Nomor seri', value: item.serialNumber || '—' },
    { icon: MapPin, label: 'Lokasi', value: item.location || '—' },
    { icon: Store, label: 'Toko / sumber', value: item.store || '—' },
    { icon: CalendarDays, label: 'Tanggal beli', value: formatDate(item.purchaseDate) },
  ]

  return (
    <div className="page detail-page">
      <Link to="/barang" className="back-link"><ArrowLeft size={16} /> Kembali ke daftar</Link>

      <div className="detail-hero panel" style={{ '--accent': category.color, '--tint': category.tint }}>
        <div className="detail-hero-media">
          {item.receiptUrl ? <img src={item.receiptUrl} alt={`Foto ${item.name}`} /> : <Icon size={54} strokeWidth={1.5} />}
        </div>
        <div className="detail-hero-info">
          <div className="detail-hero-top">
            <span className="eyebrow" style={{ color: category.color }}>{category.label}</span>
            <StatusBadge status={item.status} />
          </div>
          <h1>{item.name}</h1>
          {[item.brand, item.model].filter(Boolean).length > 0 && (
            <p className="detail-subtitle">{[item.brand, item.model].filter(Boolean).join(' · ')}</p>
          )}
          <div className="detail-price">
            <span>Harga beli</span>
            <strong>{formatRupiah(item.purchasePrice)}</strong>
            {item.quantity > 1 && <small>× {item.quantity} unit</small>}
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel">
            <div className="panel-head"><h2>Informasi barang</h2></div>
            <div className="info-grid">
              {infoRows.map(({ icon: RowIcon, label, value }) => (
                <div className="info-row" key={label}>
                  <span className="info-icon"><RowIcon size={16} /></span>
                  <div><span className="muted small">{label}</span><strong>{value}</strong></div>
                </div>
              ))}
            </div>
          </section>

          {item.exit && item.status !== 'owned' && (
            <section className="panel exit-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Barang keluar</span>
                  <h2>{exitLabel}</h2>
                </div>
                <span className="status-badge" style={{ color: statuses[item.status]?.color, background: statuses[item.status]?.tint }}>
                  {formatDate(item.exit.date)}
                </span>
              </div>
              <div className="exit-details">
                {item.exit.price > 0 && (
                  <div><span className="muted small">Harga jual</span><strong>{formatRupiah(item.exit.price)}</strong></div>
                )}
                {item.exit.recipient && (
                  <div><span className="muted small">Penerima</span><strong>{item.exit.recipient}</strong></div>
                )}
                {item.exit.note && (
                  <div className="field--full"><span className="muted small">Catatan</span><strong>{item.exit.note}</strong></div>
                )}
              </div>
            </section>
          )}

          {item.notes && (
            <section className="panel">
              <div className="panel-head"><h2><Info size={18} /> Catatan</h2></div>
              <p className="note-text">{item.notes}</p>
            </section>
          )}

          {item.receiptUrl && (
            <section className="panel">
              <div className="panel-head">
                <div><h2><Camera size={18} /> Foto kwitansi</h2><p className="muted small">Bukti pembelian yang kamu simpan</p></div>
                <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="btn btn--outline btn--small">
                  <ExternalLink size={15} /> Buka gambar
                </a>
              </div>
              <a href={item.receiptUrl} target="_blank" rel="noreferrer" className="receipt-preview">
                <img src={item.receiptUrl} alt={`Kwitansi ${item.name}`} />
              </a>
            </section>
          )}
        </div>

        <aside className="detail-aside">
          <div className="panel sticky-panel">
            <h2>Aksi</h2>
            <Link to={`/barang/${id}/edit`} className="btn btn--outline btn--block"><Edit3 size={17} /> Edit barang</Link>

            {item.status === 'owned' ? (
              <button className="btn btn--primary btn--block" onClick={() => setExitOpen(true)} disabled={busy}>
                <ArrowUpRight size={17} /> Keluarkan barang
              </button>
            ) : (
              <button className="btn btn--primary btn--block" onClick={handleRestore} disabled={busy}>
                <RotateCcw size={17} /> Pulihkan ke aktif
              </button>
            )}

            <button className="btn btn--danger-ghost btn--block" onClick={() => setDeleteOpen(true)} disabled={busy}>
              <Trash2 size={17} /> Hapus barang
            </button>

            <div className="aside-note">
              <Wallet size={15} />
              <span>Dicatat sejak {formatDateTime(item.createdAtMs)}</span>
            </div>
          </div>

          {itemActivities.length > 0 && (
            <div className="panel">
              <h2>Riwayat barang ini</h2>
              <div className="mini-timeline">
                {itemActivities.map((activity) => (
                  <div className="mini-timeline-row" key={activity.id}>
                    <span className="timeline-dot" />
                    <div>
                      <strong>{activity.title}</strong>
                      <span className="muted small">{formatDateTime(activity.createdAtMs)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <ExitModal open={exitOpen} item={item} onClose={() => setExitOpen(false)} onSubmit={handleExit} />
      <ConfirmDialog
        open={deleteOpen}
        title="Hapus barang ini?"
        message={`"${item.name}" dan foto kwitansi yang terkait akan dihapus permanen dari Firebase. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, hapus"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
