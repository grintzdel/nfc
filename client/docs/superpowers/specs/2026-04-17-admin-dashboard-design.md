# Admin Layout + Dashboard — Design Spec

## Goal

Implement the admin section of PULSE with a sidebar layout and a dashboard page showing key metrics, charts, next event info, and bracelet stock status. Admin routes are protected by an `isAdmin()` guard.

## Scope

- Admin layout: sidebar + header + content slot
- Dashboard page only (other admin pages will follow in separate specs)
- Route guard checking `isAdmin()` role from JWT

## File Structure

```
src/
├── ui/
│   ├── layout/
│   │   ├── admin-layout.vue        # Flex row: sidebar + vertical(header + slot)
│   │   ├── admin-sidebar.vue       # Fixed 256px sidebar with sections
│   │   └── admin-header.vue        # Top bar: title/subtitle + search + bell + avatar
│   └── components/
│       └── stat-card.vue           # Reusable stat card (icon, title, value, badge)
├── features/admin/
│   └── dashboard/
│       ├── dashboard.page.vue      # Orchestrator: queries + wires components
│       └── components/
│           ├── dashboard-stats.vue         # 4 stat cards row
│           ├── dashboard-activations-chart.vue  # Bar chart (Unovis)
│           ├── dashboard-interactions-chart.vue  # Donut chart (Unovis)
│           ├── dashboard-next-event.vue    # Next event card with KPIs + timeline
│           └── dashboard-stock.vue         # Stock card with gauge + details
├── pages/admin/
│   └── dashboard/
│       └── page.vue                # Shell: imports dashboard.page.vue
```

## Routing

### Routes in `main.ts`

```typescript
{ path: '/admin', redirect: '/admin/dashboard' },
{
  path: '/admin/dashboard',
  name: 'admin-dashboard',
  component: () => import('./pages/admin/dashboard/page.vue'),
  meta: { noLayout: true, requiresAdmin: true },
},
```

### Navigation Guard

In `main.ts`, add a `router.beforeEach` guard:

```typescript
router.beforeEach((to) => {
  if (to.meta.requiresAdmin) {
    const token = localStorage.getItem('token')
    if (!token) return '/login'
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') return '/login'
    } catch {
      return '/login'
    }
  }
})
```

Note: We don't use `useAuth()` in the guard because it requires `useRouter()` which isn't available outside setup. We inline the JWT check directly.

## Admin Layout

### `admin-layout.vue`

Full-screen flex row: sidebar (fixed 256px) + main area (flex-1, vertical: header + scrollable content).

- Background: `bg-[#0F172A]` (same dark theme as rest of app)
- No public header/footer (noLayout: true)
- Includes `<Toaster>` for toast notifications

### `admin-sidebar.vue`

Fixed width 256px, full height, dark surface (`bg-pulse-surface-dark`), right border `border-slate-700/50`.

**Header:**

- PULSE logo text (font-bold, tracking-[1px]) + Radio icon in purple circle (`bg-pulse-violet`)

**Content — 5 sections with items:**

| Section       | Items (icon → label → route)                               |
| ------------- | ---------------------------------------------------------- |
| Principal     | `layout-dashboard` Dashboard → `/admin/dashboard` (active) |
|               | `calendar` Evenements → `/admin/events` (disabled)         |
|               | `watch` Bracelets → `/admin/bracelets` (disabled)          |
|               | `users` Participants → `/admin/participants` (disabled)    |
| E-commerce    | `package` Catalogue → `/admin/catalog` (disabled)          |
|               | `shopping-bag` Commandes → `/admin/orders` (disabled)      |
|               | `truck` Livraisons → `/admin/deliveries` (disabled)        |
|               | `file-text` Factures → `/admin/invoices` (disabled)        |
| Analytique    | `chart-bar` Statistiques → `/admin/stats` (disabled)       |
|               | `map` Heatmap → `/admin/heatmap` (disabled)                |
|               | `file-bar-chart` Rapports → `/admin/reports` (disabled)    |
| Communication | `mail` Campagnes email → `/admin/emails` (disabled)        |
|               | `bell` Notifications → `/admin/notifications` (disabled)   |
| Parametres    | `users-round` Equipe → `/admin/team` (disabled)            |
|               | `plug` Integrations → `/admin/integrations` (disabled)     |
|               | `settings` Parametres → `/admin/settings` (disabled)       |

- Section titles: `text-xs font-medium text-slate-500 uppercase tracking-wide`
- Active item: `bg-slate-800 rounded-md` with white text
- Default item: `text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md`
- Disabled items: same default style but navigate to `#` (no page yet)
- Items have `padding: [6px, 8px]`, icon 16px + label text-sm

**Footer:**

- User info: "Admin PULSE" (font-medium text-slate-50) + "admin@pulse.io" (text-xs text-slate-500)
- Uses `useAuth().getUserFromToken()` to show actual user email if available

### `admin-header.vue`

Props: `title: string`, `subtitle?: string`

Top bar with bottom border (`border-slate-700/50`), padding `py-4 px-8`.

- Left: title (text-2xl font-bold text-slate-50) + subtitle (text-sm text-slate-400)
- Right: search input (240px, optional placeholder, decorative only for now) + bell icon button + avatar circle (36px, initials or placeholder)

## Dashboard Page

### `dashboard.page.vue` (Orchestrator)

Wraps content in `<AdminLayout>`. Passes `title="Dashboard"` and `subtitle="Vue d'ensemble de votre activite"` to the header.

Uses the following existing hooks (all already implemented):

- `useGetActiveEvents()` → stat card 1 (count + diffVsLastMonth)
- `useGetParticipantsCount()` → stat card 2 (count + rateVsLastMonth)
- `useGetBraceletsCount()` → stat card 3 (count + rateVsLastMonth)
- `useGetRevenue()` → stat card 4 (revenue + rateVsLastMonth)
- `useGetActivations()` → bar chart
- `useGetInteractions()` → donut chart
- `useGetNextEvent()` → next event card
- `useGetStock()` → stock card

### `stat-card.vue` (Generic, in `src/ui/components/`)

Props:

- `icon`: Lucide icon component
- `iconColor`: string (hex color for icon and circle background)
- `title`: string
- `value`: string (pre-formatted)
- `badge`: string (e.g. "+3 vs mois dernier")
- `badgeVariant`: `'positive' | 'negative'`

Design: rounded-lg card with `bg-[#0F172A] border border-white/10`. Icon in 40px colored circle (20% opacity bg), title in slate-400, value in 28px bold, badge pill in green/red.

### `dashboard-stats.vue`

Props: the 4 query results (activeEvents, participantsCount, braceletsCount, revenue). Renders 4 `stat-card` in a flex row with gap-4.

### `dashboard-activations-chart.vue`

Props: `data: AnalyticsDomainModel.ActivationsByYearDto | undefined`

Bar chart card using Unovis (`@unovis/vue`):

- `VisXYContainer` + `VisStackedBar` + `VisAxis`
- Purple bars (`#8b5cf6`), month labels on x-axis
- Card wrapper: same dark card style as stat cards
- Title: "Activations bracelets NFC" (text-base font-semibold)

### `dashboard-interactions-chart.vue`

Props: `data: AnalyticsDomainModel.InteractionsStatsDto | undefined`

Donut chart card using Unovis:

- `VisSingleContainer` + `VisDonut`
- Colors: Check-in `#7C3AED`, Reseau `#F97316`, Votes `#3B82F6`, Cashless `#22C55E`
- Center label: top percentage + type name
- Legend below: colored dots + labels + percentages
- Card width: fixed 380px
- Title: "Type d'interactions NFC"

### `dashboard-next-event.vue`

Props: `data: AnalyticsDomainModel.NextEventStatsDto | undefined`

Card with:

- Header: "Prochain evenement" label + event name + countdown pill ("J-X")
- KPI row: 4 mini cards (bracelets commandes, livres, pre-actives, taux remplissage)
- Meta info: lieu, horaires, staff (hardcoded labels from design since backend doesn't provide these yet — display only if data exists)
- Timeline: 3 rows with icons (hardcoded structure from design)
- CTA button: "Ouvrir le centre de controle" (decorative, no action)

Note: Some fields (lieu, horaires, staff, timeline) are not in the current `NextEventStatsDto`. These will be displayed as static placeholder content matching the .pen design. When the backend adds these fields later, we switch to dynamic data.

### `dashboard-stock.vue`

Props: `data: AnalyticsDomainModel.BraceletStockStatsDto | undefined`

Card with:

- Header: "Stock bracelets" + "Inventaire global" + alert badge if `level === 'low'`
- Main: current count / maxCapacity, percentage, progress bar (orange if low, purple otherwise)
- Threshold row: "0" — "Seuil · 500" — "2,000" (labels)
- Details: pending order info (units + estimated delivery date) from `pendingOrder`
- CTA: "Commander des packs" (decorative, no action)

## Charts Setup

Install Unovis + shadcn chart component:

```bash
pnpm add @unovis/ts @unovis/vue
pnpm dlx shadcn-vue@latest add chart
```

## Dependencies

All data hooks already exist in `src/modules/analytics/ui/hooks/queries/query/`. No new ports, adapters, or backend work needed.

Lucide icons needed (all already available via `lucide-vue-next`):

- Sidebar: LayoutDashboard, Calendar, Watch, Users, Package, ShoppingBag, Truck, FileText, BarChart3, Map, FileBarChart, Mail, Bell, UsersRound, Plug, Settings, Radio
- Dashboard: Calendar, Users, Watch, TrendingUp, Search, Bell, TriangleAlert, MapPin, Timer, Package, CircleCheck, MonitorPlay, CalendarClock, Ticket, Sparkles, Plus
