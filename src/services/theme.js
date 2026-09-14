// Light / dark theme switching.
//
// Light, dark and "follow the system" are all resolved to an explicit
// data-theme of light or dark on <html>, so the stylesheet needs only one dark
// palette instead of duplicating it inside a prefers-color-scheme query.

import { computed, ref } from 'vue'
import { readJson, writeJson } from './storage.js'

const STORAGE_KEY = 'activeclimate.theme'

export const THEMES = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
}

export const THEME_OPTIONS = [
  { value: THEMES.LIGHT, label: 'Light', icon: '☀' },
  { value: THEMES.DARK, label: 'Dark', icon: '☽' },
  { value: THEMES.SYSTEM, label: 'System', icon: '◐' }
]

const isValidPreference = (value) => Object.values(THEMES).includes(value)

const preference = ref(
  readJson(STORAGE_KEY, THEMES.SYSTEM, isValidPreference)
)

// matchMedia is missing in some test environments, so it is probed rather than
// assumed to exist.
const darkQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

const systemPrefersDark = ref(darkQuery ? darkQuery.matches : false)

// The theme actually in force: the explicit choice, or whatever the operating
// system currently asks for.
const resolvedTheme = computed(() => {
  if (preference.value === THEMES.SYSTEM) {
    return systemPrefersDark.value ? THEMES.DARK : THEMES.LIGHT
  }
  return preference.value
})

const applyToDocument = () => {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', resolvedTheme.value)
}

export const setTheme = (value) => {
  if (!isValidPreference(value)) return
  preference.value = value
  writeJson(STORAGE_KEY, value)
  applyToDocument()
}

// Cycle light -> dark -> system, for the single-button toggle in the nav bar.
export const cycleTheme = () => {
  const order = [THEMES.LIGHT, THEMES.DARK, THEMES.SYSTEM]
  const next = order[(order.indexOf(preference.value) + 1) % order.length]
  setTheme(next)
  return next
}

export const useTheme = () => ({
  preference: computed(() => preference.value),
  resolvedTheme,
  isDark: computed(() => resolvedTheme.value === THEMES.DARK)
})

// Called once from main.js, before the app mounts, so the first paint is
// already in the right theme instead of flashing light then switching.
export const initTheme = () => {
  applyToDocument()

  // Keep following the system while the preference is "system".
  if (darkQuery) {
    const onChange = (event) => {
      systemPrefersDark.value = event.matches
      if (preference.value === THEMES.SYSTEM) applyToDocument()
    }

    if (typeof darkQuery.addEventListener === 'function') {
      darkQuery.addEventListener('change', onChange)
    } else if (typeof darkQuery.addListener === 'function') {
      // Safari below 14 only has the deprecated listener API.
      darkQuery.addListener(onChange)
    }
  }

  return resolvedTheme.value
}
