export const helloWorld = {
  method: 'GET',
  path: '/hello-world',
  handler: function (_request, h) {
    return h.view('hello-world')
  }
}
