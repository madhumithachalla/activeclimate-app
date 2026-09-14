<template>
  <main class="log-page">
    <header class="page-head">
      <h1>Log an activity</h1>
      <p class="page-lead">
        Signed in as <strong>{{ currentUser.name }}</strong>.
        Entries are saved to your account only.
      </p>
    </header>

    <ActivityForm />
  </main>
</template>

<script setup>
import ActivityForm from '../components/ActivityForm.vue'
import { useAuth } from '../services/auth.js'

const { currentUser } = useAuth()
</script>

<style scoped>
.log-page {
  max-width: 900px;
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

.page-lead {
  color: var(--text-muted);
  font-size: 0.92rem;
  margin: 0;
}

@media (max-width: 640px) {
  h1 {
    font-size: 1.6rem;
  }
}
</style>
