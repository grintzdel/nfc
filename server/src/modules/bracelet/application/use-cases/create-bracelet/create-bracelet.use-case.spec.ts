import { createBraceletFixture } from '../../../__tests__/bracelet.factory'
import { BraceletRepositoryMock } from '../../../__tests__/bracelet.repository.mock'
import { BraceletStatus } from '../../../domain/constants/bracelet-status.constant'
import { BraceletNfcIdAlreadyTakenError } from '../../../domain/errors/bracelet.error'
import { CreateBraceletUseCase } from './create-bracelet.use-case'

describe('CreateBraceletUseCase', () => {
  let useCase: CreateBraceletUseCase
  let mockRepository: BraceletRepositoryMock

  beforeEach(() => {
    mockRepository = new BraceletRepositoryMock()
    useCase = new CreateBraceletUseCase(mockRepository)
  })

  it('should create a bracelet with a generated nfcId when none provided', async () => {
    const result = await useCase.execute({})
    expect(result).toBeDefined()
    expect(mockRepository.create_calledWith).not.toBeNull()
    expect(mockRepository.create_calledWith!.nfcId).toBeTruthy()
    expect(mockRepository.create_calledWith!.status).toBe(BraceletStatus.STOCK)
    expect(mockRepository.findByNfcId_calledWith).toBeNull()
  })

  it('should create a bracelet with provided unique nfcId', async () => {
    mockRepository.findByNfcId_result = null
    const result = await useCase.execute({ nfcId: 'custom-nfc-id' })
    expect(result).toBeDefined()
    expect(mockRepository.findByNfcId_calledWith).toBe('custom-nfc-id')
    expect(mockRepository.create_calledWith!.nfcId).toBe('custom-nfc-id')
  })

  it('should throw BraceletNfcIdAlreadyTakenError when nfcId is already taken', async () => {
    mockRepository.findByNfcId_result = createBraceletFixture({ nfcId: 'taken-nfc-id' })
    await expect(useCase.execute({ nfcId: 'taken-nfc-id' })).rejects.toThrow(BraceletNfcIdAlreadyTakenError)
  })
})
