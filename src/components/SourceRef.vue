<template>
  <a
    class="source-ref"
    :href="source.url"
    target="_blank"
    rel="noopener noreferrer"
    :title="`${source.publisher} - ${source.title}`"
  >
    <span class="sr-only">Source: {{ source.publisher }}, {{ source.title }}. Opens in a new tab.</span>
    <span aria-hidden="true">[source]</span>
  </a>
</template>

<script setup>
defineProps({
  source: { type: Object, required: true }
})
</script>

<style scoped>
.source-ref {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--brand);
  text-decoration: none;
  margin-left: 0.15rem;
  white-space: nowrap;
  vertical-align: baseline;
}

.source-ref:hover {
  text-decoration: underline;
}

.source-ref:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 3px;
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
</style>
