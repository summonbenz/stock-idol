import { getStore } from '@netlify/blobs'
import { send } from 'h3'

export default defineEventHandler(async (event) => {
  const name = event.context.params?.filename
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Image name missing' })
  }

  const store = getStore('product-images')

  const blob = await store.get(name, {
    type: 'arrayBuffer'
  })

  if (!blob) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  // ✅ สำคัญมาก
  setHeader(
    event,
    'Content-Type',
    blob.metadata?.contentType || 'image/jpeg'
  )

  // ✅ ต้องใช้ send
  return send(event, Buffer.from(blob.data))
})
