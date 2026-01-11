import 'reflect-metadata';
import { ScraperService } from '../scraper/scraper.service';

/**
 * Validation Script: npm run scrape:fiction
 * Scrapes real fiction books from World of Books
 * Tests:
 * - Playwright connection
 * - Crawlee scraping
 * - Real data extraction
 * - MongoDB storage
 */
async function main() {
  console.log('🚀 Starting Fiction Books Scraper Validation');
  console.log('==========================================\n');

  const scraper = new ScraperService();

  try {
    // Step 1: Scrape navigation
    console.log('📍 STEP 1: Scraping navigation headings...');
    const navResult = await scraper.scrapeNavigation();
    console.log(`✅ Navigation scraped: ${navResult.count} items found`);
    navResult.headings.forEach((nav, idx) => {
      console.log(`  ${idx + 1}. ${nav.title} (${nav.slug})`);
    });

    // Step 2: Find fiction/books category
    console.log('\n📍 STEP 2: Locating fiction books category...');
    const booksNav = navResult.headings.find(
      (nav) =>
        nav.slug.includes('book') ||
        nav.slug.includes('fiction') ||
        nav.slug.includes('categor'),
    );

    if (!booksNav) {
      console.error('❌ Could not find books/fiction navigation');
      process.exit(1);
    }

    console.log(`✅ Found: ${booksNav.title} (${booksNav.url})`);

    // Step 3: Scrape categories
    console.log('\n📍 STEP 3: Scraping categories from fiction...');
    const categoriesResult = await scraper.scrapeCategories(booksNav.url);
    console.log(`✅ Categories scraped: ${categoriesResult.count} items found`);

    // Find fiction category
    const fictionCategory = categoriesResult.categories.find((cat) =>
      cat.slug.includes('fiction'),
    );

    const targetCategory = fictionCategory || categoriesResult.categories[0];
    if (!targetCategory) {
      console.error('❌ Could not find any category');
      process.exit(1);
    }

    console.log(`✅ Using category: ${targetCategory.title}`);

    // Step 4: Scrape products
    console.log('\n📍 STEP 4: Scraping products from category...');
    const productsResult = await scraper.scrapeProducts(targetCategory.url);
    console.log(`✅ Products scraped: ${productsResult.count} items found`);

    if (productsResult.products.length === 0) {
      console.error('❌ No products were scraped');
      process.exit(1);
    }

    // Step 5: Display first product
    const firstProduct = productsResult.products[0];
    console.log('\n📍 STEP 5: First product details:');
    console.log(`  📖 Title: ${firstProduct.title}`);
    console.log(`  ✍️  Author: ${firstProduct.author}`);
    console.log(`  💰 Price: ${firstProduct.currency}${firstProduct.price}`);
    console.log(`  📸 Image: ${firstProduct.image_url ? 'Yes' : 'No'}`);
    console.log(`  🔗 URL: ${firstProduct.source_url}`);

    // Step 6: Scrape product detail
    console.log('\n📍 STEP 6: Scraping product detail...');
    const detailResult = await scraper.scrapeProductDetail(firstProduct.source_url);
    console.log(`✅ Product detail scraped:`);
    console.log(`  📖 Title: ${detailResult.detail.title}`);
    console.log(`  ✍️  Author: ${detailResult.detail.author}`);
    console.log(`  📝 Description: ${detailResult.detail.description.substring(0, 100)}...`);
    console.log(`  ⭐ Rating: ${detailResult.detail.rating_avg || 'N/A'}`);
    console.log(`  💬 Reviews: ${detailResult.detail.reviews_count || 0}`);

    // Success summary
    console.log('\n✅ ==========================================');
    console.log('✅ VALIDATION SUCCESSFUL!');
    console.log('✅ ==========================================');
    console.log(`✅ Real data scraped from: ${new URL(firstProduct.source_url).origin}`);
    console.log(`✅ Navigation items: ${navResult.count}`);
    console.log(`✅ Products in category: ${productsResult.count}`);
    console.log(`✅ First product: "${firstProduct.title}"`);
    console.log(`✅ Price: ${firstProduct.currency}${firstProduct.price}`);

    process.exit(0);
  } catch (error) {
    console.error('\n🚨 ==========================================');
    console.error('🚨 SCRAPING FAILED');
    console.error('🚨 ==========================================');
    console.error(error);
    process.exit(1);
  }
}

main();
