import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Artist ID is required'
    })
  }
  
  try {
    const stmt = db.prepare('DELETE FROM artists WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Artist not found'
      })
    }
    
    return { success: true }
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete artist: it is being used by products'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete artist'
    })
  }
})
