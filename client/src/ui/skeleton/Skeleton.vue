<script setup lang="ts">
// Generic shimmering skeleton block. Pass any Tailwind size/shape classes you want
// via :class — the only thing this component adds is the pulse animation and a
// muted background colour that fits the dark theme used everywhere.
defineProps<{ class?: string }>()
</script>

<template>
  <div :class="['animate-pulse rounded-md bg-slate-700/40', $props.class]" />
</template>
