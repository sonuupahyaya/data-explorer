# World of Books Discovery Platform - Production Ready Frontend

A modern, fully-featured book discovery platform built with Next.js 14, TypeScript, and Tailwind CSS. The frontend aggregates and displays real-time book data from World of Books in a beautiful, responsive interface.

## 🚀 Features

### ✨ Core Features
- **Home Page**: Hero section, featured books, category shortcuts
- **Search**: Full-text search with real-time results
- **Category Browsing**: Browse by category with subcategories
- **Product Details**: Comprehensive product pages with ratings, reviews, specifications
- **Pagination**: Smart pagination across search and category results
- **Favorites**: Save favorite books to localStorage
- **Browsing History**: Automatic tracking of viewed products and categories
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode Ready**: Built with accessibility in mind (WCAG AA)

### 🎨 UI/UX
- **WorldOfBooks-style design**: Clean, modern interface inspired by worldofbooks.com
- **Smooth animations**: Transitions and hover effects throughout
- **Skeleton loading**: Loading states while data fetches
- **Error handling**: Graceful error messages and fallbacks
- **Performance optimized**: Image optimization, lazy loading, code splitting

### 🧠 Data Management
- **SWR-based caching**: Client-side caching with stale-while-revalidate
- **Smart revalidation**: Automatic cache refresh on focus
- **Deduplication**: Prevents duplicate API calls
- **Pagination support**: Infinite scroll or page-based navigation
- **Filtering & Sorting**: Sort by price, rating, newest

### 🔌 API Integration
The frontend consumes these backend APIs (no changes needed):
- `GET /api/navigation` - Get all categories
- `GET /api/navigation/:slug` - Get subcategories
- `GET /api/products` - List products with pagination, filtering, sorting
- `GET /api/product/:id` - Get product details with reviews
- `POST /api/product/:id/refresh` - Refresh product data
- `GET /api/image?url=` - Image proxy for World of Books images

### 💾 Data Persistence
All data persists locally via localStorage:
- User browsing history (up to 50 items)
- Last visited category
- Viewed products (up to 20)
- Favorite products

## 📋 Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with Navbar & Footer
│   │   ├── page.tsx                  # Home page
│   │   ├── search/
│   │   │   └── page.tsx              # Search results page
│   │   ├── category/
│   │   │   └── [slug]/page.tsx       # Category page with products
│   │   ├── product/
│   │   │   └── [id]/page.tsx         # Product detail page
│   │   └── about/
│   │       └── page.tsx              # About & documentation page
│   ├── components/
│   │   ├── Navbar.tsx                # Navigation bar with search
│   │   ├── Footer.tsx                # Footer with links
│   │   ├── ProductCard.tsx           # Product card component
│   │   └── SkeletonCard.tsx          # Loading skeleton
│   ├── lib/
│   │   ├── api.ts                    # API client functions
│   │   ├── hooks.ts                  # Custom React hooks (SWR)
│   │   └── storage.ts                # localStorage utilities
│   └── styles/
│       └── globals.css               # Tailwind CSS styles
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies & scripts
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router & SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **SWR** - Data fetching with caching and revalidation
- **Lucide React** - Beautiful icons
- **Next/Image** - Optimized image component

### Environment
- **Node.js 18+** - JavaScript runtime
- **npm or yarn** - Package manager

## 📦 Installation & Setup

### 1. Clone and Navigate
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=World of Books Discovery
```

**For Production (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### 4. Run Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
npm start
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Import your repository
   - Set environment variables in Settings → Environment Variables

3. **Deploy**
   ```bash
   # Automatic on push, or manually via Vercel dashboard
   ```

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Upload the `.next` directory and `public` folder
```

**Docker:**
```bash
docker build -t world-of-books-frontend .
docker run -p 3000:3000 world-of-books-frontend
```

**Traditional Server (VPS):**
```bash
npm run build
npm start
# Use PM2 or systemd to manage the process
```

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `World of Books Discovery` |

> Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets here.

## 📚 API Integration

### How Data Flows

```
User Action (Search/Browse)
    ↓
Frontend Component
    ↓
SWR Hook (useProducts, useProduct, etc.)
    ↓
API Client (lib/api.ts)
    ↓
Fetch from Backend
    ↓
SWR Cache & Revalidation
    ↓
Display in Component
```

### Example: Fetching Products

```typescript
import { useProducts } from '@/lib/hooks';

function ProductList() {
  const { products, pagination, isLoading, error } = useProducts(
    1,                    // page
    24,                   // limit
    'fiction',           // category filter
    'gatsby',            // search query
    'rating'             // sort: 'newest' | 'price-asc' | 'price-desc' | 'rating'
  );

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product._id} {...product} />
      ))}
    </div>
  );
}
```

### Image Handling

All images are proxied through the backend for security:

```typescript
import { getImageUrl } from '@/lib/api';

// Automatically uses proxy for worldofbooks.com images
const imageUrl = getImageUrl(product.image_url);
```

## 🎨 Customization

### Colors & Branding

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* your colors */ },
      accent: { /* your colors */ },
    },
  },
}
```

### Logo & Branding

Update in `src/components/Navbar.tsx`:
```typescript
// Change the logo icon and text
<BookOpen className="w-5 h-5 text-white" />
<span>Your Brand</span>
```

### API Endpoint

Update in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-custom-api.com/api
```

## 🔒 Security

- ✅ **No sensitive data in localStorage** - Only browsing history and favorites
- ✅ **HTTPS/TLS in production** - Always use HTTPS
- ✅ **CORS configured** - Backend should whitelist frontend domain
- ✅ **XSS protection** - React's built-in escaping prevents injection
- ✅ **Input validation** - Search queries are sanitized
- ✅ **Image proxy** - All external images proxied through backend

## 📊 Performance Optimization

### Built-in Optimizations
- **Code splitting** - Pages loaded on demand
- **Image optimization** - Next.js Image component with lazy loading
- **CSS-in-JS** - Tailwind's purge removes unused styles
- **Caching** - SWR handles intelligent caching
- **Revalidation** - Smart cache invalidation

### Monitoring
- Next.js Analytics (with Vercel)
- Web Vitals monitoring
- Error tracking (setup Sentry or similar)

## 🧪 Testing & Quality

### Run Linter
```bash
npm run lint
```

### Build Check
```bash
npm run build
```

### Development
```bash
npm run dev
```

## 📖 Pages Documentation

### Home Page (`/`)
- Hero section with featured books
- Category grid (6 popular categories)
- Featured books section (20 items)
- Info/benefits section

### Search Page (`/search?q=query`)
- Search results grid
- Sorting options (newest, price, rating)
- Pagination controls
- Empty state handling

### Category Page (`/category/[slug]`)
- Category title
- Related subcategories
- Product grid with pagination
- Sorting options

### Product Detail Page (`/product/[id]`)
- Large product image
- Title, author, price, rating
- Product specs (ISBN, publisher, pages, format)
- Full description
- Customer reviews (up to 5 displayed)
- Similar/related books carousel
- Add to favorites button
- View on World of Books link

### About Page (`/about`)
- Project overview
- Features list
- Tech stack
- How it works (4-step process)
- Data source attribution
- Open source info
- CTA buttons

## 🐛 Troubleshooting

### "API connection error"
- Check backend is running on `http://localhost:3001`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS headers from backend

### "Images not loading"
- Image proxy needs to be working on backend
- Check image URLs from API response
- Verify image proxy endpoint: `/api/image?url=`

### "Slow performance"
- Check network tab in DevTools
- Enable React DevTools Profiler
- Review SWR cache settings

### "localStorage errors"
- Clear browser cache: `localStorage.clear()`
- Check browser privacy settings
- Use Incognito mode to test

## 📞 Support & Contributing

### Report Issues
1. Check existing issues on GitHub
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots
   - Browser/device info

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is open source. See LICENSE file for details.

## 🔗 Links

- **Live Demo**: [Your deployed URL]
- **GitHub**: https://github.com/sonuupahyaya/data-explorer
- **Backend API**: http://localhost:3001/api/docs
- **World of Books**: https://www.worldofbooks.com

## 🎯 Roadmap

- [ ] User accounts & wishlist sync
- [ ] Advanced filtering (price range, language, format)
- [ ] Reviews/ratings submission
- [ ] Dark mode toggle
- [ ] Social sharing
- [ ] Email notifications for price drops
- [ ] Recommended books algorithm
- [ ] Read list/collection creation
- [ ] GraphQL API endpoint
- [ ] Mobile app (React Native)

## 📝 Notes

- Backend must be running for the frontend to work
- Images are proxied through the image proxy service
- All data comes from World of Books scraping
- Respect World of Books terms of service
- This is a demonstration project for educational purposes

---

**Built with ❤️ using Next.js, React, and Tailwind CSS**
