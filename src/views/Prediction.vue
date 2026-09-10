<template>
  <div class="prediction-page">
    <h2>Climate Impact Prediction</h2>
    <p class="prediction-intro">
      Signed in as <strong>{{ currentUser?.email }}</strong>. This area is restricted to logged-in
      users (E04-US03-AC01).
    </p>

    <div class="prediction-placeholder">
      <p>
        The prediction model integration is not yet built. This page establishes the login gate;
        wire the actual prediction request/response in here once the API is defined.
      </p>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'

const { currentUser } = useAuth()
</script>

<style scoped>
.prediction-page {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.prediction-page h2 {
  color: #2c5f2d;
}

.prediction-intro {
  color: #444;
}

.prediction-placeholder {
  background: #f0f8f0;
  border: 1px dashed #2c5f2d;
  border-radius: 8px;
  padding: 1.5rem;
  color: #555;
}
</style>
