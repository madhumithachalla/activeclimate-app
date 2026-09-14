// Distance unit preference.
//
// Everything is stored in kilometres. Only the display converts, so switching
// units never rewrites saved data and never accumulates rounding error.

import { computed, ref } from 'vue'
import { readJson, writeJson } from './storage.js'

const STORAGE_KEY = 'activeclimate.units'

const KM_PER_MILE = 1.609344

export const UNITS = {
  KM: 'km',
  MILES: 'miles'
}

const isValidUnit = (value) => Object.values(UNITS).includes(value)

const unit = ref(readJson(STORAGE_KEY, UNITS.KM, isValidUnit))

export const useUnits = () => ({
  unit: computed(() => unit.value),
  unitLabel: computed(() => (unit.value === UNITS.MILES ? 'mi' : 'km')),
  isMiles: computed(() => unit.value === UNITS.MILES)
})

export const setUnit = (value) => {
  if (!isValidUnit(value)) return
  unit.value = value
  writeJson(STORAGE_KEY, value)
}

export const toggleUnit = () => {
  setUnit(unit.value === UNITS.KM ? UNITS.MILES : UNITS.KM)
  return unit.value
}

export const kmToMiles = (km) => Number(km) / KM_PER_MILE
export const milesToKm = (miles) => Number(miles) * KM_PER_MILE

export const displayDistance = (km, decimals = 1) => {
  const value = unit.value === UNITS.MILES ? kmToMiles(km) : Number(km)
  return Number(value.toFixed(decimals))
}

export const formatDistance = (km, decimals = 1) => {
  const suffix = unit.value === UNITS.MILES ? 'mi' : 'km'
  return `${displayDistance(km, decimals)} ${suffix}`
}

// The form collects a number in whatever unit is on screen; this normalises it
// back to kilometres before it is saved.
export const inputToKm = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return number
  return unit.value === UNITS.MILES ? milesToKm(number) : number
}
