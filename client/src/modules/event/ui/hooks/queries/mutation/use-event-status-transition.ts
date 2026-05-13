import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export type EventStatusAction = 'publish' | 'start' | 'complete' | 'cancel'

const SUCCESS_MESSAGE: Record<EventStatusAction, string> = {
  publish: 'Événement publié',
  start: 'Événement démarré',
  complete: 'Événement clôturé',
  cancel: 'Événement annulé',
}

export function useEventStatusTransition() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['eventStatusTransition'],
    mutationFn: ({ id, action }: { id: string; action: EventStatusAction }) => {
      switch (action) {
        case 'publish':
          return eventPort.publish(id)
        case 'start':
          return eventPort.start(id)
        case 'complete':
          return eventPort.complete(id)
        case 'cancel':
          return eventPort.cancel(id)
      }
    },
    onSuccess: (_data, variables) => {
      toast.success(SUCCESS_MESSAGE[variables.action])
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'event', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'eventPageStats'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la transition')
    },
  })
}
