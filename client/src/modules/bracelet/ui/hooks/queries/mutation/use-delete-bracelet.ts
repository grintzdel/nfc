import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDeleteBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteBracelet'],
    mutationFn: (id: string) => braceletPort.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
