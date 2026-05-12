<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'
import { getSharedHttpClient } from '@/modules/shared/http/http-client'
import ProfileLinksEditor from '@/modules/participant/ui/components/profile-links-editor.vue'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

const props = defineProps<{ eventId: string }>()
const router = useRouter()
const route = useRoute()
const { authPort, participantPort } = useDependencies()
const { isAuthenticated } = useAuth()

const isLoggedIn = computed(() => isAuthenticated())
const accountFields = ref({ firstName: '', lastName: '', email: '', password: '' })
const profileFields = ref<{
  displayName: string
  role: string | null
  bio: string | null
  links: ParticipantDomainModel.ProfileLinkDto[]
}>({ displayName: '', role: null, bio: null, links: [] })
const isLoading = ref(false)

function validate(): boolean {
  if (!profileFields.value.displayName.trim()) {
    toast.error('Le nom affiché est obligatoire')
    return false
  }
  if (!isLoggedIn.value) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(accountFields.value.email)) {
      toast.error('Email invalide')
      return false
    }
    if (accountFields.value.password.length < 8) {
      toast.error('Mot de passe ≥ 8 caractères')
      return false
    }
    if (!accountFields.value.firstName.trim() || !accountFields.value.lastName.trim()) {
      toast.error('Prénom et nom obligatoires')
      return false
    }
  }
  for (const link of profileFields.value.links) {
    if (link.type === 'email' && !/^mailto:.+@.+\..+$/.test(link.url)) {
      toast.error('Email mailto: requis')
      return false
    }
    if (link.type !== 'email' && !/^https?:\/\/.+/.test(link.url)) {
      toast.error('URL http(s):// requise')
      return false
    }
    if (link.type === 'custom' && (!link.label || !link.label.trim())) {
      toast.error('Custom: label requis')
      return false
    }
  }
  if (profileFields.value.links.length > 10) {
    toast.error('Maximum 10 liens')
    return false
  }
  return true
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return
  isLoading.value = true
  try {
    if (!isLoggedIn.value) {
      const auth = await authPort.register(accountFields.value)
      localStorage.setItem('token', auth.token)
      getSharedHttpClient().setAuthToken(auth.token)
    }
    const participant = await participantPort.register({ eventId: props.eventId, profile: profileFields.value })
    toast.success('Inscription confirmée !')
    router.push(`/me/events/${participant.id}`)
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    if (message.toLowerCase().includes('already registered')) {
      try {
        const mine = await participantPort.getMyParticipations()
        const existing = mine.find((p) => p.eventId === props.eventId)
        if (existing) {
          toast.info('Vous êtes déjà inscrit')
          router.push(`/me/events/${existing.id}`)
          return
        }
      } catch {
        // fall through to generic toast
      }
    }
    toast.error(message || "Erreur lors de l'inscription")
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-sm uppercase tracking-wider text-muted-foreground">Inscription</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <template v-if="!isLoggedIn">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <Label for="fn">Prénom</Label>
              <Input id="fn" v-model="accountFields.firstName" />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="ln">Nom</Label>
              <Input id="ln" v-model="accountFields.lastName" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="em">Email</Label>
            <Input id="em" v-model="accountFields.email" type="email" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="pw">Mot de passe</Label>
            <Input id="pw" v-model="accountFields.password" type="password" placeholder="8+ caractères" />
          </div>
          <RouterLink :to="{ path: '/login', query: { redirect: route.fullPath } }" class="text-xs text-primary hover:underline">
            J'ai déjà un compte
          </RouterLink>
        </template>

        <div class="flex flex-col gap-1.5">
          <Label for="dn">Nom affiché</Label>
          <Input id="dn" v-model="profileFields.displayName" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="ro">Rôle (optionnel)</Label>
          <Input id="ro" :model-value="profileFields.role ?? ''" @update:model-value="(v) => (profileFields.role = String(v) || null)" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="bi">Bio (optionnel)</Label>
          <Textarea id="bi" :model-value="profileFields.bio ?? ''" :rows="3" @update:model-value="(v) => (profileFields.bio = String(v) || null)" />
        </div>
        <div class="flex flex-col gap-2">
          <Label>Liens (optionnel)</Label>
          <ProfileLinksEditor v-model="profileFields.links" />
        </div>

        <Button type="submit" :disabled="isLoading">{{ isLoading ? 'Inscription…' : "S'inscrire" }}</Button>
      </form>
    </CardContent>
  </Card>
</template>
