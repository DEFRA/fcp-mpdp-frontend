import { config } from '../../src/config/config.js'

export function expectTitle($, title) {
  const _title = title ? `${title} - ` : ''
  expect($('title').text()).toMatch(`${_title}${config.get('serviceName')} - GOV.UK`)
} 