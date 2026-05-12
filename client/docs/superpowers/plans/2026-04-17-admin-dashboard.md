# Admin Layout + Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an admin layout (sidebar + header) and dashboard page displaying analytics stats, charts, next event info, and bracelet stock status.

**Architecture:** Admin routes use `meta: { noLayout: true, requiresAdmin: true }` to bypass the public layout. A `router.beforeEach` guard checks the JWT role. The admin layout is a flex row: fixed sidebar (256px) + vertical main area (header + scrollable content). Dashboard page uses existing analytics hooks to fetch data and renders it through pure presentation components.

**Tech Stack:** Vue 3, Vue Router, TanStack Vue Query, Unovis (`@unovis/ts` + `@unovis/vue`), Lucide icons, Tailwind CSS

---

## File Map

| File | Responsibility |
|------|---------------|
| **Create:** `src/ui/layout/admin-layout.vue` | Flex row: sidebar + vertical(header + slot) + Toaster |
| **Create:** `src/ui/layout/admin-sidebar.vue` | Fixed 256px sidebar with 5 sections, nav items, user footer |
| **Create:** `src/ui/layout/admin-header.vue` | Top bar: title/subtitle + search + bell + avatar |
| **Create:** `src/ui/components/stat-card.vue` | Reusable stat card (icon, title, value, badge) |
| **Create:** `src/features/admin/dashboard/components/dashboard-stats.vue` | 4 stat cards row |
| **Create:** `src/features/admin/dashboard/components/dashboard-activations-chart.vue` | Bar chart with Unovis |
| **Create:** `src/features/admin/dashboard/components/dashboard-interactions-chart.vue` | Donut chart with Unovis |
| **Create:** `src/features/admin/dashboard/components/dashboard-next-event.vue` | Next event card with KPIs + timeline |
| **Create:** `src/features/admin/dashboard/components/dashboard-stock.vue` | Stock card with gauge + details |
| **Create:** `src/features/admin/dashboard/dashboard.page.vue` | Orchestrator: queries + wires components |
| **Create:** `src/pages/admin/dashboard/page.vue` | Shell page |
| **Modify:** `src/main.ts` | Add admin routes + beforeEach guard |
| **Modify:** `tailwind.config.js` | Add `pulse-surface-dark` color |

---

### Task 1: Install Unovis + add Tailwind color

**Files:**
- Modify: `package.json` (via pnpm add)
- Modify: `tailwind.config.js:9`

- [ ] **Step 1: Install Unovis packages**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm add @unovis/ts @unovis/vue
```

- [ ] **Step 2: Add `pulse-surface-dark` color to Tailwind config**

In `tailwind.config.js`, inside `colors.pulse`, add the `surface-dark` key after line 11 (`surface: '#1E293B'`):

```javascript
'surface-dark': '#0B1120',
```

The pulse object becomes:

```javascript
pulse: {
  bg: '#0F172A',
  surface: '#1E293B',
  'surface-dark': '#0B1120',
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
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml tailwind.config.js
git commit -m "feat(admin): install unovis + add pulse-surface-dark color"
```

---

### Task 2: Admin Sidebar

**Files:**
- Create: `src/ui/layout/admin-sidebar.vue`

- [ ] **Step 1: Create the sidebar component**

Create `src/ui/layout/admin-sidebar.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  Radio,
  LayoutDashboard,
  Calendar,
  Watch,
  Users,
  Package,
  ShoppingBag,
  Truck,
  FileText,
  BarChart3,
  Map,
  FileBarChart,
  Mail,
  Bell,
  UsersRound,
  Plug,
  Settings,
} from 'lucide-vue-next'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'

const route = useRoute()
const { getUserFromToken } = useAuth()

const user = computed(() => getUserFromToken())

const sections = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
      { label: 'Evenements', icon: Calendar, to: '#' },
      { label: 'Bracelets', icon: Watch, to: '#' },
      { label: 'Participants', icon: Users, to: '#' },
    ],
  },
  {
    label: 'E-commerce',
    items: [
      { label: 'Catalogue', icon: Package, to: '#' },
      { label: 'Commandes', icon: ShoppingBag, to: '#' },
      { label: 'Livraisons', icon: Truck, to: '#' },
      { label: 'Factures', icon: FileText, to: '#' },
    ],
  },
  {
    label: 'Analytique',
    items: [
      { label: 'Statistiques', icon: BarChart3, to: '#' },
      { label: 'Heatmap', icon: Map, to: '#' },
      { label: 'Rapports', icon: FileBarChart, to: '#' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Campagnes email', icon: Mail, to: '#' },
      { label: 'Notifications', icon: Bell, to: '#' },
    ],
  },
  {
    label: 'Parametres',
    items: [
      { label: 'Equipe', icon: UsersRound, to: '#' },
      { label: 'Integrations', icon: Plug, to: '#' },
      { label: 'Parametres', icon: Settings, to: '#' },
    ],
  },
]

function isActive(to: string): boolean {
  return route.path === to
}
</script>

<template>
  <aside class="flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-700/50 bg-pulse-surface-dark">
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-5">
      <div class="flex h-8 w-8 items-center justify-center rounded-md bg-pulse-violet">
        <Radio class="h-[18px] w-[18px] text-white" />
      </div>
      <span class="text-sm font-bold tracking-[1px] text-slate-50">PULSE</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-2">
      <div v-for="section in sections" :key="section.label" class="mb-4">
        <p class="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          {{ section.label }}
        </p>
        <RouterLink
          v-for="item in section.items"
          :key="item.label"
          :to="item.to"
          class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors"
          :class="
            isActive(item.to)
              ? 'bg-slate-800 font-medium text-slate-50'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          "
        >
          <component :is="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-slate-700/50 px-4 py-3">
      <p class="text-sm font-medium text-slate-50">Admin PULSE</p>
      <p class="text-xs text-slate-500">{{ user?.userId ?? 'admin@pulse.io' }}</p>
    </div>
  </aside>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ui/layout/admin-sidebar.vue
git commit -m "feat(admin): add admin sidebar component"
```

---

### Task 3: Admin Header

**Files:**
- Create: `src/ui/layout/admin-header.vue`

- [ ] **Step 1: Create the header component**

Create `src/ui/layout/admin-header.vue`:

```vue
<script setup lang="ts">
import { Search, Bell } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="flex items-center justify-between border-b border-slate-700/50 bg-[#0F172A] px-8 py-4">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-slate-50">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-slate-400">{{ subtitle }}</p>
    </div>

    <div class="flex items-center gap-3">
      <div class="flex w-60 items-center gap-2 rounded-md border border-slate-700/50 bg-[#020617] px-3 py-2">
        <Search class="h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher..."
          class="w-full bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      <button class="rounded-md border border-white/10 bg-[#020617] p-2 text-slate-400 transition-colors hover:text-slate-200">
        <Bell class="h-4 w-4" />
      </button>

      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700/50">
        <span class="text-xs font-medium text-slate-300">AP</span>
      </div>
    </div>
  </header>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ui/layout/admin-header.vue
git commit -m "feat(admin): add admin header component"
```

---

### Task 4: Admin Layout

**Files:**
- Create: `src/ui/layout/admin-layout.vue`

- [ ] **Step 1: Create the layout component**

Create `src/ui/layout/admin-layout.vue`:

```vue
<script setup lang="ts">
import AdminSidebar from './admin-sidebar.vue'
import AdminHeader from './admin-header.vue'
import { Toaster } from 'vue-sonner'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex h-screen bg-[#0F172A]">
    <AdminSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AdminHeader :title="title" :subtitle="subtitle" />
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
    <Toaster position="top-right" theme="dark" rich-colors />
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ui/layout/admin-layout.vue
git commit -m "feat(admin): add admin layout component"
```

---

### Task 5: Stat Card Component

**Files:**
- Create: `src/ui/components/stat-card.vue`

- [ ] **Step 1: Create the reusable stat card**

Create `src/ui/components/stat-card.vue`:

```vue
<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  iconColor: string
  title: string
  value: string
  badge?: string
  badgeVariant?: 'positive' | 'negative'
}>()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5">
    <div class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full"
        :style="{ backgroundColor: iconColor + '20' }"
      >
        <component :is="icon" class="h-5 w-5" :style="{ color: iconColor }" />
      </div>
      <span class="text-sm font-medium text-slate-400">{{ title }}</span>
    </div>
    <div class="flex flex-col gap-1.5">
      <span class="text-[28px] font-bold leading-tight text-slate-50">{{ value }}</span>
      <span
        v-if="badge"
        class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="
          badgeVariant === 'negative'
            ? 'bg-red-500/20 text-red-500'
            : 'bg-emerald-500/20 text-emerald-500'
        "
      >
        {{ badge }}
      </span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ui/components/stat-card.vue
git commit -m "feat(ui): add reusable stat-card component"
```

---

### Task 6: Dashboard Stats Section

**Files:**
- Create: `src/features/admin/dashboard/components/dashboard-stats.vue`

- [ ] **Step 1: Create the stats row component**

Create `src/features/admin/dashboard/components/dashboard-stats.vue`:

```vue
<script setup lang="ts">
import { Calendar, Users, Watch, TrendingUp } from 'lucide-vue-next'
import StatCard from '@/ui/components/stat-card.vue'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

defineProps<{
  activeEvents?: AnalyticsDomainModel.ActiveEventsStatsDto
  participantsCount?: AnalyticsDomainModel.CountWithRateDto
  braceletsCount?: AnalyticsDomainModel.CountWithRateDto
  revenue?: AnalyticsDomainModel.RevenueWithRateDto
}>()

function formatRate(rate: number | null | undefined, prefix: string = ''): string | undefined {
  if (rate == null) return undefined
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${prefix}${rate}% vs mois dernier`
}

function formatDiff(diff: number | undefined): string | undefined {
  if (diff == null) return undefined
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff} vs mois dernier`
}

function rateVariant(rate: number | null | undefined): 'positive' | 'negative' {
  if (rate == null || rate >= 0) return 'positive'
  return 'negative'
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      :icon="Calendar"
      icon-color="#7C3AED"
      title="Evenements actifs"
      :value="String(activeEvents?.count ?? '—')"
      :badge="formatDiff(activeEvents?.diffVsLastMonth)"
      :badge-variant="rateVariant(activeEvents?.diffVsLastMonth)"
    />
    <StatCard
      :icon="Users"
      icon-color="#3B82F6"
      title="Participants"
      :value="participantsCount?.count?.toLocaleString('fr-FR') ?? '—'"
      :badge="formatRate(participantsCount?.rateVsLastMonth)"
      :badge-variant="rateVariant(participantsCount?.rateVsLastMonth)"
    />
    <StatCard
      :icon="Watch"
      icon-color="#F97316"
      title="Bracelets NFC"
      :value="braceletsCount?.count?.toLocaleString('fr-FR') ?? '—'"
      :badge="formatRate(braceletsCount?.rateVsLastMonth)"
      :badge-variant="rateVariant(braceletsCount?.rateVsLastMonth)"
    />
    <StatCard
      :icon="TrendingUp"
      icon-color="#22C55E"
      title="Revenus"
      :value="revenue ? `€${revenue.revenue.toLocaleString('fr-FR')}` : '—'"
      :badge="formatRate(revenue?.rateVsLastMonth)"
      :badge-variant="rateVariant(revenue?.rateVsLastMonth)"
    />
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/dashboard/components/dashboard-stats.vue
git commit -m "feat(admin): add dashboard stats section"
```

---

### Task 7: Dashboard Activations Bar Chart

**Files:**
- Create: `src/features/admin/dashboard/components/dashboard-activations-chart.vue`

- [ ] **Step 1: Create the bar chart component**

Create `src/features/admin/dashboard/components/dashboard-activations-chart.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisStackedBar, VisAxis } from '@unovis/vue'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

const props = defineProps<{
  data?: AnalyticsDomainModel.ActivationsByYearDto
}>()

type BarDatum = { month: string; activations: number }

const chartData = computed<BarDatum[]>(() => {
  if (!props.data?.months) return []
  return props.data.months.map((m) => ({
    month: m.monthName,
    activations: m.activations,
  }))
})

const x = (_d: BarDatum, i: number) => i
const y = (d: BarDatum) => d.activations
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5">
    <h3 class="text-base font-semibold text-slate-50">Activations bracelets NFC</h3>

    <div v-if="chartData.length === 0" class="flex h-56 items-center justify-center">
      <p class="text-sm text-slate-500">Aucune donnee</p>
    </div>

    <div v-else class="h-56">
      <VisXYContainer :data="chartData" :height="224">
        <VisStackedBar :x="x" :y="y" color="#8b5cf6" :roundedCorners="4" :barPadding="0.3" />
        <VisAxis
          type="x"
          :tick-format="(_: number, i: number) => chartData[i]?.month ?? ''"
          :grid-line="false"
          tick-text-color="#94a3b8"
          :tick-text-font-size="12"
        />
      </VisXYContainer>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds. If there are type issues with Unovis props, adjust accordingly (Unovis API may use slightly different prop names).

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/dashboard/components/dashboard-activations-chart.vue
git commit -m "feat(admin): add dashboard activations bar chart"
```

---

### Task 8: Dashboard Interactions Donut Chart

**Files:**
- Create: `src/features/admin/dashboard/components/dashboard-interactions-chart.vue`

- [ ] **Step 1: Create the donut chart component**

Create `src/features/admin/dashboard/components/dashboard-interactions-chart.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { VisSingleContainer, VisDonut } from '@unovis/vue'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

const props = defineProps<{
  data?: AnalyticsDomainModel.InteractionsStatsDto
}>()

const InteractionColors = ['#7C3AED', '#F97316', '#3B82F6', '#22C55E'] as const

type DonutDatum = { label: string; value: number; percent: number }

const chartData = computed<DonutDatum[]>(() => {
  if (!props.data?.types) return []
  return props.data.types.map((t) => ({
    label: t.typeLabel,
    value: t.scansCount,
    percent: t.sharePercent,
  }))
})

const value = (d: DonutDatum) => d.value
const topLabel = computed(() => {
  if (!chartData.value.length) return ''
  return `${chartData.value[0].percent}%`
})
const bottomLabel = computed(() => {
  if (!chartData.value.length) return ''
  return chartData.value[0].label
})
</script>

<template>
  <div class="flex w-full flex-col gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5 xl:w-[380px]">
    <h3 class="text-base font-semibold text-slate-50">Type d'interactions NFC</h3>

    <div v-if="chartData.length === 0" class="flex h-36 items-center justify-center">
      <p class="text-sm text-slate-500">Aucune donnee</p>
    </div>

    <template v-else>
      <div class="flex justify-center">
        <div class="relative h-36 w-36">
          <VisSingleContainer :data="chartData" :height="144" :width="144">
            <VisDonut
              :value="value"
              :arcWidth="25"
              :padAngle="0.02"
              :color="(_: DonutDatum, i: number) => InteractionColors[i % InteractionColors.length]"
            />
          </VisSingleContainer>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-lg font-bold text-slate-50">{{ topLabel }}</span>
            <span class="text-[10px] font-medium text-pulse-violet-light">{{ bottomLabel }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div
          v-for="(item, index) in chartData"
          :key="item.label"
          class="flex items-center gap-2"
        >
          <span
            class="h-2 w-2 rounded-full"
            :style="{ backgroundColor: InteractionColors[index % InteractionColors.length] }"
          />
          <span class="flex-1 text-[13px] text-slate-50">{{ item.label }}</span>
          <span class="text-[13px] font-medium text-slate-400">{{ item.percent }}%</span>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/dashboard/components/dashboard-interactions-chart.vue
git commit -m "feat(admin): add dashboard interactions donut chart"
```

---

### Task 9: Dashboard Next Event Card

**Files:**
- Create: `src/features/admin/dashboard/components/dashboard-next-event.vue`

- [ ] **Step 1: Create the next event card**

Create `src/features/admin/dashboard/components/dashboard-next-event.vue`:

```vue
<script setup lang="ts">
import {
  Timer,
  Package,
  Truck,
  CircleCheck,
  Users,
  MapPin,
  Calendar,
  UsersRound,
  Ticket,
  Sparkles,
  MonitorPlay,
} from 'lucide-vue-next'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

defineProps<{
  data?: AnalyticsDomainModel.NextEventStatsDto
}>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <div class="flex flex-col gap-4 overflow-hidden rounded-lg border border-white/10 bg-[#0F172A] p-5">
    <div v-if="!data?.event" class="flex h-60 items-center justify-center">
      <p class="text-sm text-slate-500">Aucun evenement a venir</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Prochain evenement</span>
          <div class="flex items-center gap-3">
            <span class="text-lg font-bold text-slate-50">{{ data.event.name }}</span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-pulse-violet/30 bg-pulse-violet/15 px-2.5 py-0.5">
              <Timer class="h-3 w-3 text-pulse-violet-light" />
              <span class="text-xs font-semibold text-pulse-violet-light">
                J-{{ data.event.daysUntil }} · {{ formatDate(data.event.startsAt) }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div class="flex flex-col gap-1 rounded-md bg-slate-800 p-3">
          <span class="text-[11px] font-medium text-slate-400">Bracelets commandes</span>
          <div class="flex items-center gap-1.5">
            <Package class="h-3.5 w-3.5 text-pulse-violet-light" />
            <span class="text-lg font-bold text-slate-50">{{ data.event.braceletsOrdered.toLocaleString('fr-FR') }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-1 rounded-md bg-slate-800 p-3">
          <span class="text-[11px] font-medium text-slate-400">Livres</span>
          <div class="flex items-center gap-1.5">
            <Truck class="h-3.5 w-3.5 text-emerald-500" />
            <span class="text-lg font-bold text-slate-50">{{ data.event.braceletsOrdered.toLocaleString('fr-FR') }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-1 rounded-md bg-slate-800 p-3">
          <span class="text-[11px] font-medium text-slate-400">Pre-actives</span>
          <div class="flex items-center gap-1.5">
            <CircleCheck class="h-3.5 w-3.5 text-orange-500" />
            <span class="text-lg font-bold text-slate-50">{{ data.event.braceletsPreActivated.toLocaleString('fr-FR') }}</span>
          </div>
        </div>
        <div class="flex flex-col gap-1 rounded-md bg-slate-800 p-3">
          <span class="text-[11px] font-medium text-slate-400">Taux de remplissage</span>
          <div class="flex items-center gap-1.5">
            <Users class="h-3.5 w-3.5 text-pulse-violet-light" />
            <span class="text-lg font-bold text-slate-50">{{ data.event.fillRate }}%</span>
          </div>
        </div>
      </div>

      <!-- Meta Info -->
      <div class="flex items-center gap-6 rounded-md bg-slate-800 px-3.5 py-2.5">
        <div class="flex items-center gap-2">
          <MapPin class="h-3.5 w-3.5 text-pulse-violet-light" />
          <div class="flex flex-col">
            <span class="text-[10px] font-medium text-slate-400">Lieu</span>
            <span class="text-xs font-semibold text-slate-50">A definir</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Calendar class="h-3.5 w-3.5 text-pulse-violet-light" />
          <div class="flex flex-col">
            <span class="text-[10px] font-medium text-slate-400">Horaires</span>
            <span class="text-xs font-semibold text-slate-50">{{ formatDate(data.event.startsAt) }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UsersRound class="h-3.5 w-3.5 text-pulse-violet-light" />
          <div class="flex flex-col">
            <span class="text-[10px] font-medium text-slate-400">Staff affecte</span>
            <span class="text-xs font-semibold text-slate-50">—</span>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="flex flex-col gap-2.5 rounded-md bg-slate-800 p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Truck class="h-3.5 w-3.5 text-pulse-violet-light" />
            <span class="text-xs font-medium text-slate-400">Montage & installation</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ formatDate(data.event.startsAt) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Ticket class="h-3.5 w-3.5 text-pulse-violet-light" />
            <span class="text-xs font-medium text-slate-400">Ouverture billetterie</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ formatDate(data.event.startsAt) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Sparkles class="h-3.5 w-3.5 text-orange-500" />
            <span class="text-xs font-medium text-slate-400">Show principal</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ formatDate(data.event.startsAt) }}</span>
        </div>
      </div>

      <!-- CTA -->
      <button class="flex w-full items-center justify-center gap-2 rounded-md bg-pulse-violet px-3.5 py-2.5 text-[13px] font-semibold text-violet-50 transition-colors hover:bg-pulse-violet-dark">
        <MonitorPlay class="h-3.5 w-3.5" />
        Ouvrir le centre de controle
      </button>
    </template>
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/dashboard/components/dashboard-next-event.vue
git commit -m "feat(admin): add dashboard next event card"
```

---

### Task 10: Dashboard Stock Card

**Files:**
- Create: `src/features/admin/dashboard/components/dashboard-stock.vue`

- [ ] **Step 1: Create the stock card**

Create `src/features/admin/dashboard/components/dashboard-stock.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { TriangleAlert, Truck, CalendarClock, Plus } from 'lucide-vue-next'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

const props = defineProps<{
  data?: AnalyticsDomainModel.BraceletStockStatsDto
}>()

const barColor = computed(() => {
  if (!props.data) return '#8b5cf6'
  return props.data.level === 'low' ? '#F97316' : '#8b5cf6'
})

const barWidth = computed(() => {
  if (!props.data) return '0%'
  return `${props.data.fillPercent}%`
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="flex w-full flex-col justify-between gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5 xl:w-[380px]">
    <div v-if="!data" class="flex h-60 items-center justify-center">
      <p class="text-sm text-slate-500">Aucune donnee de stock</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-base font-semibold text-slate-50">Stock bracelets</span>
          <span class="text-xs text-slate-400">Inventaire global</span>
        </div>
        <span
          v-if="data.level === 'low'"
          class="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/15 px-2.5 py-1 text-[11px] font-semibold text-orange-500"
        >
          <TriangleAlert class="h-3 w-3" />
          Seuil bas
        </span>
      </div>

      <!-- Stock value -->
      <div class="flex flex-col gap-2">
        <div class="flex items-end justify-between">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-slate-400">Bracelets en stock</span>
            <div class="flex items-end gap-1.5">
              <span class="text-[28px] font-bold leading-tight text-slate-50">{{ data.current.toLocaleString('fr-FR') }}</span>
              <span class="pb-1 text-sm text-slate-400">/ {{ data.maxCapacity.toLocaleString('fr-FR') }}</span>
            </div>
          </div>
          <span class="text-[13px] font-semibold" :style="{ color: barColor }">{{ data.fillPercent }}%</span>
        </div>

        <!-- Progress bar -->
        <div class="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            class="h-full rounded-full transition-all"
            :style="{ width: barWidth, backgroundColor: barColor }"
          />
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-400">
          <span>0</span>
          <span class="font-medium text-pulse-violet-light">Seuil · 500</span>
          <span>{{ data.maxCapacity.toLocaleString('fr-FR') }}</span>
        </div>
      </div>

      <!-- Pending order details -->
      <div v-if="data.pendingOrder" class="flex flex-col gap-2 rounded-md bg-slate-800 p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Truck class="h-3.5 w-3.5 text-pulse-violet-light" />
            <span class="text-xs text-slate-400">Commande en cours</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ data.pendingOrder.units.toLocaleString('fr-FR') }} unites</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CalendarClock class="h-3.5 w-3.5 text-pulse-violet-light" />
            <span class="text-xs text-slate-400">Livraison estimee</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ formatDate(data.pendingOrder.estimatedDeliveryDate) }}</span>
        </div>
      </div>

      <!-- CTA -->
      <button class="flex w-full items-center justify-center gap-2 rounded-md bg-pulse-violet px-3.5 py-2.5 text-[13px] font-semibold text-violet-50 transition-colors hover:bg-pulse-violet-dark">
        <Plus class="h-3.5 w-3.5" />
        Commander des packs
      </button>
    </template>
  </div>
</template>
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/dashboard/components/dashboard-stock.vue
git commit -m "feat(admin): add dashboard stock card"
```

---

### Task 11: Dashboard Orchestrator + Shell Page

**Files:**
- Create: `src/features/admin/dashboard/dashboard.page.vue`
- Create: `src/pages/admin/dashboard/page.vue`

- [ ] **Step 1: Create the dashboard orchestrator page**

Create `src/features/admin/dashboard/dashboard.page.vue`:

```vue
<script setup lang="ts">
import AdminLayout from '@/ui/layout/admin-layout.vue'
import DashboardStats from './components/dashboard-stats.vue'
import DashboardActivationsChart from './components/dashboard-activations-chart.vue'
import DashboardInteractionsChart from './components/dashboard-interactions-chart.vue'
import DashboardNextEvent from './components/dashboard-next-event.vue'
import DashboardStock from './components/dashboard-stock.vue'
import { useGetActiveEvents } from '@/modules/analytics/ui/hooks/queries/query/use-get-active-events'
import { useGetParticipantsCount } from '@/modules/analytics/ui/hooks/queries/query/use-get-participants-count'
import { useGetBraceletsCount } from '@/modules/analytics/ui/hooks/queries/query/use-get-bracelets-count'
import { useGetRevenue } from '@/modules/analytics/ui/hooks/queries/query/use-get-revenue'
import { useGetActivations } from '@/modules/analytics/ui/hooks/queries/query/use-get-activations'
import { useGetInteractions } from '@/modules/analytics/ui/hooks/queries/query/use-get-interactions'
import { useGetNextEvent } from '@/modules/analytics/ui/hooks/queries/query/use-get-next-event'
import { useGetStock } from '@/modules/analytics/ui/hooks/queries/query/use-get-stock'

const { data: activeEvents } = useGetActiveEvents()
const { data: participantsCount } = useGetParticipantsCount()
const { data: braceletsCount } = useGetBraceletsCount()
const { data: revenue } = useGetRevenue()
const { data: activations } = useGetActivations()
const { data: interactions } = useGetInteractions()
const { data: nextEvent } = useGetNextEvent()
const { data: stock } = useGetStock()
</script>

<template>
  <AdminLayout title="Dashboard" subtitle="Vue d'ensemble de votre activite">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <!-- Stat cards -->
      <DashboardStats
        :active-events="activeEvents"
        :participants-count="participantsCount"
        :bracelets-count="braceletsCount"
        :revenue="revenue"
      />

      <!-- Charts -->
      <div class="flex flex-col gap-6 xl:flex-row">
        <DashboardActivationsChart :data="activations" class="flex-1" />
        <DashboardInteractionsChart :data="interactions" />
      </div>

      <!-- Operations -->
      <div class="flex flex-col gap-6 xl:flex-row">
        <DashboardNextEvent :data="nextEvent" class="flex-1" />
        <DashboardStock :data="stock" />
      </div>
    </div>
  </AdminLayout>
</template>
```

- [ ] **Step 2: Create the shell page**

Create `src/pages/admin/dashboard/page.vue`:

```vue
<script setup lang="ts">
import DashboardPage from '@/features/admin/dashboard/dashboard.page.vue'
</script>

<template>
  <DashboardPage />
</template>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/dashboard/dashboard.page.vue src/pages/admin/dashboard/page.vue
git commit -m "feat(admin): add dashboard orchestrator and shell page"
```

---

### Task 12: Admin Routes + Guard

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Add admin routes and guard to main.ts**

In `src/main.ts`, add the admin routes inside the `routes` array (after the `/orders` route, before the closing `]`):

```typescript
{ path: '/admin', redirect: '/admin/dashboard' },
{
  path: '/admin/dashboard',
  name: 'admin-dashboard',
  component: () => import('./pages/admin/dashboard/page.vue'),
  meta: { noLayout: true, requiresAdmin: true },
},
```

Then, after the `const router = createRouter({...})` block and before `const app = createApp(App)`, add the navigation guard:

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

The full `main.ts` should look like:

```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { createDependencies } from '@/modules/app/core/dependencies'
import { DEPENDENCIES_KEY } from '@/modules/app/ui/hooks/use-dependencies'
import './assets/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('./pages/home/page.vue') },
    { path: '/features', name: 'features', component: () => import('./pages/features/page.vue') },
    { path: '/about', name: 'about', component: () => import('./pages/about/page.vue') },
    { path: '/contact', name: 'contact', component: () => import('./pages/contact/page.vue') },
    { path: '/shop', name: 'shop', component: () => import('./pages/shop/page.vue') },
    { path: '/product/:slug', name: 'product', component: () => import('./pages/product-detail/page.vue') },
    { path: '/login', name: 'login', component: () => import('./pages/login/page.vue'), meta: { noLayout: true } },
    { path: '/register', name: 'register', component: () => import('./pages/register/page.vue'), meta: { noLayout: true } },
    { path: '/orders', name: 'orders', component: () => import('./pages/orders/page.vue') },
    { path: '/admin', redirect: '/admin/dashboard' },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('./pages/admin/dashboard/page.vue'),
      meta: { noLayout: true, requiresAdmin: true },
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

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

const app = createApp(App)
app.use(router)
app.use(VueQueryPlugin)
app.provide(DEPENDENCIES_KEY, createDependencies())
app.mount('#app')
```

- [ ] **Step 2: Verify build**

```bash
cd /Users/maoudin/Desktop/Developer/eemi/cours/nfc/client && pnpm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Manual test**

1. Start the dev server: `pnpm run dev`
2. Navigate to `http://localhost:5173/admin` — should redirect to `/login` if not logged in
3. Log in as admin, then navigate to `/admin` — should show the dashboard with sidebar + header + data loading
4. Log in as a non-admin user, navigate to `/admin` — should redirect to `/login`

- [ ] **Step 4: Commit**

```bash
git add src/main.ts
git commit -m "feat(admin): add admin routes with isAdmin guard"
```
