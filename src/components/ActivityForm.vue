<template>
  <div class="form-container">
    <h3>Log Your Activity</h3>
    
    <form @submit.prevent="submitForm" class="activity-form">
      <!-- Activity Type - VALIDATION BR (B.1) -->
      <div class="form-group">
        <label for="activity">Activity Type *</label>
        <select 
          id="activity"
          v-model="form.activity"
          @blur="validateField('activity')"
          class="form-input"
          :class="{ 'error': errors.activity }"
          required
        >
          <option value="">Select an activity</option>
          <option value="cycling">Cycling</option>
          <option value="running">Running</option>
          <option value="hiking">Hiking</option>
          <option value="water-sports">Water Sports</option>
        </select>
        <span v-if="errors.activity" class="error-text">{{ errors.activity }}</span>
      </div>

      <!-- Distance - VALIDATION -->
      <div class="form-group">
        <label for="distance">Distance (km) *</label>
        <input 
          id="distance"
          v-model.number="form.distance"
          type="number"
          placeholder="Enter distance"
          @blur="validateField('distance')"
          class="form-input"
          :class="{ 'error': errors.distance }"
          min="0.1"
          step="0.1"
          required
        />
        <span v-if="errors.distance" class="error-text">{{ errors.distance }}</span>
      </div>

      <!-- Duration - VALIDATION -->
      <div class="form-group">
        <label for="duration">Duration (minutes) *</label>
        <input 
          id="duration"
          v-model.number="form.duration"
          type="number"
          placeholder="Enter duration"
          @blur="validateField('duration')"
          class="form-input"
          :class="{ 'error': errors.duration }"
          min="5"
          step="1"
          required
        />
        <span v-if="errors.duration" class="error-text">{{ errors.duration }}</span>
      </div>

      <!-- Date - VALIDATION -->
      <div class="form-group">
        <label for="date">Date *</label>
        <input 
          id="date"
          v-model="form.date"
          type="date"
          @blur="validateField('date')"
          class="form-input"
          :class="{ 'error': errors.date }"
          required
        />
        <span v-if="errors.date" class="error-text">{{ errors.date }}</span>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        class="submit-button"
        :disabled="!isFormValid"
      >
        Log Activity
      </button>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </form>

    <!-- BR (B.2): Dynamic Data - Display submitted activities in client-side array -->
    <div v-if="submittedActivities.length > 0" class="submitted-activities">
      <h4>Your Logged Activities</h4>
      <div class="activities-list">
        <div 
          v-for="(activity, index) in submittedActivities" 
          :key="index"
          class="activity-item"
        >
          <span class="activity-type">{{ formatActivityName(activity.activity) }}</span>
          <span class="activity-distance">{{ activity.distance }} km</span>
          <span class="activity-date">{{ activity.date }}</span>
          <span class="co2-saved">CO₂: {{ activity.co2Saved }}kg</span>
        </div>
      </div>
      <p class="total-co2">Total CO₂ Saved: {{ totalCO2Saved }}kg</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const form = ref({
  activity: '',
  distance: null,
  duration: null,
  date: ''
})

const errors = ref({
  activity: '',
  distance: '',
  duration: '',
  date: ''
})

const successMessage = ref('')

// BR (B.2): Dynamic Data Structure - Client-side array (NO FIREBASE)
const submittedActivities = ref([])

// Check if user input is valid
const validateField = (fieldName) => {
  errors.value[fieldName] = ''
  
  if (fieldName === 'activity' && !form.value.activity) {
    errors.value.activity = 'Please select an activity'
  }
  
  if (fieldName === 'distance') {
    if (!form.value.distance) {
      errors.value.distance = 'Distance is required'
    } else if (form.value.distance <= 0) {
      errors.value.distance = 'Distance must be greater than 0'
    } else if (form.value.distance > 500) {
      errors.value.distance = 'Distance seems unrealistic (max 500km)'
    }
  }
  
  if (fieldName === 'duration') {
    if (!form.value.duration) {
      errors.value.duration = 'Duration is required'
    } else if (form.value.duration < 5) {
      errors.value.duration = 'Activity must be at least 5 minutes'
    } else if (form.value.duration > 600) {
      errors.value.duration = 'Duration seems unrealistic (max 10 hours)'
    }
  }
  
  if (fieldName === 'date' && !form.value.date) {
    errors.value.date = 'Date is required'
  }
}

const isFormValid = computed(() => {
  return form.value.activity && 
         form.value.distance && 
         form.value.duration && 
         form.value.date &&
         !Object.values(errors.value).some(err => err)
})

// Calculate total CO2 saved
const totalCO2Saved = computed(() => {
  return submittedActivities.value.reduce((sum, a) => sum + parseFloat(a.co2Saved), 0).toFixed(2)
})

const formatActivityName = (activity) => {
  return activity.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}
// Save activity to list when user submits form
const submitForm = () => {
  // Validate all fields before submission
  ['activity', 'distance', 'duration', 'date'].forEach(field => {
    validateField(field)
  })
  
  if (!isFormValid.value) return
  
  // Calculate CO2 saved (0.2kg per km average)
  const co2Saved = (form.value.distance * 0.2).toFixed(2)
  
  // Store in client-side array (BR B.2: Dynamic Data)
  submittedActivities.value.push({
    activity: form.value.activity,
    distance: form.value.distance,
    duration: form.value.duration,
    date: form.value.date,
    co2Saved: co2Saved,
    timestamp: new Date().toLocaleString()
  })
  
  successMessage.value = `Activity logged! You saved ${co2Saved}kg of CO₂!`
  
  // Reset form
  form.value = { activity: '', distance: null, duration: null, date: '' }
  errors.value = { activity: '', distance: '', duration: '', date: '' }
  
  // Clear success message after 3 seconds
  setTimeout(() => { successMessage.value = '' }, 3000)
}
</script>

<style scoped>
.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  margin: 2rem auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-container h3 {
  color: #2C5F2D;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.activity-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2C5F2D;
  background: #f9fff9;
}

.form-input.error {
  border-color: #c62828;
  background: #ffebee;
}

.error-text {
  color: #c62828;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.submit-button {
  background-color: #2C5F2D;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
  font-size: 0.95rem;
}

.submit-button:hover:not(:disabled) {
  background-color: #1f4620;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin-top: 1rem;
  font-weight: 600;
}

.submitted-activities {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #ddd;
}

.submitted-activities h4 {
  color: #2C5F2D;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  border-left: 4px solid #2C5F2D;
}

.activity-type {
  font-weight: 600;
  color: #2C5F2D;
  min-width: 80px;
}

.co2-saved {
  color: #27ae60;
  font-weight: 600;
  margin-left: auto;
}

.total-co2 {
  background: #f0f5f0;
  padding: 0.75rem;
  border-radius: 4px;
  color: #2C5F2D;
  font-weight: 600;
  text-align: right;
}

/* Responsive Design - BR (A.2) */
@media (max-width: 640px) {
  .form-container {
    padding: 1.5rem;
    margin: 1rem;
    max-width: 100%;
  }
  
  .form-input {
    font-size: 16px; /* Prevents iOS zoom */
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .co2-saved {
    margin-left: 0;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .form-container {
    max-width: 600px;
  }
}
</style>
