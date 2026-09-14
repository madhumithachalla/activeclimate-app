// BR (B.2): Dynamic data, persisted beyond the current session.
// BR (C.2): Entries are owned by the member who logged them - a member only
//           ever sees their own, while a coordinator can see all of them.
//
// Previously each activity lived in a ref inside App.vue, which meant the log
// was lost on every page change. Routing made that shared state a problem, so
// it now lives here and is written through to localStorage.

import { computed, ref } from 'vue'
import { readJson, writeJson, STORAGE_KEYS } from './storage.js'
import { findActivityBySlug } from '../data/activityGroups.js'

const isValidEntryList = (value) => {
  return Array.isArray(value) && value.every((entry) => (
    entry &&
    typeof entry.userId === 'string' &&
    typeof entry.activity === 'string' &&
    Number.isFinite(entry.distance) &&
    Number.isFinite(entry.duration)
  ))
}

const entries = ref(readJson(STORAGE_KEYS.activities, [], isValidEntryList))

const persist = () => writeJson(STORAGE_KEYS.activities, entries.value)

export const useActivityLog = () => ({
  entries: computed(() => entries.value)
})

// CO2 saved is the per-km figure for that activity type, so cycling 10km and
// hiking 10km do not claim the same benefit.
const calculateCo2Saved = (slug, distance) => {
  const group = findActivityBySlug(slug)
  const rate = group ? group.co2SavingPerKm : 0.2
  return Number((distance * rate).toFixed(2))
}

export const addEntry = (user, { activity, distance, duration, date }) => {
  if (!user || !user.id) {
    return { ok: false, error: 'You must be signed in to log an activity' }
  }

  const numericDistance = Number(distance)
  const numericDuration = Number(duration)

  if (!Number.isFinite(numericDistance) || !Number.isFinite(numericDuration)) {
    return { ok: false, error: 'Distance and duration must be numbers' }
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    userId: user.id,
    userName: user.name,
    activity,
    distance: numericDistance,
    duration: numericDuration,
    date,
    co2Saved: calculateCo2Saved(activity, numericDistance),
    timestamp: new Date().toISOString()
  }

  entries.value.push(entry)
  if (!persist()) {
    return { ok: false, error: 'Could not save your activity. Check browser storage settings.' }
  }

  return { ok: true, entry }
}

export const entriesForUser = (userId) => {
  return entries.value.filter((entry) => entry.userId === userId)
}

export const allEntries = () => entries.value

export const removeEntry = (id) => {
  const index = entries.value.findIndex((entry) => entry.id === id)
  if (index < 0) return { ok: false, error: 'Entry not found' }
  entries.value.splice(index, 1)
  persist()
  return { ok: true }
}

export const summarise = (list) => {
  const totalDistance = list.reduce((sum, entry) => sum + entry.distance, 0)
  const totalDuration = list.reduce((sum, entry) => sum + entry.duration, 0)
  const totalCo2 = list.reduce((sum, entry) => sum + entry.co2Saved, 0)

  return {
    count: list.length,
    totalDistance: Number(totalDistance.toFixed(1)),
    totalDuration,
    totalCo2: Number(totalCo2.toFixed(2)),
    avgDuration: list.length ? Math.round(totalDuration / list.length) : 0
  }
}
