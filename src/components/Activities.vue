<template>
  <div class="activities-container">
    <h2 class="activities-title">Choose Your Activity</h2>
    
    <!-- Activities Grid - RESPONSIVE -->
    <div class="activities-grid">
      <div 
        v-for="activity in activities" 
        :key="activity.id"
        class="activity-card"
      >
        <div class="activity-icon">{{ activity.icon }}</div>
        <h3 class="activity-name">{{ activity.name }}</h3>
        <p class="activity-description">{{ activity.description }}</p>
        <p class="activity-difficulty">{{ activity.difficulty }}</p>
        <button 
          class="join-button"
          @click="joinActivity(activity.name)"
        >
          Join Group
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// BR (B.2): Dynamic Data Structure - In-memory array (CLIENT-SIDE ONLY)
const activities = ref([
  {
    id: 1,
    name: 'Cycling',
    icon: '🚴',
    description: 'Join local cycling groups. Build community while reducing transport emissions.',
    difficulty: 'Beginner - Advanced',
    co2SavingPerKm: 0.2
  },
  {
    id: 2,
    name: 'Running',
    icon: '🏃',
    description: 'Connect with runners. Track CO2 saved vs. driving. Compete on leaderboard.',
    difficulty: 'Beginner - Advanced',
    co2SavingPerKm: 0.15
  },
  {
    id: 3,
    name: 'Hiking',
    icon: '🏔️',
    description: 'Explore Melbourne trails. Group hikes every weekend. Climate-positive adventure.',
    difficulty: 'Beginner - Intermediate',
    co2SavingPerKm: 0.25
  },
  {
    id: 4,
    name: 'Water Sports',
    icon: '🏊',
    description: 'Swimming, paddling, water activities. Community-based aquatic adventures.',
    difficulty: 'Intermediate - Advanced',
    co2SavingPerKm: 0.18
  }
])

const joinActivity = (activityName) => {
  alert(`You've joined ${activityName}! Check your profile for next steps.`)
}
</script>

<style scoped>
.activities-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.activities-title {
  text-align: center;
  font-size: 2rem;
  color: #2C5F2D;
  margin-bottom: 2rem;
  font-weight: bold;
}

/* RESPONSIVE GRID - BR (A.2): Responsiveness */
.activities-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Mobile: 1 column */
@media (max-width: 640px) {
  .activities-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.5rem;
  }
  
  .activities-title {
    font-size: 1.5rem;
  }
}

/* Tablet: 2 columns */
@media (min-width: 641px) and (max-width: 1024px) {
  .activities-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 4 columns */
@media (min-width: 1025px) {
  .activities-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.activity-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
}

.activity-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.activity-name {
  font-size: 1.5rem;
  color: #2C5F2D;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.activity-description {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.activity-difficulty {
  font-size: 0.85rem;
  color: #2C5F2D;
  background: #f0f5f0;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-weight: 600;
}

.join-button {
  background-color: #2C5F2D;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
  width: 100%;
}

.join-button:hover {
  background-color: #1f4620;
}
</style>