<template>
  <div id="app">
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <NavBar />

    <!-- Warn rather than fail silently when the browser is blocking storage:
         accounts and ratings will not survive a refresh in that case. -->
    <p v-if="!storageAvailable" class="storage-warning" role="alert">
      Browser storage is unavailable, so accounts and ratings will only last for this visit.
      Turning off private browsing will fix it.
    </p>

    <div id="main-content">
      <RouterView />
    </div>

    <footer class="app-footer">
      <p class="footer-title">ActiveClimate Melbourne</p>
      <p class="footer-note">
        A not-for-profit connecting Melburnians to community sport and active travel.
      </p>
      <p class="footer-meta">
        FIT5032 A1.3 - Basic Application Development (Version 2) - Madhumitha Challa
      </p>
    </footer>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { isStorageAvailable } from './services/storage.js'

const storageAvailable = isStorageAvailable()
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: var(--page-bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--text-strong);
}

#main-content {
  flex: 1;
}

/* Keyboard users can jump straight past the nav. */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  background: var(--btn-bg);
  color: var(--on-brand);
  padding: 0.65rem 1rem;
  z-index: 100;
  border-radius: 0 0 4px 0;
  font-weight: 600;
}

.skip-link:focus {
  left: 0;
}

.storage-warning {
  margin: 0;
  padding: 0.7rem 1rem;
  background: var(--warn-bg);
  border-bottom: 2px solid var(--warn-border);
  color: var(--warn-text);
  font-size: 0.85rem;
  text-align: center;
}

.app-footer {
  background: var(--footer-bg);
  color: var(--on-brand);
  text-align: center;
  padding: 2rem 1rem;
  margin-top: 3rem;
}

.footer-title {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
}

.footer-note {
  margin: 0.4rem 0 0;
  font-size: 0.85rem;
  opacity: 0.85;
}

.footer-meta {
  margin: 0.85rem 0 0;
  font-size: 0.75rem;
  opacity: 0.6;
}
</style>
