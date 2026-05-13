<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'

import { ProfileLinkType } from '@/modules/participant/core/constants/profile-link-type.constant'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

import LinkIcon from './link-icon.vue'

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
    class="group flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-violet-900/40 bg-gradient-to-br from-slate-900/80 to-slate-900/40 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/60 hover:from-slate-900 hover:to-slate-900/70 hover:shadow-lg hover:shadow-violet-500/20"
  >
    <span class="flex items-center gap-3">
      <span
        class="rounded-lg bg-violet-500/15 p-2 text-violet-300 transition-colors duration-300 group-hover:bg-violet-500/30 group-hover:text-violet-200"
      >
        <LinkIcon :type="link.type" />
      </span>
      <span class="font-medium text-slate-100">{{ label }}</span>
    </span>
    <ChevronRight
      class="h-4 w-4 text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-300"
    />
  </a>
</template>
