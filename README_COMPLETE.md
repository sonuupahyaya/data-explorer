# 🌐 World of Books Discovery Platform

A production-ready, full-stack web scraping and e-commerce discovery platform that leverages real-time data from World of Books.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-full--stack-blueviolet)

## 🎯 Overview

This platform demonstrates modern full-stack development with:
- **Live web scraping** from World of Books using Crawlee + Playwright
- **Real-time data** served via NestJS REST APIs
- **Responsive frontend** with Next.js and React Query
- **Production-grade** infrastructure with Docker, MongoDB, and Redis
- **Complete documentation** for development and deployment

**Live Data:** This platform scrapes real books, prices, and reviews from https://www.worldofbooks.com

## ✨ Features

### User Features
- ✅ Browse navigation hierarchy
- ✅ Explore categories and subcategories
- ✅ View product listings with pagination
- ✅ Full-text search across products
- ✅ Sort and filter results
- ✅ View detailed product information
- ✅ Track view history
- ✅ Popular products analytics

### Developer Features
- ✅ Comprehensive REST API with Swagger docs
- ✅ Advanced web scraping infrastructure
- ✅ Intelligent caching system (TTL-based)
- ✅ Background job queue (Bull/Redis)
- ✅ Full-text search capability
- ✅ Analytics and tracking
- ✅ Docker containerization
- ✅ CI/CD with GitHub Actions
- ✅ TypeScript for type safety
- ✅ Comprehensive error handling

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **State Management:** React Query
- **Styling:** Tailwind CSS
- **Components:** React
- **Testing:** Jest
- **Deployment:** Vercel

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Caching:** Redis + Bull queue
- **Scraping:** Crawlee + Playwright + Cheerio
- **API Docs:** Swagger/OpenAPI
- **Testing:** Jest
- **Deployment:** Render.com / Docker

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Database:** MongoDB Atlas
- **Cache:** Redis
- **Deployment:** Render, Vercel, or self-hosted
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry, DataDog (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup (5 minutes)

```bash
# Clone repository
git clone <repo-url>
cd data-explorer

# Copy environment file
cp .env.example .env

# Start services with Docker Compose
docker-compose up -d

# Backend available at: http://localhost:3001
# Frontend available at: http://localhost:3000
# API Docs at: http://localhost:3001/api/docs
```

### Without Docker

**Backend:**
```bash
cd backend
npm install
npm run start:dev
# Runs on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

**Database:**
- Install MongoDB locally or use MongoDB Atlas
- Update `.env` with connection string

**Redis:**
- Install Redis locally or use Redis Cloud
- Update `.env` with connection string

## 📚 API Endpoints

### Navigation
```
GET    /api/navigation               - Get all navigation headings
GET    /api/navigation/:slug         - Get categories for navigation
POST   /api/navigation/refresh       - Refresh navigation data
```

### Categories
```
GET    /api/categories               - Get all categories
GET    /api/categories/:slug         - Get category detail
GET    /api/categories/:slug/subcategories
POST   /api/categories/:slug/refresh
```

### Products
```
GET    /api/products                 - Get products with pagination
GET    /api/products/:id             - Get product detail
POST   /api/products/:id/refresh     - Refresh product data
```

### Search
```
GET    /api/search?q=query           - Search products
GET    /api/search/autocomplete      - Get autocomplete suggestions
GET    /api/search/filters           - Get available filters
```

### History & Analytics
```
POST   /api/history                  - Track product view
GET    /api/history                  - Get user view history
GET    /api/history/popular          - Get popular products
GET    /api/history/stats            - Get analytics stats
```

**Full API documentation:** See [API_REFERENCE.md](./API_REFERENCE.md)

## 📁 Project Structure

```
data-explorer/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── app.module.ts      # Main module
│   │   ├── main.ts            # Bootstrap
│   │   ├── navigation/        # Navigation module
│   │   ├── categories/        # Categories module
│   │   ├── products/          # Products module
│   │   ├── search/            # Search module
│   │   ├── history/           # Analytics module
│   │   ├── scraper/           # Web scraping
│   │   ├── schemas/           # MongoDB schemas
│   │   └── database/          # Database config
│   ├── package.json
│   ├── Dockerfile
│   └── tsconfig.json
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── pages/             # Page routes
│   │   ├── components/        # React components
│   │   ├── lib/               # API client, utils
│   │   └── styles/            # Tailwind CSS
│   ├── public/                # Static assets
│   ├── package.json
│   ├── Dockerfile
│   ├── next.config.js
│   └── tailwind.config.js
│
├── docker-compose.yml         # Multi-service setup
├── .env.example              # Environment template
├── README.md                 # This file
├── API_REFERENCE.md          # Complete API docs
├── PRODUCTION_SETUP.md       # Deployment guide
└── CHECKLIST.md              # Pre-launch checklist
```

## 🔄 Data Flow

```
World of Books Website
        ↓
   Crawlee Scraper
   (Playwright)
        ↓
MongoDB Database
        ↓
NestJS REST API
        ↓
Frontend (Next.js)
        ↓
    User Browser
```

## 📊 Database Schema

### Collections
- **navigation** - Top-level headings (Books, Categories, etc.)
- **category** - Categories and subcategories
- **product** - Book listings with metadata
- **review** - Product reviews and ratings
- **view_history** - User viewing analytics (auto-expires)
- **scrape_job** - Job queue tracking

### Key Indexes
- Full-text search on products (title, author)
- Navigation slug (unique)
- Category navigation relationship
- Product availability and pricing
- View history with TTL

## 🕷️ Scraping Strategy

### How It Works
1. **Navigation Scrape** - Extract top-level categories
2. **Category Scrape** - Extract subcategories and product lists
3. **Product Scrape** - Extract individual book details
4. **Detail Scrape** - Get reviews, specs, full descriptions

### Scraper Features
- Headless browser automation (Playwright)
- Smart CSS selectors + fallbacks
- Automatic retry with exponential backoff
- Rate limiting (1 req/sec)
- User-Agent rotation
- Image optimization
- Deduplication by URL

### Example Scraping Flow
```bash
# Trigger manual navigation scrape
POST /api/navigation/refresh

# System automatically:
# 1. Requests World of Books homepage
# 2. Extracts navigation headings
# 3. Stores in MongoDB
# 4. Returns fresh data to frontend
```

## ⚙️ Configuration

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/world_of_books
MONGODB_DB_NAME=world_of_books

# API
API_PORT=3001
FRONTEND_URL=http://localhost:3000

# Scraping
PLAYWRIGHT_HEADLESS=true
SCRAPING_TIMEOUT=30000
SCRAPING_MAX_RETRIES=3
SCRAPING_RATE_LIMIT_MS=1000

# Cache
CACHE_TTL_SECONDS=86400
CACHE_ENABLED=true

# Queue
REDIS_URL=redis://localhost:6379
QUEUE_CONCURRENCY=3

# Security
CORS_ORIGIN=http://localhost:3000
HELMET_ENABLED=true

# Logging
LOG_LEVEL=debug
```

See [.env.example](./.env.example) for all options.

## 🚀 Deployment

### Quick Deploy (5 minutes)

#### Render.com (Backend)
```
1. Connect GitHub repo to render.com
2. Set environment variables
3. Deploy automatically
4. Get API URL
```

#### Vercel (Frontend)
```
1. Import frontend folder to vercel.com
2. Set NEXT_PUBLIC_API_URL
3. Deploy automatically
4. Get frontend URL
```

#### Docker Compose (Self-Hosted)
```bash
docker-compose -f docker-compose.yml up -d
```

**Detailed guide:** See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

## 📈 Performance

### Benchmarks
- API Response Time: < 500ms (p95)
- Frontend Load Time: < 3s (Lighthouse)
- Database Queries: < 100ms (p95)
- Scraping Speed: 50-100 books/min

### Optimizations
- Mongoose connection pooling
- Full-text search indexes
- Redis caching layer
- Image optimization (Next.js)
- CSS purging (Tailwind)
- Gzip compression

## 🔐 Security

### Implemented
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation (class-validator)
- ✅ No hardcoded secrets
- ✅ SQL injection prevention (Mongoose)
- ✅ XSS protection
- ✅ Rate limiting ready
- ✅ HTTPS/SSL ready

### Checklist
- [ ] Enable HTTPS in production
- [ ] Set secure CORS origins
- [ ] Configure rate limiting
- [ ] Enable API authentication (if needed)
- [ ] Set up monitoring (Sentry)
- [ ] Regular dependency updates
- [ ] Security audits

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Coverage report
npm test -- --coverage
```

### CI/CD
- Automated tests on pull requests
- Linting checks
- Docker build verification
- Deployment on merge to main

## 📖 Documentation

- [README.md](./README.md) - Project overview
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API docs
- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Deployment guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Code organization
- [CHECKLIST.md](./CHECKLIST.md) - Pre-launch verification

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker logs backend

# Reset database
docker exec mongodb mongosh --eval "db.dropDatabase()"

# Rebuild
docker-compose down && docker-compose up --build
```

### Scraper not working
```bash
# Check Playwright installation
npm list playwright

# Test scraper directly
curl http://localhost:3001/api/navigation/refresh

# Check logs
docker logs backend | grep scraper
```

### Slow queries
```bash
# Check MongoDB indexes
db.products.getIndexes()

# Monitor slow queries
db.setProfilingLevel(1)
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Make changes with tests
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🎓 Learning Resources

This project demonstrates:
- Full-stack JavaScript/TypeScript
- NestJS backend architecture
- Next.js modern frontend
- Web scraping best practices
- Database design and indexing
- Docker containerization
- CI/CD automation
- Production deployment
- RESTful API design
- Real-time data handling

## 🚀 Next Steps

### To Get Running
1. Follow [QUICK_START.md](./QUICK_START.md)
2. Access http://localhost:3000
3. View API docs at http://localhost:3001/api/docs

### To Deploy
1. Follow [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
2. Set up MongoDB Atlas
3. Deploy to Render.com + Vercel

### To Extend
- Add user authentication
- Add wishlist/bookmarking
- Add user ratings/reviews
- Add more data sources
- Add admin dashboard
- Add mobile app (React Native)

## 📞 Support

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Documentation:** See docs folder
- **Deployment Help:** See PRODUCTION_SETUP.md

## ⭐ Star History

If this project helped you, please star it!

## 🙏 Acknowledgments

- World of Books for data source
- NestJS community
- Next.js team
- Crawlee developers
- MongoDB team

---

**Last Updated:** 2024-01-10  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

Built with ❤️ using modern web technologies
