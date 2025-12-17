import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Artist name is required'
    })
  }
  
  try {
    const stmt = db.prepare('UPDATE artists SET name = ? WHERE id = ?')
    stmt.run(body.name.trim(), id)
    
    const artist = db.prepare(`
      SELECT a.*, b.name as band_name
      FROM artists a
      JOIN bands b ON a.band_id = b.id
      WHERE a.id = ?
    `).get(id)
    
    return artist
  } catch (error: any) {
    console.error('Error updating artist:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update artist',
      data: { originalError: error.message }
    })
  }
})
