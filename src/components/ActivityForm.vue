<template>
  <div class="form-container">
    <h3>Log your activity</h3>
    <p class="form-intro">
      Every trip you log is converted into the CO2 it saved against the same journey by car.
    </p>

    <form class="activity-form" novalidate @submit.prevent="submitForm">
      <!-- BR (B.1): Validation type 1 - required selection from a fixed set -->
      <div class="form-group">
        <label for="activity">Activity type <span aria-hidden="true">*</span></label>
        <select
          id="activity"
          v-model="form.activity"
          class="form-input"
          :class="{ 'has-error': errors.activity }"
          :aria-invalid="Boolean(errors.activity)"
          aria-describedby="activity-error"
          @blur="validateField('activity')"
        >
          <option value="">Select an activity</option>
          <option v-for="group in ACTIVITY_GROUPS" :key="group.id" :value="group.slug">
            {{ group.name }}
          </option>
        </select>
        <span v-if="errors.activity" id="activity-error" class="error-text" role="alert">
          {{ errors.activity }}
        </span>
      </div>

      <!-- BR (B.1): Validation type 2 - numeric range -->
      <div class="form-group">
        <label for="distance">Distance (km) <span aria-hidden="true">*</span></label>
        <input
          id="distance"
          v-model.number="form.distance"
          type="number"
          min="0.1"
          max="500"
          step="0.1"
          placeholder="e.g. 12.5"
          class="form-input"
          :class="{ 'has-error': errors.distance }"
          :aria-invalid="Boolean(errors.distance)"
          aria-describedby="distance-error"
          @blur="validateField('distance')"
        />
        <span v-if="errors.distance" id="distance-error" class="error-text" role="alert">
          {{ errors.distance }}
        </span>
      </div>

      <div class="form-group">
        <label for="duration">Duration (minutes) <span aria-hidden="true">*</span></label>
        <input
          id="duration"
          v-model.number="form.duration"
          type="number"
          min="5"
          max="600"
          step="1"
          placeholder="e.g. 45"
          class="form-input"
          :class="{ 'has-error': errors.duration }"
          :aria-invalid="Boolean(errors.duration)"
          aria-describedby="duration-error"
          @blur="validateField('duration')"
        />
        <span v-if="errors.duration" id="duration-error" class="error-text" role="alert">
          {{ errors.duration }}
        </span>
      </div>

      <!-- BR (B.1): Validation type 3 - a date that cannot be in the future -->
      <div class="form-group">
        <label for="date">Date <span aria-hidden="true">*</span></label>
        <input
          id="date"
          v-model="form.date"
          type="date"
          :max="today"
          class="form-input"
          :class="{ 'has-error': errors.date }"
          :aria-invalid="Boolean(errors.date)"
          aria-describedby="date-error"
          @blur="validateField('date')"
        />
        <span v-if="errors.date" id="date-error" class="error-text" role="alert">
          {{ errors.date }}
        </span>
      </div>

      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

      <button type="submit" class="submit-button" :disabled="!isFormValid">
        Log activity
      </button>

      <p v-if="successMessage" class="success-message" role="status">{{ successMessage }}</p>
    </form>

    <!-- BR (B.2): the member's own entries, read back from the shared store -->
    <div v-if="myEntries.length" class="submitted-activities">
      <h4>Your logged activities</h4>
      <ul class="activities-list">
        <li v-for="entry in recentEntries" :key="entry.id" class="activity-item">
          <span class="activity-type">{{ formatActivityName(entry.activity) }}</span>
          <span class="activity-distance">{{ entry.distance }} km</span>
          <span class="activity-date">{{ entry.date }}</span>
          <span class="co2-saved">CO2 {{ entry.co2Saved }} kg</span>
        </li>
      </ul>
      <p class="total-co2">Total CO2 saved: {{ totals.totalCo2 }} kg</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ACTIVITY_GROUPS } from '../data/activityGroups.js'
import { useAuth } from '../services/auth.js'
import { useActivityLog, addEntry, entriesForUser, summarise } from '../services/activityLog.js'
import { required, inRange, runRules } from '../utils/validators.js'

const { currentUser } = useAuth()
const { entries } = useActivityLog()

const today = new Date().toISOString().slice(0, 10)

const form = ref({ activity: '', distance: null, duration: null, date: '' })
const errors = ref({ activity: '', distance: '', duration: '', date: '' })
const formError = ref('')
const successMessage = ref('')

// A date in the future cannot describe a trip that has happened.
const notInFuture = (value) => {
  if (!value) return ''
  return value > today ? 'Date cannot be in the future' : ''
}

const RULES = {
  activity: [required('Activity type')],
  distance: [required('Distance'), inRange('Distance', 0.1, 500)],
  duration: [required('Duration'), inRange('Duration', 5, 600)],
  date: [required('Date'), notInFuture]
}

const validateField = (field) => {
  errors.value[field] = runRules(form.value[field], RULES[field])
}

const isFormValid = computed(() => {
  const filled = form.value.activity && form.value.distance && form.value.duration && form.value.date
  return Boolean(filled) && !Object.values(errors.value).some(Boolean)
})

// Only this member's entries, so one account never sees another's log.
const myEntries = computed(() => {
  entries.value.length
  return entriesForUser(currentUser.value?.id)
})

const recentEntries = computed(() => {
  return [...myEntries.value].reverse().slice(0, 8)
})

const totals = computed(() => summarise(myEntries.value))

const formatActivityName = (slug) => {
  const group = ACTIVITY_GROUPS.find((item) => item.slug === slug)
  return group ? group.name : slug
}

const submitForm = () => {
  formError.value = ''
  Object.keys(RULES).forEach(validateField)
  if (!isFormValid.value) return

  const result = addEntry(currentUser.value, {
    activity: form.value.activity,
    distance: form.value.distance,
    duration: form.value.duration,
    date: form.value.date
  })

  if (!result.ok) {
    formError.value = result.error
    return
  }

  successMessage.value = `Activity logged. You saved ${result.entry.co2Saved} kg of CO2.`
  form.value = { activity: '', distance: null, duration: null, date: '' }
  errors.value = { activity: '', distance: '', duration: '', date: '' }

  setTimeout(() => { successMessage.value = '' }, 4000)
}
</script>

<style scoped>
.form-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.form-container h3 {
  color: #2c5f2d;
  margin: 0 0 0.35rem;
  font-size: 1.4rem;
}

.form-intro {
  margin: 0 0 1.5rem;
  color: #6b7b6b;
  font-size: 0.88rem;
  line-height: 1.55;
}

.activity-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c5f2d;
}

.form-input {
  padding: 0.65rem 0.75rem;
  border: 1px solid #ccd4cc;
  border-radius: 5px;
  font: inherit;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  background: white;
}

.form-input:focus-visible {
  outline: 3px solid #2c5f2d;
  outline-offset: 1px;
  border-color: #2c5f2d;
}

.form-input.has-error {
  border-color: #c0392b;
  background: #fdf4f3;
}

.error-text {
  color: #c0392b;
  font-size: 0.8rem;
}

.form-error {
  margin: 0;
  padding: 0.65rem 0.75rem;
  background: #fdf0ee;
  border-left: 4px solid #c0392b;
  border-radius: 4px;
  color: #a5281b;
  font-size: 0.85rem;
}

.submit-button {
  background: #2c5f2d;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.submit-button:hover:not(:disabled) {
  background: #1f4620;
}

.submit-button:disabled {
  background: #a8b5a8;
  cursor: not-allowed;
}

.submit-button:focus-visible {
  outline: 3px solid #1f4620;
  outline-offset: 2px;
}

.success-message {
  margin: 0;
  padding: 0.65rem 0.75rem;
  background: #eef6ee;
  border-left: 4px solid #2c5f2d;
  border-radius: 4px;
  color: #1f4620;
  font-size: 0.85rem;
  font-weight: 600;
}

.submitted-activities {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e6ece6;
}

.submitted-activities h4 {
  color: #2c5f2d;
  margin: 0 0 0.85rem;
  font-size: 1rem;
}

.activities-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: grid;
  grid-template-columns: 1.2fr 0.7fr 1fr 0.9fr;
  gap: 0.5rem;
  align-items: center;
  background: #f6f9f6;
  border-radius: 5px;
  padding: 0.55rem 0.7rem;
  font-size: 0.82rem;
}

.activity-type {
  font-weight: 600;
  color: #2c3e2c;
}

.activity-distance,
.activity-date {
  color: #6b7b6b;
}

.co2-saved {
  color: #2c5f2d;
  font-weight: 600;
  text-align: right;
}

.total-co2 {
  margin: 0.85rem 0 0;
  font-weight: 700;
  color: #2c5f2d;
  text-align: right;
  font-size: 0.9rem;
}

@media (max-width: 560px) {
  .form-container {
    padding: 1.5rem 1.15rem;
  }

  .activity-item {
    grid-template-columns: 1fr 1fr;
    row-gap: 0.25rem;
  }

  .co2-saved {
    text-align: left;
  }
}
</style>
