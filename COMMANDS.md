# Complete Command Reference

## Setup Commands

### Initial Setup
```bash
# Install all dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd frontend && npm install
```

---

## Running Services

### Option 1: Docker (Recommended)
```bash
# Start everything
docker-compose up --build

# Start without rebuild
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Option 2: Local Development (3 Terminals)

**Terminal 1: Database**
```bash
# Start MongoDB with Docker
docker run -d -p 27017:27017 mongo:5.0

# Or use existing MongoDB installation
```

**Terminal 2: Backend**
```bash
cd backend
npm run start:dev

# Backend runs on http://localhost:3001
# API Docs on http://localhost:3001/api/docs
```

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev

# Frontend runs on http://localhost:3000
```

---

## Development Commands

### Backend
```bash
# Start with hot reload
npm run start:dev

# Start in debug mode
npm run start:debug

# Build
npm run build

# Start production
npm start

# Run tests
npm test

# Watch tests
npm run test:watch

# Test coverage
npm run test:cov

# Scrape fiction books (validation)
npm run scrape:fiction

# Lint TypeScript
npm run lint
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run tests
npm test

# Watch tests
npm run test:watch

# Test coverage
npm run test:cov

# Lint
npm run lint

# Format code
npm run format
```

---

## Validation Commands

### End-to-End Test
```bash
# Scrapes real books and validates system
cd backend
npm run scrape:fiction
```

**Expected output:**
- ✅ Navigation scraped: 3+ items
- ✅ Categories scraped: 15+ items
- ✅ Products scraped: 20+ items
- ✅ Real book title displayed
- ✅ Real price shown
- ✅ Real author name shown

---

## Building & Deployment

### Build Backend
```bash
cd backend
npm run build

# Output in dist/ directory
```

### Build Frontend
```bash
cd frontend
npm run build

# Output in .next/ directory
```

### Build Docker Images
```bash
# Build backend
docker build -t wob-backend ./backend

# Build frontend
docker build -t wob-frontend ./frontend

# Run backend
docker run -p 3001:3001 wob-backend

# Run frontend
docker run -p 3000:3000 wob-frontend
```

---

## Database Commands

### MongoDB Shell Access
```bash
# Connect to MongoDB
mongosh

# Use database
use world_of_books

# View collections
show collections

# Count documents
db.navigation.countDocuments()
db.product.countDocuments()

# Find sample data
db.product.findOne()

# Clear collection (be careful!)
db.product.deleteMany({})
```

### MongoDB with Docker
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:5.0

# Connect
docker exec -it mongodb mongosh

# Stop
docker stop mongodb
docker remove mongodb
```

---

## Cleaning & Troubleshooting

### Clean Installation
```bash
# Remove node_modules
rm -rf node_modules frontend/node_modules backend/node_modules

# Remove lock files
rm package-lock.json frontend/package-lock.json backend/package-lock.json

# Reinstall
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Clear Next.js build
rm -rf frontend/.next

# Clear NestJS build
rm -rf backend/dist
```

### Kill Processes
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Kill process on port 3001
lsof -i :3001
kill -9 <PID>

# Kill process on port 27017 (MongoDB)
lsof -i :27017
kill -9 <PID>
```

### Reset Database
```bash
# Stop MongoDB
docker stop mongodb

# Remove MongoDB container
docker rm mongodb

# Start fresh
docker run -d -p 27017:27017 mongo:5.0
```

---

## Environment Setup

### Backend Configuration
```bash
cd backend

# Copy example config
cp .env.example .env

# Edit as needed
nano .env

# Required variables
MONGODB_URI=mongodb://localhost:27017/world_of_books
API_PORT=3001
```

### Frontend Configuration
```bash
cd frontend

# Copy example config
cp .env.example .env.local

# Edit as needed
nano .env.local

# Required variables
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## API Testing

### Using cURL

**Get Navigation**
```bash
curl http://localhost:3001/api/navigation
```

**Search Products**
```bash
curl "http://localhost:3001/api/products?category=fiction&page=1&limit=24"
```

**Full-Text Search**
```bash
curl "http://localhost:3001/api/search?query=fiction&limit=20"
```

**Get Product Detail**
```bash
curl http://localhost:3001/api/products/PRODUCT_ID
```

### Using Swagger UI
```
http://localhost:3001/api/docs
```

---

## Useful Shortcuts

### Quick Start
```bash
# One-liner for complete setup
npm install && cd frontend && npm install && cd ../backend && npm install && cd ..

# Start backend (change directory first)
cd backend && npm run start:dev

# Start frontend (different terminal)
cd frontend && npm run dev

# Validate (different terminal)
cd backend && npm run scrape:fiction
```

### Development Workflow
```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Validation
cd backend && npm run scrape:fiction

# Then visit:
# - http://localhost:3000
# - http://localhost:3001/api/docs
```

### Docker Quick Deploy
```bash
# Build and run everything
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
API_PORT=3001
MONGODB_URI=mongodb://localhost:27017/world_of_books
MONGODB_DB_NAME=world_of_books
CORS_ORIGIN=http://localhost:3000
CACHE_TTL_SECONDS=86400
LOG_LEVEL=debug
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=24
```

---

## Useful Links

### When Running Locally
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs
- Database: mongodb://localhost:27017

### Documentation
- Quick Start: `QUICKSTART.md`
- Full Guide: `COMPLETE_README.md`
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Build Status: `BUILD_STATUS.md`
- Fixes: `FIXES_APPLIED.md`

---

## Git Commands (if using version control)

```bash
# Initialize repo
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial World of Books Discovery Platform"

# Create branch
git branch feature/new-feature
git checkout feature/new-feature

# Push to remote
git push origin main
```

---

## Troubleshooting Commands

### Check Services
```bash
# Check if port 3000 is open
curl http://localhost:3000

# Check if port 3001 is open
curl http://localhost:3001/api/docs

# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version
```

### View Logs
```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# MongoDB logs
docker-compose logs mongodb

# All logs
docker-compose logs -f
```

### Debug
```bash
# Backend debug mode
cd backend && npm run start:debug

# Frontend debug
cd frontend && NODE_OPTIONS='--inspect' npm run dev
```

---

## Production Deployment

### Build for Production
```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
npm start
```

### Deploy with Docker
```bash
# Build
docker build -t wob-backend ./backend
docker build -t wob-frontend ./frontend

# Run
docker run -e NODE_ENV=production -p 3001:3001 wob-backend
docker run -p 3000:3000 wob-frontend
```

### Deploy to Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel deploy
```

---

## Maintenance

### Regular Tasks
```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Clean cache
npm cache clean --force
```

---

## Getting Help

**If something doesn't work:**

1. Read error message carefully
2. Check QUICKSTART.md
3. Check FIXES_APPLIED.md
4. Check BUILD_STATUS.md
5. Review documentation files
6. Check code comments
7. Try clearing cache and reinstalling

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Complete ✅
