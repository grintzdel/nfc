import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllEvents() {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => eventPort.getAll(),
  })
}
