import { getStore } from '@netlify/blobs'

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event)
    
    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }
    
    const file = form[0]
    
    if (!file.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file'
      })
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (file.type && !allowedTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'
      })
    }
    
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const timestamp = Date.now()
    const ext = file.filename.split('.').pop()
    const filename = `${timestamp}.${ext}`
    
    // Upload to Netlify Blob
    const store = getStore('product-images')
    await store.set(filename, file.data, {
      metadata: {
        originalName: file.filename,
        contentType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString()
      }
    })
    
    // ส่งกลับ URL ของรูปภาพ
    return {
      url: `/api/images/${filename}`
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload file'
    })
  }
})
