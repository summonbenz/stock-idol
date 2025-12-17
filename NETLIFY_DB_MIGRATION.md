# Netlify DB Migration Guide

## Migration Summary

Successfully migrated from local SQLite (`better-sqlite3`) to **Netlify DB** using `@netlify/neon`.

## Changes Made

### 1. Database Connection (`server/utils/db.ts`)
- **Before**: Used `better-sqlite3` with local file storage
- **After**: Uses `@netlify/neon` with Netlify's database service
- The `neon()` function automatically uses `NETLIFY_DATABASE_URL` environment variable

### 2. API Endpoints - Query Syntax
All API endpoints now use Neon's template literal syntax:

**Before (libsql/better-sqlite3)**:
```typescript
const result = await db.execute({
  sql: 'SELECT * FROM products WHERE id = ?',
  args: [id]
})
return result.rows[0]
```

**After (@netlify/neon)**:
```typescript
const [product] = await sql`SELECT * FROM products WHERE id = ${id}`
return product
```

### 3. Dependencies Updated
- ✅ Added: `@netlify/neon`
- ❌ Removed: `@libsql/client`
- ❌ Removed: `better-sqlite3`

## Environment Variables

### Production (Netlify)
No configuration needed! Netlify automatically provides:
- `NETLIFY_DATABASE_URL` - Database connection URL

### Local Development

#### Option 1: Using Netlify CLI (Recommended)
```bash
netlify dev
```
This automatically injects the database environment variables from your linked Netlify site.

#### Option 2: Manual Environment Variables
Create a `.env` file (not recommended, use Netlify CLI instead):
```env
NETLIFY_DATABASE_URL=your_database_url
```

## Deployment

### Prerequisites
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Link your project: `netlify link`
3. Enable Netlify DB in your Netlify dashboard

### Deploy Command
```bash
netlify deploy --prod
```

## Database Schema

The schema is automatically created on first connection:
- `categories` - Product categories
- `bands` - Music bands/groups
- `artists` - Individual artists (must belong to a band)
- `products` - Inventory items with stock tracking

## Testing Locally

1. Start the development server with Netlify:
```bash
netlify dev
```

2. The application will run on `http://localhost:8888` (Netlify proxy)

3. Database queries will use your Netlify database

## Advantages of Netlify DB

✅ **Serverless**: No server management required  
✅ **Distributed**: Built on Neon (Postgres-compatible)  
✅ **Auto-scaling**: Scales with your traffic  
✅ **Simple API**: Clean template literal syntax  
✅ **Integrated**: Works seamlessly with Netlify deployments  

## API Changes Summary

All 15 API endpoints were updated:
- `/api/categories` - GET, POST, DELETE
- `/api/bands` - GET, POST, DELETE
- `/api/bands/[bandId]/artists` - GET
- `/api/artists` - GET, POST, PUT, DELETE
- `/api/products` - GET, POST, PUT, DELETE

All now use the cleaner `sql` template literal syntax instead of prepared statements.

## Notes

- The template literal syntax automatically escapes values, preventing SQL injection
- Arrays are returned directly from queries (no need for `.rows` property)
- Single results can be destructured with `const [item] = await sql\`...\``
- Multiple results are returned as arrays
