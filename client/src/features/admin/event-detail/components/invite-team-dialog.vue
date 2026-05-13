<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { TeamRole } from '@/modules/team/core/model/team.domain-model'
import type { UserDomainModel } from '@/modules/user/core/model/user.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'

const props = defineProps<{
  open: boolean
  loading?: boolean
  users: UserDomainModel.UserOverviewDto[]
  alreadyMemberUserIds: string[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: { userId: string; role: 'manager' | 'staff' }]
}>()

const selectedUserId = ref('')
const selectedRole = ref<'manager' | 'staff'>('staff')

watch(
  () => props.open,
  (open) => {
    if (open) {
      selectedUserId.value = ''
      selectedRole.value = 'staff'
    }
  }
)

const availableUsers = computed(() => {
  const excluded = new Set(props.alreadyMemberUserIds)
  return props.users.filter((u) => !excluded.has(u.id))
})

function handleConfirm(): void {
  if (!selectedUserId.value) return
  emit('confirm', { userId: selectedUserId.value, role: selectedRole.value })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Inviter un membre d'équipe</DialogTitle>
        <DialogDescription class="text-slate-400">
          Sélectionnez un utilisateur et un rôle. Il recevra une invitation à accepter.
        </DialogDescription>
      </DialogHeader>

      <div
        v-if="availableUsers.length === 0"
        class="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
      >
        Tous les utilisateurs disponibles sont déjà membres de cette équipe.
      </div>

      <div v-else class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Utilisateur</label>
          <Select :model-value="selectedUserId" @update:model-value="(v) => (selectedUserId = String(v))">
            <SelectTrigger>
              <SelectValue placeholder="Choisir un utilisateur…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="u in availableUsers" :key="u.id" :value="u.id">
                {{ u.firstName }} {{ u.lastName }} — {{ u.email }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Rôle</label>
          <Select :model-value="selectedRole" @update:model-value="(v) => (selectedRole = v as 'manager' | 'staff')">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="TeamRole.MANAGER">Manager</SelectItem>
              <SelectItem :value="TeamRole.STAFF">Staff</SelectItem>
            </SelectContent>
          </Select>
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
          :disabled="!selectedUserId || loading"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          Inviter
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
