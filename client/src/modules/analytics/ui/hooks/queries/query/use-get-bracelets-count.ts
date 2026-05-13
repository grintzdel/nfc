import { useQuery } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetBraceletsCount() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'braceletsCount'],
    queryFn: () => analyticsPort.getBraceletsCount(),
  })
}
