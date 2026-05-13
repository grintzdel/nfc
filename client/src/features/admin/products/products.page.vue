<script setup lang="ts">
import { Plus, Star, Pencil, Trash2, Package } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import { useGetCategories } from '@/modules/category/ui/hooks/queries/query/use-get-categories'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'
import { useCreateProduct } from '@/modules/product/ui/hooks/queries/mutation/use-create-product'
import { useDeleteProduct } from '@/modules/product/ui/hooks/queries/mutation/use-delete-product'
import { useUpdateProduct } from '@/modules/product/ui/hooks/queries/mutation/use-update-product'
import { useGetProducts } from '@/modules/product/ui/hooks/queries/query/use-get-products'
import { EmptyState } from '@/ui/empty-state'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import { TableSkeleton } from '@/ui/skeleton'

import ProductFormDialog from './components/product-form-dialog.vue'

const { data: products, isLoading } = useGetProducts()
const { data: categories } = useGetCategories()
const createMutation = useCreateProduct()
const updateMutation = useUpdateProduct()
const deleteMutation = useDeleteProduct()

const items = computed(() => products.value ?? [])
const categoryNameBySlug = computed(() => {
  const map = new Map<string, string>()
  for (const c of categories.value ?? []) map.set(c.slug, c.name)
  return map
})

function categoryLabel(slug: string): string {
  return categoryNameBySlug.value.get(slug) ?? slug
}

const dialogOpen = ref(false)
const editing = ref<ProductDomainModel.ProductOverviewDto | null>(null)

function openCreate(): void {
  editing.value = null
  dialogOpen.value = true
}

function openEdit(p: ProductDomainModel.ProductOverviewDto): void {
  editing.value = p
  dialogOpen.value = true
}

function handleConfirm(payload: {
  name: string
  slug?: string
  description?: string
  price: number
  stock?: number
  featured?: boolean
}): void {
  if (editing.value) {
    updateMutation.mutate(
      { id: editing.value.id, dto: payload },
      {
        onSuccess: () => {
          toast.success('Produit mis à jour')
          dialogOpen.value = false
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la mise à jour'),
      }
    )
  } else {
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Produit créé')
        dialogOpen.value = false
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la création'),
    })
  }
}

function handleDelete(p: ProductDomainModel.ProductOverviewDto): void {
  if (!confirm(`Supprimer ${p.name} ?`)) return
  deleteMutation.mutate(p.id, {
    onSuccess: () => toast.success('Produit supprimé'),
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la suppression'),
  })
}

const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
function formatEur(value: number): string {
  return eurFormatter.format(value)
}
</script>

<template>
  <AdminLayout title="Catalogue" subtitle="Gestion des produits et du stock e-commerce">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-sm text-slate-400">{{ items.length }} produits</span>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500"
          @click="openCreate"
        >
          <Plus class="h-3.5 w-3.5" />
          Nouveau produit
        </button>
      </div>

      <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
        <EmptyState
          v-if="!isLoading && items.length === 0"
          :icon="Package"
          title="Aucun produit"
          description="Créez votre premier produit pour démarrer le catalogue."
          size="sm"
        />

        <template v-else>
          <div class="overflow-x-auto">
            <div class="flex min-w-[780px] flex-col">
              <div class="flex items-center bg-slate-800">
                <div class="flex-1 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Produit</span>
                </div>
                <div class="w-[140px] shrink-0 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Catégorie</span>
                </div>
                <div class="w-[110px] shrink-0 px-4 py-3 text-right">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Prix</span>
                </div>
                <div class="w-[110px] shrink-0 px-4 py-3 text-right">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Stock</span>
                </div>
                <div class="w-[100px] shrink-0 px-4 py-3 text-center">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Featured</span>
                </div>
                <div class="w-[140px] shrink-0 px-4 py-3 text-right">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Actions</span>
                </div>
              </div>

              <div v-for="p in items" :key="p.id" class="flex items-center border-t border-white/10">
                <div class="flex flex-1 flex-col px-4 py-3">
                  <span class="text-sm font-medium text-slate-50">{{ p.name }}</span>
                  <span class="font-mono text-xs text-slate-500">{{ p.slug }}</span>
                </div>
                <div class="w-[140px] shrink-0 px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-200"
                  >
                    {{ categoryLabel(p.category) }}
                  </span>
                </div>
                <div class="w-[110px] shrink-0 px-4 py-3 text-right text-sm text-slate-50">
                  {{ formatEur(p.price) }}
                </div>
                <div
                  class="w-[110px] shrink-0 px-4 py-3 text-right text-sm"
                  :class="p.stock === 0 ? 'text-red-300' : 'text-slate-50'"
                >
                  {{ p.stock }}
                </div>
                <div class="w-[100px] shrink-0 px-4 py-3 text-center">
                  <Star v-if="p.featured" class="mx-auto h-4 w-4 fill-amber-400 text-amber-400" />
                  <span v-else class="text-slate-600">—</span>
                </div>
                <div class="flex w-[140px] shrink-0 items-center justify-end gap-1 px-4 py-3">
                  <button
                    type="button"
                    class="rounded-md border border-white/10 p-1.5 text-slate-300 hover:bg-white/5"
                    title="Modifier"
                    @click="openEdit(p)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    :disabled="deleteMutation.isPending.value"
                    class="rounded-md border border-red-500/40 p-1.5 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    title="Supprimer"
                    @click="handleDelete(p)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <TableSkeleton v-if="isLoading && items.length === 0" :rows="5" :columns="6" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <ProductFormDialog
      :open="dialogOpen"
      :loading="createMutation.isPending.value || updateMutation.isPending.value"
      :product="editing"
      @update:open="(v) => (dialogOpen = v)"
      @confirm="handleConfirm"
    />
  </AdminLayout>
</template>
