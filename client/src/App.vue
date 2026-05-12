<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/layout/app-layout.vue'

const route = useRoute()
const noLayout = computed(() => route.meta.noLayout === true)
</script>

<template>
  <AppLayout v-if="!noLayout">
    <router-view :key="route.fullPath" />
  </AppLayout>
  <router-view v-else :key="route.fullPath" />
</template>
