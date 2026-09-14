// BR (B.1) / BR (C.4): Reusable client-side validation rules.
// Every rule returns an error string when the value is rejected, or '' when it
// passes, so a form can run a list of rules and take the first non-empty result.

import { containsUnsafeContent, normaliseEmail } from './sanitize.js'

// RFC-5322 is far looser than anything useful here; this pattern accepts the
// shapes real addresses take and rejects spaces, double dots and missing TLDs.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/
const NAME_PATTERN = /^[A-Za-z][A-Za-z '-]*$/

export const required = (label) => (value) => {
  const empty = value === null || value === undefined || String(value).trim() === ''
  return empty ? `${label} is required` : ''
}

export const minLength = (label, min) => (value) => {
  return String(value ?? '').trim().length < min
    ? `${label} must be at least ${min} characters`
    : ''
}

export const maxLength = (label, max) => (value) => {
  return String(value ?? '').trim().length > max
    ? `${label} must be ${max} characters or fewer`
    : ''
}

// Validation type 1: format / pattern matching.
export const isEmail = (value) => {
  return EMAIL_PATTERN.test(normaliseEmail(value))
    ? ''
    : 'Enter a valid email address, for example name@example.com'
}

export const isName = (value) => {
  return NAME_PATTERN.test(String(value ?? '').trim())
    ? ''
    : 'Name can only contain letters, spaces, apostrophes and hyphens'
}

// Validation type 2: composition / strength rules.
export const isStrongPassword = (value) => {
  const password = String(value ?? '')
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[0-9]/.test(password)) return 'Password must include a number'
  return ''
}

// Validation type 3: cross-field comparison.
export const matches = (otherValue, label) => (value) => {
  return value === otherValue ? '' : `${label} do not match`
}

// Validation type 4: numeric range, used by the rating feature.
export const inRange = (label, min, max) => (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return `${label} must be a number`
  if (number < min || number > max) return `${label} must be between ${min} and ${max}`
  return ''
}

// BR (C.4): reject values carrying markup or script content outright rather
// than silently sanitising them, so the user sees why the input was refused.
export const isSafe = (label) => (value) => {
  return containsUnsafeContent(value)
    ? `${label} cannot contain HTML or script content`
    : ''
}

// Run rules in order and return the first failure. Empty string means valid.
export const runRules = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value)
    if (error) return error
  }
  return ''
}
