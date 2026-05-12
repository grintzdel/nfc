<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Card, CardContent } from '@/ui/card'
import { useGetNfcByNfcId } from '@/modules/nfc/ui/hooks/queries/query/use-get-nfc-by-id'
import { NfcBraceletNotActiveError } from '@/modules/nfc/core/errors/nfc.error'
import NfcProfileHero from '@/modules/nfc/ui/components/nfc-profile-hero.vue'
import NfcBioSection from '@/modules/nfc/ui/components/nfc-bio-section.vue'
import NfcLinkCard from '@/modules/nfc/ui/components/nfc-link-card.vue'
import NfcErrorState from '@/modules/nfc/ui/components/nfc-error-state.vue'

const route = useRoute()
const nfcId = ref<string | null>(typeof route.params.nfcId === 'string' ? route.params.nfcId : null)
watch(
  () => route.params.nfcId,
  (v) => {
    nfcId.value = typeof v === 'string' ? v : null
  },
)

const { data, isLoading, isError, error } = useGetNfcByNfcId(nfcId)

const errorVariant = computed<'not-active' | 'network'>(() =>
  error.value instanceof NfcBraceletNotActiveError ? 'not-active' : 'network',
)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-[#0F172A] to-slate-950 px-6 py-12 text-slate-50">
    <div class="mx-auto flex w-full max-w-md flex-col gap-6">
      <Card v-if="isLoading">
        <CardContent class="p-6 text-center text-muted-foreground">Chargement…</CardContent>
      </Card>
      <NfcErrorState v-else-if="isError" :variant="errorVariant" />
      <template v-else-if="data">
        <NfcProfileHero
          :display-name="data.participant.profile.displayName"
          :role="data.participant.profile.role"
          :event-name="data.event.name"
          :starts-at="data.event.startsAt"
          :ends-at="data.event.endsAt"
        />
        <NfcBioSection :bio="data.participant.profile.bio" />
        <section class="flex flex-col gap-3">
          <NfcLinkCard v-for="(link, i) in data.participant.profile.links" :key="i" :link="link" />
        </section>
      </template>
    </div>
  </div>
</template>
