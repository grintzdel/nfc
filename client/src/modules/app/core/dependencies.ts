import type { IProductPort } from '@/modules/product/core/ports/product.port'
import type { IAuthPort } from '@/modules/auth/core/ports/auth.port'
import type { IEventPort } from '@/modules/event/core/ports/event.port'
import type { IBraceletPort } from '@/modules/bracelet/core/ports/bracelet.port'
import type { IParticipantPort } from '@/modules/participant/core/ports/participant.port'
import type { ICheckInPort } from '@/modules/check-in/core/ports/check-in.port'
import type { ITeamPort } from '@/modules/team/core/ports/team.port'
import type { ISupplyOrderPort } from '@/modules/supply-order/core/ports/supply-order.port'
import type { IAnalyticsPort } from '@/modules/analytics/core/ports/analytics.port'
import type { ICartPort } from '@/modules/cart/core/ports/cart.port'
import type { IOrderPort } from '@/modules/order/core/ports/order.port'
import type { INfcPort } from '@/modules/nfc/core/ports/nfc.port'
import type { IQrCodePort } from '@/modules/qrcode/core/ports/qrcode.port'
import type { IUserPort } from '@/modules/user/core/ports/user.port'
import { getSharedHttpClient } from '@/modules/shared/http/http-client'
import { ProductHttpAdapter } from '@/modules/product/core/adapters/product.adapter.http'
import { AuthHttpAdapter } from '@/modules/auth/core/adapters/auth.adapter.http'
import { EventHttpAdapter } from '@/modules/event/core/adapters/event.adapter.http'
import { BraceletHttpAdapter } from '@/modules/bracelet/core/adapters/bracelet.adapter.http'
import { ParticipantHttpAdapter } from '@/modules/participant/core/adapters/participant.adapter.http'
import { CheckInHttpAdapter } from '@/modules/check-in/core/adapters/check-in.adapter.http'
import { TeamHttpAdapter } from '@/modules/team/core/adapters/team.adapter.http'
import { SupplyOrderHttpAdapter } from '@/modules/supply-order/core/adapters/supply-order.adapter.http'
import { AnalyticsHttpAdapter } from '@/modules/analytics/core/adapters/analytics.adapter.http'
import { CartHttpAdapter } from '@/modules/cart/core/adapters/cart.adapter.http'
import { OrderHttpAdapter } from '@/modules/order/core/adapters/order.adapter.http'
import { NfcHttpAdapter } from '@/modules/nfc/core/adapters/nfc.adapter.http'
import { QrCodeLibAdapter } from '@/modules/qrcode/core/adapters/qrcode.adapter.lib'
import { UserHttpAdapter } from '@/modules/user/core/adapters/user.adapter.http'

export type Dependencies = {
  productPort: IProductPort
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
}

export function createDependencies(): Dependencies {
  const httpClient = getSharedHttpClient()

  const token = localStorage.getItem('token')
  if (token) {
    httpClient.setAuthToken(token)
  }

  return {
    productPort: new ProductHttpAdapter(httpClient),
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
  }
}
