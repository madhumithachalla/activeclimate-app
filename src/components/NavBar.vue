<template>
  <header class="app-header">
    <div class="header-bar">
      <RouterLink to="/" class="brand">
        <span class="brand-mark" aria-hidden="true">🌍</span>
        <span class="brand-text">
          <span class="brand-name">ActiveClimate Melbourne</span>
          <span class="brand-tagline">Sport &amp; Travel for Climate Action</span>
        </span>
      </RouterLink>

      <button
        type="button"
        class="nav-toggle"
        :aria-expanded="menuOpen"
        aria-controls="primary-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? 'Close menu' : 'Open menu' }}</span>
        <span aria-hidden="true">{{ menuOpen ? '✕' : '☰' }}</span>
      </button>

      <nav
        id="primary-nav"
        class="primary-nav"
        :class="{ 'is-open': menuOpen }"
        aria-label="Primary"
      >
        <!-- BR (C.2): the links shown depend on the signed-in user's role.
             The router guard enforces the same rules, so hiding a link here is
             convenience rather than the actual protection. -->
        <RouterLink
          v-for="link in visibleLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </RouterLink>

        <button
          type="button"
          class="theme-toggle"
          :title="`Distances shown in ${unit}. Click to switch.`"
          @click="toggleUnit"
        >
          <span aria-hidden="true">&#8646;</span>
          <span class="theme-text">{{ unitLabel }}</span>
          <span class="sr-only">Distance unit {{ unit }}. Activate to switch.</span>
        </button>

        <!-- Light / dark switch. Cycles Light -> Dark -> System; the label and
             the title say which mode is active so the state is not conveyed by
             the icon alone. -->
        <button
          type="button"
          class="theme-toggle"
          :title="`Theme: ${themeLabel}. Click to switch.`"
          @click="cycleTheme"
        >
          <span aria-hidden="true">{{ themeIcon }}</span>
          <span class="theme-text">{{ themeLabel }}</span>
          <span class="sr-only">
            Current theme {{ themeLabel }}{{ preference === THEMES.SYSTEM ? ` (currently ${resolvedTheme})` : '' }}.
            Activate to change theme.
          </span>
        </button>

        <div v-if="isAuthenticated" class="account-block">
          <span class="account-badge">
            <span class="account-name">{{ currentUser.name }}</span>
            <span class="account-role" :class="`role-${currentUser.role}`">
              {{ ROLE_LABELS[currentUser.role] }}
            </span>
          </span>
          <button type="button" class="sign-out" @click="handleSignOut">Sign out</button>
        </div>

        <div v-else class="account-block">
          <RouterLink to="/login" class="nav-link" @click="menuOpen = false">Sign in</RouterLink>
          <RouterLink to="/register" class="nav-cta" @click="menuOpen = false">Join free</RouterLink>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ROLES, ROLE_LABELS, useAuth, logout } from '../services/auth.js'
import { THEMES, THEME_OPTIONS, useTheme, cycleTheme } from '../services/theme.js'
import { useUnits, toggleUnit } from '../services/units.js'

const router = useRouter()
const route = useRoute()
const { currentUser, isAuthenticated } = useAuth()
const { preference, resolvedTheme } = useTheme()
const { unit, unitLabel } = useUnits()

const currentThemeOption = computed(() => {
  return THEME_OPTIONS.find((option) => option.value === preference.value) || THEME_OPTIONS[0]
})

const themeLabel = computed(() => currentThemeOption.value.label)
const themeIcon = computed(() => currentThemeOption.value.icon)

const menuOpen = ref(false)

// Close the mobile menu whenever the route changes.
watch(() => route.fullPath, () => { menuOpen.value = false })

const ALL_LINKS = [
  { to: '/', label: 'Home', roles: null },
  { to: '/activities', label: 'Activity Groups', roles: null },
  { to: '/log', label: 'Log Activity', roles: [ROLES.MEMBER, ROLES.ADMIN] },
  { to: '/dashboard', label: 'My Dashboard', roles: [ROLES.MEMBER, ROLES.ADMIN] },
  { to: '/admin', label: 'Admin', roles: [ROLES.ADMIN] }
]

const visibleLinks = computed(() => {
  return ALL_LINKS.filter((link) => {
    if (!link.roles) return true
    return currentUser.value ? link.roles.includes(currentUser.value.role) : false
  })
})

const handleSignOut = () => {
  logout()
  menuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, var(--header-from) 0%, var(--header-to) 100%);
  color: var(--on-brand);
}

.header-bar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--on-brand);
  text-decoration: none;
}

.brand-mark {
  font-size: 1.9rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}

.brand-tagline {
  font-size: 0.75rem;
  opacity: 0.9;
}

.nav-toggle {
  display: none;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--on-brand);
  font-size: 1.15rem;
  border-radius: 4px;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
}

.primary-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.nav-link {
  color: var(--on-brand);
  text-decoration: none;
  padding: 0.45rem 0.7rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* vue-router adds this class to the link matching the current route. */
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.26);
  font-weight: 700;
}

.nav-cta {
  background: var(--on-brand);
  color: var(--header-from);
  text-decoration: none;
  padding: 0.45rem 0.9rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 700;
}

.nav-cta:hover {
  background: var(--surface-hover);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: var(--on-brand);
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 0.35rem;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.28);
}

.account-block {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-left: 0.5rem;
  padding-left: 0.75rem;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.account-badge {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.account-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.account-role {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.92;
}

.role-admin::before {
  content: '★ ';
}

.sign-out {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: var(--on-brand);
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.sign-out:hover {
  background: rgba(255, 255, 255, 0.28);
}

/* Keyboard focus must stay visible against the green header. */
.nav-link:focus-visible,
.nav-cta:focus-visible,
.sign-out:focus-visible,
.nav-toggle:focus-visible,
.theme-toggle:focus-visible,
.brand:focus-visible {
  outline: 3px solid var(--focus-ring-on-brand);
  outline-offset: 2px;
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

/* BR (A.2): Responsiveness - collapse to a toggle menu on small screens. */
@media (max-width: 820px) {
  .nav-toggle {
    display: block;
  }

  .primary-nav {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.2rem;
    padding-top: 0.75rem;
  }

  .primary-nav.is-open {
    display: flex;
  }

  .theme-toggle {
    margin-left: 0;
    justify-content: center;
    margin-top: 0.4rem;
  }

  .account-block {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.3);
    padding-top: 0.75rem;
    margin-top: 0.4rem;
    justify-content: space-between;
  }
}
</style>
