import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useCompleteEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['completeEvent'],
    mutationFn: (id: string) => eventPort.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
