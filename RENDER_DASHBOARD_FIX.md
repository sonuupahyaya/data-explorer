# Render Dashboard Configuration - REQUIRED FIX

## Current Problem
Render is looking for `/opt/render/project/src/backend/dist/main.js` instead of `/opt/render/project/backend/dist/main.js`

This means your Render service has the wrong **Root Directory** setting.

## FIX: Update Render Dashboard Settings

### Step-by-Step Instructions

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in with your account

2. **Select Your Backend Service**
   - Look for: `world-of-books-api` (or whatever you named it)
   - Click on it

3. **Navigate to Settings**
   - Click "Settings" tab on the left

4. **Find and Fix Root Directory**
   - Look for field: "Root Directory"
   - **Current value**: Probably `src/backend` or blank (misconfigured)
   - **Change to**: `backend` (just the folder name)
   - Click "Save"

5. **Redeploy**
   - Find the "Deploys" section
   - Click "Clear build cache and redeploy"
   - Wait for deployment to complete

6. **Verify**
   - Check logs for success:
     ```
     ✓ MongoDB connected to bookvault
     ✓ Backend running on port 3001
     ```
   - Test the API:
     ```bash
     curl https://your-render-url/api/products/all
     ```

## What the Settings Should Look Like

### After Fix
```
Name: world-of-books-api
Root Directory: backend
Build Command: npm install && npm run build
Start Command: node dist/main.js
Environment: 
  NODE_ENV: production
  MONGO_URI: mongodb+srv://...
  API_PORT: 3001
```

### NOT Like This (Wrong)
```
Name: world-of-books-api
Root Directory: src/backend  ❌ WRONG
Build Command: npm install && npm run build
Start Command: node dist/main.js
```

## Why This Matters
- **Root Directory** tells Render where your service code is
- All commands run relative to this directory
- If it's `src/backend`, Render looks for `/opt/render/project/src/backend/dist/`
- If it's `backend`, Render looks for `/opt/render/project/backend/dist/`
- Our code is in the `backend` folder, not `src/backend`

## Alternative: Use start.sh Script

If you can't access the Render dashboard right now:

Update package.json start command:
```json
"start": "bash start.sh"
```

A `start.sh` script has been created that will find main.js automatically.

## Screenshots (If Needed)

### Step 1: Dashboard
- Top left: Click your service name
- You should see project info

### Step 2: Settings Tab
- Look for the gear icon or "Settings" text
- In the sidebar on the left

### Step 3: Root Directory Field
- Should be near the top of settings
- Usually labeled "Root Directory" or "Service Root"
- This field determines where Render runs commands

## After Fixing

Your logs should show:
```
==> Cloning from https://github.com/...
==> Using Node.js version 22.22.0
==> Running build command 'npm install && npm run build'...
> world-of-books-backend@1.0.0 build
> nest build
==> Build successful 🎉
==> Running 'node dist/main.js'
✓ MongoDB connected to bookvault
✓ Backend running on port 3001
```

## Need More Help?

Check Render's documentation:
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/infrastructure

Or look at the "Deploy Log" in your Render dashboard for more details.

## Once Working

You'll get a Render URL like:
```
https://world-of-books-api.onrender.com
```

Use this in your frontend:
```
NEXT_PUBLIC_API_URL=https://world-of-books-api.onrender.com/api
```
