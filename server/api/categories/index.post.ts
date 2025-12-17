import { getDatabase } from '../../utils/db'
import type { Category } from '../../types'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)
  
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category name is required'
    })
  }
  
  try {
    const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)')
    const result = stmt.run(body.name.trim())
    
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as Category
    return category
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Category name already exists'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create category'
    })
  }
})
