import { getDatabase } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const bandId = getRouterParam(event, 'bandId')
  
  if (!bandId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Band ID is required'
    })
  }
  
  try {
    const artists = await sql`SELECT * FROM artists WHERE band_id = ${bandId} ORDER BY name`
    return artists
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch artists for band'
    })
  }
})
