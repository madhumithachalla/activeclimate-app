// BR (C.2): Role-based authentication.
// Authorisation is enforced here, in a navigation guard, rather than only by
// hiding links in the nav bar. Typing /admin into the address bar as a member
// is refused the same way as clicking a hidden link would be.

import { createRouter, createWebHistory } from 'vue-router'
import { ROLES, useAuth, restoreSession } from '../services/auth.js'

import HomeView from '../views/HomeView.vue'
import ActivitiesView from '../views/ActivitiesView.vue'
import AboutView from '../views/AboutView.vue'
import FaqView from '../views/FaqView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import LogActivityView from '../views/LogActivityView.vue'
import DashboardView from '../views/DashboardView.vue'
import AdminView from '../views/AdminView.vue'
import ForbiddenView from '../views/ForbiddenView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Home' }
  },
  {
    path: '/activities',
    name: 'activities',
    component: ActivitiesView,
    meta: { title: 'Activity Groups' }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { title: 'About Us' }
  },
  {
    path: '/faq',
    name: 'faq',
    component: FaqView,
    meta: { title: 'FAQ' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    // Signing in again while already signed in makes no sense, so these two
    // routes bounce an authenticated user back to their dashboard.
    meta: { guestOnly: true, title: 'Sign In' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { guestOnly: true, title: 'Create Account' }
  },
  {
    path: '/log',
    name: 'log-activity',
    component: LogActivityView,
    meta: { requiresAuth: true, roles: [ROLES.MEMBER, ROLES.ADMIN], title: 'Log Activity' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: [ROLES.MEMBER, ROLES.ADMIN], title: 'My Dashboard' }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    // Members are authenticated but not authorised for this page.
    meta: { requiresAuth: true, roles: [ROLES.ADMIN], title: 'Coordinator Admin' }
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: ForbiddenView,
    meta: { title: 'Access Denied' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const { currentUser } = useAuth()

  // A full page reload clears the in-memory user, so the stored session is
  // re-checked (and re-validated, and expired if stale) before each guard runs.
  if (!currentUser.value) {
    restoreSession()
  }

  const user = currentUser.value

  if (to.meta.guestOnly && user) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresAuth && !user) {
    // Remember where they were heading so sign-in can return them there.
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
    return { name: 'forbidden' }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | ActiveClimate Melbourne`
    : 'ActiveClimate Melbourne'
})

export default router
