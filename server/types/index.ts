export interface Category {
  id?: number
  name: string
  created_at?: string
}

export interface Band {
  id?: number
  name: string
  created_at?: string
}

export interface Artist {
  id?: number
  name: string
  band_id: number
  created_at?: string
}

export interface Product {
  id?: number
  product_name: string
  variant?: string | null
  image_url?: string | null
  price?: number
  artist_id?: number | null
  category_id: number
  stock_quantity: number
  created_at?: string
  updated_at?: string
}

export interface ProductWithDetails extends Product {
  category_name?: string
  artist_name?: string
  band_name?: string
}

export interface ArtistWithBand extends Artist {
  band_name?: string
}

export interface BandWithArtists extends Band {
  artists?: Artist[]
}
