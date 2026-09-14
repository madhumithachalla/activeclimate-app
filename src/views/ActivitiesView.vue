<template>
  <main class="activities-page">
    <header class="page-head">
      <h1>Activity groups</h1>
      <p class="page-lead">
        Four ways to move around Melbourne without a car. Every group is free to join, and the
        rating on each card is the average across all members who have rated it.
      </p>
      <p class="page-note">
        CO2 figures use {{ CAR_EMISSIONS_KG_PER_KM }} kg per km, the average for a new light vehicle
        sold in Australia, from the Australian Government's
        <a :href="SOURCES.greenVehicleGuide.url" target="_blank" rel="noopener noreferrer">Green
        Vehicle Guide</a>. They assume the trip replaces a car journey.
      </p>
    </header>

    <!-- BR (A.2): Responsiveness - this grid reflows from four columns to one -->
    <div class="activities-grid">
      <article v-for="group in ACTIVITY_GROUPS" :key="group.id" class="activity-card">
        <div class="card-head">
          <span class="activity-emoji" aria-hidden="true">{{ group.emoji }}</span>
          <h2>{{ group.name }}</h2>
          <p class="activity-description">{{ group.description }}</p>
        </div>

        <dl class="activity-facts">
          <div class="fact">
            <dt>Difficulty</dt>
            <dd>{{ group.difficulty }}</dd>
          </div>
          <div class="fact">
            <dt>Meets at</dt>
            <dd>{{ group.meetingPoint }}</dd>
          </div>
          <div class="fact">
            <dt>Sessions</dt>
            <dd>{{ group.weeklySessions }} per week</dd>
          </div>
          <div class="fact">
            <dt>CO2 saved</dt>
            <dd>{{ CAR_EMISSIONS_KG_PER_KM }} kg per km</dd>
          </div>
        </dl>

        <button type="button" class="join-button" @click="joinGroup(group)">
          {{ joinedGroupId === group.id ? 'Request sent' : 'Join group' }}
        </button>
        <p v-if="joinedGroupId === group.id" class="join-note" role="status">
          A coordinator will email you the next session details.
        </p>

        <!-- BR (C.3): aggregated rating plus the rating form for members -->
        <ActivityRatingPanel :activity="group" />
      </article>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ActivityRatingPanel from '../components/ActivityRatingPanel.vue'
import { ACTIVITY_GROUPS } from '../data/activityGroups.js'
import { CAR_EMISSIONS_KG_PER_KM, SOURCES } from '../data/sources.js'

const joinedGroupId = ref(null)

// Replaces the old alert() call: an inline status message is far less
// disruptive and is announced by screen readers via role="status".
const joinGroup = (group) => {
  joinedGroupId.value = group.id
  setTimeout(() => {
    if (joinedGroupId.value === group.id) joinedGroupId.value = null
  }, 4000)
}
</script>

<style scoped>
.activities-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem 3rem;
}

.page-head {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  color: var(--brand);
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.page-note {
  max-width: 660px;
  margin: 0.75rem auto 0;
  font-size: 0.8rem;
  color: var(--text-subtle);
  line-height: 1.55;
}

.page-note a {
  color: var(--brand);
}

.page-lead {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 660px;
  margin: 0 auto;
}

.activities-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.activity-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-soft);
  display: flex;
  flex-direction: column;
}

.card-head {
  text-align: center;
}

.activity-emoji {
  font-size: 2.75rem;
  display: block;
}

.activity-card h2 {
  color: var(--brand);
  font-size: 1.35rem;
  margin: 0.5rem 0 0.5rem;
}

.activity-description {
  color: var(--text-body);
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0 0 1rem;
}

.activity-facts {
  margin: 0 0 1rem;
  padding: 0.85rem;
  background: var(--surface-alt);
  border-radius: 6px;
  display: grid;
  gap: 0.5rem;
}

.fact {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.82rem;
}

.fact dt {
  color: var(--text-subtle);
  font-weight: 600;
  flex-shrink: 0;
}

.fact dd {
  margin: 0;
  color: var(--text-strong);
  text-align: right;
}

.join-button {
  background: var(--btn-bg);
  color: var(--on-brand);
  border: none;
  padding: 0.7rem 1.25rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

.join-button:hover {
  background: var(--btn-bg-hover);
}

.join-button:focus-visible {
  outline: 3px solid var(--brand-strong);
  outline-offset: 2px;
}

.join-note {
  margin: 0.5rem 0 0;
  font-size: 0.78rem;
  color: var(--brand);
  text-align: center;
}

@media (max-width: 640px) {
  h1 {
    font-size: 1.6rem;
  }

  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
