<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Menu, X, ShoppingCart, LogOut, User, Calendar } from 'lucide-vue-next'
import { useCart } from '@/modules/cart/ui/hooks/use-cart'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'

const mobileMenuOpen = ref(false)
const { totalQuantity, openCart: openCartDrawer } = useCart()
const { isAuthenticated, logout } = useAuth()

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
        <RouterLink
          v-if="!isAuthenticated()"
          to="/login"
          class="rounded-md border border-slate-600 px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          Connexion
        </RouterLink>
        <template v-else>
          <RouterLink
            to="/me/events"
            class="rounded-md p-2 text-slate-300 transition-colors hover:text-white"
            title="Mes événements"
          >
            <Calendar class="h-5 w-5" />
          </RouterLink>
          <RouterLink
            to="/orders"
            class="rounded-md p-2 text-slate-300 transition-colors hover:text-white"
            title="Mes commandes"
          >
            <User class="h-5 w-5" />
          </RouterLink>
        </template>
        <button
          class="relative rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          @click="openCartDrawer"
        >
          <ShoppingCart class="h-5 w-5" />
          <span
            v-if="totalQuantity > 0"
            class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pulse-violet text-[11px] font-bold text-white"
          >
            {{ totalQuantity }}
          </span>
        </button>
        <button
          v-if="isAuthenticated()"
          class="rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          @click="logout"
        >
          <LogOut class="h-5 w-5" />
        </button>
      </div>

      <div class="flex items-center gap-2 lg:hidden">
        <RouterLink
          v-if="isAuthenticated()"
          to="/me/events"
          class="rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          title="Mes événements"
        >
          <Calendar class="h-5 w-5" />
        </RouterLink>
        <RouterLink
          v-if="isAuthenticated()"
          to="/orders"
          class="rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          title="Mes commandes"
        >
          <User class="h-5 w-5" />
        </RouterLink>
        <button
          class="relative rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          @click="openCartDrawer"
        >
          <ShoppingCart class="h-5 w-5" />
          <span
            v-if="totalQuantity > 0"
            class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pulse-violet text-[11px] font-bold text-white"
          >
            {{ totalQuantity }}
          </span>
        </button>
        <button
          v-if="isAuthenticated()"
          class="rounded-md p-2 text-slate-300 transition-colors hover:text-white"
          @click="logout"
        >
          <LogOut class="h-5 w-5" />
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
        <div v-if="!isAuthenticated()" class="flex flex-col gap-2 pt-4">
          <RouterLink to="/login" class="rounded-md border border-slate-600 px-6 py-2 text-center text-sm font-medium text-slate-300">
            Connexion
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>
