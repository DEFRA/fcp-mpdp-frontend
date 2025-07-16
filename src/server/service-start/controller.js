export const serviceStartController = {
  handler(_request, h) {
    return h.view('service-start/index', {
      pageTitle: 'Find farm and land payment data',
      heading: 'Find farm and land payment data'
    })
  }
}
