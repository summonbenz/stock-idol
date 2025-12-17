import { getDatabase } from '../../utils/db'
import type { Band } from '../../types'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  
  try {
    const bands = db.prepare('SELECT * FROM bands ORDER BY name').all() as Band[]
    return bands
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch bands'
    })
  }
})
