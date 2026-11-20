import { statuses } from '../lib/categories.js'

export default function StatusBadge({ status }) {
  const meta = statuses[status] || statuses.owned
  return (
    <span className="status-badge" style={{ color: meta.color, background: meta.tint }}>
      <span className="status-dot" style={{ background: meta.color }} />
      {meta.short}
    </span>
  )
}
