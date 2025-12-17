<script setup lang="ts">
interface Category {
  id?: number
  name: string
  created_at?: string
}

interface Band {
  id?: number
  name: string
  created_at?: string
}

interface Artist {
  id?: number
  name: string
  band_id: number
  band_name?: string
  created_at?: string
}

interface Product {
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

interface ProductWithDetails extends Product {
  category_name?: string
  artist_name?: string
  band_name?: string
}

const activeTab = ref('products')

// Products
const products = ref<ProductWithDetails[]>([])
const categories = ref<Category[]>([])
const bands = ref<Band[]>([])
const artists = ref<Artist[]>([])

const productForm = ref({
  product_name: '',
  variant: '',
  image_url: '',
  price: 50,
  band_id: null as number | null,
  artist_id: null as number | null,
  category_id: null as number | null,
  stock_quantity: 1,
  uploadingImage: false,
  imagePreview: ''
})

const editingProduct = ref<ProductWithDetails | null>(null)
const newCategoryName = ref('')
const newBandName = ref('')

// Computed: sorted bands
const sortedBands = computed(() => {
  return [...bands.value].sort((a, b) => a.name.localeCompare(b.name, 'th'))
})

// Computed: filter artists by selected band and sort
const filteredArtists = computed(() => {
  if (!productForm.value.band_id) return []
  return artists.value
    .filter(a => a.band_id === productForm.value.band_id)
    .sort((a, b) => a.name.localeCompare(b.name, 'th'))
})

// Computed: unique product names for suggestions
const uniqueProductNames = computed(() => {
  const names = products.value.map(p => p.product_name)
  return [...new Set(names)].sort()
})

// Computed: unique variants for suggestions
const uniqueVariants = computed(() => {
  const variants = products.value
    .map(p => p.variant)
    .filter(v => v && v.trim() !== '')
  return [...new Set(variants)].sort()
})

// Product filters
const productFilter = ref({
  search: '',
  category_id: null as number | null,
  band_id: null as number | null,
  artist_id: null as number | null,
  inStockOnly: false
})

// Computed: filtered products
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // Filter by search text
  if (productFilter.value.search.trim()) {
    const search = productFilter.value.search.toLowerCase()
    result = result.filter(p => 
      p.product_name.toLowerCase().includes(search) ||
      p.variant?.toLowerCase().includes(search)
    )
  }
  
  // Filter by category
  if (productFilter.value.category_id) {
    result = result.filter(p => p.category_id === productFilter.value.category_id)
  }
  
  // Filter by band
  if (productFilter.value.band_id) {
    const bandArtistIds = artists.value
      .filter(a => a.band_id === productFilter.value.band_id)
      .map(a => a.id)
    result = result.filter(p => bandArtistIds.includes(p.artist_id!))
  }
  
  // Filter by artist
  if (productFilter.value.artist_id) {
    result = result.filter(p => p.artist_id === productFilter.value.artist_id)
  }
  
  // Filter by stock
  if (productFilter.value.inStockOnly) {
    result = result.filter(p => p.stock_quantity > 0)
  }
  
  return result
})

// Computed: artists filtered by selected band in filter
const filterArtists = computed(() => {
  if (!productFilter.value.band_id) return artists.value
  return artists.value.filter(a => a.band_id === productFilter.value.band_id)
})

function clearFilters() {
  productFilter.value = {
    search: '',
    category_id: null,
    band_id: null,
    artist_id: null,
    inStockOnly: false
  }
}

function onFilterBandChange() {
  productFilter.value.artist_id = null
}

// Artist management
const selectedBandForArtist = ref<number | null>(null)
const newArtistName = ref('')
const showArtistModal = ref(false)
const managingBandId = ref<number | null>(null)
const bandArtists = ref<Artist[]>([])
const editingArtist = ref<Artist | null>(null)

// Fetch data
async function fetchProducts() {
  const data = await $fetch<ProductWithDetails[]>('/api/products')
  products.value = data
}

async function fetchCategories() {
  const data = await $fetch<Category[]>('/api/categories')
  categories.value = data
}

async function fetchBands() {
  const data = await $fetch<Band[]>('/api/bands')
  bands.value = data
}

async function fetchArtists() {
  const data = await $fetch<Artist[]>('/api/artists')
  artists.value = data
}

async function fetchBandArtists(bandId: number) {
  const data = await $fetch<Artist[]>(`/api/bands/${bandId}/artists`)
  bandArtists.value = data
}

// Product operations
async function saveProduct() {
  try {
    if (editingProduct.value) {
      await $fetch(`/api/products/${editingProduct.value.id}`, {
        method: 'PUT',
        body: {
          product_name: productForm.value.product_name,
          variant: productForm.value.variant,
          image_url: productForm.value.image_url,
          price: productForm.value.price,
          artist_id: productForm.value.artist_id,
          category_id: productForm.value.category_id,
          stock_quantity: productForm.value.stock_quantity
        }
      })
    } else {
      await $fetch('/api/products', {
        method: 'POST',
        body: {
          product_name: productForm.value.product_name,
          variant: productForm.value.variant,
          image_url: productForm.value.image_url,
          price: productForm.value.price,
          artist_id: productForm.value.artist_id,
          category_id: productForm.value.category_id,
          stock_quantity: productForm.value.stock_quantity
        }
      })
    }
    
    resetProductForm()
    await fetchProducts()
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

function editProduct(product: ProductWithDetails) {
  editingProduct.value = product
  
  // หา band_id จากศิลปิน
  const artist = artists.value.find(a => a.id === product.artist_id)
  
  productForm.value = {
    product_name: product.product_name,
    variant: product.variant || '',
    band_id: artist?.band_id || null,
    artist_id: product.artist_id || null,
    category_id: product.category_id,    price: product.price || 0,    stock_quantity: product.stock_quantity,
    image_url: product.image_url || '',
    uploadingImage: false,
    imagePreview: product.image_url || ''
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  resetProductForm()
}

function resetProductForm() {
  editingProduct.value = null
  productForm.value = {
    product_name: '',
    variant: '',
    band_id: null,
    artist_id: null,
    category_id: null,
    price: 50,
    stock_quantity: 1,
    image_url: '',
    uploadingImage: false,
    imagePreview: ''
  }
}

async function deleteProduct(id: number) {
  if (!confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return
  
  try {
    await $fetch(`/api/products/${id}`, { method: 'DELETE' })
    await fetchProducts()
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

async function updateStock(product: ProductWithDetails, change: number) {
  const newStock = Math.max(0, product.stock_quantity + change)
  
  try {
    await $fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: {
        product_name: product.product_name,
        variant: product.variant,
        image_url: product.image_url,
        price: product.price,
        artist_id: product.artist_id,
        category_id: product.category_id,
        stock_quantity: newStock
      }
    })
    await fetchProducts()
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

async function duplicateProduct(product: ProductWithDetails) {
  try {
    await $fetch('/api/products', {
      method: 'POST',
      body: {
        product_name: product.product_name,
        variant: product.variant,
        image_url: product.image_url,
        price: product.price,
        artist_id: product.artist_id,
        category_id: product.category_id,
        stock_quantity: 0
      }
    })
    await fetchProducts()
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

// Category operations
async function addCategory() {
  try {
    await $fetch('/api/categories', {
      method: 'POST',
      body: { name: newCategoryName.value }
    })
    newCategoryName.value = ''
    await fetchCategories()
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

async function deleteCategory(id: number) {
  if (!confirm('คุณต้องการลบประเภทนี้ใช่หรือไม่?')) return
  
  try {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    await fetchCategories()
  } catch (error: any) {
    alert('ไม่สามารถลบได้: ประเภทนี้ถูกใช้งานอยู่ในสินค้า')
  }
}

// Event handlers
function onBandChange() {
  // เมื่อเปลี่ยนวง ให้รีเซ็ตศิลปิน
  productForm.value.artist_id = null
}

async function onImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // แสดง preview
  const reader = new FileReader()
  reader.onload = (e) => {
    productForm.value.imagePreview = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  // อัพโหลดไฟล์
  productForm.value.uploadingImage = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await $fetch<{ url: string }>('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    productForm.value.image_url = response.url
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการอัพโหลดรูป: ' + error)
  } finally {
    productForm.value.uploadingImage = false
  }
}

// Band operations
async function addBand() {
  try {
    await $fetch('/api/bands', {
      method: 'POST',
      body: { name: newBandName.value }
    })
    newBandName.value = ''
    await fetchBands()
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

async function deleteBand(id: number) {
  if (!confirm('คุณต้องการลบวง/กลุ่มนี้ใช่หรือไม่?')) return
  
  try {
    await $fetch(`/api/bands/${id}`, { method: 'DELETE' })
    await fetchBands()
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

// Artist operations
async function saveArtist() {
  if (!selectedBandForArtist.value && !editingArtist.value) {
    alert('กรุณาเลือกวง')
    return
  }
  
  try {
    if (editingArtist.value) {
      // Update existing artist
      await $fetch(`/api/artists/${editingArtist.value.id}`, {
        method: 'PUT',
        body: { name: newArtistName.value }
      })
    } else {
      // Create new artist
      await $fetch('/api/artists', {
        method: 'POST',
        body: { 
          name: newArtistName.value,
          band_id: selectedBandForArtist.value
        }
      })
    }
    
    newArtistName.value = ''
    editingArtist.value = null
    await fetchArtists()
    if (managingBandId.value) {
      await fetchBandArtists(managingBandId.value)
    }
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

function editArtist(artist: Artist) {
  editingArtist.value = artist
  newArtistName.value = artist.name
}

function cancelEditArtist() {
  editingArtist.value = null
  newArtistName.value = ''
}

async function deleteArtist(id: number) {
  if (!confirm('คุณต้องการลบศิลปินนี้ใช่หรือไม่?')) return
  
  try {
    await $fetch(`/api/artists/${id}`, { method: 'DELETE' })
    await fetchArtists()
    if (managingBandId.value) {
      await fetchBandArtists(managingBandId.value)
    }
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error)
  }
}

// Modal management
function openArtistManagement(bandId: number) {
  managingBandId.value = bandId
  selectedBandForArtist.value = bandId
  showArtistModal.value = true
  fetchBandArtists(bandId)
}

function closeArtistModal() {
  showArtistModal.value = false
  managingBandId.value = null
  selectedBandForArtist.value = null
  newArtistName.value = ''
  bandArtists.value = []
  editingArtist.value = null
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
  fetchBands()
  fetchArtists()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <header class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl border-b-4 border-purple-700">
      <div class="container mx-auto px-4 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <span class="text-5xl">📦</span>
            </div>
            <div>
              <h1 class="text-4xl font-bold tracking-tight">Stock Idol - Admin</h1>
              <p class="text-purple-100 mt-1 text-sm font-medium">ระบบจัดการสินค้าศิลปิน</p>
            </div>
          </div>
          <NuxtLink 
            to="/" 
            class="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all duration-300 border-2 border-white/30"
          >
            👁️ ดูหน้าผู้เยี่ยมชม
          </NuxtLink>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-10">
      <div class="space-y-8">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-purple-100 text-sm font-medium">สินค้าทั้งหมด</p>
            <h3 class="text-4xl font-bold mt-2">{{ products.length }}</h3>
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
    </div>

    <!-- แท็บเมนู -->
    <div class="bg-white rounded-2xl shadow-xl p-2 flex gap-2 backdrop-blur-sm border border-gray-100">
      <button
        @click="activeTab = 'products'"
        :class="[
          'flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105',
          activeTab === 'products' 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-300' 
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        ]"
      >
        <span class="text-2xl mr-2">📦</span>
        สินค้า
      </button>
      <button
        @click="activeTab = 'categories'"
        :class="[
          'flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105',
          activeTab === 'categories' 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-300' 
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        ]"
      >
        <span class="text-2xl mr-2">📁</span>
        ประเภทสินค้า
      </button>
      <button
        @click="activeTab = 'bands'"
        :class="[
          'flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105',
          activeTab === 'bands' 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-300' 
            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        ]"
      >
        <span class="text-2xl mr-2">🎵</span>
        วง/กลุ่ม
      </button>
    </div>

    <!-- แท็บสินค้า -->
    <div v-if="activeTab === 'products'" class="space-y-8">
      <!-- ฟอร์มเพิ่ม/แก้ไขสินค้า -->
      <div class="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl p-8 border border-purple-100">
        <div class="flex items-center mb-8">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
            <span class="text-3xl">{{ editingProduct ? '✏️' : '➕' }}</span>
          </div>
          <h2 class="text-3xl font-bold ml-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {{ editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}
          </h2>
        </div>
        
        <form @submit.prevent="saveProduct" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">🏷️</span>
              ชื่อสินค้า *
            </label>
            <input
              v-model="productForm.product_name"
              type="text"
              required
              list="product-name-suggestions"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
              placeholder="เช่น Photocard, Album, etc."
            />
            <datalist id="product-name-suggestions">
              <option v-for="name in uniqueProductNames" :key="name" :value="name" />
            </datalist>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">🎨</span>
               ประเภท (สี/ประเภทย่อย)
            </label>
            <input
              v-model="productForm.variant"
              type="text"
              list="variant-suggestions"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
              placeholder="เช่น Close-up, Half, Full, etc."
            />
            <datalist id="variant-suggestions">
              <option v-for="variant in uniqueVariants" :key="variant" :value="variant" />
            </datalist>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">🎤</span>
              วง/กลุ่ม *
            </label>
            <select
              v-model="productForm.band_id"
              required
              @change="onBandChange"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
            >
              <option :value="null">เลือกวงก่อน</option>
              <option v-for="band in sortedBands" :key="band.id" :value="band.id">
                {{ band.name }}
              </option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">⭐</span>
              ศิลปิน (ไม่บังคับ - เว้นว่างถ้าเป็นสินค้ารวม)
            </label>
            <select
              v-model="productForm.artist_id"
              :disabled="!productForm.band_id"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option :value="null">{{ productForm.band_id ? 'ไม่ระบุ (สินค้ารวมทุกคน)' : 'เลือกวงก่อน' }}</option>
              <option 
                v-for="artist in filteredArtists" 
                :key="artist.id" 
                :value="artist.id"
              >
                {{ artist.name }}
              </option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">📂</span>
              ประเภท *
            </label>
            <select
              v-model="productForm.category_id"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
            >
              <option value="">เลือกประเภท</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">📸</span>
              รูปภาพสินค้า
            </label>
            <input
              type="file"
              accept="image/*"
              @change="onImageSelect"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
            />
            <div v-if="productForm.imagePreview || productForm.image_url" class="mt-2">
              <img 
                :src="`/api/images/${productForm.imagePreview || productForm.image_url}`" 
                alt="Preview" 
                class="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
              />
            </div>
            <div v-if="productForm.uploadingImage" class="text-sm text-purple-600">กำลังอัพโหลด...</div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">�</span>
              ราคา (บาท)
            </label>
            <input
              v-model.number="productForm.price"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
              placeholder="0.00"
            />
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700 flex items-center">
              <span class="text-lg mr-2">�📊</span>
              จำนวนสต๊อก
            </label>
            <input
              v-model.number="productForm.stock_quantity"
              type="number"
              min="0"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
              placeholder="0"
            />
          </div>
          
          <div class="flex gap-4 items-end">
            <button
              type="submit"
              class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {{ editingProduct ? '💾 บันทึก' : '➕ เพิ่ม' }}
            </button>
            <button
              v-if="editingProduct"
              type="button"
              @click="cancelEdit"
              class="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ❌ ยกเลิก
            </button>
          </div>
        </form>
      </div>

      <!-- ตารางสินค้า -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
          <h2 class="text-2xl font-bold text-white flex items-center">
            <span class="text-3xl mr-3">📋</span>
            รายการสินค้าทั้งหมด
            <span class="ml-3 bg-white/20 px-4 py-1 rounded-full text-lg backdrop-blur-sm">{{ filteredProducts.length }}/{{ products.length }}</span>
          </h2>
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
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="productFilter.inStockOnly"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span class="text-sm font-semibold text-gray-700">📦 แสดงเฉพาะสินค้าที่มีสต็อก</span>
            </label>
            
            <button
              @click="clearFilters"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 text-sm"
            >
              ❌ ล้างตัวกรอง
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-gray-50 to-purple-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">รูป</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ชื่อสินค้า</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ประเภท</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ศิลปิน</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ประเภท</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">วง</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ราคา</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">สต๊อก</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-purple-50 transition-colors duration-200">
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
                  <div class="flex items-center gap-2">
                    <button
                      @click="updateStock(product, -1)"
                      :disabled="product.stock_quantity === 0"
                      class="w-8 h-8 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      −
                    </button>
                    <span :class="[
                      'px-4 py-2 rounded-full text-xs font-bold shadow-sm min-w-[60px] text-center',
                      product.stock_quantity > 10 ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                      product.stock_quantity > 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                    ]">
                      {{ product.stock_quantity }}
                    </span>
                    <button
                      @click="updateStock(product, 1)"
                      class="w-8 h-8 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex gap-1">
                    <button
                      @click="editProduct(product)"
                      title="แก้ไข"
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-all duration-200"
                    >
                      ✏️
                    </button>
                    <button
                      @click="duplicateProduct(product)"
                      title="คัดลอก"
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white font-bold transition-all duration-200"
                    >
                      📋
                    </button>
                    <button
                      @click="deleteProduct(product.id!)"
                      title="ลบ"
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white font-bold transition-all duration-200"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="9" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <span class="text-6xl mb-4">📦</span>
                    <p class="text-gray-500 font-semibold">ยังไม่มีสินค้า กรุณาเพิ่มสินค้าใหม่</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- แท็บประเภทสินค้า -->
    <div v-if="activeTab === 'categories'" class="space-y-8">
      <div class="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 border border-blue-100">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl">
            <span class="text-3xl">➕</span>
          </div>
          <h2 class="text-3xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            เพิ่มประเภทสินค้า
          </h2>
        </div>
        
        <form @submit.prevent="addCategory" class="flex gap-4">
          <input
            v-model="newCategoryName"
            type="text"
            required
            class="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg font-medium"
            placeholder="ชื่อประเภทสินค้า"
          />
          <button
            type="submit"
            class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-10 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ➕ เพิ่ม
          </button>
        </form>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <h3 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <span class="text-3xl mr-3">📋</span>
          ประเภทสินค้าทั้งหมด
          <span class="ml-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-lg">{{ categories.length }}</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="category in categories"
            :key="category.id"
            class="group flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <span class="font-bold text-gray-800 text-lg">{{ category.name }}</span>
            <button
              @click="deleteCategory(category.id!)"
              class="text-red-600 hover:text-red-800 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-125 transform"
            >
              🗑️
            </button>
          </div>
          <div v-if="categories.length === 0" class="col-span-3 text-center py-12">
            <span class="text-6xl mb-4 block">📁</span>
            <p class="text-gray-500 font-semibold">ยังไม่มีประเภทสินค้า</p>
          </div>
        </div>
      </div>
    </div>

    <!-- แท็บวง -->
    <div v-if="activeTab === 'bands'" class="space-y-8">
      <div class="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl p-8 border border-purple-100">
        <div class="flex items-center mb-6">
          <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
            <span class="text-3xl">➕</span>
          </div>
          <h2 class="text-3xl font-bold ml-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            เพิ่มวง/กลุ่ม
          </h2>
        </div>
        
        <form @submit.prevent="addBand" class="flex gap-4">
          <input
            v-model="newBandName"
            type="text"
            required
            class="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white text-lg font-medium"
            placeholder="ชื่อวง/กลุ่ม"
          />
          <button
            type="submit"
            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ➕ เพิ่ม
          </button>
        </form>
      </div>

      <div class="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
        <h3 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <span class="text-3xl mr-3">📋</span>
          วง/กลุ่มทั้งหมด
          <span class="ml-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-lg">{{ bands.length }}</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="band in bands"
            :key="band.id"
            class="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          >
            <div class="p-5">
              <div class="flex items-center justify-between mb-3">
                <span class="font-bold text-gray-800 text-lg">{{ band.name }}</span>
                <button
                  @click="deleteBand(band.id!)"
                  class="text-red-600 hover:text-red-800 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-125 transform"
                >
                  🗑️
                </button>
              </div>
              <button
                @click="openArtistManagement(band.id!)"
                class="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                👥 จัดการศิลปิน
              </button>
            </div>
          </div>
          <div v-if="bands.length === 0" class="col-span-3 text-center py-12">
            <span class="text-6xl mb-4 block">🎵</span>
            <p class="text-gray-500 font-semibold">ยังไม่มีวง/กลุ่ม</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal จัดการศิลปินในวง -->
    <div v-if="showArtistModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="closeArtistModal">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold">
              👥 จัดการศิลปินใน {{ bands.find(b => b.id === managingBandId)?.name }}
            </h3>
            <button @click="closeArtistModal" class="text-white hover:text-gray-200 text-3xl font-bold">×</button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- ฟอร์มเพิ่ม/แก้ไขศิลปิน -->
          <div class="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <h4 class="font-bold text-lg mb-4 text-gray-800">{{ editingArtist ? '✏️ แก้ไขศิลปิน' : '➕ เพิ่มศิลปินใหม่' }}</h4>
            <form @submit.prevent="saveArtist" class="space-y-3">
              <div class="flex gap-3">
                <input
                  v-model="newArtistName"
                  type="text"
                  required
                  class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white"
                  placeholder="ชื่อศิลปิน"
                />
                <button
                  type="submit"
                  class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {{ editingArtist ? '💾 บันทึก' : '➕ เพิ่ม' }}
                </button>
              </div>
              <button
                v-if="editingArtist"
                type="button"
                @click="cancelEditArtist"
                class="w-full bg-gray-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                ❌ ยกเลิก
              </button>
            </form>
          </div>
          
          <!-- รายการศิลปิน -->
          <div>
            <h4 class="font-bold text-lg mb-4 text-gray-800">
              📋 รายชื่อศิลปิน ({{ bandArtists.length }})
            </h4>
            <div class="space-y-2">
              <div
                v-for="artist in bandArtists"
                :key="artist.id"
                class="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all duration-200"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">⭐</span>
                  <span class="font-semibold text-gray-800">{{ artist.name }}</span>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="editArtist(artist)"
                    class="text-blue-600 hover:text-blue-800 font-bold hover:scale-110 transition-all duration-200"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    @click="deleteArtist(artist.id!)"
                    class="text-red-600 hover:text-red-800 font-bold hover:scale-110 transition-all duration-200"
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </div>
              <div v-if="bandArtists.length === 0" class="text-center py-8 text-gray-500">
                ยังไม่มีศิลปินในวงนี้
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </div>
    </main>
    
    <footer class="mt-12 py-6 text-center text-gray-600 border-t border-gray-200 bg-white">
      <p class="font-medium">Made with <span class="text-red-500 text-xl">❤️</span> for Idol Fans</p>
    </footer>
  </div>
</template>
