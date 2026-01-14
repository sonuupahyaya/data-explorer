# Deployment Guide - World of Books Discovery Platform

Complete guide to deploying the frontend and backend to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                       │
│              (Frontend React/Next.js App)               │
└──────────────────────────┬──────────────────────────────┘
                           │
                    (HTTPS/HTTP)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
    ┌───▼────────────────────────────┐   ┌──▼─────────────────────────┐
    │   Next.js Frontend (Vercel)    │   │  NestJS Backend (Railway)   │
    ├────────────────────────────────┤   ├─────────────────────────────┤
    │  - Pages & Components          │   │  - REST API                 │
    │  - SWR Data Fetching           │   │  - Puppeteer Scraper        │
    │  - localStorage Persistence    │   │  - MongoDB Connection       │
    └────────────┬────────────────────┘   └──┬──────────────────────────┘
                 │                           │
                 └───────────────┬───────────┘
                                │
                        ┌───────▼──────────┐
                        │   MongoDB Atlas  │
                        │   (Database)     │
                        └──────────────────┘
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Steps

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Production ready frontend"
   git push origin main
   ```

2. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub account

3. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

4. **Configure Environment Variables**
   - Go to Settings → Environment Variables
   - Add variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Visit your live URL (e.g., `https://world-of-books.vercel.app`)

#### Auto-Deploy on Push
- Every push to `main` automatically deploys
- Preview URLs for pull requests

#### Vercel URL Format
- Production: `https://your-project.vercel.app`
- Custom domain: Configure in Settings → Domains

### Option 2: Netlify

1. **Connect Repository**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Select GitHub repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Add Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add `NEXT_PUBLIC_API_URL`

4. **Deploy**
   - Automatic deployment on push

### Option 3: Self-Hosted (VPS)

1. **Setup Server**
   ```bash
   # Ubuntu/Debian
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs npm
   ```

2. **Clone Repository**
   ```bash
   git clone <your-repo> world-of-books
   cd world-of-books/frontend
   ```

3. **Install & Build**
   ```bash
   npm install
   npm run build
   ```

4. **Setup PM2**
   ```bash
   npm install -g pm2
   pm2 start npm --name "wob-frontend" -- start
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Setup HTTPS with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 4: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package*.json ./
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build Image**
   ```bash
   docker build -t world-of-books-frontend .
   ```

3. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_API_URL=https://api.example.com/api \
     world-of-books-frontend
   ```

## Backend Deployment

### Option 1: Railway (Recommended)

Railway makes deploying NestJS apps straightforward.

#### Steps

1. **Prepare Backend**
   ```bash
   cd backend
   git add .
   git commit -m "Production ready backend"
   ```

2. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

3. **Deploy Project**
   - Click "Create New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

4. **Configure Database**
   - Add MongoDB Atlas plugin
   - Or connect external MongoDB

5. **Set Environment Variables**
   - Add `MONGODB_URI`, `NODE_ENV`, etc.
   - Railway will auto-detect `PORT`

6. **Deploy**
   - Push to main branch
   - Railway automatically deploys

#### Get Backend URL
- Railway provides domain: `your-project.up.railway.app`
- Use this in frontend `NEXT_PUBLIC_API_URL`

### Option 2: Heroku

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Create App**
   ```bash
   heroku create your-app-name
   ```

3. **Add MongoDB Atlas**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=<your-mongodb-uri>
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: Self-Hosted (VPS)

1. **Setup Server**
   ```bash
   # Ubuntu/Debian
   curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs npm mongodb
   ```

2. **Clone Repository**
   ```bash
   git clone <your-repo> world-of-books
   cd world-of-books/backend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Build**
   ```bash
   npm run build
   ```

5. **Setup PM2**
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name "wob-backend"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx**
   ```nginx
   server {
       listen 80;
       server_name api.your-domain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Setup HTTPS**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.your-domain.com
   ```

## Database Deployment

### MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up free

2. **Create Cluster**
   - Click "Create Deployment"
   - Choose free tier (M0)
   - Select region

3. **Create Database User**
   - Go to Database Access
   - Add Username/Password
   - Remember credentials

4. **Whitelist IPs**
   - Go to Network Access
   - Add IP 0.0.0.0/0 (or specific IPs)

5. **Get Connection String**
   - Click "Connect"
   - Copy connection string
   - Replace `<password>` with your password
   - Use in backend as `MONGODB_URI`

### Self-Hosted MongoDB

```bash
# Ubuntu
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Test connection
mongo localhost:27017
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=World of Books Discovery
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/worldofbooks
FRONTEND_URL=https://your-frontend-domain.com
```

## SSL/TLS Certificate

Always use HTTPS in production.

### Let's Encrypt (Free)
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### Automatic Renewal
```bash
sudo certbot renew --dry-run
# Set up cron job for automatic renewal
```

## Performance Optimization

### Frontend
- **Vercel CDN**: Automatic with Vercel
- **Image Optimization**: Next.js handles automatically
- **Cache Headers**: Configure in `vercel.json`

### Backend
- **Database Indexing**: Create indexes on frequently queried fields
- **API Caching**: Implement Redis for hot data
- **Rate Limiting**: Implement request throttling

## Monitoring & Logging

### Frontend
- **Vercel Analytics**: Built-in with Vercel
- **Error Tracking**: Setup Sentry
  ```bash
  npm install @sentry/nextjs
  ```

### Backend
- **Winston Logger**: Already configured
- **PM2 Monitoring**: `pm2 monit`
- **MongoDB Monitoring**: Atlas dashboard

## Backup Strategy

### Database Backup
```bash
# Manual backup
mongodump --uri "mongodb+srv://..." --out ./backup

# Automated backups
# Use MongoDB Atlas automated backups (free tier)
```

### Code Backup
- GitHub handles code backup automatically
- Maintain stable branches

## Security Checklist

- [ ] HTTPS/TLS enabled on all domains
- [ ] Environment variables not committed to Git
- [ ] Database passwords strong (16+ chars)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on backend
- [ ] API authentication ready (for future)
- [ ] Backups automated and tested
- [ ] Monitoring and alerts configured
- [ ] Incident response plan documented

## Troubleshooting

### Frontend won't connect to API
```bash
# Check API URL in .env.local
echo $NEXT_PUBLIC_API_URL

# Test API connectivity
curl https://your-api-domain.com/api/navigation
```

### Backend crashes
```bash
# Check logs
pm2 logs

# Check MongoDB connection
mongo "$MONGODB_URI"

# Restart service
pm2 restart wob-backend
```

### High latency
- Check CDN configuration
- Monitor database query performance
- Review API response times in logs

## Scaling

### As traffic grows:

1. **Frontend**
   - Vercel handles auto-scaling

2. **Backend**
   - Implement horizontal scaling
   - Use load balancer (nginx, HAProxy)
   - Database replication

3. **Database**
   - MongoDB sharding
   - Read replicas

4. **Caching**
   - Redis for hot data
   - API response caching

## Cost Estimation (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Free | $0 |
| Railway | Hobby | $5 |
| MongoDB Atlas | Free | $0 |
| Custom Domain | - | $10 |
| **Total** | | **~$15** |

For high traffic:
- Vercel Pro: $20/month
- Railway Standard: $10-50/month
- MongoDB Premium: $57+/month

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **MongoDB Docs**: https://docs.mongodb.com
- **Next.js Docs**: https://nextjs.org/docs
- **NestJS Docs**: https://docs.nestjs.com

---

For questions or issues, create a GitHub issue or contact the development team.
