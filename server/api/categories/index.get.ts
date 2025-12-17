import { getDatabase } from '../../utils/db'
import type { Category } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  
  try {
    const categories = await sql`SELECT * FROM categories ORDER BY name`
    return categories as Category[]
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories'
    })
  }
})
