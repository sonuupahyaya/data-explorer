# ⚡ Quick Start - 5 Minutes

Get the World of Books Discovery Platform running in 5 minutes.

## Prerequisites

- Node.js 20+ and npm
- MongoDB Atlas account (free tier) or local MongoDB
- Git

## 1. Get MongoDB URI (2 min)

### Using MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster (M2 tier, free forever)
4. Create database user (username: `wb_user`, auto-generate password)
5. Whitelist your IP or use 0.0.0.0/0
6. Click Connect → Copy connection string
7. Replace `<username>` and `<password>` with your credentials

Example:
```
mongodb+srv://wb_user:password@cluster0.abc123.mongodb.net/world_of_books?retryWrites=true&w=majority
```

### Using Local MongoDB

```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Linux: apt-get install mongodb

# Start MongoDB
mongod

# Connection string
mongodb://localhost:27017/world_of_books
```

## 2. Clone & Setup (1 min)

```bash
git clone <your-repo-url>
cd "data explorer"

# Copy environment template
cp .env.example .env
```

## 3. Configure MongoDB (30 sec)

Edit `.env` and add your MongoDB URI:

```bash
# .env
MONGODB_URI=mongodb+srv://wb_user:password@cluster0.abc123.mongodb.net/world_of_books?retryWrites=true&w=majority
MONGODB_DB_NAME=world_of_books
```

## 4. Choose: Docker OR Manual

### Option A: Docker (30 sec)

```bash
docker-compose up -d

# Wait 1-2 minutes for services to start
sleep 120

# Check status
docker-compose ps
```

### Option B: Manual (1.5 min)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 5. Verify (1 min)

Open in browser:

- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:3001/api/docs

You should see:
✅ Navigation headings on homepage
✅ Swagger API documentation
✅ Interactive API explorer

## Common Issues

### Port 3001 already in use
```bash
# macOS/Linux
lsof -i :3001
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### MongoDB connection refused
```bash
# Check MongoDB is running
mongosh

# If using Docker
docker-compose logs mongodb
```

### API URL not connecting
```bash
# Make sure both services are running
docker-compose ps

# Or check individual services are started
curl http://localhost:3001/api/navigation
```

## Next Steps

1. ✅ App is running
2. 📖 Read [README.md](./README.md) for full guide
3. 📚 Read [API_DOCS.md](./API_DOCS.md) for API endpoints
4. 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production
5. 🔧 Read [SETUP.md](./SETUP.md) for detailed setup

## Key Commands

```bash
# Development
npm run start:dev        # Backend
npm run dev             # Frontend

# Production
npm run build           # Compile
npm start               # Run

# Testing
npm test
npm run test:cov

# Docker
docker-compose up -d    # Start
docker-compose down     # Stop
docker-compose logs -f  # View logs
```

## Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/api/docs |
| MongoDB (local only) | mongodb://localhost:27017 |

## Testing the API

```bash
# Get all navigation
curl http://localhost:3001/api/navigation

# Get products
curl "http://localhost:3001/api/products?limit=12"

# View Swagger docs
open http://localhost:3001/api/docs
```

## Directory Structure

```
project/
├── backend/     → NestJS API server
├── frontend/    → Next.js web app
└── docs/        → Documentation
```

## Help

- Check `.env` file is configured
- Ensure MongoDB connection string is correct
- View logs: `docker-compose logs backend`
- Read [SETUP.md](./SETUP.md) for detailed help

---

**That's it!** You now have a production-ready product discovery platform running locally.

Next: Deploy to production using [DEPLOYMENT.md](./DEPLOYMENT.md)
