import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Band ID is required'
    })
  }
  
  try {
    const stmt = db.prepare('DELETE FROM bands WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Band not found'
      })
    }
    
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete band'
    })
  }
})
