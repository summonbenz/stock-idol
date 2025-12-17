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
    await store.delete(filename)
    
    return {
      success: true,
      message: 'Image deleted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete image'
    })
  }
})
