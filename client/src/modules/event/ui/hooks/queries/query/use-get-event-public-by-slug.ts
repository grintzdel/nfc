import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetEventPublicBySlug(slug: Ref<string | null>) {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', 'public', slug],
    queryFn: () => eventPort.getPublicBySlug(slug.value!),
    enabled: () => !!slug.value,
  })
}
