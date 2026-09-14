// BR (C.4): Security - input sanitisation helpers used before any user-supplied
// value is stored or re-displayed. Vue escapes {{ }} interpolation by default,
// so these guard the cases Vue cannot: values written to localStorage, values
// re-read from localStorage (which the user can edit in DevTools), and values
// placed into exported or downloaded text.

const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
}

// Escape the five HTML-significant characters. Defence in depth on the output
// side so a stored payload can never break out of a text node.
export const escapeHtml = (value) => {
  return String(value ?? '').replace(/[&<>"'/]/g, (char) => ENTITY_MAP[char])
}

// Control characters can hide a payload from a naive tag-stripper, so drop them
// by char code (C0 range plus DEL) before any other checks run.
const stripControlChars = (text) => {
  return Array.from(text)
    .filter((char) => {
      const code = char.charCodeAt(0)
      return code > 31 && code !== 127
    })
    .join('')
}

// Strip anything that looks like markup or a script-bearing URL, remove control
// characters, collapse whitespace and cap the length. Applied on the input side
// so a payload is never stored in the first place.
export const sanitizeText = (value, maxLength = 500) => {
  const withoutControls = stripControlChars(String(value ?? ''))
  return withoutControls
    .replace(/<[^>]*>/g, '')                      // drop HTML tags e.g. <script>
    .replace(/(javascript|data|vbscript):/gi, '') // drop script-bearing URL schemes
    .replace(/on\w+\s*=/gi, '')                   // drop inline event handlers
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

// Email is lowercased and trimmed so "A@B.com " and "a@b.com" cannot be
// registered as two separate accounts.
export const normaliseEmail = (value) => {
  return String(value ?? '').trim().toLowerCase().slice(0, 254)
}

// True when sanitising would have changed the value, i.e. the input contained
// something we refuse to store. Lets us show an explicit error instead of
// silently rewriting what the user typed.
export const containsUnsafeContent = (value) => {
  const raw = String(value ?? '')
  return raw.trim() !== sanitizeText(raw, Math.max(raw.length, 1))
}
