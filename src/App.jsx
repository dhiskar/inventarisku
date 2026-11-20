import { Navigate, Route, Routes } from 'react-router-dom'
import { isFirebaseConfigured } from './firebase.js'
import { useAuth } from './context/AuthContext.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import Layout from './components/Layout.jsx'
import SetupGuide from './pages/SetupGuide.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Items from './pages/Items.jsx'
import ItemForm from './pages/ItemForm.jsx'
import ItemDetail from './pages/ItemDetail.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const { user, loading } = useAuth()

  if (!isFirebaseConfigured) return <SetupGuide />
  if (loading) return <LoadingScreen label="Menyiapkan aplikasi…" />

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="barang" element={<Items />} />
        <Route path="barang/baru" element={<ItemForm />} />
        <Route path="barang/:id/edit" element={<ItemForm />} />
        <Route path="barang/:id" element={<ItemDetail />} />
        <Route path="riwayat" element={<History />} />
        <Route path="pengaturan" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
