import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAvailableBracelets(eventId: Ref<string | null>) {
  const { braceletPort } = useDependencies()

  return useQuery({
    queryKey: ['bracelets', 'available', eventId],
    queryFn: () => braceletPort.getAvailable(eventId.value!),
    enabled: () => Boolean(eventId.value),
  })
}
