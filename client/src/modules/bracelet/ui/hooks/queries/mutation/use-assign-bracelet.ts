import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'

export function useAssignBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assignBracelet'],
    mutationFn: ({ id, dto }: { id: string; dto: BraceletDomainModel.AssignBraceletDto }) => braceletPort.assign(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
