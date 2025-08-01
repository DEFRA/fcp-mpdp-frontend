const relatedContentText = 'Funding for farmers, growers and land managers'
const relatedContentLink = 'https://www.gov.uk/guidance/funding-for-farmers'

export function expectRelatedContent($) {
  const link = $('#related-content-list a.govuk-link')

  expect(link.length).toBe(1)
  expect(link.text().trim()).toBe(relatedContentText)
  expect(link.attr('href')).toBe(relatedContentLink)
}
