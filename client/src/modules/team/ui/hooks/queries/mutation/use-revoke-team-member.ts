import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useRevokeTeamMember() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['revokeTeamMember'],
    mutationFn: (id: string) => teamPort.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
