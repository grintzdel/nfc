import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

export function useUpdateParticipantProfile() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateParticipantProfile'],
    mutationFn: ({ id, dto }: { id: string; dto: ParticipantDomainModel.UpdateParticipantProfileDto }) =>
      participantPort.updateProfile(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
