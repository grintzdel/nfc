import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useCancelEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['cancelEvent'],
    mutationFn: (id: string) => eventPort.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
