# Image Proxy - Quick Reference & Commands

## Start Services

### Development Mode

**Terminal 1 - Backend API**
```bash
cd backend
npm run start:dev
# API running on http://localhost:3001
# Image proxy available at http://localhost:3001/api/image?url=...
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

**Terminal 3 - Monitor (Optional)**
```bash
# Watch backend logs
cd backend && npm run start:dev | grep -E "(image|cache|proxy)"

# Or watch image proxy stats
watch -n 2 'curl -s http://localhost:3001/api/image/stats | jq .'
```

---

## Quick Test Commands

### Health Check
```bash
curl http://localhost:3001/api/image/health
```

### Test Image Download
```bash
# Public test image
curl -v "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"

# Better with jq
curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > test-image.jpg
file test-image.jpg
ls -lh test-image.jpg
```

### Check Cache
```bash
curl http://localhost:3001/api/image/stats | jq .

# Pretty format
curl -s http://localhost:3001/api/image/stats | jq '{
  cached_images: .cached_images,
  cache_hits: .cache_hits,
  cache_misses: .cache_misses,
  hit_ratio: (.cache_hits / (.cache_hits + .cache_misses))
}'
```

### Clear Cache
```bash
curl http://localhost:3001/api/image/cache/clear
```

### Test Product API Integration
```bash
# Get products with proxied images
curl "http://localhost:3001/api/products?page=1&limit=2" | jq '.data[0].image_url'

# Should show: "http://localhost:3001/api/image?url=..."
```

---

## JavaScript/Node.js Examples

### Using Image Proxy in Frontend

```javascript
// React Component
import Image from 'next/image';

function BookCard({ book }) {
  return (
    <Image
      src={book.image_url}  // Already proxied by backend!
      alt={book.title}
      width={300}
      height={400}
    />
  );
}
```

### Manual URL Encoding

```javascript
const originalUrl = 'https://cdn.worldofbooks.com/images/book123.jpg';
const proxiedUrl = `http://localhost:3001/api/image?url=${encodeURIComponent(originalUrl)}`;

// Use in fetch
fetch(proxiedUrl)
  .then(r => r.arrayBuffer())
  .then(buffer => /* process image */);
```

### Fetching from Products API

```javascript
// Get products with proxied images
async function getBooks() {
  const response = await fetch('http://localhost:3001/api/products?page=1&limit=10');
  const { data } = await response.json();
  
  // data[0].image_url is already proxied!
  return data;
}
```

---

## Bash Scripts

### Simple Test Script

```bash
#!/bin/bash
# test-proxy.sh

echo "🧪 Testing Image Proxy"

# Health check
echo "1. Health check..."
curl -s http://localhost:3001/api/image/health | jq .status

# Download image
echo "2. Downloading image..."
curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > /tmp/test.jpg
echo "✅ Downloaded: $(ls -lh /tmp/test.jpg | awk '{print $5}')"

# Cache stats
echo "3. Cache stats..."
curl -s http://localhost:3001/api/image/stats | jq '{cached: .cached_images, hits: .cache_hits}'

# Same image again
echo "4. Testing cache..."
curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > /tmp/test2.jpg

echo "5. Final stats..."
curl -s http://localhost:3001/api/image/stats | jq '{cached: .cached_images, hits: .cache_hits}'

echo "✅ Done!"
```

### Monitor Cache Growth

```bash
#!/bin/bash
# monitor-cache.sh

echo "📊 Monitoring image cache (Ctrl+C to stop)..."

while true; do
  clear
  echo "Cache Statistics - $(date)"
  echo "======================================"
  
  curl -s http://localhost:3001/api/image/stats | jq '{
    cached_images: .cached_images,
    cache_hits: .cache_hits,
    cache_misses: .cache_misses,
    hit_ratio: (.cache_hits / (.cache_hits + .cache_misses) * 100 | round),
    ksize_mb: (.cache_ksize / 1024 | round),
    vsize_mb: (.cache_vsize / 1024 / 1024 | round)
  }'
  
  sleep 2
done
```

### Load Testing

```bash
#!/bin/bash
# load-test.sh

echo "🔥 Load Testing Image Proxy"
echo "Making 100 requests with 10 concurrent..."

# Using GNU parallel
parallel -j 10 "curl -s 'http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg' > /dev/null" ::: {1..100}

echo "✅ Test complete. Check cache stats:"
curl -s http://localhost:3001/api/image/stats | jq .

# Alternative without parallel (using xargs)
# seq 1 100 | xargs -P 10 -I {} curl -s '...' > /dev/null
```

### Scraper Verification

```bash
#!/bin/bash
# verify-scraper.sh

echo "🕷️ Verifying scraper returns original URLs"
echo "========================================"

# Start backend if not running
if ! curl -s http://localhost:3001/api/image/health > /dev/null; then
  echo "Starting backend..."
  cd backend && npm run start:dev &
  sleep 3
fi

# Get sample product
echo "Fetching product..."
PRODUCT=$(curl -s "http://localhost:3001/api/products?page=1&limit=1" | jq '.data[0]')

echo "Product Title: $(echo $PRODUCT | jq -r .title)"
echo ""
echo "Image URL (proxied):"
echo "$PRODUCT" | jq -r .image_url
echo ""
echo "✅ This should be: http://localhost:3001/api/image?url=..."
```

---

## Docker Commands (Production)

### Build and Run

```bash
# Build backend image
cd backend
docker build -t world-of-books-backend .
docker run -p 3001:3001 \
  -e API_PORT=3001 \
  -e MONGODB_URI=mongodb://mongo:27017/worldofbooks \
  world-of-books-backend

# Build frontend image
cd frontend
docker build -t world-of-books-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001 \
  world-of-books-frontend
```

### Docker Compose

```bash
# Use existing docker-compose.yml
docker-compose up -d

# Check services
docker-compose ps

# View backend logs
docker-compose logs -f backend

# Scale image proxy service
docker-compose up -d --scale image-proxy=3
```

---

## Production Deployment Commands

### Environment Setup

```bash
# Create production .env
cat > backend/.env << EOF
# Production
NODE_ENV=production
API_PORT=3001
API_URL=https://api.worldofbooks.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/worldofbooks

# Cache
CACHE_TTL_SECONDS=86400
IMAGE_PROXY_CACHE_TTL=86400

# Security
CORS_ORIGIN=https://worldofbooks.com
EOF

# Frontend environment
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://api.worldofbooks.com
EOF
```

### PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'api',
    script: './backend/dist/main.js',
    env: {
      NODE_ENV: 'production',
      API_PORT: 3001
    }
  }, {
    name: 'frontend',
    script: 'npm',
    args: 'run start',
    cwd: './frontend'
  }]
};
EOF

# Start services
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs api
pm2 logs frontend

# Restart after changes
pm2 restart api
```

### System Health Check

```bash
#!/bin/bash
# health-check.sh

echo "🏥 System Health Check"

# Backend
if curl -s http://localhost:3001/api/image/health > /dev/null; then
  echo "✅ Backend: OK"
  curl -s http://localhost:3001/api/image/stats | jq '.cached_images, .cache_hits'
else
  echo "❌ Backend: FAILED"
fi

# Frontend
if curl -s http://localhost:3000 > /dev/null; then
  echo "✅ Frontend: OK"
else
  echo "❌ Frontend: FAILED"
fi

# Database
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  echo "✅ Database: OK"
else
  echo "❌ Database: FAILED"
fi
```

---

## Debugging Commands

### View Backend Logs

```bash
# With timestamps
npm run start:dev | grep -E "image|cache|proxy"

# All logs
tail -f logs/debug.log

# Filter by level
grep "ERROR" logs/debug.log
grep "WARN" logs/debug.log
```

### Monitor Network Requests

```bash
# Using tcpdump (requires sudo)
sudo tcpdump -i lo 'tcp port 3001'

# Using netstat
netstat -an | grep 3001

# Using lsof
lsof -i :3001
```

### Check Memory Usage

```bash
# Node process memory
ps aux | grep node | grep -v grep

# Detailed stats
ps -eo pid,vsz,rss,comm | grep node

# Real-time monitoring
top -p $(pgrep node)
```

### Test Image Proxy Error Cases

```bash
# Invalid URL
curl "http://localhost:3001/api/image?url=not-a-url"

# Blocked localhost
curl "http://localhost:3001/api/image?url=http%3A%2F%2Flocalhost%3A3000%2Fimage.jpg"

# Blocked private IP
curl "http://localhost:3001/api/image?url=http%3A%2F%2F192.168.1.1%2Fimage.jpg"

# Non-existent image
curl "http://localhost:3001/api/image?url=https%3A%2F%2Fexample.com%2Fnon-existent-image.jpg"

# Slow server (will timeout after 30s)
curl --max-time 35 "http://localhost:3001/api/image?url=https://httpbin.org/delay/40"
```

---

## Performance Profiling

### Measure Request Time

```bash
# Single request
time curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > /dev/null

# Average of 10 requests
time for i in {1..10}; do curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > /dev/null; done
```

### Benchmark with Apache Bench

```bash
# Install ab (Apache Bench)
# macOS: comes with Apache
# Linux: apt-get install apache2-utils
# Windows: download from Apache website

# Benchmark
ab -n 1000 -c 10 "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg"

# With verbose output
ab -n 100 -c 5 -v 2 "http://localhost:3001/api/image?url=..."
```

### Monitor Cache Efficiency

```bash
# Get initial cache stats
BEFORE=$(curl -s http://localhost:3001/api/image/stats | jq '.cache_hits + .cache_misses')

# Make requests
for i in {1..100}; do
  curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > /dev/null
done

# Get final cache stats
AFTER=$(curl -s http://localhost:3001/api/image/stats | jq '.cache_hits + .cache_misses')

# Calculate hit ratio
STATS=$(curl -s http://localhost:3001/api/image/stats)
echo "Cache hit ratio: $(echo $STATS | jq '.cache_hits / (.cache_hits + .cache_misses) * 100')"
```

---

## Troubleshooting Commands

### Check if Ports are in Use

```bash
# macOS/Linux
lsof -i :3001
lsof -i :3000

# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

### Kill Process on Port

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill -9

# Windows PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
```

### Clear Node Modules & Reinstall

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Test Database Connection

```bash
# MongoDB
mongosh "mongodb://localhost:27017/worldofbooks"
db.products.countDocuments()

# With authentication
mongosh "mongodb://user:pass@localhost:27017/worldofbooks"
```

---

## Quick Reference Table

| Task | Command |
|------|---------|
| Start backend | `cd backend && npm run start:dev` |
| Start frontend | `cd frontend && npm run dev` |
| Test health | `curl http://localhost:3001/api/image/health` |
| View cache | `curl http://localhost:3001/api/image/stats \| jq .` |
| Clear cache | `curl http://localhost:3001/api/image/cache/clear` |
| Get products | `curl http://localhost:3001/api/products?page=1&limit=5` |
| Test image | `curl "...&url=https%3A%2F%2Fexample.com%2Fimg.jpg"` |
| View logs | `tail -f logs/debug.log` |
| Kill on port | `lsof -ti:3001 \| xargs kill -9` |

---

## One-Liner Commands

```bash
# Test entire flow in one command
curl -s "http://localhost:3001/api/products?page=1&limit=1" | jq '.data[0] | {title, image_url}' && echo "✅ Proxy URLs working!"

# Monitor cache in real-time
watch -n 1 'curl -s http://localhost:3001/api/image/stats | jq ".cached_images, .cache_hits, .cache_misses"'

# Get cache hit ratio
curl -s http://localhost:3001/api/image/stats | jq '.cache_hits / (.cache_hits + .cache_misses) * 100 | "Hit ratio: \(.)%"'

# Count total images in database
curl -s "http://localhost:3001/api/products?page=1&limit=1000" | jq '.pagination.total' | awk '{print "Total products: "$1}'

# Test concurrent requests (10 parallel)
for i in {1..10}; do (curl -s "http://localhost:3001/api/image?url=..." > /dev/null &); done; wait

# Measure proxy response time
curl -w "Response time: %{time_total}s\n" -s "http://localhost:3001/api/image?url=..." > /dev/null
```

---

## Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Image Proxy Management
alias proxy-health='curl -s http://localhost:3001/api/image/health | jq .'
alias proxy-stats='curl -s http://localhost:3001/api/image/stats | jq .'
alias proxy-clear='curl -s http://localhost:3001/api/image/cache/clear | jq .'
alias proxy-test='curl -s "http://localhost:3001/api/image?url=https%3A%2F%2Fwww.w3schools.com%2Fcss%2Fimg_5terre.jpg" > /tmp/test.jpg && file /tmp/test.jpg'

# API Testing
alias api-products='curl -s http://localhost:3001/api/products?page=1&limit=5 | jq .'
alias api-health='curl -s http://localhost:3001/api/health | jq .'

# Service Management
alias start-dev='cd backend && npm run start:dev & cd frontend && npm run dev &'
alias stop-dev='pkill -f "npm run start:dev" && pkill -f "npm run dev"'
```

---

**Bookmark this page for quick reference while developing and deploying!**
