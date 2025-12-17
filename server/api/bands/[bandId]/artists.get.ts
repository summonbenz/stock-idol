import { getDatabase } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const bandId = getRouterParam(event, 'bandId')
  
  if (!bandId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Band ID is required'
    })
  }
  
  try {
    const artists = db.prepare('SELECT * FROM artists WHERE band_id = ? ORDER BY name').all(bandId)
    return artists
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch artists for band'
    })
  }
})
