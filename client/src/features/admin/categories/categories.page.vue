<script setup lang="ts">
import { Pencil, Plus, Tag, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

import type { CategoryDomainModel } from '@/modules/category/core/model/category.domain-model'
import { useCreateCategory } from '@/modules/category/ui/hooks/queries/mutation/use-create-category'
import { useDeleteCategory } from '@/modules/category/ui/hooks/queries/mutation/use-delete-category'
import { useUpdateCategory } from '@/modules/category/ui/hooks/queries/mutation/use-update-category'
import { useGetCategories } from '@/modules/category/ui/hooks/queries/query/use-get-categories'
import { EmptyState } from '@/ui/empty-state'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import { TableSkeleton } from '@/ui/skeleton'

import CategoryFormDialog from './components/category-form-dialog.vue'
import ConfirmDeleteCategoryDialog from './components/confirm-delete-category-dialog.vue'

const { data: categories, isLoading } = useGetCategories()
const createMutation = useCreateCategory()
const updateMutation = useUpdateCategory()
const deleteMutation = useDeleteCategory()

const items = computed(() => categories.value ?? [])

const dialogOpen = ref(false)
const editing = ref<CategoryDomainModel.CategoryOverviewDto | null>(null)

function openCreate(): void {
  editing.value = null
  dialogOpen.value = true
}

function openEdit(c: CategoryDomainModel.CategoryOverviewDto): void {
  editing.value = c
  dialogOpen.value = true
}

function handleConfirm(payload: { name: string; slug?: string; description?: string }): void {
  if (editing.value) {
    updateMutation.mutate(
      { id: editing.value.id, dto: payload },
      {
        onSuccess: () => {
          toast.success('Catégorie mise à jour')
          dialogOpen.value = false
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la mise à jour'),
      }
    )
  } else {
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Catégorie créée')
        dialogOpen.value = false
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la création'),
    })
  }
}

const deleteOpen = ref(false)
const deleteCategoryId = ref<string | null>(null)
const deleteCategoryName = computed(() => items.value.find((c) => c.id === deleteCategoryId.value)?.name)

function handleDelete(c: CategoryDomainModel.CategoryOverviewDto): void {
  deleteCategoryId.value = c.id
  deleteOpen.value = true
}

function handleConfirmDelete(): void {
  if (!deleteCategoryId.value) return
  deleteMutation.mutate(deleteCategoryId.value, {
    onSuccess: () => {
      toast.success('Catégorie supprimée')
      deleteOpen.value = false
      deleteCategoryId.value = null
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la suppression'),
  })
}
</script>

<template>
  <AdminLayout title="Catégories" subtitle="Organisation du catalogue e-commerce">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <div class="flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-sm text-slate-400">{{ items.length }} catégories</span>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md bg-[#8B5CF6] px-4 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500"
          @click="openCreate"
        >
          <Plus class="h-3.5 w-3.5" />
          Nouvelle catégorie
        </button>
      </div>

      <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
        <EmptyState
          v-if="!isLoading && items.length === 0"
          :icon="Tag"
          title="Aucune catégorie"
          description="Créez une catégorie pour organiser vos produits."
          size="sm"
        />

        <template v-else>
          <div class="overflow-x-auto">
            <div class="flex min-w-[640px] flex-col">
              <div class="flex items-center bg-slate-800">
                <div class="flex-1 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Catégorie</span>
                </div>
                <div class="w-[180px] shrink-0 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Slug</span>
                </div>
                <div class="flex w-[140px] shrink-0 items-center justify-end px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Actions</span>
                </div>
              </div>

              <div v-for="c in items" :key="c.id" class="flex items-center border-t border-white/10">
                <div class="flex flex-1 flex-col px-4 py-3">
                  <span class="text-sm font-medium text-slate-50">{{ c.name }}</span>
                  <span v-if="c.description" class="text-xs text-slate-400">{{ c.description }}</span>
                </div>
                <div class="w-[180px] shrink-0 px-4 py-3 font-mono text-xs text-slate-300">{{ c.slug }}</div>
                <div class="flex w-[140px] shrink-0 items-center justify-end gap-1 px-4 py-3">
                  <button
                    type="button"
                    class="rounded-md border border-white/10 p-1.5 text-slate-300 hover:bg-white/5"
                    title="Modifier"
                    @click="openEdit(c)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    :disabled="deleteMutation.isPending.value"
                    class="rounded-md border border-red-500/40 p-1.5 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    title="Supprimer"
                    @click="handleDelete(c)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <TableSkeleton v-if="isLoading && items.length === 0" :rows="3" :columns="3" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <CategoryFormDialog
      :open="dialogOpen"
      :loading="createMutation.isPending.value || updateMutation.isPending.value"
      :category="editing"
      @update:open="(v) => (dialogOpen = v)"
      @confirm="handleConfirm"
    />

    <ConfirmDeleteCategoryDialog
      :open="deleteOpen"
      :category-name="deleteCategoryName"
      :loading="deleteMutation.isPending.value"
      @update:open="(v) => (deleteOpen = v)"
      @confirm="handleConfirmDelete"
    />
  </AdminLayout>
</template>
