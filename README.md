# Stock Idol - ระบบจัดการสินค้าศิลปิน

เว็บไซต์สำหรับนับจำนวนและจัดการสินค้าศิลปิน พัฒนาด้วย Nuxt 4 และ SQLite

## ✨ ฟีเจอร์

- ✅ จัดการสินค้าศิลปิน (เพิ่ม แก้ไข ลบ)
- ✅ แสดงข้อมูล: ประเภท/ชื่อสินค้า/ชื่อศิลปิน/วง/จำนวนสต๊อก
- ✅ จัดการประเภทสินค้า
- ✅ จัดการวง/กลุ่มศิลปิน
- ✅ แสดงสถานะสต๊อกแบบ real-time
- ✅ UI/UX ที่สวยงามและใช้งานง่าย

## 🚀 การติดตั้ง

```bash
# ติดตั้ง dependencies
bun install

# รันโปรเจค
bun run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

## 📦 เทคโนโลยี

- **Nuxt 4** - Vue.js Framework
- **Netlify DB (libSQL)** - Cloud Database (SQLite-compatible)
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling (built-in Nuxt)

## 📂 โครงสร้างโปรเจค

```
stock-idol/
├── app.vue                 # Layout หลัก
├── pages/
│   └── index.vue          # หน้าหลัก
├── server/
│   ├── api/               # API Routes
│   │   ├── products/      # CRUD สินค้า
│   │   ├── categories/    # CRUD ประเภท
│   │   └── bands/         # CRUD วง
│   ├── types/             # TypeScript Types
│   └── utils/
│       └── db.ts          # SQLite Database Setup
└── data/
    └── stock-idol.db      # SQLite Database File
```

## 🗄️ Database Schema

### ตาราง categories
- id (INTEGER PRIMARY KEY)
- name (TEXT UNIQUE)
- created_at (DATETIME)

### ตาราง bands
- id (INTEGER PRIMARY KEY)
- name (TEXT UNIQUE)
- created_at (DATETIME)

### ตาราง products
- id (INTEGER PRIMARY KEY)
- product_name (TEXT)
- artist_name (TEXT)
- category_id (INTEGER, FK)
- band_id (INTEGER, FK, NULL)
- stock_quantity (INTEGER)
- created_at (DATETIME)
- updated_at (DATETIME)

## 📖 API Endpoints

### Products
- `GET /api/products` - ดึงสินค้าทั้งหมด
- `POST /api/products` - เพิ่มสินค้าใหม่
- `PUT /api/products/:id` - แก้ไขสินค้า
- `DELETE /api/products/:id` - ลบสินค้า

### Categories
- `GET /api/categories` - ดึงประเภททั้งหมด
- `POST /api/categories` - เพิ่มประเภทใหม่
- `DELETE /api/categories/:id` - ลบประเภท

### Bands
- `GET /api/bands` - ดึงวงทั้งหมด
- `POST /api/bands` - เพิ่มวงใหม่
- `DELETE /api/bands/:id` - ลบวง

## 💡 การใช้งาน

1. **เพิ่มประเภทสินค้า**: ไปที่แท็บ "ประเภทสินค้า" และเพิ่มประเภทต่างๆ เช่น Photocard, Album, Lightstick
2. **เพิ่มวง/กลุ่ม**: ไปที่แท็บ "วง/กลุ่ม" และเพิ่มวงต่างๆ
3. **เพิ่มสินค้า**: กลับไปที่แท็บ "สินค้า" กรอกข้อมูลและเลือกประเภท/วง
4. **จัดการสต๊อก**: แก้ไขจำนวนสต๊อกได้ตลอดเวลา

## 🎨 Features

- 🎯 แสดงสถานะสต๊อกด้วยสี (เขียว > 10, เหลือง 1-10, แดง = 0)
- 📱 Responsive Design
- ⚡ Real-time Updates
- 🔍 แสดงข้อมูลครบถ้วน
- ✏️ แก้ไขข้อมูลง่าย

## Production

### Local Development
The app uses a local SQLite file (`file:data/stock-idol.db`) when running locally.

### Netlify Deployment

1. **Link to Netlify** (if not already linked):
```bash
netlify link
```

2. **Enable Netlify DB**:
   - Go to your Netlify site dashboard
   - Enable "Netlify DB" (libSQL database)
   - Environment variables `NETLIFY_DATABASE_URL` and `NETLIFY_DATABASE_AUTH_TOKEN` will be automatically set

3. **Deploy**:
```bash
netlify deploy --prod
```

The database schema will be automatically created on first deployment.

### Build for production:

```bash
bun run build
```

Preview production build locally:

```bash
bun run preview
```
