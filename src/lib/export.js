import { formatRupiah } from './format.js'

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function exportItemsCSV(items) {
  const headers = [
    'Nama Barang', 'Kategori', 'Merek', 'Model', 'No. Seri', 'Jumlah', 'Kondisi',
    'Lokasi', 'Tanggal Beli', 'Harga Beli (Rp)', 'Toko/Sumber', 'Status',
    'Tanggal Keluar', 'Harga Jual (Rp)', 'Penerima', 'Catatan',
  ]

  const rows = items.map((item) => [
    item.name, item.category, item.brand, item.model, item.serialNumber, item.quantity,
    item.condition, item.location, item.purchaseDate, item.purchasePrice, item.store,
    item.status, item.exit?.date, item.exit?.price, item.exit?.recipient,
    [item.notes, item.exit?.note].filter(Boolean).join(' | '),
  ])

  const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
  triggerDownload(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' }), `inventarisku-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportBackupJSON(items, activities) {
  const payload = {
    app: 'InventarisKu',
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
    activities,
  }
  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `backup-inventarisku-${new Date().toISOString().slice(0, 10)}.json`,
  )
}

export async function readBackupFile(file) {
  const text = await file.text()
  const parsed = JSON.parse(text)
  const records = Array.isArray(parsed) ? parsed : parsed.items
  if (!Array.isArray(records)) throw new Error('File backup tidak valid.')
  return records
}

export function totalPurchase(items) {
  return items.reduce((sum, item) => sum + (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 1), 0)
}

export function totalSale(items) {
  return items.reduce((sum, item) => sum + (Number(item.exit?.price) || 0), 0)
}

export function summaryText(items) {
  const active = items.filter((item) => item.status === 'owned')
  return `${active.length} barang aktif · total ${formatRupiah(totalPurchase(active))}`
}
