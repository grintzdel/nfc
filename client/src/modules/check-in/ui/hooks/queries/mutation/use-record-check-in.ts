import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CheckInDomainModel } from '@/modules/check-in/core/model/check-in.domain-model'

export function useRecordCheckIn() {
  const { checkInPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['recordCheckIn'],
    mutationFn: (dto: CheckInDomainModel.RecordCheckInDto) => checkInPort.record(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
    },
  })
}
