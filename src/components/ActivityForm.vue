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
        <label for="distance">Distance ({{ unitLabel }}) <span aria-hidden="true">*</span></label>
        <input
          id="distance"
          v-model.number="form.distance"
          type="number"
          :min="distanceLimits.min"
          :max="distanceLimits.max"
          step="0.1"
          :placeholder="`e.g. ${isMiles ? '7.8' : '12.5'}`"
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
          <span class="activity-distance">{{ formatDistance(entry.distance) }}</span>
          <span class="activity-date">{{ entry.date }}</span>
          <span class="co2-saved">CO2 {{ entry.co2Saved }} kg</span>
        </li>
      </ul>
      <p class="total-co2">
        {{ formatDistance(totals.totalDistance) }} logged &middot;
        {{ totals.totalCo2 }} kg CO2 saved
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ACTIVITY_GROUPS } from '../data/activityGroups.js'
import { useAuth } from '../services/auth.js'
import { useActivityLog, addEntry, entriesForUser, summarise } from '../services/activityLog.js'
import { useUnits, inputToKm, formatDistance } from '../services/units.js'
import { required, inRange, runRules } from '../utils/validators.js'

const { currentUser } = useAuth()
const { entries } = useActivityLog()
const { unitLabel, isMiles } = useUnits()

// The stored limits are 0.1-500 km; in miles the same range is 0.1-310.
const distanceLimits = computed(() => (
  isMiles.value ? { min: 0.1, max: 310 } : { min: 0.1, max: 500 }
))

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
  distance: [required('Distance'), (value) => inRange('Distance', distanceLimits.value.min, distanceLimits.value.max)(value)],
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
    // The field is entered in whichever unit is on screen; storage is always km.
    distance: inputToKm(form.value.distance),
    duration: form.value.duration,
    date: form.value.date
  })

  if (!result.ok) {
    formError.value = result.error
    return
  }

  successMessage.value = `${formatDistance(result.entry.distance)} logged. You saved ${result.entry.co2Saved} kg of CO2.`
  form.value = { activity: '', distance: null, duration: null, date: '' }
  errors.value = { activity: '', distance: '', duration: '', date: '' }

  setTimeout(() => { successMessage.value = '' }, 4000)
}
</script>

<style scoped>
.form-container {
  background: var(--surface);
  padding: 2rem;
  border-radius: 10px;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 2px 12px var(--shadow-card);
}

.form-container h3 {
  color: var(--brand);
  margin: 0 0 0.35rem;
  font-size: 1.4rem;
}

.form-intro {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
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
  color: var(--brand);
}

.form-input {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-input);
  border-radius: 5px;
  font: inherit;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
  background: var(--surface);
}

.form-input:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 1px;
  border-color: var(--brand);
}

.form-input.has-error {
  border-color: var(--danger);
  background: var(--danger-bg-soft);
}

.error-text {
  color: var(--danger);
  font-size: 0.8rem;
}

.form-error {
  margin: 0;
  padding: 0.65rem 0.75rem;
  background: var(--danger-bg);
  border-left: 4px solid var(--danger);
  border-radius: 4px;
  color: var(--danger-text);
  font-size: 0.85rem;
}

.submit-button {
  background: var(--btn-bg);
  color: var(--on-brand);
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.submit-button:hover:not(:disabled) {
  background: var(--btn-bg-hover);
}

.submit-button:disabled {
  background: var(--disabled);
  cursor: not-allowed;
}

.submit-button:focus-visible {
  outline: 3px solid var(--brand-strong);
  outline-offset: 2px;
}

.success-message {
  margin: 0;
  padding: 0.65rem 0.75rem;
  background: var(--success-bg);
  border-left: 4px solid var(--brand);
  border-radius: 4px;
  color: var(--brand-strong);
  font-size: 0.85rem;
  font-weight: 600;
}

.submitted-activities {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.submitted-activities h4 {
  color: var(--brand);
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
  background: var(--surface-alt);
  border-radius: 5px;
  padding: 0.55rem 0.7rem;
  font-size: 0.82rem;
}

.activity-type {
  font-weight: 600;
  color: var(--text-strong);
}

.activity-distance,
.activity-date {
  color: var(--text-muted);
}

.co2-saved {
  color: var(--brand);
  font-weight: 600;
  text-align: right;
}

.total-co2 {
  margin: 0.85rem 0 0;
  font-weight: 700;
  color: var(--brand);
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
