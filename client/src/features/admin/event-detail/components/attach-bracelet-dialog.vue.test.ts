import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AttachBraceletDialog from './attach-bracelet-dialog.vue'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import type { BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'

const participant: ParticipantDomainModel.ParticipantOverviewDto = {
  id: 'p1',
  userId: 'u1',
  eventId: 'e1',
  braceletId: null,
  profile: { displayName: 'Marie', role: null, bio: null, links: [] },
  registeredAt: '2026-05-01T00:00:00.000Z',
  checkedInAt: null,
  createdAt: '2026-05-01T00:00:00.000Z',
  updatedAt: '2026-05-01T00:00:00.000Z',
}

const availableBracelets: BraceletDomainModel.BraceletOverviewDto[] = [
  {
    id: 'b1', nfcId: 'nfc-001', status: 'pre_activated', userId: null,
    eventId: 'e1', productId: null, orderId: null, activatedAt: null,
    createdAt: '', updatedAt: '',
  },
]

// shadcn Dialog wraps content in a Teleport that JSDOM doesn't render reliably.
// We stub the dialog primitives + the Select primitives to behave as transparent wrappers,
// so the test focuses on the component's own logic (buttons, empty-state copy, confirm flow).
const transparent = { template: '<div><slot /></div>' }
const dialogStubs = {
  Dialog: transparent,
  DialogContent: transparent,
  DialogDescription: transparent,
  DialogFooter: transparent,
  DialogHeader: transparent,
  DialogTitle: transparent,
  Select: transparent,
  SelectContent: transparent,
  SelectItem: transparent,
  SelectTrigger: transparent,
  SelectValue: transparent,
}

describe('AttachBraceletDialog', () => {
  it('disables the confirm button when no bracelet is selected', () => {
    const wrapper = mount(AttachBraceletDialog, {
      props: { participant, availableBracelets, open: true },
      global: { stubs: dialogStubs },
    })
    const confirm = wrapper.findAll('button').find((b) => b.text() === 'Attacher')
    expect(confirm).toBeDefined()
    expect(confirm!.attributes('disabled')).toBeDefined()
  })

  it('renders the empty-state copy when no bracelet is available', () => {
    const wrapper = mount(AttachBraceletDialog, {
      props: { participant, availableBracelets: [], open: true },
      global: { stubs: dialogStubs },
    })
    expect(wrapper.text()).toContain('Aucun bracelet disponible')
  })

  it('emits update:open(false) when cancel is clicked', async () => {
    const wrapper = mount(AttachBraceletDialog, {
      props: { participant, availableBracelets, open: true },
      global: { stubs: dialogStubs },
    })
    const cancel = wrapper.findAll('button').find((b) => b.text() === 'Annuler')
    await cancel?.trigger('click')
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })
})
