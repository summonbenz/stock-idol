import { getStore } from '@netlify/blobs'

// SVG placeholder image
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#f3f4f6"/>
  <g transform="translate(200,200)">
    <text x="0" y="0" font-size="120" text-anchor="middle" fill="#9ca3af">📦</text>
  </g>
</svg>`

export default defineEventHandler(async (event) => {
  const name = event.context.params?.filename
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Image name missing' })
  }

  const store = getStore('product-images')
  
  // Get metadata first to check if exists and get content type
  const metadata = await store.getMetadata(name)
  
  if (!metadata) {
    console.warn(`Image not found: ${name}, returning placeholder`)
    setHeader(event, 'Content-Type', 'image/svg+xml')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return PLACEHOLDER_SVG
  }

  // Get the blob as arrayBuffer
  const blob = await store.get(name, { type: 'arrayBuffer' })

  if (!blob) {
    console.warn(`Failed to get blob: ${name}, returning placeholder`)
    setHeader(event, 'Content-Type', 'image/svg+xml')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return PLACEHOLDER_SVG
  }

  // Convert ArrayBuffer to Buffer for proper binary response
  const buffer = Buffer.from(blob)

  // Set proper headers
  setHeader(event, 'Content-Type', metadata.contentType || 'image/jpeg')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  setHeader(event, 'Content-Length', buffer.length.toString())
  
  // Return the buffer
  return buffer
})