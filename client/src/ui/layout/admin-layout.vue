<script setup lang="ts">
import AdminSidebar from './admin-sidebar.vue'
import AdminHeader from './admin-header.vue'
import { Toaster } from 'vue-sonner'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex h-screen bg-[#0F172A]">
    <AdminSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AdminHeader :title="title" :subtitle="subtitle" />
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
    <Toaster position="top-right" theme="dark" rich-colors />
  </div>
</template>
