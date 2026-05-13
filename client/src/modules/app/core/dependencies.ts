import { AnalyticsHttpAdapter } from '@/modules/analytics/core/adapters/analytics.adapter.http'
import type { IAnalyticsPort } from '@/modules/analytics/core/ports/analytics.port'
import { AuthHttpAdapter } from '@/modules/auth/core/adapters/auth.adapter.http'
import type { IAuthPort } from '@/modules/auth/core/ports/auth.port'
import { BraceletHttpAdapter } from '@/modules/bracelet/core/adapters/bracelet.adapter.http'
import type { IBraceletPort } from '@/modules/bracelet/core/ports/bracelet.port'
import { CartHttpAdapter } from '@/modules/cart/core/adapters/cart.adapter.http'
import type { ICartPort } from '@/modules/cart/core/ports/cart.port'
import { CategoryHttpAdapter } from '@/modules/category/core/adapters/category.adapter.http'
import type { ICategoryPort } from '@/modules/category/core/ports/category.port'
import { CheckInHttpAdapter } from '@/modules/check-in/core/adapters/check-in.adapter.http'
import type { ICheckInPort } from '@/modules/check-in/core/ports/check-in.port'
import { EventHttpAdapter } from '@/modules/event/core/adapters/event.adapter.http'
import type { IEventPort } from '@/modules/event/core/ports/event.port'
import { MarketingHttpAdapter } from '@/modules/marketing/core/adapters/marketing.adapter.http'
import type { IMarketingPort } from '@/modules/marketing/core/ports/marketing.port'
import { NfcHttpAdapter } from '@/modules/nfc/core/adapters/nfc.adapter.http'
import type { INfcPort } from '@/modules/nfc/core/ports/nfc.port'
import { OrderHttpAdapter } from '@/modules/order/core/adapters/order.adapter.http'
import type { IOrderPort } from '@/modules/order/core/ports/order.port'
import { ParticipantHttpAdapter } from '@/modules/participant/core/adapters/participant.adapter.http'
import type { IParticipantPort } from '@/modules/participant/core/ports/participant.port'
import { ProductHttpAdapter } from '@/modules/product/core/adapters/product.adapter.http'
import type { IProductPort } from '@/modules/product/core/ports/product.port'
import { QrCodeLibAdapter } from '@/modules/qrcode/core/adapters/qrcode.adapter.lib'
import type { IQrCodePort } from '@/modules/qrcode/core/ports/qrcode.port'
import { getSharedHttpClient } from '@/modules/shared/http/http-client'
import { SupplyOrderHttpAdapter } from '@/modules/supply-order/core/adapters/supply-order.adapter.http'
import type { ISupplyOrderPort } from '@/modules/supply-order/core/ports/supply-order.port'
import { TeamHttpAdapter } from '@/modules/team/core/adapters/team.adapter.http'
import type { ITeamPort } from '@/modules/team/core/ports/team.port'
import { UserHttpAdapter } from '@/modules/user/core/adapters/user.adapter.http'
import type { IUserPort } from '@/modules/user/core/ports/user.port'

export type Dependencies = {
  productPort: IProductPort
  categoryPort: ICategoryPort
  authPort: IAuthPort
  eventPort: IEventPort
  braceletPort: IBraceletPort
  participantPort: IParticipantPort
  checkInPort: ICheckInPort
  teamPort: ITeamPort
  supplyOrderPort: ISupplyOrderPort
  analyticsPort: IAnalyticsPort
  cartPort: ICartPort
  orderPort: IOrderPort
  nfcPort: INfcPort
  qrCodePort: IQrCodePort
  userPort: IUserPort
  marketingPort: IMarketingPort
}

export function createDependencies(): Dependencies {
  const httpClient = getSharedHttpClient()

  const token = localStorage.getItem('token')
  if (token) {
    httpClient.setAuthToken(token)
  }

  return {
    productPort: new ProductHttpAdapter(httpClient),
    categoryPort: new CategoryHttpAdapter(httpClient),
    authPort: new AuthHttpAdapter(),
    eventPort: new EventHttpAdapter(httpClient),
    braceletPort: new BraceletHttpAdapter(httpClient),
    participantPort: new ParticipantHttpAdapter(httpClient),
    checkInPort: new CheckInHttpAdapter(httpClient),
    teamPort: new TeamHttpAdapter(httpClient),
    supplyOrderPort: new SupplyOrderHttpAdapter(httpClient),
    analyticsPort: new AnalyticsHttpAdapter(httpClient),
    cartPort: new CartHttpAdapter(httpClient),
    orderPort: new OrderHttpAdapter(httpClient),
    nfcPort: new NfcHttpAdapter(httpClient),
    qrCodePort: new QrCodeLibAdapter(),
    userPort: new UserHttpAdapter(httpClient),
    marketingPort: new MarketingHttpAdapter(httpClient),
  }
}
