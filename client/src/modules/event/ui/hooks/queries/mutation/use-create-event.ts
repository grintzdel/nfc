import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'

export function useCreateEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createEvent'],
    mutationFn: (dto: EventDomainModel.CreateEventDto) => eventPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
