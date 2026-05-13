<script setup lang="ts">
import { ref, watch } from 'vue'

import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

type FormPayload = {
  name: string
  slug?: string
  description?: string
  price: number
  stock?: number
  featured?: boolean
}

const props = defineProps<{
  open: boolean
  loading?: boolean
  // When set, the dialog is in "edit" mode and pre-fills from this product.
  product?: ProductDomainModel.ProductOverviewDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: FormPayload]
}>()

const isEdit = () => Boolean(props.product)

const name = ref('')
const slug = ref('')
const description = ref('')
const price = ref(0)
const stock = ref(0)
const featured = ref(false)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    if (props.product) {
      name.value = props.product.name
      slug.value = props.product.slug
      description.value = props.product.description ?? ''
      price.value = props.product.price
      stock.value = props.product.stock
      featured.value = props.product.featured
    } else {
      name.value = ''
      slug.value = ''
      description.value = ''
      price.value = 0
      stock.value = 0
      featured.value = false
    }
  }
)

function handleConfirm(): void {
  if (!name.value.trim() || price.value < 0) return
  emit('confirm', {
    name: name.value.trim(),
    slug: slug.value.trim() || undefined,
    description: description.value.trim() || undefined,
    price: price.value,
    stock: stock.value,
    featured: featured.value,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ isEdit() ? 'Modifier le produit' : 'Nouveau produit' }}</DialogTitle>
        <DialogDescription class="text-slate-400"> Renseignez au minimum un nom et un prix. </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Nom *</label>
          <input
            v-model="name"
            type="text"
            placeholder="PULSE Classic…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <label class="text-xs uppercase tracking-wider text-slate-400">Catégorie (info, non bloquant)</label>
            <input
              type="text"
              disabled
              value="à venir"
              class="rounded-md border border-white/10 bg-slate-800/40 px-3 py-2 text-sm text-slate-500 outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Prix (€) *</label>
            <input
              v-model.number="price"
              type="number"
              min="0"
              step="0.01"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Stock</label>
            <input
              v-model.number="stock"
              type="number"
              min="0"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Description</label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Description du produit…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <label class="inline-flex items-center gap-2 text-sm text-slate-300">
          <input v-model="featured" type="checkbox" class="rounded border-white/20 bg-slate-800" />
          Mis en avant sur la home
        </label>
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
          :disabled="!name.trim() || price < 0 || loading"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          {{ isEdit() ? 'Enregistrer' : 'Créer' }}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
