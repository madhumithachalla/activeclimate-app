<template>
  <div class="dashboard-container">
    <h2 class="dashboard-title">📊 Your Activity Dashboard</h2>
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
    <div class="activity-breakdown">
      <h3>Activity Breakdown</h3>
      <div class="breakdown-grid">
        <div v-for="(count, activity) in activityCounts" :key="activity" class="breakdown-card">
          <p class="activity-name">{{ formatActivityName(activity) }}</p>
          <p class="activity-count">{{ count }}</p>
        </div>
      </div>
    </div>
    <div v-if="activities.length > 0" class="recent-activities">
      <h3>Recent Activities</h3>
      <div class="activities-timeline">
        <div v-for="(activity, index) in recentActivities" :key="index" class="timeline-item">
          <div class="timeline-icon">{{ getActivityIcon(activity.activity) }}</div>
          <div class="timeline-content">
            <p class="activity-title">
              <strong>{{ formatActivityName(activity.activity) }}</strong>
              <span class="co2-badge">+{{ activity.co2Saved }}kg CO₂</span>
            </p>
            <p class="activity-details">{{ activity.distance }} km · {{ activity.duration }} min · {{ activity.date }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>📝 No activities logged yet. Start logging your activities to see your stats!</p>
    </div>
    <div v-if="totalActivities >= 5" class="achievement">
      <p>🏆 Great work! You've logged {{ totalActivities }} activities!</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

const totalActivities = computed(() => props.activities.length)
const totalDistance = computed(() => props.activities.reduce((sum, a) => sum + a.distance, 0).toFixed(1))
const totalCO2 = computed(() => props.activities.reduce((sum, a) => sum + parseFloat(a.co2Saved), 0).toFixed(2))
const avgDuration = computed(() => {
  if (props.activities.length === 0) return 0
  const sum = props.activities.reduce((acc, a) => acc + a.duration, 0)
  return Math.round(sum / props.activities.length)
})
const activityCounts = computed(() => {
  const counts = {}
  props.activities.forEach(activity => {
    counts[activity.activity] = (counts[activity.activity] || 0) + 1
  })
  return counts
})
const recentActivities = computed(() => [...props.activities].reverse().slice(0, 5))
const formatActivityName = (activity) => {
  return activity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
const getActivityIcon = (activity) => {
  const icons = {'cycling': '🚴', 'running': '🏃', 'hiking': '🏔️', 'water-sports': '🏊'}
  return icons[activity] || '🏃'
}
</script>

<style scoped>
.dashboard-container { padding: 2rem 1rem; max-width: 1200px; margin: 2rem auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.dashboard-title { text-align: center; color: #2C5F2D; font-size: 1.8rem; margin-bottom: 2rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%); border: 2px solid #2C5F2D; border-radius: 8px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: transform 0.3s ease; }
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(44, 95, 45, 0.15); }
.stat-icon { font-size: 2.5rem; flex-shrink: 0; }
.stat-content { flex: 1; }
.stat-label { margin: 0; font-size: 0.85rem; color: #666; font-weight: 600; }
.stat-value { margin: 0.5rem 0 0 0; font-size: 2rem; color: #2C5F2D; font-weight: bold; }
.activity-breakdown { margin-bottom: 2rem; }
.activity-breakdown h3 { color: #2C5F2D; font-size: 1.3rem; margin-bottom: 1rem; }
.breakdown-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
.breakdown-card { background: #f0f5f0; border-left: 4px solid #2C5F2D; padding: 1rem; border-radius: 4px; text-align: center; }
.activity-name { margin: 0; font-size: 0.9rem; color: #666; font-weight: 600; }
.activity-count { margin: 0.5rem 0 0 0; font-size: 2rem; color: #2C5F2D; font-weight: bold; }
.recent-activities { margin-bottom: 2rem; }
.recent-activities h3 { color: #2C5F2D; font-size: 1.3rem; margin-bottom: 1rem; }
.activities-timeline { display: flex; flex-direction: column; gap: 1rem; }
.timeline-item { display: flex; gap: 1rem; padding: 1rem; background: #f9f9f9; border-left: 4px solid #2C5F2D; border-radius: 4px; }
.timeline-item:hover { background: #f0f5f0; }
.timeline-icon { font-size: 1.8rem; flex-shrink: 0; }
.timeline-content { flex: 1; }
.activity-title { margin: 0; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
.co2-badge { background: #e8f5e9; color: #27ae60; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.activity-details { margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #999; }
.empty-state { text-align: center; padding: 2rem; color: #999; }
.achievement { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; padding: 1rem; border-radius: 8px; text-align: center; font-weight: 600; }
@media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .stat-card { flex-direction: column; text-align: center; } }
</style>
