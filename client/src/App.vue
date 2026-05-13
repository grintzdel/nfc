<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppLayout from './components/layout/app-layout.vue'

const route = useRoute()
const noLayout = computed(() => route.meta.noLayout === true)
</script>

<template>
  <AppLayout v-if="!noLayout">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
  </AppLayout>
  <router-view v-else v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 160ms ease-out,
    transform 160ms ease-out;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
