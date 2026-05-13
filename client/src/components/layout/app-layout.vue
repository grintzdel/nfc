<script setup lang="ts">
import CartDrawer from '@/modules/cart/ui/components/cart-drawer.vue'

import AppFooter from './app-footer.vue'
import AppNav from './app-nav.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-pulse-bg">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <CartDrawer />
  </div>
</template>
