<script setup lang="ts">
import type { Component } from 'vue'
import { Calendar, LayoutDashboard, Radio, Users, UsersRound, Watch } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'

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
const sections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
      { label: 'Événements', icon: Calendar, to: '/admin/events' },
      { label: 'Bracelets', icon: Watch, soon: true },
      { label: 'Participants', icon: Users, soon: true },
    ],
  },
  {
    title: 'Paramètres',
    items: [
      { label: 'Équipe', icon: UsersRound, soon: true },
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
