import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Gift, History as HistoryIcon, PackageX, Search, Wallet } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { exitTypes } from '../lib/categories.js'
import { formatDate, formatRupiah } from '../lib/format.js'
import EmptyState from '../components/EmptyState.jsx'

const typeIcons = { sold: ArrowUpRight, gifted: Gift, lost: PackageX, disposed: PackageX }

export default function History() {
  const { items } = useData()
  const [filter, setFilter] = useState('all')

  const exited = useMemo(
    () => items.filter((item) => item.status !== 'owned').sort((a, b) => (b.exit?.date || '').localeCompare(a.exit?.date || '')),
    [items],
  )

  const filtered = filter === 'all' ? exited : exited.filter((item) => item.status === filter)
  const saleItems = exited.filter((item) => item.status === 'sold')
  const saleTotal = saleItems.reduce((sum, item) => sum + (Number(item.exit?.price) || 0), 0)

  const tabs = [{ id: 'all', label: 'Semua' }, ...exitTypes]

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Sirkulasi barang</span>
          <h1>Riwayat Barang Keluar</h1>
          <p className="muted">Catatan barang yang dijual, diberikan, hilang, atau dibuang.</p>
        </div>
      </div>

      <div className="stats-grid stats-grid--three">
        <div className="stat-card">
          <span className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><HistoryIcon size={21} /></span>
          <div><span className="stat-label">Total barang keluar</span><strong className="stat-value">{exited.length}</strong></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: '#e6f6fe', color: '#0ea5e9' }}><ArrowUpRight size={21} /></span>
          <div><span className="stat-label">Barang dijual</span><strong className="stat-value">{saleItems.length}</strong></div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{ background: '#e8f6ee', color: '#0f9d58' }}><Wallet size={21} /></span>
          <div><span className="stat-label">Total hasil penjualan</span><strong className="stat-value">{formatRupiah(saleTotal)}</strong></div>
        </div>
      </div>

      <div className="chip-row chip-row--page">
        {tabs.map((tab) => (
          <button key={tab.id} className={`chip${filter === tab.id ? ' active' : ''}`} onClick={() => setFilter(tab.id)}>
            {tab.label}
            <span>{tab.id === 'all' ? exited.length : exited.filter((item) => item.status === tab.id).length}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="panel">
          <EmptyState
            search={filter !== 'all'}
            title="Belum ada barang keluar"
            message="Kalau kamu menjual atau memberikan barang, tandai statusnya dari halaman detail barang agar tercatat di sini."
          />
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((item) => {
            const type = exitTypes.find((entry) => entry.id === item.status) || exitTypes[0]
            const Icon = typeIcons[item.status] || HistoryIcon
            return (
              <Link to={`/barang/${item.id}`} className="history-card panel" key={item.id}>
                <span className="history-icon" style={{ background: `${type.color}16`, color: type.color }}><Icon size={20} /></span>
                <div className="history-body">
                  <div className="history-title">
                    <h3>{item.name}</h3>
                    <span className="status-badge" style={{ color: type.color, background: `${type.color}14` }}>{type.label}</span>
                  </div>
                  <div className="history-meta">
                    <span>{formatDate(item.exit?.date || item.purchaseDate)}</span>
                    {item.exit?.recipient && <span>→ {item.exit.recipient}</span>}
                    {item.exit?.note && <span>· {item.exit.note}</span>}
                  </div>
                  <p className="muted small">Dibeli {formatRupiah(item.purchasePrice)}</p>
                </div>
                {item.exit?.price > 0 && <strong className="history-price">{formatRupiah(item.exit.price)}</strong>}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
