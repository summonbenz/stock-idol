import { getStore } from '@netlify/blobs'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  const name = event.context.params?.filename
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Image name missing' })
  }

  const store = getStore('product-images')

  const blob = await store.get(name) // ❗ ไม่ต้องใส่ type

  if (!blob || !blob.body) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  setHeader(
    event,
    'Content-Type',
    blob.metadata?.contentType || 'image/jpeg'
  )

  // ✅ ส่ง stream ตรง (ดีที่สุด)
  return sendStream(event, blob.body)
})