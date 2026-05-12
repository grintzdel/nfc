<script setup lang="ts">
import type { Component } from 'vue'
import { Calendar, LayoutDashboard, Package, Radio, ShoppingBag, Users, Watch, X } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'update:open', value: boolean): void }>()

const route = useRoute()
const { getUserFromToken } = useAuth()

const user = getUserFromToken()

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrateur',
  organizer: 'Organisateur',
  customer: 'Utilisateur',
}
const roleLabel = user ? (ROLE_LABEL[user.role] ?? user.role) : ''

type NavItem = {
  label: string
  icon: Component
  to?: string
  soon?: boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

// Only surface routes that actually exist. Items flagged as `soon` render
// disabled with a "Bientôt" pill so the surface stays informative without
// being a trap.
// Team management is per-event — surfaced as the "Équipe" tab inside /admin/events/:eventId,
// not as a global sidebar entry.
const sections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
      { label: 'Événements', icon: Calendar, to: '/admin/events' },
      { label: 'Bracelets', icon: Watch, to: '/admin/bracelets' },
      { label: 'Participants', icon: Users, to: '/admin/participants' },
    ],
  },
  {
    title: 'E-commerce',
    items: [
      { label: 'Catalogue', icon: Package, to: '/admin/products' },
      { label: 'Commandes', icon: ShoppingBag, to: '/admin/orders' },
    ],
  },
]
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
    aria-hidden="true"
    @click="emit('update:open', false)"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-shrink-0 transform flex-col border-r border-slate-700/50 bg-pulse-surface-dark transition-transform duration-200 ease-out lg:static lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-5">
      <span class="font-bold tracking-[1px] text-slate-50">PULSE</span>
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-violet">
          <Radio :size="18" class="text-white" />
        </div>
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-100 lg:hidden"
          aria-label="Fermer le menu"
          @click="emit('update:open', false)"
        >
          <X :size="18" />
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 pb-4">
      <div v-for="section in sections" :key="section.title" class="mb-5">
        <p class="mb-1.5 px-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          {{ section.title }}
        </p>
        <ul>
          <li v-for="item in section.items" :key="item.label">
            <!-- Active route -->
            <RouterLink
              v-if="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-2 py-1.5 text-sm"
              :class="
                route.path === item.to
                  ? 'rounded-md bg-slate-800 font-medium text-slate-50'
                  : 'rounded-md text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              "
              @click="emit('update:open', false)"
            >
              <component :is="item.icon" class="h-4 w-4" />
              {{ item.label }}
            </RouterLink>

            <!-- Disabled / soon -->
            <div
              v-else
              class="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-slate-600"
              title="Bientôt disponible"
            >
              <component :is="item.icon" class="h-4 w-4" />
              <span class="flex-1">{{ item.label }}</span>
              <span class="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                Soon
              </span>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-slate-700/50 px-4 py-4">
      <p class="text-sm font-medium text-slate-50">Admin PULSE</p>
      <p v-if="user" class="text-xs text-slate-500">{{ roleLabel }}</p>
    </div>
  </aside>
</template>
