# 🌱 Seed Sample Books - Get Data in Your Database

Your MongoDB is now connected but the database is empty (that's why you see "No books found").

Let's populate it with 100+ sample books in 30 seconds.

---

## Step 1: Open Terminal in Backend Directory

```bash
cd "c:/Users/Sonuu/Desktop/data explorer/backend"
```

---

## Step 2: Run Seed Command

```bash
npm run seed:sample
```

---

## Step 3: Wait for Completion

You'll see output like:

```
📦 Connecting to MongoDB: mongodb+srv://...bookvault...
✅ Connected to MongoDB

🌱 Seeding 100+ sample products...
✅ Product 1: The Great Gatsby
✅ Product 2: To Kill a Mockingbird
✅ Product 3: 1984
... more products ...

✅ All products seeded successfully
✅ 100+ products saved to MongoDB
```

---

## Step 4: Refresh Frontend

Go to http://localhost:3000

You should now see books in the "Featured Collection" section! 📚

---

## What Gets Seeded

- **100+ classic and popular books**
- **Real book titles, authors, prices**
- **Book descriptions and images**
- **Multiple categories**
- **Ready-to-test cart/favorites**

---

## If Seed Fails

**Issue:** "Cannot connect to MongoDB"
**Solution:** Make sure backend is running: `npm run start:dev`

**Issue:** "Command not found: npm run seed:sample"
**Solution:** Check you're in the `backend` directory

**Issue:** "No books found" still after refresh
**Solution:** Clear browser cache (Ctrl+Shift+Delete) and refresh

---

## Alternative: Manual Test Data

If seeding doesn't work, test manually:

```bash
# Add test item to cart
curl -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"productId":"book-001","quantity":1,"title":"Test Book","price":19.99}'
```

Then check cart/favorites in frontend - it should work!

---

## Next: Test Data Persistence

After seeding:

1. Add item to cart
2. Refresh page → Item still there ✅
3. Restart backend: Ctrl+C, npm run start:dev
4. Refresh page → Item STILL there ✅

**If both work, MongoDB persistence is FULLY FUNCTIONAL!**

---

## Full Workflow

```
1. Update backend/.env (you may have done this already)
2. Restart backend: npm run start:dev
3. Run seed: npm run seed:sample
4. Refresh frontend: http://localhost:3000
5. See books! 📚
6. Add to cart and favorites
7. Verify data persists after restart
8. Deploy to production!
```

---

Done! You now have real data in your database.
