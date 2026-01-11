# 🎯 Getting Started - World of Books Discovery Platform

A **REAL**, **PRODUCTION-READY** product discovery platform that scrapes **LIVE DATA** from worldofbooks.com.

## What You Have

✅ **Real Scraper** - Axios + Cheerio fetching live worldofbooks.com data  
✅ **Real Database** - MongoDB storing deduplicated products  
✅ **Real APIs** - NestJS REST endpoints serving actual data  
✅ **Real Frontend** - Next.js displaying real World of Books content  
✅ **Smart Caching** - 24h TTL, instant responses, background refresh  

## 5-Minute Quickstart

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Configure MongoDB

Edit `.env` in project root:

```env
MONGODB_URI=mongodb+srv://upadhyayasonu41_db_user:<PASSWORD>@cluster0.cnexpxs.mongodb.net/world_of_books?retryWrites=true&w=majority
MONGODB_DB_NAME=world_of_books
```

Replace `<PASSWORD>` with your actual password.

### 3. Start Both Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

Wait for:
```
✓ Backend running on port 3001
✓ API docs available at http://localhost:3001/api/docs
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Wait for:
```
✓ Ready in X.Xs
Local: http://localhost:3000
```

### 4. Open Browser

**Frontend:** http://localhost:3000  
**API Docs:** http://localhost:3001/api/docs  

## Test It Out

### Option 1: Simple Test with curl

```bash
# Get navigation (real World of Books categories)
curl http://localhost:3001/api/navigation

# Response: Real categories from worldofbooks.com
# [
#   {"slug":"fiction","title":"Fiction",...},
#   {"slug":"mystery","title":"Mystery & Thriller",...},
#   ...
# ]
```

### Option 2: Use Swagger UI

1. Go to http://localhost:3001/api/docs
2. Click "Try it out" on any endpoint
3. See REAL data from worldofbooks.com
4. Modify parameters and test

### Option 3: Use Frontend

1. Visit http://localhost:3000
2. See real book categories
3. Click to browse products
4. View real books with prices

## Key Features (All Real)

| Feature | What It Does |
|---------|-------------|
| **Navigation** | Browse actual World of Books categories |
| **Products** | See real books with live prices |
| **Pagination** | Navigate through actual product lists |
| **Caching** | Smart 24h cache, instant responses |
| **Search** | Full-text search across real products |
| **Details** | View real product specs & descriptions |

## API Quick Reference

### Get All Categories
```bash
curl http://localhost:3001/api/navigation
```

### Get Products in Category
```bash
curl "http://localhost:3001/api/products?category=fiction&page=1&limit=24"
```

### Get Single Product
```bash
curl http://localhost:3001/api/product/{id}
```

### Refresh Data (Force Scrape)
```bash
curl -X POST http://localhost:3001/api/navigation/refresh
```

See full API docs at http://localhost:3001/api/docs

## Understanding the Data Flow

### First Time (Scraping)

```
You: GET /api/navigation
     ↓
Backend: "No cache, let me scrape worldofbooks.com..."
     ↓
Scraper: Fetches https://www.worldofbooks.com
     ↓
Parser: Extracts categories from HTML
     ↓
Database: Stores in MongoDB
     ↓
Response: You get real data (~5-10 seconds)
```

### Second Time (Cached)

```
You: GET /api/navigation
     ↓
Backend: "I have this cached, returning instantly..."
     ↓
Database: Retrieves from MongoDB
     ↓
Response: You get data immediately (< 100ms)
     ↓
Background: Silently refreshes if cache is stale
```

## Directory Structure

```
c:/Users/Sonuu/Desktop/data explorer/
├── backend/
│   ├── src/
│   │   ├── scraper/
│   │   │   ├── world-of-books.scraper.ts  ← REAL scraper
│   │   │   └── scraper.service.ts
│   │   ├── navigation/
│   │   ├── products/
│   │   ├── schemas/  ← MongoDB definitions
│   │   └── main.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/   ← Next.js pages
│   │   ├── components/
│   │   └── lib/api.ts  ← API client
│   └── package.json
│
├── .env  ← Your MongoDB config
├── RUN_INSTRUCTIONS.md  ← How to run
├── SCRAPING_STRATEGY.md  ← Technical details
└── README.md
```

## Troubleshooting

### Backend won't start
```bash
# Check Node version
node --version  # Should be 20+

# Check port 3001 is free
# If not, set API_PORT in .env

# Check MongoDB connection
# Verify MONGODB_URI in .env is correct
```

### Frontend won't start
```bash
# Check port 3000 is free
# Check Node version (should be 20+)
npm run dev
```

### No data appears
```bash
# 1. Wait 10-15 seconds (first scrape is slow)
# 2. Refresh browser
# 3. Check backend logs for scraping status
# 4. Try API directly: curl http://localhost:3001/api/navigation
```

### MongoDB connection error
```bash
# Verify in .env:
# 1. MONGODB_URI is correct
# 2. Password is correct (no special chars without escaping)
# 3. IP is whitelisted in MongoDB Atlas
# 4. User has correct permissions
```

## Next Steps

1. **Explore:** Browse products at http://localhost:3000
2. **Test APIs:** Visit http://localhost:3001/api/docs
3. **Read Docs:** See `SCRAPING_STRATEGY.md` for technical details
4. **Deploy:** See `DEPLOYMENT.md` for production setup
5. **Customize:** Add more features to `backend/src/`

## Monitoring Scraping

Watch the backend logs to see scraping in action:

```
🕷️  SCRAPING REAL DATA from https://www.worldofbooks.com...
  Trying selector "nav a": found 15 elements
  ✅ Found navigation: "Fiction"
  ✅ Found navigation: "Mystery & Thriller"
✅ Navigation scrape complete: 20 REAL items
```

Each scrape:
- Fetches real HTML from worldofbooks.com
- Parses with Cheerio
- Stores in MongoDB
- Takes 5-10 seconds (then cached for 24h)

## Data Examples

### Real Navigation Response
```json
[
  {
    "_id": "507f...",
    "slug": "fiction",
    "title": "Fiction",
    "url": "https://www.worldofbooks.com/books/fiction",
    "category_count": 45
  },
  {
    "_id": "507f...",
    "slug": "mystery-thriller",
    "title": "Mystery & Thriller",
    "url": "https://www.worldofbooks.com/books/mystery",
    "category_count": 28
  }
]
```

### Real Products Response
```json
{
  "data": [
    {
      "_id": "507f...",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 8.99,
      "currency": "GBP",
      "image_url": "https://...",
      "source_url": "https://www.worldofbooks.com/products/...",
      "rating_avg": 4.5,
      "reviews_count": 128
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 1245,
    "pages": 52
  }
}
```

## Important Notes

⚠️ **This is REAL:**
- Not a mock or demo
- Actually scrapes worldofbooks.com
- Products are real World of Books items
- Prices are actual prices
- Images link to real product pages

⚠️ **Respect the Website:**
- Rate limit: 2s between requests
- Cache: Don't re-scrape if data is fresh
- Always use reasonable pagination
- Don't scrape more than needed

⚠️ **MongoDB Required:**
- Persist all scraped data
- Avoid re-scraping
- Enable fast searches
- Track scrape history

## Support

Check these files for more info:
- `README.md` - Full architecture
- `SCRAPING_STRATEGY.md` - How scraping works
- `API_DOCS.md` - API reference
- `DEPLOYMENT.md` - Production setup
- `RUN_INSTRUCTIONS.md` - Running guide

## Validation Checklist

✅ Backend starts without errors  
✅ Frontend loads at http://localhost:3000  
✅ API docs available at http://localhost:3001/api/docs  
✅ GET /api/navigation returns real categories  
✅ GET /api/products returns real books  
✅ MongoDB has data (check with MongoDB client)  
✅ Prices match worldofbooks.com  
✅ Product images load  
✅ Pagination works  
✅ Search works  

If all checkboxes pass, you have a **working, real product discovery platform**! 🎉

---

## Summary

You now have:
- ✅ A production-ready platform
- ✅ Real data from worldofbooks.com
- ✅ Smart caching for performance
- ✅ Modern frontend
- ✅ RESTful APIs
- ✅ MongoDB persistence
- ✅ Full documentation

Everything is live, real, and ready to use!

Start with step 1 in "5-Minute Quickstart" above. Questions? Check the docs or look at the logs!
