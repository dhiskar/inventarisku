import { useEffect, useState } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import Modal from './Modal.jsx'
import { exitTypes } from '../lib/categories.js'
import { todayInputValue } from '../lib/format.js'
import { useToast } from '../context/ToastContext.jsx'

const emptyForm = () => ({ type: 'sold', date: todayInputValue(), price: '', recipient: '', note: '' })

export default function ExitModal({ open, item, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm())
  const [busy, setBusy] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (open) setForm(emptyForm())
  }, [open, item?.id])

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await onSubmit(form)
      showToast('Barang berhasil ditandai keluar.')
      onClose()
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Keluarkan barang" subtitle={item ? `Catat keberadaan ${item.name} sekarang` : ''}>
      <form className="form-grid" onSubmit={submit}>
        <label className="field field--full">
          <span>Status barang</span>
          <div className="choice-row">
            {exitTypes.map((type) => (
              <button
                type="button"
                key={type.id}
                className={`choice${form.type === type.id ? ' selected' : ''}`}
                style={form.type === type.id ? { borderColor: type.color, color: type.color, background: `${type.color}12` } : undefined}
                onClick={() => setForm((current) => ({ ...current, type: type.id }))}
              >
                {type.label}
              </button>
            ))}
          </div>
        </label>

        <label className="field">
          <span>Tanggal</span>
          <input type="date" value={form.date} onChange={update('date')} required />
        </label>

        {form.type === 'sold' && (
          <label className="field">
            <span>Harga jual (Rp)</span>
            <input type="number" min="0" inputMode="numeric" value={form.price} onChange={update('price')} placeholder="0" />
          </label>
        )}

        {form.type === 'gifted' && (
          <label className="field">
            <span>Diberikan kepada</span>
            <input value={form.recipient} onChange={update('recipient')} placeholder="Nama penerima" />
          </label>
        )}

        <label className="field field--full">
          <span>Catatan (opsional)</span>
          <textarea rows={3} value={form.note} onChange={update('note')} placeholder="Misal: dijual di marketplace, diberikan ke adik, dll." />
        </label>

        <div className="modal-actions field--full">
          <button type="button" className="btn btn--outline" onClick={onClose} disabled={busy}>Batal</button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? <Loader2 size={17} className="spin" /> : <ArrowUpRight size={17} />}
            Simpan status
          </button>
        </div>
      </form>
    </Modal>
  )
}
