# Development Checklist & Troubleshooting

## ✅ Pre-Launch Checklist

### Backend Setup
- [ ] MongoDB is running and accessible
- [ ] `npm install` completed in `/backend`
- [ ] `.env` file configured with correct MongoDB URI
- [ ] Port 3001 is available
- [ ] `npm run start:dev` starts without errors
- [ ] Swagger docs available at `/api/docs`

### Frontend Setup
- [ ] `npm install` completed in `/frontend`
- [ ] `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- [ ] Port 3000 is available
- [ ] `npm run dev` starts without errors
- [ ] Frontend loads at `http://localhost:3000`

### Code Quality
- [ ] No TypeScript errors in backend
- [ ] No TypeScript errors in frontend
- [ ] Backend compiles successfully: `npm run build`
- [ ] Frontend builds successfully: `npm run build`
- [ ] No console errors in browser DevTools
- [ ] No console warnings in browser DevTools

### Database
- [ ] Cart collection created (auto on first use)
- [ ] SavedForLater collection created (auto on first use)
- [ ] Indexes created correctly
- [ ] TTL indexes working (test after 2-3 seconds delay)

---

## 🧪 Testing Checklist

### UI Tests
- [ ] Home page loads without errors
- [ ] Products display correctly
- [ ] ProductCard renders all props
- [ ] Header shows cart/saved icons
- [ ] Badges show on icons

### Cart Functionality
- [ ] Click "Add to Cart" → toast appears
- [ ] Cart badge count increases
- [ ] Click cart icon → goes to `/cart`
- [ ] Cart page shows items
- [ ] Quantity +/- buttons work
- [ ] Remove button removes item
- [ ] Clear cart removes all items
- [ ] Cart persists on refresh
- [ ] Order total calculates correctly

### Save Functionality
- [ ] Click heart icon → fills red
- [ ] Saved toast appears
- [ ] Saved badge count increases
- [ ] Click heart again → unfills
- [ ] Remove toast appears
- [ ] Click saved icon → goes to `/saved`
- [ ] Saved page shows items
- [ ] Clear saved removes all items
- [ ] Saved state persists on refresh

### Product Detail
- [ ] Product loads correctly
- [ ] All buttons visible (Add to Cart, Save, Buy)
- [ ] Add to Cart works
- [ ] Save for Later works
- [ ] Buy on World of Books opens new tab
- [ ] External URL is correct format

### Responsive Design
- [ ] Desktop (1920px): All elements visible
- [ ] Tablet (768px): Layout adapts
- [ ] Mobile (375px): Touch targets adequate
- [ ] Mobile menu works
- [ ] Cart/saved icons visible on mobile

### Error Handling
- [ ] Network error shows gracefully
- [ ] Invalid product ID shows error page
- [ ] Empty cart shows empty state
- [ ] Empty saved shows empty state
- [ ] API 500 error handled

### Performance
- [ ] Products load in < 1 second
- [ ] Cart updates in < 500ms
- [ ] No memory leaks in DevTools
- [ ] Smooth animations at 60fps
- [ ] Mobile scrolling smooth

---

## 🔧 Troubleshooting Guide

### Issue: "Cannot GET /api/cart"
**Cause**: CartModule not imported in AppModule
**Fix**:
```typescript
// backend/src/app.module.ts
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    // ... other imports
    CartModule,
  ],
})
export class AppModule {}
```

---

### Issue: "CORS error" in browser
**Cause**: CORS not configured for frontend URL
**Fix**:
```typescript
// backend/src/main.ts
app.use(
  cors({
    origin: 'http://localhost:3000', // Match your frontend URL
    credentials: true,
  }),
);
```

---

### Issue: Toast not showing
**Cause**: ToastContainer not in layout
**Fix**:
```typescript
// frontend/src/app/layout.tsx
import RootLayoutClient from './layout-client';

return (
  <html>
    <body>
      <RootLayoutClient>
        {/* children here */}
      </RootLayoutClient>
    </body>
  </html>
);
```

---

### Issue: Cart count not updating in header
**Cause**: useCart not calling mutate()
**Fix**:
```typescript
// frontend/src/hooks/useCart.ts
const addItem = useCallback(
  async (productId: string, quantity: number = 1) => {
    await addToCart(productId, quantity);
    mutate(); // ← Add this!
  },
  [mutate],
);
```

---

### Issue: "Cannot read property '_id' of undefined"
**Cause**: productId might be null
**Fix**:
```typescript
// Always check before using
const productId = _id || id;
if (!productId || productId === 'undefined') {
  return null;
}
```

---

### Issue: MongoDB connection timeout
**Cause**: MongoDB not running or wrong URI
**Fix**:
```bash
# Check MongoDB is running
mongo
# or
mongosh

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/your-db-name
```

---

### Issue: Saved items not showing in /saved page
**Cause**: Items not populated correctly
**Fix**:
```typescript
// backend/src/saved-for-later/saved-for-later.service.ts
async getSavedItems(userId: string) {
  return this.savedModel
    .find({ userId })
    .populate('productId') // ← Make sure to populate!
    .exec();
}
```

---

### Issue: External link shows wrong URL
**Cause**: ISBN not in product data
**Fix**:
```typescript
// Check product has ISBN
const generateWorldOfBooksUrl = () => {
  if (!product.isbn) {
    console.warn('No ISBN for:', product.title);
    return 'https://www.worldofbooks.com'; // Fallback
  }
  // ... generate URL with ISBN
};
```

---

### Issue: "Cannot find module '@/hooks'"
**Cause**: Hooks folder not exported
**Fix**:
```typescript
// frontend/src/hooks/index.ts
export { useCart } from './useCart';
export { useSaved } from './useSaved';
```

---

### Issue: Quantity control disabled on mobile
**Cause**: Button too small for touch
**Fix**:
```typescript
// Ensure padding and size
<button className="p-3 h-12 w-12 hover:bg-gray-100">
  <Plus size={18} />
</button>
```

---

### Issue: Images not loading from proxy
**Cause**: Proxy URL incorrect
**Fix**:
```typescript
// frontend/src/lib/api.ts
export const getProxiedImage = (url: string) => {
  if (!url) return '/images/placeholder-book.svg';
  if (url.includes('/api/image') || url.startsWith('/')) {
    return url;
  }
  if (url.startsWith('http')) {
    const encoded = encodeURIComponent(url);
    return `${API_BASE}/image?url=${encoded}`;
  }
  return '/images/placeholder-book.svg';
};
```

---

## 📋 Manual Testing Steps

### Test 1: Full Cart Workflow
```
1. Open http://localhost:3000
2. Find a product, click card
3. Click "Add to Cart" button
4. ✓ Toast shows
5. ✓ Cart badge shows 1
6. Go back home
7. Add different product to cart
8. ✓ Badge shows 2
9. Click cart icon
10. ✓ See 2 items with totals
11. Increase quantity of item 1
12. ✓ Total updates
13. Click remove on item 2
14. ✓ Item disappears, badge shows 1
15. Click "Clear Cart"
16. ✓ Empty state shows
```

### Test 2: Full Save Workflow
```
1. Open home page
2. Click heart on product
3. ✓ Heart fills red
4. ✓ Toast shows "Saved"
5. ✓ Saved badge shows 1
6. Click heart again
7. ✓ Heart unfills
8. ✓ Toast shows "Removed"
9. ✓ Badge shows 0
10. Save multiple products
11. Click saved icon
12. ✓ See all saved in grid
13. Click "Clear All"
14. ✓ Empty state shows
```

### Test 3: External Link
```
1. Go to product detail
2. Scroll to buttons
3. Click "Buy on World of Books"
4. ✓ New tab opens
5. ✓ URL contains worldofbooks.com
6. ✓ URL has proper format with ISBN/slug
```

### Test 4: Persistence
```
1. Add to cart
2. ✓ See in cart page
3. Refresh page
4. ✓ Item still in cart
5. Open in new tab
6. ✓ Cart still shows items (same session)
```

---

## 🐛 Common Mistakes

### ❌ Wrong import path
```javascript
// ❌ Wrong
import { useCart } from '@/lib/hooks';

// ✓ Correct
import { useCart } from '@/hooks';
```

---

### ❌ Missing await
```javascript
// ❌ Wrong
const result = addItem(productId);
if (result.success) { }

// ✓ Correct
const result = await addItem(productId);
if (result.success) { }
```

---

### ❌ Not calling mutate()
```javascript
// ❌ Wrong - data doesn't update
async addItem(productId) {
  await addToCart(productId);
}

// ✓ Correct - data refreshes
async addItem(productId) {
  await addToCart(productId);
  mutate();
}
```

---

### ❌ Using .id instead of ._id
```javascript
// ❌ Wrong - MongoDB uses _id
const id = product.id;

// ✓ Correct
const id = product._id || product.id;
```

---

### ❌ Not handling null/undefined
```javascript
// ❌ Wrong - crashes if no productId
const cartItem = items.find(i => i.productId === productId);

// ✓ Correct
const cartItem = items.find(i => 
  i.productId?._id === productId || i.productId === productId
);
```

---

## 🔍 Debugging Tips

### Browser DevTools
```javascript
// Check cart state
localStorage.getItem('SWR_CACHE'); // If using SWR cache

// Check API responses
// Network tab → filter by /api/cart
// Watch request/response headers

// Check component state
// React DevTools → useCart hook state
```

### Backend Debugging
```bash
# Check MongoDB
mongosh
use your-db
db.carts.find()
db.carts.countDocuments()

# Check Nest logs
# Terminal shows: [Nest] ... NestApplication
# Look for errors or warnings
```

### API Testing
```bash
# Test cart endpoint
curl -i http://localhost:3001/api/cart

# Test with data
curl -i -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"productId":"65abc...","quantity":1}'
```

---

## 📊 Health Check

Run this to verify everything works:

```bash
# 1. Check backend running
curl http://localhost:3001/api/docs

# 2. Check frontend running
curl http://localhost:3000

# 3. Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# 4. Check collections
mongosh --eval "db.carts.countDocuments()"
```

---

## ✨ Performance Tips

### Frontend
```typescript
// Use useMemo for expensive calculations
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.total, 0);
}, [items]);

// Use useCallback to prevent re-renders
const handleAddToCart = useCallback(async () => {
  // ...
}, [dependencies]);

// Lazy load routes
const CartPage = dynamic(() => import('@/app/cart/page'), {
  loading: () => <Skeleton />,
});
```

### Backend
```typescript
// Use indexes
CartSchema.index({ userId: 1, productId: 1 });

// Use select for specific fields
await Cart.find({ userId }).select('_id productId quantity');

// Use pagination
.skip(page * limit)
.limit(limit)
```

---

## 🚀 Deployment Checklist

### Before Deploying
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Environment variables set
- [ ] Database backup taken
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Monitoring set up

### Configuration
```env
# Production Backend .env
API_PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production

# Production Frontend .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 📈 Monitoring

### Key Metrics
```
- API response time: < 200ms
- Cart update time: < 500ms
- Error rate: < 0.1%
- Database query time: < 100ms
- Uptime: > 99.9%
```

### Logging
```bash
# Backend logs
tail -f /var/log/backend.log

# Frontend errors
# Browser console
# Sentry/LogRocket integration
```

---

## 🎯 Final Verification

```bash
# ✓ Backend
npm run build    # No errors
npm run test     # All pass (if tests exist)
npm run start    # Runs on 3001

# ✓ Frontend  
npm run build    # No errors
npm run test     # All pass (if tests exist)
npm run start    # Runs on 3000

# ✓ Database
mongosh          # Connects
show databases   # Your DB listed
db.carts.find()  # No errors

# ✓ API
curl http://localhost:3001/api/cart  # 200 OK

# ✓ UI
localhost:3000/  # Loads
/cart            # Works
/saved           # Works
/product/[id]    # Works
```

---

**You're all set! 🎉**

If you encounter any issues, refer to the troubleshooting section above.
