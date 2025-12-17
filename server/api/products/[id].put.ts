import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }
  
  try {
    const productName = body.product_name.trim()
    const variant = body.variant?.trim() || null
    const imageUrl = body.image_url || null
    const price = body.price || 0
    const artistId = body.artist_id || null
    const categoryId = body.category_id
    const stockQuantity = body.stock_quantity || 0
    
    await sql`
      UPDATE products 
      SET product_name = ${productName}, variant = ${variant}, image_url = ${imageUrl}, 
          price = ${price}, artist_id = ${artistId}, category_id = ${categoryId}, 
          stock_quantity = ${stockQuantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    
    const [product] = await sql`
      SELECT 
        p.*,
        c.name as category_name,
        a.name as artist_name,
        b.name as band_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN artists a ON p.artist_id = a.id
      LEFT JOIN bands b ON a.band_id = b.id
      WHERE p.id = ${id}
    `
    
    return product
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update product'
    })
  }
})
