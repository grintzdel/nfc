import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetFeaturedProducts() {
  const { productPort } = useDependencies()

  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productPort.getFeatured(),
  })
}
