export const startController = {
  handler(_request, h) {
    return h.view('start/index', {
      pageTitle: 'Find farm and land payment data',
      heading: 'Find farm and land payment data'
    })
  }
}
