// BR (C.3): Rating - members rate each activity group out of 5 and everyone
//           sees the aggregated average across all users.
// BR (C.4): Security - the score is range-checked and the written review is
//           sanitised before it is stored, so a review can never carry markup.
//
// Ratings are held in one reactive array that every component reads from, so a
// new rating updates the activity cards, the member dashboard and the admin
// overview at the same time without any manual refresh.

import { computed, ref } from 'vue'
import { readJson, writeJson, STORAGE_KEYS } from './storage.js'
import { sanitizeText } from '../utils/sanitize.js'

export const MIN_SCORE = 1
export const MAX_SCORE = 5
const MAX_COMMENT_LENGTH = 300

// Shape check for everything read back from localStorage.
const isValidRatingList = (value) => {
  return Array.isArray(value) && value.every((rating) => (
    rating &&
    typeof rating.activityId === 'number' &&
    typeof rating.userId === 'string' &&
    Number.isFinite(rating.score) &&
    rating.score >= MIN_SCORE &&
    rating.score <= MAX_SCORE
  ))
}

// Loaded once at startup, then kept in memory so every view reads the same
// array and updates together.
const ratings = ref(readJson(STORAGE_KEYS.ratings, [], isValidRatingList))

const persist = () => writeJson(STORAGE_KEYS.ratings, ratings.value)

export const useRatings = () => ({
  ratings: computed(() => ratings.value),
  totalRatings: computed(() => ratings.value.length)
})

// Clamp to a whole number inside the allowed range. Belt and braces alongside
// the form validation, because this is the value that gets persisted.
const normaliseScore = (score) => {
  const rounded = Math.round(Number(score))
  if (!Number.isFinite(rounded)) return null
  if (rounded < MIN_SCORE || rounded > MAX_SCORE) return null
  return rounded
}

// One rating per user per activity: rating again updates the existing entry
// rather than letting one member inflate the average.
export const submitRating = ({ activityId, user, score, comment = '' }) => {
  if (!user || !user.id) {
    return { ok: false, error: 'You must be signed in to leave a rating' }
  }

  const cleanScore = normaliseScore(score)
  if (cleanScore === null) {
    return { ok: false, error: `Rating must be a whole number between ${MIN_SCORE} and ${MAX_SCORE}` }
  }

  const cleanComment = sanitizeText(comment, MAX_COMMENT_LENGTH)

  const existingIndex = ratings.value.findIndex(
    (rating) => rating.activityId === activityId && rating.userId === user.id
  )

  const entry = {
    activityId,
    userId: user.id,
    userName: sanitizeText(user.name, 60),
    score: cleanScore,
    comment: cleanComment,
    createdAt: new Date().toISOString()
  }

  if (existingIndex >= 0) {
    ratings.value.splice(existingIndex, 1, entry)
  } else {
    ratings.value.push(entry)
  }

  if (!persist()) {
    return { ok: false, error: 'Could not save your rating. Check browser storage settings.' }
  }

  return { ok: true, updated: existingIndex >= 0, rating: entry }
}

export const getUserRating = (activityId, userId) => {
  if (!userId) return null
  return ratings.value.find(
    (rating) => rating.activityId === activityId && rating.userId === userId
  ) || null
}

export const getRatingsFor = (activityId) => {
  return ratings.value.filter((rating) => rating.activityId === activityId)
}

// The aggregate shown on each activity card: mean score, how many people
// rated, and the 1-5 breakdown used by the admin overview.
export const getAggregate = (activityId) => {
  const forActivity = getRatingsFor(activityId)
  const count = forActivity.length

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  forActivity.forEach((rating) => {
    distribution[rating.score] += 1
  })

  if (count === 0) {
    return { average: 0, count: 0, distribution }
  }

  const total = forActivity.reduce((sum, rating) => sum + rating.score, 0)
  return {
    average: Number((total / count).toFixed(1)),
    count,
    distribution
  }
}

export const getOverallAggregate = () => {
  const count = ratings.value.length
  if (count === 0) return { average: 0, count: 0 }
  const total = ratings.value.reduce((sum, rating) => sum + rating.score, 0)
  return { average: Number((total / count).toFixed(1)), count }
}

export const deleteRating = (activityId, userId) => {
  const index = ratings.value.findIndex(
    (rating) => rating.activityId === activityId && rating.userId === userId
  )
  if (index < 0) return { ok: false, error: 'Rating not found' }

  ratings.value.splice(index, 1)
  persist()
  return { ok: true }
}
