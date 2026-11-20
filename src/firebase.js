import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// measurementId opsional (tidak ada di sebagian project baru).
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
export const isFirebaseConfigured = requiredKeys.every(
  (key) => firebaseConfig[key] && !firebaseConfig[key].startsWith('YOUR_'),
)

let app = null
export let auth = null
export let db = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // Fallback ke persistence default jika browser memblokir local storage.
    })
  } catch (error) {
    console.error('Gagal menginisialisasi Firebase:', error)
  }
}

export { app }
