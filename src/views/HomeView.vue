<template>
  <main>
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <h1>Melbourne moves. The climate benefits.</h1>
        <p class="hero-lead">
          ActiveClimate connects Melburnians to local sport and active-travel groups, then
          turns every walked, ridden and run kilometre into a measured cut in transport emissions.
        </p>
        <div class="hero-actions">
          <RouterLink v-if="!isAuthenticated" to="/register" class="cta-primary">
            Join free
          </RouterLink>
          <RouterLink v-else to="/log" class="cta-primary">Log an activity</RouterLink>
          <RouterLink to="/activities" class="cta-secondary">Browse activity groups</RouterLink>
        </div>
      </div>
    </section>

    <!-- BR (B.2): headline figures derived from stored data, not hard-coded -->
    <section class="impact" aria-label="Community impact so far">
      <div class="impact-grid">
        <article class="impact-card">
          <p class="impact-value">{{ community.count }}</p>
          <p class="impact-label">Activities logged</p>
        </article>
        <article class="impact-card">
          <p class="impact-value">
            {{ displayDistance(community.totalDistance) }}<span class="unit">{{ unitLabel }}</span>
          </p>
          <p class="impact-label">Distance travelled actively</p>
        </article>
        <article class="impact-card">
          <p class="impact-value">{{ community.totalCo2 }}<span class="unit">kg</span></p>
          <p class="impact-label">CO2 kept out of the air</p>
        </article>
        <article class="impact-card">
          <p class="impact-value">
            {{ overall.count ? overall.average : '-' }}<span class="unit">/ 5</span>
          </p>
          <p class="impact-label">
            Average group rating<template v-if="overall.count"> ({{ overall.count }})</template>
          </p>
        </article>
      </div>
    </section>

    <!-- What the NFP does -->
    <section class="content-section">
      <h2>What we do</h2>
      <div class="pillar-grid">
        <article v-for="pillar in PILLARS" :key="pillar.title" class="pillar-card">
          <h3>{{ pillar.title }}</h3>
          <p>{{ pillar.body }}</p>
        </article>
      </div>
    </section>

    <!-- Activity preview with live aggregate ratings -->
    <section class="content-section alt">
      <h2>Popular activity groups</h2>
      <p class="section-lead">
        Ratings come from members who have actually joined a session.
      </p>
      <div class="preview-grid">
        <article v-for="group in ACTIVITY_GROUPS" :key="group.id" class="preview-card">
          <span class="preview-emoji" aria-hidden="true">{{ group.emoji }}</span>
          <h3>{{ group.name }}</h3>
          <p class="preview-meta">{{ group.weeklySessions }} sessions a week</p>
          <StarRating :model-value="ratingFor(group.id).average" readonly />
          <p class="preview-count">{{ ratingSummaryText(group.id) }}</p>
        </article>
      </div>
      <RouterLink to="/activities" class="cta-secondary centred">
        See all groups and rate them
      </RouterLink>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import StarRating from '../components/StarRating.vue'
import { ACTIVITY_GROUPS } from '../data/activityGroups.js'
import { useAuth } from '../services/auth.js'
import { useActivityLog, summarise } from '../services/activityLog.js'
import { getAggregate, getOverallAggregate, useRatings } from '../services/ratings.js'
import { useUnits, displayDistance } from '../services/units.js'

const { isAuthenticated } = useAuth()
const { entries } = useActivityLog()
const { ratings } = useRatings()
const { unitLabel } = useUnits()

const PILLARS = [
  {
    title: 'Community sport that counts',
    body: 'Free, welcoming groups across Melbourne for cycling, running, hiking and water sports - no membership fee and no fitness prerequisite.'
  },
  {
    title: 'Active travel, measured',
    body: 'Every logged trip is converted into the CO2 it saved against the same journey by car, so the benefit is visible rather than assumed.'
  },
  {
    title: 'Built for everyone',
    body: 'We work with underrepresented communities across the north and west, providing loan bikes, bilingual ride leaders and accessible session times.'
  }
]

// Community-wide totals, recomputed as members log activities.
const community = computed(() => summarise(entries.value))

const overall = computed(() => {
  ratings.value.length
  return getOverallAggregate()
})

const ratingFor = (activityId) => {
  ratings.value.length
  return getAggregate(activityId)
}

const ratingSummaryText = (activityId) => {
  const aggregate = ratingFor(activityId)
  if (!aggregate.count) return 'Not yet rated'
  return `${aggregate.average} from ${aggregate.count} ratings`
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--hero-from) 0%, var(--hero-to) 100%);
  color: var(--on-brand);
  padding: 3.5rem 1rem;
}

.hero-inner {
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
}

.hero h1 {
  font-size: 2.4rem;
  margin: 0 0 1rem;
  line-height: 1.2;
}

.hero-lead {
  font-size: 1.05rem;
  line-height: 1.65;
  opacity: 0.95;
  margin: 0 auto 1.75rem;
  max-width: 640px;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary,
.cta-secondary {
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 700;
  display: inline-block;
}

.cta-primary {
  background: var(--on-brand);
  color: var(--hero-from);
}

.cta-primary:hover {
  background: var(--surface-hover);
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.16);
  color: var(--on-brand);
  border: 1px solid rgba(255, 255, 255, 0.55);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.28);
}

.cta-primary:focus-visible,
.cta-secondary:focus-visible {
  outline: 3px solid var(--focus-ring-on-brand);
  outline-offset: 3px;
}

.impact {
  background: var(--surface-alt);
  padding: 2rem 1rem;
}

.impact-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.impact-card {
  background: var(--surface);
  border-radius: 8px;
  padding: 1.25rem 1rem;
  text-align: center;
  box-shadow: 0 1px 4px var(--shadow-soft);
}

.impact-value {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: var(--brand);
  line-height: 1.1;
}

.unit {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-left: 0.15rem;
}

.impact-label {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.content-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.content-section.alt {
  max-width: none;
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.content-section h2 {
  color: var(--brand);
  font-size: 1.75rem;
  text-align: center;
  margin: 0 0 0.5rem;
}

.section-lead {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.92rem;
  margin: 0 auto 2rem;
}

.pillar-grid,
.preview-grid {
  max-width: 1100px;
  margin: 1.75rem auto 0;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.pillar-card {
  background: var(--surface);
  border-left: 4px solid var(--brand-accent);
  border-radius: 6px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px var(--shadow-soft);
}

.pillar-card h3 {
  color: var(--brand);
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
}

.pillar-card p {
  margin: 0;
  color: var(--text-body);
  font-size: 0.9rem;
  line-height: 1.6;
}

.preview-card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  text-align: center;
}

.preview-emoji {
  font-size: 2.2rem;
  display: block;
}

.preview-card h3 {
  color: var(--brand);
  font-size: 1.1rem;
  margin: 0.5rem 0 0.15rem;
}

.preview-meta {
  margin: 0 0 0.5rem;
  font-size: 0.78rem;
  color: var(--text-subtle);
}

.preview-count {
  margin: 0.35rem 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.centred {
  display: block;
  width: fit-content;
  margin: 2rem auto 0;
  background: var(--btn-bg);
  border-color: var(--brand);
}

.centred:hover {
  background: var(--btn-bg-hover);
}

@media (max-width: 640px) {
  .hero h1 {
    font-size: 1.75rem;
  }

  .hero-lead {
    font-size: 0.95rem;
  }

  .hero-actions a {
    width: 100%;
    text-align: center;
  }
}
</style>
