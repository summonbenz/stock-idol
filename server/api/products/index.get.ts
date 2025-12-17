import { getDatabase } from '../../utils/db'
import type { ProductWithDetails } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  
  try {
    const products = await sql`
      SELECT 
        p.*,
        c.name as category_name,
        a.name as artist_name,
        b.name as band_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN artists a ON p.artist_id = a.id
      LEFT JOIN bands b ON a.band_id = b.id
      ORDER BY p.created_at DESC
    `
    
    return products as ProductWithDetails[]
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    })
  }
})
