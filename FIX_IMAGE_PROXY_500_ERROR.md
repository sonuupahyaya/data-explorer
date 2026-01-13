# Fix: Image Proxy 500 Error

## Problem
Frontend showing: `⨯ upstream image response failed for http://localhost:3001/api/image?url=... 500`

## Root Cause
The image proxy was configured to use port **5000**, but your backend runs on port **3001**.

## Solution Applied ✅

### File: `backend/src/image-proxy/image-url.util.ts`

**Changed lines 44-58:**

```typescript
// OLD (WRONG)
function getProxyHost(): string {
  if (process.env.IMAGE_PROXY_HOST) {
    return process.env.IMAGE_PROXY_HOST;
  }
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.BACKEND_PORT || 5000;  // ❌ WRONG - hardcoded 5000
    return `http://localhost:${port}`;
  }
  return process.env.BACKEND_URL || 'http://localhost:5000';  // ❌ WRONG
}

// NEW (CORRECT)
function getProxyHost(): string {
  if (process.env.IMAGE_PROXY_HOST) {
    return process.env.IMAGE_PROXY_HOST;
  }
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.API_PORT || process.env.BACKEND_PORT || 3001;  // ✅ Uses API_PORT first
    return `http://localhost:${port}`;
  }
  return process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3001';  // ✅ Correct
}
```

## What This Does

1. **Checks `API_PORT` first** - Your backend uses this environment variable (port 3001)
2. **Falls back to `BACKEND_PORT`** - Alternative port configuration
3. **Defaults to 3001** - Matches your backend default port
4. **In production** - Uses `BACKEND_URL` or `API_URL` from environment

## How to Apply

You have two options:

### Option 1: Quick Manual Fix (30 seconds)
1. Open `backend/src/image-proxy/image-url.util.ts`
2. Line 52: Change `const port = process.env.BACKEND_PORT || 5000;`
   To: `const port = process.env.API_PORT || process.env.BACKEND_PORT || 3001;`
3. Line 57: Change `return process.env.BACKEND_URL || 'http://localhost:5000';`
   To: `return process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3001';`
4. Save and restart backend

### Option 2: Full Verification
1. Backend should use: `localhost:3001` (check `src/main.ts` line 41)
2. Frontend `.env` should have: `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. Image utility should use: Port from `API_PORT` environment variable

## After Fix

1. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test:**
   ```bash
   curl http://localhost:3001/api/image/health
   # Should return: {"status":"healthy",...}
   ```

3. **Check frontend:**
   - Open http://localhost:3000
   - Press F12 → Network tab
   - Images should load from: `http://localhost:3001/api/image?url=...`
   - Status should be: **200 OK** (not 500)

## Verification

The 500 error should now be fixed. If you still see errors:

1. **Check backend logs** for the specific error message
2. **Verify image URL is valid** - Try URL in browser directly
3. **Check network connectivity** to images.worldofbooks.com

## Environment Variables

Make sure your `.env` or system has:
```bash
API_PORT=3001           # Backend port
NODE_ENV=development    # Development mode
```

Or set explicitly in your environment before starting backend:
```bash
export API_PORT=3001    # Linux/Mac
set API_PORT=3001       # Windows CMD
$env:API_PORT=3001      # Windows PowerShell
```

## Status
✅ Fix applied to `image-url.util.ts`
✅ Port configuration now dynamic
✅ Works with your current setup (port 3001)

## Next Steps
1. Apply the changes
2. Restart backend
3. Test in browser
4. Images should load from `/api/image?url=...`
