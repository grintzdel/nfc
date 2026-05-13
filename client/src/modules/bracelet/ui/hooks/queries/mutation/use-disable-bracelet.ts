import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDisableBracelet(eventId: string) {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['disableBracelet'],
    mutationFn: (braceletId: string) => braceletPort.disable(braceletId),
    onSuccess: () => {
      toast.success('Bracelet désactivé')
      queryClient.invalidateQueries({ queryKey: ['bracelets', 'event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['bracelets', 'available'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'event', eventId] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la désactivation')
    },
  })
}
