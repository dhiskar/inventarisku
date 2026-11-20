import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from './AuthContext.jsx'
import { toMillis } from '../lib/format.js'
import {
  createItem, deleteItem, markItemExit, restoreBackup, restoreItem, updateItem,
} from '../lib/items.js'

const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || !db) {
      setItems([])
      setActivities([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    setError('')

    const unsubItems = onSnapshot(
      query(collection(db, 'users', user.uid, 'items'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setItems(snapshot.docs.map((document) => {
          const data = document.data()
          return {
            ...data,
            id: document.id,
            // Foto kwitansi disimpan sebagai receiptData di Firestore (tanpa Storage).
            receiptUrl: data.receiptData || data.receiptUrl || '',
            createdAtMs: toMillis(data.createdAt),
          }
        }))
        setLoading(false)
      },
      (err) => {
        console.error('Firestore items error:', err)
        setError('Gagal memuat data. Pastikan aturan keamanan Firestore sudah dipublish di Firebase Console.')
        setLoading(false)
      },
    )

    const unsubActivities = onSnapshot(
      query(collection(db, 'users', user.uid, 'activities'), orderBy('createdAt', 'desc'), limit(40)),
      (snapshot) => {
        setActivities(snapshot.docs.map((document) => ({
          ...document.data(),
          id: document.id,
          createdAtMs: toMillis(document.data().createdAt),
        })))
      },
      () => {},
    )

    return () => {
      unsubItems()
      unsubActivities()
    }
  }, [user?.uid])

  const value = useMemo(() => ({
    items,
    activities,
    loading,
    error,
    addItem: (input, file, onProgress) => createItem(user.uid, input, file, onProgress),
    editItem: (id, input, file, removePhoto, onProgress) => updateItem(user.uid, id, input, file, removePhoto, onProgress),
    removeItem: (item) => deleteItem(user.uid, item),
    setExit: (item, exitData) => markItemExit(user.uid, item, exitData),
    restore: (item) => restoreItem(user.uid, item),
    importBackup: (records) => restoreBackup(user.uid, records),
  }), [items, activities, loading, error, user?.uid])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
