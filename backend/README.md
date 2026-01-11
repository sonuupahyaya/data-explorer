# World of Books Discovery Platform - Backend

Production-grade NestJS backend with real data scraping from worldofbooks.com.

## Architecture

```
backend/
├── src/
│   ├── scraper/           # Crawlee + Playwright scraping engine
│   │   ├── real-scraper.ts       # Core scraper implementation
│   │   └── scraper.service.ts    # NestJS service wrapper
│   ├── database/          # MongoDB configuration
│   ├── navigation/        # Navigation endpoints & logic
│   ├── categories/        # Categories endpoints & logic
│   ├── products/          # Products endpoints & logic
│   ├── search/            # Full-text search functionality
│   ├── history/           # View history tracking
│   ├── schemas/           # MongoDB schemas
│   ├── cli/               # CLI scripts for scraping
│   ├── app.module.ts      # Main app module
│   └── main.ts            # Application entry point
```

## Key Features

### 🕷️ Real-Time Web Scraping

- **Crawlee + Playwright** for JavaScript-heavy site scraping
- **Headless browser** automation with Playwright
- **Smart selectors** adapted for worldofbooks.com structure
- **Error handling** with fallbacks and retries

### 🗄️ MongoDB Storage

Collections:
- `navigation` - Top-level navigation headings
- `category` - Categories and subcategories
- `product` - Book listings with metadata
- `product_detail` - Detailed product information
- `review` - Product reviews (extensible)
- `scrape_job` - Job tracking for scraping operations
- `view_history` - User browsing history

Indexes:
- Full-text search on `product.title` and `product.author`
- Unique constraints on `source_id` + `source_url`
- TTL indexes for automatic data cleanup

### ⚡ Caching Strategy

- **In-memory caching** via `CACHE_TTL_SECONDS` (default: 24 hours)
- **Background refresh** - Stale data is served while new data is fetched
- **No blocking requests** - All scraping operations are asynchronous
- **Exponential backoff** for failed scrapes

### 📡 RESTful APIs

#### Navigation
```
GET /api/navigation
  - Get all navigation headings from cache
  - Automatic background refresh if stale

GET /api/navigation/:slug
  - Get categories for a navigation section
  
POST /api/navigation/refresh
  - Force refresh of navigation data
```

#### Products
```
GET /api/products?category=fiction&page=1&limit=24&search=&sort=newest
  - Paginated product listing
  - Category filtering
  - Full-text search
  - Sorting: newest, price-asc, price-desc, rating

GET /api/products/:id
  - Detailed product view
  - Related reviews

POST /api/products/:id/refresh
  - Refresh specific product data
```

#### Search
```
GET /api/search?query=term&limit=20
  - Full-text search with fallback regex

GET /api/search/autocomplete?query=term
  - Autocomplete suggestions

GET /api/search/filters
  - Available filter options (price range, ratings, etc.)
```

#### History
```
POST /api/history
  - Record product view
  
GET /api/history?user_id=&limit=20
  - Get browsing history
  
GET /api/history/popular
  - Get popular products by view count
  
GET /api/history/analytics
  - Analytics dashboard data
```

### 📊 Database Indexes

Optimized for:
- Fast category lookups by slug
- Full-text search on titles and authors
- Efficient pagination
- Quick historical data retrieval

## Setup

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Docker (optional)

### Local Development

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5.0
   
   # Or use your local MongoDB installation
   ```

4. **Start backend**
   ```bash
   npm run start:dev
   
   # Server will be available at http://localhost:3001
   # API docs: http://localhost:3001/api/docs
   ```

## Validation Scripts

### Scrape Fiction Books (Real Data Test)

```bash
npm run scrape:fiction
```

This script:
1. ✅ Connects to worldofbooks.com via Playwright
2. ✅ Scrapes real navigation headings
3. ✅ Finds fiction category
4. ✅ Extracts book listings
5. ✅ Scrapes product details
6. ✅ Logs first book details

Expected output:
```
🚀 Starting Fiction Books Scraper Validation
📍 STEP 1: Scraping navigation headings...
✅ Navigation scraped: 3 items found
  1. Books (books)
  2. New Arrivals (new-arrivals)
  3. Bestsellers (bestsellers)

📍 STEP 2: Locating fiction books category...
✅ Found: Books (https://www.worldofbooks.com/en-gb/books)

📍 STEP 3: Scraping categories from fiction...
✅ Categories scraped: 15+ items found

📍 STEP 4: Scraping products from category...
✅ Products scraped: 20+ items found

📍 STEP 5: First product details:
  📖 Title: [Real Book Title]
  ✍️  Author: [Real Author Name]
  💰 Price: £[Real Price]
  📸 Image: Yes
  🔗 URL: https://www.worldofbooks.com/en-gb/books/[product-id]

✅ ==========================================
✅ VALIDATION SUCCESSFUL!
✅ Real data scraped from: https://www.worldofbooks.com
```

## Scraping Strategy

### How It Works

1. **Request arrives** for navigation/products/details
2. **Check MongoDB cache** for existing data
3. **If cache fresh** (<24 hours): Return immediately
4. **If cache stale**: 
   - Return cached data immediately
   - Trigger background scrape
   - Update database when complete
5. **If no cache**: Scrape immediately, store result

### Handled Scenarios

- JavaScript-rendered content (Playwright)
- Dynamic pagination
- Image lazy-loading
- Rate limiting (waits between requests)
- Connection failures (exponential backoff)
- Partial data (graceful degradation)

### Data Quality

- ✅ Real data from worldofbooks.com
- ✅ Deduplication by `source_url`
- ✅ Sanitized input validation
- ✅ Consistent data types
- ✅ UTC timestamps

## Production Deployment

### Docker

```bash
# Build image
docker build -t wob-backend .

# Run container
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://mongodb:27017/world_of_books \
  -e CORS_ORIGIN=https://yourdomain.com \
  wob-backend
```

### Environment Variables

All configurable via `.env`:
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB_NAME` - Database name
- `API_PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed frontend URLs
- `CACHE_TTL_SECONDS` - Cache expiration (default: 86400)
- `LOG_LEVEL` - Logging verbosity (debug, info, warn, error)

### Monitoring

- Swagger API docs: `GET /api/docs`
- Health check: `GET /api/health` (add endpoint if needed)
- Logs: Configure `LOG_LEVEL` for detailed output

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Development

### Building

```bash
npm run build
npm start
```

### Debugging

```bash
npm run start:debug
# Then connect debugger to port 9229
```

## API Documentation

Complete Swagger documentation available at:
```
http://localhost:3001/api/docs
```

Generated from JSDoc/Swagger decorators in controllers.

## Error Handling

All endpoints return standardized JSON errors:

```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "BadRequest"
}
```

## Rate Limiting (Optional)

Can be added via:
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(100, 900) // 100 requests per 15 minutes
```

## Security

- ✅ Input validation with class-validator
- ✅ CORS configured per environment
- ✅ Helmet for security headers
- ✅ .env secrets not committed
- ✅ No SQL injection (MongoDB)
- ✅ XSS protection in responses

## License

MIT
