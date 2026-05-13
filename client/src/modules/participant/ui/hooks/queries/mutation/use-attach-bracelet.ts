import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useAttachBracelet(eventId: string) {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['attachBracelet'],
    mutationFn: ({ participantId, braceletId }: { participantId: string; braceletId: string }) =>
      participantPort.attachBracelet(participantId, { braceletId }),
    onSuccess: () => {
      toast.success('Bracelet attaché')
      queryClient.invalidateQueries({ queryKey: ['participants', 'event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['bracelets', 'event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['bracelets', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'event', eventId] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'attachement")
    },
  })
}
