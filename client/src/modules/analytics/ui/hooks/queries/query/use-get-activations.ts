import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetActivations(year?: Ref<number | undefined>) {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'activations', year],
    queryFn: () => analyticsPort.getActivations(year?.value),
  })
}
