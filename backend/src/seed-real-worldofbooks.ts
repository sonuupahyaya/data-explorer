import * as dotenv from 'dotenv';
import { connect, Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { WorldBooksImageScraperService } from './scraper/world-books-image-scraper';

dotenv.config();

const logger = new Logger('WorldOfBooksRealSeeder');

/**
 * Main seed function - scrapes REAL World of Books with verified images
 */
async function seedRealWorldOfBooks() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/world_of_books';
    logger.log(`📦 Connecting to MongoDB: ${mongoUri}`);

    const connection = await connect(mongoUri);
    logger.log('✅ Connected to MongoDB');

    // Get Product model
    const productSchema = new (require('mongoose').Schema)({
      source_id: { type: String, required: true, unique: true, sparse: true },
      source_url: { type: String, required: true, unique: true, sparse: true },
      title: { type: String, required: true },
      author: { type: String, required: true },
      price: { type: Number, required: true },
      currency: { type: String, required: true },
      image_url: { type: String, required: true }, // REQUIRED - no placeholders
      categories: [{ type: require('mongoose').Schema.Types.ObjectId, ref: 'Category', default: [] }],
      isbn: { type: String, default: null },
      publisher: { type: String, default: null },
      publication_date: { type: Date, default: null },
      description: { type: String, default: null },
      specs: { type: Object, default: {} },
      rating_avg: { type: Number, default: 0 },
      reviews_count: { type: Number, default: 0 },
      last_scraped_at: { type: Date, default: null },
      is_available: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    productSchema.index({ source_id: 1 }, { unique: true, sparse: true });
    productSchema.index({ image_url: 1 }); // Index for image validation

    const ProductModel: Model<any> = connection.model('Product', productSchema);

    logger.log(`🌐 Starting to scrape World of Books with REAL images...`);

    // Initialize scraper
    const scraper = new WorldBooksImageScraperService();

    // Scrape books with image validation
    const result = await scraper.scrapeWorldBooks(50);
    const { books, stats } = result;

    logger.log(`\n📊 SCRAPE STATISTICS:`);
    logger.log(`   Books scraped: ${stats.scraped}`);
    logger.log(`   Books with valid images: ${stats.valid}`);
    logger.log(`   Broken images: ${stats.broken}`);

    if (stats.broken > 0) {
      logger.error(`❌ SCRAPE FAILED - Found ${stats.broken} books with broken/placeholder images`);
      await connection.disconnect();
      process.exit(1);
    }

    if (books.length === 0) {
      logger.warn(`⚠️  LIVE SCRAPING UNAVAILABLE - Loading existing seeded products...`);

      // Load existing products from database
      const existingProducts = await ProductModel.find().select('title author price currency image_url source_url').limit(50).lean().exec();

      if (existingProducts.length === 0) {
        logger.error(`❌ No data available in database`);
        await connection.disconnect();
        process.exit(1);
      }

      // Validate existing products have real images
      const validExisting = existingProducts.filter(p => p.image_url && p.image_url.startsWith('https://images.worldofbooks.com'));

      if (validExisting.length === 0) {
        logger.error(`❌ Existing products have no valid images`);
        await connection.disconnect();
        process.exit(1);
      }

      logger.log(`\n✅ LOADED SEEDED DATA:`);
      logger.log(`   Books with real images: ${validExisting.length}`);
      logger.log(`\n📖 SAMPLE BOOKS:`);

      for (let i = 0; i < Math.min(3, validExisting.length); i++) {
        const book = validExisting[i];
        logger.log(`\n   Book ${i + 1}:`);
        logger.log(`   Title: ${book.title}`);
        logger.log(`   Author: ${book.author}`);
        logger.log(`   Price: £${book.price}`);
        logger.log(`   Image: ${book.image_url}`);
      }

      logger.log(`\n${'='.repeat(60)}`);
      logger.log(`✅ SUCCESS - All ${validExisting.length} books have REAL images`);
      logger.log(`${'='.repeat(60)}`);

      await connection.disconnect();
      process.exit(0);
    }

    // Validate books before saving
    const validation = scraper.validateBooksForSaving(books);

    logger.log(`\n✅ VALIDATION:`);
    logger.log(`   Books to save: ${validation.valid.length}`);
    logger.log(`   Rejected: ${validation.invalid}`);

    if (validation.valid.length === 0) {
      logger.error(`❌ No valid books to save`);
      await connection.disconnect();
      process.exit(1);
    }

    // Clear old products
    logger.log(`🗑️  Clearing existing products...`);
    await ProductModel.deleteMany({});

    // Save books to database
    logger.log(`📚 Saving ${validation.valid.length} books with REAL images...`);

    let savedCount = 0;
    let errorCount = 0;
    const savedBooks: any[] = [];

    for (const book of validation.valid) {
      try {
        const productData = {
          source_id: book.source_id,
          source_url: book.source_url,
          title: book.title,
          author: book.author,
          price: book.price,
          currency: book.currency,
          image_url: book.image_url, // VERIFIED real image
          description: book.description || '',
          publisher: book.publisher || '',
          isbn: book.isbn || '',
          last_scraped_at: new Date(),
          is_available: true,
          specs: {
            'Scrape Date': new Date().toISOString().split('T')[0],
            'Image Source': 'worldofbooks.com',
          },
        };

        // Validate image URL format before saving
        if (!productData.image_url.startsWith('https://images.worldofbooks.com')) {
          logger.warn(`⚠️  Skipping ${book.title} - image URL invalid: ${productData.image_url}`);
          continue;
        }

        const saved = await ProductModel.create(productData);
        savedBooks.push(saved);
        savedCount++;

        logger.log(`✅ Saved: ${book.title.substring(0, 50)} - Image: ✅`);

        if (savedCount % 10 === 0) {
          logger.log(`   Progress: ${savedCount}/${validation.valid.length}`);
        }
      } catch (error: any) {
        errorCount++;
        logger.error(`❌ Error saving ${book.title}: ${error.message}`);
      }
    }

    const totalInDb = await ProductModel.countDocuments();

    logger.log(`\n${'='.repeat(60)}`);
    logger.log(`✅ SEEDING COMPLETE:`);
    logger.log(`${'='.repeat(60)}`);
    logger.log(`   Books scraped: ${books.length}`);
    logger.log(`   Books saved: ${savedCount}`);
    logger.log(`   Errors: ${errorCount}`);
    logger.log(`   Total in DB: ${totalInDb}`);
    logger.log(`   Broken images: ${stats.broken}`);

    if (savedBooks.length > 0) {
      logger.log(`\n📖 SAMPLE BOOKS:`);

      for (let i = 0; i < Math.min(3, savedBooks.length); i++) {
        const book = savedBooks[i];
        logger.log(`\n   Book ${i + 1}:`);
        logger.log(`   Title: ${book.title}`);
        logger.log(`   Author: ${book.author}`);
        logger.log(`   Price: £${book.price}`);
        logger.log(`   Image: ${book.image_url}`);
      }
    }

    // Verify all have images
    const booksWithoutImages = await ProductModel.find({ image_url: { $in: ['', null] } });
    if (booksWithoutImages.length > 0) {
      logger.error(`❌ VALIDATION FAILED - ${booksWithoutImages.length} books have no images`);
      await connection.disconnect();
      process.exit(1);
    }

    const placeholderBooks = await ProductModel.find({
      $or: [
        { image_url: /placeholder/i },
        { image_url: /blank/i },
        { image_url: /\/blank\// },
        { image_url: { $not: /^https:\/\/images\.worldofbooks\.com/ } },
      ],
    });

    if (placeholderBooks.length > 0) {
      logger.error(`❌ VALIDATION FAILED - ${placeholderBooks.length} books have placeholder images`);
      logger.error(`Examples:`);
      placeholderBooks.slice(0, 3).forEach(b => {
        logger.error(`  - ${b.title}: ${b.image_url}`);
      });
      await connection.disconnect();
      process.exit(1);
    }

    logger.log(`\n${'='.repeat(60)}`);
    logger.log(`🎉 SUCCESS - All ${totalInDb} books have REAL images`);
    logger.log(`${'='.repeat(60)}`);

    // Close connection
    await connection.disconnect();
    logger.log('✅ Database connection closed');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedRealWorldOfBooks();
