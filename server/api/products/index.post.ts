import { getDatabase } from '../../utils/db'
import type { Product } from '../../types'

export default defineEventHandler(async (event) => {
  const sql = getDatabase()
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
    const productName = body.product_name.trim()
    const variant = body.variant?.trim() || null
    const imageUrl = body.image_url || null
    const price = body.price || 0
    const artistId = body.artist_id || null
    const categoryId = body.category_id
    const stockQuantity = body.stock_quantity || 0
    
    await sql`
      INSERT INTO products (product_name, variant, image_url, price, artist_id, category_id, stock_quantity)
      VALUES (${productName}, ${variant}, ${imageUrl}, ${price}, ${artistId}, ${categoryId}, ${stockQuantity})
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
      WHERE p.product_name = ${productName}
      ORDER BY p.id DESC
      LIMIT 1
    `
    
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
