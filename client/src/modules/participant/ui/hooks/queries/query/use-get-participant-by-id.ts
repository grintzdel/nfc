import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetParticipantById(id: MaybeRefOrGetter<string>) {
  const { participantPort } = useDependencies()
  return useQuery({
    queryKey: computed(() => ['participants', toValue(id)]),
    queryFn: () => participantPort.getById(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  })
}
