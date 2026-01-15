# Running Full Stack in Development/Production

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (connection URI in .env)
- Playwright (will install with npm)

## Step 1: Setup Environment Variables

### Backend (.env file)
```
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0
MONGO_URI=mongodb+srv://upadhyayasonu41_db_user:x8eHVTUnHxxrYgy9@cluster0.65btztr.mongodb.net/bookvault?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CACHE_TTL_SECONDS=86400
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
LOG_LEVEL=debug
WOB_BASE_URL=https://www.worldofbooks.com/en-gb
```

### Frontend (.env.local file)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
```

## Step 2: Build Backend

```powershell
cd backend
npm install
npm run build
```

This will:
- Compile TypeScript using tsconfig.build.json
- Exclude all test files
- Output to `dist/` directory

## Step 3: Start Backend

```powershell
npm start
```

Expected output:
```
✓ MongoDB connected to bookvault
✓ Backend running on port 3001
✓ API docs available at http://localhost:3001/api/docs
```

## Step 4: Test Backend

Open in browser or use curl:
```
http://localhost:3001/api/products/all
```

The API will:
1. Check if MongoDB has products
2. If empty, trigger auto-scrape of Fiction, Non-Fiction, Children
3. Return all products with pagination

## Step 5: Build Frontend

In a NEW terminal:
```powershell
cd frontend
npm install
npm run build
```

## Step 6: Start Frontend Dev Server

```powershell
npm run dev
```

Expected output:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 7: Test Full App

1. **Homepage**: http://localhost:3000
   - Should show books from MongoDB
   - Categories sidebar

2. **Cart**: http://localhost:3000/cart
   - Add/remove items
   - Checkout (connected to backend)

3. **API Docs**: http://localhost:3001/api/docs
   - Full Swagger documentation
   - Test all endpoints

## Troubleshooting

### Frontend shows "ChunkLoadError"
```powershell
Remove-Item -Recurse -Force frontend\.next
npm run build
npm run dev
```

### MongoDB connection fails
- Verify MongoDB URI in .env
- Check network access in MongoDB Atlas dashboard
- Ensure IP is whitelisted

### No products appear
- API should auto-scrape when empty
- Monitor: `http://localhost:3001/api/products/scrape/status`
- Force scrape: `curl -X POST http://localhost:3001/api/products/scrape/force-all`

### Port already in use
```powershell
# Kill existing Node process
Get-Process node | Stop-Process -Force
```

## Production Deployment

### Render (Backend)
1. Push to GitHub
2. Connect repo to Render
3. Set Environment Variables:
   - NODE_ENV=production
   - MONGO_URI=...
   - CORS_ORIGIN=https://your-vercel-app.vercel.app
4. Build: `npm run build`
5. Start: `npm start`

### Vercel (Frontend)
1. Connect repo to Vercel
2. Set Environment Variables:
   - NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com/api
3. Vercel auto-builds and deploys on push

## Next Steps
1. Verify both services start without errors
2. Test homepage loads books
3. Test cart functionality
4. Deploy to Render/Vercel
