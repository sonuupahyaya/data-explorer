# World of Books Discovery Platform - Frontend

Production-ready Next.js frontend for the World of Books discovery platform.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR with React Query support
- **Image Optimization**: Next.js Image
- **Accessibility**: WCAG AA compliant

## Architecture

```
frontend/src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── providers.tsx        # SWR/Context providers
│   ├── page.tsx             # Home page
│   ├── search/              # Search page
│   ├── product/             # Product detail pages
│   ├── category/            # Category pages
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   └── readme/              # README page
├── components/              # Reusable components
│   ├── Header.tsx          # Navigation header
│   ├── Footer.tsx          # Footer
│   ├── SearchBar.tsx       # Search input
│   └── SkeletonLoader.tsx  # Loading states
├── lib/                     # Utilities and hooks
│   ├── api.ts              # API client
│   ├── hooks.ts            # Custom React hooks
│   └── utils.ts            # Helper functions
└── styles/                  # Global styles
    └── globals.css         # Tailwind imports
```

## Key Features

### 🎨 User Interface

- **Responsive Design** - Mobile-first, works on all devices
- **Skeleton Loaders** - Smooth loading states
- **Optimistic Updates** - Immediate UI feedback
- **Smooth Transitions** - CSS animations for better UX
- **Dark Mode Ready** - Can be extended with dark theme

### 🔍 Search & Discovery

- **Full-Text Search** - Powered by backend API
- **Autocomplete** - Real-time suggestions
- **Filters** - Price, rating, author filters
- **Sorting** - Multiple sort options
- **Pagination** - Efficient result browsing

### 📊 Product Pages

- **Detailed Views** - Full product information
- **Image Gallery** - Multiple product images
- **Reviews** - Customer ratings and reviews
- **Recommendations** - Similar product suggestions
- **Share Options** - Social sharing buttons

### 💾 Data Management

- **SWR Caching** - Intelligent client-side caching
- **Local Storage** - Browser-based history
- **User Sessions** - Anonymous session tracking
- **Analytics Ready** - Setup for Google Analytics

### ♿ Accessibility

- **WCAG AA** - Level AA compliance
- **Keyboard Navigation** - Full keyboard support
- **Screen Readers** - Proper semantic HTML
- **Color Contrast** - WCAG compliant colors
- **Focus Management** - Clear focus indicators

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
# or
yarn install
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=24
```

### Development

```bash
npm run dev
# Server runs on http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## API Integration

### API Client (`lib/api.ts`)

Centralized API communication with error handling:

```typescript
// Usage
import api from '@/lib/api';

const navigation = await api.navigation.getAll();
const products = await api.products.list({ category: 'fiction', page: 1 });
const results = await api.search.query('book title');
```

### Custom Hooks (`lib/hooks.ts`)

React hooks for common operations with SWR caching:

```typescript
// Navigation
const { navigation, isLoading, error } = useNavigation();

// Products
const { products, pagination, isLoading } = useProducts({ 
  category: 'fiction', 
  page: 1 
});

// Search
const { results, isLoading, error } = useSearch('query');

// History
const { history, recordView } = useHistory();
```

## Components

### Header

Navigation with search integration.

### SearchBar

Real-time search with autocomplete suggestions.

### SkeletonLoader

Loading placeholders for smoother UX.

### Footer

Navigation and links footer.

## Utilities (`lib/utils.ts`)

Helper functions for common tasks:

```typescript
formatPrice(100, 'GBP')           // "£100.00"
formatDate(new Date())            // "11 Jan 2024"
formatRelativeTime(dateString)   // "2 hours ago"
truncate(text, 100)              // Truncate with ellipsis
slugify(text)                    // "hello-world"
deslugify('hello-world')        // "Hello World"

// Local Storage
storage.get('key')
storage.set('key', 'value')
storage.getJSON('key')
storage.setJSON('key', object)

// Browsing History
getBrowsingHistory()
addToBrowsingHistory(productId)
clearBrowsingHistory()
```

## Pages

### Home Page (`app/page.tsx`)

- Navigation browsing
- Popular products
- Feature highlights
- Quick search

### Search Page (`app/search/page.tsx`)

- Full-text search results
- Filtering options
- Sorting
- Pagination

### Product Detail (`app/product/[id]/page.tsx`)

- Product information
- Images and specs
- Customer reviews
- Recommendations

### Category Page (`app/category/[slug]/page.tsx`)

- Products in category
- Subcategory browsing
- Filtering
- Sorting

### About Page (`app/about/page.tsx`)

- Platform information
- Features overview
- Technology stack
- How it works

### Contact Page (`app/contact/page.tsx`)

- Contact form
- Email contact
- Bug reporting
- Feature requests

### README Page (`app/readme/page.tsx`)

- Full documentation
- Setup instructions
- Architecture overview
- Usage examples

## Performance Optimization

### Image Optimization

```typescript
<Image
  src={url}
  alt={title}
  fill
  className="object-cover"
/>
```

### Data Fetching

- SWR for caching and revalidation
- Automatic deduplication
- Background refresh
- Error boundaries

### Code Splitting

Next.js automatic code splitting via App Router.

### Lazy Loading

Dynamic imports for heavy components:

```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

## Testing

```bash
npm test              # Run tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
```

## Build & Deployment

### Docker

```bash
docker build -t wob-frontend .
docker run -p 3000:3000 wob-frontend
```

### Vercel

```bash
vercel deploy
```

### Manual Deployment

```bash
npm run build
# Deploy the `.next` directory
```

## Environment Variables

### Public (Accessible in Browser)

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_API_TIMEOUT` - Request timeout
- `NEXT_PUBLIC_DEFAULT_PAGE_SIZE` - Pagination size
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID (optional)

### Private (Server Only)

```bash
# Can be used in API routes but not in browser
SECRET_KEY=value
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader support
- Skip links (can be added)

## Performance Metrics

- Lighthouse Score: 85+
- Core Web Vitals: Good
- First Paint: < 1s
- Time to Interactive: < 2s

## State Management

We use a minimal state management approach:

- **SWR**: For server state (data fetching, caching)
- **React Hooks**: For local UI state
- **Local Storage**: For persistent browser state
- **URL Params**: For navigation state

## Error Handling

All API errors are caught and handled gracefully:

```typescript
try {
  const data = await api.products.list();
} catch (error) {
  console.error('Error:', error.message);
  // Show user-friendly error message
}
```

## Contributing

When adding new features:

1. Create components in `components/`
2. Add hooks in `lib/hooks.ts`
3. Add utilities in `lib/utils.ts`
4. Add pages in `app/`
5. Follow TypeScript best practices
6. Test in all browsers
7. Check accessibility

## License

MIT
