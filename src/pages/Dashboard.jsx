import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Boxes, CircleDollarSign,
  History, PackageCheck, Plus, ReceiptText, Sparkles, Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import { categories, statuses } from '../lib/categories.js'
import { formatDate, formatRupiah, formatShortRupiah, relativeTime } from '../lib/format.js'
import { totalPurchase, totalSale } from '../lib/export.js'
import EmptyState from '../components/EmptyState.jsx'

const activityIcons = {
  create: Plus,
  update: ReceiptText,
  delete: Boxes,
  exit: ArrowUpRight,
  restore: PackageCheck,
}

export default function Dashboard() {
  const { user } = useAuth()
  const { items, activities, loading } = useData()
  const navigate = useNavigate()

  const active = items.filter((item) => item.status === 'owned')
  const spent = totalPurchase(items)
  const inventoryValue = totalPurchase(active)
  const saleValue = totalSale(items)
  const exited = items.length - active.length
  const name = user?.displayName || user?.email?.split('@')[0] || 'kamu'

  const categoryData = categories
    .map((category) => ({
      ...category,
      count: active.filter((item) => item.category === category.id).length,
    }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count)

  const totalActive = active.length || 1
  let offset = 0
  const donutSegments = categoryData.map((category) => {
    const start = (offset / totalActive) * 100
    offset += category.count
    const end = (offset / totalActive) * 100
    return `${category.color} ${start}% ${end}%`
  })
  const donut = donutSegments.length
    ? `conic-gradient(${donutSegments.join(', ')})`
    : 'conic-gradient(#e9edf5 0% 100%)'

  const statusData = Object.entries(statuses).map(([id, meta]) => ({
    id, ...meta, count: items.filter((item) => item.status === id).length,
  }))

  const stats = [
    { label: 'Barang aktif', value: active.length, suffix: 'barang', icon: Boxes, color: '#4f46e5', tint: '#eef2ff' },
    { label: 'Nilai inventaris', value: formatShortRupiah(inventoryValue), icon: CircleDollarSign, color: '#0f9d58', tint: '#e8f6ee' },
    { label: 'Total pengeluaran', value: formatShortRupiah(spent), icon: Wallet, color: '#f59e0b', tint: '#fff7e6' },
    { label: 'Hasil penjualan', value: formatShortRupiah(saleValue), icon: ArrowUpRight, color: '#0ea5e9', tint: '#e6f6fe' },
  ]

  return (
    <div className="page dashboard">
      <div className="page-heading">
        <div>
          <span className="eyebrow">{formatDate(new Date())}</span>
          <h1>Halo, {name} 👋</h1>
          <p className="muted">Ringkasan seluruh barang yang kamu catat.</p>
        </div>
        <Link to="/barang/baru" className="btn btn--primary heading-action">
          <Plus size={17} /> Tambah barang
        </Link>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((n) => <div key={n} className="skeleton-card" />)}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div className="stat-card" key={stat.label}>
                  <span className="stat-icon" style={{ background: stat.tint, color: stat.color }}><Icon size={21} /></span>
                  <div>
                    <span className="stat-label">{stat.label}</span>
                    <strong className="stat-value">{stat.value}</strong>
                    {stat.suffix && <small className="stat-suffix">{stat.suffix}</small>}
                  </div>
                </div>
              )
            })}
          </div>

          {items.length === 0 ? (
            <div className="panel">
              <EmptyState
                title="Inventaris masih kosong"
                message="Mulai catat barang yang kamu beli — laptop, HP, pakaian, atau apa pun. Foto kwitansi juga bisa disimpan."
                actionLabel="Tambah barang pertama"
                onAction={() => navigate('/barang/baru')}
              />
            </div>
          ) : (
            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Komposisi barang aktif</h2>
                    <p className="muted small">Berdasarkan kategori</p>
                  </div>
                  <Link to="/barang" className="link-button">Lihat semua <ArrowRight size={14} /></Link>
                </div>
                <div className="donut-layout">
                  <div className="donut" style={{ background: donut }}>
                    <div className="donut-hole">
                      <strong>{active.length}</strong>
                      <span>barang</span>
                    </div>
                  </div>
                  <div className="legend">
                    {categoryData.length === 0 && <p className="muted">Belum ada barang aktif.</p>}
                    {categoryData.map((category) => (
                      <div className="legend-row" key={category.id}>
                        <span className="legend-dot" style={{ background: category.color }} />
                        <span className="legend-label">{category.label}</span>
                        <strong>{category.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Status inventaris</h2>
                    <p className="muted small">{items.length} barang tercatat</p>
                  </div>
                </div>
                <div className="status-list">
                  {statusData.map((status) => (
                    <div className="status-row" key={status.id}>
                      <div className="status-row-head">
                        <span>{status.label}</span>
                        <strong>{status.count}</strong>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(status.count / Math.max(items.length, 1)) * 100}%`, background: status.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel panel--wide">
                <div className="panel-head">
                  <div>
                    <h2>Aktivitas terbaru</h2>
                    <p className="muted small">Catatan perubahan data barangmu</p>
                  </div>
                  <Link to="/riwayat" className="link-button"><History size={14} /> Riwayat keluar</Link>
                </div>
                {activities.length === 0 ? (
                  <p className="muted empty-inline">Belum ada aktivitas.</p>
                ) : (
                  <div className="activity-list">
                    {activities.slice(0, 6).map((activity) => {
                      const Icon = activityIcons[activity.type] || Sparkles
                      return (
                        <div className="activity-row" key={activity.id}>
                          <span className="activity-icon"><Icon size={16} /></span>
                          <div className="activity-text">
                            <strong>{activity.title}</strong>
                            <span>{activity.detail || relativeTime(activity.createdAtMs)}</span>
                          </div>
                          <span className="activity-time">{relativeTime(activity.createdAtMs)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>
          )}

          {exited > 0 && (
            <Link to="/riwayat" className="insight-card">
              <span className="insight-icon"><ArrowDownRight size={20} /></span>
              <div>
                <strong>{exited} barang sudah keluar dari inventaris</strong>
                <p className="muted small">Total hasil penjualan {formatRupiah(saleValue)} — cek detailnya di halaman riwayat.</p>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
        </>
      )}
    </div>
  )
}
