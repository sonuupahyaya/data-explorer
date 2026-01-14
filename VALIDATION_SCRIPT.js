/**
 * COPY-PASTE THIS INTO BROWSER CONSOLE (F12)
 * This will validate the entire cart & favorites system
 */

console.log('\n' + '='.repeat(70));
console.log('  CART & FAVORITES VALIDATION SCRIPT');
console.log('='.repeat(70));

const results = {
  apiConfigured: false,
  apiReachable: false,
  cartApiWorks: false,
  favoritesApiWorks: false,
  buttonExists: false,
  userIdGenerated: false
};

async function validate() {
  // 1. Check API Configuration
  console.log('\n1️⃣  CHECKING API CONFIGURATION');
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (apiBase) {
    console.log('   ✅ API_BASE:', apiBase);
    results.apiConfigured = true;
  } else {
    console.log('   ❌ API_BASE NOT CONFIGURED');
    console.log('   💡 Create/update frontend/.env.local with:');
    console.log('      NEXT_PUBLIC_API_URL=http://localhost:3001/api');
    return;
  }

  // 2. Check userId
  console.log('\n2️⃣  CHECKING USER ID');
  const userId = localStorage.getItem('userId');
  if (userId) {
    console.log('   ✅ userId:', userId);
    results.userIdGenerated = true;
  } else {
    console.log('   ❌ userId NOT GENERATED');
    console.log('   💡 Will be created on first API call');
  }

  // 3. Check API Reachability
  console.log('\n3️⃣  CHECKING API REACHABILITY');
  try {
    const response = await fetch(apiBase + '/products?limit=1', {
      headers: { 'X-User-Id': userId || 'test' },
      credentials: 'include'
    });
    if (response.ok) {
      console.log('   ✅ API IS REACHABLE (Status:', response.status + ')');
      results.apiReachable = true;
    } else {
      console.log('   ❌ API returned:', response.status);
    }
  } catch (e) {
    console.log('   ❌ CANNOT REACH API:', e.message);
    console.log('   💡 Is backend running on http://localhost:3001?');
    return;
  }

  // 4. Test Cart API
  console.log('\n4️⃣  TESTING CART API');
  try {
    const response = await fetch(apiBase + '/cart', {
      headers: { 'X-User-Id': userId || 'test' },
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Cart API working');
      console.log('   📦 Items in cart:', data.items?.length || 0);
      results.cartApiWorks = true;
    } else {
      console.log('   ❌ Cart API returned:', response.status);
    }
  } catch (e) {
    console.log('   ❌ Cart API error:', e.message);
  }

  // 5. Test Favorites API
  console.log('\n5️⃣  TESTING FAVORITES API');
  try {
    const response = await fetch(apiBase + '/saved', {
      headers: { 'X-User-Id': userId || 'test' },
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Favorites API working');
      console.log('   ❤️  Items saved:', data.items?.length || 0);
      results.favoritesApiWorks = true;
    } else {
      console.log('   ❌ Favorites API returned:', response.status);
    }
  } catch (e) {
    console.log('   ❌ Favorites API error:', e.message);
  }

  // 6. Check Buttons
  console.log('\n6️⃣  CHECKING BUTTONS');
  const buttons = document.querySelectorAll('button');
  let cartButtonCount = 0;
  let saveButtonCount = 0;
  
  buttons.forEach((btn) => {
    if (btn.textContent.includes('Add to Cart') || btn.textContent.includes('Add Cart')) {
      cartButtonCount++;
    }
    if (btn.className.includes('Heart') || btn.innerHTML.includes('Heart')) {
      saveButtonCount++;
    }
  });

  if (cartButtonCount > 0) {
    console.log('   ✅ Found', cartButtonCount, '"Add to Cart" buttons');
    results.buttonExists = true;
  } else {
    console.log('   ❌ No "Add to Cart" buttons found');
  }

  if (saveButtonCount > 0) {
    console.log('   ✅ Found', saveButtonCount, '"Save" buttons');
  } else {
    console.log('   ⚠️  No "Save" buttons found (check heart icon)');
  }

  // 7. Summary
  console.log('\n' + '='.repeat(70));
  console.log('  VALIDATION SUMMARY');
  console.log('='.repeat(70));
  
  const passed = Object.values(results).filter(v => v).length;
  const total = Object.values(results).length;
  
  console.log(`\n✅ PASSED: ${passed}/${total}`);
  
  if (results.apiConfigured && results.apiReachable && results.cartApiWorks && results.favoritesApiWorks && results.buttonExists) {
    console.log('\n🎉 SYSTEM IS READY! Try clicking buttons.');
    console.log('\n📌 NEXT: Click "Add to Cart" and watch:');
    console.log('   1. This console for logs');
    console.log('   2. Network tab for API call');
    console.log('   3. Backend terminal for [CART] log');
  } else {
    console.log('\n⚠️  ISSUES FOUND:');
    if (!results.apiConfigured) console.log('   - API not configured');
    if (!results.apiReachable) console.log('   - API not reachable');
    if (!results.cartApiWorks) console.log('   - Cart API not working');
    if (!results.favoritesApiWorks) console.log('   - Favorites API not working');
    if (!results.buttonExists) console.log('   - Buttons not found on page');
  }
  
  console.log('\n' + '='.repeat(70));
}

// Run validation
validate();
