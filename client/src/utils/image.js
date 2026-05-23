const CLOUDINARY_UPLOAD_MARKER = '/upload/'

const isCloudinaryUrl = (url) =>
  typeof url === 'string' &&
  url.includes('res.cloudinary.com') &&
  url.includes(CLOUDINARY_UPLOAD_MARKER)

const injectCloudinaryTransform = (url, transform) => {
  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER)
  if (markerIndex === -1) return url

  const prefix = url.slice(0, markerIndex + CLOUDINARY_UPLOAD_MARKER.length)
  const suffix = url.slice(markerIndex + CLOUDINARY_UPLOAD_MARKER.length)
  return `${prefix}${transform}/${suffix}`
}

export const getOptimizedImageUrl = (url, width = 800) => {
  if (!isCloudinaryUrl(url)) return url

  const roundedWidth = Math.max(200, Math.round(width))
  const quality = roundedWidth <= 320 ? 'q_92' : 'q_88'
  const transform = `f_auto,${quality},c_limit,w_${roundedWidth}`
  return injectCloudinaryTransform(url, transform)
}

export const getOptimizedImageSrcSet = (url, baseWidth = 400) => {
  if (!isCloudinaryUrl(url)) return undefined

  const oneX = getOptimizedImageUrl(url, baseWidth)
  const twoX = getOptimizedImageUrl(url, baseWidth * 2)
  const threeX = getOptimizedImageUrl(url, baseWidth * 3)
  return `${oneX} 1x, ${twoX} 2x, ${threeX} 3x`
}
