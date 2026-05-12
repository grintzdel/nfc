<script setup lang="ts">
import { computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { Button } from '@/ui/button'
import ProfileLinkRow from './profile-link-row.vue'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import { ProfileLinkType } from '@/modules/participant/core/constants/profile-link-type.constant'

type Link = ParticipantDomainModel.ProfileLinkDto
const MAX_LINKS = 10

const props = defineProps<{ modelValue: Link[] }>()
const emit = defineEmits<{ 'update:modelValue': [Link[]] }>()

const isAtMax = computed(() => props.modelValue.length >= MAX_LINKS)

function add(): void {
  if (isAtMax.value) return
  emit('update:modelValue', [...props.modelValue, { type: ProfileLinkType.WEBSITE, url: '', label: null }])
}

function updateAt(index: number, link: Link): void {
  const copy = [...props.modelValue]
  copy[index] = link
  emit('update:modelValue', copy)
}

function removeAt(index: number): void {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <ProfileLinkRow
      v-for="(link, i) in modelValue"
      :key="i"
      :link="link"
      @update="(l) => updateAt(i, l)"
      @remove="() => removeAt(i)"
    />
    <Button
      type="button"
      variant="outline"
      :disabled="isAtMax"
      class="border-dashed"
      @click="add"
    >
      <Plus class="mr-2 h-4 w-4" />
      Ajouter un lien ({{ modelValue.length }}/{{ MAX_LINKS }})
    </Button>
  </div>
</template>
