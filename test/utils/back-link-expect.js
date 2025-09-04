import { expect } from 'vitest'

export function expectBackLink ($, href) {
  const backLink = $('.govuk-back-link')

  expect(backLink).toBeDefined()
  expect(backLink.text()).toMatch('Back')
  expect(backLink.attr('href')).toBe(href)
}
