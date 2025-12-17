import { getDatabase } from '../../utils/db'
import type { Product } from '../../types'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)
  
  // Validation
  if (!body.product_name || body.product_name.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product name is required'
    })
  }
  
  if (!body.category_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category is required'
    })
  }
  
  try {
    const stmt = db.prepare(`
      INSERT INTO products (product_name, variant, image_url, price, artist_id, category_id, stock_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      body.product_name.trim(),
      body.variant?.trim() || null,
      body.image_url || null,
      body.price || 0,
      body.artist_id || null,
      body.category_id,
      body.stock_quantity || 0
    )
    
    const product = db.prepare(`
      SELECT 
        p.*,
        c.name as category_name,
        a.name as artist_name,
        b.name as band_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN artists a ON p.artist_id = a.id
      LEFT JOIN bands b ON a.band_id = b.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid)
    
    return product
  } catch (error: any) {
    console.error('Error creating product:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create product',
      data: { originalError: error.message }
    })
  }
})
