<script setup lang="ts">
import { ref, watch } from 'vue'

import type { CategoryDomainModel } from '@/modules/category/core/model/category.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

type FormPayload = {
  name: string
  slug?: string
  description?: string
}

const props = defineProps<{
  open: boolean
  loading?: boolean
  category?: CategoryDomainModel.CategoryOverviewDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: FormPayload]
}>()

const isEdit = () => Boolean(props.category)

const name = ref('')
const slug = ref('')
const description = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.category) {
      name.value = props.category.name
      slug.value = props.category.slug
      description.value = props.category.description ?? ''
    } else {
      name.value = ''
      slug.value = ''
      description.value = ''
    }
  }
)

function handleConfirm(): void {
  if (!name.value.trim()) return
  emit('confirm', {
    name: name.value.trim(),
    slug: slug.value.trim() || undefined,
    description: description.value.trim() || undefined,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit() ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</DialogTitle>
        <DialogDescription class="text-slate-400">
          Le slug sert dans l'URL et lie les produits à la catégorie. Auto-généré si laissé vide.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Nom *</label>
          <input
            v-model="name"
            type="text"
            placeholder="Bracelet, Pass, Bundle…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Slug (optionnel)</label>
          <input
            v-model="slug"
            type="text"
            placeholder="auto-généré du nom"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 font-mono text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Description</label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Description courte de la catégorie…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>
      </div>

      <DialogFooter>
        <button
          type="button"
          class="rounded-md border border-white/10 px-3.5 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5"
          @click="emit('update:open', false)"
        >
          Annuler
        </button>
        <button
          type="button"
          :disabled="!name.trim() || loading"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          {{ isEdit() ? 'Enregistrer' : 'Créer' }}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
