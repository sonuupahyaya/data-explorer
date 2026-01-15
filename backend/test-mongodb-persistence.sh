#!/bin/bash

echo "================================"
echo "MongoDB Persistence Test Suite"
echo "================================"
echo ""

# Test 1: Get initial cart (should be empty)
echo "Test 1: Get initial cart..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Add item to cart
echo "Test 2: Adding item to cart..."
curl -s -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "mongodb-test-001",
    "quantity": 1,
    "title": "MongoDB Persistence Test Book",
    "price": 29.99
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Get cart (should now have 1 item)
echo "Test 3: Get cart after adding item (should show 1 item)..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "---"
echo ""

# Test 4: Save item as favorite
echo "Test 4: Saving item as favorite..."
curl -s -X POST http://localhost:3001/api/saved/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "mongodb-test-001",
    "title": "MongoDB Persistence Test Book"
  }' | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Get saved items
echo "Test 5: Get saved items (should show 1 item)..."
curl -s -X GET http://localhost:3001/api/saved \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "================================"
echo "✅ PERSISTENCE TEST COMPLETE"
echo "================================"
echo ""
echo "NEXT STEPS:"
echo "1. Check MongoDB Atlas -> bookvault database"
echo "2. Look for 'carts' collection (should have your item)"
echo "3. Look for 'saveditems' collection (should have your saved item)"
echo "4. Restart backend (Ctrl+C then npm run start:dev)"
echo "5. Run this script again"
echo "6. If items still exist, MongoDB persistence is WORKING! ✅"
echo ""
