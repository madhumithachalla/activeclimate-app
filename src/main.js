import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { initAuth } from './services/auth.js'

// BR (C.1): seed the demo coordinator account and restore any valid session
// before the first route guard runs, so a signed-in user landing directly on a
// protected URL is not bounced to the login page on a hard refresh.
initAuth().finally(() => {
  createApp(App).use(router).mount('#app')
})
