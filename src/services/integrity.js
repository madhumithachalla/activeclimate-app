// Tamper detection for stored account records.
//
// What this does and does not achieve, stated plainly, because the distinction
// is the whole point:
//
// Before this existed, changing your own role to "admin" took three lines in
// the DevTools console - read localStorage, edit the role, write it back. The
// router guard then let you into /admin, because the guard trusts the stored
// record.
//
// Every account record is now written with an HMAC-SHA256 tag over its
// contents. On startup the tag is recomputed and compared; if the stored data
// has been edited by hand the tag will not match, and the app discards the
// session and signs the user out rather than trusting the record.
//
// The honest limitation: the key below ships inside the JavaScript bundle, so
// anyone willing to read the source can recompute a valid tag for edited data.
// This raises the cost of the attack from trivial to deliberate, and it catches
// accidental corruption, but it is not a security boundary. A value the user's
// own machine can compute is a value the user can forge. Only verification on a
// server the user does not control can actually prevent this - see the security
// reflection in the submission for what that design looks like.

const INTEGRITY_KEY = 'activeclimate.integrity.v1'

let cachedKey = null

const getKey = async () => {
  if (cachedKey) return cachedKey
  const encoder = new TextEncoder()
  cachedKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(INTEGRITY_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return cachedKey
}

const toHex = (buffer) => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

// Sort keys so that two records with the same contents in a different property
// order produce the same tag.
const canonicalise = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonicalise).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonicalise(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export const computeTag = async (value) => {
  const key = await getKey()
  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(canonicalise(value)))
  return toHex(signature)
}

const constantTimeEquals = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export const verifyTag = async (value, tag) => {
  if (typeof tag !== 'string' || !tag) return false
  return constantTimeEquals(await computeTag(value), tag)
}
