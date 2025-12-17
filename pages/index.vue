<script setup lang="ts">
import type { ProductWithDetails, Category, Band, Artist } from '../server/types'

const products = ref<ProductWithDetails[]>([])
const categories = ref<Category[]>([])
const bands = ref<Band[]>([])
const artists = ref<Artist[]>([])

// Filter state
const productFilter = ref({
  search: '',
  category_id: null as number | null,
  band_id: null as number | null,
  artist_id: null as number | null,
  inStockOnly: false,
  favoriteOnly: false
})

// Favorites state (stored in localStorage)
const favorites = ref<number[]>([])

// View mode
const viewMode = ref<'grid' | 'table'>('table')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 50

// Fetch data
const fetchProducts = async () => {
  try {
    products.value = await $fetch<ProductWithDetails[]>('/api/products')
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await $fetch<Category[]>('/api/categories')
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const fetchBands = async () => {
  try {
    bands.value = await $fetch<Band[]>('/api/bands')
  } catch (error) {
    console.error('Failed to fetch bands:', error)
  }
}

const fetchArtists = async () => {
  try {
    artists.value = await $fetch<Artist[]>('/api/artists')
  } catch (error) {
    console.error('Failed to fetch artists:', error)
  }
}

// Computed
const sortedBands = computed(() => {
  return [...bands.value].sort((a, b) => a.name.localeCompare(b.name, 'th'))
})

const filterArtists = computed(() => {
  if (!productFilter.value.band_id) return []
  return artists.value
    .filter(a => a.band_id === productFilter.value.band_id)
    .sort((a, b) => a.name.localeCompare(b.name, 'th'))
})

const filteredProducts = computed(() => {
  let filtered = [...products.value]
  
  // Search filter
  if (productFilter.value.search) {
    const search = productFilter.value.search.toLowerCase()
    filtered = filtered.filter(p => 
      p.product_name.toLowerCase().includes(search) ||
      p.variant?.toLowerCase().includes(search)
    )
  }
  
  // Category filter
  if (productFilter.value.category_id) {
    filtered = filtered.filter(p => p.category_id === productFilter.value.category_id)
  }
  
  // Artist filter (includes band filter)
  if (productFilter.value.artist_id) {
    filtered = filtered.filter(p => p.artist_id === productFilter.value.artist_id)
  } else if (productFilter.value.band_id) {
    // Filter by band when no artist is selected
    const bandArtistIds = artists.value
      .filter(a => a.band_id === productFilter.value.band_id)
      .map(a => a.id)
    filtered = filtered.filter(p => 
      !p.artist_id || bandArtistIds.includes(p.artist_id)
    )
  }
  
  // In stock filter
  if (productFilter.value.inStockOnly) {
    filtered = filtered.filter(p => p.stock_quantity > 0)
  }
  
  // Favorite filter
  if (productFilter.value.favoriteOnly) {
    filtered = filtered.filter(p => favorites.value.includes(p.id))
  }
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

// Favorites methods
const toggleFavorite = (productId: number) => {
  const index = favorites.value.indexOf(productId)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(productId)
  }
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('favorite-products', JSON.stringify(favorites.value))
  }
}

const isFavorite = (productId: number) => {
  return favorites.value.includes(productId)
}

// Methods
const clearFilters = () => {
  productFilter.value = {
    search: '',
    category_id: null,
    band_id: null,
    artist_id: null,
    inStockOnly: false,
    favoriteOnly: false
  }
}

const onFilterBandChange = () => {
  productFilter.value.artist_id = null
  currentPage.value = 1
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Watch filters to reset pagination
watch([() => productFilter.value.search, () => productFilter.value.category_id, 
       () => productFilter.value.artist_id, () => productFilter.value.inStockOnly, 
       () => productFilter.value.favoriteOnly], () => {
  currentPage.value = 1
})

// Initialize
onMounted(() => {
  // Load favorites from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('favorite-products')
    if (saved) {
      favorites.value = JSON.parse(saved)
    }
  }
  
  fetchProducts()
  fetchCategories()
  fetchBands()
  fetchArtists()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-3">
              <span class="text-5xl">✨</span>
              Bentoshop Idol
            </h1>
            <p class="text-purple-100 text-lg">ระบบแสดงสต็อกสินค้าศิลปินไอดอล</p>
          </div>
          <!-- <NuxtLink 
            to="/admin" 
            class="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-300 border-2 border-white/30"
          >
            🔐 เข้าสู่ระบบ Admin
          </NuxtLink> -->
        </div>
      </div>
    </div>

    <div :class="[
      'mx-auto px-4 sm:px-6 lg:px-8 py-8',
      viewMode === 'table' ? 'max-w-[1500px]' : 'max-w-7xl'
    ]">
      <!-- Stats -->
      <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium">สินค้าทั้งหมด</p>
              <h3 class="text-4xl font-bold mt-2">{{ filteredProducts.length }}</h3>
            </div>
            <div class="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <span class="text-5xl">📦</span>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-pink-100 text-sm font-medium">ประเภทสินค้า</p>
              <h3 class="text-4xl font-bold mt-2">{{ categories.length }}</h3>
            </div>
            <div class="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <span class="text-5xl">📁</span>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-indigo-100 text-sm font-medium">วง/กลุ่ม</p>
              <h3 class="text-4xl font-bold mt-2">{{ bands.length }}</h3>
            </div>
            <div class="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <span class="text-5xl">🎵</span>
            </div>
          </div>
        </div>
      </div> -->

      <!-- Product List -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-white flex items-center">
              <span class="text-3xl mr-3">📋</span>
              รายการสินค้า
              <span class="ml-3 bg-white/20 px-4 py-1 rounded-full text-lg backdrop-blur-sm">
                {{ filteredProducts.length }} รายการ
              </span>
            </h2>
            
            <!-- View Mode Toggle -->
            <div class="flex gap-2 bg-white/20 rounded-lg p-1">
              <button
                @click="viewMode = 'table'"
                :class="[
                  'px-4 py-2 rounded-lg font-semibold transition-all duration-200',
                  viewMode === 'table' 
                    ? 'bg-white text-purple-600' 
                    : 'text-white hover:bg-white/20'
                ]"
              >
                📊 ตาราง
              </button>
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'px-4 py-2 rounded-lg font-semibold transition-all duration-200',
                  viewMode === 'grid' 
                    ? 'bg-white text-purple-600' 
                    : 'text-white hover:bg-white/20'
                ]"
              >
                🎨 การ์ด
              </button>
            </div>
          </div>
        </div>
        
        <!-- Filter Section -->
        <div class="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-2">🔍 ค้นหา</label>
              <input
                v-model="productFilter.search"
                type="text"
                placeholder="ชื่อสินค้า หรือ Variant"
                class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-2">📂 ประเภท</label>
              <select
                v-model="productFilter.category_id"
                class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option :value="null">ทั้งหมด</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-2">🎵 วง</label>
              <select
                v-model="productFilter.band_id"
                @change="onFilterBandChange"
                class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                <option :value="null">ทั้งหมด</option>
                <option v-for="band in sortedBands" :key="band.id" :value="band.id">{{ band.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-2">⭐ ศิลปิน</label>
              <select
                v-model="productFilter.artist_id"
                :disabled="!productFilter.band_id"
                class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:bg-gray-100"
              >
                <option :value="null">{{ productFilter.band_id ? 'ทั้งหมด' : 'เลือกวงก่อน' }}</option>
                <option v-for="artist in filterArtists" :key="artist.id" :value="artist.id">{{ artist.name }}</option>
              </select>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="productFilter.inStockOnly"
                  type="checkbox"
                  class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span class="text-sm font-semibold text-gray-700">📦 แสดงเฉพาะสินค้าที่มีสต็อก</span>
              </label>
              
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="productFilter.favoriteOnly"
                  type="checkbox"
                  class="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span class="text-sm font-semibold text-gray-700">⭐ แสดงเฉพาะสินค้าที่ชื่นชอบ</span>
              </label>
            </div>
            
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 text-sm"
            >
              ❌ ล้างตัวกรอง
            </button>
          </div>
        </div>
        
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl transform hover:scale-105 overflow-hidden"
            >
              <div class="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
                <img 
                  v-if="product.image_url" 
                  :src="`/api/images/${product.image_url}`" 
                  :alt="product.product_name"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-8xl">📦</span>
              </div>
              
              <div class="p-4 space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <h3 class="text-lg font-bold text-gray-900 truncate flex-1">{{ product.product_name }}</h3>
                  <button
                    @click="toggleFavorite(product.id)"
                    class="text-2xl hover:scale-125 transition-transform duration-200 flex-shrink-0"
                    :title="isFavorite(product.id) ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'"
                  >
                    {{ isFavorite(product.id) ? '⭐' : '☆' }}
                  </button>
                </div>
                
                <div v-if="product.variant" class="flex items-center gap-2">
                  <span class="text-xs">🎨</span>
                  <span class="px-2 py-1 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 rounded-full text-xs font-bold">
                    {{ product.variant }}
                  </span>
                </div>
                
                <div class="flex items-center gap-2">
                  <span class="text-xs">📂</span>
                  <span class="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-bold">
                    {{ product.category_name }}
                  </span>
                </div>
                
                <div v-if="product.band_name" class="flex items-center gap-2">
                  <span class="text-xs">🎵</span>
                  <span class="px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-bold truncate">
                    {{ product.band_name }}
                  </span>
                </div>
                
                <div v-if="product.artist_name" class="flex items-center gap-2">
                  <span class="text-xs">⭐</span>
                  <span class="text-sm font-medium text-gray-700 truncate">{{ product.artist_name }}</span>
                </div>
                
                <div class="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <div class="text-lg font-bold text-purple-600">
                    {{ product.price ? product.price.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00' }} ฿
                  </div>
                  <div :class="[
                    'px-3 py-1 rounded-full text-xs font-bold',
                    product.stock_quantity > 10 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                    product.stock_quantity > 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                    'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                  ]">
                    {{ product.stock_quantity > 0 ? `สต็อก: ${product.stock_quantity}` : 'หมด' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="filteredProducts.length === 0" class="text-center py-16">
            <span class="text-8xl mb-4 block">🔍</span>
            <p class="text-gray-500 font-semibold text-xl">ไม่พบสินค้าที่ค้นหา</p>
          </div>
          
          <!-- Pagination for Grid -->
          <div v-if="filteredProducts.length > 0 && totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              ← ก่อนหน้า
            </button>
            
            <div class="flex gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-4 py-2 rounded-lg font-semibold transition-all',
                  currentPage === page 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                ]"
                v-show="Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
            >
              ถัดไป →
            </button>
          </div>
        </div>
        
        <!-- Table View -->
        <div v-if="viewMode === 'table'" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-gray-50 to-purple-50">
              <tr>
                <th class="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">⭐</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">รูป</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ชื่อสินค้า</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ประเภท</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ศิลปิน</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ประเภท</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">วง</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ราคา</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">สต๊อก</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="product in paginatedProducts" :key="product.id" class="hover:bg-purple-50 transition-colors duration-200">
                <td class="px-6 py-4 text-center">
                  <button
                    @click="toggleFavorite(product.id)"
                    class="text-2xl hover:scale-125 transition-transform duration-200"
                    :title="isFavorite(product.id) ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'"
                  >
                    {{ isFavorite(product.id) ? '⭐' : '☆' }}
                  </button>
                </td>
                <td class="px-6 py-4">
                  <img 
                    v-if="product.image_url" 
                    :src="`/api/images/${product.image_url}`" 
                    alt="Product" 
                    class="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                  />
                  <div v-else class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-2xl border-2 border-gray-200">
                    📦
                  </div>
                </td>
                <td class="px-6 py-4 text-sm font-bold text-gray-900">{{ product.product_name }}</td>
                <td class="px-6 py-4 text-sm">
                  <span v-if="product.variant" class="px-3 py-1 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 rounded-full text-xs font-bold shadow-sm">
                    {{ product.variant }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700 font-medium">
                  <span v-if="product.artist_name">{{ product.artist_name }}</span>
                  <span v-else class="text-gray-400 italic">รวมทุกคน</span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-bold shadow-sm">
                    {{ product.category_name }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  <span v-if="product.band_name" class="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs font-bold shadow-sm">
                    {{ product.band_name }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 text-sm font-bold text-gray-900">
                  {{ product.price ? product.price.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00' }} ฿
                </td>
                <td class="px-6 py-4 text-sm">
                  <span :class="[
                    'px-4 py-2 rounded-full text-xs font-bold shadow-sm',
                    product.stock_quantity > 10 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                    product.stock_quantity > 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                    'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                  ]">
                    {{ product.stock_quantity }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="9" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <span class="text-6xl mb-4">🔍</span>
                    <p class="text-gray-500 font-semibold">ไม่พบสินค้าที่ค้นหา</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Pagination for Table -->
          <div v-if="filteredProducts.length > 0 && totalPages > 1" class="flex justify-center items-center gap-2 p-6 border-t border-gray-200 bg-gray-50">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all border border-gray-300"
            >
              ← ก่อนหน้า
            </button>
            
            <div class="flex gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'px-4 py-2 rounded-lg font-semibold transition-all',
                  currentPage === page 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white hover:bg-gray-100 border border-gray-300'
                ]"
                v-show="Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all border border-gray-300"
            >
              ถัดไป →
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <p class="text-purple-100">© 2025 ระบบแสดงสต็อกสินค้าศิลปินไอดอล</p>
      </div>
    </div>
  </div>
</template>
