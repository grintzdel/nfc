<script setup lang="ts">
import type { Component } from 'vue'
import { Inbox } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    icon?: Component
    title: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 text-center"
    :class="{
      'px-4 py-8': size === 'sm',
      'px-6 py-12': size === 'md',
      'px-6 py-20': size === 'lg',
    }"
  >
    <div
      class="flex items-center justify-center rounded-full bg-slate-800/80 ring-1 ring-white/5"
      :class="{
        'h-10 w-10': size === 'sm',
        'h-14 w-14': size === 'md',
        'h-20 w-20': size === 'lg',
      }"
    >
      <component
        :is="icon ?? Inbox"
        class="text-slate-400"
        :class="{
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-10 w-10': size === 'lg',
        }"
      />
    </div>
    <div class="flex max-w-md flex-col gap-1">
      <h3
        class="font-semibold text-slate-200"
        :class="{
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
        }"
      >
        {{ title }}
      </h3>
      <p
        v-if="description"
        class="text-slate-400"
        :class="{
          'text-xs': size === 'sm',
          'text-sm': size === 'md' || size === 'lg',
        }"
      >
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.default" class="mt-2">
      <slot />
    </div>
  </div>
</template>
