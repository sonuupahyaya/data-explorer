# Setup Instructions

Complete guide to set up the World of Books Discovery Platform locally.

## Prerequisites

Ensure you have installed:

- **Node.js** 20+ - [Download](https://nodejs.org)
- **npm** 10+ - Comes with Node.js
- **Git** - [Download](https://git-scm.com)
- **Docker & Docker Compose** (optional but recommended) - [Download](https://www.docker.com/products/docker-desktop)

Verify installations:

```bash
node --version    # Should be v20+
npm --version     # Should be 10+
git --version     # Should be 2.40+
docker --version  # Optional
```

## Option 1: Docker Compose Setup (Recommended)

Fastest way to get everything running locally.

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd "data explorer"
```

### Step 2: Set Up Environment

Get MongoDB connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas):

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI
# Find this line:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database_name
# And update it
```

### Step 3: Start Services

```bash
docker-compose up -d
```

Wait for services to start (1-2 minutes):

```bash
# Check status
docker-compose ps

# Expected output:
# NAME                COMMAND       STATUS      PORTS
# backend             npm start     Up 2 min    0.0.0.0:3001->3001/tcp
# frontend            npm start     Up 2 min    0.0.0.0:3000->3000/tcp
# mongodb             mongod        Up 2 min    0.0.0.0:27017->27017/tcp
```

### Step 4: Verify Installation

Visit in your browser:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

You should see the World of Books homepage with navigation headings.

### Stop Services

```bash
docker-compose down

# Remove volumes (deletes database)
docker-compose down -v
```

---

## Option 2: Manual Setup

For development without Docker.

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd "data explorer"
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with MongoDB URI
nano .env
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/world_of_books

# Build
npm run build

# Start in development mode
npm run start:dev
```

Backend runs on http://localhost:3001

### Step 3: MongoDB Setup

Option A - Use MongoDB Atlas (Cloud):
```bash
# Skip if using .env MONGODB_URI
```

Option B - Install MongoDB Locally:

Windows:
```bash
# Download and install from https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Then start:
mongod
```

macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Linux:
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Step 4: Frontend Setup

In a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs on http://localhost:3000

### Step 5: Verify Installation

Visit:
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:3001/api/docs

---

## MongoDB Atlas Setup

### Create Free Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create organization and project

### Create Cluster

1. Click "Create" cluster
2. Select "M2" (free forever tier)
3. Choose cloud provider (AWS recommended)
4. Choose region close to you
5. Click "Create Cluster"

Wait 5-10 minutes for cluster to be created.

### Create Database User

1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. **Username:** `world_of_books_user` (or your choice)
4. **Password:** Use "Autogenerate Secure Password"
5. **Privileges:** "Read and write to any database"
6. Copy password somewhere safe
7. Click "Create User"

### Whitelist IP Addresses

1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Add Current IP Address" (for your machine)
4. Or click "Allow Access from Anywhere" (0.0.0.0/0) for local development
5. Click "Confirm"

### Get Connection String

1. Click "Databases" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with your database user
6. Replace `<database>` with `world_of_books`

Example:
```
mongodb+srv://world_of_books_user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/world_of_books?retryWrites=true&w=majority
```

### Update .env Files

Backend `.env`:
```bash
MONGODB_URI=mongodb+srv://world_of_books_user:YOUR_PASSWORD@cluster0.abc123.mongodb.net/world_of_books?retryWrites=true&w=majority
MONGODB_DB_NAME=world_of_books
```

---

## Troubleshooting

### Port Already in Use

If port 3001 or 3000 is already in use:

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in .env
API_PORT=3002
```

### MongoDB Connection Refused

```bash
# Check MongoDB is running
mongosh --eval "db.version()"

# If using MongoDB locally:
mongod  # Start MongoDB daemon

# If using MongoDB Atlas:
# - Check internet connection
# - Check MongoDB URI in .env
# - Check IP whitelist in MongoDB Atlas
# - Check username and password are correct
```

### Frontend Can't Connect to API

```bash
# Check NEXT_PUBLIC_API_URL in frontend/.env
# Should match backend URL accessible from browser
NEXT_PUBLIC_API_URL=http://localhost:3001

# Restart frontend
npm run dev
```

### Docker Issues

```bash
# Clear and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Node Modules Issues

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Development Workflow

### Running Tests

```bash
# Backend
cd backend
npm test          # Run once
npm run test:watch # Watch mode
npm run test:cov  # With coverage

# Frontend
cd frontend
npm test
npm run test:watch
```

### Building for Production

```bash
# Backend
cd backend
npm run build
# Output in dist/

# Frontend
cd frontend
npm run build
# Output in .next/
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

---

## Database Management

### View Data in MongoDB

```bash
# Using mongosh CLI
mongosh

# Then:
use world_of_books
db.navigation.find()
db.product.find().limit(5)
```

### Seed Database

```bash
cd backend
npm run seed
```

### Export/Import Data

```bash
# Export
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/world_of_books" --out=backup

# Import
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/world_of_books" backup/
```

---

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb+srv://...` |
| `MONGODB_DB_NAME` | Database name | `world_of_books` |
| `API_PORT` | Backend port | `3001` |
| `API_URL` | Backend URL | `http://localhost:3001` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend's API URL | `http://localhost:3001` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `PLAYWRIGHT_HEADLESS` | Browser mode | `true` / `false` |
| `SCRAPING_TIMEOUT` | Timeout (ms) | `30000` |
| `SCRAPING_MAX_RETRIES` | Max retries | `3` |
| `SCRAPING_RATE_LIMIT_MS` | Rate limit (ms) | `1000` |
| `CACHE_TTL_SECONDS` | Cache time (s) | `86400` |

---

## Git Workflow

### First Time Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Daily Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ...

# Stage changes
git add .

# Commit
git commit -m "feat: add new feature"

# Push
git push origin feature/my-feature

# Create Pull Request on GitHub
```

### Commit Message Format

```
<type>(<scope>): <subject>

feat: add navigation endpoint
fix: resolve database connection issue
refactor: optimize scraper performance
test: add unit tests for products
docs: update API documentation
```

---

## IDE Setup

### VS Code Extensions

Recommended:
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **MongoDB for VS Code**
- **REST Client** (for API testing)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Next Steps

1. ✅ Installation complete
2. 📖 Read [README.md](./README.md) for project overview
3. 📚 Read [API_DOCS.md](./API_DOCS.md) for API details
4. 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production
5. 🧪 Run tests: `npm test`
6. 🔍 Explore Swagger docs at http://localhost:3001/api/docs

---

## Need Help?

- Check logs: `docker-compose logs -f`
- Visit http://localhost:3001/api/docs for API docs
- Check GitHub Issues
- Read error messages carefully

---

Happy coding! 🎉
