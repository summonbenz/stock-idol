import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Artist ID is required'
    })
  }
  
  try {
    await sql`DELETE FROM artists WHERE id = ${id}`
    return { success: true }
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY' || error.message?.includes('FOREIGN KEY')) {
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
