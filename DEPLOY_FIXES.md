# Quick Deployment Guide

## One-Command Deployment

### Windows PowerShell
```powershell
# Terminal 1: Backend
cd backend
npm run build
npm start

# Wait for "Application is running on: http://localhost:3001"
```

```powershell
# Terminal 2: Populate Categories (while backend is running)
cd backend
npm run populate:categories

# Wait for "✅ Category population complete!"
```

```powershell
# Terminal 3: Frontend
cd frontend
npm run dev

# Navigate to http://localhost:3000
```

---

## What Each Command Does

### `npm run build` (Backend)
- Compiles NestJS backend
- Ensures TypeScript changes are valid

### `npm start` (Backend)
- Starts the backend server on port 3001
- Ready to serve API requests

### `npm run populate:categories` (Backend)
- **CRITICAL:** Must run AFTER backend is started
- Scans products in MongoDB
- Creates categories (Fiction, Non-Fiction, Science, etc.)
- Links products to categories
- Updates category product counts

### `npm run dev` (Frontend)
- Starts Next.js dev server on port 3000
- Ready to serve frontend

---

## Verification Steps

### 1. Backend Health
```bash
curl http://localhost:3001/api/image/health
# Should return: { "status": "healthy", "service": "image-proxy", ... }
```

### 2. Categories Exist
```bash
curl http://localhost:3001/api/categories
# Should return: [{ "title": "Fiction", "slug": "fiction", ... }, ...]
# NOT empty!
```

### 3. Products Exist
```bash
curl http://localhost:3001/api/products?page=1&limit=10
# Should return: { "data": [...], "pagination": {...} }
```

### 4. Frontend Loads
```
Navigate to http://localhost:3000
Should see:
- Hero section
- Categories section (populated)
- Featured Books section (with products)
- No console errors
```

### 5. Product Detail Works
```
Click on any book
Should navigate to /product/{id}
Should load book details
Should show similar books below
```

### 6. Image Proxy Works
```
Open browser DevTools (F12)
Go to Network tab
Click on a book image
Should load from: http://localhost:3001/api/image?url=...
Should NOT show 404
```

---

## Expected Output

### Backend Startup
```
[NestFactory] Starting Nest application...
[InstanceLoader] MongooseModule dependencies initialized
[InstanceLoader] TypeOrmModule dependencies initialized
[RoutesResolver] CategoriesController {}:
  GET /api/categories
[RoutesResolver] ProductsController {}:
  GET /api/products
[RoutesResolver] ImageProxyController {}:
  GET /api/image
[NestApplication] Nest application successfully started
✅ Server running on http://localhost:3001
```

### Category Population
```
🚀 Starting category population...
📦 Connected to MongoDB
📦 Found 50 products
📚 Found 10 unique categories
✨ Created category: fiction
✨ Created category: non-fiction
...
🔗 Linked 50 products to categories
📊 Category "fiction": 15 products
📊 Category "non-fiction": 12 products
...
✅ Category population complete!
```

### Frontend Startup
```
> world-of-books-frontend@1.0.0 dev
> next dev

  ▲ Next.js 14.2.35
  - Environments: .env.local

  ✓ Ready in 2.1s
  ✓ Fast Refresh for 8 files
  
  Local:        http://localhost:3000
  Environments: .env.local
```

---

## Troubleshooting

### MongoDB Connection Error
**Problem:** `MongoServerError: connection refused`
**Solution:** 
- Start MongoDB: `mongod` or via Docker
- Check `.env` MONGODB_URI is correct

### Categories Still Empty
**Problem:** `npm run populate:categories` didn't run or failed
**Solution:**
- Ensure backend is running (listening on 3001)
- Check MongoDB has products: `mongo --eval "db.products.countDocuments()"`
- Run again: `npm run populate:categories`

### Image 404 Errors
**Problem:** Images show 404 or broken image
**Solution:**
- Check image URLs are external (https://images.worldofbooks.com/...)
- Check image proxy endpoint: `curl http://localhost:3001/api/image/health`
- Check browser network tab for proxy response

### Recursive Proxy Loop
**Problem:** Infinite redirect or proxy error
**Solution:**
- Backend fix auto-detects and strips recursive calls
- Frontend fix prevents double-proxying
- Both fixes are deployed - should work

### Port 3000/3001 Already in Use
**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`
**Solution:**
```bash
# Find what's using the port
# Windows:
netstat -ano | findstr :3000

# Kill the process
taskkill /PID {PID} /F
```

---

## After Deployment

### Database Backup (Recommended)
```bash
# Backup before going live
mongodump --db world-of-books --out ./backup
```

### Enable Production Logging
In `.env`:
```
LOG_LEVEL=error
NODE_ENV=production
```

### Monitor Health
```bash
# Check every minute
curl -s http://localhost:3001/api/categories | jq '.[] | .title'
```

---

## Next Steps

Once running:

1. **Verify All Features**
   - [ ] Browse categories
   - [ ] Search books
   - [ ] View book details
   - [ ] Check images load
   - [ ] No console errors

2. **Seed More Products (Optional)**
   ```bash
   cd backend
   npm run seed:worldofbooks
   ```

3. **Configure for Production**
   - Set `API_URL` env var (if deployed separately)
   - Enable authentication (if needed)
   - Set up monitoring/logging

4. **Deploy to Cloud**
   - Backend: Heroku, Railway, AWS, etc.
   - Frontend: Vercel, Netlify, etc.

---

## Support

If issues occur:
1. Check MongoDB is running
2. Check ports 3000 and 3001 are free
3. Check `.env` variables are set
4. Review `PRODUCTION_FIXES_APPLIED.md` for detailed fixes
5. Check browser console for errors

**Category population must complete successfully for features to work!**
