<template>
  <main class="dashboard-page">
    <header class="page-head">
      <h1>My dashboard</h1>
      <p class="page-lead">
        Welcome back, <strong>{{ currentUser.name }}</strong>.
        You are signed in as a <strong>{{ ROLE_LABELS[currentUser.role] }}</strong>.
      </p>
    </header>

    <!-- BR (C.2): a member only ever sees their own entries here. -->
    <Dashboard :activities="myEntries" />

    <!-- The ratings this member has left, with a link back to change them. -->
    <section class="my-ratings">
      <h2>Groups you have rated</h2>
      <p v-if="!myRatings.length" class="empty-note">
        You have not rated any groups yet.
        <RouterLink to="/activities">Rate an activity group</RouterLink>.
      </p>
      <ul v-else class="rating-list">
        <li v-for="rating in myRatings" :key="rating.activityId" class="rating-row">
          <span class="rating-activity">
            <span aria-hidden="true">{{ activityFor(rating.activityId).emoji }}</span>
            {{ activityFor(rating.activityId).name }}
          </span>
          <StarRating :model-value="rating.score" readonly />
          <span class="rating-average">
            Group average {{ aggregateFor(rating.activityId).average }}
            ({{ aggregateFor(rating.activityId).count }})
          </span>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import StarRating from '../components/StarRating.vue'
import { ROLE_LABELS, useAuth } from '../services/auth.js'
import { useActivityLog, entriesForUser } from '../services/activityLog.js'
import { useRatings, getAggregate } from '../services/ratings.js'
import { findActivityById } from '../data/activityGroups.js'

const { currentUser } = useAuth()
const { entries } = useActivityLog()
const { ratings } = useRatings()

const myEntries = computed(() => {
  entries.value.length
  return entriesForUser(currentUser.value?.id)
})

const myRatings = computed(() => {
  return ratings.value.filter((rating) => rating.userId === currentUser.value?.id)
})

const activityFor = (id) => findActivityById(id) || { name: 'Unknown group', emoji: '' }

const aggregateFor = (id) => getAggregate(id)
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem 3rem;
}

.page-head {
  text-align: center;
  margin-bottom: 1.5rem;
}

h1 {
  color: #2c5f2d;
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.page-lead {
  color: #6b7b6b;
  font-size: 0.92rem;
  margin: 0;
}

.my-ratings {
  margin-top: 2.5rem;
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

.my-ratings h2 {
  color: #2c5f2d;
  font-size: 1.2rem;
  margin: 0 0 1rem;
}

.empty-note {
  margin: 0;
  color: #6b7b6b;
  font-size: 0.9rem;
}

.empty-note a {
  color: #2c5f2d;
  font-weight: 600;
}

.rating-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: #f6f9f6;
  border-radius: 6px;
  padding: 0.7rem 0.9rem;
}

.rating-activity {
  font-weight: 600;
  color: #2c3e2c;
  font-size: 0.9rem;
}

.rating-average {
  font-size: 0.8rem;
  color: #6b7b6b;
}

@media (max-width: 640px) {
  h1 {
    font-size: 1.6rem;
  }
}
</style>
