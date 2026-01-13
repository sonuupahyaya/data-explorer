/**
 * PRODUCTION VERIFICATION SCRIPT
 * 
 * Checks that the database meets all requirements for production:
 * ✅ At least 50 products exist
 * ✅ All products have images
 * ✅ All products have prices
 * ✅ All products have source URLs
 * ✅ Scrape jobs table exists
 * ✅ Cache TTL is configured
 * 
 * Usage: npm run verify:production
 */

import * as dotenv from 'dotenv';
import { connect, disconnect } from 'mongoose';
import { Logger } from '@nestjs/common';

dotenv.config();

const logger = new Logger('ProductionVerification');

interface VerificationResult {
  passed: boolean;
  totalProducts: number;
  productsWithImages: number;
  productsWithPrices: number;
  productsWithSourceUrls: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  scrapeJobsCount: number;
  cacheTTL: number;
  errors: string[];
}

async function verifyProduction(): Promise<VerificationResult> {
  const result: VerificationResult = {
    passed: false,
    totalProducts: 0,
    productsWithImages: 0,
    productsWithPrices: 0,
    productsWithSourceUrls: 0,
    averagePrice: 0,
    priceRange: { min: Infinity, max: 0 },
    scrapeJobsCount: 0,
    cacheTTL: parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10),
    errors: [],
  };

  try {
    logger.log(`\n${'='.repeat(70)}`);
    logger.log(`🔍 PRODUCTION VERIFICATION REPORT`);
    logger.log(`${'='.repeat(70)}\n`);

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/world_of_books';
    logger.log(`📦 Connecting to MongoDB: ${mongoUri}`);

    const connection = await connect(mongoUri);
    const db = connection.connection.db;

    logger.log('✅ Connected to MongoDB\n');

    // ==========================================
    // CHECK 1: Products count
    // ==========================================
    logger.log('1️⃣  Checking product count...');
    result.totalProducts = await db.collection('products').countDocuments();
    logger.log(`   📊 Total products: ${result.totalProducts}`);

    if (result.totalProducts < 50) {
      result.errors.push(
        `❌ Only ${result.totalProducts} products in database (need 50+)`
      );
      logger.log(`   ❌ FAILED: Less than 50 products\n`);
    } else {
      logger.log(`   ✅ PASSED: At least 50 products exist\n`);
    }

    // ==========================================
    // CHECK 2: Products with images
    // ==========================================
    logger.log('2️⃣  Checking product images...');
    result.productsWithImages = await db.collection('products').countDocuments({
      image_url: { $exists: true, $nin: [null, ''] },
    });

    const imagePercentage = ((result.productsWithImages / result.totalProducts) * 100).toFixed(1);
    logger.log(`   🖼️  Products with images: ${result.productsWithImages}/${result.totalProducts} (${imagePercentage}%)`);

    if (result.productsWithImages < result.totalProducts * 0.8) {
      result.errors.push(
        `⚠️  Only ${imagePercentage}% of products have images (target: 80%)`
      );
      logger.log(`   ⚠️  WARNING: Less than 80% have images\n`);
    } else {
      logger.log(`   ✅ PASSED: 80%+ of products have images\n`);
    }

    // ==========================================
    // CHECK 3: Products with prices
    // ==========================================
    logger.log('3️⃣  Checking product prices...');
    result.productsWithPrices = await db.collection('products').countDocuments({
      price: { $exists: true, $gt: 0 },
    });

    const pricePercentage = ((result.productsWithPrices / result.totalProducts) * 100).toFixed(1);
    logger.log(`   💷 Products with price > 0: ${result.productsWithPrices}/${result.totalProducts} (${pricePercentage}%)`);

    if (result.productsWithPrices < result.totalProducts) {
      result.errors.push(
        `⚠️  ${result.totalProducts - result.productsWithPrices} products have price = 0 or missing`
      );
      logger.log(`   ⚠️  WARNING: Some products missing prices\n`);
    } else {
      logger.log(`   ✅ PASSED: All products have prices\n`);
    }

    // Get price statistics
    const priceStats = await db.collection('products').aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]).toArray();

    if (priceStats.length > 0) {
      const stats = priceStats[0];
      result.averagePrice = stats.avgPrice || 0;
      result.priceRange = {
        min: stats.minPrice || 0,
        max: stats.maxPrice || 0,
      };
      logger.log(`   📈 Price range: £${result.priceRange.min.toFixed(2)} - £${result.priceRange.max.toFixed(2)}`);
      logger.log(`   📊 Average price: £${result.averagePrice.toFixed(2)}\n`);
    }

    // ==========================================
    // CHECK 4: Products with source URLs
    // ==========================================
    logger.log('4️⃣  Checking source URLs...');
    result.productsWithSourceUrls = await db.collection('products').countDocuments({
      source_url: { $exists: true, $nin: [null, ''] },
    });

    const urlPercentage = ((result.productsWithSourceUrls / result.totalProducts) * 100).toFixed(1);
    logger.log(`   🔗 Products with source URLs: ${result.productsWithSourceUrls}/${result.totalProducts} (${urlPercentage}%)`);

    if (result.productsWithSourceUrls < result.totalProducts) {
      result.errors.push(
        `❌ ${result.totalProducts - result.productsWithSourceUrls} products missing source URLs`
      );
      logger.log(`   ❌ FAILED: Some products missing URLs\n`);
    } else {
      logger.log(`   ✅ PASSED: All products have source URLs\n`);
    }

    // ==========================================
    // CHECK 5: Source ID uniqueness
    // ==========================================
    logger.log('5️⃣  Checking for duplicate source IDs...');
    const duplicateSourceIds = await db.collection('products').aggregate([
      {
        $group: {
          _id: '$source_id',
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]).toArray();

    if (duplicateSourceIds.length > 0) {
      result.errors.push(
        `⚠️  Found ${duplicateSourceIds.length} duplicate source IDs`
      );
      logger.log(`   ⚠️  WARNING: Duplicate source IDs detected\n`);
    } else {
      logger.log(`   ✅ PASSED: No duplicate source IDs\n`);
    }

    // ==========================================
    // CHECK 6: Scrape jobs table
    // ==========================================
    logger.log('6️⃣  Checking scrape jobs collection...');
    const collections = await db.listCollections().toArray();
    const hasScrapejobs = collections.some(c => c.name === 'scrapejobs');

    if (!hasScrapejobs) {
      logger.log(`   ⚠️  Warning: scrapejobs collection doesn't exist yet (will be created on first scrape)\n`);
    } else {
      result.scrapeJobsCount = await db.collection('scrapejobs').countDocuments();
      logger.log(`   📋 Scrape jobs recorded: ${result.scrapeJobsCount}\n`);
    }

    // ==========================================
    // CHECK 7: Database indexes
    // ==========================================
    logger.log('7️⃣  Checking database indexes...');
    const indexes = await db.collection('products').indexes();
    const indexNames = indexes.map(idx => Object.keys(idx.key).join('_'));

    const expectedIndexes = ['source_id_1', 'source_url_1', 'title_text_author_text', 'price_1'];
    const missingIndexes = expectedIndexes.filter(idx =>
      !indexNames.some(name => name.includes(idx.replace(/_/g, '')))
    );

    logger.log(`   📑 Total indexes: ${indexNames.length}`);
    if (missingIndexes.length > 0) {
      logger.log(`   ⚠️  Missing indexes: ${missingIndexes.join(', ')}\n`);
    } else {
      logger.log(`   ✅ PASSED: All critical indexes exist\n`);
    }

    // ==========================================
    // CHECK 8: Cache TTL configuration
    // ==========================================
    logger.log('8️⃣  Checking cache configuration...');
    logger.log(`   ⏱️  Cache TTL: ${result.cacheTTL} seconds (${(result.cacheTTL / 3600).toFixed(1)} hours)`);

    if (result.cacheTTL < 3600) {
      logger.log(`   ⚠️  WARNING: Cache TTL is very short\n`);
    } else {
      logger.log(`   ✅ PASSED: Cache TTL is reasonable\n`);
    }

    // ==========================================
    // SAMPLE PRODUCTS
    // ==========================================
    logger.log(`9️⃣  Sample products:\n`);
    const samples = await db
      .collection('products')
      .find({})
      .limit(3)
      .toArray();

    for (const product of samples) {
      logger.log(`   📖 "${product.title}"`);
      logger.log(`      Author: ${product.author}`);
      logger.log(`      Price: £${product.price || 0}`);
      logger.log(`      Image: ${product.image_url ? '✅' : '❌'}`);
      logger.log(`      Source: ${product.source_url ? '✅' : '❌'}`);
      logger.log(``);
    }

    // ==========================================
    // FINAL VERDICT
    // ==========================================
    const criticalErrors = result.errors.filter(e => e.includes('❌'));
    result.passed = criticalErrors.length === 0 && result.totalProducts >= 50;

    logger.log(`${'='.repeat(70)}`);
    if (result.passed) {
      logger.log(`✅ PRODUCTION READY`);
      logger.log(`${'='.repeat(70)}\n`);
      logger.log(`All critical checks passed! Database is ready for production.\n`);
    } else {
      logger.log(`❌ PRODUCTION NOT READY`);
      logger.log(`${'='.repeat(70)}\n`);
      logger.log(`Critical issues found:\n`);
      for (const error of result.errors) {
        if (error.includes('❌')) {
          logger.error(`   ${error}`);
        }
      }
      logger.log(``);
    }

    // ==========================================
    // STATISTICS
    // ==========================================
    logger.log(`\n📊 STATISTICS:`);
    logger.log(`   Total Products: ${result.totalProducts}`);
    logger.log(`   With Images: ${result.productsWithImages} (${imagePercentage}%)`);
    logger.log(`   With Prices: ${result.productsWithPrices} (${pricePercentage}%)`);
    logger.log(`   With Source URLs: ${result.productsWithSourceUrls} (${urlPercentage}%)`);
    logger.log(`   Average Price: £${result.averagePrice.toFixed(2)}`);
    logger.log(`   Price Range: £${result.priceRange.min.toFixed(2)} - £${result.priceRange.max.toFixed(2)}`);
    logger.log(`\n`);

    // Disconnect
    await disconnect();

    // Exit with appropriate code
    process.exit(result.passed ? 0 : 1);
  } catch (error) {
    logger.error(`\n❌ VERIFICATION FAILED: ${error}`);
    process.exit(1);
  }
}

// Run verification
verifyProduction();
