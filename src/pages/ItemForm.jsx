import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, Info } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import ImageUploader from '../components/ImageUploader.jsx'
import { categories, conditions } from '../lib/categories.js'
import { todayInputValue } from '../lib/format.js'

const emptyForm = () => ({
  name: '', category: 'elektronik', brand: '', model: '', serialNumber: '',
  quantity: 1, condition: 'Bagus', location: '', purchaseDate: todayInputValue(),
  purchasePrice: '', store: '', notes: '',
})

export default function ItemForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { items, loading, addItem, editItem } = useData()
  const { showToast } = useToast()
  const existing = isEdit ? items.find((item) => item.id === id) : null

  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!existing) return
    setForm({
      name: existing.name || '',
      category: existing.category || 'lainnya',
      brand: existing.brand || '',
      model: existing.model || '',
      serialNumber: existing.serialNumber || '',
      quantity: existing.quantity || 1,
      condition: existing.condition || 'Bagus',
      location: existing.location || '',
      purchaseDate: existing.purchaseDate || '',
      purchasePrice: existing.purchasePrice || '',
      store: existing.store || '',
      notes: existing.notes || '',
    })
  }, [existing?.id])

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Nama barang wajib diisi.')
      return
    }

    setSaving(true)
    if (file) setUploading(true)
    try {
      const payload = {
        ...form,
        status: existing?.status || 'owned',
        exit: existing?.exit || null,
      }
      const savedId = isEdit
        ? await editItem(id, payload, file, removePhoto, setProgress)
        : await addItem(payload, file, setProgress)
      showToast(isEdit ? 'Barang berhasil diperbarui.' : 'Barang berhasil ditambahkan.')
      navigate(`/barang/${savedId || id}`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menyimpan data. Periksa koneksi dan aturan Firebase.')
      showToast('Gagal menyimpan barang.', 'error')
    } finally {
      setUploading(false)
      setSaving(false)
    }
  }

  if (isEdit && loading && !existing) {
    return <div className="panel"><p className="muted">Memuat data barang…</p></div>
  }

  if (isEdit && !existing) {
    return (
      <div className="panel">
        <h2>Barang tidak ditemukan</h2>
        <p className="muted">Data mungkin sudah dihapus.</p>
        <Link to="/barang" className="btn btn--primary">Kembali ke daftar</Link>
      </div>
    )
  }

  return (
    <div className="page form-page">
      <Link to={isEdit ? `/barang/${id}` : '/barang'} className="back-link"><ArrowLeft size={16} /> Kembali</Link>

      <div className="page-heading">
        <div>
          <span className="eyebrow">{isEdit ? 'Ubah data' : 'Barang baru'}</span>
          <h1>{isEdit ? 'Edit Barang' : 'Tambah Barang'}</h1>
          <p className="muted">Isi detail barang agar lebih mudah dicari dan dipantau.</p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <form className="form-layout" onSubmit={submit}>
        <div className="form-main">
          <section className="panel form-section">
            <h2>Informasi barang</h2>
            <div className="form-grid">
              <label className="field field--full">
                <span>Nama barang <em>*</em></span>
                <input value={form.name} onChange={update('name')} placeholder="Misal: MacBook Air M2" required />
              </label>
              <label className="field">
                <span>Kategori</span>
                <select value={form.category} onChange={update('category')}>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Kondisi</span>
                <select value={form.condition} onChange={update('condition')}>
                  {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Merek</span>
                <input value={form.brand} onChange={update('brand')} placeholder="Misal: Apple" />
              </label>
              <label className="field">
                <span>Model / tipe</span>
                <input value={form.model} onChange={update('model')} placeholder="Misal: MacBookAir10,1" />
              </label>
              <label className="field">
                <span>Nomor seri</span>
                <input value={form.serialNumber} onChange={update('serialNumber')} placeholder="Opsional" />
              </label>
              <label className="field">
                <span>Jumlah</span>
                <input type="number" min="1" value={form.quantity} onChange={update('quantity')} placeholder="1" />
              </label>
              <label className="field field--full">
                <span>Lokasi penyimpanan</span>
                <input value={form.location} onChange={update('location')} placeholder="Misal: Lemari kamar, tas kerja, dll." />
              </label>
            </div>
          </section>

          <section className="panel form-section">
            <h2>Detail pembelian</h2>
            <div className="form-grid">
              <label className="field">
                <span>Tanggal beli</span>
                <input type="date" value={form.purchaseDate} onChange={update('purchaseDate')} />
              </label>
              <label className="field">
                <span>Harga beli (Rp) <em>*</em></span>
                <input type="number" min="0" inputMode="numeric" value={form.purchasePrice} onChange={update('purchasePrice')} placeholder="0" required />
              </label>
              <label className="field field--full">
                <span>Toko / sumber</span>
                <input value={form.store} onChange={update('store')} placeholder="Misal: Tokopedia, Apple Store, hadiah, dll." />
              </label>
              <label className="field field--full">
                <span>Catatan</span>
                <textarea rows={4} value={form.notes} onChange={update('notes')} placeholder="Catatan tambahan: garansi, aksesoris yang ikut, dll." />
              </label>
            </div>
          </section>

          <section className="panel form-section">
            <h2>Foto kwitansi / nota</h2>
            <p className="muted small form-hint"><Info size={14} /> Foto dikompres otomatis lalu disimpan di Firestore (tanpa Storage). Hanya bisa diakses oleh akunmu.</p>
            <ImageUploader
              initialUrl={existing?.receiptUrl || ''}
              file={file}
              onFileChange={(picked) => { setFile(picked); setRemovePhoto(false) }}
              onRemove={() => { setFile(null); setRemovePhoto(true) }}
              progress={progress}
              uploading={uploading}
            />
          </section>
        </div>

        <aside className="form-aside">
          <div className="panel sticky-panel">
            <h2>Ringkasan</h2>
            <div className="summary-row"><span>Nama</span><strong>{form.name || '—'}</strong></div>
            <div className="summary-row"><span>Kategori</span><strong>{categories.find((c) => c.id === form.category)?.label || '—'}</strong></div>
            <div className="summary-row"><span>Jumlah</span><strong>{form.quantity || 1}</strong></div>
            <div className="summary-row"><span>Harga</span><strong>Rp {Number(form.purchasePrice || 0).toLocaleString('id-ID')}</strong></div>
            <button className="btn btn--primary btn--block" type="submit" disabled={saving}>
              {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              {saving ? 'Menyimpan…' : isEdit ? 'Simpan perubahan' : 'Simpan barang'}
            </button>
            <Link to={isEdit ? `/barang/${id}` : '/barang'} className="btn btn--ghost btn--block">Batal</Link>
          </div>
        </aside>
      </form>
    </div>
  )
}
