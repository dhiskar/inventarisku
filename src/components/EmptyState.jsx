import { Plus, Search } from 'lucide-react'

export default function EmptyState({ title = 'Belum ada data', message, actionLabel, onAction, search = false }) {
  const Icon = search ? Search : Plus
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={30} /></div>
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {actionLabel && <button className="btn btn--primary" onClick={onAction}><Plus size={17} /> {actionLabel}</button>}
    </div>
  )
}
