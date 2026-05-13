<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AdminHeader from './admin-header.vue'
import AdminSidebar from './admin-sidebar.vue'

defineProps<{
  title: string
  subtitle?: string
}>()

const sidebarOpen = ref(false)
const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  }
)
</script>

<template>
  <div class="flex h-screen bg-[#0F172A]">
    <AdminSidebar :open="sidebarOpen" @update:open="(v) => (sidebarOpen = v)" />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AdminHeader :title="title" :subtitle="subtitle" @open-sidebar="sidebarOpen = true" />
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
