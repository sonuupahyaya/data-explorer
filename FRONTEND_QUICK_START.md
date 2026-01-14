# 🚀 Frontend - Quick Start

Your frontend has been **completely rebuilt** - clean, modern, production-ready.

## ⚡ Get Running in 2 Minutes

### 1. Setup Environment
```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Install & Run
```bash
npm install
npm run dev
```

Open **http://localhost:3000** ✅

## 📚 What You Have

| Page | Route | Feature |
|------|-------|---------|
| Home | `/` | Hero, categories, featured books |
| Browse | `/category/[slug]` | Category browsing with pagination |
| Product | `/product/[id]` | Full details, ratings, recommendations |
| Search | `/search?q=...` | Full-text search |
| About | `/about` | Company info |
| Contact | `/contact` | Contact form |
| Info | `/readme` | Technical docs |

## 🎨 Tech Stack (Clean)

```
Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS (styling only)
├── SWR (data fetching)
└── Axios (HTTP client)
```

**No other UI frameworks. No inline CSS. No external UI kits.**

## 🔧 Available Commands

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Check TypeScript/ESLint
npm test         # Run tests
```

## 📦 File Structure

```
src/
├── app/                 # Pages
│   ├── page.tsx        # Home
│   ├── layout.tsx      # Layout
│   ├── globals.css     # Styles
│   ├── category/[slug] # Category
│   ├── product/[id]    # Product
│   ├── search          # Search
│   └── ...             # Other pages
├── components/         # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── ...
└── lib/                # Utilities
    ├── api.ts          # API client
    └── storage.ts      # LocalStorage
```

## 🔌 Backend APIs Used

```
GET /api/categories
GET /api/books?category=x&limit=y&offset=z
GET /api/book/:id
GET /api/image?url=base64
```

No backend changes needed.

## ✨ Key Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Skeleton loaders while loading
- ✅ Browsing history (persisted)
- ✅ Search functionality
- ✅ WCAG AA accessible
- ✅ Fast & smooth
- ✅ Production-ready

## 🚨 If Something Breaks

1. **Images not loading?**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure backend is running
   - Check network tab in browser DevTools

2. **API errors?**
   - Verify backend is running on correct port
   - Check CORS settings on backend
   - Inspect browser console

3. **Build fails?**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

## 📖 Full Documentation

See:
- `frontend/README.md` - Detailed guide
- `FRONTEND_REBUILD_COMPLETE.md` - Complete rebuild info

## 🎯 What's Inside

### Pages
- **Home**: Hero section, category shortcuts, featured books, browsing history
- **Category**: Filter, pagination, load more
- **Product**: Images, price, rating, metadata, recommendations
- **Search**: Real-time results
- **About**: Company info
- **Contact**: Contact form
- **Info**: Technical documentation

### Components
- **Header**: Sticky nav with mobile menu
- **Footer**: Links and info
- **ProductCard**: Book card with image, price, rating
- **ProductGrid**: Responsive grid (1-4 columns)
- **SearchBar**: Search input
- **SkeletonCard**: Loading state
- **ErrorState**: Error handling

## 🎬 Example Workflow

1. Visit home page
2. Click category or use search
3. Browse products with pagination
4. Click product for details
5. See recommendations
6. History persists on reload

## 📊 Performance

- Build size: ~131 kB first load
- No external CSS frameworks
- Optimized images
- Fast SWR caching

## 🎉 You're Ready!

Everything is clean, modern, and production-ready. Just run it!

```bash
npm run dev
# Visit http://localhost:3000
```

---

**Need help?** See `frontend/README.md` or check `/readme` page in the app.
