import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useAcceptInvitation() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['acceptInvitation'],
    mutationFn: (id: string) => teamPort.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
