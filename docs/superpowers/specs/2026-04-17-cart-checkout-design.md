# Cart Flow + Checkout + Mes Commandes — Design Spec

## Goal

Allow users to add products to a cart, view/manage the cart via a slide-in drawer, place an order (no real payment), and see their order history on a `/orders` page.

## Scope

- Install shadcn-vue, components in `src/ui/`
- Frontend cart + order core modules (ports, adapters, hooks)
- Cart icon + badge in header (visible only when cart has items)
- Cart drawer (desktop + mobile, matching .pen designs, no promo code section)
- Wire "Ajouter" button on product card
- "Paiement securise" creates order with hardcoded address, toast, redirect `/orders`
- Basic `/orders` page listing user's orders

## Out of Scope

- Real payment / Stripe integration
- Shipping address form
- Promo code
- Admin order management pages
- Refactoring existing components to shadcn

---

## 1. shadcn-vue Installation

Install shadcn-vue into the project. Generic UI components go in `src/ui/` (not in modules).

Components needed for this feature:

- **Sheet** (for cart drawer slide-in)
- **Button**
- **Badge**
- **Sonner/Toast** (for notifications)

The `cn()` utility (clsx + tailwind-merge) goes in `src/ui/lib/utils.ts`.

---

## 2. Frontend Core Modules

### 2.1 Cart Module

**Path:** `client/src/modules/cart/`

**Domain model** (`core/model/cart.domain-model.ts`):

```
namespace CartDomainModel {
  CartItemOverviewDto {
    id: string
    productId: string
    variantName: string | null
    quantity: number
    createdAt: string
  }
  AddToCartDto {
    productId: string
    quantity: number
    variantName?: string
  }
  UpdateCartItemDto {
    quantity: number
  }
}
```

**Port** (`core/ports/cart.port.ts`):

```
ICartPort {
  getCart(): Promise<CartItemOverviewDto[]>
  addToCart(dto: AddToCartDto): Promise<CartItemOverviewDto>
  updateItem(id: string, dto: UpdateCartItemDto): Promise<CartItemOverviewDto>
  removeItem(id: string): Promise<void>
  clearCart(): Promise<void>
}
```

**Adapter** (`core/adapters/cart.adapter.http.ts`):

- GET `/cart` → CartItemOverviewDto[]
- POST `/cart/items` + body → CartItemOverviewDto (201)
- PATCH `/cart/items/:id` + body → CartItemOverviewDto
- DELETE `/cart/items/:id` → void
- DELETE `/cart` → void

**Hooks:**

- `ui/hooks/queries/query/use-get-cart.ts` — queryKey: `['cart']`
- `ui/hooks/queries/mutation/use-add-to-cart.ts` — invalidates `['cart']`
- `ui/hooks/queries/mutation/use-update-cart-item.ts` — invalidates `['cart']`
- `ui/hooks/queries/mutation/use-remove-cart-item.ts` — invalidates `['cart']`
- `ui/hooks/queries/mutation/use-clear-cart.ts` — invalidates `['cart']`

### 2.2 Order Module

**Path:** `client/src/modules/order/`

**Domain model** (`core/model/order.domain-model.ts`):

```
const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

namespace OrderDomainModel {
  OrderItemDto {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }
  OrderOverviewDto {
    id: string
    userId: string
    items: OrderItemDto[]
    totalAmount: number
    status: OrderStatus
    shippingAddress: string
    createdAt: string
  }
  CreateOrderDto {
    shippingAddress: string
  }
}
```

**Port** (`core/ports/order.port.ts`):

```
IOrderPort {
  create(dto: CreateOrderDto): Promise<OrderOverviewDto>
  getMyOrders(): Promise<OrderOverviewDto[]>
  getById(id: string): Promise<OrderOverviewDto>
}
```

**Adapter** (`core/adapters/order.adapter.http.ts`):

- POST `/orders` + body → OrderOverviewDto (201)
- GET `/orders` → OrderOverviewDto[]
- GET `/orders/:id` → OrderOverviewDto

**Hooks:**

- `ui/hooks/queries/query/use-get-my-orders.ts` — queryKey: `['orders']`
- `ui/hooks/queries/query/use-get-order-by-id.ts` — queryKey: `['orders', id]`, Ref<string>, enabled guard
- `ui/hooks/queries/mutation/use-create-order.ts` — invalidates `['cart']` + `['orders']`

### 2.3 Dependencies Wiring

Add to `dependencies.ts`:

- `cartPort: ICartPort` → `CartHttpAdapter(httpClient)`
- `orderPort: IOrderPort` → `OrderHttpAdapter(httpClient)`

---

## 3. UI Components

### 3.1 Product Card — "Ajouter" Button

**File:** `client/src/modules/product/ui/components/product-card.vue` (modify)

- Wire existing "Ajouter" button to `useAddToCart()` mutation
- On click: call `addToCart({ productId: product.id, quantity: 1 })`
- On success: show toast "Article ajoute au panier"
- Disable button while mutation is pending (loading state)

### 3.2 Header Cart Icon

**File:** `client/src/components/layout/app-nav.vue` (modify)

- Add ShoppingCart icon (lucide) next to auth buttons
- Show a violet badge with total quantity (sum of all item quantities)
- **Only visible** when cart has >= 1 item
- Click opens the cart drawer
- Uses `useGetCart()` to get cart state
- The cart icon must be visible on both desktop and mobile nav

### 3.3 Cart Drawer

Based on .pen frames "Cart Drawer - Desktop" and "Cart Drawer - Mobile".

**Component:** `client/src/modules/cart/ui/components/cart-drawer.vue`

Uses shadcn Sheet component (side="right").

**Structure:**

1. **Header** — "Votre panier" (Inter 700, 20px) + badge violet with item count + X close button
2. **Free shipping banner** — green bg (#22C55E10), truck icon, "Livraison gratuite a partir de 500EUR" (Inter 500, 13px, green)
3. **Cart items list** (scrollable) — each item is a `cart-item-row`
4. **Order summary** — Sous-total (N articles) + prix, Livraison: Gratuite (green), divider, Total (Inter 700, 18px) + prix gradient violet→pink (Inter 800, 24px)
5. **CTA section** — "Paiement securise" button (gradient violet→pink, lock icon, Inter 700, 15px, rounded-[10px]) + "Continuer mes achats" link (brand-light, Inter 500, 13px)

**Cart item row sub-component:** `client/src/modules/cart/ui/components/cart-item-row.vue`

- Image (80x80 desktop, 72x72 mobile, rounded-[10px])
- Product name (Inter 600, 14px) + trash icon (16px, text-secondary)
- Product description (Inter 400, 12px, text-secondary)
- Price (brand-light, Inter 700, 16px) + quantity control (rounded-[6px], surface-card bg, border, 32x32 buttons with -/+, value in center)

**Enrichment:** Cart items only contain `productId`. The drawer fetches products via `useGetProducts()` and joins by productId to display name, image, price, description.

**Mobile behavior:**

- Full-width sheet from bottom (or right, following shadcn Sheet)
- Handle bar at top (4px height, 40px width, rounded, border color, centered)
- Same content structure, slightly smaller images (72x72)

**Desktop behavior:**

- 440px panel from right
- Overlay with semi-transparent dark background
- Shadow on left side

### 3.4 Cart Drawer Integration

The cart drawer is rendered in `App.vue` (or the layout component) so it's accessible from any page. The open/close state is managed via a simple ref or a `use-cart-drawer.ts` hook.

---

## 4. Orders Page

### 4.1 Order List Component

**File:** `client/src/modules/order/ui/components/order-list.vue`

Pure component. Props: `orders: OrderOverviewDto[]`.

Displays a list/cards of orders:

- Order date (formatted)
- Number of articles (sum of quantities)
- Total amount
- Status badge (colored by status: pending=yellow, confirmed=blue, shipped=violet, delivered=green, cancelled=red)

### 4.2 Orders Feature Page

**File:** `client/src/features/public/orders/orders.page.vue`

Orchestrator:

- Uses `useGetMyOrders()` hook
- Handles loading/error/empty states
- Renders `order-list` component
- Empty state: "Aucune commande" message with link to shop

### 4.3 Orders Page Shell

**File:** `client/src/pages/orders/page.vue`

Coquille vide importing the feature page.

### 4.4 Route

Add to `main.ts`: `{ path: '/orders', name: 'orders', component: () => import('./pages/orders/page.vue') }`

---

## 5. Checkout Flow

When user clicks "Paiement securise":

1. Call `useCreateOrder()` with `{ shippingAddress: 'Non renseigne' }`
2. Backend CreateOrderUseCase:
   - Fetches cart items
   - Fetches product details for each item
   - Creates order with calculated total
   - Clears user's cart
   - Triggers bracelet creation callback if order is confirmed
3. On success:
   - Toast: "Commande validee !"
   - Close drawer
   - Redirect to `/orders` via `router.push('/orders')`
4. On error:
   - Toast error with message from API

---

## 6. Color Tokens Reference (from .pen)

| Token                          | Usage                     |
| ------------------------------ | ------------------------- |
| `$--pulse-text-primary`        | Main text                 |
| `$--pulse-text-secondary`      | Secondary text, icons     |
| `$--pulse-brand`               | Badge bg (violet)         |
| `$--pulse-brand-light`         | Prices, links             |
| `$--pulse-surface-card`        | Quantity control bg       |
| `$--pulse-border`              | Borders, dividers         |
| `$--pulse-success` / `#22C55E` | Free shipping, "Gratuite" |
| `$--background`                | Drawer panel bg           |
| Gradient `#7C3AED → #EC4899`   | CTA button, total price   |

---

## 7. File Summary

**New files (~25):**

- shadcn setup: `src/ui/lib/utils.ts`, `src/ui/components/{sheet,button,badge}.vue` + sonner/toast
- Cart core: 3 (model, port, adapter) + 5 hooks = 8
- Order core: 3 (model, port, adapter) + 3 hooks = 6
- Cart UI: `cart-drawer.vue`, `cart-item-row.vue` = 2
- Cart hook: `use-cart-drawer.ts` = 1
- Order UI: `order-list.vue` = 1
- Feature: `orders.page.vue` = 1
- Page: `pages/orders/page.vue` = 1

**Modified files (4):**

- `dependencies.ts` — add cartPort + orderPort
- `product-card.vue` — wire "Ajouter" button
- `app-nav.vue` — add cart icon + badge + drawer trigger
- `main.ts` — add /orders route
