<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { toast } from 'vue-sonner'
import { UserPlus, CheckCircle2, Clock } from 'lucide-vue-next'
import { useGetTeamByEvent } from '@/modules/team/ui/hooks/queries/query/use-get-team-by-event'
import { useGetAllUsers } from '@/modules/user/ui/hooks/queries/query/use-get-all-users'
import { useInviteTeamMember } from '@/modules/team/ui/hooks/queries/mutation/use-invite-team-member'
import { useRevokeTeamMember } from '@/modules/team/ui/hooks/queries/mutation/use-revoke-team-member'
import { TeamRole } from '@/modules/team/core/model/team.domain-model'
import { TableSkeleton } from '@/ui/skeleton'
import InviteTeamDialog from './invite-team-dialog.vue'

const props = defineProps<{ eventId: string }>()

const eventIdRef = toRef(props, 'eventId')
const { data: members, isLoading } = useGetTeamByEvent(eventIdRef)
const { data: users } = useGetAllUsers()

const inviteMutation = useInviteTeamMember()
const revokeMutation = useRevokeTeamMember()

const memberRows = computed(() => members.value ?? [])
const alreadyMemberUserIds = computed(() => memberRows.value.map((m) => m.userId))

const userById = computed(() => {
  const map = new Map<string, { firstName: string; lastName: string; email: string }>()
  for (const u of users.value ?? []) map.set(u.id, { firstName: u.firstName, lastName: u.lastName, email: u.email })
  return map
})

const ROLE_LABEL: Record<string, string> = {
  [TeamRole.OWNER]: 'Propriétaire',
  [TeamRole.MANAGER]: 'Manager',
  [TeamRole.STAFF]: 'Staff',
}

const ROLE_CLASS: Record<string, string> = {
  [TeamRole.OWNER]: 'bg-violet-500/20 text-violet-300',
  [TeamRole.MANAGER]: 'bg-blue-500/20 text-blue-300',
  [TeamRole.STAFF]: 'bg-slate-500/20 text-slate-300',
}

const inviteOpen = ref(false)

function handleInvite(payload: { userId: string; role: 'manager' | 'staff' }): void {
  inviteMutation.mutate(
    { eventId: props.eventId, dto: payload },
    {
      onSuccess: () => {
        toast.success('Invitation envoyée')
        inviteOpen.value = false
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur lors de l'invitation"),
    },
  )
}

function handleRevoke(id: string, displayName: string): void {
  if (!confirm(`Révoquer ${displayName} de l'équipe ?`)) return
  revokeMutation.mutate(id, {
    onSuccess: () => toast.success('Membre révoqué'),
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la révocation'),
  })
}

function displayNameOf(userId: string): string {
  const u = userById.value.get(userId)
  return u ? `${u.firstName} ${u.lastName}` : userId
}

function emailOf(userId: string): string {
  return userById.value.get(userId)?.email ?? ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}
</script>

<template>
  <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-50">Membres de l'équipe</span>
        <span class="text-xs text-slate-400">Les managers + staff de cet événement</span>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md bg-[#8B5CF6] px-3.5 py-2 text-[13px] font-semibold text-violet-50 hover:bg-violet-500"
        @click="inviteOpen = true"
      >
        <UserPlus class="h-3.5 w-3.5" />
        Inviter un membre
      </button>
    </div>

    <!-- Empty -->
    <div v-if="memberRows.length === 0 && !isLoading" class="flex h-32 items-center justify-center">
      <p class="text-sm text-slate-400">Aucun membre d'équipe pour cet événement.</p>
    </div>

    <template v-else>
      <div class="overflow-x-auto">
        <div class="flex min-w-[760px] flex-col">
          <!-- Header -->
          <div class="flex items-center bg-slate-800">
            <div class="flex-1 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Membre</span></div>
            <div class="w-[130px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Rôle</span></div>
            <div class="w-[140px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Statut</span></div>
            <div class="w-[120px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Invité le</span></div>
            <div class="w-[140px] shrink-0 px-4 py-3 text-right"><span class="text-xs font-semibold tracking-wide text-slate-400">Action</span></div>
          </div>

          <!-- Rows -->
          <div v-for="m in memberRows" :key="m.id" class="flex items-center border-t border-white/10">
            <div class="flex flex-1 items-center gap-3 px-4 py-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-[11px] font-semibold text-white">
                {{ initials(displayNameOf(m.userId)) }}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-slate-50">{{ displayNameOf(m.userId) }}</span>
                <span v-if="emailOf(m.userId)" class="text-xs text-slate-400">{{ emailOf(m.userId) }}</span>
              </div>
            </div>
            <div class="w-[130px] shrink-0 px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="ROLE_CLASS[m.role]"
              >
                {{ ROLE_LABEL[m.role] ?? m.role }}
              </span>
            </div>
            <div class="w-[140px] shrink-0 px-4 py-3">
              <span v-if="m.acceptedAt" class="inline-flex items-center gap-1 text-xs text-emerald-300">
                <CheckCircle2 class="h-3 w-3" />
                Accepté
              </span>
              <span v-else class="inline-flex items-center gap-1 text-xs text-amber-300">
                <Clock class="h-3 w-3" />
                Invitation en attente
              </span>
            </div>
            <div class="w-[120px] shrink-0 px-4 py-3 text-sm text-slate-300">{{ formatDate(m.invitedAt) }}</div>
            <div class="flex w-[140px] shrink-0 items-center justify-end px-4 py-3">
              <button
                v-if="m.role !== TeamRole.OWNER"
                type="button"
                :disabled="revokeMutation.isPending.value"
                class="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                @click="handleRevoke(m.id, displayNameOf(m.userId))"
              >
                Révoquer
              </button>
            </div>
          </div>

          <TableSkeleton v-if="isLoading && memberRows.length === 0" :rows="4" :columns="4" />
        </div>
      </div>
    </template>

    <InviteTeamDialog
      :open="inviteOpen"
      :loading="inviteMutation.isPending.value"
      :users="users ?? []"
      :already-member-user-ids="alreadyMemberUserIds"
      @update:open="(v) => inviteOpen = v"
      @confirm="handleInvite"
    />
  </div>
</template>
