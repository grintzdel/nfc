import { useQuery } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllUsers() {
  const { userPort } = useDependencies()

  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => userPort.getAll(),
  })
}
