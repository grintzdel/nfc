import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetProductBySlug(slug: Ref<string>) {
  const { productPort } = useDependencies()

  return useQuery({
    queryKey: ['products', slug],
    queryFn: () => productPort.getBySlug(slug.value),
    enabled: () => !!slug.value,
  })
}
