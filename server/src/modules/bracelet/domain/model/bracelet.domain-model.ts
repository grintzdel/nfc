import type { BraceletEntityProps } from '../entity/bracelet.entity'

export namespace BraceletDomainModel {
  export type BraceletOverviewDto = BraceletEntityProps
  export type CreateBraceletDto = Partial<Pick<BraceletEntityProps, 'nfcId' | 'productId'>>
  export type AssignBraceletDto = { userId: string; eventId: string }
}
