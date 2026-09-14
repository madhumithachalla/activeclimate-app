<template>
  <main class="message-page">
    <div class="message-card">
      <p class="status-code" aria-hidden="true">404</p>
      <h1>We could not find that page</h1>
      <p class="message-body">
        The link may be out of date. Try the activity groups, or head back to the home page.
      </p>
      <div class="actions">
        <RouterLink to="/" class="primary-action">Back to home</RouterLink>
        <RouterLink to="/activities" class="secondary-action">Activity groups</RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.message-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 4rem 1rem;
  text-align: center;
}

.message-card {
  background: white;
  border-radius: 10px;
  padding: 2.5rem 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.status-code {
  margin: 0;
  font-size: 3.5rem;
  font-weight: 800;
  color: #d8e3d8;
  line-height: 1;
}

h1 {
  color: #2c5f2d;
  font-size: 1.5rem;
  margin: 0.5rem 0 0.75rem;
}

.message-body {
  color: #6b7b6b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-action,
.secondary-action {
  text-decoration: none;
  padding: 0.65rem 1.25rem;
  border-radius: 5px;
  font-size: 0.9rem;
  font-weight: 600;
}

.primary-action {
  background: #2c5f2d;
  color: white;
}

.primary-action:hover {
  background: #1f4620;
}

.secondary-action {
  background: #eef3ee;
  color: #2c5f2d;
}

.secondary-action:hover {
  background: #dfe9df;
}

.primary-action:focus-visible,
.secondary-action:focus-visible {
  outline: 3px solid #2c5f2d;
  outline-offset: 2px;
}
</style>
