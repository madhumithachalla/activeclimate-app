// BR (B.2) / BR (C.4): localStorage wrapper.
// Everything the app persists goes through here so that a corrupted, tampered
// or oversized entry can never crash the app or feed an unexpected shape into
// the rest of the code. The user can edit localStorage freely in DevTools, so
// every read is treated as untrusted input and re-validated.

const NAMESPACE = 'activeclimate'

export const STORAGE_KEYS = {
  users: `${NAMESPACE}.users`,
  session: `${NAMESPACE}.session`,
  ratings: `${NAMESPACE}.ratings`,
  activities: `${NAMESPACE}.activities`,
  lockouts: `${NAMESPACE}.lockouts`
}

// localStorage throws in private-browsing modes and when the quota is full, so
// availability is probed once rather than assumed.
const isAvailable = () => {
  try {
    const probe = `${NAMESPACE}.probe`
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

const available = typeof window !== 'undefined' && isAvailable()

// In-memory fallback so the app still works for the current session when
// storage is blocked, instead of throwing on every write.
const memoryFallback = new Map()

export const readJson = (key, fallback, validate) => {
  try {
    const raw = available ? window.localStorage.getItem(key) : memoryFallback.get(key)
    if (raw === null || raw === undefined) return fallback

    const parsed = JSON.parse(raw)

    // Reject anything that does not match the shape we expect. A tampered entry
    // is discarded rather than trusted.
    if (typeof validate === 'function' && !validate(parsed)) {
      console.warn(`[storage] discarded malformed entry for "${key}"`)
      return fallback
    }
    return parsed
  } catch (error) {
    console.warn(`[storage] could not read "${key}":`, error.message)
    return fallback
  }
}

export const writeJson = (key, value) => {
  try {
    const raw = JSON.stringify(value)
    if (available) {
      window.localStorage.setItem(key, raw)
    } else {
      memoryFallback.set(key, raw)
    }
    return true
  } catch (error) {
    // QuotaExceededError is the common case here.
    console.warn(`[storage] could not write "${key}":`, error.message)
    return false
  }
}

export const removeKey = (key) => {
  try {
    if (available) {
      window.localStorage.removeItem(key)
    } else {
      memoryFallback.delete(key)
    }
  } catch (error) {
    console.warn(`[storage] could not remove "${key}":`, error.message)
  }
}

export const isStorageAvailable = () => available
