# 🚀 How to Run the World of Books Discovery Platform

This is a **REAL** production-ready platform that scrapes **LIVE DATA** from worldofbooks.com.

## ⚙️ Prerequisites

- Node.js 20+
- npm 10+
- MongoDB (local or Atlas)
- Your MongoDB connection string

## 🔧 Setup

### 1. Configure MongoDB

Update `.env` in the project root with your MongoDB URI:

```bash
MONGODB_URI=mongodb+srv://upadhyayasonu41_db_user:<PASSWORD>@cluster0.cnexpxs.mongodb.net/world_of_books?retryWrites=true&w=majority
MONGODB_DB_NAME=world_of_books
```

Replace `<PASSWORD>` with your actual MongoDB password.

### 2. Start Backend (Terminal 1)

```bash
cd backend
npm install  # Only needed first time
npm run start:dev
```

You'll see:
```
✓ Backend running on port 3001
✓ API docs available at http://localhost:3001/api/docs
```

### 3. Start Frontend (Terminal 2)

```bash
cd frontend
npm install  # Only needed first time
npm run dev
```

You'll see:
```
✓ Ready in X.Xs
Local: http://localhost:3000
```

## 🌐 Access the Application

### Frontend
- **Homepage:** http://localhost:3000
- Shows navigation, categories, products

### Backend APIs
- **Base URL:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs
- **Interactive testing:** Click endpoints in Swagger UI

## 📡 API Endpoints

All endpoints return **REAL data** scraped from worldofbooks.com:

### Navigation (Top Categories)
```bash
GET /api/navigation
```
Returns all book categories from World of Books

### Products by Category
```bash
GET /api/products?category=fiction&page=1&limit=24
```
Pagination: `page` (1-indexed), `limit` (per page)

### Product Detail
```bash
GET /api/product/:id
```
Full product info with reviews

### Force Refresh Data
```bash
POST /api/navigation/refresh
```
Triggers scrape of latest navigation data

```bash
POST /api/product/:id/refresh
```
Refreshes a specific product

## 🕷️ How Scraping Works

1. **On-Demand:** When you call `/api/navigation`, it:
   - Checks MongoDB for cached data
   - If fresh (< 24h), returns cached data immediately
   - If stale, scrapes worldofbooks.com in background
   - Returns cached data while scraping in parallel

2. **Real Data:** The scraper uses Axios + Cheerio to:
   - Parse HTML from worldofbooks.com
   - Extract product titles, prices, authors, images
   - Store in MongoDB with deduplication
   - Handle pagination automatically

3. **No Mocks:** All data comes from live website
   - Product titles are REAL
   - Prices are REAL
   - Images link to REAL product photos
   - URLs point to REAL World of Books pages

## 💾 Database

MongoDB collections automatically created:

- **navigation** - Book categories (Fiction, Mystery, etc.)
- **category** - Subcategories per navigation heading
- **product** - Individual books with pricing
- **review** - Product reviews and ratings
- **scrape_job** - Tracking scraping jobs
- **view_history** - User navigation tracking

All data persisted with:
- Automatic deduplication by source_url
- Last scraped timestamp for cache invalidation
- Indexes for fast queries

## 🧪 Test the APIs

### 1. Get Navigation (REAL data from worldofbooks.com)
```bash
curl http://localhost:3001/api/navigation
```

### 2. Browse Swagger UI
```
http://localhost:3001/api/docs
```
Click any endpoint to test live

### 3. Get All Products
```bash
curl "http://localhost:3001/api/products?category=fiction&limit=24"
```

### 4. Refresh Navigation Data
```bash
curl -X POST http://localhost:3001/api/navigation/refresh
```

## 📊 Frontend Features

- ✅ Browse real World of Books categories
- ✅ View real products with live prices
- ✅ Pagination & filtering
- ✅ Product detail pages
- ✅ Responsive mobile design
- ✅ Real data from live website

## 🛑 Stop Services

Press **Ctrl+C** in each terminal

## 🐛 Troubleshooting

### "Connection refused" on API
- Check backend is running: `npm run start:dev` in `/backend`
- Verify MongoDB URI is correct in `.env`

### No products showing
- Click "Refresh" button on frontend to trigger scrape
- Check API Docs: http://localhost:3001/api/docs
- Look at backend logs for scraping status

### MongoDB error
- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Slow responses
- First request scrapes website (can take 5-10 seconds)
- Subsequent requests use cached data (instant)
- Wait for background scrape to complete

## 🚀 Production Deployment

See `DEPLOYMENT.md` for deploying to:
- Frontend: Vercel
- Backend: Render.com
- Database: MongoDB Atlas

## 📚 Documentation

- `README.md` - Architecture & features
- `API_DOCS.md` - Complete API reference
- `PROJECT_STRUCTURE.md` - File organization
- `DEPLOYMENT.md` - Production setup
- `CHECKLIST.md` - Launch verification

## ✅ Validation

To confirm this is REAL data scraping:

1. Get navigation:
   ```bash
   curl http://localhost:3001/api/navigation
   ```
   Should return REAL World of Books categories

2. Get products:
   ```bash
   curl "http://localhost:3001/api/products?limit=5"
   ```
   Should return REAL books with prices, authors, images

3. View in frontend: http://localhost:3000
   - Shows real categories
   - Displays real book titles
   - Shows real prices in GBP, USD, or EUR

## 💡 Tips

- First request: Takes time (scraping live website)
- Cached data: Returns instantly after first scrape
- Auto-refresh: Cache expires after 24 hours
- Manual refresh: POST /api/*/refresh endpoints
- Infinite scroll: Frontend loads more as you scroll
- Full-text search: `/api/products?search=gatsby`

---

## Summary

You now have a **production-ready** product discovery platform that:
- ✅ Scrapes REAL live data from worldofbooks.com
- ✅ Stores in MongoDB with smart caching
- ✅ Serves via REST APIs
- ✅ Displays in a modern React frontend
- ✅ No mocks, no fake data

Everything is live and real!

Happy exploring! 🎉
