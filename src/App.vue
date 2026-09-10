<template>
  <div id="app">
    <header class="app-header">
      <h1>🌍 ActiveClimate Melbourne</h1>
      <p>Sport & Travel for Climate Action</p>
      <nav class="app-nav">
        <router-link to="/">Home</router-link>
        <router-link to="/prediction">Prediction</router-link>
        <router-link to="/report">Report</router-link>
        <span class="nav-spacer" />
        <template v-if="currentUser">
          <span class="nav-user">{{ currentUser.email }}</span>
          <button class="nav-link-btn" @click="handleLogout">Log Out</button>
        </template>
        <template v-else>
          <router-link to="/login">Log In</router-link>
          <router-link to="/signup" class="nav-signup">Sign Up</router-link>
        </template>
      </nav>
    </header>
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

const { currentUser, logOut } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logOut()
  router.push('/')
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: #f9f9f9;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #2c5f2d 0%, #45a049 100%);
  color: white;
  text-align: center;
  padding: 2rem 1rem;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
}

.app-header p {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  opacity: 0.95;
}

.app-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.25rem;
  font-size: 0.95rem;
  flex-wrap: wrap;
}

.app-nav a,
.nav-link-btn {
  color: white;
  text-decoration: none;
  opacity: 0.9;
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  padding: 0;
}

.app-nav a.router-link-active {
  opacity: 1;
  font-weight: bold;
  text-decoration: underline;
}

.app-nav a:hover,
.nav-link-btn:hover {
  opacity: 1;
}

.nav-signup {
  background: white;
  color: #2c5f2d !important;
  padding: 0.35rem 0.9rem !important;
  border-radius: 20px;
  font-weight: bold;
}

.nav-spacer {
  flex: 1;
}

@media (max-width: 480px) {
  .nav-spacer {
    display: none;
  }
}

.nav-user {
  opacity: 0.9;
  font-size: 0.85rem;
}
</style>