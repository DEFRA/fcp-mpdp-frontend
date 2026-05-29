import { getSafeRedirect } from './get-safe-redirect.js'

export function getRefererPath (url, hostname) {
  if (!url || typeof url !== 'string') {
    return '/'
  }

  if (url.startsWith('/') && !url.startsWith('//')) {
    return url
  }

  try {
    const { protocol, hostname: urlHostname, pathname, search } = new URL(url)
    if ((protocol === 'http:' || protocol === 'https:') && urlHostname === hostname) {
      return getSafeRedirect(pathname + search) || '/'
    }
  } catch {
    // Not a valid absolute URL
  }

  return '/'
}
