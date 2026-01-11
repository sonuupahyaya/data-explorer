# Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Option 1: Docker (Easiest - 1 Command)

```bash
docker-compose up --build
```

Then visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Option 2: Local Development (Detailed)

#### Prerequisites
- Node.js 18+
- MongoDB running

#### Step 1: Start MongoDB

```bash
# With Docker
docker run -d -p 27017:27017 mongo:5.0

# OR use your local MongoDB installation
```

#### Step 2: Install Dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

#### Step 3: Start Backend (Terminal 1)

```bash
cd backend
npm run start:dev

# Will output:
# ✓ Backend running on port 3001
# ✓ API docs available at http://localhost:3001/api/docs
```

#### Step 4: Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev

# Will output:
# ▲ Next.js running on http://localhost:3000
```

#### Step 5: Validate (Terminal 3)

```bash
cd backend
npm run scrape:fiction

# Should output:
# 🚀 Starting Fiction Books Scraper Validation
# ✅ Navigation scraped: 3 items found
# ✅ Categories scraped: 15+ items found
# ✅ Products scraped: 20+ items found
# ✅ VALIDATION SUCCESSFUL!
# [Real book data displayed]
```

---

## 🌐 Access Your Application

Once running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Browse books |
| Backend API | http://localhost:3001 | REST API |
| API Docs | http://localhost:3001/api/docs | Swagger UI |
| MongoDB | localhost:27017 | Database |

---

## 🧪 Test the Platform

### Search Books
1. Go to http://localhost:3000
2. Click "Search" or use the search bar
3. Search for "fiction" or any book title

### Browse by Category
1. Go home page
2. Click any category in "Browse by Category"
3. See products listed

### View Product Details
1. Click any book in the grid
2. See full details with reviews

### Validate with Real Data
```bash
cd backend
npm run scrape:fiction
```

This confirms:
- Playwright/Crawlee work
- Scraping from worldofbooks.com succeeds
- Real book data is extracted
- System is end-to-end functional

---

## 📋 File Structure

```
.
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── scraper/           # Web scraping
│   │   ├── navigation/        # Navigation API
│   │   ├── products/          # Products API
│   │   ├── search/            # Search API
│   │   └── ...
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities
│   │   └── styles/            # CSS
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml         # Docker setup
├── README.md                  # Quick start
├── COMPLETE_README.md         # Full docs
└── IMPLEMENTATION_SUMMARY.md  # What was built
```

---

## ⚙️ Configuration

### Backend (.env)

```env
NODE_ENV=development
API_PORT=3001
MONGODB_URI=mongodb://localhost:27017/world_of_books
CORS_ORIGIN=http://localhost:3000
CACHE_TTL_SECONDS=86400
LOG_LEVEL=debug
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=24
```

---

## 🆘 Troubleshooting

### Port 3000/3001 Already in Use

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or change port in .env
API_PORT=3002
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongosh

# If not, start it
docker run -d -p 27017:27017 mongo:5.0
```

### Scraper Fails

```bash
# Ensure Playwright browsers are installed
npx playwright install

# Check Node version
node --version  # Should be 18+
```

### Frontend Can't Connect to Backend

```bash
# Check backend is running
curl http://localhost:3001/api/docs

# Check frontend .env.local has correct API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Production Deployment

### Deploy Backend

```bash
# Build
npm run build

# Run
NODE_ENV=production npm start
```

### Deploy Frontend

```bash
# Build
npm run build

# Run
npm start
```

### Or Use Docker

```bash
docker-compose -f docker-compose.yml up --build
```

---

## 📚 Learn More

- **Complete Guide**: `COMPLETE_README.md`
- **Backend Docs**: `backend/README.md`
- **Frontend Docs**: `frontend/README.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **API Reference**: http://localhost:3001/api/docs

---

## ✅ You're All Set!

Your World of Books Discovery Platform is running with:

✅ Real book data from worldofbooks.com  
✅ Intelligent caching  
✅ Full-text search  
✅ Advanced filtering  
✅ Beautiful UI  
✅ Complete APIs  
✅ Production ready  

**Start exploring!** 🎉

---

## 🎯 Next Steps

1. ✅ Get it running (you're here)
2. 📖 Read COMPLETE_README.md for deep dive
3. 🔍 Explore the APIs at /api/docs
4. 💻 Customize for your needs
5. 🚀 Deploy to production

---

**Questions?** Check the documentation files or code comments.
