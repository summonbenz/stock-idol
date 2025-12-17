import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }
  
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET product_name = ?, variant = ?, image_url = ?, price = ?, artist_id = ?, category_id = ?, 
          stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    const result = stmt.run(
      body.product_name.trim(),
      body.variant?.trim() || null,
      body.image_url || null,
      body.price || 0,
      body.artist_id || null,
      body.category_id,
      body.stock_quantity || 0,
      id
    )
    
    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }
    
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
    `).get(id)
    
    return product
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update product'
    })
  }
})
