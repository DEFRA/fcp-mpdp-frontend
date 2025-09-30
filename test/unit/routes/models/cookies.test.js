import { describe, test, expect } from 'vitest'
import { cookiesModel } from '../../../../src/routes/models/cookies.js'

describe('cookiesModel', () => {
  test('returns correct model when analytics is true', () => {
    const model = cookiesModel({ analytics: true }, true, '/some-path')

    expect(model).toEqual({
      analytics: {
        classes: 'govuk-radios--inline',
        idPrefix: 'analytics',
        name: 'analytics',
        fieldset: {
          legend: {
            text: 'Change your cookie settings',
            classes: 'govuk-fieldset__legend--s'
          }
        },
        hint: {
          text: 'Do you want to accept analytics cookies?'
        },
        items: [
          { value: true, text: 'Yes', checked: true },
          { value: false, text: 'No', checked: false }
        ]
      },
      updated: true,
      referer: '/some-path'
    })
  })

  test('returns correct model when analytics is false', () => {
    const model = cookiesModel({ analytics: false }, false, '/another-path')

    expect(model.analytics.items[0].checked).toBe(false)
    expect(model.analytics.items[1].checked).toBe(true)
    expect(model.updated).toBe(false)
    expect(model.referer).toBe('/another-path')
  })

  test('defaults to empty object when no cookiesPolicy is passed', () => {
    const model = cookiesModel(undefined, false, '')

    expect(model.analytics.items[0].checked).toBe(undefined)
    expect(model.analytics.items[1].checked).toBe(true)
  })

  test('defaults updated and referer when not provided', () => {
    const model = cookiesModel({ analytics: true })

    expect(model.updated).toBe(undefined)
    expect(model.referer).toBe('')
  })
})
