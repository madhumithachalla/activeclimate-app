<template>
  <div class="activities-container">
    <h2>Choose Your Activity</h2>
    <div class="activity-grid">
      <div v-for="activity in activities" :key="activity.id" class="activity-card">
        <div class="activity-icon">{{ activity.icon }}</div>
        <h3>{{ activity.name }}</h3>
        <p>{{ activity.description }}</p>
        <span class="difficulty">{{ activity.difficulty }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activities = ref([
  {
    id: 1,
    name: 'Cycling',
    icon: '🚴',
    description: 'Join local cycling groups. Build community while reducing transport emissions.',
    difficulty: 'Beginner - Advanced'
  },
  {
    id: 2,
    name: 'Running',
    icon: '🏃',
    description: 'Connect with runners. Track CO₂ saved vs. driving. Compete on leaderboard.',
    difficulty: 'Beginner - Advanced'
  },
  {
    id: 3,
    name: 'Hiking',
    icon: '⛰️',
    description: 'Explore Melbourne trails. Group hikes every weekend. Climate-positive adventure.',
    difficulty: 'Beginner - Intermediate'
  },
  {
    id: 4,
    name: 'Water Sports',
    icon: '🏊',
    description: 'Swimming, paddling, water activities. Community-based aquatic adventures.',
    difficulty: 'Intermediate - Advanced'
  }
])
</script>

<style scoped>
.activities-container {
  padding: 2rem;
}

h2 {
  text-align: center;
  color: #2c5f2d;
  margin-bottom: 2rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.activity-card:hover {
  border-color: #2c5f2d;
  box-shadow: 0 4px 12px rgba(44, 95, 45, 0.1);
}

.activity-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.activity-card h3 {
  color: #2c5f2d;
  margin: 1rem 0;
}

.activity-card p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.difficulty {
  background: #f0f8f0;
  color: #2c5f2d;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
}
</style>