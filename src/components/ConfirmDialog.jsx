import Modal from './Modal.jsx'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Ya, lanjutkan', danger = false, busy = false, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="small">
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <button className="btn btn--outline" onClick={onClose} disabled={busy}>Batal</button>
        <button className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
