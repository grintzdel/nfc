import { inject } from 'vue'
import type { Dependencies } from '@/modules/app/core/dependencies'
import type { InjectionKey } from 'vue'

export const DEPENDENCIES_KEY: InjectionKey<Dependencies> = Symbol('dependencies')

export function useDependencies(): Dependencies {
  const deps = inject(DEPENDENCIES_KEY)
  if (!deps) {
    throw new Error('Dependencies not provided. Make sure to call app.provide(DEPENDENCIES_KEY, dependencies) in main.ts')
  }
  return deps
}
