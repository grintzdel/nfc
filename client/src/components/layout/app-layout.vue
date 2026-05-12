<script setup lang="ts">
import AppNav from './app-nav.vue'
import AppFooter from './app-footer.vue'
import CartDrawer from '@/modules/cart/ui/components/cart-drawer.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-pulse-bg">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <CartDrawer />
    <Toaster position="top-right" theme="dark" rich-colors />
  </div>
</template>
