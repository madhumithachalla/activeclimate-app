import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Prediction from '../views/Prediction.vue'
import Report from '../views/Report.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/login', name: 'login', component: Login },
    { path: '/signup', name: 'signup', component: Signup },
    { path: '/prediction', name: 'prediction', component: Prediction, meta: { requiresAuth: true } },
    { path: '/report', name: 'report', component: Report },
  ],
})

// onAuthStateChanged resolves asynchronously, so a hard refresh on a guarded
// route must wait for the first auth check before deciding to redirect.
function waitForAuthReady() {
  const { authReady } = useAuth()
  if (authReady.value) return Promise.resolve()
  return new Promise((resolve) => {
    const stop = watch(authReady, (ready) => {
      if (ready) {
        stop()
        resolve()
      }
    })
  })
}

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  await waitForAuthReady()
  const { currentUser } = useAuth()
  if (currentUser.value) return true

  return { path: '/login', query: { redirect: to.fullPath } }
})

export default router
