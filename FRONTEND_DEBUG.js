/**
 * FRONTEND DEBUG SCRIPT
 * 
 * Paste this into browser Console (F12) when frontend is running
 * This will test the entire cart/favorites flow
 */

console.log('='.repeat(60));
console.log('CART & FAVORITES SYSTEM DEBUG');
console.log('='.repeat(60));

// Step 1: Check environment
console.log('\n1️⃣  CHECKING ENVIRONMENT');
console.log('   API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
console.log('   Node Env:', process.env.NODE_ENV);
console.log('   Current URL:', window.location.href);

// Step 2: Check localStorage
console.log('\n2️⃣  CHECKING LOCALSTORAGE');
const userId = localStorage.getItem('userId');
console.log('   userId exists:', !!userId);
if (userId) console.log('   userId value:', userId);

// Step 3: Check if buttons exist
console.log('\n3️⃣  CHECKING DOM ELEMENTS');
const addToCartButtons = document.querySelectorAll('button');
let cartButtonCount = 0;
addToCartButtons.forEach((btn, idx) => {
  if (btn.textContent.includes('Add to Cart') || btn.textContent.includes('Add Cart')) {
    console.log(`   ✅ Found "Add to Cart" button #${idx}`);
    cartButtonCount++;
  }
});
console.log(`   Total "Add to Cart" buttons: ${cartButtonCount}`);

// Step 4: Check for errors in page
console.log('\n4️⃣  CHECKING FOR ERRORS');
// Note: Getting console errors is hard from here, user must check manually

// Step 5: Test API connectivity
console.log('\n5️⃣  TESTING API CONNECTIVITY');
const testApi = async () => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  try {
    console.log(`   Testing: ${apiBase}/products?limit=1`);
    const response = await fetch(`${apiBase}/products?limit=1`, {
      headers: {
        'X-User-Id': userId || 'test-user'
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API is responding');
      console.log(`   ✅ Got ${data.data?.length || 0} products`);
      return true;
    } else {
      console.log(`   ❌ API returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ API connection failed:', error.message);
    return false;
  }
};

// Step 6: Test Cart API
console.log('\n6️⃣  TESTING CART API');
const testCartApi = async () => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  try {
    console.log(`   Testing: GET ${apiBase}/cart`);
    const response = await fetch(`${apiBase}/cart`, {
      method: 'GET',
      headers: {
        'X-User-Id': userId || 'test-user'
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Cart API responding');
      console.log(`   ✅ Cart has ${data.items?.length || 0} items`);
      console.log('   Response:', data);
      return true;
    } else {
      console.log(`   ❌ Cart API returned ${response.status}`);
      const text = await response.text();
      console.log('   Error:', text);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Cart API failed:', error.message);
    return false;
  }
};

// Step 7: Test add to cart
console.log('\n7️⃣  TESTING ADD TO CART');
const testAddToCart = async () => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  try {
    // First get a valid product ID
    console.log('   Getting a valid product ID...');
    const productsRes = await fetch(`${apiBase}/products?limit=1`, {
      headers: { 'X-User-Id': userId || 'test-user' },
      credentials: 'include'
    });
    const productsData = await productsRes.json();
    const productId = productsData.data?.[0]?._id;
    
    if (!productId) {
      console.log('   ❌ No products found to test with');
      return false;
    }
    
    console.log(`   Using productId: ${productId}`);
    console.log(`   Testing: POST ${apiBase}/cart/add`);
    
    const response = await fetch(`${apiBase}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId || 'test-user'
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: productId,
        quantity: 1
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ ADD TO CART API working!');
      console.log('   Response:', data);
      return true;
    } else {
      console.log(`   ❌ ADD TO CART returned ${response.status}`);
      const text = await response.text();
      console.log('   Error:', text);
      return false;
    }
  } catch (error) {
    console.log('   ❌ ADD TO CART failed:', error.message);
    return false;
  }
};

// Step 8: Test save for later
console.log('\n8️⃣  TESTING SAVE FOR LATER');
const testSaveForLater = async () => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  try {
    // Get a valid product ID
    const productsRes = await fetch(`${apiBase}/products?limit=1`, {
      headers: { 'X-User-Id': userId || 'test-user' },
      credentials: 'include'
    });
    const productsData = await productsRes.json();
    const productId = productsData.data?.[0]?._id;
    
    if (!productId) {
      console.log('   ❌ No products found');
      return false;
    }
    
    console.log(`   Testing: POST ${apiBase}/saved/add`);
    
    const response = await fetch(`${apiBase}/saved/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId || 'test-user'
      },
      credentials: 'include',
      body: JSON.stringify({ productId: productId })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ SAVE FOR LATER API working!');
      console.log('   Response:', data);
      return true;
    } else {
      console.log(`   ❌ SAVE FOR LATER returned ${response.status}`);
      const text = await response.text();
      console.log('   Error:', text);
      return false;
    }
  } catch (error) {
    console.log('   ❌ SAVE FOR LATER failed:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  const apiOk = await testApi();
  const cartOk = await testCartApi();
  const addOk = await testAddToCart();
  const saveOk = await testSaveForLater();
  
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`API Connectivity:     ${apiOk ? '✅' : '❌'}`);
  console.log(`Cart API:             ${cartOk ? '✅' : '❌'}`);
  console.log(`Add to Cart:          ${addOk ? '✅' : '❌'}`);
  console.log(`Save for Later:       ${saveOk ? '✅' : '❌'}`);
  console.log('='.repeat(60));
  
  if (apiOk && cartOk && addOk && saveOk) {
    console.log('\n🎉 ALL TESTS PASSED! System is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Check details above.');
  }
};

// Run the tests
console.log('\n⏳ Running tests... (this may take a few seconds)');
runAllTests();
