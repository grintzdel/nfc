<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    total: number
    limit: number
    itemLabel?: string
  }>(),
  { itemLabel: 'résultats' }
)

const emit = defineEmits<{ 'update:page': [value: number] }>()

const from = computed(() => (props.page - 1) * props.limit + 1)
const to = computed(() => Math.min(props.page * props.limit, props.total))

const pageNumbers = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, props.page - 1)
  const end = Math.min(props.totalPages, start + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<template>
  <div v-if="total > 0" class="flex items-center justify-between border-t border-white/10 px-6 py-4">
    <span class="text-sm text-slate-400"> Affichage {{ from }}-{{ to }} sur {{ total }} {{ itemLabel }} </span>
    <div class="flex items-center gap-1">
      <button
        class="flex h-10 w-10 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 disabled:opacity-30"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
      <button
        v-for="p in pageNumbers"
        :key="p"
        class="flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium"
        :class="
          p === page ? 'border border-white/10 bg-[#020617] text-slate-50 shadow-sm' : 'text-slate-400 hover:bg-white/5'
        "
        @click="emit('update:page', p)"
      >
        {{ p }}
      </button>
      <button
        class="flex h-10 w-10 items-center justify-center rounded-md text-slate-400 hover:bg-white/5 disabled:opacity-30"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
