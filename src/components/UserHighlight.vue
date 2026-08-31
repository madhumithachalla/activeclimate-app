<template>
  <div class="user-highlight-section">
    <h2>Activity Author Highlight</h2>
    <div :class="{ 'author-highlight': isCurrentUser }">
      <div class="author-info">
        <p><strong>Activity Organizer:</strong> {{ authorName }}</p>
        <p><strong>Role:</strong> {{ userRole }}</p>
        <p v-if="isCurrentUser" class="highlight-badge">✓ This is your activity</p>
      </div>
      <div class="author-details">
        <p><strong>Activities Created:</strong> {{ activitiesCreated }}</p>
        <p><strong>Members in Groups:</strong> {{ memberCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const authorName = ref('Madhumitha Challa')
const userRole = ref('App Developer')
const isCurrentUser = ref(true)
const activitiesCreated = ref(4)
const memberCount = ref(287)
</script>

<style scoped>
.user-highlight-section {
  padding: 2rem;
  background: white;
  margin: 2rem 0;
}

.user-highlight-section h2 {
  color: #2c5f2d;
  text-align: center;
  margin-bottom: 1.5rem;
}

.author-highlight {
  background: #f0f8f0;
  border: 2px solid #2c5f2d;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.author-highlight.author-highlight {
  background: #fff9e6;
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.author-info {
  margin-bottom: 1rem;
}

.author-info p {
  margin: 0.5rem 0;
  color: #333;
}

.highlight-badge {
  background: #2c5f2d;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-block;
  font-weight: bold;
  margin-top: 0.5rem;
}

.author-details {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

.author-details p {
  margin: 0.5rem 0;
  color: #555;
}
</style>