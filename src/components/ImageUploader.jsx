import { useEffect, useRef, useState } from 'react'
import { Camera, ImageIcon, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { MAX_IMAGE_BYTES } from '../lib/image.js'

export default function ImageUploader({ initialUrl = '', file, onFileChange, onRemove, progress = 0, uploading = false }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(initialUrl)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreview(initialUrl)
    return undefined
  }, [file, initialUrl])

  const pick = async (picked) => {
    if (!picked) return
    setError('')
    if (!picked.type.startsWith('image/')) {
      setError('Pilih file gambar (JPG, PNG, atau WebP).')
      return
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setError('Ukuran gambar maksimal 5 MB.')
      return
    }
    onFileChange(picked)
  }

  const clear = () => {
    setPreview('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onRemove()
  }

  return (
    <div className="uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {preview ? (
        <div className="upload-preview">
          <img src={preview} alt="Pratinjau kwitansi" />
          <button type="button" className="upload-remove" onClick={clear} aria-label="Hapus foto">
            <Trash2 size={16} />
          </button>
          <span className="upload-caption"><ImageIcon size={14} /> {file ? file.name : 'Kwitansi tersimpan'}</span>
          {uploading && (
            <div className="upload-progress">
              <div style={{ width: `${progress}%` }} />
              <span><Loader2 size={13} className="spin" /> {progress}%</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className={`upload-drop${dragging ? ' dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); pick(event.dataTransfer.files?.[0]) }}
        >
          <span className="upload-icon"><UploadCloud size={25} /></span>
          <strong>Klik untuk pilih foto kwitansi</strong>
          <span className="muted small">atau tarik gambar ke sini · JPG/PNG/WebP, maks. 5 MB</span>
          <span className="upload-hint"><Camera size={13} /> Foto akan dikompres otomatis</span>
        </button>
      )}

      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
