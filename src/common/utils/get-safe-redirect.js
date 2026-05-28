export function getSafeRedirect (url) {
  if (!url || typeof url !== 'string') {
    return ''
  }
  return (url.startsWith('/') && !url.startsWith('//')) ? url : ''
}
