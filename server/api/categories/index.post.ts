import { getDatabase } from '../../utils/db'
import type { Category } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const body = await readBody(event)
  
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category name is required'
    })
  }
  
  try {
    const name = body.name.trim()
    await sql`INSERT INTO categories (name) VALUES (${name})`
    
    const [category] = await sql`SELECT * FROM categories WHERE name = ${name}`
    return category as Category
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('UNIQUE')) {
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
