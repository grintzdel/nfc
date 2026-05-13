import { useQuery } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetNextEvent() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'nextEvent'],
    queryFn: () => analyticsPort.getNextEvent(),
  })
}
