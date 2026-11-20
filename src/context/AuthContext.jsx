import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return undefined
    }
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  const requireAuth = () => {
    if (!auth) throw new Error('Firebase belum terhubung. Periksa file .env.local dan restart aplikasi.')
    return auth
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (email, password) => signInWithEmailAndPassword(requireAuth(), email, password),
      register: async (name, email, password) => {
        const instance = requireAuth()
        const result = await createUserWithEmailAndPassword(instance, email, password)
        if (name?.trim()) {
          await updateProfile(result.user, { displayName: name.trim() })
          setUser({
            ...result.user,
            uid: result.user.uid,
            email: result.user.email,
            displayName: name.trim(),
          })
        }
        return result
      },
      loginWithGoogle: () => signInWithPopup(requireAuth(), new GoogleAuthProvider()),
      logout: () => signOut(requireAuth()),
      resetPassword: (email) => sendPasswordResetEmail(requireAuth(), email),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
