import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  const name = event.context.params?.filename
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Image name missing' })
  }

  const store = getStore('product-images')
  const blob = await store.get(name, { type: 'arrayBuffer' })

  if (!blob) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  setHeader(event, 'Content-Type', blob.metadata?.contentType || 'image/jpeg')
  console.log('Blob:', blob)
  return new Uint8Array(blob.data)
})