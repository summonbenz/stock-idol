import { neon } from '@netlify/neon'

let sql: ReturnType<typeof neon> | null = null
let schemaInitialized = false

export function getDatabase() {
  if (!sql) {
    sql = neon() // automatically uses env NETLIFY_DATABASE_URL
    
    // Initialize database schema once
    if (!schemaInitialized) {
      initializeSchema()
      schemaInitialized = true
    }
  }
  
  return sql
}

async function initializeSchema() {
  if (!sql) return
  
  try {
    // สร้างตารางสำหรับประเภทสินค้า
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // สร้างตารางสำหรับวง
    await sql`
      CREATE TABLE IF NOT EXISTS bands (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // สร้างตารางสำหรับศิลปิน (ต้องอยู่ในวงเสมอ)
    await sql`
      CREATE TABLE IF NOT EXISTS artists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        band_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE
      )
    `
    
    // สร้างตารางสำหรับสินค้า
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        product_name TEXT NOT NULL,
        variant TEXT,
        image_url TEXT,
        price NUMERIC DEFAULT 0,
        artist_id INTEGER,
        category_id INTEGER NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
      )
    `
    
    // สร้าง index สำหรับการค้นหา
    await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_products_artist ON products(artist_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_artists_band ON artists(band_id)`
    
    console.log('Database schema initialized successfully')
  } catch (error) {
    console.error('Error initializing schema:', error)
  }
}
