import { getStore } from '@netlify/blobs'

// SVG placeholder image
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <g transform="translate(200,200)">
    <text x="0" y="0" font-size="120" text-anchor="middle" fill="#9ca3af">📦</text>
  </g>
</svg>`

export default defineEventHandler(async (event) => {
  try {
    const filename = getRouterParam(event, 'filename')
    
    if (!filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Filename is required'
      })
    }

    const store = getStore('product-images')
    
    // Check if blob exists first
    const metadata = await store.getMetadata(filename)
    console.log('Fetching metadata for:', filename)
    
    if (!metadata) {
      console.warn(`Image not found in blob storage: ${filename}, returning placeholder`)
      // Return placeholder instead of 404
      setHeader(event, 'Content-Type', 'image/svg+xml')
      setHeader(event, 'Cache-Control', 'public, max-age=3600')
      return PLACEHOLDER_SVG
    }
    
    // Get the blob data
    const blob = await store.get(filename, { type: 'arrayBuffer' })
    
    if (!blob) {
      console.warn(`Failed to retrieve blob data: ${filename}, returning placeholder`)
      setHeader(event, 'Content-Type', 'image/svg+xml')
      setHeader(event, 'Cache-Control', 'public, max-age=3600')
      return PLACEHOLDER_SVG
    }
    
    const contentType = metadata.contentType || 'image/jpeg'
    
    // Set response headers
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    
    return blob
  } catch (error: any) {
    console.error('Error retrieving image:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve image'
    })
  }
})
