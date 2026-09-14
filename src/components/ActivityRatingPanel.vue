<template>
  <section class="rating-panel" :aria-label="`Ratings for ${activity.name}`">
    <!-- BR (C.3): the aggregated score, visible to everyone including guests. -->
    <div class="aggregate">
      <div class="aggregate-score">
        <span class="average">{{ aggregate.count ? aggregate.average : '-' }}</span>
        <span class="out-of">/ 5</span>
      </div>
      <div class="aggregate-detail">
        <StarRating :model-value="aggregate.average" readonly />
        <p class="count">
          {{ aggregate.count === 0
            ? 'No ratings yet - be the first'
            : `Average of ${aggregate.count} member ${aggregate.count === 1 ? 'rating' : 'ratings'}` }}
        </p>
      </div>
    </div>

    <!-- Guests can see the average but cannot rate: authorisation, not just UI. -->
    <p v-if="!isAuthenticated" class="sign-in-prompt">
      <RouterLink :to="{ name: 'login', query: { redirect: '/activities' } }">Sign in</RouterLink>
      to rate this group.
    </p>

    <form v-else class="rating-form" @submit.prevent="handleSubmit">
      <div class="form-row">
        <label :for="`score-${activity.id}`" class="rating-label">
          {{ existingRating ? 'Update your rating' : 'Your rating' }}
        </label>
        <StarRating
          :id="`score-${activity.id}`"
          v-model="score"
          :label="`Your rating for ${activity.name}`"
        />
      </div>

      <div class="form-row">
        <label :for="`review-${activity.id}`" class="rating-label">
          Review <span class="optional">(optional)</span>
        </label>
        <textarea
          :id="`review-${activity.id}`"
          v-model="comment"
          class="review-input"
          :class="{ 'has-error': errors.comment }"
          rows="2"
          maxlength="300"
          placeholder="What was this group like?"
          @blur="validateComment"
        ></textarea>
        <span class="char-count">{{ comment.length }} / 300</span>
      </div>

      <p v-if="errors.score" class="error-text" role="alert">{{ errors.score }}</p>
      <p v-if="errors.comment" class="error-text" role="alert">{{ errors.comment }}</p>

      <button type="submit" class="rate-button" :disabled="score === 0">
        {{ existingRating ? 'Update rating' : 'Submit rating' }}
      </button>

      <p v-if="successMessage" class="success-text" role="status">{{ successMessage }}</p>
    </form>

    <!-- Reviews are rendered with {{ }} interpolation only. Vue escapes it, and
         the text was already stripped of markup before being stored. -->
    <ul v-if="reviews.length" class="review-list">
      <li v-for="review in reviews" :key="review.userId" class="review-item">
        <div class="review-head">
          <strong class="review-author">{{ review.userName }}</strong>
          <StarRating :model-value="review.score" readonly />
        </div>
        <p class="review-body">{{ review.comment }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import StarRating from './StarRating.vue'
import { useAuth } from '../services/auth.js'
import {
  submitRating,
  getUserRating,
  getAggregate,
  getRatingsFor,
  useRatings,
  MIN_SCORE,
  MAX_SCORE
} from '../services/ratings.js'
import { isSafe, maxLength, runRules } from '../utils/validators.js'

const props = defineProps({
  activity: { type: Object, required: true }
})

const { currentUser, isAuthenticated } = useAuth()
const { ratings } = useRatings()

const score = ref(0)
const comment = ref('')
const errors = ref({ score: '', comment: '' })
const successMessage = ref('')

// Re-computed whenever any rating changes, so submitting updates the average
// on screen immediately.
const aggregate = computed(() => {
  ratings.value.length // track the reactive source
  return getAggregate(props.activity.id)
})

const existingRating = computed(() => {
  ratings.value.length
  return getUserRating(props.activity.id, currentUser.value?.id)
})

// Only reviews that actually carry text are worth listing.
const reviews = computed(() => {
  ratings.value.length
  return getRatingsFor(props.activity.id).filter((rating) => rating.comment)
})

// Pre-fill the form with whatever this member submitted last time.
watch(
  existingRating,
  (rating) => {
    if (rating) {
      score.value = rating.score
      comment.value = rating.comment
    }
  },
  { immediate: true }
)

const validateComment = () => {
  errors.value.comment = runRules(comment.value, [
    maxLength('Review', 300),
    isSafe('Review')
  ])
}

const handleSubmit = () => {
  errors.value = { score: '', comment: '' }
  successMessage.value = ''

  if (score.value < MIN_SCORE || score.value > MAX_SCORE) {
    errors.value.score = `Choose a rating between ${MIN_SCORE} and ${MAX_SCORE} stars`
    return
  }

  validateComment()
  if (errors.value.comment) return

  const result = submitRating({
    activityId: props.activity.id,
    user: currentUser.value,
    score: score.value,
    comment: comment.value
  })

  if (!result.ok) {
    errors.value.score = result.error
    return
  }

  successMessage.value = result.updated
    ? 'Your rating was updated.'
    : 'Thanks - your rating has been added.'
  setTimeout(() => { successMessage.value = '' }, 3000)
}
</script>

<style scoped>
.rating-panel {
  border-top: 1px solid var(--border);
  margin-top: 1rem;
  padding-top: 1rem;
  text-align: left;
}

.aggregate {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.aggregate-score {
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
}

.average {
  font-size: 2rem;
  font-weight: 700;
  color: var(--brand);
  line-height: 1;
}

.out-of {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.count {
  margin: 0.15rem 0 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.sign-in-prompt {
  margin: 0.85rem 0 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.sign-in-prompt a {
  color: var(--brand);
  font-weight: 600;
}

.rating-form {
  margin-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rating-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--brand);
}

.optional {
  font-weight: 400;
  color: var(--text-subtle);
}

.review-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  border: 1px solid var(--border-input);
  border-radius: 4px;
  font: inherit;
  font-size: 0.85rem;
  resize: vertical;
}

.review-input:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 1px;
}

.review-input.has-error {
  border-color: var(--danger);
}

.char-count {
  align-self: flex-end;
  font-size: 0.7rem;
  color: var(--text-subtle);
}

.error-text {
  margin: 0;
  color: var(--danger);
  font-size: 0.8rem;
}

.success-text {
  margin: 0;
  color: var(--brand);
  font-size: 0.8rem;
  font-weight: 600;
}

.rate-button {
  align-self: flex-start;
  background: var(--btn-bg);
  color: var(--on-brand);
  border: none;
  padding: 0.5rem 1.1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.rate-button:hover:not(:disabled) {
  background: var(--btn-bg-hover);
}

.rate-button:disabled {
  background: var(--disabled);
  cursor: not-allowed;
}

.rate-button:focus-visible {
  outline: 3px solid var(--brand-strong);
  outline-offset: 2px;
}

.review-list {
  list-style: none;
  margin: 1rem 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.review-item {
  background: var(--surface-alt);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
}

.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.review-author {
  font-size: 0.85rem;
  color: var(--brand);
}

.review-body {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: var(--text-body);
  line-height: 1.45;
}
</style>
