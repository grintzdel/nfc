import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

export function useRegisterParticipant() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['registerParticipant'],
    mutationFn: (dto: ParticipantDomainModel.RegisterParticipantDto) => participantPort.register(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
