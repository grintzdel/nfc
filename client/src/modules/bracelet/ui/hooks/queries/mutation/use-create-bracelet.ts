import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'

export function useCreateBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createBracelet'],
    mutationFn: (dto: BraceletDomainModel.CreateBraceletDto) => braceletPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
