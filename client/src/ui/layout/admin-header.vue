<script setup lang="ts">
import { Search, Bell, Menu } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{ (event: 'open-sidebar'): void }>()
</script>

<template>
  <header
    class="border-b border-slate-700/50 bg-[#0F172A] px-4 py-4 sm:px-6 lg:px-8"
  >
    <div class="flex flex-row items-center justify-between gap-3">
      <!-- Left: hamburger (mobile) + Title -->
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          class="rounded-md border border-white/10 bg-[#020617] p-2 text-slate-300 hover:text-slate-100 lg:hidden"
          aria-label="Ouvrir le menu"
          @click="emit('open-sidebar')"
        >
          <Menu class="h-5 w-5" />
        </button>
        <div class="flex min-w-0 flex-col">
          <h1 class="truncate text-xl font-bold text-slate-50 sm:text-2xl">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="truncate text-xs text-slate-400 sm:text-sm">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Right: Search, Bell, Avatar -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Search Input — hidden on small to give space to the title -->
        <div class="hidden w-60 items-center gap-2 rounded-md border border-slate-700/50 bg-[#020617] px-3 py-2 xl:flex">
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
          class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800 sm:flex"
        >
          <span class="text-xs font-medium text-slate-300">AP</span>
        </div>
      </div>
    </div>
  </header>
</template>
