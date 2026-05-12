import { Router, Request, Response, NextFunction } from 'express'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { AppError } from '@shared/errors/app.error'

export function createNfcRoutes(
  braceletRepository: IBraceletRepository,
  participantRepository: IParticipantRepository,
  eventRepository: IEventRepository,
): Router {
  const router = Router()

  router.get('/:nfcId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const nfcId = req.params.nfcId as string
      const bracelet = await braceletRepository.findByNfcId(nfcId)
      if (!bracelet || bracelet.isDeleted() || bracelet.isInStock()) {
        throw new AppError(404, 'Bracelet not activated')
      }

      const participant = await participantRepository.findByBraceletId(bracelet.id)
      if (!participant || participant.isDeleted()) {
        throw new AppError(404, 'No participant profile for this bracelet')
      }

      const event = await eventRepository.findById(participant.eventId)
      if (!event || event.isDeleted()) {
        throw new AppError(404, 'Event not found for this participant')
      }

      res.json({
        success: true,
        data: {
          bracelet: {
            nfcId: bracelet.nfcId,
            status: bracelet.status,
          },
          participant: {
            id: participant.id,
            profile: participant.profile,
            checkedInAt: participant.checkedInAt,
          },
          event: {
            id: event.id,
            name: event.name,
            slug: event.slug,
            venueName: event.venueName,
            venueAddress: event.venueAddress,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            status: event.status,
          },
        },
      })
    } catch (e) {
      next(e)
    }
  })

  return router
}
