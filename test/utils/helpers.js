export function getOptions (page, method = 'GET', params = {}, listParams = {}) {
  const urlParams = new URLSearchParams(params)
  for (const key in listParams) {
    listParams[key].forEach(value => {
      urlParams.append(key, value)
    })
  }

  return {
    method,
    url: `/${page}?${urlParams.toString()}`
  }
}
