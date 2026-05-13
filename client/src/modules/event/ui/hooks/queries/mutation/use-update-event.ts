import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'

export function useUpdateEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateEvent'],
    mutationFn: ({ id, dto }: { id: string; dto: EventDomainModel.UpdateEventDto }) => eventPort.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
