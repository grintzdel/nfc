import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

export function useAttachBracelet() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['attachBracelet'],
    mutationFn: ({ id, dto }: { id: string; dto: ParticipantDomainModel.AttachBraceletDto }) =>
      participantPort.attachBracelet(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
