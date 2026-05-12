import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { TeamDomainModel } from '@/modules/team/core/model/team.domain-model'

export function useChangeRole() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['changeRole'],
    mutationFn: ({ id, dto }: { id: string; dto: TeamDomainModel.ChangeRoleDto }) => teamPort.changeRole(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
