import { expect } from 'vitest'

export function expectBackLink ($) {
  const backLink = $('.govuk-back-link')

  expect(backLink).toBeDefined()
  expect(backLink.text()).toMatch('Back')
}
