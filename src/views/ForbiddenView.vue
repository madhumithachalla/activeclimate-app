<template>
  <main class="message-page">
    <div class="message-card">
      <p class="status-code" aria-hidden="true">403</p>
      <h1>You do not have access to that page</h1>
      <p class="message-body">
        This page is limited to
        <strong>{{ ROLE_LABELS[ROLES.ADMIN] }}</strong> accounts.
        <template v-if="currentUser">
          You are signed in as
          <strong>{{ currentUser.name }}</strong>
          ({{ ROLE_LABELS[currentUser.role] }}).
        </template>
      </p>
      <div class="actions">
        <RouterLink to="/" class="primary-action">Back to home</RouterLink>
        <RouterLink v-if="currentUser" to="/dashboard" class="secondary-action">My dashboard</RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { ROLES, ROLE_LABELS, useAuth } from '../services/auth.js'

const { currentUser } = useAuth()
</script>

<style scoped>
.message-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 4rem 1rem;
  text-align: center;
}

.message-card {
  background: var(--surface);
  border-radius: 10px;
  padding: 2.5rem 2rem;
  box-shadow: 0 2px 12px var(--shadow-card);
}

.status-code {
  margin: 0;
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--ghost);
  line-height: 1;
}

h1 {
  color: var(--brand);
  font-size: 1.5rem;
  margin: 0.5rem 0 0.75rem;
}

.message-body {
  color: var(--text-muted);
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
  background: var(--btn-bg);
  color: var(--on-brand);
}

.primary-action:hover {
  background: var(--btn-bg-hover);
}

.secondary-action {
  background: var(--surface-alt);
  color: var(--brand);
}

.secondary-action:hover {
  background: var(--surface-hover);
}

.primary-action:focus-visible,
.secondary-action:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 2px;
}
</style>
