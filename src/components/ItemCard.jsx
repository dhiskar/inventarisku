import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'
import { getCategory } from '../lib/categories.js'
import { formatDate, formatRupiah } from '../lib/format.js'

export default function ItemCard({ item }) {
  const category = getCategory(item.category)
  const Icon = category.icon

  return (
    <Link to={`/barang/${item.id}`} className="item-card">
      <div className="item-card-media" style={{ background: category.tint }}>
        {item.receiptUrl ? (
          <img src={item.receiptUrl} alt={`Kwitansi ${item.name}`} loading="lazy" />
        ) : (
          <Icon size={38} style={{ color: category.color }} strokeWidth={1.7} />
        )}
        <span className="item-card-status"><StatusBadge status={item.status} /></span>
      </div>
      <div className="item-card-body">
        <span className="item-category" style={{ color: category.color }}>{category.label}</span>
        <h3 title={item.name}>{item.name}</h3>
        <p className="item-subtitle">{[item.brand, item.model].filter(Boolean).join(' · ') || '—'}</p>
        <strong className="item-price">{formatRupiah(item.purchasePrice)}</strong>
        <div className="item-meta">
          <span><CalendarDays size={13} /> {formatDate(item.purchaseDate)}</span>
          {item.location && <span><MapPin size={13} /> {item.location}</span>}
        </div>
      </div>
    </Link>
  )
}
