import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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
    
    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const timestamp = Date.now()
    const ext = file.filename.split('.').pop()
    const filename = `${timestamp}.${ext}`
    const filepath = join(uploadsDir, filename)
    
    // บันทึกไฟล์
    await writeFile(filepath, file.data)
    
    // ส่งกลับ URL ของรูปภาพ
    return {
      url: `/uploads/${filename}`
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload file'
    })
  }
})
