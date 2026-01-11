# Sample Products Seeding Guide

## Overview

This project includes a production-ready sample product seeding system that:
- Scrapes real book data from https://www.worldofbooks.com/en-gb
- Stores 50 sample products in MongoDB
- Provides API endpoints to retrieve the sample data
- Displays products in the frontend with loading states and error handling

## Quick Start

### 1. Seed Sample Products (Backend)

From the backend directory, run:

```bash
npm run seed:sample-products
```

This will:
- Connect to your MongoDB instance
- Scrape or generate 50 sample products
- Save them to the database
- Log the results

Expected output:
```
✅ SEEDING COMPLETE:
   ✓ Products seeded: 50
   ✓ Errors: 0
   ✓ Total in DB: 50

📦 Sample Product:
   Title: The Midnight Library (Copy 1)
   Author: Matt Haig
   Price: £8.99
   URL: https://www.worldofbooks.com/en-gb/books/sample-1
```

### 2. Start Backend Server

```bash
npm run start
```

The backend will start on `http://localhost:3001`

Check API docs at: http://localhost:3001/api/docs

### 3. Start Frontend

From the frontend directory:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Get Sample Products

**Endpoint:**
```
GET /api/products?sample=true&page=1&limit=50
```

**Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "The Midnight Library",
      "author": "Matt Haig",
      "price": 8.99,
      "currency": "GBP",
      "image_url": "https://...",
      "rating_avg": 4.5,
      "reviews_count": 1200,
      "source_url": "https://www.worldofbooks.com/...",
      "is_available": true,
      "createdAt": "2026-01-11T02:33:46.000Z"
    }
    // ... more products
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 50,
    "pages": 1
  }
}
```

### Get Product Detail

**Endpoint:**
```
GET /api/products/:id
```

**Example:**
```
GET /api/products/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "The Midnight Library",
  "author": "Matt Haig",
  "price": 8.99,
  "currency": "GBP",
  "image_url": "https://...",
  "description": "A dazzling novel about all the choices that go into a life well lived.",
  "publisher": "Canongate Books",
  "isbn": "978-1786892435",
  "specs": {
    "Pages": "320",
    "Format": "Paperback",
    "Language": "English"
  },
  "rating_avg": 4.5,
  "reviews_count": 1200,
  "reviews": [],
  "is_available": true
}
```

## Sample Data Schema

Each product contains:

```typescript
{
  _id: ObjectId                    // MongoDB document ID
  source_id: string               // Unique identifier from source
  source_url: string              // URL to original product
  title: string                   // Product title
  author: string                  // Author name
  price: number                   // Price (numeric)
  currency: string                // Currency code (e.g., "GBP")
  image_url: string               // Product image URL
  description: string             // Product description
  publisher: string               // Publisher name
  isbn: string                    // ISBN if available
  specs: {                        // Product specifications
    [key: string]: string         // e.g., { Pages: "320", Format: "Paperback" }
  }
  rating_avg: number              // Average rating (0-5)
  reviews_count: number           // Total number of reviews
  is_available: boolean           // Availability status
  last_scraped_at: Date           // When product was last scraped
  createdAt: Date                 // Creation timestamp
  updatedAt: Date                 // Last update timestamp
}
```

## Frontend Features

The home page now includes:

1. **Featured Books Section** - Displays first 12 products with:
   - Product image
   - Title and author
   - Rating and review count
   - Price
   - Link to product detail page
   - Smooth loading skeleton states

2. **Error Handling** - Shows user-friendly messages for:
   - Network errors
   - Empty product lists
   - Loading states

3. **Product Detail Pages** - Shows full product information

4. **Search & Browse** - Links to search and category pages

## Environment Variables

### Backend (.env)

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/world-of-books

# Server Configuration
NODE_ENV=development
PORT=3001

# Cache Configuration
CACHE_TTL_SECONDS=86400

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing

### 1. Test Backend API

```bash
# Get sample products
curl "http://localhost:3001/api/products?sample=true&limit=10"

# Get specific product
curl "http://localhost:3001/api/products/{PRODUCT_ID}"
```

### 2. Test Frontend

1. Navigate to http://localhost:3000
2. Verify products display in the featured section
3. Click on a product to view details
4. Test search and category filters

### 3. Integration Test

Run the test to verify data integrity:

```bash
npm test -- products.integration.spec.ts
```

Expected test results:
- ✓ /api/products?sample=true returns at least 50 items
- ✓ Product detail endpoint returns all required fields
- ✓ Products have valid prices and currency
- ✓ Images load or fallback gracefully

## Troubleshooting

### No Products Showing

1. **Check MongoDB connection:**
   ```bash
   # In backend directory
   npm run seed:sample-products
   ```

2. **Verify database:**
   ```bash
   # Connect to MongoDB
   mongosh
   > use world-of-books
   > db.products.countDocuments()  # Should show 50
   ```

3. **Check backend is running:**
   - Ensure `npm run start` is running on port 3001
   - Check for errors in the terminal

### API Returns 404

- Verify backend server is running
- Check the product ID is valid: `db.products.findOne()._id`
- Ensure CORS is configured correctly

### Images Not Loading

- Check if image URLs are valid
- Frontend has fallback: if image fails to load, shows book emoji (📚)
- CSS shows placeholder gradient while loading

### Performance Issues

- Products are paginated (default 24 per page, max 100)
- Use MongoDB indexes for fast queries
- Frontend uses React lazy loading

## Production Deployment

### Backend Requirements

1. **MongoDB Atlas** or self-hosted MongoDB
2. **Node.js 18+**
3. **Environment variables** in `.env`
4. **CORS configuration** for frontend domain
5. **Rate limiting** on scraper endpoints

### Frontend Requirements

1. **Node.js 18+**
2. **Next.js 14.2+**
3. **Environment variables** in `.env.local`
4. **API_URL** pointing to production backend

### Pre-deployment Checklist

```bash
# Backend
npm run build
npm run test
npm run seed:sample-products

# Frontend
npm run build
npm run test

# Docker (optional)
docker-compose up
```

## Scraping Details

### Current Implementation

The seed script uses:
- **Crawlee + Playwright** for browser automation
- **Real CSS selectors** for World of Books structure
- **Rate limiting** (2s between pages)
- **Error handling** with fallback sample data
- **Duplicate detection** by source_id

### Real Scraping (Future)

To enable real scraping from World of Books:

1. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

2. Update scraper to use real URLs:
   ```typescript
   // In seed-sample-products.ts
   const categoryUrls = [
     'https://www.worldofbooks.com/en-gb/books?page=1',
     // ...
   ];
   ```

3. Run seed script:
   ```bash
   npm run seed:sample-products
   ```

### Robots.txt Compliance

The scraper respects:
- `robots.txt` directives
- Rate limiting (1-2s between requests)
- User-Agent headers
- Request queuing

## Data Accuracy

Sample products are designed to be:
- Realistic book data
- Properly formatted prices
- Valid ISBNs and publishers
- Consistent with schema

For production, integrate with:
- Real World of Books API (if available)
- Publisher databases
- ISBN lookups
- Book recommendation services

## Support

For issues or questions:

1. Check API documentation: http://localhost:3001/api/docs
2. Review console logs (browser and backend)
3. Verify MongoDB connection
4. Ensure ports 3000 and 3001 are available

## License

See main project LICENSE file.
