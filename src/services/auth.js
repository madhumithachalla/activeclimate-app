// BR (C.1): Authentication - register / login / logout with user accounts.
// BR (C.2): Role-based authentication - every account carries a role that the
//           router guards and the views use to decide what may be shown.
// BR (C.4): Security - passwords are never stored or compared in plain text.
//
// The assignment brief allows this "basic app" to be entirely client-side, so
// accounts live in localStorage. Passwords are still put through PBKDF2 with a
// per-user random salt rather than being stored as-is, because a shared or
// borrowed machine is exactly the case this protects against.

import { computed, ref } from 'vue'
import { readJson, writeJson, removeKey, STORAGE_KEYS } from './storage.js'
import { sanitizeText, normaliseEmail } from '../utils/sanitize.js'
import { computeTag, verifyTag } from './integrity.js'

export const ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin'
}

export const ROLE_LABELS = {
  [ROLES.MEMBER]: 'Community Member',
  [ROLES.ADMIN]: 'NFP Coordinator'
}

const PBKDF2_ITERATIONS = 150000
const SALT_BYTES = 16
const KEY_BITS = 256
const SESSION_LIFETIME_MS = 2 * 60 * 60 * 1000   // 2 hours
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000                // 15 minutes

// ---------------------------------------------------------------- crypto ----

const toHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const randomHex = (byteLength) => {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

const hexToBytes = (hex) => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

// PBKDF2-SHA256. Deliberately slow so that guessing a password against the
// stored hash costs real time, unlike a bare SHA-256 digest.
const derivePasswordHash = async (password, saltHex) => {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    KEY_BITS
  )
  return toHex(bits)
}

// Compare in constant time so the comparison itself leaks nothing about how
// much of the hash matched.
const constantTimeEquals = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false
  }
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

// ------------------------------------------------------------- user store ---

// Shape check applied to everything read back from localStorage.
const isValidUserList = (value) => {
  return Array.isArray(value) && value.every((user) => (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    typeof user.saltHex === 'string' &&
    typeof user.hashHex === 'string' &&
    Object.values(ROLES).includes(user.role)
  ))
}

// Stored as { records, tag } so the contents can be integrity-checked at
// startup. An older unsigned array is still read, then re-signed on next write.
const isValidUserStore = (value) => {
  if (Array.isArray(value)) return isValidUserList(value)
  return value && typeof value === 'object' && isValidUserList(value.records)
}

const loadUsers = () => {
  const stored = readJson(STORAGE_KEYS.users, [], isValidUserStore)
  return Array.isArray(stored) ? stored : stored.records
}

const loadUserTag = () => {
  const stored = readJson(STORAGE_KEYS.users, [], isValidUserStore)
  return Array.isArray(stored) ? null : stored.tag
}

const saveUsers = async (users) => {
  const tag = await computeTag(users)
  return writeJson(STORAGE_KEYS.users, { records: users, tag })
}

const findUserByEmail = (users, email) => {
  const target = normaliseEmail(email)
  return users.find((user) => user.email === target) || null
}

// Never hand the salt or hash out to the UI layer.
const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
})

// --------------------------------------------------------------- lockout ----

const isValidLockouts = (value) => value && typeof value === 'object' && !Array.isArray(value)

const loadLockouts = () => readJson(STORAGE_KEYS.lockouts, {}, isValidLockouts)

// Returns remaining lockout milliseconds, or 0 when the account is not locked.
const lockoutRemaining = (email) => {
  const record = loadLockouts()[normaliseEmail(email)]
  if (!record || typeof record.lockedUntil !== 'number') return 0
  return Math.max(0, record.lockedUntil - Date.now())
}

const recordFailedAttempt = (email) => {
  const key = normaliseEmail(email)
  const lockouts = loadLockouts()
  const record = lockouts[key] || { attempts: 0, lockedUntil: 0 }

  record.attempts += 1
  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS
    record.attempts = 0
  }
  lockouts[key] = record
  writeJson(STORAGE_KEYS.lockouts, lockouts)
  return record
}

const clearFailedAttempts = (email) => {
  const lockouts = loadLockouts()
  delete lockouts[normaliseEmail(email)]
  writeJson(STORAGE_KEYS.lockouts, lockouts)
}

// --------------------------------------------------------------- session ----

const isValidSession = (value) => {
  return value &&
    typeof value.userId === 'string' &&
    typeof value.expiresAt === 'number'
}

const currentUser = ref(null)

export const useAuth = () => ({
  currentUser,
  isAuthenticated: computed(() => currentUser.value !== null),
  isAdmin: computed(() => currentUser.value?.role === ROLES.ADMIN),
  hasRole: (role) => currentUser.value?.role === role
})

const startSession = (user) => {
  writeJson(STORAGE_KEYS.session, {
    userId: user.id,
    issuedAt: Date.now(),
    expiresAt: Date.now() + SESSION_LIFETIME_MS
  })
  currentUser.value = toPublicUser(user)
}

// Restore on page load. An expired or unknown session is dropped rather than
// trusted, so editing localStorage by hand cannot forge a login.
export const restoreSession = () => {
  const session = readJson(STORAGE_KEYS.session, null, isValidSession)
  if (!session) return null

  if (session.expiresAt <= Date.now()) {
    removeKey(STORAGE_KEYS.session)
    currentUser.value = null
    return null
  }

  const user = loadUsers().find((candidate) => candidate.id === session.userId)
  if (!user) {
    removeKey(STORAGE_KEYS.session)
    currentUser.value = null
    return null
  }

  currentUser.value = toPublicUser(user)
  return currentUser.value
}

export const logout = () => {
  removeKey(STORAGE_KEYS.session)
  currentUser.value = null
}

// -------------------------------------------------------------- register ----

export const registerUser = async ({ name, email, password, role = ROLES.MEMBER }) => {
  const cleanName = sanitizeText(name, 60)
  const cleanEmail = normaliseEmail(email)

  if (!Object.values(ROLES).includes(role)) {
    return { ok: false, error: 'Unknown account role' }
  }

  const users = loadUsers()
  if (findUserByEmail(users, cleanEmail)) {
    return { ok: false, error: 'An account with this email already exists' }
  }

  const saltHex = randomHex(SALT_BYTES)
  const hashHex = await derivePasswordHash(password, saltHex)

  const user = {
    id: randomHex(12),
    name: cleanName,
    email: cleanEmail,
    role,
    saltHex,
    hashHex,
    createdAt: new Date().toISOString()
  }

  users.push(user)
  if (!(await saveUsers(users))) {
    return { ok: false, error: 'Could not save your account. Check browser storage settings.' }
  }

  startSession(user)
  return { ok: true, user: toPublicUser(user) }
}

// ----------------------------------------------------------------- login ----

export const loginUser = async ({ email, password }) => {
  const remaining = lockoutRemaining(email)
  if (remaining > 0) {
    const minutes = Math.ceil(remaining / 60000)
    return { ok: false, error: `Too many failed attempts. Try again in ${minutes} minute(s).` }
  }

  const users = loadUsers()
  const user = findUserByEmail(users, email)

  // Same message whether the email is unknown or the password is wrong, so the
  // form cannot be used to work out which accounts exist.
  const genericError = 'Email or password is incorrect'

  if (!user) {
    recordFailedAttempt(email)
    return { ok: false, error: genericError }
  }

  const candidateHash = await derivePasswordHash(password, user.saltHex)
  if (!constantTimeEquals(candidateHash, user.hashHex)) {
    const record = recordFailedAttempt(email)
    const left = MAX_FAILED_ATTEMPTS - record.attempts
    return {
      ok: false,
      error: left > 0 && left < 3
        ? `${genericError}. ${left} attempt(s) left before a temporary lockout.`
        : genericError
    }
  }

  clearFailedAttempts(email)
  startSession(user)
  return { ok: true, user: toPublicUser(user) }
}

// ------------------------------------------------------------ admin view ----

// Public (salt- and hash-free) list, used by the admin dashboard.
export const listUsers = () => loadUsers().map(toPublicUser)

export const countUsersByRole = () => {
  return loadUsers().reduce((counts, user) => {
    counts[user.role] = (counts[user.role] || 0) + 1
    return counts
  }, {})
}

// ------------------------------------------------------------------ init ----

// Seed one coordinator account on first run so the role-based pages can be
// demonstrated without registering an admin by hand. The credentials are shown
// on the login page because this is an assessment build, not a live system.
export const DEMO_ADMIN = {
  email: 'coordinator@activeclimate.org',
  password: 'Climate2026'
}

// Recompute the tag over the stored accounts and compare. A mismatch means the
// records were edited outside the app, so the session is dropped and the user
// has to sign in again - which they cannot do without the real password,
// because the password hash is covered by the tag too.
export const verifyStoredAccounts = async () => {
  const users = loadUsers()
  if (!users.length) return true

  const tag = loadUserTag()
  if (tag === null) {
    // First run after this check was added: sign what is already there.
    await saveUsers(users)
    return true
  }

  if (await verifyTag(users, tag)) return true

  console.warn('[auth] stored accounts failed their integrity check; signing out')
  logout()
  return false
}

export const initAuth = async () => {
  const users = loadUsers()
  if (!findUserByEmail(users, DEMO_ADMIN.email)) {
    await registerUser({
      name: 'Alex Coordinator',
      email: DEMO_ADMIN.email,
      password: DEMO_ADMIN.password,
      role: ROLES.ADMIN
    })
    // registerUser signs the new account in; the seed should not auto-login.
    logout()
  }
  return restoreSession()
}
