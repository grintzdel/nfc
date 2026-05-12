import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyEvents() {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', 'my'],
    queryFn: () => eventPort.getMyEvents(),
  })
}
