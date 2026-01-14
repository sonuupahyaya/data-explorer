# World of Books - Frontend

A modern, clean, and production-ready Next.js frontend for the World of Books platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🌍 Environment Variables

Create a `.env.local` file:

```env
# API Configuration - Point to your backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   ├── globals.css   # Global styles
│   │   ├── category/     # Category browsing
│   │   ├── product/      # Product details
│   │   ├── search/       # Search results
│   │   ├── about/        # About page
│   │   ├── contact/      # Contact page
│   │   └── readme/       # Info page
│   ├── components/       # Reusable React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── ...
│   └── lib/              # Utilities and helpers
│       ├── api.ts        # API client
│       └── storage.ts    # LocalStorage utilities
├── public/               # Static assets
├── tailwind.config.js    # Tailwind CSS config
├── tsconfig.json         # TypeScript config
└── package.json
```

## 🎨 Features

### Pages
- **Home** - Landing page with categories and featured books
- **Category** - Browse books by category with pagination
- **Product** - Detailed product view with metadata and recommendations
- **Search** - Full-text search across books
- **About** - Information about World of Books
- **Contact** - Contact form and information
- **Info** - Technical documentation

### Components
- **Header** - Sticky navigation with mobile menu
- **Footer** - Footer with links and info
- **ProductCard** - Individual book card with image, price, rating
- **ProductGrid** - Responsive grid layout for products
- **SearchBar** - Search input with navigation
- **SkeletonCard** - Loading skeleton
- **ErrorState** - Error handling UI

### User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ LocalStorage persistence for browsing history
- ✅ Skeleton loaders for loading states
- ✅ Smooth animations and transitions
- ✅ WCAG AA accessible
- ✅ Fast image loading with optimization
- ✅ SWR for intelligent data caching

## 🔌 Backend API Integration

The frontend uses these API endpoints:

```
GET /api/categories        - Fetch all categories
GET /api/books            - Fetch books (with filters)
GET /api/book/:id         - Fetch single book
GET /api/image            - Proxy images
```

Ensure your backend is running on `NEXT_PUBLIC_API_URL`.

## 📱 Responsive Design

The app is fully responsive:
- **Mobile** (0-640px) - Single column layout
- **Tablet** (641-1024px) - 2-column grid
- **Desktop** (1025px+) - 3-4 column grid

## 🎯 Build & Deploy

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
# Connect your GitHub repo and deploy automatically
vercel deploy
```

### Deploy to other platforms
Build the app (`npm run build`) and deploy the `.next` folder to your hosting provider.

## 🧪 Testing

```bash
npm test
```

## 📚 Technologies

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 🚨 Troubleshooting

### Images not loading?
- Check `NEXT_PUBLIC_API_URL` points to correct backend
- Verify backend image proxy endpoint is working
- Check browser network tab for 404/500 errors

### API not responding?
- Ensure backend is running
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS is enabled on backend

### Build fails?
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## 📄 License

© 2024 World of Books. All rights reserved.

## 🤝 Support

For issues or questions, visit `/contact` or check `/readme` for technical info.
