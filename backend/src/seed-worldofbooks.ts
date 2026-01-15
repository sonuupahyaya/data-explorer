import * as dotenv from 'dotenv';
import { connect, Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { RealWorldOfBooksScraperService } from './scraper/real-world-books-scraper';

dotenv.config();

const logger = new Logger('WorldOfBooksSeeder');

/**
 * Main seed function - scrapes real books from World of Books
 */
async function seedWorldOfBooks() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookvault';
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
      image_url: { type: String, default: null },
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

    const ProductModel: Model<any> = connection.model('Product', productSchema);

    // Get existing count
    const existingCount = await ProductModel.countDocuments();
    logger.log(`📊 Existing products in DB: ${existingCount}`);

    // Initialize scraper
    const scraper = new RealWorldOfBooksScraperService();

    logger.log(`🌐 Starting to scrape World of Books...`);
    const books = await scraper.scrapeRealBooks(50);

    if (books.length === 0) {
      logger.warn('⚠️  Live scraping failed - loading existing seeded data from database');

      // Load existing products from database
      const existingProducts = await ProductModel.find().limit(50).lean().exec();

      if (existingProducts.length === 0) {
        logger.error('❌ No data available - neither live scrape nor database seed worked');
        await connection.disconnect();
        process.exit(1);
      }

      logger.log(`✅ Loaded ${existingProducts.length} products from database`);
      logger.log(`\n✅ USING SEEDED DATA:`);
      logger.log(`   ✓ Books loaded: ${existingProducts.length}`);

      if (existingProducts.length > 0) {
        const firstBook = existingProducts[0];
        logger.log(`\n📖 First Book:`);
        logger.log(`   Title: ${firstBook.title}`);
        logger.log(`   Author: ${firstBook.author}`);
        logger.log(`   Price: £${firstBook.price}`);
        logger.log(`   Image: ${firstBook.image_url ? '✅ Present' : '❌ Missing'}`);
        logger.log(`   URL: ${firstBook.image_url}`);
      }

      await connection.disconnect();
      process.exit(0);
    }

    // Validate images
    const hasImages = scraper.validateBooks(books);
    if (!hasImages) {
      logger.warn('⚠️  No books have images - website may have changed structure');
    }

    logger.log(`📚 Seeding ${books.length} books to database...`);

    // Clear old products (optional)
    if (process.env.CLEAR_ON_SEED === 'true') {
      logger.log('🗑️  Clearing existing products...');
      await ProductModel.deleteMany({});
    }

    // Save books to database
    let savedCount = 0;
    let errorCount = 0;
    const savedBooks: any[] = [];

    for (const book of books) {
      try {
        // Check if product already exists
        const existing = await ProductModel.findOne({
          $or: [{ source_id: book.source_id }, { source_url: book.source_url }],
        });

        const productData = {
          source_id: book.source_id,
          source_url: book.source_url,
          title: book.title,
          author: book.author,
          price: book.price,
          currency: book.currency,
          image_url: book.image_url,
          description: book.description || '',
          publisher: book.publisher || '',
          isbn: book.isbn || '',
          last_scraped_at: new Date(),
          is_available: true,
          specs: {
            'Scrape Date': new Date().toISOString().split('T')[0],
            'Source': 'worldofbooks.com',
          },
        };

        let saved;
        if (existing) {
          // Update existing
          saved = await ProductModel.findByIdAndUpdate(existing._id, productData, { new: true });
          logger.log(`🔄 Updated: ${book.title.substring(0, 40)}`);
        } else {
          // Create new
          saved = await ProductModel.create(productData);
          logger.log(`✅ Created: ${book.title.substring(0, 40)}`);
        }

        savedBooks.push(saved);
        savedCount++;

        if (savedCount % 10 === 0) {
          logger.log(`✅ Progress: ${savedCount}/${books.length} books saved`);
        }
      } catch (error: any) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
          logger.warn(`⚠️  Duplicate: ${book.title} (skipping)`);
        } else {
          errorCount++;
          logger.error(`❌ Error saving ${book.title}: ${error.message}`);
        }
      }
    }

    const totalInDb = await ProductModel.countDocuments();

    logger.log(`\n✅ SEEDING COMPLETE:`);
    logger.log(`   ✓ Books scraped: ${books.length}`);
    logger.log(`   ✓ Books saved: ${savedCount}`);
    logger.log(`   ✓ Errors: ${errorCount}`);
    logger.log(`   ✓ Total in DB: ${totalInDb}`);

    if (savedBooks.length > 0) {
      const firstBook = savedBooks[0];
      logger.log(`\n📖 First Book:`);
      logger.log(`   Title: ${firstBook.title}`);
      logger.log(`   Author: ${firstBook.author}`);
      logger.log(`   Price: £${firstBook.price}`);
      logger.log(`   Image: ${firstBook.image_url ? '✅ Present' : '❌ Missing'}`);
      logger.log(`   URL: ${firstBook.image_url}`);
    }

    // Sample books validation
    const sampleBooks = savedBooks.slice(0, 3);
    logger.log(`\n📚 Sample of ${sampleBooks.length} books saved:`);
    sampleBooks.forEach((book, idx) => {
      logger.log(`   ${idx + 1}. "${book.title}" by ${book.author} (£${book.price})`);
      logger.log(`      Image: ${book.image_url ? '✅' : '❌'}`);
    });

    logger.log(`\n✅ Database seeding complete - ready to use!`);

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
seedWorldOfBooks();
