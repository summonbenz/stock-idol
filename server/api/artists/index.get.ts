import { getDatabase } from '../../utils/db'
import type { Artist } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  
  try {
    const artists = await sql`
      SELECT a.*, b.name as band_name
      FROM artists a
      JOIN bands b ON a.band_id = b.id
      ORDER BY b.name, a.name
    `
    return artists as Artist[]
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch artists'
    })
  }
})
