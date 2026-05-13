import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetFaqs() {
  const { marketingPort } = useDependencies()
  return useQuery({
    queryKey: ['marketing', 'faqs'],
    queryFn: () => marketingPort.getFaqs(),
  })
}
