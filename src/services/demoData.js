// Demo content for the assessment build.
//
// An empty app makes the dashboard, the aggregated ratings and the admin
// overview all look broken on a first visit, so a small realistic dataset is
// seeded once: two member accounts with a month of logged trips and ratings
// spread across the four groups.
//
// It only ever runs when there is no existing data, so a real account and its
// activities are never overwritten.

import { ROLES, registerUser, listUsers, logout } from './auth.js'
import { addEntry, allEntries } from './activityLog.js'
import { submitRating } from './ratings.js'
import { readJson, writeJson } from './storage.js'

const SEEDED_FLAG = 'activeclimate.seeded'

export const DEMO_MEMBER = {
  name: 'Vaish Challa',
  email: 'vaish@activeclimate.org',
  password: 'Cycling2026'
}

const SECOND_MEMBER = {
  name: 'Jordan Lee',
  email: 'jordan@activeclimate.org',
  password: 'Running2026'
}

// Dates are generated relative to today so the dashboard never shows a log that
// looks abandoned months ago.
const daysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

const VAISH_TRIPS = [
  { activity: 'cycling', distance: 12.4, duration: 41, date: daysAgo(1) },
  { activity: 'running', distance: 6.2, duration: 34, date: daysAgo(3) },
  { activity: 'cycling', distance: 18.7, duration: 58, date: daysAgo(6) },
  { activity: 'hiking', distance: 9.5, duration: 145, date: daysAgo(9) },
  { activity: 'cycling', distance: 11.1, duration: 37, date: daysAgo(13) },
  { activity: 'running', distance: 8.0, duration: 45, date: daysAgo(17) },
  { activity: 'water-sports', distance: 2.3, duration: 50, date: daysAgo(21) },
  { activity: 'cycling', distance: 22.6, duration: 71, date: daysAgo(26) }
]

const JORDAN_TRIPS = [
  { activity: 'running', distance: 10.5, duration: 56, date: daysAgo(2) },
  { activity: 'running', distance: 5.1, duration: 28, date: daysAgo(5) },
  { activity: 'hiking', distance: 14.2, duration: 210, date: daysAgo(11) },
  { activity: 'cycling', distance: 7.8, duration: 29, date: daysAgo(19) }
]

const VAISH_RATINGS = [
  { activityId: 1, score: 5, comment: 'Ride leaders actually wait at the junctions, which makes a huge difference if you are new.' },
  { activityId: 3, score: 4, comment: 'Great trails. Bring more water than you think you need in summer.' },
  { activityId: 2, score: 4, comment: '' }
]

const JORDAN_RATINGS = [
  { activityId: 1, score: 3, comment: 'Good group, though the Sunday pace is quicker than the listing suggests.' },
  { activityId: 2, score: 5, comment: 'Friendly and genuinely beginner-friendly. The 5km option is a good entry point.' },
  { activityId: 4, score: 4, comment: 'Well organised, but the bay can be choppy after midday.' }
]

const seedMember = async (profile, trips, ratings) => {
  const result = await registerUser({
    name: profile.name,
    email: profile.email,
    password: profile.password,
    role: ROLES.MEMBER
  })
  if (!result.ok) return null

  const user = result.user
  trips.forEach((trip) => addEntry(user, trip))
  ratings.forEach((rating) => submitRating({ ...rating, user }))
  return user
}

export const seedDemoData = async () => {
  const alreadySeeded = readJson(SEEDED_FLAG, false, (value) => typeof value === 'boolean')

  // Skip if this browser has been seeded before, or if anyone has already
  // registered or logged something of their own.
  const hasRealData = listUsers().length > 1 || allEntries().length > 0
  if (alreadySeeded || hasRealData) return false

  await seedMember(DEMO_MEMBER, VAISH_TRIPS, VAISH_RATINGS)
  await seedMember(SECOND_MEMBER, JORDAN_TRIPS, JORDAN_RATINGS)

  // registerUser signs each new account in as a side effect; the seed should
  // leave the visitor signed out.
  logout()

  writeJson(SEEDED_FLAG, true)
  return true
}
