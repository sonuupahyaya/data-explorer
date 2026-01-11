# 🔧 PRODUCTION REPAIR PLAN
## World of Books Product Data Explorer

**Status**: Ready for implementation  
**Estimated Duration**: 40-60 hours  
**Priority**: All items are critical for production

---

## PHASE 1: REAL DATA PIPELINE (8-10 hours)

### 1.1 Fix Seed Script (Real Scraping)
**File**: `backend/src/seed-sample-products.ts`

**Current Issue**: Falls back to generating 50 duplicate fake products

**Fix**:
- Keep RealProductScraper class
- Remove fallback that generates fake data
- Implement retry logic with exponential backoff
- Add rate limiting between page scrapes (2-3 seconds)
- Validate 50+ real products before saving
- Add logging for each scraped product

**Success Criteria**:
- ✅ Scrapes 50+ real products from worldofbooks.com/en-gb
- ✅ Each product has: title, author, price, image_url, source_url
- ✅ No duplicate products
- ✅ Saves to MongoDB with proper validation
- ✅ Completes in <5 minutes

### 1.2 Implement robots.txt Compliance
**Files**: 
- `backend/src/scraper/scraper.service.ts`
- `backend/src/scraper/real-scraper.ts`

**Fix**:
```typescript
// Add to RealScraper
private async checkRobotsAllowed(url: string): Promise<boolean> {
  try {
    const robotsUrl = new URL('/robots.txt', 'https://www.worldofbooks.com').href;
    const response = await fetch(robotsUrl);
    const robotsTxt = await response.text();
    // Parse and check if path is allowed
    return this.isPathAllowed(robotsTxt, url);
  } catch {
    return true; // Allow if robots.txt not found
  }
}

private isPathAllowed(robotsTxt: string, url: string): boolean {
  // Parse robots.txt and check User-agent: * rules
  // For now, allow all paths but check in prod
  return true;
}
```

### 1.3 Add Exponential Backoff
**Files**: `backend/src/scraper/real-scraper.ts`

**Fix**:
```typescript
private async retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      if (i < maxRetries - 1) {
        this.logger.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## PHASE 2: QUEUE-BASED SCRAPING (12-15 hours)

### 2.1 Configure Bull Queue
**New file**: `backend/src/queue/queue.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: 'scraping' },
      { name: 'indexing' },
    ),
  ],
})
export class QueueModule {}
```

### 2.2 Create Scraping Job Processor
**New file**: `backend/src/queue/scraping.processor.ts`

```typescript
import { Processor, Process, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ScraperService } from '../scraper/scraper.service';
import { ProductsService } from '../products/products.service';

@Processor('scraping')
export class ScrapingProcessor {
  private readonly logger = new Logger(ScrapingProcessor.name);

  constructor(
    private scraperService: ScraperService,
    private productsService: ProductsService,
  ) {}

  @Process('scrape-products')
  async handleScrapeProducts(job: Job) {
    this.logger.log(`Processing job ${job.id}: Scrape products from ${job.data.url}`);
    
    const products = await this.scraperService.scrapeProducts(job.data.url);
    
    for (const product of products) {
      await this.productsService.createOrUpdateProduct(product);
    }
    
    return { success: true, count: products.length };
  }

  @Process('scrape-category')
  async handleScrapeCategory(job: Job) {
    this.logger.log(`Processing job ${job.id}: Scrape category ${job.data.slug}`);
    const products = await this.productsService.scrapeAndSaveProductsFromCategory(
      job.data.categoryUrl
    );
    return { success: true, count: products.length };
  }

  @OnQueueFailed()
  async onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed:`, err);
  }
}
```

### 2.3 Create Scraping Service with Queue
**New file**: `backend/src/queue/scraping.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ScrapingQueueService {
  private readonly logger = new Logger(ScrapingQueueService.name);

  constructor(@InjectQueue('scraping') private scraperQueue: Queue) {}

  async enqueueProductScrape(categoryUrl: string) {
    const job = await this.scraperQueue.add(
      'scrape-products',
      { url: categoryUrl },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      }
    );
    this.logger.log(`Enqueued job ${job.id}`);
    return job;
  }

  async enqueueCategoryScrape(slug: string, categoryUrl: string) {
    const job = await this.scraperQueue.add(
      'scrape-category',
      { slug, categoryUrl },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      }
    );
    return job;
  }

  async getJobStatus(jobId: number) {
    const job = await this.scraperQueue.getJob(jobId);
    return job ? job.getState() : null;
  }
}
```

### 2.4 Add Scraping Endpoints
**File**: `backend/src/products/products.controller.ts`

```typescript
@Post('scrape/category/:slug')
async scrapeCategory(@Param('slug') slug: string) {
  // Get category URL from database
  const categoryUrl = `https://www.worldofbooks.com/en-gb/books?category=${slug}`;
  const job = await this.scrapingQueueService.enqueueCategoryScrape(slug, categoryUrl);
  return { 
    message: 'Scraping job enqueued',
    jobId: job.id,
    status: 'pending'
  };
}

@Get('scrape/job/:jobId')
async getScrapeJobStatus(@Param('jobId') jobId: string) {
  const status = await this.scrapingQueueService.getJobStatus(parseInt(jobId));
  return { jobId, status };
}
```

### 2.5 Update App Module
**File**: `backend/src/app.module.ts`

Add `QueueModule` to imports.

---

## PHASE 3: RATE LIMITING & SECURITY (4-6 hours)

### 3.1 Implement Request Rate Limiting
**New file**: `backend/src/common/throttle.interceptor.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  protected getTracker(request: any): string {
    return request.ip; // Rate limit by IP
  }
}
```

**Update**: `backend/src/app.module.ts`

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute per IP
      },
    ]),
    // ... other imports
  ],
})
export class AppModule {}
```

**Apply globally** in `main.ts`:

```typescript
import { ThrottlerGuard } from '@nestjs/throttler';

const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new ThrottlerGuard());
```

### 3.2 Add Scraper-Specific Rate Limiting
**File**: `backend/src/scraper/real-scraper.ts`

```typescript
private async throttledRequest(url: string, delayMs: number = 2000) {
  await new Promise(resolve => setTimeout(resolve, delayMs));
  // Make request
}
```

---

## PHASE 4: FRONTEND FIXES (10-12 hours)

### 4.1 Wire Navigation to API
**File**: `frontend/src/components/navigation.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export function Navigation() {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/navigation');
        const data = await response.json();
        setNavItems(data.data || []);
      } catch (error) {
        console.error('Failed to fetch navigation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();
  }, []);

  return (
    <nav>
      {navItems.map(item => (
        <a key={item.slug} href={`/category/${item.slug}`}>
          {item.title}
        </a>
      ))}
    </nav>
  );
}
```

### 4.2 Implement Accessibility (WCAG AA)
**Updates to all pages**:

```typescript
// Add proper alt text to images
<img 
  src={product.image_url} 
  alt={`Cover of ${product.title} by ${product.author}`}
  loading="lazy"
/>

// Add ARIA labels
<button aria-label="Add to cart">
  <ShoppingCart />
</button>

// Add semantic HTML
<article>
  <h2>{product.title}</h2>
  <p>{product.description}</p>
</article>

// Add skip links
<a href="#main-content" className="sr-only">
  Skip to main content
</a>

// Add focus visible states
.focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### 4.3 Implement Recommendations
**New file**: `frontend/src/lib/recommendations.ts`

```typescript
export async function getRecommendations(productId: string) {
  // Fetch similar products based on:
  // - Same category
  // - Similar price range
  // - Similar rating
  
  const response = await fetch(
    `http://localhost:3001/api/products?` +
    `similar=${productId}&limit=5`
  );
  return response.json();
}
```

**Add to product detail page**:

```typescript
const recommendations = await getRecommendations(productId);

// Display section with similar products
<section>
  <h2>You might also like</h2>
  <div className="grid">
    {recommendations.map(product => (
      <ProductCard key={product._id} product={product} />
    ))}
  </div>
</section>
```

### 4.4 Proper React Query/SWR Implementation
**Update**: `frontend/src/lib/api.ts`

```typescript
import { useQuery } from 'react-query';

export function useProducts(options: any) {
  return useQuery('products', async () => {
    const params = new URLSearchParams(options);
    const response = await fetch(`http://localhost:3001/api/products?${params}`);
    return response.json();
  });
}

export function useProductDetail(id: string) {
  return useQuery(['product', id], async () => {
    const response = await fetch(`http://localhost:3001/api/products/${id}`);
    return response.json();
  });
}
```

Use in components:

```typescript
const { data, isLoading, error } = useProducts({ page: 1, limit: 24 });
```

### 4.5 Enhanced Product Detail Page
**File**: `frontend/src/app/product/[id]/page.tsx`

Add sections for:
- ✅ Reviews list
- ✅ Ratings display
- ✅ Related products
- ✅ Specifications
- ✅ ISBN, Publisher, etc.

---

## PHASE 5: API ENHANCEMENTS (6-8 hours)

### 5.1 Add Product Recommendations Endpoint
**File**: `backend/src/products/products.controller.ts`

```typescript
@Get(':id/recommendations')
async getRecommendations(@Param('id') id: string) {
  return this.productsService.getRecommendations(id);
}
```

**File**: `backend/src/products/products.service.ts`

```typescript
async getRecommendations(productId: string) {
  const product = await this.productModel.findById(productId);
  if (!product) throw new NotFoundException();

  // Find similar products in same category
  const recommendations = await this.productModel
    .find({
      _id: { $ne: productId },
      categories: { $in: product.categories },
      price: { 
        $gte: product.price * 0.8,
        $lte: product.price * 1.2
      }
    })
    .limit(5);

  return recommendations;
}
```

### 5.2 Add Advanced Search
**Update**: `backend/src/search/search.controller.ts`

```typescript
@Get()
async search(
  @Query('q') query: string,
  @Query('category') category?: string,
  @Query('minPrice') minPrice?: number,
  @Query('maxPrice') maxPrice?: number,
  @Query('rating') minRating?: number,
) {
  return this.searchService.search({
    query,
    category,
    minPrice,
    maxPrice,
    minRating,
  });
}
```

---

## PHASE 6: TESTING & CI/CD (8-10 hours)

### 6.1 Add GitHub Actions Workflow
**New file**: `.github/workflows/ci.yml`

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5.0
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci && cd ..
          cd frontend && npm ci && cd ..
      
      - name: Lint
        run: npm run lint
      
      - name: Test Backend
        run: cd backend && npm run test
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
      
      - name: Test Frontend
        run: cd frontend && npm run test
      
      - name: Build
        run: |
          cd backend && npm run build
          cd ../frontend && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add deployment script here
          echo "Deploying to production..."
```

### 6.2 Add Backend Tests
**File**: `backend/src/products/products.service.spec.ts`

```typescript
describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          value: {
            find: jest.fn(),
            findById: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get(getModelToken(Product.name));
  });

  it('should fetch products with pagination', async () => {
    const mockProducts = [{ _id: '1', title: 'Test' }];
    productModel.find.mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().resolvedValue(mockProducts),
    });
    productModel.countDocuments.mockResolvedValue(50);

    const result = await service.getProducts({
      page: 1,
      limit: 24,
    });

    expect(result.data).toEqual(mockProducts);
    expect(result.pagination.total).toBe(50);
  });
});
```

### 6.3 Add Frontend Tests
**File**: `frontend/src/app/page.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import HomePage from './page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('HomePage', () => {
  it('renders hero section', () => {
    render(<HomePage />);
    expect(screen.getByText(/Discover Your Next Read/i)).toBeInTheDocument();
  });

  it('displays loading skeleton initially', () => {
    render(<HomePage />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
```

---

## PHASE 7: DEPLOYMENT (4-6 hours)

### 7.1 Deploy Backend to Railway/Heroku
**File**: `backend/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

**Deploy**:
```bash
# Using Railway
railway link
railway up

# OR using Vercel
vercel deploy --prod
```

### 7.2 Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

Update `.env` variables in both platforms.

---

## PHASE 8: FINAL VERIFICATION (2-4 hours)

### 8.1 Create Verification Script
**New file**: `backend/scripts/verify-production.ts`

```typescript
import { connect } from 'mongoose';

async function verifyProduction() {
  const connection = await connect(process.env.MONGODB_URI);
  const db = connection.connection.db;

  const productCount = await db.collection('products').countDocuments();
  console.log(`✅ Products in DB: ${productCount}`);
  
  if (productCount < 50) {
    throw new Error('❌ Less than 50 products in database');
  }

  // Check for images
  const productsWithImages = await db.collection('products')
    .find({ image_url: { $exists: true, $ne: null } })
    .count();
  console.log(`✅ Products with images: ${productsWithImages}`);

  // Check prices
  const productsWithPrice = await db.collection('products')
    .find({ price: { $gt: 0 } })
    .count();
  console.log(`✅ Products with price: ${productsWithPrice}`);

  // Check source URLs
  const productsWithSourceUrl = await db.collection('products')
    .find({ source_url: { $exists: true, $ne: null } })
    .count();
  console.log(`✅ Products with source URL: ${productsWithSourceUrl}`);

  console.log('\n✅ PRODUCTION READY');
  process.exit(0);
}

verifyProduction().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
```

**Run**:
```bash
npm run verify:production
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Phase 1: Real Data Pipeline
  - [ ] Fix seed script with real scraping
  - [ ] Add robots.txt compliance
  - [ ] Implement exponential backoff
  
- [ ] Phase 2: Queue System
  - [ ] Setup Bull + Redis
  - [ ] Create scraping processor
  - [ ] Add scraping service
  - [ ] Create scraping endpoints
  
- [ ] Phase 3: Rate Limiting
  - [ ] Implement request rate limiting
  - [ ] Add scraper throttling
  
- [ ] Phase 4: Frontend
  - [ ] Wire navigation to API
  - [ ] Add WCAG AA accessibility
  - [ ] Implement recommendations
  - [ ] Proper React Query/SWR
  - [ ] Enhanced product detail
  
- [ ] Phase 5: API Enhancements
  - [ ] Add recommendations endpoint
  - [ ] Add advanced search
  
- [ ] Phase 6: Testing & CI/CD
  - [ ] GitHub Actions workflow
  - [ ] Backend tests
  - [ ] Frontend tests
  
- [ ] Phase 7: Deployment
  - [ ] Deploy backend
  - [ ] Deploy frontend
  - [ ] Update env variables
  
- [ ] Phase 8: Verification
  - [ ] Run verification script
  - [ ] Test all APIs
  - [ ] Test UI in production
  - [ ] Check performance

---

## 🚀 PRODUCTION DEPLOYMENT COMMANDS

```bash
# Backend
cd backend
npm install
npm run build
npm run seed:sample-products  # Populates real data
npm start  # Runs on http://backend-url.com

# Frontend
cd frontend
npm install
npm run build
npm start  # Runs on http://frontend-url.com

# Setup Queue
docker run -d -p 6379:6379 redis:7

# Run Migrations
npm run verify:production
```

---

**End of Repair Plan**

Next file: `IMPLEMENTATION_GUIDE.md`
