import type { SupplyOrderEntityProps } from '../entity/supply-order.entity'

export namespace SupplyOrderDomainModel {
  export type SupplyOrderOverviewDto = SupplyOrderEntityProps
  export type CreateSupplyOrderDto = Omit<
    SupplyOrderEntityProps,
    'id' | 'status' | 'receivedAt' | 'createdAt' | 'updatedAt'
  >
}
