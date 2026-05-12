import { ref } from 'vue'

const isOpen = ref(false)

export function useCartDrawer() {
  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, open, close }
}
