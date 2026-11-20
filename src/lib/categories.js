import {
  Laptop, Smartphone, Monitor, Shirt, Sofa, BookOpen,
  Gamepad2, Car, HeartPulse, Package,
} from 'lucide-react'

export const categories = [
  { id: 'elektronik', label: 'Elektronik', icon: Laptop, color: '#6366f1', tint: '#eef2ff' },
  { id: 'ponsel', label: 'Ponsel & Tablet', icon: Smartphone, color: '#0ea5e9', tint: '#e0f2fe' },
  { id: 'komputer', label: 'Komputer & Laptop', icon: Monitor, color: '#8b5cf6', tint: '#f5f3ff' },
  { id: 'pakaian', label: 'Pakaian', icon: Shirt, color: '#ec4899', tint: '#fdf2f8' },
  { id: 'rumah', label: 'Rumah Tangga', icon: Sofa, color: '#f59e0b', tint: '#fffbeb' },
  { id: 'buku', label: 'Buku & Alat Tulis', icon: BookOpen, color: '#14b8a6', tint: '#f0fdfa' },
  { id: 'hobi', label: 'Hobi & Olahraga', icon: Gamepad2, color: '#f97316', tint: '#fff7ed' },
  { id: 'kendaraan', label: 'Kendaraan', icon: Car, color: '#3b82f6', tint: '#eff6ff' },
  { id: 'kesehatan', label: 'Kesehatan', icon: HeartPulse, color: '#ef4444', tint: '#fef2f2' },
  { id: 'lainnya', label: 'Lainnya', icon: Package, color: '#64748b', tint: '#f1f5f9' },
]

export const getCategory = (id) => categories.find((item) => item.id === id) || categories.at(-1)

export const statuses = {
  owned: { label: 'Masih dipunyai', short: 'Aktif', color: '#0f9d58', tint: '#e8f6ee' },
  sold: { label: 'Sudah dijual', short: 'Dijual', color: '#2563eb', tint: '#e8f0fe' },
  gifted: { label: 'Sudah diberikan', short: 'Diberikan', color: '#7c3aed', tint: '#f1eafe' },
  lost: { label: 'Hilang', short: 'Hilang', color: '#d97706', tint: '#fff4e5' },
  disposed: { label: 'Dibuang / rusak', short: 'Dibuang', color: '#64748b', tint: '#eef2f6' },
}

export const exitTypes = [
  { id: 'sold', label: 'Dijual', color: '#2563eb' },
  { id: 'gifted', label: 'Diberikan', color: '#7c3aed' },
  { id: 'lost', label: 'Hilang', color: '#d97706' },
  { id: 'disposed', label: 'Rusak / dibuang', color: '#64748b' },
]

export const conditions = ['Baru', 'Sangat bagus', 'Bagus', 'Cukup', 'Rusak']
