<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

defineProps<{
  open: boolean
  categoryName?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <div class="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15">
          <Trash2 class="h-5 w-5 text-red-400" />
        </div>
        <DialogTitle>Supprimer la catégorie</DialogTitle>
        <DialogDescription class="text-slate-400">
          <template v-if="categoryName">
            Vous êtes sur le point de supprimer la catégorie
            <strong class="text-slate-200">{{ categoryName }}</strong
            >. La suppression échouera si des produits y sont encore rattachés.
          </template>
          <template v-else>
            Cette action est définitive. La suppression échouera si des produits sont encore rattachés à cette
            catégorie.
          </template>
        </DialogDescription>
      </DialogHeader>

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
          :disabled="loading"
          class="rounded-md bg-red-500 px-3.5 py-2 text-sm font-semibold text-red-50 hover:bg-red-600 disabled:opacity-50"
          @click="emit('confirm')"
        >
          {{ loading ? 'Suppression...' : 'Supprimer' }}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
