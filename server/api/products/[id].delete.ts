import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }
  
  try {
    await sql`DELETE FROM products WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete product'
    })
  }
})
