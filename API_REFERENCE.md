# API Reference - World of Books Discovery Platform

Complete API documentation for the backend service.

## Base URL

```
http://localhost:3001
Production: https://api.worldofbooks.app
```

## Authentication

Currently, no authentication is required. This can be added later with JWT or API keys.

## Response Format

All responses follow this format:

```json
{
  "data": {},
  "error": null,
  "timestamp": "2024-01-10T12:00:00Z"
}
```

Errors return appropriate HTTP status codes:
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Navigation Endpoints

### Get All Navigation Headings

```http
GET /api/navigation
```

**Description:** Get all top-level navigation headings from World of Books

**Response:**

```json
[
  {
    "_id": "ObjectId",
    "slug": "books",
    "title": "Books",
    "description": "Browse all books",
    "category_count": 45,
    "last_scraped_at": "2024-01-10T12:00:00Z"
  }
]
```

**Example:**

```bash
curl http://localhost:3001/api/navigation
```

---

### Get Categories for Navigation

```http
GET /api/navigation/:slug
```

**Parameters:**
- `slug` (required) - Navigation slug (e.g., "books")

**Response:**

```json
[
  {
    "_id": "ObjectId",
    "slug": "fiction",
    "title": "Fiction",
    "description": "Fiction books",
    "product_count": 234,
    "last_scraped_at": "2024-01-10T12:00:00Z"
  }
]
```

**Example:**

```bash
curl http://localhost:3001/api/navigation/books
```

---

### Refresh Navigation Data

```http
POST /api/navigation/refresh
```

**Description:** Trigger a manual refresh of navigation data from World of Books

**Response:**

```json
[
  {
    "_id": "ObjectId",
    "slug": "books",
    "title": "Books",
    "last_scraped_at": "2024-01-10T12:30:00Z"
  }
]
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/navigation/refresh
```

---

## Categories Endpoints

### Get All Categories

```http
GET /api/categories
```

**Query Parameters:**
- `navigation` (optional) - Filter by navigation slug

**Response:**

```json
[
  {
    "_id": "ObjectId",
    "slug": "fiction",
    "title": "Fiction",
    "description": "Fiction books",
    "product_count": 234,
    "last_scraped_at": "2024-01-10T12:00:00Z"
  }
]
```

**Examples:**

```bash
# Get all categories
curl http://localhost:3001/api/categories

# Get categories for a navigation
curl http://localhost:3001/api/categories?navigation=books
```

---

### Get Category Detail

```http
GET /api/categories/:slug
```

**Parameters:**
- `slug` (required) - Category slug

**Response:**

```json
{
  "_id": "ObjectId",
  "slug": "fiction",
  "title": "Fiction",
  "description": "Fiction books",
  "product_count": 234,
  "navigation_id": {
    "_id": "ObjectId",
    "title": "Books",
    "slug": "books"
  },
  "last_scraped_at": "2024-01-10T12:00:00Z"
}
```

---

### Get Subcategories

```http
GET /api/categories/:slug/subcategories
```

**Response:**

```json
[
  {
    "_id": "ObjectId",
    "slug": "literary-fiction",
    "title": "Literary Fiction",
    "description": "Literary fiction books",
    "product_count": 120
  }
]
```

---

### Refresh Category Data

```http
POST /api/categories/:slug/refresh
```

**Parameters:**
- `slug` (required) - Category slug

**Response:**

```json
{
  "_id": "ObjectId",
  "slug": "fiction",
  "title": "Fiction",
  "last_scraped_at": "2024-01-10T12:30:00Z"
}
```

---

## Products Endpoints

### Get Products

```http
GET /api/products
```

**Query Parameters:**
- `category` (optional) - Filter by category slug
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 24) - Items per page (max: 100)
- `search` (optional) - Search by title or author
- `sort` (optional, default: "newest") - Sort field: "price-asc", "price-desc", "rating"

**Response:**

```json
{
  "data": [
    {
      "_id": "ObjectId",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 15.99,
      "currency": "GBP",
      "image_url": "https://...",
      "rating_avg": 4.5,
      "reviews_count": 342,
      "source_url": "https://www.worldofbooks.com/..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 524,
    "pages": 22
  }
}
```

**Examples:**

```bash
# Get first 24 products
curl http://localhost:3001/api/products

# Get products in fiction category
curl http://localhost:3001/api/products?category=fiction

# Get page 2 with 12 products per page
curl http://localhost:3001/api/products?page=2&limit=12

# Search for books
curl http://localhost:3001/api/products?search=gatsby

# Sort by price low to high
curl http://localhost:3001/api/products?sort=price-asc
```

---

### Get Product Detail

```http
GET /api/products/:id
```

**Parameters:**
- `id` (required) - Product MongoDB ID

**Response:**

```json
{
  "_id": "ObjectId",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A novel about the American Dream...",
  "price": 15.99,
  "currency": "GBP",
  "image_url": "https://...",
  "isbn": "978-0-7432-7356-5",
  "publisher": "Scribner",
  "publication_date": "1925-04-10",
  "rating_avg": 4.5,
  "reviews_count": 342,
  "source_url": "https://www.worldofbooks.com/...",
  "specs": {
    "Pages": "180",
    "Language": "English",
    "ISBN": "978-0-7432-7356-5"
  },
  "reviews": [
    {
      "_id": "ObjectId",
      "rating": 5,
      "title": "Amazing book!",
      "content": "One of the best books I've read",
      "author": "John Doe",
      "created_at": "2024-01-05T10:00:00Z"
    }
  ]
}
```

**Example:**

```bash
curl http://localhost:3001/api/products/507f1f77bcf86cd799439011
```

---

### Refresh Product Data

```http
POST /api/products/:id/refresh
```

**Parameters:**
- `id` (required) - Product MongoDB ID

**Response:**

```json
{
  "_id": "ObjectId",
  "title": "The Great Gatsby",
  "last_scraped_at": "2024-01-10T12:30:00Z"
}
```

---

## Search Endpoints

### Search Products

```http
GET /api/search?q=query
```

**Query Parameters:**
- `q` (required) - Search query
- `limit` (optional, default: 20) - Max results (max: 100)

**Response:**

```json
[
  {
    "_id": "ObjectId",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "price": 15.99,
    "currency": "GBP",
    "image_url": "https://...",
    "rating_avg": 4.5,
    "reviews_count": 342,
    "source_url": "https://www.worldofbooks.com/..."
  }
]
```

**Examples:**

```bash
# Search for "gatsby"
curl http://localhost:3001/api/search?q=gatsby

# Search with limit
curl "http://localhost:3001/api/search?q=fitzgerald&limit=10"
```

---

### Autocomplete

```http
GET /api/search/autocomplete?q=query
```

**Query Parameters:**
- `q` (required) - Partial query
- `limit` (optional, default: 10) - Max suggestions (max: 50)

**Response:**

```json
{
  "titles": [
    "The Great Gatsby",
    "The Beautiful and Damned",
    "Tender Is the Night"
  ],
  "authors": [
    "F. Scott Fitzgerald"
  ]
}
```

---

### Get Available Filters

```http
GET /api/search/filters
```

**Response:**

```json
{
  "price_range": {
    "min": 5,
    "max": 150
  },
  "rating_filters": [
    { "label": "5 Stars", "min": 4.5, "max": 5 },
    { "label": "4+ Stars", "min": 4, "max": 4.5 },
    { "label": "3+ Stars", "min": 3, "max": 4 }
  ],
  "currencies": ["GBP", "USD", "EUR"],
  "sort_options": [
    { "value": "newest", "label": "Newest First" },
    { "value": "price-asc", "label": "Price: Low to High" },
    { "value": "price-desc", "label": "Price: High to Low" },
    { "value": "rating", "label": "Highest Rated" }
  ]
}
```

---

## History / Analytics Endpoints

### Record Product View

```http
POST /api/history
```

**Request Body:**

```json
{
  "product_id": "ObjectId",
  "user_id": "optional-user-id",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1",
  "referrer": "https://google.com"
}
```

**Response:**

```json
{
  "_id": "ObjectId",
  "product_id": "ObjectId",
  "user_id": "user-123",
  "viewed_at": "2024-01-10T12:00:00Z"
}
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/history \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "507f1f77bcf86cd799439011",
    "user_id": "user123"
  }'
```

---

### Get User History

```http
GET /api/history?user_id=optional&limit=20
```

**Query Parameters:**
- `user_id` (optional) - Filter by user ID
- `limit` (optional, default: 20) - Max results (max: 100)

**Response:**

```json
[
  {
    "_id": "ObjectId",
    "product_id": {
      "_id": "ObjectId",
      "title": "The Great Gatsby",
      "price": 15.99,
      "image_url": "https://..."
    },
    "user_id": "user-123",
    "viewed_at": "2024-01-10T12:00:00Z"
  }
]
```

---

### Get Popular Products

```http
GET /api/history/popular?limit=10
```

**Query Parameters:**
- `limit` (optional, default: 10) - Max results (max: 100)

**Response:**

```json
[
  {
    "product_id": "ObjectId",
    "product": {
      "title": "The Great Gatsby",
      "price": 15.99,
      "image_url": "https://...",
      "rating_avg": 4.5
    },
    "view_count": 234,
    "last_viewed": "2024-01-10T12:00:00Z"
  }
]
```

---

### Get Analytics Statistics

```http
GET /api/history/stats
```

**Response:**

```json
{
  "total_views": 15234,
  "unique_users": 4532,
  "unique_products": 1234,
  "views_last_30_days": [
    {
      "_id": "2024-01-10",
      "count": 234
    }
  ]
}
```

---

## Swagger/OpenAPI Documentation

Interactive API documentation is available at:

```
http://localhost:3001/api/docs
```

This provides a UI where you can test all endpoints.

---

## Error Responses

### Example Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Rate Limiting

- No rate limiting currently enforced
- Recommended: 1 request per second per IP for web scraping endpoints
- Can be implemented via middleware if needed

---

## Caching

- Navigation data cached for 24 hours
- Category data cached for 24 hours
- Product list data not cached (fresh on each request)
- Individual product details cached for 24 hours

Add `?force_refresh=true` to bypass cache:

```bash
curl http://localhost:3001/api/products/123?force_refresh=true
```

---

## Pagination

Default pagination limit is 24 items per page.

**Pagination Response:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 524,
    "pages": 22
  }
}
```

**Example - Get Page 3:**

```bash
curl http://localhost:3001/api/products?page=3&limit=24
```

---

## Sorting

Available sort options:
- `newest` (default) - Most recently added first
- `price-asc` - Lowest price first
- `price-desc` - Highest price first
- `rating` - Highest rating first

**Example:**

```bash
curl http://localhost:3001/api/products?sort=price-asc
```

---

## Filtering

### By Category

```bash
curl http://localhost:3001/api/products?category=fiction
```

### By Price Range

```bash
curl http://localhost:3001/api/products?min_price=10&max_price=50
```

### By Rating

```bash
curl http://localhost:3001/api/products?min_rating=4
```

### By Search

```bash
curl http://localhost:3001/api/products?search=gatsby
```

### Combined

```bash
curl "http://localhost:3001/api/products?category=fiction&search=fitzgerald&sort=price-asc&limit=12"
```

---

## Data Types

### Product Object

```json
{
  "_id": "ObjectId",
  "source_id": "wob_12345",
  "title": "string",
  "author": "string",
  "price": "number",
  "currency": "string (GBP|USD|EUR)",
  "image_url": "string (URL)",
  "isbn": "string",
  "publisher": "string",
  "publication_date": "ISO 8601 date",
  "description": "string",
  "rating_avg": "number (0-5)",
  "reviews_count": "number",
  "source_url": "string (URL)",
  "is_available": "boolean",
  "last_scraped_at": "ISO 8601 date",
  "created_at": "ISO 8601 date",
  "updated_at": "ISO 8601 date"
}
```

### Category Object

```json
{
  "_id": "ObjectId",
  "navigation_id": "ObjectId",
  "parent_id": "ObjectId (optional)",
  "title": "string",
  "slug": "string",
  "description": "string",
  "product_count": "number",
  "is_subcategory": "boolean",
  "depth": "number",
  "last_scraped_at": "ISO 8601 date",
  "created_at": "ISO 8601 date",
  "updated_at": "ISO 8601 date"
}
```

---

## Implementation Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Get navigation
async function getNavigation() {
  const response = await api.get('/api/navigation');
  return response.data;
}

// Get products
async function getProducts(options = {}) {
  const response = await api.get('/api/products', { params: options });
  return response.data;
}

// Search
async function searchProducts(query) {
  const response = await api.get('/api/search', { params: { q: query } });
  return response.data;
}
```

### Python

```python
import requests

BASE_URL = 'http://localhost:3001'

def get_navigation():
    response = requests.get(f'{BASE_URL}/api/navigation')
    return response.json()

def get_products(category=None, page=1, limit=24):
    params = {
        'category': category,
        'page': page,
        'limit': limit
    }
    response = requests.get(f'{BASE_URL}/api/products', params=params)
    return response.json()

def search(query):
    response = requests.get(f'{BASE_URL}/api/search', params={'q': query})
    return response.json()
```

### React Hook

```javascript
import { useQuery } from 'react-query';

function useNavigation() {
  return useQuery('navigation', () =>
    fetch('http://localhost:3001/api/navigation').then(r => r.json())
  );
}

function useProducts(options = {}) {
  const params = new URLSearchParams(options).toString();
  return useQuery(['products', options], () =>
    fetch(`http://localhost:3001/api/products?${params}`).then(r => r.json())
  );
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |

---

## Support

For issues or questions:
- Check the [README.md](./README.md)
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for code organization

---

**Last Updated:** 2024-01-10  
**API Version:** 1.0.0
