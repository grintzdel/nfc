import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetBraceletById(id: Ref<string>) {
  const { braceletPort } = useDependencies()

  return useQuery({
    queryKey: ['bracelets', id],
    queryFn: () => braceletPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
