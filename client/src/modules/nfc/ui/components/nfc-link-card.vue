<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import LinkIcon from './link-icon.vue'
import { ProfileLinkType } from '@/modules/participant/core/constants/profile-link-type.constant'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

const props = defineProps<{ link: ParticipantDomainModel.ProfileLinkDto }>()

const href = computed(() => {
  if (props.link.type === ProfileLinkType.EMAIL) {
    return props.link.url.startsWith('mailto:') ? props.link.url : `mailto:${props.link.url}`
  }
  return props.link.url
})

const label = computed(() => {
  if (props.link.type === ProfileLinkType.CUSTOM) return props.link.label ?? 'Lien'
  const map: Record<string, string> = {
    [ProfileLinkType.LINKEDIN]: 'LinkedIn',
    [ProfileLinkType.TWITTER]: 'Twitter',
    [ProfileLinkType.GITHUB]: 'GitHub',
    [ProfileLinkType.INSTAGRAM]: 'Instagram',
    [ProfileLinkType.WEBSITE]: 'Site web',
    [ProfileLinkType.EMAIL]: 'Email',
  }
  return map[props.link.type] ?? 'Lien'
})
</script>

<template>
  <a
    :href="href"
    class="flex items-center justify-between gap-3 rounded-xl border border-violet-900/40 bg-slate-900/60 px-4 py-4 transition-colors hover:border-violet-500 hover:bg-slate-900"
  >
    <span class="flex items-center gap-3">
      <span class="rounded-lg bg-violet-500/15 p-2 text-violet-300"><LinkIcon :type="link.type" /></span>
      <span class="font-medium text-slate-100">{{ label }}</span>
    </span>
    <ChevronRight class="h-4 w-4 text-slate-500" />
  </a>
</template>
