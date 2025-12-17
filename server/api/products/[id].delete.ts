import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }
  
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?')
    const result = stmt.run(id)
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }
    
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete product'
    })
  }
})
