# MongoDB Fix - Quick Start

## What Changed
Your MongoDB connection now correctly targets the `bookvault` database with proper write settings.

**Old URI:** `mongodb+srv://.../?appName=Cluster0` ❌ (no database, no writes)
**New URI:** `mongodb+srv://.../bookvault?retryWrites=true&w=majority` ✅ (fixed)

---

## Start the Backend

```bash
cd backend
npm install
npm run start:dev
```

### Expected Console Output
```
✓ MongoDB connected to bookvault
✓ Backend running on port 3001
✓ API docs available at http://localhost:3001/api/docs
```

---

## Test Persistence (30 seconds)

### 1. Add Item to Cart
```bash
curl -X POST http://localhost:3001/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"book-001","quantity":1,"title":"Test Book","price":10.99}'
```

### 2. Save as Favorite
```bash
curl -X POST http://localhost:3001/saved \
  -H "Content-Type: application/json" \
  -d '{"productId":"book-001","title":"Test Book"}'
```

### 3. Restart Backend
```bash
# Stop the running backend (Ctrl+C)
# Then restart it:
npm run start:dev
```

### 4. Verify Data Persists
```bash
# Get cart items
curl http://localhost:3001/cart

# Get favorites
curl http://localhost:3001/saved
```

✅ **Items should still be there after restart!**

---

## For Production (Render)

Add this environment variable to Render:

**Key:** `MONGODB_URI`
**Value:** `mongodb+srv://upadhyayasonu41_db_user:x8eHVTUnHxxrYgy9@cluster0.65btztr.mongodb.net/bookvault?retryWrites=true&w=majority`

Then redeploy. Done!

---

## What's Fixed
- ✅ Cart items now persist
- ✅ Favorites now persist
- ✅ Products save correctly
- ✅ All data survives server restart
- ✅ No more silent write failures

**No UI or API changes needed - just restart the backend!**
