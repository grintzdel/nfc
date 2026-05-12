<script setup lang="ts">
import { Search, Bell } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header
    class="border-b border-slate-700/50 bg-[#0F172A] px-8 py-4"
  >
    <div class="flex flex-row items-center justify-between">
      <!-- Left: Title and Subtitle -->
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold text-slate-50">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-sm text-slate-400">
          {{ subtitle }}
        </p>
      </div>

      <!-- Right: Search, Bell, Avatar -->
      <div class="flex items-center gap-4">
        <!-- Search Input -->
        <div class="flex w-60 items-center gap-2 rounded-md border border-slate-700/50 bg-[#020617] px-3 py-2">
          <Search class="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            class="bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <!-- Bell Button -->
        <button
          class="rounded-md border border-white/10 bg-[#020617] p-2 text-slate-400 hover:text-slate-200"
        >
          <Bell class="h-5 w-5" />
        </button>

        <!-- Avatar -->
        <div
          class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800"
        >
          <span class="text-xs font-medium text-slate-300">AP</span>
        </div>
      </div>
    </div>
  </header>
</template>
