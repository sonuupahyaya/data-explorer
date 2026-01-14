# Quick Start - Running the Full Application

Complete guide to get the entire World of Books Discovery Platform running locally.

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (running locally or MongoDB Atlas connection string)

## Step 1: Backend Setup

### Terminal 1 - Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file if it doesn't exist
# Make sure these are set:
# MONGODB_URI=your_mongodb_connection_string
# NODE_ENV=development
# PORT=3001

# Start backend
npm run dev
```

**Expected output:**
```
[Nest] 12:00:00 - 01/14/2026, 12:00:00 PM [NestFactory] Nest application successfully started +123ms
```

**Test backend is running:**
```bash
curl http://localhost:3001/api/navigation
```

You should get a JSON response with categories.

## Step 2: Frontend Setup

### Terminal 2 - Frontend
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# The .env.local should already have:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start frontend
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.0.3
  - Local:        http://localhost:3000
  - Environments: .env.local
```

## Step 3: Open Application

Visit `http://localhost:3000` in your browser.

You should see:
- World of Books logo in navbar
- Search bar
- Featured books grid
- Category shortcuts
- Info section at bottom

## Troubleshooting

### Backend won't start

**Error: "Cannot connect to MongoDB"**
```bash
# Check MongoDB is running
# For local MongoDB:
mongod --version

# For MongoDB Atlas, check connection string:
# Should be: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

**Error: "Port 3001 already in use"**
```bash
# Find process using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or use different port
PORT=3002 npm run dev
```

### Frontend won't start

**Error: "Cannot connect to API"**
```bash
# Check .env.local has correct API URL
cat frontend/.env.local

# Should show:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Test API is accessible:
curl http://localhost:3001/api/navigation
```

**Error: "Port 3000 already in use"**
```bash
# Use different port
npm run dev -- -p 3001
```

### Pages show "No results" or empty

**Check:**
1. Backend is running and has data
   ```bash
   curl http://localhost:3001/api/products
   ```

2. Database has products
   ```bash
   # If using local MongoDB:
   mongo
   > db.products.find().count()
   ```

3. Frontend can reach API
   - Open browser DevTools
   - Check Network tab
   - Look for failed requests to `/api/`

## Testing the Application

### Home Page
- [ ] Logo visible
- [ ] Search bar works
- [ ] Featured books display
- [ ] Category shortcuts visible
- [ ] Benefits section shows

### Search
- [ ] Type in search box and press Enter
- [ ] Results load
- [ ] Sorting works (newest, price, rating)
- [ ] Pagination works

### Browse Categories
- [ ] Click a category
- [ ] Products load for that category
- [ ] Related subcategories shown
- [ ] Sorting/pagination works

### Product Details
- [ ] Click a product
- [ ] Product details load
- [ ] Image displays
- [ ] Price/rating/reviews show
- [ ] Related books appear

### Favorites
- [ ] Click heart icon on any product
- [ ] Heart fills red
- [ ] Refresh page
- [ ] Heart still red (localStorage persisted)

## Useful Commands

### Development
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Both in parallel (if you have concurrently)
npm run dev:all
```

### Production Build
```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm start
```

### Database
```bash
# View MongoDB data (local)
mongo

# View products
> use worldofbooks
> db.products.find().limit(5)

# View categories
> db.categories.find()
```

### Cleaning Up
```bash
# Clear frontend cache
cd frontend && rm -rf .next node_modules
npm install

# Clear backend build
cd backend && rm -rf dist node_modules
npm install
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=World of Books Discovery
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/worldofbooks
```

For production:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/worldofbooks
```

## Directory Structure

```
data-explorer/
├── frontend/              # ← Start: npm run dev
├── backend/              # ← Start: npm run dev
├── docker-compose.yml    # For Docker setup
└── docs/                 # Documentation
```

## Next Steps

### After Everything is Running:

1. **Explore the App**
   - Browse different categories
   - Search for books
   - View product details
   - Check about page

2. **Test Features**
   - Add favorites
   - Check browsing history persists
   - Test mobile responsiveness
   - Try sorting/pagination

3. **View Code**
   - Frontend: `frontend/src/app/page.tsx`
   - Backend: `backend/src/products/`
   - API: `backend/src/main.ts`

4. **Deploy** (Optional)
   - Read `DEPLOYMENT_GUIDE.md`
   - Choose hosting platform
   - Deploy frontend to Vercel
   - Deploy backend to Railway

## Useful URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:3001/api | API endpoint |
| API Docs | http://localhost:3001/api/docs | Swagger documentation |
| MongoDB | localhost:27017 | Database |

## Getting Help

### Logs and Debugging

**Backend logs:**
```bash
# Check terminal where backend is running
# Look for errors with [Nest] prefix
npm run dev
```

**Frontend logs:**
```bash
# Browser console: F12 → Console tab
# Check for red errors
# Network tab: Check API calls
```

**Database logs:**
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"
```

### Common Solutions

1. **Clear cache and rebuild**
   ```bash
   cd frontend && rm -rf .next && npm run dev
   ```

2. **Restart MongoDB**
   ```bash
   # macOS
   brew services restart mongodb-community
   
   # Linux
   sudo systemctl restart mongod
   ```

3. **Check ports are free**
   ```bash
   lsof -i :3000  # Frontend
   lsof -i :3001  # Backend
   ```

4. **Fresh install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Production Deployment

Once everything works locally, deploy:

1. **Frontend**: Vercel (automatic with Git)
2. **Backend**: Railway or Heroku
3. **Database**: MongoDB Atlas (free tier available)

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Tips

- Keep both terminals open (backend + frontend)
- Check browser console for frontend errors
- Check terminal for backend errors
- Use DevTools Network tab to debug API calls
- Bookmark `http://localhost:3001/api/docs` for API reference
- Clear localStorage to test fresh state: `localStorage.clear()`

---

## Support

If you get stuck:
1. Check the logs in both terminals
2. Verify ports 3000 and 3001 are available
3. Ensure MongoDB is running
4. Check `.env` files are configured correctly
5. Try the Troubleshooting section above

Happy coding! 🚀
