# 🌱 Available Seed Commands

Run these commands from the `backend` directory to populate your MongoDB database.

```bash
cd backend
```

---

## Quick Seed (Recommended)

### Seed Sample Products (100+ books)
```bash
npm run seed:sample-products
```

Adds 100+ sample books with:
- Realistic titles and authors
- Various categories
- Different prices
- Sample images
- Ready for testing cart/favorites

**Time:** ~5 seconds
**Books Added:** 100+
**Categories:** Added automatically

---

## Other Seed Options

### Seed Real World of Books Data
```bash
npm run seed:real-worldofbooks
```

Scrapes real books from World of Books website.

**Time:** 2-5 minutes
**Books Added:** 500+
**Real Data:** Yes (from worldofbooks.com)
**Note:** Requires internet connection

### Seed World of Books Data
```bash
npm run seed:worldofbooks
```

Alternative World of Books seeding.

### Seed Real Data
```bash
npm run seed:real-data
```

Comprehensive real data seeding.

### Populate Categories
```bash
npm run populate:categories
```

Adds book categories to database.

### Verify Production
```bash
npm run verify:production
```

Checks what's in your database.

---

## After Seeding

### 1. Refresh Frontend
Go to http://localhost:3000

You should see books in "Featured Collection"!

### 2. Test Cart
- Click "Add to Cart"
- See item in cart
- Refresh page → Item still there ✅

### 3. Test Favorites
- Click heart/save button
- See item in Saved
- Refresh page → Item still there ✅

### 4. Verify in MongoDB
Go to MongoDB Atlas → bookvault database

Collections should have:
- `products` (100+ books)
- `categories` (book types)

---

## Troubleshooting

**Issue:** "Command not found"
- Make sure you're in `backend` directory: `cd backend`

**Issue:** "Cannot connect to MongoDB"
- Make sure backend is running: `npm run start:dev` (in another terminal)

**Issue:** "No books found" after refresh
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+Shift+R

**Issue:** Seed script hangs
- Press Ctrl+C to stop
- Check MongoDB Atlas connection
- Verify MONGO_URI in .env file

---

## Example: Full Workflow

```bash
# Terminal 1: Start backend
cd backend
npm run start:dev

# Terminal 2: Seed data
cd backend
npm run seed:sample-products

# Terminal 3: View frontend
# Open http://localhost:3000 in browser
# See 100+ books! 📚
```

---

## How to Choose

| Command | Best For | Speed | Realism |
|---------|----------|-------|---------|
| `seed:sample-products` | Testing | ⚡ Fast | Medium |
| `seed:real-worldofbooks` | Real data | ⏱️ Slow | High |
| `seed:worldofbooks` | Alternative | Medium | Medium |
| `populate:categories` | Categories | ⚡ Fast | High |

**Recommendation:** Start with `seed:sample-products` for fast testing, then try `seed:real-worldofbooks` for production.

---

**Start with:** `npm run seed:sample-products`
