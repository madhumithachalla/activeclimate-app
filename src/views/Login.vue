<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Log in</h2>
      <p v-if="redirectMessage" class="auth-notice">{{ redirectMessage }}</p>

      <form @submit.prevent="handleSubmit">
        <label for="login-email">Email</label>
        <input id="login-email" v-model="email" type="email" required autocomplete="email" />

        <label for="login-password">Password</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />

        <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>

        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Logging in…' : 'Log In' }}
        </button>
      </form>

      <p class="auth-switch">
        Don't have an account?
        <router-link to="/signup">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const { logIn, friendlyError } = useAuth()
const router = useRouter()
const route = useRoute()

const redirectMessage = route.query.redirect
  ? 'Log in to access that page.'
  : ''

async function handleSubmit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await logIn(email.value, password.value)
    router.push(route.query.redirect || '/')
  } catch (err) {
    errorMessage.value = friendlyError(err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.auth-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.auth-card h2 {
  color: #2c5f2d;
  margin: 0 0 0.25rem 0;
}

.auth-notice {
  background: #eef6ff;
  color: #1c5a8c;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

form {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 0.85rem;
  font-weight: bold;
  color: #333;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
}

input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.auth-error {
  color: #c0392b;
  background: #fdecea;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

button {
  margin-top: 1.5rem;
  padding: 0.7rem;
  background: #2c5f2d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: default;
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #555;
}
</style>
