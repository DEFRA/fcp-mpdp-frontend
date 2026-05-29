import { getSafeRedirect } from './get-safe-redirect.js'

export function getRefererPath (url, hostname) {
  const normalizedHostname = typeof hostname === 'string' ? hostname.trim().toLowerCase() : ''

  if (!url || typeof url !== 'string') {
    return '/'
  }

  if (url.startsWith('/') && !url.startsWith('//')) {
    return url
  }

  try {
    const { protocol, hostname: urlHostname, pathname, search } = new URL(url)
    const normalizedUrlHostname = urlHostname.trim().toLowerCase()
    if ((protocol === 'http:' || protocol === 'https:') && normalizedUrlHostname === normalizedHostname) {
      return getSafeRedirect(pathname + search) || '/'
    }
  } catch {
    // Not a valid absolute URL
  }

  return '/'
}
