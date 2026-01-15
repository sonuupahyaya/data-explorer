# Quick Reference - Common Fixes

## Build Failures

### TypeScript: "Cannot find name 'expect', 'it', 'describe'"
**Cause**: Test files being compiled in production build
**Fix**: Already done - tsconfig.build.json excludes tests

### Backend build fails
```bash
# Clean and rebuild
cd backend
Remove-Item -Recurse -Force dist
npm run build
```

### Frontend chunk load error
```bash
# Clear Next.js cache
cd frontend
Remove-Item -Recurse -Force .next
npm run build
npm run dev
```

## Database Issues

### MongoDB connection refused
- Check MONGO_URI in .env
- Verify IP whitelist in MongoDB Atlas
- Test connection string locally

### No products appearing
```bash
# Trigger auto-scrape
curl -X POST http://localhost:3001/api/products/scrape/force-all

# Check status
curl http://localhost:3001/api/products/scrape/status
```

### Duplicate products
Already fixed with unique index on source_url:
```javascript
ProductSchema.index({ source_url: 1 }, { unique: true });
```

## API Issues

### CORS errors
Check CORS_ORIGIN in backend .env:
```
CORS_ORIGIN=http://localhost:3000,https://vercel-url
```

### API returns 500
1. Check backend logs
2. Verify MongoDB connection
3. Check request format

### API timeout
Increase PLAYWRIGHT_TIMEOUT in .env:
```
PLAYWRIGHT_TIMEOUT=60000
```

## Frontend Issues

### Products not loading
1. Check NEXT_PUBLIC_API_URL
2. Verify backend is running
3. Check browser console
4. Check network tab

### Images not showing
- Backend returns image_url
- Frontend proxies via getProxiedImage()
- Check browser console for 404s

### Cart not persisting
- Uses localStorage
- Check DevTools → Application → Storage
- Must be in browser (not SSR)

## Deployment Issues

### Render build fails
1. Check build command: `npm run build`
2. Check Node version: 18+
3. Check environment variables set
4. Check logs for TypeScript errors

### Vercel build fails
1. Check NEXT_PUBLIC_API_URL set
2. Run `npm run build` locally first
3. Check for missing files in git
4. Clear Vercel cache and rebuild

### API not reachable from frontend
1. Verify Render backend is running
2. Check CORS_ORIGIN includes Vercel URL
3. Use full URL: https://render-url/api
4. Test directly: `curl https://render-url/api/products`

## Performance Issues

### Slow first load
- Normal: auto-scrape takes 30-60s first time
- Set browser timeout to 120s
- Subsequent loads use cache

### API slow responses
- Check MongoDB Atlas CPU usage
- Check network connection
- Verify indexes are created
- Monitor logs for errors

### Images slow to load
- Images stored on external sources
- Frontend should proxy/cache
- Consider CDN for production

## Verification Commands

### Backend Health
```bash
# Check if running
curl http://localhost:3001/api/docs

# Get products count
curl http://localhost:3001/api/products/all | jq '.length'

# Get categories
curl http://localhost:3001/api/categories | jq '.length'

# Check scraping status
curl http://localhost:3001/api/products/scrape/status
```

### Frontend Health
```bash
# Check if running
curl http://localhost:3000

# Check build
ls -la frontend/.next

# Check env variables are set
grep NEXT_PUBLIC_API_URL frontend/.env.local
```

### Database Health
```javascript
// In MongoDB Atlas console
db.products.countDocuments()
db.categories.countDocuments()
db.products.findOne()
```

## Emergency Procedures

### Reset Database
```bash
# Delete all products and categories (MongoDB)
db.products.deleteMany({})
db.categories.deleteMany({})

# Then trigger auto-scrape:
curl -X POST http://localhost:3001/api/products/scrape/force-all
```

### Kill Process on Port
```powershell
# Kill Node process
Get-Process node | Stop-Process -Force

# Find what's on port 3001
Get-NetTCPConnection -LocalPort 3001
```

### Full Restart
```bash
# Backend
cd backend
npm run build
npm start

# Frontend (new terminal)
cd frontend
npm run dev
```

## Useful Logs

### Backend logs show:
```
✓ MongoDB connected to bookvault
✓ Backend running on port 3001
✓ API docs available at http://localhost:3001/api/docs
📚 findAll() called
🕷️  Starting scrape of: https://www.worldofbooks.com/en-gb/fiction
✅ Saved X products for Fiction
```

### Frontend logs show:
```
> ready - started server on 0.0.0.0:3000
GET /api/products → 200
GET /api/categories → 200
```

## Environment Checklist

### Backend .env
- [ ] NODE_ENV=production (or development)
- [ ] API_PORT=3001
- [ ] MONGO_URI=mongodb+srv://...
- [ ] CORS_ORIGIN includes frontend URL
- [ ] CACHE_TTL_SECONDS=86400
- [ ] PLAYWRIGHT_HEADLESS=true

### Frontend .env.local
- [ ] NEXT_PUBLIC_API_URL=http://localhost:3001/api
- [ ] NODE_ENV=development (or production)

## Success Indicators

✅ Backend:
- Listens on port 3001
- Swagger docs at /api/docs
- GET /api/products returns data

✅ Frontend:
- Listens on port 3000
- Homepage loads
- Images visible
- Cart works

✅ Database:
- MongoDB Atlas connected
- Products in collection
- Categories in collection
- No TypeScript errors

✅ Deployment:
- Render backend running
- Vercel frontend running
- API accessible from frontend
- Books visible in UI

## Support
- Backend logs: `npm start` with NODE_ENV=debug
- Frontend logs: Browser DevTools → Console
- MongoDB logs: Atlas dashboard
