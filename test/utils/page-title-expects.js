import { config } from '../../src/config/config.js'

export const expectPageTitle = ($, pageTitle) => {
  const _pageTitle = pageTitle ? `${pageTitle} -` : ''
  expect($('title').text()).toMatch(
    `${_pageTitle}${config.serviceName} - GOV.UK`
  )
}
