import { useState } from 'react'
import { AlertCircle, ArrowRight, Boxes, Check, Loader2, LockKeyhole, Mail, PackageOpen, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

function firebaseMessage(error) {
  const code = error?.code || ''
  if (code.includes('invalid-email')) return 'Alamat email tidak valid.'
  if (code.includes('missing-password')) return 'Password wajib diisi.'
  if (code.includes('weak-password')) return 'Password minimal 6 karakter.'
  if (code.includes('email-already-in-use')) return 'Email ini sudah terdaftar. Silakan masuk.'
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Email atau password salah.'
  if (code.includes('user-not-found')) return 'Akun tidak ditemukan. Silakan daftar dulu.'
  if (code.includes('popup-closed-by-user')) return 'Popup Google ditutup. Coba lagi.'
  if (code.includes('unauthorized-domain')) return 'Domain belum diizinkan. Tambahkan di Firebase → Authentication → Authorized domains.'
  if (code.includes('operation-not-allowed')) return 'Metode login ini belum diaktifkan di Firebase Console.'
  return error?.message || 'Terjadi kesalahan. Coba lagi.'
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { login, register, loginWithGoogle, resetPassword } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
      showToast(mode === 'login' ? 'Selamat datang kembali!' : 'Akun berhasil dibuat.')
    } catch (err) {
      setError(firebaseMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle()
      showToast('Berhasil masuk dengan Google.')
    } catch (err) {
      setError(firebaseMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Isi email dulu, lalu klik lupa password.')
      return
    }
    setBusy(true)
    try {
      await resetPassword(email)
      showToast('Link atur ulang password dikirim ke email kamu.')
      setError('')
    } catch (err) {
      setError(firebaseMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-inner">
          <div className="brand brand--light">
            <span className="brand-mark"><Boxes size={24} /></span>
            <span>Inventaris<b>Ku</b></span>
          </div>
          <h2>Semua barangmu,<br />tercatat rapi di satu tempat.</h2>
          <p>Catat pembelian, simpan foto kwitansi, dan pantau barang yang dijual atau diberikan. Buka dari mana saja lewat HP.</p>
          <div className="auth-features">
            <span><Check size={15} /> Foto kwitansi</span>
            <span><Check size={15} /> Riwayat jual & kasih</span>
            <span><Check size={15} /> Data tersinkron</span>
          </div>
          <div className="auth-blob" aria-hidden="true"><PackageOpen size={180} strokeWidth={0.7} /></div>
        </div>
      </div>

      <div className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="brand brand--dark mobile-only">
            <span className="brand-mark"><Boxes size={22} /></span>
            <span>Inventaris<b>Ku</b></span>
          </div>
          <span className="eyebrow">{mode === 'login' ? 'Selamat datang kembali' : 'Mulai sekarang'}</span>
          <h1>{mode === 'login' ? 'Masuk ke akunmu' : 'Buat akun baru'}</h1>
          <p className="muted">Kelola inventaris pribadimu dengan mudah.</p>

          {error && (
            <div className="alert alert--error"><AlertCircle size={17} /> <span>{error}</span></div>
          )}

          {mode === 'register' && (
            <label className="field">
              <span>Nama</span>
              <div className="input-wrap"><UserRound size={17} /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" autoComplete="name" required /></div>
            </label>
          )}
          <label className="field">
            <span>Email</span>
            <div className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" autoComplete="email" required /></div>
          </label>
          <label className="field">
            <span>Password</span>
            <div className="input-wrap"><LockKeyhole size={17} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required /></div>
          </label>

          {mode === 'login' && (
            <button type="button" className="link-button" onClick={handleReset} disabled={busy}>Lupa password?</button>
          )}

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? <Loader2 size={18} className="spin" /> : null}
            {mode === 'login' ? 'Masuk' : 'Daftar'}
            {!busy && <ArrowRight size={17} />}
          </button>

          <div className="divider"><span>atau</span></div>

          <button type="button" className="btn btn--outline btn--block" onClick={handleGoogle} disabled={busy}>
            <span className="google-g">G</span> Lanjutkan dengan Google
          </button>

          <p className="auth-switch">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
