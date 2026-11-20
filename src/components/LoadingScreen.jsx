import { PackageOpen } from 'lucide-react'

export default function LoadingScreen({ label = 'Memuat data…' }) {
  return (
    <div className="center-screen">
      <div className="loader-logo">
        <PackageOpen size={34} strokeWidth={2.2} />
      </div>
      <div className="spinner" />
      <p className="muted">{label}</p>
    </div>
  )
}
