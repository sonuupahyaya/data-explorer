# Render Deployment - Path Configuration Fix

## Issue
Build succeeds but startup fails:
```
Error: Cannot find module '/opt/render/project/src/backend/dist/main.js'
```

## Root Cause
Render is looking for the dist folder in the wrong location. It's looking in `/src/backend/dist/` when it should look in `/backend/dist/`.

## Solution: Update Render Configuration

### Option 1: Via Render Dashboard (Quick)
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Settings"
4. Find "Root Directory" field
5. Change from blank or `/src/backend` to: `backend`
6. Save and redeploy

### Option 2: Via render.yaml (Recommended)
A `render.yaml` file has been created in the project root that specifies:
```yaml
services:
  - type: web
    name: world-of-books-api
    rootDir: backend
    buildCommand: npm run build
    startCommand: node dist/main.js
```

Render will automatically use this configuration.

## Configuration Details

### Root Directory
- **Should be**: `backend`
- **NOT**: blank
- **NOT**: `/src/backend`
- **NOT**: `src/backend`

### Build Command
```
npm run build
```
This runs from the backend directory and outputs to `backend/dist/`

### Start Command
```
node dist/main.js
```
When rootDir is set to `backend`, this becomes `/backend/dist/main.js`

## Verification
After making changes:
1. Redeploy the service
2. Check logs for success message:
   ```
   ✓ MongoDB connected to bookvault
   ✓ Backend running on port 3001
   ✓ API docs available at http://localhost:3001/api/docs
   ```
3. Test API:
   ```bash
   curl https://<your-render-url>/api/products/all
   ```

## Why This Happens
- Render looks for package.json in the root directory you specify
- It runs build/start commands from that directory
- Relative paths in build/start commands are relative to the root directory
- If root directory is wrong, it can't find the compiled files

## After Deployment
Once fixed and redeployed:
1. Get your Render URL (e.g., `https://world-of-books-api.onrender.com`)
2. Update frontend `.env` with:
   ```
   NEXT_PUBLIC_API_URL=https://world-of-books-api.onrender.com/api
   ```
3. Redeploy frontend to Vercel
4. Test that frontend can reach backend

## Files Modified
- `render.yaml` - Created with proper configuration
- No code changes needed

## Next Steps
1. Update Render dashboard OR
2. Commit render.yaml and redeploy
3. Monitor deployment logs
4. Test API endpoint
