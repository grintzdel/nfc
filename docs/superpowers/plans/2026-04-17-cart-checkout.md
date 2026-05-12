# Cart Flow + Checkout + Orders Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to add products to a cart, manage items via a drawer, place an order (no real payment), and view order history.

**Architecture:** Frontend cart + order core modules (port/adapter/hooks) following existing patterns. Cart drawer UI built with shadcn-vue Sheet. Product card wired to add-to-cart. Orders page follows features/pages architecture.

**Tech Stack:** Vue 3, TypeScript, TanStack Vue Query 5.x, shadcn-vue, Tailwind CSS, Lucide icons

**Spec:** `docs/superpowers/specs/2026-04-17-cart-checkout-design.md`

---

## File Map

### New files

| Category | Files |
|----------|-------|
| shadcn setup | `src/ui/lib/utils.ts` + generated components in `src/ui/` (sheet, button, badge, sonner) |
| Cart core | `modules/cart/core/model/cart.domain-model.ts`, `modules/cart/core/ports/cart.port.ts`, `modules/cart/core/adapters/cart.adapter.http.ts` |
| Cart hooks | `modules/cart/ui/hooks/queries/query/use-get-cart.ts`, `modules/cart/ui/hooks/queries/mutation/use-add-to-cart.ts`, `use-update-cart-item.ts`, `use-remove-cart-item.ts`, `use-clear-cart.ts` |
| Cart UI | `modules/cart/ui/components/cart-drawer.vue`, `modules/cart/ui/components/cart-item-row.vue`, `modules/cart/ui/hooks/use-cart-drawer.ts` |
| Order core | `modules/order/core/model/order.domain-model.ts`, `modules/order/core/ports/order.port.ts`, `modules/order/core/adapters/order.adapter.http.ts` |
| Order hooks | `modules/order/ui/hooks/queries/query/use-get-my-orders.ts`, `use-get-order-by-id.ts`, `modules/order/ui/hooks/queries/mutation/use-create-order.ts` |
| Order UI | `modules/order/ui/components/order-list.vue` |
| Feature + Page | `features/public/orders/orders.page.vue`, `pages/orders/page.vue` |

### Modified files

| File | Change |
|------|--------|
| `modules/app/core/dependencies.ts` | Add cartPort + orderPort |
| `modules/product/ui/components/product-card.vue` | Wire "Ajouter" button |
| `components/layout/app-nav.vue` | Cart icon + badge + drawer trigger |
| `components/layout/app-layout.vue` | Render cart drawer + Toaster |
| `main.ts` | Add /orders route |
| `package.json` | Add shadcn deps (class-variance-authority, clsx, tailwind-merge, radix-vue, sonner) |
| `components.json` | shadcn-vue config |
| `tailwind.config.js` | Add animate plugin if needed |

---

## Task 1: Install shadcn-vue + base components

**Files:**
- Create: `client/components.json`
- Create: `client/src/ui/lib/utils.ts`
- Modify: `client/package.json`
- Modify: `client/tailwind.config.js`

- [ ] **Step 1: Install shadcn-vue dependencies**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client
pnpm add radix-vue class-variance-authority clsx tailwind-merge
pnpm add vue-sonner
pnpm add -D tailwindcss-animate
```

- [ ] **Step 2: Create components.json**

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "default",
  "typescript": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/assets/main.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "framework": "vite",
  "aliases": {
    "components": "@/ui",
    "utils": "@/ui/lib/utils"
  }
}
```

- [ ] **Step 3: Create utils.ts**

```typescript
// client/src/ui/lib/utils.ts

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Update tailwind.config.js — add tailwindcss-animate plugin**

Add `require('tailwindcss-animate')` to plugins array. The existing config already has the CSS variable colors and borderRadius — those are fine.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pulse: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: '#334155',
          violet: {
            DEFAULT: '#7C3AED',
            light: '#A78BFA',
            dark: '#5B21B6',
          },
          orange: {
            DEFAULT: '#F97316',
            light: '#FDBA74',
          },
          pink: '#EC4899',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

- [ ] **Step 5: Add shadcn-vue components via CLI**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client
npx shadcn-vue@latest add sheet button badge sonner --yes
```

This generates components into `src/ui/` based on `components.json` aliases.

If the CLI doesn't respect the alias, manually move generated files to `src/ui/`.

- [ ] **Step 6: Verify components are in src/ui/**

```bash
ls -R src/ui/
```

Expected structure:
```
src/ui/
├── lib/
│   └── utils.ts
└── components/
    ├── sheet/
    ├── button/
    ├── badge/
    └── sonner/
```

- [ ] **Step 7: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client
./node_modules/.bin/vue-tsc --noEmit && ./node_modules/.bin/vite build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add client/components.json client/src/ui/ client/src/assets/main.css client/package.json client/pnpm-lock.yaml client/tailwind.config.js
git commit -m "feat(client): install shadcn-vue with sheet, button, badge, sonner components in src/ui/"
```

---

## Task 2: Cart Core Module (model + port + adapter + hooks)

**Files:**
- Create: `client/src/modules/cart/core/model/cart.domain-model.ts`
- Create: `client/src/modules/cart/core/ports/cart.port.ts`
- Create: `client/src/modules/cart/core/adapters/cart.adapter.http.ts`
- Create: `client/src/modules/cart/ui/hooks/queries/query/use-get-cart.ts`
- Create: `client/src/modules/cart/ui/hooks/queries/mutation/use-add-to-cart.ts`
- Create: `client/src/modules/cart/ui/hooks/queries/mutation/use-update-cart-item.ts`
- Create: `client/src/modules/cart/ui/hooks/queries/mutation/use-remove-cart-item.ts`
- Create: `client/src/modules/cart/ui/hooks/queries/mutation/use-clear-cart.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/cart/core/model/cart.domain-model.ts

export namespace CartDomainModel {
  export type CartItemOverviewDto = {
    id: string
    productId: string
    variantName: string | null
    quantity: number
    createdAt: string
  }

  export type AddToCartDto = {
    productId: string
    quantity: number
    variantName?: string
  }

  export type UpdateCartItemDto = {
    quantity: number
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/cart/core/ports/cart.port.ts

import type { CartDomainModel } from '../model/cart.domain-model'

export interface ICartPort {
  getCart(): Promise<CartDomainModel.CartItemOverviewDto[]>
  addToCart(dto: CartDomainModel.AddToCartDto): Promise<CartDomainModel.CartItemOverviewDto>
  updateItem(id: string, dto: CartDomainModel.UpdateCartItemDto): Promise<CartDomainModel.CartItemOverviewDto>
  removeItem(id: string): Promise<void>
  clearCart(): Promise<void>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/cart/core/adapters/cart.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { ICartPort } from '../ports/cart.port'
import type { CartDomainModel } from '../model/cart.domain-model'

export class CartHttpAdapter implements ICartPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getCart(): Promise<CartDomainModel.CartItemOverviewDto[]> {
    const result = await this.httpClient.get<CartDomainModel.CartItemOverviewDto[]>('/cart')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async addToCart(dto: CartDomainModel.AddToCartDto): Promise<CartDomainModel.CartItemOverviewDto> {
    const result = await this.httpClient.post<CartDomainModel.CartItemOverviewDto>('/cart/items', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async updateItem(id: string, dto: CartDomainModel.UpdateCartItemDto): Promise<CartDomainModel.CartItemOverviewDto> {
    const result = await this.httpClient.patch<CartDomainModel.CartItemOverviewDto>(`/cart/items/${id}`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async removeItem(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/cart/items/${id}`)
    if (result.error) throw new Error(result.error.message)
  }

  async clearCart(): Promise<void> {
    const result = await this.httpClient.delete('/cart')
    if (result.error) throw new Error(result.error.message)
  }
}
```

- [ ] **Step 4: Create query hook**

```typescript
// client/src/modules/cart/ui/hooks/queries/query/use-get-cart.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetCart() {
  const { cartPort } = useDependencies()

  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartPort.getCart(),
  })
}
```

- [ ] **Step 5: Create mutation hooks**

```typescript
// client/src/modules/cart/ui/hooks/queries/mutation/use-add-to-cart.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CartDomainModel } from '@/modules/cart/core/model/cart.domain-model'

export function useAddToCart() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['addToCart'],
    mutationFn: (dto: CartDomainModel.AddToCartDto) => cartPort.addToCart(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
```

```typescript
// client/src/modules/cart/ui/hooks/queries/mutation/use-update-cart-item.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CartDomainModel } from '@/modules/cart/core/model/cart.domain-model'

export function useUpdateCartItem() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateCartItem'],
    mutationFn: ({ id, dto }: { id: string; dto: CartDomainModel.UpdateCartItemDto }) => cartPort.updateItem(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
```

```typescript
// client/src/modules/cart/ui/hooks/queries/mutation/use-remove-cart-item.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useRemoveCartItem() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['removeCartItem'],
    mutationFn: (id: string) => cartPort.removeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
```

```typescript
// client/src/modules/cart/ui/hooks/queries/mutation/use-clear-cart.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useClearCart() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['clearCart'],
    mutationFn: () => cartPort.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add client/src/modules/cart/
git commit -m "feat(client): add cart core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 3: Order Core Module (model + port + adapter + hooks)

**Files:**
- Create: `client/src/modules/order/core/model/order.domain-model.ts`
- Create: `client/src/modules/order/core/ports/order.port.ts`
- Create: `client/src/modules/order/core/adapters/order.adapter.http.ts`
- Create: `client/src/modules/order/ui/hooks/queries/query/use-get-my-orders.ts`
- Create: `client/src/modules/order/ui/hooks/queries/query/use-get-order-by-id.ts`
- Create: `client/src/modules/order/ui/hooks/queries/mutation/use-create-order.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/order/core/model/order.domain-model.ts

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export namespace OrderDomainModel {
  export type OrderItemDto = {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }

  export type OrderOverviewDto = {
    id: string
    userId: string
    items: OrderItemDto[]
    totalAmount: number
    status: OrderStatus
    shippingAddress: string
    createdAt: string
  }

  export type CreateOrderDto = {
    shippingAddress: string
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/order/core/ports/order.port.ts

import type { OrderDomainModel } from '../model/order.domain-model'

export interface IOrderPort {
  create(dto: OrderDomainModel.CreateOrderDto): Promise<OrderDomainModel.OrderOverviewDto>
  getMyOrders(): Promise<OrderDomainModel.OrderOverviewDto[]>
  getById(id: string): Promise<OrderDomainModel.OrderOverviewDto>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/order/core/adapters/order.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IOrderPort } from '../ports/order.port'
import type { OrderDomainModel } from '../model/order.domain-model'

export class OrderHttpAdapter implements IOrderPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(dto: OrderDomainModel.CreateOrderDto): Promise<OrderDomainModel.OrderOverviewDto> {
    const result = await this.httpClient.post<OrderDomainModel.OrderOverviewDto>('/orders', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyOrders(): Promise<OrderDomainModel.OrderOverviewDto[]> {
    const result = await this.httpClient.get<OrderDomainModel.OrderOverviewDto[]>('/orders')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<OrderDomainModel.OrderOverviewDto> {
    const result = await this.httpClient.get<OrderDomainModel.OrderOverviewDto>(`/orders/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
```

- [ ] **Step 4: Create query hooks**

```typescript
// client/src/modules/order/ui/hooks/queries/query/use-get-my-orders.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyOrders() {
  const { orderPort } = useDependencies()

  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderPort.getMyOrders(),
  })
}
```

```typescript
// client/src/modules/order/ui/hooks/queries/query/use-get-order-by-id.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetOrderById(id: Ref<string>) {
  const { orderPort } = useDependencies()

  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
```

- [ ] **Step 5: Create mutation hook**

```typescript
// client/src/modules/order/ui/hooks/queries/mutation/use-create-order.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { OrderDomainModel } from '@/modules/order/core/model/order.domain-model'

export function useCreateOrder() {
  const { orderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createOrder'],
    mutationFn: (dto: OrderDomainModel.CreateOrderDto) => orderPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add client/src/modules/order/
git commit -m "feat(client): add order core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 4: Wire cart + order ports into dependencies.ts

**Files:**
- Modify: `client/src/modules/app/core/dependencies.ts`

- [ ] **Step 1: Update dependencies.ts**

Add these imports at the top:

```typescript
import type { ICartPort } from '@/modules/cart/core/ports/cart.port'
import type { IOrderPort } from '@/modules/order/core/ports/order.port'
import { CartHttpAdapter } from '@/modules/cart/core/adapters/cart.adapter.http'
import { OrderHttpAdapter } from '@/modules/order/core/adapters/order.adapter.http'
```

Add to the `Dependencies` type:

```typescript
  cartPort: ICartPort
  orderPort: IOrderPort
```

Add to the `return` block in `createDependencies()`:

```typescript
    cartPort: new CartHttpAdapter(httpClient),
    orderPort: new OrderHttpAdapter(httpClient),
```

- [ ] **Step 2: Verify TS compiles**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && ./node_modules/.bin/vue-tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add client/src/modules/app/core/dependencies.ts
git commit -m "feat(client): wire cart + order ports into dependencies.ts"
```

---

## Task 5: Cart Drawer UI Components

**Files:**
- Create: `client/src/modules/cart/ui/hooks/use-cart-drawer.ts`
- Create: `client/src/modules/cart/ui/components/cart-item-row.vue`
- Create: `client/src/modules/cart/ui/components/cart-drawer.vue`

- [ ] **Step 1: Create cart drawer state hook**

```typescript
// client/src/modules/cart/ui/hooks/use-cart-drawer.ts

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
```

- [ ] **Step 2: Create cart-item-row.vue**

```vue
<!-- client/src/modules/cart/ui/components/cart-item-row.vue -->
<script setup lang="ts">
import { Trash2, Minus, Plus } from 'lucide-vue-next'
import type { CartDomainModel } from '@/modules/cart/core/model/cart.domain-model'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'

const props = defineProps<{
  item: CartDomainModel.CartItemOverviewDto
  product: ProductDomainModel.ProductOverviewDto | undefined
}>()

const emit = defineEmits<{
  updateQuantity: [id: string, quantity: number]
  remove: [id: string]
}>()

function decrement() {
  if (props.item.quantity > 1) {
    emit('updateQuantity', props.item.id, props.item.quantity - 1)
  }
}

function increment() {
  emit('updateQuantity', props.item.id, props.item.quantity + 1)
}
</script>

<template>
  <div class="flex gap-3.5 border-b border-slate-700/50 py-4">
    <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[10px] bg-pulse-surface md:h-20 md:w-20">
      <img
        v-if="product?.imageUrl"
        :src="product.imageUrl"
        :alt="product?.name"
        class="h-full w-full object-cover"
      />
    </div>
    <div class="flex flex-1 flex-col gap-1">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-slate-50">{{ product?.name ?? 'Produit' }}</span>
        <button class="text-slate-400 transition-colors hover:text-slate-200" @click="emit('remove', item.id)">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
      <span class="text-xs text-slate-400">{{ product?.description ?? '' }}</span>
      <div class="mt-auto flex items-center justify-between">
        <span class="text-base font-bold text-violet-400">{{ product ? (product.price * item.quantity).toFixed(2) : '0' }}&#8364;</span>
        <div class="flex items-center rounded-md border border-slate-700/50 bg-pulse-surface">
          <button class="flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:text-slate-200" @click="decrement">
            <Minus class="h-3.5 w-3.5" />
          </button>
          <span class="flex h-8 w-8 items-center justify-center text-sm font-semibold text-slate-50">{{ item.quantity }}</span>
          <button class="flex h-8 w-8 items-center justify-center text-slate-50 transition-colors hover:text-white" @click="increment">
            <Plus class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create cart-drawer.vue**

```vue
<!-- client/src/modules/cart/ui/components/cart-drawer.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Truck } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/ui/components/sheet'
import { Badge } from '@/ui/components/badge'
import CartItemRow from './cart-item-row.vue'
import { useGetCart } from '@/modules/cart/ui/hooks/queries/query/use-get-cart'
import { useUpdateCartItem } from '@/modules/cart/ui/hooks/queries/mutation/use-update-cart-item'
import { useRemoveCartItem } from '@/modules/cart/ui/hooks/queries/mutation/use-remove-cart-item'
import { useCreateOrder } from '@/modules/order/ui/hooks/queries/mutation/use-create-order'
import { useGetProducts } from '@/modules/product/ui/hooks/queries/query/use-get-products'
import { useCartDrawer } from '@/modules/cart/ui/hooks/use-cart-drawer'

const router = useRouter()
const { isOpen, close } = useCartDrawer()
const { data: cartItems } = useGetCart()
const { data: products } = useGetProducts()
const updateItem = useUpdateCartItem()
const removeItem = useRemoveCartItem()
const createOrder = useCreateOrder()

const totalQuantity = computed(() => cartItems.value?.reduce((sum, item) => sum + item.quantity, 0) ?? 0)

const subtotal = computed(() => {
  if (!cartItems.value || !products.value) return 0
  return cartItems.value.reduce((sum, item) => {
    const product = products.value!.find((p) => p.id === item.productId)
    return sum + (product ? product.price * item.quantity : 0)
  }, 0)
})

function getProduct(productId: string) {
  return products.value?.find((p) => p.id === productId)
}

function handleUpdateQuantity(id: string, quantity: number) {
  updateItem.mutate({ id, dto: { quantity } })
}

function handleRemove(id: string) {
  removeItem.mutate(id)
}

function handleCheckout() {
  createOrder.mutate(
    { shippingAddress: 'Non renseigne' },
    {
      onSuccess: () => {
        toast.success('Commande validee !')
        close()
        router.push('/orders')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    },
  )
}
</script>

<template>
  <Sheet :open="isOpen" @update:open="(val) => !val && close()">
    <SheetContent side="right" class="flex w-full flex-col border-slate-700/50 bg-[#0F172A] p-0 sm:max-w-[440px]">
      <!-- Header -->
      <SheetHeader class="flex-row items-center justify-between border-b border-slate-700/50 px-6 py-5">
        <div class="flex items-center gap-3">
          <SheetTitle class="text-xl font-bold text-slate-50">Votre panier</SheetTitle>
          <Badge v-if="totalQuantity > 0" class="rounded-full bg-pulse-violet px-2.5 py-0.5 text-xs font-bold text-white">
            {{ totalQuantity }}
          </Badge>
        </div>
      </SheetHeader>

      <!-- Free shipping banner -->
      <div class="flex items-center gap-2 bg-emerald-500/10 px-6 py-2.5">
        <Truck class="h-4 w-4 text-emerald-500" />
        <span class="text-[13px] font-medium text-emerald-500">Livraison gratuite a partir de 500&#8364;</span>
      </div>

      <!-- Cart items -->
      <div class="flex-1 overflow-y-auto px-6">
        <div v-if="!cartItems?.length" class="flex h-full items-center justify-center">
          <p class="text-sm text-slate-400">Votre panier est vide</p>
        </div>
        <CartItemRow
          v-for="item in cartItems"
          :key="item.id"
          :item="item"
          :product="getProduct(item.productId)"
          @update-quantity="handleUpdateQuantity"
          @remove="handleRemove"
        />
      </div>

      <!-- Summary + CTA -->
      <div v-if="cartItems?.length" class="border-t border-slate-700/50">
        <!-- Order summary -->
        <div class="flex flex-col gap-2 px-6 py-4">
          <div class="flex justify-between">
            <span class="text-sm text-slate-400">Sous-total ({{ totalQuantity }} articles)</span>
            <span class="text-sm font-medium text-slate-50">{{ subtotal.toFixed(2) }}&#8364;</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-slate-400">Livraison</span>
            <span class="text-sm font-medium text-emerald-500">Gratuite</span>
          </div>
          <div class="my-1 h-px bg-slate-700/50" />
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-slate-50">Total</span>
            <span class="bg-gradient-to-r from-violet-400 to-pink-500 bg-clip-text text-2xl font-extrabold text-transparent">
              {{ subtotal.toFixed(2) }}&#8364;
            </span>
          </div>
        </div>

        <!-- CTA -->
        <div class="flex flex-col gap-2.5 px-6 pb-6 pt-3">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            :disabled="createOrder.isPending.value"
            @click="handleCheckout"
          >
            <Lock class="h-4 w-4" />
            Paiement securise
          </button>
          <button class="w-full py-1 text-center text-[13px] font-medium text-violet-400 transition-colors hover:text-violet-300" @click="close">
            Continuer mes achats
          </button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
```

- [ ] **Step 4: Verify TS compiles**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && ./node_modules/.bin/vue-tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add client/src/modules/cart/ui/
git commit -m "feat(client): add cart drawer UI — item rows, quantity controls, summary, checkout CTA"
```

---

## Task 6: Wire Cart Drawer + Toaster into App Layout

**Files:**
- Modify: `client/src/components/layout/app-layout.vue`

- [ ] **Step 1: Update app-layout.vue**

```vue
<!-- client/src/components/layout/app-layout.vue -->
<script setup lang="ts">
import AppNav from './app-nav.vue'
import AppFooter from './app-footer.vue'
import CartDrawer from '@/modules/cart/ui/components/cart-drawer.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-pulse-bg">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <CartDrawer />
    <Toaster position="top-right" theme="dark" rich-colors />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/layout/app-layout.vue
git commit -m "feat(client): render cart drawer + sonner toaster in app layout"
```

---

## Task 7: Header Cart Icon + Badge

**Files:**
- Modify: `client/src/components/layout/app-nav.vue`

- [ ] **Step 1: Update app-nav.vue**

Replace the entire file with:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X, ShoppingCart } from 'lucide-vue-next'
import { useGetCart } from '@/modules/cart/ui/hooks/queries/query/use-get-cart'
import { useCartDrawer } from '@/modules/cart/ui/hooks/use-cart-drawer'

const mobileMenuOpen = ref(false)
const { data: cartItems } = useGetCart()
const { open: openCartDrawer } = useCartDrawer()

const totalQuantity = computed(() => cartItems.value?.reduce((sum, item) => sum + item.quantity, 0) ?? 0)

const navLinks = [
  { label: 'Experience', href: '#experience' },
  { label: 'Fonctionnalites', href: '#features' },
  { label: 'Catalogue', href: '/shop' },
  { label: 'Evenements', href: '#events' },
  { label: 'Contact', href: '#contact' },
]
</script>

<template>
  <nav class="sticky top-0 z-50 border-b border-slate-700/50 bg-[#0F172AEE] backdrop-blur-xl">
    <div class="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 lg:px-20">
      <RouterLink to="/" class="text-2xl font-extrabold tracking-[2px] text-slate-50">
        PULSE
      </RouterLink>

      <div class="hidden items-center gap-8 lg:flex">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          {{ link.label }}
        </a>
      </div>

      <div class="hidden items-center gap-3 lg:flex">
        <button
          v-if="totalQuantity > 0"
          class="relative rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          @click="openCartDrawer"
        >
          <ShoppingCart class="h-5 w-5" />
          <span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pulse-violet text-[11px] font-bold text-white">
            {{ totalQuantity }}
          </span>
        </button>
        <RouterLink
          to="/login"
          class="rounded-md border border-slate-600 px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          Connexion
        </RouterLink>
        <RouterLink
          to="/shop"
          class="rounded-md bg-pulse-violet px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-pulse-violet-dark"
        >
          Commander
        </RouterLink>
      </div>

      <div class="flex items-center gap-3 lg:hidden">
        <button
          v-if="totalQuantity > 0"
          class="relative rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          @click="openCartDrawer"
        >
          <ShoppingCart class="h-5 w-5" />
          <span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pulse-violet text-[11px] font-bold text-white">
            {{ totalQuantity }}
          </span>
        </button>
        <button @click="mobileMenuOpen = !mobileMenuOpen">
          <Menu v-if="!mobileMenuOpen" class="h-6 w-6 text-slate-300" />
          <X v-else class="h-6 w-6 text-slate-300" />
        </button>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="border-t border-slate-700/50 bg-[#0F172A] px-6 py-4 lg:hidden">
      <div class="flex flex-col gap-4">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="text-sm font-medium text-slate-400"
          @click="mobileMenuOpen = false"
        >
          {{ link.label }}
        </a>
        <div class="flex flex-col gap-2 pt-4">
          <RouterLink to="/login" class="rounded-md border border-slate-600 px-6 py-2 text-center text-sm font-medium text-slate-300">
            Connexion
          </RouterLink>
          <RouterLink to="/shop" class="rounded-md bg-pulse-violet px-6 py-2 text-center text-sm font-medium text-white">
            Commander
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>
```

Key changes:
- Import `ShoppingCart` from lucide, `useGetCart`, `useCartDrawer`
- Compute `totalQuantity` from cart items
- Cart icon with badge visible only when `totalQuantity > 0` (desktop + mobile)
- Click calls `openCartDrawer()`

- [ ] **Step 2: Commit**

```bash
git add client/src/components/layout/app-nav.vue
git commit -m "feat(client): add cart icon + badge to header, opens cart drawer"
```

---

## Task 8: Wire Product Card "Ajouter" Button

**Files:**
- Modify: `client/src/modules/product/ui/components/product-card.vue`

- [ ] **Step 1: Update product-card.vue**

Replace the entire file with:

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ShoppingCart } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'
import { useAddToCart } from '@/modules/cart/ui/hooks/queries/mutation/use-add-to-cart'

const props = defineProps<{
  product: ProductDomainModel.ProductOverviewDto
}>()

const addToCart = useAddToCart()

function handleAddToCart() {
  addToCart.mutate(
    { productId: props.product.id, quantity: 1 },
    {
      onSuccess: () => {
        toast.success('Article ajoute au panier')
      },
      onError: (error) => {
        toast.error(error.message)
      },
    },
  )
}
</script>

<template>
  <RouterLink
    :to="`/product/${product.slug}`"
    class="group flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-b from-pulse-surface to-pulse-bg shadow-[0_8px_30px_rgba(124,58,237,0.08)] transition-all hover:border-violet-500/30 hover:shadow-[0_8px_30px_rgba(124,58,237,0.2)]"
  >
    <!-- Image -->
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-pulse-surface to-pulse-bg">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div v-else class="flex h-full items-center justify-center">
        <span class="text-5xl">&#127915;</span>
      </div>

      <!-- Featured badge -->
      <div
        v-if="product.featured"
        class="absolute left-3 top-3 rounded-full bg-violet-600/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Populaire
      </div>

      <!-- Stock indicator -->
      <div
        v-if="product.stock <= 5 && product.stock > 0"
        class="absolute right-3 top-3 rounded-full bg-orange-500/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Plus que {{ product.stock }}
      </div>
      <div
        v-else-if="product.stock === 0"
        class="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Rupture
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col gap-3 p-5">
      <h3 class="text-lg font-semibold text-slate-50 transition-colors group-hover:text-violet-300">
        {{ product.name }}
      </h3>

      <p class="line-clamp-2 text-sm leading-relaxed text-slate-400">
        {{ product.description }}
      </p>

      <div class="mt-auto flex items-center justify-between pt-2">
        <span class="text-2xl font-extrabold text-violet-400">
          {{ product.price.toFixed(2) }}&#8364;
        </span>

        <button
          class="flex items-center gap-2 rounded-lg bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-600/30 disabled:opacity-40"
          :disabled="product.stock === 0 || addToCart.isPending.value"
          @click.prevent="handleAddToCart"
        >
          <ShoppingCart class="h-4 w-4" />
          Ajouter
        </button>
      </div>
    </div>
  </RouterLink>
</template>
```

Key changes:
- Import `toast` from vue-sonner, `useAddToCart`
- `handleAddToCart()` calls mutation with `{ productId, quantity: 1 }`
- Toast on success/error
- Button disabled while pending or stock === 0
- `@click.prevent` calls `handleAddToCart` (prevents RouterLink navigation)

- [ ] **Step 2: Commit**

```bash
git add client/src/modules/product/ui/components/product-card.vue
git commit -m "feat(client): wire product card 'Ajouter' button to add-to-cart mutation with toast"
```

---

## Task 9: Orders Page (component + feature + page + route)

**Files:**
- Create: `client/src/modules/order/ui/components/order-list.vue`
- Create: `client/src/features/public/orders/orders.page.vue`
- Create: `client/src/pages/orders/page.vue`
- Modify: `client/src/main.ts`

- [ ] **Step 1: Create order-list.vue**

```vue
<!-- client/src/modules/order/ui/components/order-list.vue -->
<script setup lang="ts">
import { Package } from 'lucide-vue-next'
import type { OrderDomainModel } from '@/modules/order/core/model/order.domain-model'
import type { OrderStatus } from '@/modules/order/core/model/order.domain-model'

defineProps<{
  orders: OrderDomainModel.OrderOverviewDto[]
}>()

const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  pending: { label: 'En attente', class: 'bg-yellow-500/20 text-yellow-400' },
  confirmed: { label: 'Confirmee', class: 'bg-blue-500/20 text-blue-400' },
  shipped: { label: 'Expediee', class: 'bg-violet-500/20 text-violet-400' },
  delivered: { label: 'Livree', class: 'bg-emerald-500/20 text-emerald-400' },
  cancelled: { label: 'Annulee', class: 'bg-red-500/20 text-red-400' },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function totalItems(order: OrderDomainModel.OrderOverviewDto): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="order in orders"
      :key="order.id"
      class="rounded-xl border border-slate-700/50 bg-pulse-surface p-5"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20">
            <Package class="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-50">{{ totalItems(order) }} article{{ totalItems(order) > 1 ? 's' : '' }}</p>
            <p class="text-xs text-slate-400">{{ formatDate(order.createdAt) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusConfig[order.status].class]">
            {{ statusConfig[order.status].label }}
          </span>
          <span class="text-lg font-bold text-slate-50">{{ order.totalAmount.toFixed(2) }}&#8364;</span>
        </div>
      </div>
      <div class="mt-3 border-t border-slate-700/30 pt-3">
        <div v-for="item in order.items" :key="item.productId" class="flex justify-between py-1 text-sm">
          <span class="text-slate-400">{{ item.productName }} x{{ item.quantity }}</span>
          <span class="text-slate-300">{{ (item.unitPrice * item.quantity).toFixed(2) }}&#8364;</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create orders.page.vue (feature orchestrator)**

```vue
<!-- client/src/features/public/orders/orders.page.vue -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Loader2, ShoppingBag } from 'lucide-vue-next'
import OrderList from '@/modules/order/ui/components/order-list.vue'
import { useGetMyOrders } from '@/modules/order/ui/hooks/queries/query/use-get-my-orders'

const { data: orders, isLoading, isError } = useGetMyOrders()
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-16 lg:px-20">
    <h1 class="mb-8 text-3xl font-extrabold text-slate-50">Mes commandes</h1>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="h-8 w-8 animate-spin text-violet-400" />
    </div>

    <div v-else-if="isError" class="flex flex-col items-center justify-center gap-4 py-20">
      <p class="text-sm text-red-400">Erreur lors du chargement des commandes</p>
    </div>

    <div v-else-if="!orders?.length" class="flex flex-col items-center justify-center gap-4 py-20">
      <ShoppingBag class="h-12 w-12 text-slate-600" />
      <p class="text-sm text-slate-400">Aucune commande pour le moment</p>
      <RouterLink to="/shop" class="rounded-md bg-pulse-violet px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-pulse-violet-dark">
        Decouvrir le catalogue
      </RouterLink>
    </div>

    <OrderList v-else :orders="orders" />
  </section>
</template>
```

- [ ] **Step 3: Create page shell**

```vue
<!-- client/src/pages/orders/page.vue -->
<script setup lang="ts">
import OrdersPage from '@/features/public/orders/orders.page.vue'
</script>

<template>
  <OrdersPage />
</template>
```

- [ ] **Step 4: Add route to main.ts**

Add this route in the routes array, after the `register` route:

```typescript
    { path: '/orders', name: 'orders', component: () => import('./pages/orders/page.vue') },
```

- [ ] **Step 5: Verify TS compiles + build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client
./node_modules/.bin/vue-tsc --noEmit && ./node_modules/.bin/vite build 2>&1 | tail -5
```

- [ ] **Step 6: Commit**

```bash
git add client/src/modules/order/ui/components/ client/src/features/public/orders/ client/src/pages/orders/ client/src/main.ts
git commit -m "feat(client): add orders page — order list component, feature page, route /orders"
```
