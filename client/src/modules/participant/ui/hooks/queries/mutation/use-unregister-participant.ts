import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useUnregisterParticipant() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['unregisterParticipant'],
    mutationFn: (id: string) => participantPort.unregister(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
