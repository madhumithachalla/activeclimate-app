import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase'

// Module-level (singleton) state so every component shares the same session.
const currentUser = ref(null)
const userRole = ref(null)
const authReady = ref(!isFirebaseConfigured)

if (isFirebaseConfigured) {
  onAuthStateChanged(
    auth,
    async (user) => {
      currentUser.value = user
      userRole.value = user ? await fetchRole(user.uid) : null
      authReady.value = true
    },
    (err) => {
      // Misconfigured Firebase project, offline, etc. Fail closed (signed out)
      // rather than leaving login-gated routes hanging on authReady forever.
      console.error('Auth state listener error:', err)
      currentUser.value = null
      userRole.value = null
      authReady.value = true
    }
  )
}

const NOT_CONFIGURED_ERROR = 'Firebase is not configured yet. Copy .env.example to .env.local and add your project credentials.'

async function fetchRole(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data().role : null
}

function friendlyError(err) {
  if (!err?.code) return err?.message || 'Something went wrong. Please try again.'
  const map = {
    'auth/email-already-in-use': 'That email is already registered. Try logging in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  }
  return map[err?.code] || 'Something went wrong. Please try again.'
}

export function useAuth() {
  async function signUp(email, password) {
    if (!isFirebaseConfigured) throw new Error(NOT_CONFIGURED_ERROR)
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    // New accounts are assigned the "Public" role per E03-US01-AC02.
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: 'Public',
      createdAt: new Date().toISOString(),
    })
    userRole.value = 'Public'
    return user
  }

  async function logIn(email, password) {
    if (!isFirebaseConfigured) throw new Error(NOT_CONFIGURED_ERROR)
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  }

  async function logOut() {
    if (!isFirebaseConfigured) return
    await signOut(auth)
  }

  return { currentUser, userRole, authReady, signUp, logIn, logOut, friendlyError }
}
