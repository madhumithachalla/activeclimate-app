<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>Create your account</h1>
      <p class="auth-intro">Join the community, log your active travel and rate the groups you join.</p>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Full name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            autocomplete="name"
            maxlength="60"
            class="form-input"
            :class="{ 'has-error': errors.name }"
            :aria-invalid="Boolean(errors.name)"
            aria-describedby="name-error"
            @blur="validateField('name')"
          />
          <span v-if="errors.name" id="name-error" class="error-text" role="alert">
            {{ errors.name }}
          </span>
        </div>

        <div class="form-group">
          <label for="email">Email address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            maxlength="254"
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
            autocomplete="new-password"
            class="form-input"
            :class="{ 'has-error': errors.password }"
            :aria-invalid="Boolean(errors.password)"
            aria-describedby="password-hint password-error"
            @blur="validateField('password')"
            @input="revalidateConfirm"
          />
          <span id="password-hint" class="hint-text">
            At least 8 characters, including an uppercase letter, a lowercase letter and a number.
          </span>
          <span v-if="errors.password" id="password-error" class="error-text" role="alert">
            {{ errors.password }}
          </span>
        </div>

        <div class="form-group">
          <label for="confirm">Confirm password</label>
          <input
            id="confirm"
            v-model="form.confirm"
            type="password"
            autocomplete="new-password"
            class="form-input"
            :class="{ 'has-error': errors.confirm }"
            :aria-invalid="Boolean(errors.confirm)"
            aria-describedby="confirm-error"
            @blur="validateField('confirm')"
          />
          <span v-if="errors.confirm" id="confirm-error" class="error-text" role="alert">
            {{ errors.confirm }}
          </span>
        </div>

        <!-- BR (C.2): the account role is chosen at registration. In a live
             system a coordinator account would be granted by the NFP, not
             self-selected; it is open here so both roles can be demonstrated. -->
        <fieldset class="form-group role-group">
          <legend>Account type</legend>
          <label v-for="option in ROLE_OPTIONS" :key="option.value" class="role-option">
            <input
              v-model="form.role"
              type="radio"
              name="role"
              :value="option.value"
            />
            <span class="role-text">
              <span class="role-name">{{ option.label }}</span>
              <span class="role-desc">{{ option.description }}</span>
            </span>
          </label>
        </fieldset>

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

        <button type="submit" class="auth-button" :disabled="submitting">
          {{ submitting ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="auth-switch">
        Already have an account?
        <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { registerUser, ROLES, ROLE_LABELS } from '../services/auth.js'
import {
  required,
  isEmail,
  isName,
  isStrongPassword,
  maxLength,
  matches,
  runRules
} from '../utils/validators.js'

const router = useRouter()

const ROLE_OPTIONS = [
  {
    value: ROLES.MEMBER,
    label: ROLE_LABELS[ROLES.MEMBER],
    description: 'Log your activities, rate groups and track the CO2 you save.'
  },
  {
    value: ROLES.ADMIN,
    label: ROLE_LABELS[ROLES.ADMIN],
    description: 'Everything a member can do, plus the admin overview and review moderation.'
  }
]

const form = ref({
  name: '',
  email: '',
  password: '',
  confirm: '',
  role: ROLES.MEMBER
})

const errors = ref({ name: '', email: '', password: '', confirm: '' })
const formError = ref('')
const submitting = ref(false)

// BR (B.1) / BR (C.4): four distinct validation types on this one form -
// pattern matching (name, email), composition strength (password),
// cross-field comparison (confirm) and a length cap.
const rulesFor = (field) => {
  const map = {
    name: [required('Name'), maxLength('Name', 60), isName],
    email: [required('Email'), isEmail],
    password: [required('Password'), isStrongPassword],
    confirm: [required('Confirmation'), matches(form.value.password, 'Passwords')]
  }
  return map[field]
}

const validateField = (field) => {
  errors.value[field] = runRules(form.value[field], rulesFor(field))
}

// Changing the password after confirming it should re-check the match.
const revalidateConfirm = () => {
  if (form.value.confirm) validateField('confirm')
}

const validateAll = () => {
  Object.keys(errors.value).forEach(validateField)
  return !Object.values(errors.value).some(Boolean)
}

const handleSubmit = async () => {
  formError.value = ''
  if (!validateAll()) return

  submitting.value = true
  const result = await registerUser({
    name: form.value.name,
    email: form.value.email,
    password: form.value.password,
    role: form.value.role
  })
  submitting.value = false

  if (!result.ok) {
    formError.value = result.error
    return
  }

  // registerUser signs the new account in, so go straight to the dashboard.
  router.push('/dashboard')
}
</script>

<style scoped>
.auth-page {
  max-width: 520px;
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

.hint-text {
  font-size: 0.75rem;
  color: var(--text-subtle);
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

.role-group {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.85rem 1rem 1rem;
  margin: 0;
}

.role-group legend {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--brand);
  padding: 0 0.35rem;
}

.role-option {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.4rem 0;
  font-weight: 400;
  cursor: pointer;
}

.role-option input {
  margin-top: 0.25rem;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.role-option input:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 2px;
}

.role-text {
  display: flex;
  flex-direction: column;
}

.role-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-strong);
}

.role-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  line-height: 1.4;
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

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem 1.15rem;
  }
}
</style>
