<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  iconColor: string
  title: string
  value: string
  badge?: string
  badgeVariant?: 'positive' | 'negative'
}>()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5">
    <div class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full"
        :style="{ backgroundColor: iconColor + '20' }"
      >
        <component :is="icon" class="h-5 w-5" :style="{ color: iconColor }" />
      </div>
      <span class="text-sm font-medium text-slate-400">{{ title }}</span>
    </div>
    <div class="flex flex-col gap-1.5">
      <span class="text-[28px] font-bold leading-tight text-slate-50">{{ value }}</span>
      <span
        v-if="badge"
        class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="
          badgeVariant === 'negative'
            ? 'bg-red-500/20 text-red-500'
            : 'bg-emerald-500/20 text-emerald-500'
        "
      >
        {{ badge }}
      </span>
    </div>
  </div>
</template>
