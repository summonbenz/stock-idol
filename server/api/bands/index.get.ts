import { getDatabase } from '../../utils/db'
import type { Band } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  
  try {
    const bands = await sql`SELECT * FROM bands ORDER BY name`
    return bands as Band[]
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch bands'
    })
  }
})
