import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLoginView.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Route guard — protect /admin and prevent logged-in users from seeing login
router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()

  // If route requires auth and there is no session, go to login
  if (to.meta.requiresAuth && !session) {
    return { name: 'AdminLogin' }
  }

  // If user has a session and tries to visit login page, send to admin dashboard
  if (to.name === 'AdminLogin' && session) {
    return { name: 'Admin' }
  }
})

export default router
