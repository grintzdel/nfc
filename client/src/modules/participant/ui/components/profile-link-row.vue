<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'

import { ProfileLinkType } from '@/modules/participant/core/constants/profile-link-type.constant'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'

type Link = ParticipantDomainModel.ProfileLinkDto
const props = defineProps<{ link: Link }>()
const emit = defineEmits<{ update: [Link]; remove: [] }>()

const isCustom = computed(() => props.link.type === ProfileLinkType.CUSTOM)
const linkTypes = Object.values(ProfileLinkType)

function update<K extends keyof Link>(field: K, value: Link[K]): void {
  emit('update', { ...props.link, [field]: value })
}
</script>

<template>
  <div class="flex items-start gap-2">
    <Select :model-value="link.type" @update:model-value="(v) => update('type', v as Link['type'])">
      <SelectTrigger class="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="t in linkTypes" :key="t" :value="t">{{ t }}</SelectItem>
      </SelectContent>
    </Select>
    <Input
      :model-value="link.url"
      placeholder="https://..."
      class="flex-1"
      @update:model-value="(v) => update('url', String(v))"
    />
    <Input
      v-if="isCustom"
      :model-value="link.label ?? ''"
      placeholder="Label"
      class="w-32"
      @update:model-value="(v) => update('label', String(v) || null)"
    />
    <Button type="button" variant="outline" size="icon" aria-label="Supprimer ce lien" @click="emit('remove')">
      <Trash2 class="h-4 w-4" />
    </Button>
  </div>
</template>
