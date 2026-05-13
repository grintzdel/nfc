import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function usePublishEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['publishEvent'],
    mutationFn: (id: string) => eventPort.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
