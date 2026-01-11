# Production Setup Guide

Complete guide for deploying World of Books Discovery Platform to production.

## 📋 Prerequisites

- Docker and Docker Compose
- Domain name (optional but recommended)
- SSL certificate
- Production MongoDB Atlas cluster
- Production Redis instance (or use in-memory cache)
- Deployment server (AWS, DigitalOcean, Render, Railway, etc.)

## 🚀 Quick Production Deploy

### Option 1: Render.com (Recommended - Free Tier Available)

#### Backend Deployment

1. **Connect Repository**
   - Go to [render.com](https://render.com)
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**
   ```
   Name: world-of-books-api
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start
   ```

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/world_of_books
   REDIS_URL=redis://...
   CORS_ORIGIN=https://yourdomain.com
   API_PORT=3001
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on git push

#### Frontend Deployment (Vercel)

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as root

2. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```

3. **Deploy**
   - Vercel will automatically deploy

### Option 2: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Create stack file
docker stack deploy -c docker-compose.prod.yml world-of-books

# Check status
docker stack ps world-of-books
```

### Option 3: Kubernetes

```bash
# Create namespace
kubectl create namespace world-of-books

# Deploy backend
kubectl apply -f k8s/backend.yaml -n world-of-books

# Deploy frontend
kubectl apply -f k8s/frontend.yaml -n world-of-books

# Check status
kubectl get pods -n world-of-books
```

## 📦 MongoDB Atlas Setup

### Create Production Cluster

1. **Sign Up / Login**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create account if needed

2. **Create Cluster**
   - Click "Create Cluster"
   - Choose M5 or M10 tier for production
   - Select preferred region
   - Enable automated backups

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create strong username and password
   - Assign "Cluster Manager" role

4. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Copy connection string
   - Format: `mongodb+srv://user:password@cluster.mongodb.net/world_of_books`

5. **Configure IP Whitelist**
   - Go to "Network Access"
   - Add IP addresses of your servers
   - Or use 0.0.0.0/0 (not recommended)

### Database Indexes

```javascript
// Run these in MongoDB Atlas dashboard

// Products collection
db.products.createIndex({ source_id: 1 }, { unique: true })
db.products.createIndex({ source_url: 1 }, { unique: true })
db.products.createIndex({ title: "text", author: "text" })
db.products.createIndex({ last_scraped_at: 1 })
db.products.createIndex({ categories: 1 })

// Navigation collection
db.navigation.createIndex({ slug: 1 }, { unique: true })
db.navigation.createIndex({ last_scraped_at: 1 })

// Categories collection
db.categories.createIndex({ navigation_id: 1, slug: 1 }, { unique: true })
db.categories.createIndex({ navigation_id: 1 })
db.categories.createIndex({ parent_id: 1 })

// View history (with TTL)
db.view_histories.createIndex({ viewed_at: 1 }, { expireAfterSeconds: 2592000 })
```

## 🔄 Redis Setup (Production)

### Option 1: Redis Cloud

1. **Sign Up**
   - Go to [redis.com/cloud](https://redis.com/cloud)
   - Create account

2. **Create Database**
   - Click "Create Subscription"
   - Choose Free/Paid tier
   - Get connection URL

3. **Set Environment Variable**
   ```
   REDIS_URL=redis://user:password@host:port
   ```

### Option 2: AWS ElastiCache

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id world-of-books-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0
```

## 🔐 SSL/TLS Certificate

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates at:
# /etc/letsencrypt/live/yourdomain.com/
```

### Update Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # API proxy
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 🔔 Monitoring Setup

### Sentry (Error Tracking)

1. **Create Account**
   - Go to [sentry.io](https://sentry.io)
   - Create project

2. **Add to Backend**
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

3. **Initialize in main.ts**
   ```typescript
   import * as Sentry from "@sentry/node";

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### DataDog (APM & Logs)

```bash
npm install dd-trace

# Initialize
const tracer = require('dd-trace').init();
```

### CloudWatch (AWS Logs)

```bash
npm install aws-sdk winston-cloudwatch
```

## 📊 Performance Optimization

### Database Optimization

```javascript
// Create compound indexes
db.products.createIndex({ 
  categories: 1, 
  price: 1, 
  rating_avg: -1 
})

// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })

// Check slow queries
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

### Backend Optimization

```typescript
// Enable compression
import compression from 'compression';
app.use(compression());

// Connection pooling (Mongoose default)
// Configure in database.module.ts
{
  maxPoolSize: 10,
  minPoolSize: 5,
}

// Cache frequently accessed data
const navigation = await cache.get('navigation') || 
  await fetchNavigation();
```

### Frontend Optimization

```javascript
// Next.js production build
npm run build

// Image optimization
import Image from 'next/image';

// Code splitting (automatic)
// CSS minification (automatic)

// Monitor Lighthouse scores
npm run lighthouse
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Already Configured)

See `.github/workflows/` for automated:
- Testing on push
- Linting
- Building
- Deployment triggers

### Manual Deployment

```bash
# Build backend
cd backend
npm run build
docker build -t world-of-books-api:1.0.0 .

# Build frontend
cd frontend
npm run build
docker build -t world-of-books-web:1.0.0 .

# Push to registry
docker tag world-of-books-api:1.0.0 myregistry.com/world-of-books-api:1.0.0
docker push myregistry.com/world-of-books-api:1.0.0

# Deploy
docker service update world-of-books_backend --image myregistry.com/world-of-books-api:1.0.0
```

## 📈 Scaling Configuration

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
```

### Auto-scaling (Kubernetes)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🧪 Health Checks

### Backend Health Endpoint

```typescript
@Get('health')
health() {
  return {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    mongodb: // check connection,
    redis: // check connection,
  };
}
```

### Load Balancer Configuration

```nginx
upstream backend {
  least_conn;
  server backend1:3001 max_fails=3 fail_timeout=30s;
  server backend2:3001 max_fails=3 fail_timeout=30s;
  server backend3:3001 max_fails=3 fail_timeout=30s;
  
  keepalive 32;
}
```

## 🔐 Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS headers
- [ ] Validate all inputs
- [ ] Use parameterized queries
- [ ] Set rate limiting
- [ ] Hide error details in production
- [ ] Use environment variables for secrets
- [ ] Enable CSRF protection
- [ ] Set secure cookies
- [ ] Regular security audits
- [ ] DDoS protection (Cloudflare)
- [ ] WAF (Web Application Firewall)

## 📋 Production Environment Variables

```env
# Production .env
NODE_ENV=production
API_PORT=3001
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
HELMET_ENABLED=true
CACHE_TTL_SECONDS=3600
SENTRY_DSN=https://...
DATADOG_API_KEY=...
```

## 🚨 Rollback Procedure

```bash
# Get previous version
docker images | grep world-of-books-api

# Rollback to previous version
docker service update world-of-books_backend \
  --image world-of-books-api:0.9.0

# Verify
docker service ls
docker service ps world-of-books_backend
```

## 📞 Support & Monitoring

### Uptime Monitoring

- Use UptimeRobot or similar service
- Monitor endpoints:
  - `GET /api/navigation`
  - `GET /api/products`
  - Frontend URL

### Logs

```bash
# Docker logs
docker logs -f backend

# Kubernetes logs
kubectl logs -f deployment/backend -n world-of-books

# Stream logs
tail -f /var/log/world-of-books/backend.log
```

### Metrics

```bash
# CPU/Memory
docker stats

# Network
netstat -tuln | grep 3001

# Disk
df -h
```

## 🎓 Troubleshooting

### Backend won't start

```bash
# Check logs
docker logs backend

# Check MongoDB connection
mongosh mongodb+srv://user:pass@cluster.mongodb.net/world_of_books

# Check Redis connection
redis-cli -h host -p 6379 ping
```

### Slow API responses

```bash
# Check database indexes
db.products.getIndexes()

# Monitor queries
db.setProfilingLevel(1)
db.system.profile.find().limit(10).sort({ ts: -1 }).pretty()

# Restart services
docker service restart world-of-books_backend
```

### Frontend not loading

```bash
# Check build
npm run build

# Check environment variables
echo $NEXT_PUBLIC_API_URL

# Check connectivity
curl https://api.yourdomain.com/api/navigation
```

## ✅ Go-Live Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring set up
- [ ] SSL certificate installed
- [ ] DNS records updated
- [ ] CDN configured (optional)
- [ ] Email notifications enabled
- [ ] Analytics configured
- [ ] Load testing completed (>1000 RPS)
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team trained on operations
- [ ] Incident response plan ready

---

**Last Updated:** 2024-01-10  
**Status:** Production Ready
