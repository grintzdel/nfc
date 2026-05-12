<script setup lang="ts">
import type { Component } from 'vue'
import {
  BarChart3,
  Bell,
  Calendar,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Mail,
  Map,
  Package,
  Plug,
  Radio,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  UsersRound,
  Watch,
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'

const route = useRoute()
const { getUserFromToken } = useAuth()

const user = getUserFromToken()

type NavItem = {
  label: string
  icon: Component
  to: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
      { label: 'Evenements', icon: Calendar, to: '/admin/events' },
      { label: 'Bracelets', icon: Watch, to: '#' },
      { label: 'Participants', icon: Users, to: '#' },
    ],
  },
  {
    title: 'E-commerce',
    items: [
      { label: 'Catalogue', icon: Package, to: '#' },
      { label: 'Commandes', icon: ShoppingBag, to: '#' },
      { label: 'Livraisons', icon: Truck, to: '#' },
      { label: 'Factures', icon: FileText, to: '#' },
    ],
  },
  {
    title: 'Analytique',
    items: [
      { label: 'Statistiques', icon: BarChart3, to: '#' },
      { label: 'Heatmap', icon: Map, to: '#' },
      { label: 'Rapports', icon: FileBarChart, to: '#' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { label: 'Campagnes email', icon: Mail, to: '#' },
      { label: 'Notifications', icon: Bell, to: '#' },
    ],
  },
  {
    title: 'Parametres',
    items: [
      { label: 'Equipe', icon: UsersRound, to: '#' },
      { label: 'Integrations', icon: Plug, to: '#' },
      { label: 'Parametres', icon: Settings, to: '#' },
    ],
  },
]
</script>

<template>
  <aside
    class="flex h-screen w-64 flex-shrink-0 flex-col border-r border-slate-700/50 bg-pulse-surface-dark"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-5">
      <span class="font-bold tracking-[1px] text-slate-50">PULSE</span>
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-violet">
        <Radio :size="18" class="text-white" />
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
            <RouterLink
              :to="item.to"
              class="flex items-center gap-3 px-2 py-1.5 text-sm"
              :class="
                route.path === item.to
                  ? 'rounded-md bg-slate-800 font-medium text-slate-50'
                  : 'rounded-md text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              "
            >
              <component :is="item.icon" class="h-4 w-4" />
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-slate-700/50 px-4 py-4">
      <p class="text-sm font-medium text-slate-50">Admin PULSE</p>
      <p v-if="user" class="truncate text-xs text-slate-500">{{ user.userId }}</p>
    </div>
  </aside>
</template>
