<script setup lang="ts">
defineProps<{ class?: string }>()
</script>

<template>
  <div :class="['animate-pulse rounded-md bg-slate-700/40', $props.class]" />
</template>
