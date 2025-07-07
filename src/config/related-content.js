const relatedContentLinks = [
  {
    id: 'fflmLink',
    text: 'Funding for farmers, growers and land managers',
    url: 'https://www.gov.uk/guidance/funding-for-farmers',
    pages: ['service-start', 'search', 'details', 'scheme-payments-by-year']
  }
]

const getRelatedContentLinks = (page) => {
  return relatedContentLinks.filter((relatedContent) =>
    relatedContent.pages.includes(page)
  )
}

export { relatedContentLinks, getRelatedContentLinks }
