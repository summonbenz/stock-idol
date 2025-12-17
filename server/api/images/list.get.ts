import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  try {
    const store = getStore('product-images')
    const { blobs } = await store.list()
    
    return {
      images: blobs.map(blob => ({
        key: blob.key,
        url: `/api/images/${blob.key}`,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      })),
      total: blobs.length
    }
  } catch (error: any) {
    console.error('Error listing images:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to list images'
    })
  }
})
