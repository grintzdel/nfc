import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LinkIcon from './link-icon.vue'
import { Linkedin, Twitter, Github, Globe, Mail, Link as LinkIconLucide } from 'lucide-vue-next'

describe('LinkIcon', () => {
  const cases: Array<[string, unknown]> = [
    ['linkedin', Linkedin],
    ['twitter', Twitter],
    ['github', Github],
    ['website', Globe],
    ['email', Mail],
    ['custom', LinkIconLucide],
  ]
  for (const [type, Comp] of cases) {
    it(`renders ${type} icon`, () => {
      const wrapper = mount(LinkIcon, { props: { type } })
      expect(wrapper.findComponent(Comp as never).exists()).toBe(true)
    })
  }
})
