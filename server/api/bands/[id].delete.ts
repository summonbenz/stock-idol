import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Band ID is required'
    })
  }
  
  try {
    await sql`DELETE FROM bands WHERE id = ${id}`
    return { success: true }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete band'
    })
  }
})
