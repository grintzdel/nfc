import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetNfcByNfcId(nfcId: Ref<string | null>) {
  const { nfcPort } = useDependencies()

  return useQuery({
    queryKey: ['nfc', nfcId] as const,
    queryFn: () => nfcPort.getByNfcId(nfcId.value!),
    enabled: () => !!nfcId.value,
    retry: false,
  })
}
