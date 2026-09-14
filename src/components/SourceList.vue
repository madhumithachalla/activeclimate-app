<template>
  <section class="source-panel">
    <h2>{{ heading }}</h2>
    <ol class="source-items">
      <li v-for="source in sources" :key="source.id">
        <a :href="source.url" target="_blank" rel="noopener noreferrer">
          {{ source.publisher }} &mdash; {{ source.title }}
        </a>
        <span class="source-note">{{ source.note }}</span>
      </li>
    </ol>
  </section>
</template>

<script setup>
defineProps({
  heading: { type: String, default: 'References' },
  sources: { type: Array, required: true }
})
</script>

<style scoped>
.source-panel {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.35rem 1.5rem;
}

.source-panel h2 {
  color: var(--brand);
  font-size: 1rem;
  margin: 0 0 0.85rem;
}

.source-items {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.source-items li {
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--text-body);
}

.source-items a {
  color: var(--brand);
  font-weight: 600;
}

.source-note {
  display: block;
  font-size: 0.78rem;
  color: var(--text-subtle);
  margin-top: 0.15rem;
}

@media (max-width: 640px) {
  .source-panel {
    padding: 1.15rem;
  }
}
</style>
