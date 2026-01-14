# 🧪 TEST BUTTONS IMMEDIATELY

## What To Do

### Step 1: Backend is Running?
Check terminal where backend runs. You should see:
```
✓ Backend running on port 3001
```

### Step 2: Frontend Running?
Open new terminal:
```bash
cd frontend
npm run dev
```

Should show:
```
ready - started server on 0.0.0.0:3000
```

### Step 3: Visit Site
```
http://localhost:3000
```

### Step 4: Open DevTools
**F12** → **Network** tab

### Step 5: Click Add to Cart

Click **"Add to Cart"** button on any product

**Expected in Network tab:**
- Request to `http://localhost:3001/api/cart/add` appears
- Method: **POST**
- Status: **201** (Created)

**Expected in Backend Terminal:**
```
[CART] ➕ ADD TO CART - userId: user_..., productId: 507f..., quantity: 1
[CART] ✅ ITEM ADDED - 507f...
```

### Step 6: Click Save

Click **❤️** (heart) button on any product

**Expected in Network tab:**
- Request to `http://localhost:3001/api/saved/add` appears
- Method: **POST**
- Status: **201** (Created)

**Expected in Backend Terminal:**
```
[FAVORITES] ❤️ SAVE FOR LATER - userId: user_..., productId: 507f...
[FAVORITES] ✅ ITEM SAVED - 507f...
```

---

## If You DON'T See Network Requests

This means **frontend is not wired**. Run this in Browser Console (F12):

```javascript
// Check 1: API configured?
console.log('API:', process.env.NEXT_PUBLIC_API_URL);

// Should show: http://localhost:3001/api

// Check 2: Manual test
fetch('http://localhost:3001/api/cart', {
  headers: { 'X-User-Id': 'test-user' },
  credentials: 'include'
})
.then(r => console.log('Response:', r.status))
.catch(e => console.log('Error:', e.message));
```

**If this works** (status 200) → API is fine, problem is button handler

**If this fails** → Check:
1. Is backend running on port 3001?
2. Is frontend .env.local correct?

---

## If Backend Logs Don't Show [CART] or [FAVORITES]

This means the request never reached the backend.

**Causes:**
1. Frontend not calling API
2. CORS blocking request
3. Button click handler broken

**Fix:**
1. Check Network tab for errors
2. Look for red text in Browser Console
3. Restart both services

---

## Report When Done

Tell me:
1. ✅ Do you see [CART] logs when clicking Add to Cart?
2. ✅ Do you see [FAVORITES] logs when clicking Save?
3. ✅ Do items appear in /cart page?
4. ✅ Do items appear in /favorites page?
5. ✅ Do items persist after F5 refresh?

If yes to all 5 → **System is working!** ✅

If no to any → Paste the specific error/issue.
