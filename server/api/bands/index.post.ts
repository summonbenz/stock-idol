import { getDatabase } from '../../utils/db'
import type { Band } from '../../types'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)
  
  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Band name is required'
    })
  }
  
  try {
    const stmt = db.prepare('INSERT INTO bands (name) VALUES (?)')
    const result = stmt.run(body.name.trim())
    
    const band = db.prepare('SELECT * FROM bands WHERE id = ?').get(result.lastInsertRowid) as Band
    return band
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
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
