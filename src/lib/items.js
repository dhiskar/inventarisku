import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { imageToDataUrl } from './image.js'

const itemsCollection = (uid) => collection(db, 'users', uid, 'items')
const activitiesCollection = (uid) => collection(db, 'users', uid, 'activities')

function cleanInput(input = {}) {
  return {
    name: (input.name || '').trim(),
    category: input.category || 'lainnya',
    brand: (input.brand || '').trim(),
    model: (input.model || '').trim(),
    serialNumber: (input.serialNumber || '').trim(),
    quantity: Math.max(1, Number(input.quantity) || 1),
    condition: input.condition || 'Bagus',
    location: (input.location || '').trim(),
    purchaseDate: input.purchaseDate || '',
    purchasePrice: Number(input.purchasePrice) || 0,
    store: (input.store || '').trim(),
    notes: (input.notes || '').trim(),
    status: input.status || 'owned',
    exit: input.exit || null,
  }
}

export async function logActivity(uid, payload) {
  if (!db) return
  await addDoc(activitiesCollection(uid), { ...payload, createdAt: serverTimestamp() })
}

export async function createItem(uid, input, file, onProgress) {
  if (!input.name?.trim()) throw new Error('Nama barang wajib diisi.')

  onProgress?.(25)
  const receiptData = file ? await imageToDataUrl(file) : ''
  onProgress?.(75)

  const docRef = await addDoc(itemsCollection(uid), {
    ...cleanInput(input),
    receiptData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  onProgress?.(100)

  await logActivity(uid, {
    type: 'create',
    title: `Menambahkan ${input.name.trim()}`,
    detail: input.purchaseDate ? `Dibeli pada ${input.purchaseDate}` : 'Barang baru masuk inventaris',
    itemId: docRef.id,
  })

  return docRef.id
}

export async function updateItem(uid, itemId, input, file, removePhoto, onProgress) {
  onProgress?.(25)
  const patch = { ...cleanInput(input), updatedAt: serverTimestamp() }

  if (file) {
    patch.receiptData = await imageToDataUrl(file)
  } else if (removePhoto) {
    patch.receiptData = ''
  }
  onProgress?.(100)

  await updateDoc(doc(db, 'users', uid, 'items', itemId), patch)

  await logActivity(uid, {
    type: 'update',
    title: `Memperbarui ${input.name.trim()}`,
    detail: 'Data barang diubah',
    itemId,
  })
}

export async function deleteItem(uid, item) {
  await deleteDoc(doc(db, 'users', uid, 'items', item.id))
  await logActivity(uid, {
    type: 'delete',
    title: `Menghapus ${item.name}`,
    detail: 'Barang dihapus dari inventaris',
    itemId: item.id,
  })
}

export async function markItemExit(uid, item, exitData) {
  const exit = {
    type: exitData.type,
    date: exitData.date || '',
    price: Number(exitData.price) || 0,
    recipient: (exitData.recipient || '').trim(),
    note: (exitData.note || '').trim(),
  }

  await updateDoc(doc(db, 'users', uid, 'items', item.id), {
    status: exit.type,
    exit,
    updatedAt: serverTimestamp(),
  })

  const labels = { sold: 'Dijual', gifted: 'Diberikan', lost: 'Hilang', disposed: 'Dibuang' }
  await logActivity(uid, {
    type: 'exit',
    title: `${labels[exit.type] || 'Barang keluar'}: ${item.name}`,
    detail: exit.recipient ? `Kepada ${exit.recipient}` : exit.date ? `Pada ${exit.date}` : '',
    itemId: item.id,
    amount: exit.price,
  })
}

export async function restoreItem(uid, item) {
  await updateDoc(doc(db, 'users', uid, 'items', item.id), {
    status: 'owned',
    exit: null,
    updatedAt: serverTimestamp(),
  })
  await logActivity(uid, {
    type: 'restore',
    title: `Memulihkan ${item.name}`,
    detail: 'Barang kembali ke inventaris aktif',
    itemId: item.id,
  })
}

export async function restoreBackup(uid, records) {
  let success = 0
  for (const record of records) {
    if (!record?.name) continue
    await addDoc(itemsCollection(uid), {
      ...cleanInput(record),
      receiptData: record.receiptData || record.receiptUrl || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    success += 1
  }
  if (success) {
    await logActivity(uid, {
      type: 'restore',
      title: `Memulihkan ${success} barang`,
      detail: 'Dari file backup JSON',
    })
  }
  return success
}
