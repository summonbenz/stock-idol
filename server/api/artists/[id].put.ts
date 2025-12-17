import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Artist name is required'
    })
  }
  
  try {
    const name = body.name.trim()
    
    await sql`UPDATE artists SET name = ${name} WHERE id = ${id}`
    
    const [artist] = await sql`
      SELECT a.*, b.name as band_name
      FROM artists a
      JOIN bands b ON a.band_id = b.id
      WHERE a.id = ${id}
    `
    
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
