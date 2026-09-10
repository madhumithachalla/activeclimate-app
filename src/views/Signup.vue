<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Create your account</h2>
      <p class="auth-subtitle">Sign up to unlock predictions and reports.</p>

      <form @submit.prevent="handleSubmit">
        <label for="signup-email">Email</label>
        <input id="signup-email" v-model="email" type="email" required autocomplete="email" />

        <label for="signup-password">Password</label>
        <input
          id="signup-password"
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
        />

        <label for="signup-confirm">Confirm password</label>
        <input
          id="signup-confirm"
          v-model="confirmPassword"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
        />

        <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>

        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Creating account…' : 'Sign Up' }}
        </button>
      </form>

      <p class="auth-switch">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const submitting = ref(false)

const { signUp, friendlyError } = useAuth()
const router = useRouter()

async function handleSubmit() {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  submitting.value = true
  try {
    await signUp(email.value, password.value)
    router.push('/')
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

.auth-subtitle {
  color: #666;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
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
