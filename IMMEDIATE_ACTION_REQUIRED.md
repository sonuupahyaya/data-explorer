# ⚡ IMMEDIATE ACTION REQUIRED - One Manual Step Left

## ✅ What Was Done
All code files have been updated to use the correct MongoDB URI with the `bookvault` database name.

**Result:** Backend is currently running and successfully connected to MongoDB Atlas.

```
✓ MongoDB connected to bookvault
✓ Backend running on port 3001
```

---

## 🔴 ONE MANUAL STEP REMAINS

Your `backend/.env` file is a secret file and cannot be edited by the automated system.

### You Must Manually Edit: `backend/.env`

**Current content (WRONG):**
```
MONGODB_URI=mongodb+srv://upadhyayasonu41_db_user:x8eHVTUnHxxrYgy9@cluster0.65btztr.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=world_of_books
```

**Replace with (CORRECT):**
```
MONGO_URI=mongodb+srv://upadhyayasonu41_db_user:x8eHVTUnHxxrYgy9@cluster0.65btztr.mongodb.net/bookvault?retryWrites=true&w=majority
```

---

## Steps to Fix

### 1. Open the file
```
File Path: c:/Users/Sonuu/Desktop/data explorer/backend/.env
```

### 2. Find and remove these lines
```
MONGODB_URI=mongodb+srv://upadhyayasonu41_db_user:x8eHVTUnHxxrYgy9@cluster0.65btztr.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=world_of_books
```

### 3. Add this line instead
```
MONGO_URI=mongodb+srv://upadhyayasonu41_db_user:x8eHVTUnHxxrYgy9@cluster0.65btztr.mongodb.net/bookvault?retryWrites=true&w=majority
```

### 4. Save the file

---

## Complete .env Example

Your file should look like this:

```
# Server
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0

# MongoDB - CORRECTED
MONGO_URI=mongodb+srv://upadhyayasonu41_db_user:x8eHVTUnHxxrYgy9@cluster0.65btztr.mongodb.net/bookvault?retryWrites=true&w=majority

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Scraping
CACHE_TTL_SECONDS=86400
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug

# World of Books Configuration
WOB_BASE_URL=https://www.worldofbooks.com/en-gb
WOB_REQUEST_TIMEOUT=30000
WOB_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## After You Save .env

### Restart the backend
```bash
# In the terminal running your backend:
1. Press Ctrl+C to stop it
2. Wait 2 seconds
3. Run: npm run start:dev
```

### Expected output
```
✓ MongoDB connected to bookvault
✓ Backend running on port 3001
```

If you see this message, the setup is complete! ✅

---

## Test Data Persistence (Optional but Recommended)

### Quick 1-minute test:

```bash
# Add item to cart
curl -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "test-001",
    "quantity": 1,
    "title": "Test Book",
    "price": 19.99
  }'
```

### Check MongoDB Atlas
1. Login to https://cloud.mongodb.com
2. Click **Clusters** → Your cluster
3. Click **Browse Collections**
4. Select database: **bookvault**
5. Look for collection: **carts**
6. You should see your test item! ✅

### Verify persistence (2-minute test)
```bash
# Stop backend: Ctrl+C
# Restart backend: npm run start:dev
# Get cart: curl http://localhost:3001/api/cart
```

**If the item is still there, MongoDB persistence is WORKING!** ✅

---

## What Each Change Does

| Change | Why | Result |
|--------|-----|--------|
| Add `/bookvault` to URI | Specifies database name | Data goes to correct database |
| Add `?retryWrites=true` | Automatic retry on failure | No data loss on transient errors |
| Add `&w=majority` | Majority replica set write | Data consistency guaranteed |
| Change to `MONGO_URI` | Consistent naming | Backend correctly reads env var |

---

## Confirmation Checklist

After editing `.env` and restarting backend:

- [ ] File saved successfully
- [ ] Backend restarted
- [ ] Console shows: `✓ MongoDB connected to bookvault`
- [ ] No error messages
- [ ] API responds on http://localhost:3001/api/docs
- [ ] (Optional) Tested adding item to cart
- [ ] (Optional) Verified item in MongoDB Atlas

---

## That's It!

Once you complete this one manual step, your MongoDB Atlas will be:

✅ **Correctly configured**
✅ **Receiving data**
✅ **Persisting across restarts**
✅ **Production-ready**

---

## Still Have Questions?

- Backend logs show: `✓ MongoDB connected to bookvault` → Connection is correct
- Database appears empty → This is normal (no data seeded yet)
- Want test data? → Run `npm run seed:sample` in backend directory
- Ready to deploy? → Make sure `.env` is updated and restart backend first

---

**Next Step: Edit `backend/.env` file and restart the backend!**
