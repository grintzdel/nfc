import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDisableBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['disableBracelet'],
    mutationFn: (id: string) => braceletPort.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
