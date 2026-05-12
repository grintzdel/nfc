<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Globe, Apple } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import { getSharedHttpClient } from '@/modules/shared/http/http-client'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'

const router = useRouter()
const { authPort } = useDependencies()
const { isAdmin } = useAuth()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  if (!email.value || !password.value) {
    toast.error('Veuillez remplir tous les champs')
    return
  }

  isLoading.value = true
  try {
    const response = await authPort.login({ email: email.value, password: password.value })
    localStorage.setItem('token', response.token)
    getSharedHttpClient().setAuthToken(response.token)
    toast.success('Connexion reussie !')
    router.push(isAdmin() ? '/admin/dashboard' : '/')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Erreur de connexion')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left Visual -->
    <div class="relative hidden w-1/2 overflow-hidden lg:block" style="background: linear-gradient(180deg, #0F172A 0%, #1E1B4B 100%)">
      <span class="absolute left-12 top-10 text-[28px] font-extrabold tracking-[2px] text-white">PULSE</span>
      <div class="absolute left-[160px] top-[300px] h-[300px] w-[400px] rounded-full bg-violet-600/20 blur-[80px]" />
      <img
        src="/images/login-hero.png"
        alt="PULSE NFC Event"
        class="absolute left-[110px] top-[200px] h-[400px] w-[500px] rounded-[20px] object-cover"
      />
      <p class="absolute bottom-[100px] left-12 text-[28px] font-bold leading-tight text-white">
        Transformez vos evenements<br />avec la technologie NFC
      </p>
      <p class="absolute bottom-[70px] left-12 text-sm text-slate-400">
        Plateforme tout-en-un pour la gestion de bracelets connectes
      </p>
    </div>

    <!-- Right Form -->
    <div class="flex w-full items-center justify-center bg-[#0F172A] px-6 lg:w-1/2 lg:px-20">
      <div class="flex w-full max-w-[400px] flex-col gap-7">
        <!-- Header -->
        <div class="flex flex-col gap-2">
          <h1 class="text-[28px] font-bold text-slate-50">Bon retour !</h1>
          <p class="text-sm text-slate-400">Connectez-vous a votre compte PULSE</p>
        </div>

        <!-- Social Buttons -->
        <div class="flex flex-col gap-2.5">
          <button class="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-pulse-surface py-3 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-700">
            <Globe class="h-[18px] w-[18px]" />
            Continuer avec Google
          </button>
          <button class="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-pulse-surface py-3 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-700">
            <Apple class="h-[18px] w-[18px]" />
            Continuer avec Apple
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-slate-700" />
          <span class="text-xs text-slate-400">ou</span>
          <div class="h-px flex-1 bg-slate-700" />
        </div>

        <!-- Form -->
        <form class="flex flex-col gap-3.5" @submit.prevent="handleSubmit">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-300">Adresse email</label>
            <input
              v-model="email"
              type="email"
              placeholder="vous@exemple.com"
              class="rounded-md border border-slate-700 bg-[#0F172A] px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-300">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="rounded-md border border-slate-700 bg-[#0F172A] px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <!-- Remember + Forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="h-4 w-4 rounded border-slate-700 bg-[#0F172A]" />
              <span class="text-[13px] text-slate-400">Se souvenir de moi</span>
            </label>
            <button type="button" class="text-[13px] font-medium text-violet-400 hover:text-violet-300">
              Mot de passe oublie ?
            </button>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            class="mt-2 w-full rounded-lg bg-pulse-violet py-2.5 text-sm font-medium text-white transition-colors hover:bg-pulse-violet-dark disabled:opacity-50"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <!-- Register link -->
        <p class="text-center text-[13px] text-slate-400">
          Pas encore de compte ?
          <RouterLink to="/register" class="font-semibold text-violet-400 hover:text-violet-300">
            Creer un compte
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
