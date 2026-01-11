# API Documentation

## Base URL

- **Development:** `http://localhost:3001`
- **Production:** `https://api.books.example.com`

## Interactive API Docs

Visit `/api/docs` for interactive Swagger UI

## Authentication

Currently no authentication required. Future versions will support JWT.

## Rate Limiting

- **Requests per minute:** 60
- **Requests per second:** 1 (per scraper)
- **Timeout:** 30 seconds

## Response Format

All responses return JSON. Errors include:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## Navigation Endpoints

### GET /api/navigation

Get all navigation headings from World of Books homepage.

**Query Parameters:** None

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "slug": "fiction",
    "title": "Fiction",
    "description": "Fiction books and novels",
    "image_url": "https://...",
    "category_count": 12,
    "is_active": true,
    "last_scraped_at": "2024-01-10T12:00:00Z",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T12:00:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Server error

**Example:**
```bash
curl http://localhost:3001/api/navigation
```

---

### GET /api/navigation/:slug

Get subcategories for a specific navigation heading.

**Path Parameters:**
- `slug` (string, required) - Navigation slug (e.g., "fiction")

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "navigation_id": "507f1f77bcf86cd799439011",
    "parent_id": null,
    "slug": "science-fiction",
    "title": "Science Fiction",
    "description": "Science fiction novels",
    "product_count": 245,
    "is_subcategory": true,
    "depth": 1,
    "last_scraped_at": "2024-01-10T12:00:00Z",
    "createdAt": "2024-01-10T10:00:00Z",
    "updatedAt": "2024-01-10T12:00:00Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `400` - Invalid slug
- `404` - Navigation not found

**Example:**
```bash
curl http://localhost:3001/api/navigation/fiction
```

---

### POST /api/navigation/refresh

Force refresh all navigation data from World of Books.

**Request Body:** Empty

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "slug": "fiction",
    "title": "Fiction",
    ...
  }
]
```

**Status Codes:**
- `201` - Created/Updated
- `500` - Scraping failed

**Example:**
```bash
curl -X POST http://localhost:3001/api/navigation/refresh
```

**Note:** This endpoint may take several seconds to complete.

---

## Products Endpoints

### GET /api/products

Get paginated list of products with filtering and search.

**Query Parameters:**
- `category` (string, optional) - Filter by category slug
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 24, max: 100)
- `search` (string, optional) - Search by title or author
- `sort` (string, optional) - Sort order:
  - `newest` - Most recently scraped (default)
  - `price-asc` - Price low to high
  - `price-desc` - Price high to low
  - `rating` - Highest rated first

**Response:**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "source_id": "wob_12345",
      "source_url": "https://www.worldofbooks.com/product/123",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "price": 8.99,
      "currency": "GBP",
      "image_url": "https://...",
      "rating_avg": 4.5,
      "reviews_count": 128,
      "is_available": true,
      "last_scraped_at": "2024-01-10T12:00:00Z",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-10T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 245,
    "pages": 11
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `500` - Server error

**Examples:**
```bash
# Get first page
curl http://localhost:3001/api/products

# Filter by category
curl "http://localhost:3001/api/products?category=fiction&limit=12"

# Search
curl "http://localhost:3001/api/products?search=gatsby&sort=rating"

# Pagination
curl "http://localhost:3001/api/products?page=2&limit=50"
```

---

### GET /api/product/:id

Get detailed information about a specific product including reviews.

**Path Parameters:**
- `id` (string, required) - Product MongoDB ObjectId

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "source_id": "wob_12345",
  "source_url": "https://www.worldofbooks.com/product/123",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "price": 8.99,
  "currency": "GBP",
  "image_url": "https://...",
  "isbn": "978-0743273565",
  "publisher": "Scribner",
  "publication_date": "1925-04-10T00:00:00Z",
  "description": "A classic American novel...",
  "specs": {
    "pages": 180,
    "language": "English",
    "format": "Paperback"
  },
  "rating_avg": 4.5,
  "reviews_count": 128,
  "is_available": true,
  "last_scraped_at": "2024-01-10T12:00:00Z",
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "product_id": "507f1f77bcf86cd799439013",
      "author": "John Doe",
      "rating": 5,
      "text": "Amazing book! Highly recommended.",
      "helpful_count": 15,
      "created_at": "2024-01-09T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid product ID
- `404` - Product not found
- `500` - Server error

**Example:**
```bash
curl http://localhost:3001/api/product/507f1f77bcf86cd799439013
```

---

### POST /api/product/:id/refresh

Force refresh product details from World of Books.

**Path Parameters:**
- `id` (string, required) - Product MongoDB ObjectId

**Request Body:** Empty

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "The Great Gatsby",
  "last_scraped_at": "2024-01-10T14:30:00Z",
  ...
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid product ID
- `404` - Product not found
- `500` - Scraping failed

**Example:**
```bash
curl -X POST http://localhost:3001/api/product/507f1f77bcf86cd799439013/refresh
```

**Note:** 
- This endpoint queues a scrape job and returns immediately
- Actual refresh happens asynchronously
- New data available after ~30 seconds

---

## Error Responses

### 400 Bad Request

Invalid query parameters or request body.

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 404 Not Found

Resource not found.

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

Server-side error.

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Pagination Examples

### Fetch 100 products across multiple requests

```javascript
const fetchAll = async () => {
  let page = 1;
  let allProducts = [];
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `http://localhost:3001/api/products?page=${page}&limit=24`
    );
    const data = await response.json();
    
    allProducts = [...allProducts, ...data.data];
    
    hasMore = page < data.pagination.pages;
    page++;
  }

  return allProducts;
};
```

### Infinite scroll implementation

```javascript
const [products, setProducts] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const response = await fetch(
    `http://localhost:3001/api/products?page=${page}&limit=24`
  );
  const data = await response.json();
  
  setProducts([...products, ...data.data]);
  setPage(page + 1);
  setHasMore(page < data.pagination.pages);
};
```

---

## Search Examples

### Full-text search

```bash
# Search by title or author
curl "http://localhost:3001/api/products?search=fitzgerald"
```

### Category filtering

```bash
# Get all products in Fiction category
curl "http://localhost:3001/api/products?category=fiction"

# Combine with search
curl "http://localhost:3001/api/products?category=fiction&search=mystery"
```

### Sorting

```bash
# Cheapest first
curl "http://localhost:3001/api/products?sort=price-asc"

# Most expensive first
curl "http://localhost:3001/api/products?sort=price-desc"

# Highest rated
curl "http://localhost:3001/api/products?sort=rating"

# Most recently scraped
curl "http://localhost:3001/api/products?sort=newest"
```

---

## Implementation Examples

### React/React Query

```javascript
import { useQuery } from 'react-query';

function ProductList({ category }) {
  const { data, isLoading, error } = useQuery(
    ['products', category],
    () => 
      fetch(`http://localhost:3001/api/products?category=${category}`)
        .then(r => r.json()),
    { staleTime: 1000 * 60 * 5 } // 5 minutes
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.data.map(product => (
        <div key={product._id}>{product.title}</div>
      ))}
    </div>
  );
}
```

### Plain JavaScript Fetch

```javascript
async function getProducts(category, page = 1) {
  const params = new URLSearchParams({
    category,
    page,
    limit: 24,
  });

  const response = await fetch(
    `http://localhost:3001/api/products?${params}`
  );
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

// Usage
getProducts('fiction', 1).then(data => {
  console.log(data.data);
  console.log(data.pagination);
});
```

### cURL

```bash
# Get navigation
curl http://localhost:3001/api/navigation

# Get product details
curl http://localhost:3001/api/product/507f1f77bcf86cd799439013

# Search products
curl "http://localhost:3001/api/products?search=gatsby&sort=rating"

# Refresh product
curl -X POST http://localhost:3001/api/product/507f1f77bcf86cd799439013/refresh
```

---

## Webhook Examples (Future)

```json
POST /api/webhooks/product-updated

{
  "event": "product.updated",
  "product_id": "507f1f77bcf86cd799439013",
  "timestamp": "2024-01-10T14:30:00Z",
  "changes": {
    "price": {
      "old": 9.99,
      "new": 7.99
    },
    "is_available": {
      "old": true,
      "new": false
    }
  }
}
```

---

## Rate Limiting Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1641818400
```

---

## Caching Strategy

Responses are cached based on:

- **Database:** Indefinite (until manual refresh)
- **Frontend (React Query):** 5 minutes
- **Browser:** No cache headers (avoid client cache issues)

Force refresh:

```bash
# Backend cache (rescrape)
POST /api/product/:id/refresh

# Frontend cache (React Query)
queryClient.invalidateQueries('products')
```

---

## Changelog

### v1.0.0 (2024-01-10)
- Initial release
- Navigation, Category, Product endpoints
- Full-text search
- Pagination
- Sorting

### Future (v1.1.0)
- JWT authentication
- User wishlists
- Product reviews API
- Advanced filters
- Webhooks
- GraphQL endpoint

---

Last updated: 2024-01-10
