import { getDatabase } from '../../utils/db'
import type { Band } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const body = await readBody(event)
  
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Band name is required'
    })
  }
  
  try {
    const name = body.name.trim()
    await sql`INSERT INTO bands (name) VALUES (${name})`
    
    const [band] = await sql`SELECT * FROM bands WHERE name = ${name}`
    return band as Band
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message?.includes('UNIQUE')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Band name already exists'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create band'
    })
  }
})
