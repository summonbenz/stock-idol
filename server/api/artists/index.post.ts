import { getDatabase } from '../../utils/db'
import type { Artist } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const body = await readBody(event)
  
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Artist name is required'
    })
  }
  
  if (!body.band_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Band is required'
    })
  }
  
  try {
    const name = body.name.trim()
    const bandId = body.band_id
    
    await sql`INSERT INTO artists (name, band_id) VALUES (${name}, ${bandId})`
    
    const [artist] = await sql`
      SELECT a.*, b.name as band_name
      FROM artists a
      JOIN bands b ON a.band_id = b.id
      WHERE a.name = ${name} AND a.band_id = ${bandId}
      ORDER BY a.id DESC
      LIMIT 1
    `
    
    return artist as Artist
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create artist'
    })
  }
})
