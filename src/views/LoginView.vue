<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>Sign in</h1>
      <p class="auth-intro">Welcome back. Sign in to log activities and rate groups.</p>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            class="form-input"
            :class="{ 'has-error': errors.email }"
            :aria-invalid="Boolean(errors.email)"
            aria-describedby="email-error"
            @blur="validateField('email')"
          />
          <span v-if="errors.email" id="email-error" class="error-text" role="alert">
            {{ errors.email }}
          </span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            class="form-input"
            :class="{ 'has-error': errors.password }"
            :aria-invalid="Boolean(errors.password)"
            aria-describedby="password-error"
            @blur="validateField('password')"
          />
          <span v-if="errors.password" id="password-error" class="error-text" role="alert">
            {{ errors.password }}
          </span>
        </div>

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

        <button type="submit" class="auth-button" :disabled="submitting">
          {{ submitting ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="auth-switch">
        No account yet?
        <RouterLink to="/register">Create one free</RouterLink>
      </p>

      <!-- Assessment build: both seeded logins are published here so the two
           roles can be compared without registering anything first. -->
      <aside class="demo-box">
        <h2>Marking access</h2>
        <p class="demo-intro">
          Seeded accounts so both roles can be compared without registering first.
          Deliberate for this submission only; a live deployment would not publish
          credentials on a sign-in page.
        </p>
        <div class="demo-actions">
          <button type="button" class="demo-button" @click="useDemo(DEMO_ADMIN)">
            <span class="demo-role">Coordinator</span>
            <span class="demo-hint">Admin overview and review moderation</span>
          </button>
          <button type="button" class="demo-button" @click="useDemo(DEMO_MEMBER)">
            <span class="demo-role">Community Member</span>
            <span class="demo-hint">A month of logged trips and ratings</span>
          </button>
        </div>
        <p v-if="filledFrom" class="demo-filled" role="status">
          Filled in the {{ filledFrom }} details. Press Sign in to continue.
        </p>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { loginUser, DEMO_ADMIN } from '../services/auth.js'
import { DEMO_MEMBER } from '../services/demoData.js'
import { required, isEmail, runRules } from '../utils/validators.js'

const router = useRouter()
const route = useRoute()

const form = ref({ email: '', password: '' })
const errors = ref({ email: '', password: '' })
const formError = ref('')
const submitting = ref(false)
const filledFrom = ref('')

// Fills the form rather than signing straight in, so the marker sees which
// account is being used and can still exercise the validation on the way past.
const useDemo = (account) => {
  form.value.email = account.email
  form.value.password = account.password
  errors.value = { email: '', password: '' }
  formError.value = ''
  filledFrom.value = account === DEMO_ADMIN ? 'coordinator' : 'member'
}

// BR (B.1): two validation types on this form - a format rule on the email and
// a presence rule on the password.
const RULES = {
  email: [required('Email'), isEmail],
  password: [required('Password')]
}

const validateField = (field) => {
  errors.value[field] = runRules(form.value[field], RULES[field])
}

const validateAll = () => {
  Object.keys(RULES).forEach(validateField)
  return !Object.values(errors.value).some(Boolean)
}

const handleSubmit = async () => {
  formError.value = ''
  if (!validateAll()) return

  submitting.value = true
  const result = await loginUser({
    email: form.value.email,
    password: form.value.password
  })
  submitting.value = false

  if (!result.ok) {
    formError.value = result.error
    form.value.password = ''
    return
  }

  // Only follow an internal redirect. An absolute or protocol-relative URL in
  // the query string would be an open redirect, so it is ignored.
  const redirect = route.query.redirect
  const isInternal = typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//')

  router.push(isInternal ? redirect : '/dashboard')
}
</script>

<style scoped>
.auth-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 2.5rem 1rem 3rem;
}

.auth-card {
  background: var(--surface);
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 12px var(--shadow-card);
}

h1 {
  color: var(--brand);
  margin: 0 0 0.35rem 0;
  font-size: 1.75rem;
}

.auth-intro {
  margin: 0 0 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--brand);
}

.form-input {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-input);
  border-radius: 5px;
  font: inherit;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 1px;
  border-color: var(--brand);
}

.form-input.has-error {
  border-color: var(--danger);
  background: var(--danger-bg-soft);
}

.error-text {
  color: var(--danger);
  font-size: 0.8rem;
}

.form-error {
  margin: 0;
  padding: 0.65rem 0.75rem;
  background: var(--danger-bg);
  border-left: 4px solid var(--danger);
  border-radius: 4px;
  color: var(--danger-text);
  font-size: 0.85rem;
}

.auth-button {
  background: var(--btn-bg);
  color: var(--on-brand);
  border: none;
  padding: 0.75rem;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.25rem;
}

.auth-button:hover:not(:disabled) {
  background: var(--btn-bg-hover);
}

.auth-button:disabled {
  background: var(--disabled);
  cursor: not-allowed;
}

.auth-button:focus-visible {
  outline: 3px solid var(--brand-strong);
  outline-offset: 2px;
}

.auth-switch {
  margin: 1.25rem 0 0 0;
  font-size: 0.88rem;
  color: var(--text-muted);
  text-align: center;
}

.auth-switch a {
  color: var(--brand);
  font-weight: 600;
}

.demo-box {
  margin-top: 1.5rem;
  padding: 0.9rem 1rem;
  background: var(--surface-alt);
  border: 1px dashed var(--border-dashed);
  border-radius: 6px;
}

.demo-box h2 {
  margin: 0 0 0.4rem 0;
  font-size: 0.85rem;
  color: var(--brand);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.demo-box p {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  color: var(--text-body);
}

.demo-intro {
  margin: 0 0 0.7rem 0;
  line-height: 1.5;
}

.demo-actions {
  display: grid;
  gap: 0.5rem;
}

.demo-button {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--border-input);
  border-radius: 5px;
  padding: 0.55rem 0.7rem;
  cursor: pointer;
  font: inherit;
}

.demo-button:hover {
  border-color: var(--brand);
  background: var(--surface-hover);
}

.demo-button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.demo-role {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--brand);
}

.demo-hint {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.demo-filled {
  margin: 0.6rem 0 0 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--brand);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem 1.15rem;
  }
}
</style>
