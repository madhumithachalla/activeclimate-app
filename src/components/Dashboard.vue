<template>
  <div class="dashboard-container">
    <h2 class="dashboard-title">📊 Your Activity Dashboard</h2>
    
    <!-- Filter, Sort, and Search Controls -->
    <div class="controls-section">
      <!-- Search box -->
      <div class="search-box">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Search activities..."
          class="search-input"
        />
      </div>

      <!-- Filter by activity type -->
      <div class="filter-sort-group">
        <select v-model="selectedActivityFilter" class="filter-select">
          <option value="">All Activities</option>
          <option value="cycling">Cycling</option>
          <option value="running">Running</option>
          <option value="hiking">Hiking</option>
          <option value="water-sports">Water Sports</option>
        </select>

        <!-- Sort by options -->
        <select v-model="sortBy" class="sort-select">
          <option value="date-newest">Newest First</option>
          <option value="date-oldest">Oldest First</option>
          <option value="distance-high">Highest Distance</option>
          <option value="distance-low">Lowest Distance</option>
          <option value="co2-high">Most CO₂ Saved</option>
          <option value="co2-low">Least CO₂ Saved</option>
        </select>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏃</div>
        <div class="stat-content">
          <p class="stat-label">Activities Logged</p>
          <p class="stat-value">{{ totalActivities }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📏</div>
        <div class="stat-content">
          <p class="stat-label">Total Distance</p>
          <p class="stat-value">{{ totalDistance }} km</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🌍</div>
        <div class="stat-content">
          <p class="stat-label">CO₂ Saved</p>
          <p class="stat-value">{{ totalCO2 }} kg</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <p class="stat-label">Avg Duration</p>
          <p class="stat-value">{{ avgDuration }} min</p>
        </div>
      </div>
    </div>

    <!-- Activity Breakdown by Type -->
    <div class="activity-breakdown">
      <h3>Activity Breakdown</h3>
      <div class="breakdown-grid">
        <div 
          v-for="(count, activity) in activityCounts" 
          :key="activity"
          class="breakdown-card"
        >
          <p class="activity-name">{{ formatActivityName(activity) }}</p>
          <p class="activity-count">{{ count }}</p>
        </div>
      </div>
    </div>

    <!-- Filtered and Sorted Activities -->
    <div v-if="filteredActivities.length > 0" class="recent-activities">
      <h3>Your Activities ({{ filteredActivities.length }})</h3>
      <div class="activities-timeline">
        <div 
          v-for="(activity, index) in filteredActivities" 
          :key="index"
          class="timeline-item"
        >
          <div class="timeline-icon">
            {{ getActivityIcon(activity.activity) }}
          </div>
          <div class="timeline-content">
            <p class="activity-title">
              <strong>{{ formatActivityName(activity.activity) }}</strong>
              <span class="co2-badge">+{{ activity.co2Saved }}kg CO₂</span>
            </p>
            <p class="activity-details">
              {{ activity.distance }} km · {{ activity.duration }} min · {{ activity.date }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- No results message -->
    <div v-else class="empty-state">
      <p v-if="activities.length === 0">📝 No activities logged yet. Start logging your activities to see your stats!</p>
      <p v-else>🔍 No activities match your search or filter. Try adjusting your criteria!</p>
    </div>

    <!-- Achievement Badge -->
    <div v-if="totalActivities >= 5" class="achievement">
      <p>🏆 Great work! You've logged {{ totalActivities }} activities!</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

// Search and filter states
const searchQuery = ref('')
const selectedActivityFilter = ref('')
const sortBy = ref('date-newest')

// Calculate total activities
const totalActivities = computed(() => props.activities.length)

// Calculate total distance
const totalDistance = computed(() => {
  return props.activities.reduce((sum, a) => sum + a.distance, 0).toFixed(1)
})

// Calculate total CO2 saved
const totalCO2 = computed(() => {
  return props.activities.reduce((sum, a) => sum + parseFloat(a.co2Saved), 0).toFixed(2)
})

// Calculate average duration
const avgDuration = computed(() => {
  if (props.activities.length === 0) return 0
  const sum = props.activities.reduce((acc, a) => acc + a.duration, 0)
  return Math.round(sum / props.activities.length)
})

// Count activities by type
const activityCounts = computed(() => {
  const counts = {}
  props.activities.forEach(activity => {
    counts[activity.activity] = (counts[activity.activity] || 0) + 1
  })
  return counts
})

// Filter and sort activities
const filteredActivities = computed(() => {
  let result = [...props.activities]

  // Filter by activity type
  if (selectedActivityFilter.value) {
    result = result.filter(a => a.activity === selectedActivityFilter.value)
  }

  // Search by activity type or date
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a => 
      formatActivityName(a.activity).toLowerCase().includes(query) ||
      a.date.includes(query) ||
      a.distance.toString().includes(query)
    )
  }

  // Sort the results
  result.sort((a, b) => {
    if (sortBy.value === 'date-newest') {
      return new Date(b.date) - new Date(a.date)
    } else if (sortBy.value === 'date-oldest') {
      return new Date(a.date) - new Date(b.date)
    } else if (sortBy.value === 'distance-high') {
      return b.distance - a.distance
    } else if (sortBy.value === 'distance-low') {
      return a.distance - b.distance
    } else if (sortBy.value === 'co2-high') {
      return parseFloat(b.co2Saved) - parseFloat(a.co2Saved)
    } else if (sortBy.value === 'co2-low') {
      return parseFloat(a.co2Saved) - parseFloat(b.co2Saved)
    }
    return 0
  })

  return result
})

// Format activity name nicely
const formatActivityName = (activity) => {
  return activity
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get emoji icon for activity
const getActivityIcon = (activity) => {
  const icons = {
    'cycling': '🚴',
    'running': '🏃',
    'hiking': '🏔️',
    'water-sports': '🏊'
  }
  return icons[activity] || '🏃'
}
</script>

<style scoped>
.dashboard-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 2rem auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dashboard-title {
  text-align: center;
  color: #2C5F2D;
  font-size: 1.8rem;
  margin-bottom: 2rem;
}

/* Search and Filter Controls */
.controls-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2C5F2D;
  background: #f9fff9;
}

.filter-sort-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-select,
.sort-select {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus,
.sort-select:focus {
  outline: none;
  border-color: #2C5F2D;
  background: #f9fff9;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 2px solid #2C5F2D;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(44, 95, 45, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  margin: 0.5rem 0 0 0;
  font-size: 2rem;
  color: #2C5F2D;
  font-weight: bold;
}

/* Activity Breakdown */
.activity-breakdown {
  margin-bottom: 2rem;
}

.activity-breakdown h3 {
  color: #2C5F2D;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.breakdown-card {
  background: #f0f5f0;
  border-left: 4px solid #2C5F2D;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.activity-name {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.activity-count {
  margin: 0.5rem 0 0 0;
  font-size: 2rem;
  color: #2C5F2D;
  font-weight: bold;
}

/* Recent Activities */
.recent-activities {
  margin-bottom: 2rem;
}

.recent-activities h3 {
  color: #2C5F2D;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.activities-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-left: 4px solid #2C5F2D;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.timeline-item:hover {
  background: #f0f5f0;
}

.timeline-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.timeline-content {
  flex: 1;
}

.activity-title {
  margin: 0;
  font-size: 0.95rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.co2-badge {
  background: #e8f5e9;
  color: #27ae60;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.activity-details {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #999;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 1rem;
}

/* Achievement Badge */
.achievement {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .dashboard-container {
    padding: 1.5rem 1rem;
    margin: 1rem;
  }

  .dashboard-title {
    font-size: 1.4rem;
  }

  .controls-section {
    flex-direction: column;
  }

  .filter-sort-group {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    font-size: 2rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .activity-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .breakdown-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablets */
@media (min-width: 641px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .breakdown-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .filter-sort-group {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Large Tablets - 992px to 1200px */
@media (min-width: 992px) and (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .breakdown-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .filter-sort-group {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>