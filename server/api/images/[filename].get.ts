import { getStore } from '@netlify/blobs'

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
    const blob = await store.get(filename, { type: 'arrayBuffer' })
    
    if (!blob) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Image not found'
      })
    }
    
    // Get metadata to determine content type
    const metadata = await store.getMetadata(filename)
    const contentType = metadata?.contentType || 'image/jpeg'
    
    // Set response headers
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    
    return blob
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to retrieve image'
    })
  }
})
