import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Grid2X2, List, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import ItemCard from '../components/ItemCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { categories, getCategory } from '../lib/categories.js'
import { formatDate, formatRupiah } from '../lib/format.js'

const statusFilters = [
  { id: 'all', label: 'Semua' },
  { id: 'owned', label: 'Aktif' },
  { id: 'sold', label: 'Dijual' },
  { id: 'gifted', label: 'Diberikan' },
  { id: 'lost', label: 'Hilang' },
  { id: 'disposed', label: 'Dibuang' },
]

export default function Items() {
  const { items, loading } = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [view, setView] = useState('grid')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const result = items.filter((item) => {
      const matchesQuery = !needle || [item.name, item.brand, item.model, item.serialNumber, item.store, item.location]
        .some((value) => String(value || '').toLowerCase().includes(needle))
      const matchesStatus = status === 'all' || item.status === status
      const matchesCategory = category === 'all' || item.category === category
      return matchesQuery && matchesStatus && matchesCategory
    })

    return result.sort((a, b) => {
      if (sort === 'price_desc') return b.purchasePrice - a.purchasePrice
      if (sort === 'price_asc') return a.purchasePrice - b.purchasePrice
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'oldest') return a.createdAtMs - b.createdAtMs
      return b.createdAtMs - a.createdAtMs
    })
  }, [items, query, status, category, sort])

  const resetFilters = () => {
    setQuery(''); setStatus('all'); setCategory('all'); setSort('newest')
  }

  const hasFilters = query || status !== 'all' || category !== 'all'

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow"> Inventaris</span>
          <h1>Daftar Barang</h1>
          <p className="muted">{items.length} barang tercatat · {filtered.length} ditampilkan</p>
        </div>
        <Link to="/barang/baru" className="btn btn--primary heading-action"><Plus size={17} /> Tambah barang</Link>
      </div>

      <div className="panel filter-panel">
        <div className="filter-top">
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, merek, nomor seri…" />
            {query && <button onClick={() => setQuery('')} aria-label="Hapus pencarian"><X size={16} /></button>}
          </div>
          <div className="filter-controls">
            <div className="select-wrap">
              <SlidersHorizontal size={16} />
              <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter kategori">
                <option value="all">Semua kategori</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Urutkan">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="price_desc">Harga tertinggi</option>
              <option value="price_asc">Harga terendah</option>
              <option value="name">Nama A–Z</option>
            </select>
            <div className="view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Tampilan grid"><Grid2X2 size={17} /></button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="Tampilan daftar"><List size={18} /></button>
            </div>
          </div>
        </div>
        <div className="chip-row">
          {statusFilters.map((filter) => (
            <button key={filter.id} className={`chip${status === filter.id ? ' active' : ''}`} onClick={() => setStatus(filter.id)}>
              {filter.label}
              <span>{filter.id === 'all' ? items.length : items.filter((item) => item.status === filter.id).length}</span>
            </button>
          ))}
          {hasFilters && <button className="chip chip--clear" onClick={resetFilters}><X size={13} /> Reset</button>}
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">{[1, 2, 3, 4].map((n) => <div key={n} className="skeleton-card" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="panel">
          <EmptyState
            search={hasFilters}
            title={hasFilters ? 'Tidak ada hasil' : 'Belum ada barang'}
            message={hasFilters ? 'Coba ubah kata kunci atau filter yang kamu gunakan.' : 'Tambahkan barang pertama untuk mulai mencatat inventaris.'}
            actionLabel={hasFilters ? 'Reset filter' : 'Tambah barang'}
            onAction={hasFilters ? resetFilters : () => navigate('/barang/baru')}
          />
        </div>
      ) : view === 'grid' ? (
        <div className="item-grid">
          {filtered.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="panel list-view">
          {filtered.map((item) => {
            const category = getCategory(item.category)
            const Icon = category.icon
            return (
              <Link to={`/barang/${item.id}`} className="list-row" key={item.id}>
                <span className="list-thumb" style={{ background: category.tint }}>
                  {item.receiptUrl ? <img src={item.receiptUrl} alt="" /> : <Icon size={20} style={{ color: category.color }} />}
                </span>
                <div className="list-info">
                  <strong>{item.name}</strong>
                  <span className="muted small">{category.label} · {formatDate(item.purchaseDate)}</span>
                </div>
                <StatusBadge status={item.status} />
                <strong className="list-price">{formatRupiah(item.purchasePrice)}</strong>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
