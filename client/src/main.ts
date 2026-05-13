import { VueQueryPlugin } from '@tanstack/vue-query'
import { createHead } from '@unhead/vue/client'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import { createDependencies } from '@/modules/app/core/dependencies'
import { DEPENDENCIES_KEY } from '@/modules/app/ui/hooks/use-dependencies'

import App from './App.vue'

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
    {
      path: '/register',
      name: 'register',
      component: () => import('./pages/register/page.vue'),
      meta: { noLayout: true },
    },
    { path: '/orders', name: 'orders', component: () => import('./pages/orders/page.vue') },
    {
      path: '/me/events',
      name: 'my-events',
      component: () => import('./pages/me/events/page.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/me/events/:participantId',
      name: 'participant-profile-edit',
      component: () => import('./pages/me/events/$participantId/page.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/events/:slug', name: 'event-public', component: () => import('./pages/events-public/page.vue') },
    {
      path: '/p/:nfcId',
      name: 'nfc-profile',
      component: () => import('./pages/p/page.vue'),
      meta: { noLayout: true },
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
    {
      path: '/admin/events/:eventId',
      name: 'admin-event-detail',
      component: () => import('./pages/admin/events/$eventId/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
    {
      path: '/admin/events/:eventId/scanner',
      name: 'admin-event-scanner',
      component: () => import('./pages/admin/events/$eventId/scanner/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
    {
      path: '/admin/bracelets',
      name: 'admin-bracelets',
      component: () => import('./pages/admin/bracelets/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
    {
      path: '/admin/participants',
      name: 'admin-participants',
      component: () => import('./pages/admin/participants/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: () => import('./pages/admin/products/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: () => import('./pages/admin/orders/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
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
app.use(createHead())
app.provide(DEPENDENCIES_KEY, createDependencies())
app.mount('#app')
