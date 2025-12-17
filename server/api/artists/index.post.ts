import { getDatabase } from '../../utils/db'
import type { Artist } from '../../types'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
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
    const stmt = db.prepare('INSERT INTO artists (name, band_id) VALUES (?, ?)')
    const result = stmt.run(body.name.trim(), body.band_id)
    
    const artist = db.prepare(`
      SELECT a.*, b.name as band_name
      FROM artists a
      JOIN bands b ON a.band_id = b.id
      WHERE a.id = ?
    `).get(result.lastInsertRowid) as Artist
    
    return artist
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create artist'
    })
  }
})
