<script setup lang="ts">
import { computed } from 'vue'
import { Linkedin, Twitter, Github, Instagram, Globe, Mail, Link as LinkIcon } from 'lucide-vue-next'
import { ProfileLinkType } from '@/modules/participant/core/constants/profile-link-type.constant'

const props = defineProps<{ type: string }>()

const IconComponent = computed(() => {
  switch (props.type) {
    case ProfileLinkType.LINKEDIN:
      return Linkedin
    case ProfileLinkType.TWITTER:
      return Twitter
    case ProfileLinkType.GITHUB:
      return Github
    case ProfileLinkType.INSTAGRAM:
      return Instagram
    case ProfileLinkType.WEBSITE:
      return Globe
    case ProfileLinkType.EMAIL:
      return Mail
    default:
      return LinkIcon
  }
})
</script>

<template>
  <component :is="IconComponent" class="h-5 w-5" />
</template>
