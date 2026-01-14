# 🔍 Diagnostic Guide - Cart & Favorites Not Working

## Step 1: Check Frontend Environment

**In browser, open DevTools Console (F12) and run:**

```javascript
// Check if API client is configured
console.log('API_BASE:', process.env.NEXT_PUBLIC_API_URL)

// Check if userId is being set
console.log('userId:', localStorage.getItem('userId'))

// Check if hooks are available
console.log('Check if useCart and useSaved are imported')
```

**Expected output:**
```
API_BASE: http://localhost:3001/api
userId: user_1234567890_...
```

---

## Step 2: Check Network Traffic

1. Open DevTools → Network tab
2. Click "Add to Cart" button
3. Look for request to `api/cart/add`

**Expected:**
- ✅ Request appears in Network tab
- ✅ Method: POST
- ✅ URL: http://localhost:3001/api/cart/add
- ✅ Status: 201 or 200
- ✅ Response shows cart item

**If missing:**
- ❌ No request appears → Button not calling API
- ❌ 404 error → API endpoint missing
- ❌ 500 error → Backend error
- ❌ CORS error → CORS not configured

---

## Step 3: Check Console Errors

Look at the Console tab (F12) for any red errors:

**Common issues:**

### Error: "Cannot read property 'addItem' of undefined"
→ useCart hook not loading data
→ Check: Is useCart being called?
→ Check: Is SWR working?

### Error: "Network error" or "Failed to fetch"
→ API not responding
→ Check: Is backend running on port 3001?
→ Check: Is NEXT_PUBLIC_API_URL correct?

### Error: "CORS error"
→ Backend CORS not configured
→ Check: backend/src/main.ts has cors({ credentials: true })

### Error: "localStorage is not defined"
→ Running on server-side
→ Check: typeof window === 'undefined'

---

## Step 4: Test API Directly

**In browser Console, test API call:**

```javascript
// Get userId
const userId = localStorage.getItem('userId');

// Test cart API directly
fetch('http://localhost:3001/api/cart/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': userId
  },
  credentials: 'include',
  body: JSON.stringify({
    productId: '507f1f77bcf86cd799439011',  // Valid MongoDB ID
    quantity: 1
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e))
```

**Expected response:**
```json
{
  "_id": "...",
  "userId": "user_...",
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 1,
  "createdAt": "..."
}
```

**If error appears in backend logs**, check the error message for clues.

---

## Step 5: Check Backend Logs

Look at backend terminal output while clicking "Add to Cart":

**Expected logs:**
```
[Nest] 9508 - 14/01/2026, 1:17:51 pm LOG [CartController] Adding item to cart
[Nest] 9508 - 14/01/2026, 1:17:51 pm LOG [CartService] ✅ Item added to cart
```

**If no logs appear:**
→ Request never reached backend
→ Check NEXT_PUBLIC_API_URL
→ Check if button is calling API

**If error logs appear:**
→ API is being called but failing
→ Read error message carefully
→ Check MongoDB connection
→ Check request body format

---

## Step 6: Verify Components Are Wired

Check that ProductCard is using the hooks:

**In browser Console:**
```javascript
// Check if ProductCard renders
document.querySelectorAll('[class*="ProductCard"]').length

// Check if button exists
document.querySelectorAll('button').forEach(b => {
  if (b.textContent.includes('Add to Cart')) {
    console.log('Found "Add to Cart" button:', b)
  }
})
```

**Expected:**
- ProductCard component renders
- "Add to Cart" button exists
- Button is clickable

---

## Step 7: Check SWR Cache

**In browser Console:**
```javascript
// Check if SWR cache has cart data
const cache = new Map()
// (Note: SWR cache is internal, hard to access)
// Better: Check in React DevTools
```

**Use React DevTools extension (if installed):**
1. Open DevTools → Components tab
2. Find `useCart` hook
3. Check if it has: items, isLoading, error, mutate

---

## Full Checklist

- [ ] `NEXT_PUBLIC_API_URL` is set to `http://localhost:3001/api`
- [ ] Backend is running on port 3001
- [ ] No CORS errors in browser console
- [ ] userId is generated and stored in localStorage
- [ ] "Add to Cart" button exists on product cards
- [ ] Clicking button makes POST request to `/api/cart/add`
- [ ] Backend logs show the request
- [ ] Response is 201 Created
- [ ] Toast notification appears
- [ ] Cart page shows items
- [ ] Items persist after refresh

---

## If Something's Wrong

### Scenario 1: Button click does nothing

**Possible causes:**
1. useCart hook returning error
2. addItem function throwing exception
3. Event handler not attached

**Fix:**
```javascript
// In browser console
try {
  const btn = document.querySelector('button');
  btn.click();  // Manually trigger click
} catch(e) {
  console.error('Click error:', e);
}
```

### Scenario 2: Button makes request but gets 404

**Possible causes:**
1. API endpoint doesn't exist
2. Wrong URL in NEXT_PUBLIC_API_URL
3. Backend route not registered

**Fix:**
```bash
# Check backend logs
# Look for: "CartController" or "cart.controller.ts"
# If not found, endpoint not loaded
```

### Scenario 3: Button makes request but gets 500

**Possible causes:**
1. MongoDB not running
2. Invalid product ID format
3. Service throwing error

**Fix:**
```bash
# Check backend logs for error message
# Verify MongoDB is running
# Verify MONGODB_URI is correct
```

### Scenario 4: Request succeeds but UI doesn't update

**Possible causes:**
1. mutate() not being called
2. SWR cache not invalidating
3. Component not re-rendering

**Fix:**
```javascript
// In ProductCard, ensure:
// const result = await addItem(productId, 1);
// Then call: mutate()  // in useCart hook
```

---

## Quick Debug Command

**Run this in browser Console:**

```javascript
// 1. Check environment
console.log('=== ENVIRONMENT ===');
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Node Env:', process.env.NODE_ENV);

// 2. Check userId
console.log('\n=== USER ID ===');
const userId = localStorage.getItem('userId');
console.log('userId:', userId);

// 3. Test API call
console.log('\n=== API TEST ===');
const testCall = async () => {
  try {
    const res = await fetch('http://localhost:3001/api/cart', {
      method: 'GET',
      headers: { 'X-User-Id': userId },
      credentials: 'include'
    });
    const data = await res.json();
    console.log('GET /api/cart:', data);
  } catch(e) {
    console.error('Error:', e.message);
  }
};
testCall();
```

---

## Report Format

When asking for help, provide:

1. **Browser Console** - Copy-paste any errors
2. **Network Tab** - Screenshot of request/response
3. **Backend Logs** - Copy relevant log lines
4. **Current State** - What happens when you click the button?

Example:
```
Clicking "Add to Cart":
- [ ] Toast appears: Yes/No/Unknown
- [ ] Network request made: Yes/No/Unknown  
- [ ] Backend logs show call: Yes/No/Unknown
- [ ] Error in console: [error message here]
- [ ] Product added to cart: Yes/No/Unknown
- [ ] Persist after refresh: Yes/No/Unknown
```

---

## Next Steps

1. **Check Step 1-4 above**
2. **Look for errors/failures**
3. **Run diagnostic commands**
4. **Report what you find**

Then I can fix the specific issue.
