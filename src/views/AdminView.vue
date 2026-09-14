<template>
  <main class="admin-page">
    <header class="page-head">
      <p class="admin-tag">Coordinator only</p>
      <h1>Admin overview</h1>
      <p class="page-lead">
        Everything below is visible to <strong>{{ ROLE_LABELS[ROLES.ADMIN] }}</strong> accounts only.
        A member who navigates to /admin directly is sent to the access-denied page by the
        router guard, not merely shown a hidden link.
      </p>
    </header>

    <!-- Headline counts -->
    <section class="stat-grid" aria-label="Platform summary">
      <article class="stat-card">
        <p class="stat-value">{{ users.length }}</p>
        <p class="stat-label">Registered accounts</p>
      </article>
      <article class="stat-card">
        <p class="stat-value">{{ roleCounts[ROLES.MEMBER] || 0 }}</p>
        <p class="stat-label">Community members</p>
      </article>
      <article class="stat-card">
        <p class="stat-value">{{ roleCounts[ROLES.ADMIN] || 0 }}</p>
        <p class="stat-label">Coordinators</p>
      </article>
      <article class="stat-card">
        <p class="stat-value">{{ totals.count }}</p>
        <p class="stat-label">Activities logged</p>
      </article>
      <article class="stat-card">
        <p class="stat-value">
          {{ displayDistance(totals.totalDistance) }}<span class="unit">{{ unitLabel }}</span>
        </p>
        <p class="stat-label">Distance logged</p>
      </article>
      <article class="stat-card">
        <p class="stat-value">{{ totals.totalCo2 }}<span class="unit">kg</span></p>
        <p class="stat-label">Total CO2 saved</p>
      </article>
      <article class="stat-card">
        <p class="stat-value">
          {{ overall.count ? overall.average : '-' }}<span class="unit">/ 5</span>
        </p>
        <p class="stat-label">Average rating ({{ overall.count }})</p>
      </article>
    </section>

    <!-- BR (C.3): the aggregate broken down per group, with the distribution -->
    <section class="panel">
      <h2>Ratings by activity group</h2>
      <div class="table-scroll">
        <table>
          <caption class="sr-only">Average rating and score distribution for each activity group</caption>
          <thead>
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Average</th>
              <th scope="col">Ratings</th>
              <th scope="col">Distribution (1 to 5 stars)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="group in ACTIVITY_GROUPS" :key="group.id">
              <th scope="row" class="group-cell">
                <span aria-hidden="true">{{ group.emoji }}</span> {{ group.name }}
              </th>
              <td>
                <StarRating :model-value="aggregateFor(group.id).average" readonly />
                <span class="numeric">
                  {{ aggregateFor(group.id).count ? aggregateFor(group.id).average : '-' }}
                </span>
              </td>
              <td>{{ aggregateFor(group.id).count }}</td>
              <td>
                <div class="distribution">
                  <div v-for="score in [5, 4, 3, 2, 1]" :key="score" class="dist-row">
                    <span class="dist-label">{{ score }}</span>
                    <span class="dist-track">
                      <span
                        class="dist-fill"
                        :style="{ width: barWidth(group.id, score) }"
                      ></span>
                    </span>
                    <span class="dist-count">{{ aggregateFor(group.id).distribution[score] }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Registered accounts -->
    <section class="panel">
      <h2>Registered accounts</h2>
      <div class="table-scroll">
        <table>
          <caption class="sr-only">All registered accounts and their roles</caption>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Joined</th>
              <th scope="col">Activities</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <th scope="row">{{ user.name }}</th>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-pill" :class="`role-${user.role}`">
                  {{ ROLE_LABELS[user.role] }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>{{ activityCountFor(user.id) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="panel-note">
        Passwords are never shown here because they are never stored. Only a PBKDF2 hash and
        its per-account salt are kept, and neither leaves the auth service.
      </p>
    </section>

    <!-- Moderation: the admin-only capability that makes the role meaningful -->
    <section class="panel">
      <h2>Member reviews</h2>
      <p v-if="!writtenReviews.length" class="empty-note">No written reviews yet.</p>
      <ul v-else class="moderation-list">
        <li v-for="review in writtenReviews" :key="`${review.activityId}-${review.userId}`" class="moderation-item">
          <div class="moderation-head">
            <strong>{{ review.userName }}</strong>
            <span class="moderation-group">on {{ activityName(review.activityId) }}</span>
            <StarRating :model-value="review.score" readonly />
          </div>
          <p class="moderation-body">{{ review.comment }}</p>
          <button type="button" class="remove-button" @click="removeReview(review)">
            Remove review
          </button>
        </li>
      </ul>
      <p v-if="moderationMessage" class="moderation-message" role="status">
        {{ moderationMessage }}
      </p>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import StarRating from '../components/StarRating.vue'
import { ACTIVITY_GROUPS, findActivityById } from '../data/activityGroups.js'
import { ROLES, ROLE_LABELS, listUsers, countUsersByRole } from '../services/auth.js'
import { useActivityLog, entriesForUser, summarise, allEntries } from '../services/activityLog.js'
import { useUnits, displayDistance } from '../services/units.js'
import {
  useRatings,
  getAggregate,
  getOverallAggregate,
  deleteRating
} from '../services/ratings.js'

const { entries } = useActivityLog()
const { ratings } = useRatings()
const { unitLabel } = useUnits()

const moderationMessage = ref('')

// listUsers() reads localStorage, so it is wrapped in a computed that tracks
// the reactive sources which change when accounts or data change.
const users = computed(() => {
  entries.value.length
  ratings.value.length
  return listUsers()
})

const roleCounts = computed(() => {
  users.value.length
  return countUsersByRole()
})

const totals = computed(() => {
  entries.value.length
  return summarise(allEntries())
})

const overall = computed(() => {
  ratings.value.length
  return getOverallAggregate()
})

const aggregateFor = (activityId) => {
  ratings.value.length
  return getAggregate(activityId)
}

// Bar width as a share of that group's highest single score count, so a group
// with few ratings still shows a readable shape.
const barWidth = (activityId, score) => {
  const { distribution } = aggregateFor(activityId)
  const max = Math.max(...Object.values(distribution), 1)
  return `${(distribution[score] / max) * 100}%`
}

const activityCountFor = (userId) => {
  entries.value.length
  return entriesForUser(userId).length
}

const activityName = (activityId) => {
  const group = findActivityById(activityId)
  return group ? group.name : 'Unknown group'
}

const writtenReviews = computed(() => {
  return ratings.value.filter((rating) => rating.comment)
})

const removeReview = (review) => {
  const result = deleteRating(review.activityId, review.userId)
  moderationMessage.value = result.ok
    ? `Review by ${review.userName} removed.`
    : result.error
  setTimeout(() => { moderationMessage.value = '' }, 3000)
}

const formatDate = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem 3rem;
}

.page-head {
  margin-bottom: 2rem;
}

.admin-tag {
  display: inline-block;
  margin: 0 0 0.5rem;
  padding: 0.25rem 0.7rem;
  background: var(--btn-bg);
  color: var(--on-brand);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

h1 {
  color: var(--brand);
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.page-lead {
  color: var(--text-muted);
  font-size: 0.92rem;
  line-height: 1.6;
  margin: 0;
  max-width: 720px;
}

.stat-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface);
  border-radius: 8px;
  padding: 1.15rem 1rem;
  text-align: center;
  box-shadow: 0 1px 4px var(--shadow-soft);
}

.stat-value {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--brand);
  line-height: 1.1;
}

.unit {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-left: 0.15rem;
}

.stat-label {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.panel {
  background: var(--surface);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.75rem;
  box-shadow: 0 2px 8px var(--shadow-soft);
}

.panel h2 {
  color: var(--brand);
  font-size: 1.2rem;
  margin: 0 0 1rem;
}

/* Tables scroll horizontally on narrow screens rather than breaking layout. */
.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  min-width: 540px;
}

th,
td {
  text-align: left;
  padding: 0.6rem 0.7rem;
  border-bottom: 1px solid var(--border-soft);
  vertical-align: middle;
}

thead th {
  background: var(--surface-alt);
  color: var(--brand);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

tbody th {
  font-weight: 600;
  color: var(--text-strong);
}

.group-cell {
  white-space: nowrap;
}

.numeric {
  margin-left: 0.4rem;
  font-weight: 600;
  color: var(--brand);
}

.distribution {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 180px;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
}

.dist-label {
  width: 0.75rem;
  color: var(--text-subtle);
}

.dist-track {
  flex: 1;
  height: 7px;
  background: var(--border-soft);
  border-radius: 4px;
  overflow: hidden;
}

.dist-fill {
  display: block;
  height: 100%;
  background: var(--brand-accent);
}

.dist-count {
  width: 1rem;
  text-align: right;
  color: var(--text-muted);
}

.role-pill {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
}

.role-member {
  background: var(--pill-bg);
  color: var(--brand);
}

.role-admin {
  background: var(--btn-bg);
  color: var(--on-brand);
}

.panel-note {
  margin: 1rem 0 0;
  font-size: 0.8rem;
  color: var(--text-subtle);
  line-height: 1.55;
}

.empty-note {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.moderation-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.moderation-item {
  background: var(--surface-alt);
  border-radius: 6px;
  padding: 0.8rem 0.9rem;
}

.moderation-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: var(--text-strong);
}

.moderation-group {
  color: var(--text-muted);
}

.moderation-body {
  margin: 0.4rem 0 0.6rem;
  font-size: 0.85rem;
  color: var(--text-body);
  line-height: 1.5;
}

.remove-button {
  background: var(--surface);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 0.35rem 0.8rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.remove-button:hover {
  background: var(--danger);
  color: var(--on-brand);
}

.remove-button:focus-visible {
  outline: 3px solid var(--danger);
  outline-offset: 2px;
}

.moderation-message {
  margin: 0.85rem 0 0;
  font-size: 0.85rem;
  color: var(--brand);
  font-weight: 600;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  h1 {
    font-size: 1.6rem;
  }

  .panel {
    padding: 1.15rem;
  }
}
</style>
