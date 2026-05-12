import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { createDependencies } from '@/modules/app/core/dependencies'
import { DEPENDENCIES_KEY } from '@/modules/app/ui/hooks/use-dependencies'
import './assets/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/home/page.vue') },
    { path: '/features', name: 'features', component: () => import('./pages/features/page.vue') },
    { path: '/about', name: 'about', component: () => import('./pages/about/page.vue') },
    { path: '/contact', name: 'contact', component: () => import('./pages/contact/page.vue') },
    { path: '/shop', name: 'shop', component: () => import('./pages/shop/page.vue') },
    { path: '/product/:slug', name: 'product', component: () => import('./pages/product-detail/page.vue') },
    { path: '/login', name: 'login', component: () => import('./pages/login/page.vue'), meta: { noLayout: true } },
    { path: '/register', name: 'register', component: () => import('./pages/register/page.vue'), meta: { noLayout: true } },
    { path: '/orders', name: 'orders', component: () => import('./pages/orders/page.vue') },
    {
      path: '/me/events/:participantId',
      name: 'participant-profile-edit',
      component: () => import('./pages/me/events/page.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/admin', redirect: '/admin/dashboard' },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('./pages/admin/dashboard/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
    {
      path: '/admin/events',
      name: 'admin-events',
      component: () => import('./pages/admin/events/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAdmin) {
    if (!token) return { path: '/login', query: { redirect: to.fullPath } }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') return '/'
    } catch {
      return '/login'
    }
  }
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin)
app.provide(DEPENDENCIES_KEY, createDependencies())
app.mount('#app')
