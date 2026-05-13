<script setup lang="ts">
import { Lock, Truck, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'
import { useCart } from '@/modules/cart/ui/hooks/use-cart'
import { useGetProducts } from '@/modules/product/ui/hooks/queries/query/use-get-products'

import CartItemRow from './cart-item-row.vue'

const router = useRouter()
const { isAuthenticated } = useAuth()
const { items: cartItems, cartOpen, totalQuantity, updateQuantity, removeItem, clear, closeCart } = useCart()
const { data: products } = useGetProducts()
const { cartPort, orderPort } = useDependencies()
const isCheckingOut = ref(false)

const subtotal = computed(() => {
  if (!products.value) return 0
  return cartItems.value.reduce((sum, item) => {
    const product = products.value!.find((p) => p.id === item.productId)
    return sum + (product ? product.price * item.quantity : 0)
  }, 0)
})

function getProduct(productId: string) {
  return products.value?.find((p) => p.id === productId)
}

function handleUpdateQuantity(productId: string, quantity: number) {
  updateQuantity(productId, quantity)
}

function handleRemove(productId: string) {
  removeItem(productId)
}

async function handleCheckout() {
  if (!isAuthenticated()) {
    closeCart()
    window.location.href = '/login'
    return
  }

  isCheckingOut.value = true
  try {
    await cartPort.clearCart().catch(() => {})

    for (const item of cartItems.value) {
      await cartPort.addToCart({
        productId: item.productId,
        quantity: item.quantity,
        variantName: item.variantName,
      })
    }

    await orderPort.create({ shippingAddress: 'Non renseigne' })

    clear()
    toast.success('Commande validee !')
    closeCart()
    router.push('/orders')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Erreur lors de la commande')
  } finally {
    isCheckingOut.value = false
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300 ease-in-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-in-out"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="cartOpen" class="fixed inset-0 z-40 bg-black/60" @click="closeCart" />
  </Transition>

  <Transition
    enter-active-class="transition-transform duration-300 ease-in-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-300 ease-in-out"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="cartOpen"
      class="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-slate-700/50 bg-[#0F172A] shadow-2xl"
    >
      <div class="flex items-center justify-between border-b border-slate-700/50 px-6 py-5">
        <div class="flex items-center gap-3">
          <h2 class="text-xl font-bold text-slate-50">Votre panier</h2>
          <span
            v-if="totalQuantity > 0"
            class="flex h-6 min-w-6 items-center justify-center rounded-full bg-pulse-violet px-2 text-xs font-bold text-white"
          >
            {{ totalQuantity }}
          </span>
        </div>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/50 text-slate-400 transition-colors hover:text-slate-200"
          @click="closeCart"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="flex items-center gap-2 bg-emerald-500/10 px-6 py-2.5">
        <Truck class="h-4 w-4 flex-shrink-0 text-emerald-400" />
        <span class="text-[13px] font-medium text-emerald-400">Livraison gratuite pour toute commande</span>
      </div>

      <div v-if="cartItems.length === 0" class="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <span class="text-4xl">&#128722;</span>
        <p class="text-sm text-slate-400">Votre panier est vide</p>
        <button
          class="rounded-md bg-pulse-violet px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-pulse-violet-dark"
          @click="closeCart"
        >
          Continuer mes achats
        </button>
      </div>

      <template v-else>
        <div class="flex-1 overflow-y-auto px-6">
          <CartItemRow
            v-for="item in cartItems"
            :key="item.productId"
            :item="{
              id: item.productId,
              productId: item.productId,
              variantName: item.variantName ?? null,
              quantity: item.quantity,
              createdAt: '',
            }"
            :product="getProduct(item.productId)"
            @update-quantity="handleUpdateQuantity"
            @remove="handleRemove"
          />
        </div>

        <div class="border-t border-slate-700/50 px-6 pb-6 pt-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-400">Sous-total ({{ totalQuantity }} articles)</span>
              <span class="text-sm font-semibold text-slate-50">{{ subtotal.toFixed(2) }}&#8364;</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-400">Livraison</span>
              <span class="text-sm font-semibold text-emerald-400">Gratuite</span>
            </div>
            <div class="my-2 h-px bg-slate-700/50" />
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-slate-50">Total</span>
              <span
                class="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-2xl font-extrabold text-transparent"
              >
                {{ subtotal.toFixed(2) }}&#8364;
              </span>
            </div>
          </div>

          <button
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            :disabled="isCheckingOut"
            @click="handleCheckout"
          >
            <Lock class="h-4 w-4" />
            Paiement securise
          </button>

          <button
            class="mt-3 w-full text-center text-[13px] font-medium text-violet-400 transition-colors hover:text-violet-300"
            @click="closeCart"
          >
            Continuer mes achats
          </button>
        </div>
      </template>
    </aside>
  </Transition>
</template>
