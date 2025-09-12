import staticAmounts from '../../src/data/filters/amounts.js'

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

export function getMatchingStaticAmount (amounts) {
  if (!amounts?.length) {
    return []
  }

  const _amounts = amounts?.map(x => parseFloat(x))

  const returnAmounts = staticAmounts.filter(range => {
    const [from, to] = range.value.split('-')
    return _amounts?.some(amount => {
      if (!to) {
        return amount > parseFloat(from)
      }

      return amount >= parseFloat(from) && amount <= parseFloat(to)
    })
  })

  return returnAmounts
}

