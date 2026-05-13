<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { NfcBraceletNotActiveError } from '@/modules/nfc/core/errors/nfc.error'
import NfcBioSection from '@/modules/nfc/ui/components/nfc-bio-section.vue'
import NfcErrorState from '@/modules/nfc/ui/components/nfc-error-state.vue'
import NfcLinkCard from '@/modules/nfc/ui/components/nfc-link-card.vue'
import NfcProfileHero from '@/modules/nfc/ui/components/nfc-profile-hero.vue'
import { useGetNfcByNfcId } from '@/modules/nfc/ui/hooks/queries/query/use-get-nfc-by-id'
import { Card, CardContent } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'

const route = useRoute()
const nfcId = ref<string | null>(typeof route.params.nfcId === 'string' ? route.params.nfcId : null)
watch(
  () => route.params.nfcId,
  (v) => {
    nfcId.value = typeof v === 'string' ? v : null
  }
)

const { data, isLoading, isError, error } = useGetNfcByNfcId(nfcId)

const errorVariant = computed<'not-active' | 'network'>(() =>
  error.value instanceof NfcBraceletNotActiveError ? 'not-active' : 'network'
)

useHead({
  title: computed(() => (data.value ? `${data.value.participant.profile.displayName} — PULSE` : 'Profil PULSE')),
  meta: [
    { name: 'robots', content: 'noindex' },
    {
      name: 'description',
      content: computed(() => data.value?.participant.profile.bio ?? 'Profil partagé via bracelet NFC PULSE.'),
    },
  ],
})
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-[#0F172A] to-slate-950 px-6 py-12 text-slate-50"
  >
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="bg-violet-600/8 absolute -left-32 top-20 h-[500px] w-[500px] rounded-full blur-3xl" />
      <div class="bg-fuchsia-500/6 absolute -right-32 bottom-20 h-[400px] w-[400px] rounded-full blur-3xl" />
    </div>

    <div class="relative mx-auto flex w-full max-w-md flex-col gap-6">
      <Card v-if="isLoading">
        <CardContent class="flex flex-col items-center gap-4 p-6">
          <Skeleton class="h-20 w-20 rounded-full" />
          <Skeleton class="h-5 w-2/3" />
          <Skeleton class="h-3 w-1/2" />
          <Skeleton class="mt-2 h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </CardContent>
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
          <NfcLinkCard
            v-for="(link, i) in data.participant.profile.links"
            :key="i"
            :link="link"
            :style="{ animationDelay: `${i * 60}ms` }"
            class="nfc-link-enter"
          />
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes nfc-link-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.nfc-link-enter {
  animation: nfc-link-enter 320ms ease-out both;
}
</style>
