const relatedContentLinks = [
  {
    id: 'fflmLink',
    text: 'Funding for farmers, growers and land managers',
    url: 'https://www.gov.uk/guidance/funding-for-farmers',
    pages: ['service-start']
  }
]

const getRelatedContentLinks = (page) => {
  return relatedContentLinks.filter((relatedContent) =>
    relatedContent.pages.includes(page)
  )
}

module.exports = {
  relatedContentLinks,
  getRelatedContentLinks
}
