<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { ScanLine } from 'lucide-vue-next'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { useGetParticipantById } from '@/modules/participant/ui/hooks/queries/query/use-get-participant-by-id'
import { useGetBraceletById } from '@/modules/bracelet/ui/hooks/queries/query/use-get-bracelet-by-id'
import { useUpdateParticipantProfile } from '@/modules/participant/ui/hooks/queries/mutation/use-update-participant-profile'
import ProfileFieldsForm from '@/modules/participant/ui/components/profile-fields-form.vue'
import ProfileLinksEditor from '@/modules/participant/ui/components/profile-links-editor.vue'
import QrCodeDisplay from '@/modules/qrcode/ui/components/qrcode-display.vue'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

const route = useRoute()
const router = useRouter()
const participantId = computed(() => route.params.participantId as string)

const { data, isLoading, isError, error } = useGetParticipantById(participantId)
const updateMutation = useUpdateParticipantProfile()

const braceletId = computed(() => data.value?.braceletId ?? '')
const { data: bracelet } = useGetBraceletById(braceletId)

const fields = ref<{ displayName: string; role: string | null; bio: string | null }>({
  displayName: '',
  role: null,
  bio: null,
})
const links = ref<ParticipantDomainModel.ProfileLinkDto[]>([])

watch(
  data,
  (p) => {
    if (!p) return
    fields.value = { displayName: p.profile.displayName, role: p.profile.role, bio: p.profile.bio }
    links.value = [...p.profile.links]
  },
  { immediate: true },
)

watch(error, (e) => {
  if (!e) return
  const message = e instanceof Error ? e.message : ''
  if (message.toLowerCase().includes('forbidden') || message.includes('403')) {
    toast.error('Vous ne pouvez pas modifier ce profil')
    router.push('/')
  }
})

function validate(): boolean {
  if (!fields.value.displayName.trim()) {
    toast.error('Le nom affiché est obligatoire')
    return false
  }
  for (const link of links.value) {
    if (!link.url.trim()) {
      toast.error('Tous les liens doivent avoir une URL')
      return false
    }
    if (link.type === 'email' && !/^mailto:.+@.+\..+$/.test(link.url)) {
      toast.error('Les liens email doivent commencer par mailto:')
      return false
    }
    if (link.type !== 'email' && !/^https?:\/\/.+/.test(link.url)) {
      toast.error('Les URLs doivent commencer par http(s)://')
      return false
    }
    if (link.type === 'custom' && (!link.label || !link.label.trim())) {
      toast.error('Les liens custom nécessitent un label')
      return false
    }
  }
  return true
}

async function handleSave(): Promise<void> {
  if (!validate()) return
  try {
    await updateMutation.mutateAsync({
      id: participantId.value,
      dto: {
        displayName: fields.value.displayName,
        role: fields.value.role,
        bio: fields.value.bio,
        links: links.value,
      },
    })
    toast.success('Profil mis à jour')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background px-6 py-10 lg:px-20">
    <div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold">Modifier mon profil</h1>
        <p class="text-sm text-muted-foreground">
          Ces informations seront visibles lorsque votre bracelet est scanné.
        </p>
      </header>

      <Card v-if="isLoading">
        <CardContent class="flex flex-col gap-4 p-6">
          <Skeleton class="h-5 w-1/3" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-24 w-full" />
        </CardContent>
      </Card>

      <Card v-else-if="isError">
        <CardContent class="p-6 text-center text-destructive">Profil indisponible</CardContent>
      </Card>

      <template v-else>
        <!-- QR for entry / scanner — shown when a bracelet is attached -->
        <Card v-if="bracelet">
          <CardHeader>
            <CardTitle class="flex items-center gap-1.5 text-sm uppercase tracking-wider text-muted-foreground">
              <ScanLine class="h-3.5 w-3.5" />
              Bracelet — QR d'entrée
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col items-center gap-3">
            <QrCodeDisplay :value="bracelet.nfcId" :size="220" :alt="`QR code du bracelet ${bracelet.nfcId}`" />
            <div class="flex flex-col items-center gap-1 text-center">
              <span class="font-mono text-xs text-muted-foreground">{{ bracelet.nfcId }}</span>
              <p class="max-w-md text-xs text-muted-foreground">
                Présentez ce QR code à l'organisateur à l'entrée de l'événement.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm uppercase tracking-wider text-muted-foreground">Identité</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileFieldsForm v-model="fields" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm uppercase tracking-wider text-muted-foreground">Liens</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileLinksEditor v-model="links" />
          </CardContent>
        </Card>

        <div class="flex justify-end">
          <Button :disabled="updateMutation.isPending.value" @click="handleSave">
            {{ updateMutation.isPending.value ? 'Sauvegarde…' : 'Enregistrer' }}
          </Button>
        </div>
      </template>
    </div>
  </div>
</template>
