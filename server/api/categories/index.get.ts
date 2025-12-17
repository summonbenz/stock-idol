import { getDatabase } from '../../utils/db'
import type { Category } from '../../types'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all() as Category[]
    return categories
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories'
    })
  }
})
