# Test Cart & Favorites System

## Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm run start:dev
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open Browser
```
http://localhost:3000
```

## Test Checklist

### ✅ Test Add to Cart
- [ ] Navigate to home page
- [ ] Click "Add to Cart" on any product card
- [ ] See toast: "Added to cart"
- [ ] Check header - cart count should be "1"
- [ ] Refresh page - cart count still "1"
- [ ] Go to /cart page - item should be visible
- [ ] Product image, title, author, price should show
- [ ] Quantity selector should work

### ✅ Test Save for Later
- [ ] On home page, click heart on a product
- [ ] See toast: "Saved for later"
- [ ] Heart should turn red
- [ ] Check header - saved count should be "1"
- [ ] Refresh page - heart still red, saved count still "1"
- [ ] Go to /saved page - product should appear
- [ ] Click heart again to remove
- [ ] Toast: "Removed from saved"

### ✅ Test Cart Operations
- [ ] Add 3 different products to cart
- [ ] Go to /cart page
- [ ] All 3 should appear
- [ ] Click + on quantity - quantity increases
- [ ] Item total price updates
- [ ] Order summary updates
- [ ] Click - on quantity - quantity decreases
- [ ] Click trash icon - item removes
- [ ] See toast: "Item removed"
- [ ] Order summary updates
- [ ] Click "Clear Cart" - confirms, then removes all
- [ ] See "Cart Empty" message

### ✅ Test Saved Operations
- [ ] Save 5 products
- [ ] Go to /saved page
- [ ] All 5 appear in grid
- [ ] Click "Add to Cart" on one
- [ ] See toast: "Added to cart"
- [ ] Cart count increases
- [ ] Click heart to remove from saved
- [ ] Toast: "Removed from saved"
- [ ] Click "Clear All" - confirms, clears all
- [ ] See "No Saved Items" message

### ✅ Test Persistence
- [ ] Add 5 items to cart
- [ ] Save 3 items
- [ ] Note: Cart count = 5, Saved count = 3
- [ ] Refresh page (F5)
- [ ] Cart count still = 5
- [ ] Saved count still = 3
- [ ] Go to /cart - all 5 items there
- [ ] Go to /saved - all 3 items there
- [ ] Close browser completely
- [ ] Reopen browser and go to http://localhost:3000
- [ ] Cart count = 5, Saved count = 3
- [ ] Items still there

### ✅ Test Cross-Device (Same Browser)
- [ ] Open two tabs of same browser
- [ ] In Tab 1: Add item to cart
- [ ] In Tab 2: Cart count updates automatically? (Might need refresh)
- [ ] Both tabs should show same cart/saved

### ✅ Test Product Detail Page
- [ ] Click on a product to go to detail page
- [ ] Click "Add to Cart" button
- [ ] Toast: "Added to cart"
- [ ] Cart count increases
- [ ] Click "Save for Later"
- [ ] Heart turns red
- [ ] Toast: "Saved for later"
- [ ] Refresh page
- [ ] Heart still red (saved status persists)
- [ ] Go to /cart - item there
- [ ] Go back to product
- [ ] Heart still red

### ✅ Test Mobile Responsive
- [ ] Open DevTools (F12)
- [ ] Click mobile view icon
- [ ] Resize to iPhone X (375px)
- [ ] All buttons should be visible
- [ ] Add to cart works
- [ ] Save works
- [ ] Header icons visible with badge counts
- [ ] Cart and Saved pages should be readable
- [ ] Quantity controls should work

## API Testing (Optional - Using curl or Postman)

### Get a valid productId first
```bash
curl http://localhost:3001/api/products?limit=1
# Note the _id from response
```

### Add to Cart
```bash
curl -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-123" \
  -d '{"productId": "PRODUCT_ID_HERE", "quantity": 1}'
```

### Get Cart
```bash
curl http://localhost:3001/api/cart \
  -H "X-User-Id: test-user-123"
```

### Save for Later
```bash
curl -X POST http://localhost:3001/api/saved/add \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-123" \
  -d '{"productId": "PRODUCT_ID_HERE"}'
```

### Get Saved
```bash
curl http://localhost:3001/api/saved \
  -H "X-User-Id: test-user-123"
```

### Remove from Cart
```bash
curl -X DELETE http://localhost:3001/api/cart/PRODUCT_ID_HERE \
  -H "X-User-Id: test-user-123"
```

## Troubleshooting

### Cart is empty after refresh
- Check: Is MongoDB running?
- Check: Backend logs for errors
- Check: Browser console (F12) for API errors
- Check: Network tab - are requests going to correct URL?

### Toast not showing
- Check: Toast component is loaded
- Check: Browser console for errors
- Check: useToasts hook is being called

### Heart doesn't turn red
- Check: useSaved() hook is loading data
- Check: Component is receiving savedItems correctly
- Check: Browser console for errors

### API errors (500, 400)
- Check: ProductId format is valid MongoDB ObjectId
- Check: Backend is running on correct port
- Check: CORS is enabled
- Check: X-User-Id header is being sent

### Data not persisting
- Check: MONGODB_URI environment variable is set
- Check: MongoDB is running and accessible
- Check: No TTL index is deleting items prematurely
- Check: userId is consistent (should be in localStorage)

## Expected Behavior

### First Visit
1. userId generated and stored in localStorage
2. Cart is empty
3. Saved is empty

### After Adding Items
1. Cart count updates immediately
2. Saved count updates immediately  
3. Items appear in /cart and /saved pages
4. Data persists in MongoDB

### After Refresh
1. userId retrieved from localStorage
2. Cart/Saved data fetched from API
3. Counts and items appear

### After Close & Reopen
1. userId still in localStorage
2. Same data appears (stored in MongoDB)
3. No data loss

## Success = Real Amazon-Like Experience

- ✅ Add item → appears in cart
- ✅ Refresh page → item still there
- ✅ Close browser → item still there when reopening
- ✅ Click heart → item saved (turns red)
- ✅ Persist across devices on same browser
- ✅ No fake localStorage for cart data
- ✅ Real backend persistence
