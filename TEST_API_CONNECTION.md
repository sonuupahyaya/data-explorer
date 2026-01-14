# 🧪 Test API Connection

## Verify Everything is Working

### Step 1: Check Backend is Running
```bash
curl http://localhost:3001/api/products
```

Expected: JSON with `data` array containing books

### Step 2: Check Frontend can Reach Backend
Open browser DevTools (F12) → Console and paste:
```javascript
fetch('http://localhost:3001/api/products')
  .then(r => r.json())
  .then(d => console.log('✅ Connected!', d.data.length, 'books'))
  .catch(e => console.error('❌ Failed:', e.message))
```

Expected output: `✅ Connected! 50 books`

### Step 3: Check Frontend Page
Visit: **http://localhost:3000**

Expected: 
- ✅ Hero section visible
- ✅ Product cards appear (not skeletons)
- ✅ Books displayed with images
- ✅ "Featured Books" section shows 8 books

### Step 4: Check Network Requests
In DevTools → Network tab:
1. Look for `/api/products` request
2. Status should be **200**
3. Response should show JSON data

### Step 5: Check for Errors
In DevTools → Console:
- Should see no red errors
- May see some warnings (normal)
- Categories error is OK (no data seeded yet)

## Common Issues & Solutions

### Issue: Still Seeing Infinite Skeletons

**Solution 1:** Clear browser cache
```
DevTools → Settings → Clear site data → Clear
```

**Solution 2:** Restart frontend
```bash
cd frontend
npm run dev
```

**Solution 3:** Restart backend
```bash
cd backend
npm run start
```

### Issue: "Cannot reach localhost:3001"

**Check:** Is backend running?
```bash
# In backend terminal - should see:
✓ Backend running on port 3001
```

If not, start it:
```bash
cd backend
npm run start
```

### Issue: Books show but no images

**Expected behavior:** Images fail locally (no internet)
- SVG placeholder shows instead
- Production images work fine

### Issue: Getting CORS errors

**Check:** Backend has CORS enabled
- Already configured in image proxy controller
- Should work automatically

## Quick Verification Checklist

- [ ] Backend running on 3001
- [ ] `http://localhost:3001/api/products` returns JSON
- [ ] Frontend running on 3000
- [ ] `http://localhost:3000` shows books (not skeletons)
- [ ] DevTools Network shows 200 status
- [ ] DevTools Console shows no errors
- [ ] Product cards display with titles/authors
- [ ] Clicking product goes to detail page

## Expected vs Actual

### Expected
- Home page: Shows 8 featured books
- Each book: Card with image, title, author, price, rating
- Skeletons: Only while loading (< 1 second)
- Categories: Currently empty (no seed data)

### Actual (After Fix)
- Products loading from backend ✅
- Data flowing correctly ✅
- Cards rendering properly ✅
- Images showing (or SVG fallback) ✅

## Performance Check

### API Response Time
- `/api/products`: Should be <500ms
- No loading spinner after 2 seconds

### Frontend Load Time
- First contentful paint: <2 seconds
- Images loaded: <5 seconds

## Success Indicators

✅ **It's working when:**
1. Skeletons appear for <1 second
2. Real book data replaces skeletons
3. Cards show with actual content
4. Images appear (or placeholder)
5. Responsive layout works
6. No red console errors

❌ **Still broken if:**
1. Infinite skeletons
2. Empty cards
3. Red console errors
4. 404/500 network errors
5. CORS errors

## Debug Mode

To enable detailed logging, add to DevTools console:
```javascript
// Log all fetch calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🔗 Fetching:', args[0]);
  return originalFetch.apply(this, args)
    .then(r => {
      console.log('📥 Response:', r.status, args[0]);
      return r;
    })
    .catch(e => {
      console.error('❌ Error:', e.message, args[0]);
      throw e;
    });
};
```

## Next Steps If Everything Works

1. ✅ Browse home page - books visible
2. ✅ Click on product - details page works
3. ✅ Try searching - search works
4. ✅ Try categories - (empty for now, needs seeding)
5. ✅ Test mobile view - responsive works

## Contact

If still having issues:
1. Check logs in backend terminal
2. Check logs in browser console
3. Verify `.env.local` has correct URL
4. Try hard refresh (Ctrl+Shift+R)
5. Restart both servers

---

**Once verified: Your app is ready to use!** 🎉
