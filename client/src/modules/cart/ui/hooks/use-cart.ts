import { ref, computed, watch } from 'vue'

export interface LocalCartItem {
  productId: string
  variantName?: string
  quantity: number
}

const STORAGE_KEY = 'pulse_cart'

function loadFromStorage(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const items = ref<LocalCartItem[]>(loadFromStorage())
const cartOpen = ref(false)

watch(
  items,
  (val) => {
    saveToStorage(val)
  },
  { deep: true }
)

export function useCart() {
  const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  function addItem(productId: string, quantity = 1, variantName?: string) {
    const existing = items.value.find((i) => i.productId === productId && i.variantName === variantName)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ productId, quantity, variantName })
    }
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find((i) => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function removeItem(productId: string) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }

  function clear() {
    items.value = []
  }

  function openCart() {
    cartOpen.value = true
  }

  function closeCart() {
    cartOpen.value = false
  }

  return { items, cartOpen, totalQuantity, addItem, updateQuantity, removeItem, clear, openCart, closeCart }
}
