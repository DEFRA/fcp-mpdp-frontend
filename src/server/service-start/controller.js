export const serviceStartController = {
  handler(_request, h) {
    return h.view('service-start/index', {
      pageTitle: 'Home',
      heading: 'Home'
    })
  }
}
