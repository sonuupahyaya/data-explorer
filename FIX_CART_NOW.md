# 🔧 FIX Cart & Favorites - Step by Step

## The Problem

Clicking "Add to Cart" or "❤️ Save" does nothing, and backend logs show no API calls being made.

**Root Cause**: The frontend buttons are NOT calling the APIs.

---

## Diagnosis (5 minutes)

### Step 1: Open Browser DevTools

1. Visit http://localhost:3000
2. Press **F12** (or right-click → Inspect)
3. Click the **Console** tab

### Step 2: Run Debug Script

Copy-paste this into the Console and press Enter:

```javascript
// PASTE THIS ENTIRE BLOCK INTO CONSOLE (F12)

console.log('='.repeat(60));
console.log('CART & FAVORITES SYSTEM DEBUG');
console.log('='.repeat(60));

// Check environment
const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const userId = localStorage.getItem('userId');

console.log('\n1️⃣  ENVIRONMENT');
console.log('   API:', apiBase);
console.log('   userId:', userId || 'NOT SET');

// Test cart endpoint
console.log('\n2️⃣  TESTING CART API');
fetch(apiBase + '/cart', {
  headers: { 'X-User-Id': userId || 'test' },
  credentials: 'include'
})
.then(r => {
  console.log(`   Status: ${r.status}`);
  return r.json();
})
.then(d => console.log('   Data:', d))
.catch(e => console.log('   ERROR:', e.message));
```

### Step 3: Check Results

**Look for output like:**

```
API: http://localhost:3001/api
userId: user_1234567890_abc123
Status: 200
Data: { items: [], itemCount: 0, total: 0 }
```

If you see this → **API is working!** Problem is elsewhere.

If you see an error → **API is not responding**. Check backend.

---

## If API is Responding

The problem is that **the button onClick handler is not being called correctly**.

### Fix: Check ProductCard Component

Open: `frontend/src/components/ProductCard.tsx`

Make sure it looks like this:

```typescript
// At the top
import { useCart, useSaved } from '@/hooks';

// In component
const handleAddToCart = async (e: React.MouseEvent) => {
  e.preventDefault();
  try {
    const result = await addItem(productId, 1);
    if (result.success) {
      success('Added to cart');
    }
  } catch (err) {
    toastError('Failed to add to cart');
  }
};

// The button
<button
  onClick={handleAddToCart}
  disabled={cartLoading}
  className="..."
>
  Add to Cart
</button>
```

**Check:**
- [ ] `handleAddToCart` function exists
- [ ] Button has `onClick={handleAddToCart}`
- [ ] `addItem` is from `useCart()` hook
- [ ] No syntax errors in file

---

## If API is NOT Responding

### Check 1: Is Backend Running?

Look at backend terminal:

```
[Nest] 9508 - LOG Backend running on port 3001
```

If you don't see this, **start the backend**:

```bash
cd backend
npm run start:dev
```

### Check 2: Is MongoDB Running?

Backend needs MongoDB. Check:

```bash
# Windows
# Is MongoDB service running? Check Services app
```

Or MongoDB Atlas:
```
Check: backend/.env has MONGODB_URI=mongodb+srv://...
```

### Check 3: Is Frontend Using Correct API URL?

Check frontend env:

```bash
# frontend/.env.local should have:
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

If missing, create it:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > frontend/.env.local
```

Then **restart frontend**:

```bash
# Stop current: Ctrl+C
cd frontend
npm run dev
```

### Check 4: CORS Issue?

Check backend logs for CORS errors.

If present, verify `backend/src/main.ts` has:

```typescript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
```

---

## Full Diagnostic Checklist

Run through this systematically:

### ✅ Step 1: Backend Status
- [ ] Backend running on port 3001
- [ ] Command: `cd backend && npm run start:dev`
- [ ] Should see: `✓ Backend running on port 3001`

### ✅ Step 2: MongoDB Status
- [ ] MongoDB running or accessible
- [ ] Check: `backend/.env` has `MONGODB_URI`
- [ ] Backend logs should NOT show MongoDB errors

### ✅ Step 3: Frontend Environment
- [ ] `frontend/.env.local` exists
- [ ] Contains: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- [ ] Frontend restarted after creating env file

### ✅ Step 4: API Connectivity
- [ ] Open http://localhost:3000
- [ ] Press F12 → Console
- [ ] Run test script above
- [ ] Should see: `Status: 200` for `/api/cart`

### ✅ Step 5: Button Click
- [ ] Click "Add to Cart" button
- [ ] Should see in Console: No errors
- [ ] Or see toast: "Added to cart"
- [ ] Or see in Network tab: `POST /api/cart/add` with status 201

### ✅ Step 6: Persistence
- [ ] Cart icon header should show count: 1
- [ ] Press F5 (refresh)
- [ ] Count should still be: 1
- [ ] Item in `/cart` page

---

## If Still Not Working

**Collect this info and report:**

1. **Backend console output**
   ```
   Copy-paste the last 20 lines from backend terminal
   ```

2. **Browser Network tab**
   - Click "Add to Cart"
   - Screenshot the Network tab
   - Look for request to `/api/cart/add`

3. **Browser Console errors**
   - Press F12
   - Look for RED errors
   - Copy-paste them

4. **Environment verification**
   - Backend: What's in `backend/.env`?
   - Frontend: What's in `frontend/.env.local`?

---

## Expected Behavior

### When system is working:

```
1. User clicks "Add to Cart"
   ↓
2. Network tab shows: POST /api/cart/add (Status 201)
   ↓
3. Toast appears: "Added to cart"
   ↓
4. Header shows: Cart count 0 → 1
   ↓
5. Go to /cart
   ↓
6. Item appears in cart
   ↓
7. Refresh page (F5)
   ↓
8. Item still in cart ✓ WORKING
```

---

## Quick Fixes (Try These First)

### Fix 1: Restart Everything

```bash
# Terminal 1: Kill backend (Ctrl+C)
cd backend
npm run start:dev

# Terminal 2: Kill frontend (Ctrl+C)
cd frontend
npm run dev
```

### Fix 2: Clear Cache

```bash
# In browser
# Ctrl+Shift+Delete → Clear browsing data
# Restart browser
```

### Fix 3: Check Environment Variable

```bash
# Create .env.local if missing
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
npm run dev
```

### Fix 4: Check MongoDB

```bash
# Verify connection
# Backend logs should NOT have: "MongoDB connection error"
# If error, check: MONGODB_URI in backend/.env
```

---

## Verify Each Component

### Component 1: ProductCard Button

Click button in browser and check:

```
DevTools → Elements tab
Look for: <button>Add to Cart</button>
```

Should exist. If not → Button not rendering.

### Component 2: useCart Hook

In DevTools Console:

```javascript
// Check if hook is defined
console.log(typeof useCart)  // Should be 'function'
```

### Component 3: API Client

In DevTools Console:

```javascript
// Check if API is configured
const apiBase = process.env.NEXT_PUBLIC_API_URL;
console.log('API:', apiBase);  // Should be http://localhost:3001/api
```

### Component 4: Network Request

In DevTools Network tab:

1. Click "Add to Cart"
2. Look for request matching: `/api/cart/add`
3. Check:
   - Method: POST ✓
   - Status: 201 ✓
   - Headers include: X-User-Id ✓

---

## Success Indicators

✅ System working when you see:
- Toast: "Added to cart" appears
- Network: POST request to `/api/cart/add` returns 201
- Backend logs: Show cart operation
- Header: Cart count increases
- Refresh: Item persists

---

## Next: Run These Commands

### In Terminal (Backend Directory)

```bash
cd backend
npm run start:dev
```

Watch for: `✓ Backend running on port 3001`

### In Terminal 2 (Frontend Directory)

```bash
cd frontend
npm run dev
```

Watch for: `ready - started server on 0.0.0.0:3000`

### In Browser

```
http://localhost:3000
Press F12 (DevTools)
Click "Add to Cart"
Check: Network tab and Console
```

---

## You've Got This! 

Follow the steps above and the system will start working.

Report back with:
1. What you see in Network tab when clicking "Add to Cart"
2. Any error messages in DevTools Console
3. What the backend logs show

Then I can pinpoint the exact issue and fix it.
