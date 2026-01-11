# Project Structure

Complete file structure of the World of Books Discovery Platform.

```
data explorer/
│
├── .github/
│   └── workflows/
│       └── ci.yml                         # GitHub Actions CI/CD pipeline
│
├── backend/                               # NestJS Backend Server
│   ├── src/
│   │   ├── main.ts                       # Application entry point
│   │   ├── app.module.ts                 # Root NestJS module
│   │   │
│   │   ├── database/
│   │   │   └── database.module.ts        # MongoDB connection setup
│   │   │
│   │   ├── schemas/
│   │   │   ├── navigation.schema.ts      # Navigation headings schema
│   │   │   ├── category.schema.ts        # Categories schema
│   │   │   ├── product.schema.ts         # Products schema
│   │   │   ├── review.schema.ts          # Product reviews schema
│   │   │   ├── scrape-job.schema.ts      # Web scraping jobs schema
│   │   │   └── view-history.schema.ts    # User view history schema
│   │   │
│   │   ├── navigation/
│   │   │   ├── navigation.module.ts      # Navigation module
│   │   │   ├── navigation.controller.ts  # Navigation API endpoints
│   │   │   ├── navigation.service.ts     # Navigation business logic
│   │   │   └── navigation.service.spec.ts # Unit tests
│   │   │
│   │   ├── products/
│   │   │   ├── products.module.ts        # Products module
│   │   │   ├── products.controller.ts    # Products API endpoints
│   │   │   ├── products.service.ts       # Products business logic
│   │   │   └── products.service.spec.ts  # Unit tests
│   │   │
│   │   ├── scraper/
│   │   │   └── scraper.service.ts        # Crawlee + Playwright scraper
│   │   │
│   │   └── cli/
│   │       └── scrape-navigation.ts      # CLI tools for manual scraping
│   │
│   ├── dist/                             # Compiled JavaScript (generated)
│   ├── coverage/                         # Test coverage reports (generated)
│   ├── node_modules/                     # Dependencies (generated)
│   │
│   ├── package.json                      # Backend dependencies & scripts
│   ├── package-lock.json                 # Dependency lock file
│   ├── tsconfig.json                     # TypeScript configuration
│   ├── jest.config.js                    # Test configuration
│   ├── Dockerfile                        # Docker image specification
│   └── .env.example                      # Environment variables template
│
├── frontend/                              # Next.js Frontend Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── _app.tsx                 # App wrapper with React Query setup
│   │   │   ├── index.tsx                # Home page with navigation
│   │   │   │
│   │   │   ├── category/
│   │   │   │   └── [slug].tsx           # Category & products page
│   │   │   │
│   │   │   ├── product/
│   │   │   │   └── [id].tsx             # Product detail page
│   │   │   │
│   │   │   ├── about.tsx                # About page
│   │   │   ├── contact.tsx              # Contact form page
│   │   │   └── readme.tsx               # System documentation page
│   │   │
│   │   ├── components/
│   │   │   ├── Header.tsx               # Navigation header component
│   │   │   ├── ProductCard.tsx          # Product card component
│   │   │   └── SkeletonLoader.tsx       # Loading skeleton components
│   │   │
│   │   ├── lib/
│   │   │   └── api.ts                   # API client with axios
│   │   │
│   │   └── styles/
│   │       └── globals.css              # Global Tailwind CSS styles
│   │
│   ├── public/                           # Static assets (future)
│   ├── node_modules/                     # Dependencies (generated)
│   ├── .next/                            # Build output (generated)
│   │
│   ├── package.json                      # Frontend dependencies & scripts
│   ├── package-lock.json                 # Dependency lock file
│   ├── tsconfig.json                     # TypeScript configuration
│   ├── jest.config.js                    # Test configuration
│   ├── jest.setup.js                     # Jest setup file
│   ├── next.config.js                    # Next.js configuration
│   ├── tailwind.config.js                # Tailwind CSS configuration
│   ├── postcss.config.js                 # PostCSS configuration
│   ├── Dockerfile                        # Docker image specification
│   └── .env.example                      # Environment variables template
│
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI pipeline
│
├── .gitignore                            # Git ignore rules
├── .env.example                          # Root environment template
├── docker-compose.yml                    # Docker Compose configuration
│
├── README.md                             # Main project documentation
├── SETUP.md                              # Setup & installation guide
├── DEPLOYMENT.md                         # Production deployment guide
├── API_DOCS.md                           # Complete API documentation
└── PROJECT_STRUCTURE.md                  # This file
```

## File Descriptions

### Root Level

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `SETUP.md` | Setup and installation instructions |
| `DEPLOYMENT.md` | Production deployment guide |
| `API_DOCS.md` | Complete API reference |
| `PROJECT_STRUCTURE.md` | This file |
| `docker-compose.yml` | Multi-container orchestration |
| `.env.example` | Environment variables template |
| `.gitignore` | Git ignore patterns |

### Backend (NestJS + TypeScript)

#### Core Files
- `src/main.ts` - Application bootstrap
- `src/app.module.ts` - Root module with imports
- `package.json` - Dependencies and scripts

#### Database
- `src/database/database.module.ts` - MongoDB Mongoose connection

#### Schemas (Mongoose)
- `src/schemas/navigation.schema.ts` - Navigation items
- `src/schemas/category.schema.ts` - Categories with parent relationships
- `src/schemas/product.schema.ts` - Products with full metadata
- `src/schemas/review.schema.ts` - Product reviews
- `src/schemas/scrape-job.schema.ts` - Scraping job tracking
- `src/schemas/view-history.schema.ts` - User navigation history

#### Modules
- `src/navigation/` - Navigation API endpoints
- `src/products/` - Products API endpoints
- `src/scraper/` - Web scraping engine

#### Configuration
- `tsconfig.json` - TypeScript settings
- `jest.config.js` - Testing framework
- `Dockerfile` - Container image
- `.env.example` - Environment template

### Frontend (Next.js + TypeScript)

#### Pages (File-based Routing)
- `src/pages/_app.tsx` - App wrapper with React Query
- `src/pages/index.tsx` - Home with navigation headings
- `src/pages/category/[slug].tsx` - Category page
- `src/pages/product/[id].tsx` - Product detail page
- `src/pages/about.tsx` - About page
- `src/pages/contact.tsx` - Contact form
- `src/pages/readme.tsx` - Documentation

#### Components
- `src/components/Header.tsx` - Navigation header
- `src/components/ProductCard.tsx` - Product card
- `src/components/SkeletonLoader.tsx` - Loading states

#### Utilities
- `src/lib/api.ts` - Axios API client

#### Styles
- `src/styles/globals.css` - Global Tailwind CSS

#### Configuration
- `tsconfig.json` - TypeScript settings
- `jest.config.js` - Testing setup
- `jest.setup.js` - Jest initialization
- `next.config.js` - Next.js settings
- `tailwind.config.js` - Tailwind CSS theme
- `postcss.config.js` - CSS processing
- `Dockerfile` - Container image
- `.env.example` - Environment template

### CI/CD

- `.github/workflows/ci.yml` - GitHub Actions pipeline
  - Backend tests
  - Frontend tests
  - Linting
  - Docker builds

## Dependencies

### Backend Key Packages
```json
{
  "@nestjs/core": "^10.2.10",
  "@nestjs/mongoose": "^10.0.2",
  "mongoose": "^8.0.3",
  "crawlee": "^3.5.2",
  "playwright": "^1.40.1"
}
```

### Frontend Key Packages
```json
{
  "next": "^14.0.3",
  "react": "^18.2.0",
  "react-query": "^3.39.3",
  "tailwindcss": "^3.3.6"
}
```

## Build Outputs

### Backend
- `dist/` - Compiled JavaScript
- `coverage/` - Test coverage reports

### Frontend
- `.next/` - Next.js build output
- `coverage/` - Test coverage

## Environment Files

### .env (Root)
- `MONGODB_URI` - Database connection
- `API_PORT` - Backend port

### backend/.env
- All backend configuration
- Database settings
- Scraper settings

### frontend/.env
- `NEXT_PUBLIC_API_URL` - Backend URL

## Git Structure

```
main branch
  ↓
  ├─ feature branches
  │  ├─ feature/navigation-api
  │  ├─ feature/product-scraper
  │  └─ feature/ui-improvements
  │
  └─ Pull Requests
     ↓ (GitHub Actions CI)
     ↓ (If passing)
     Merge to main
```

## Docker Structure

```
docker-compose up
  ├─ frontend service (Next.js on :3000)
  ├─ backend service (NestJS on :3001)
  └─ mongodb service (MongoDB on :27017)
```

## Database Collections

```
world_of_books (Database)
├── navigation (Navigation headings)
├── category (Categories & subcategories)
├── product (Books & products)
├── review (Product reviews)
├── scrape_job (Scraping job history)
└── view_history (User navigation tracking)
```

## API Routes

```
/api
├── /navigation
│  ├── GET           (Get all headings)
│  ├── GET /:slug    (Get categories)
│  └── POST /refresh (Refresh navigation)
│
├── /products
│  ├── GET           (List products)
│  ├── GET /:id      (Product detail)
│  └── POST /:id/refresh
│
└── /docs (Swagger documentation)
```

## Development Workflow

```
1. Clone repository
   ↓
2. Install dependencies (npm install)
   ↓
3. Set up MongoDB URI in .env
   ↓
4. Run docker-compose up or npm run dev in each service
   ↓
5. Write code
   ↓
6. Run tests
   ↓
7. Commit and push to feature branch
   ↓
8. Create Pull Request
   ↓
9. GitHub Actions runs CI
   ↓
10. Merge to main (if passing)
```

## File Statistics

| Category | Count |
|----------|-------|
| TypeScript (.ts/.tsx) | ~15 |
| Configuration | ~8 |
| Documentation | 5 |
| Total Files | 100+ |

## Next Files to Create (When Needed)

- `backend/src/cli/scrape-navigation.ts` - CLI script
- `backend/src/queue/` - Bull queue for scraping
- `frontend/src/__tests__/` - Test files
- `frontend/src/hooks/` - Custom React hooks
- `frontend/src/utils/` - Utility functions
- Docker `.dockerignore` files
- `nginx.conf` - Reverse proxy config
- `docker-compose.prod.yml` - Production stack

---

Total estimated files at full completion: ~150
Completion status: MVP (70%)

