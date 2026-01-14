# Quick Start: Testing the E-Commerce Features

## 🚀 1. Start the Services

### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```
✅ Backend running on `http://localhost:3001`
✅ API docs: `http://localhost:3001/api/docs`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on `http://localhost:3000`

---

## 🧪 2. Test Shopping Features

### Via Web UI

#### Test 1: Add to Cart
1. Go to `http://localhost:3000`
2. Click any product card
3. Scroll to see "Add to Cart" button
4. Click "Add to Cart"
5. ✅ Green toast: "Added to cart"
6. ✅ Cart icon badge shows "1"

#### Test 2: View Cart
1. Click 🛒 cart icon (top right)
2. Go to `/cart` page
3. ✅ See product with quantity controls
4. ✅ Order summary shows total

#### Test 3: Save for Later
1. Go back to home page
2. On any product card, click ❤️ heart button
3. ✅ Heart fills (red)
4. ✅ Toast: "Saved for later"
5. ✅ Saved icon badge shows count

#### Test 4: View Saved Items
1. Click ❤️ saved icon (top right)
2. Go to `/saved` page
3. ✅ See all saved products in grid

#### Test 5: WorldOfBooks Link
1. Go to product detail page
2. Scroll down to buttons
3. Click "Buy on World of Books"
4. ✅ Opens worldofbooks.com in new tab

---

## 🔌 3. Test via API (cURL)

### Get Cart
```bash
curl http://localhost:3001/api/cart \
  -H "Accept: application/json"
```

Response:
```json
{
  "items": [],
  "itemCount": 0,
  "total": 0
}
```

### Add to Cart
```bash
# First, get a product ID from http://localhost:3000
curl -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "YOUR_PRODUCT_ID",
    "quantity": 2
  }'
```

### Get Cart (with items)
```bash
curl http://localhost:3001/api/cart
```

### Update Quantity
```bash
curl -X POST http://localhost:3001/api/cart/YOUR_PRODUCT_ID/quantity \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

### Remove from Cart
```bash
curl -X DELETE http://localhost:3001/api/cart/YOUR_PRODUCT_ID
```

### Clear Cart
```bash
curl -X DELETE http://localhost:3001/api/cart
```

---

### Save for Later

### Save Product
```bash
curl -X POST http://localhost:3001/api/saved/add \
  -H "Content-Type: application/json" \
  -d '{"productId": "YOUR_PRODUCT_ID"}'
```

### Get Saved Items
```bash
curl http://localhost:3001/api/saved
```

### Check if Saved
```bash
curl http://localhost:3001/api/saved/YOUR_PRODUCT_ID/is-saved
```

### Remove from Saved
```bash
curl -X DELETE http://localhost:3001/api/saved/YOUR_PRODUCT_ID
```

### Clear All Saved
```bash
curl -X DELETE http://localhost:3001/api/saved
```

---

## 📊 4. Check Database

### MongoDB Connection
```bash
mongosh

# Show databases
show databases

# Use your database
use your-db-name

# Check collections
show collections

# View cart items
db.carts.find()

# View saved items
db.saveds.find()

# Count items
db.carts.countDocuments()
db.saveds.countDocuments()
```

---

## 🔍 5. Test User Sessions

### Test Session Persistence
1. Add product to cart
2. Open DevTools → Application → Cookies
3. Refresh page
4. ✅ Cart still shows item (from session)

### Test Multiple Tabs
1. Add to cart in Tab 1
2. Open same site in Tab 2
3. ✅ Both tabs show same cart count
4. (Real auth would make this per-user)

---

## 🐛 6. Debugging

### Check Browser Console
```javascript
// Open DevTools → Console
// Add to cart and watch logs
// Should see API calls
```

### Monitor Network Requests
```
DevTools → Network tab
- Filter by /api/cart
- See all cart operations
- Check response times
```

### Check Backend Logs
```
Terminal 1 output should show:
✓ POST /api/cart/add 200
✓ GET /api/cart 200
```

---

## ✨ 7. Test Features Matrix

| Feature | Test | Expected | Status |
|---------|------|----------|--------|
| Add to Cart | Click button | Toast + badge update | ✅ |
| View Cart | Click icon | See `/cart` page | ✅ |
| Update Qty | +/- buttons | Recalculates total | ✅ |
| Remove Item | Trash icon | Item disappears | ✅ |
| Clear Cart | Button | All items gone | ✅ |
| Save Product | Heart icon | Heart fills | ✅ |
| View Saved | Click icon | See `/saved` page | ✅ |
| WorldOfBooks | External link | Opens new tab | ✅ |
| Order Summary | In cart | Shows total | ✅ |
| Empty States | No items | See CTA | ✅ |

---

## 📝 8. Sample API Workflow

```bash
# 1. Start fresh
curl -X DELETE http://localhost:3001/api/cart

# 2. Get products (from frontend)
# Find a product ID from http://localhost:3000

# 3. Add product (ID: 65abc123...)
curl -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"productId": "65abc123...", "quantity": 1}'

# 4. View cart
curl http://localhost:3001/api/cart

# 5. Add another quantity
curl -X POST http://localhost:3001/api/cart/65abc123.../quantity \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'

# 6. View updated cart
curl http://localhost:3001/api/cart

# 7. Save for later
curl -X POST http://localhost:3001/api/saved/add \
  -H "Content-Type: application/json" \
  -d '{"productId": "65abc123..."}'

# 8. Check saved
curl http://localhost:3001/api/saved

# 9. Remove from cart
curl -X DELETE http://localhost:3001/api/cart/65abc123...

# 10. Final cart
curl http://localhost:3001/api/cart
```

---

## 🎯 Expected Results

### UI Flow
```
Home Page
  ↓
Click Product → See 3 buttons
  ↓
"Add to Cart" → ✅ Toast confirmation
  ↓
Cart badge updates (1)
  ↓
Click Cart icon → /cart page
  ↓
See item + total + buttons
  ↓
Adjust quantity OR click "Buy on World of Books"
  ↓
Done!
```

### API Flow
```
POST /api/cart/add
  ↓ (success)
200 OK { ...cartItem }
  ↓
GET /api/cart
  ↓
200 OK { items: [...], total: 29.99 }
```

---

## 🚨 Troubleshooting

### Issue: Toast not showing
**Solution**: Check that layout-client.tsx is wrapping children with ToastContainer

### Issue: Cart count not updating
**Solution**: Ensure useCart hook is calling mutate() after API calls

### Issue: Items not persisting
**Solution**: Check MongoDB is running and cart collection exists

### Issue: 404 on /api/cart
**Solution**: Ensure CartModule is imported in app.module.ts

### Issue: CORS error
**Solution**: Check CORS_ORIGIN in backend .env matches frontend URL

---

## 📚 API Response Examples

### GET /api/cart (200)
```json
{
  "items": [
    {
      "_id": "65abc...",
      "userId": "user-session-123",
      "productId": {
        "_id": "65product...",
        "title": "Harry Potter",
        "price": 29.99,
        "image_url": "..."
      },
      "quantity": 2
    }
  ],
  "itemCount": 1,
  "total": 59.98
}
```

### POST /api/cart/add (201)
```json
{
  "_id": "65abc...",
  "userId": "user-session-123",
  "productId": "65product...",
  "quantity": 2,
  "expiresAt": "2024-02-15T..."
}
```

### GET /api/saved (200)
```json
{
  "items": [
    {
      "_id": "65def...",
      "productId": {
        "_id": "65product2...",
        "title": "1984",
        "price": 15.99
      }
    }
  ],
  "count": 1
}
```

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors  
- [ ] Can view home page with products
- [ ] Can click "Add to Cart" on product card
- [ ] Toast notification appears
- [ ] Cart badge shows count
- [ ] Can navigate to /cart page
- [ ] Can see cart items with total
- [ ] Can adjust quantities
- [ ] Can remove items
- [ ] Can save items with heart button
- [ ] Can view /saved page
- [ ] Can see "Buy on World of Books" link
- [ ] External link opens in new tab
- [ ] Empty states show correctly
- [ ] API endpoints return correct responses
- [ ] MongoDB collections are created

---

## 🎉 You're Done!

The e-commerce system is fully functional. Next steps:
- Add payment processing (Stripe/PayPal)
- Implement real authentication
- Add order tracking
- Setup email notifications
- Add admin dashboard

Enjoy! 🎊
