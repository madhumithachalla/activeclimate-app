import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { initAuth } from './services/auth.js'
import { initTheme } from './services/theme.js'
import { seedDemoData } from './services/demoData.js'

// Applied before mount so the first paint is already in the saved theme.
initTheme()

// Seed the coordinator account, populate demo content on a first visit, then
// restore any valid session before the first route guard runs. Without this a
// signed-in user landing directly on a protected URL would be bounced to the
// login page on a hard refresh.
const bootstrap = async () => {
  await initAuth()
  await seedDemoData()
}

bootstrap().finally(() => {
  createApp(App).use(router).mount('#app')
})
