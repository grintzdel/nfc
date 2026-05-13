<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

withDefaults(
  defineProps<{
    /** Reveal threshold (0–1). 0.1 = trigger when 10% of the element is visible. */
    threshold?: number
    /** Optional CSS animation-delay in ms — useful when staggering siblings. */
    delay?: number
  }>(),
  { threshold: 0.15, delay: 0 }
)

const wrapper = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!wrapper.value) return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.value = true
          observer?.disconnect()
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  )
  observer.observe(wrapper.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div
    ref="wrapper"
    :style="{ animationDelay: delay ? `${delay}ms` : undefined }"
    :class="['fade-in-on-scroll', visible ? 'is-visible' : '']"
  >
    <slot />
  </div>
</template>

<style scoped>
.fade-in-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 600ms ease-out,
    transform 600ms ease-out;
  transition-delay: inherit;
}
.fade-in-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
