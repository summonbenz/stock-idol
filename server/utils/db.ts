import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    const dataDir = join(process.cwd(), 'data')
    
    // Ensure data directory exists
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }
    
    const dbPath = join(dataDir, 'stock-idol.db')
    db = new Database(dbPath)
    
    // สร้างตารางสำหรับประเภทสินค้า
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // สร้างตารางสำหรับวง
    db.exec(`
      CREATE TABLE IF NOT EXISTS bands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // สร้างตารางสำหรับศิลปิน (ต้องอยู่ในวงเสมอ)
    db.exec(`
      CREATE TABLE IF NOT EXISTS artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        band_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (band_id) REFERENCES bands(id) ON DELETE CASCADE
      )
    `)
    
    // สร้างตารางสำหรับสินค้า
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        variant TEXT,
        image_url TEXT,
        artist_id INTEGER,
        category_id INTEGER NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL
      )
    `)
    
    // สร้าง index สำหรับการค้นหา
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_artist ON products(artist_id);
      CREATE INDEX IF NOT EXISTS idx_artists_band ON artists(band_id);
    `)
    
    // Migration: Add image_url column if it doesn't exist
    try {
      const columns = db.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>
      const hasImageUrl = columns.some(col => col.name === 'image_url')
      const hasPrice = columns.some(col => col.name === 'price')
      
      if (!hasImageUrl) {
        console.log('Adding image_url column to products table...')
        db.exec('ALTER TABLE products ADD COLUMN image_url TEXT')
        console.log('image_url column added successfully')
      }
      
      if (!hasPrice) {
        console.log('Adding price column to products table...')
        db.exec('ALTER TABLE products ADD COLUMN price REAL DEFAULT 0')
        console.log('price column added successfully')
      }
    } catch (error) {
      console.error('Migration error:', error)
    }
  }
  
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
