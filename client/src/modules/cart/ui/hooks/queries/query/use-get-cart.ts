import { useQuery } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetCart() {
  const { cartPort } = useDependencies()

  return useQuery({
    queryKey: ['cart'],
    queryFn: () => cartPort.getCart(),
  })
}
