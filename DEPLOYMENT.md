# Deployment Guide

This guide covers deploying the World of Books Discovery Platform to production.

## Architecture Diagram

```
Internet
   ↓
Vercel (Frontend)
   ↓
Render.com/Railway (Backend API)
   ↓
MongoDB Atlas (Database)
```

## Prerequisites

- GitHub repository
- Vercel account
- Render.com or Railway account
- MongoDB Atlas account
- Custom domain (optional)

## Step 1: Prepare MongoDB Atlas

### Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Choose cloud provider and region (e.g., AWS, us-east-1)
4. Select M2 or higher tier for production
5. Enable automated backups

### Create Database User

1. Go to Database Access
2. Click "Add New Database User"
3. Username: `your_username`
4. Password: Generate secure password
5. Database User Privileges: "Read and write to any database"

### Whitelist IP Addresses

1. Go to Network Access
2. Click "Add IP Address"
3. Add your office/home IPs or use "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Save

### Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<username>` and `<password>` with your database user credentials
5. Replace `<database>` with `world_of_books`

Example:
```
mongodb+srv://user:password@cluster0.abc123.mongodb.net/world_of_books?retryWrites=true&w=majority
```

## Step 2: Deploy Backend to Render.com

### Create Web Service

1. Go to [Render.com](https://render.com)
2. Sign in with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** `world-of-books-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** `Starter` (free) or `Standard` (paid)

### Set Environment Variables

Click "Advanced" and add:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/world_of_books?retryWrites=true&w=majority
MONGODB_DB_NAME=world_of_books
API_PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
PLAYWRIGHT_HEADLESS=true
SCRAPING_TIMEOUT=30000
SCRAPING_MAX_RETRIES=3
SCRAPING_RATE_LIMIT_MS=1000
CACHE_TTL_SECONDS=86400
```

### Deploy

Click "Create Web Service" and wait for deployment to complete.

Your backend will be available at: `https://world-of-books-backend-xxxxx.onrender.com`

## Step 3: Deploy Frontend to Vercel

### Connect Repository

1. Go to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select repository

### Configure Project

1. **Framework Preset:** Next.js
2. **Root Directory:** `./frontend`
3. **Build Command:** `npm run build`
4. **Start Command:** `npm start`

### Set Environment Variables

Add in "Environment Variables":

```
NEXT_PUBLIC_API_URL=https://world-of-books-backend-xxxxx.onrender.com
```

### Deploy

Click "Deploy" and wait for Vercel to build and deploy your frontend.

Your frontend will be available at: `https://your-vercel-domain.vercel.app`

## Step 4: Custom Domain Setup

### Frontend Custom Domain (Vercel)

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your custom domain (e.g., `books.example.com`)
4. Follow DNS configuration instructions
5. Add CNAME record to your DNS provider

### Backend Custom Domain (Render.com)

1. Go to Settings → Custom Domains
2. Click "Add Custom Domain"
3. Enter custom domain (e.g., `api.books.example.com`)
4. Add CNAME record to DNS

### Update CORS and API URLs

After adding custom domains, update environment variables:

**Backend (Render.com):**
- `FRONTEND_URL`: `https://books.example.com`
- `CORS_ORIGIN`: `https://books.example.com`

**Frontend (Vercel):**
- `NEXT_PUBLIC_API_URL`: `https://api.books.example.com`

Redeploy both services.

## Step 5: Monitoring & Logging

### Render.com Logs

```bash
# View real-time logs
# Go to Render dashboard → Service → Logs

# Or use CLI:
render logs world-of-books-backend
```

### Vercel Logs

```bash
# Go to Vercel dashboard → Deployments → View Logs
```

### MongoDB Atlas Monitoring

1. Go to MongoDB Atlas dashboard
2. Click "Monitoring" tab
3. View:
   - Operational metrics
   - Query performance
   - Replica set status
   - Backup history

### Error Tracking (Optional)

Add Sentry for error tracking:

```bash
# Install Sentry in backend
npm install @sentry/node

# Add Sentry to NestJS
# In main.ts:
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Step 6: Continuous Deployment

### GitHub Actions

The CI pipeline automatically:

1. Runs tests on pull requests
2. Builds and lints code
3. Creates Docker images

Push to `main` branch triggers automatic deployments:

**Frontend:** Redeploys on Vercel
**Backend:** Redeploys on Render.com

## Performance Optimization

### Frontend (Vercel)

- Static Generation: Use `getStaticProps` where possible
- Incremental Static Regeneration (ISR)
- Image optimization with Next/Image
- CDN edge caching

### Backend (Render.com)

- Database connection pooling
- Response compression (gzip)
- Caching headers

### Database (MongoDB Atlas)

```javascript
// Example: Add indexes
db.product.createIndex({ "source_url": 1 })
db.product.createIndex({ "last_scraped_at": 1 })
db.product.createIndex({ "title": "text", "author": "text" })
```

## Security Checklist

- [ ] MongoDB credentials in environment variables (not code)
- [ ] CORS origin set to production domain
- [ ] SSL/TLS enabled on custom domain
- [ ] Rate limiting configured
- [ ] Database backups enabled
- [ ] MongoDB IP whitelist configured
- [ ] Helmet.js security headers enabled
- [ ] No debug logs in production
- [ ] API authentication (optional)

## Rollback Procedure

### Render.com Rollback

1. Go to Service → Deployments
2. Click "Redeploy" on previous version

### Vercel Rollback

1. Go to Deployments
2. Click "Redeploy" on previous version

### Database Rollback

1. Go to MongoDB Atlas → Backup and Restore
2. Restore from timestamp

## Troubleshooting

### Backend Not Starting

```bash
# Check environment variables are set correctly
# View logs on Render dashboard
# Common issues:
# - MongoDB connection string invalid
# - Wrong password
# - IP not whitelisted
```

### Frontend Not Loading API Data

```bash
# Check NEXT_PUBLIC_API_URL matches backend URL
# Check CORS_ORIGIN on backend matches frontend URL
# Check browser console for errors
# Verify backend is running
```

### Database Connection Timeouts

```bash
# Check IP whitelist in MongoDB Atlas
# Verify connection string is correct
# Check network connectivity from backend
```

### High Latency from Web Scraper

```bash
# Increase timeout: SCRAPING_TIMEOUT=60000
# Reduce rate limit minimum: SCRAPING_RATE_LIMIT_MS=500
# Check World of Books server status
```

## Scaling Considerations

### When to upgrade:

1. **Render.com:** Standard plan ($7/month) when Starter limits reached
2. **MongoDB Atlas:** M5 or higher for production workloads
3. **Vercel:** Pro plan for priority support

### Load testing:

```bash
# Use k6 or Apache Bench
ab -n 1000 -c 10 https://api.books.example.com/api/navigation
```

## Cost Estimation

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | $20/month |
| Render.com | Standard | $7/month |
| MongoDB Atlas | M2 | $9/month |
| **Total** | | **~$36/month** |

*Prices as of 2024; verify with providers*

## Backup & Disaster Recovery

### Enable MongoDB Backups

1. Go to MongoDB Atlas
2. Click "Backup" tab
3. Enable "Backup & Restore"
4. Choose retention policy (30+ days recommended)

### Manual Backup

```bash
# Backup MongoDB locally
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/world_of_books"

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/world_of_books" dump/
```

### Code Backup

- GitHub automatically maintains full history
- Use GitHub Actions to backup to S3 (optional)

## Maintenance

### Weekly Tasks

- Check error logs
- Monitor database performance
- Verify scraper is running

### Monthly Tasks

- Review and clean old scrape jobs
- Analyze usage metrics
- Update dependencies

```bash
cd backend && npm update
cd frontend && npm update
```

## Contact & Support

- Render.com Support: https://support.render.com
- Vercel Support: https://vercel.com/support
- MongoDB Support: https://www.mongodb.com/support

---

Last updated: 2024
