<script setup lang="ts">
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'

type Fields = { displayName: string; role: string | null; bio: string | null }
const props = defineProps<{ modelValue: Fields }>()
const emit = defineEmits<{ 'update:modelValue': [Fields] }>()

function update<K extends keyof Fields>(field: K, value: Fields[K]): void {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <Label for="displayName">Nom affiché</Label>
      <Input
        id="displayName"
        :model-value="modelValue.displayName"
        type="text"
        placeholder="Marie Dubois"
        @update:model-value="(v) => update('displayName', String(v))"
      />
    </div>
    <div class="flex flex-col gap-1.5">
      <Label for="role">Rôle</Label>
      <Input
        id="role"
        :model-value="modelValue.role ?? ''"
        type="text"
        placeholder="Product Designer @ Pulse"
        @update:model-value="(v) => update('role', String(v) || null)"
      />
    </div>
    <div class="flex flex-col gap-1.5">
      <Label for="bio">Bio</Label>
      <Textarea
        id="bio"
        :model-value="modelValue.bio ?? ''"
        rows="3"
        placeholder="Quelques lignes sur vous…"
        @update:model-value="(v) => update('bio', String(v) || null)"
      />
    </div>
  </div>
</template>
