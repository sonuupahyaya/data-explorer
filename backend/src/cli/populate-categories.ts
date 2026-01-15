/**
 * Populate Categories from Products
 * 
 * Scans the products collection and extracts unique categories,
 * then creates category documents and links them to products.
 * 
 * Usage: npm run populate:categories
 */

import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Logger } from '@nestjs/common';

dotenv.config();

const logger = new Logger('PopulateCategories');

// Define schemas inline
const productSchema = new mongoose.Schema({
  title: String,
  author: String,
  price: Number,
  currency: String,
  image_url: String,
  categories: [mongoose.Schema.Types.ObjectId],
  isbn: String,
  publisher: String,
  description: String,
  rating_avg: Number,
  reviews_count: Number,
  source_url: String,
  source_id: String,
  is_available: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const navigationSchema = new mongoose.Schema({
  title: String,
  slug: String,
  url: String,
  createdAt: Date,
  updatedAt: Date,
});

const categorySchema = new mongoose.Schema({
  navigation_id: mongoose.Schema.Types.ObjectId,
  parent_id: mongoose.Schema.Types.ObjectId,
  title: { type: String, required: true },
  slug: { type: String, required: true, index: true },
  description: String,
  product_count: { type: Number, default: 0 },
  last_scraped_at: Date,
  is_subcategory: { type: Boolean, default: false },
  depth: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date,
});

categorySchema.index({ navigation_id: 1 });
categorySchema.index({ parent_id: 1 });
categorySchema.index({ navigation_id: 1, slug: 1 }, { unique: false });

// Default categories - common book categories
const DEFAULT_CATEGORIES = [
  { title: 'Fiction', slug: 'fiction', description: 'Fiction books' },
  { title: 'Non-Fiction', slug: 'non-fiction', description: 'Non-fiction books' },
  { title: 'Science', slug: 'science', description: 'Science books' },
  { title: 'Romance', slug: 'romance', description: 'Romance novels' },
  { title: 'Children', slug: 'children', description: "Children's books" },
  { title: 'Fantasy', slug: 'fantasy', description: 'Fantasy books' },
  { title: 'History', slug: 'history', description: 'History books' },
  { title: 'Crime', slug: 'crime', description: 'Crime & Mystery books' },
  { title: 'Biography', slug: 'biography', description: 'Biography & Memoir' },
  { title: 'Self-Help', slug: 'self-help', description: 'Self-Help & Psychology' },
];

async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookvault';
    logger.log(`📦 Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    logger.log('✅ Connected to MongoDB');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

async function populateCategories() {
  try {
    logger.log('🚀 Starting category population...');

    const Product = mongoose.model('Product', productSchema);
    const Category = mongoose.model('Category', categorySchema);
    const Navigation = mongoose.model('Navigation', navigationSchema);

    // Get or create default navigation
    let navigation = await Navigation.findOne({ slug: 'main' });
    if (!navigation) {
      logger.log('📍 Creating default navigation...');
      navigation = await Navigation.create({
        title: 'Main',
        slug: 'main',
        url: '/',
      });
    }

    logger.log(`📍 Using navigation: ${navigation._id}`);

    // Get all products
    const products = await Product.find({}).select('title categories').lean();
    logger.log(`📦 Found ${products.length} products`);

    if (products.length === 0) {
      logger.warn('⚠️  No products found. Please seed products first.');
      return;
    }

    // Extract category information from titles and existing data
    const categoryMap = new Map<string, { title: string; slug: string; description: string }>();

    // Add default categories
    DEFAULT_CATEGORIES.forEach((cat) => {
      categoryMap.set(cat.slug, cat);
    });

    // Infer categories from product titles
    const titleKeywords = {
      fiction: ['novel', 'fiction', 'story', 'literary'],
      romance: ['romance', 'love', 'relationship'],
      fantasy: ['fantasy', 'magic', 'wizard', 'dragon'],
      science: ['science', 'physics', 'biology', 'chemistry', 'climate'],
      history: ['history', 'historical', 'war', 'revolution', 'ancient'],
      children: ['children', 'kids', 'baby', 'young'],
      crime: ['crime', 'mystery', 'detective', 'thriller', 'suspense'],
      biography: ['biography', 'memoir', 'autobiography', 'life'],
    };

    products.forEach((product) => {
      const title = product.title?.toLowerCase() || '';
      
      for (const [categorySlug, keywords] of Object.entries(titleKeywords)) {
        if (keywords.some((keyword) => title.includes(keyword))) {
          if (!categoryMap.has(categorySlug)) {
            categoryMap.set(categorySlug, {
              title: categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1),
              slug: categorySlug,
              description: `${categorySlug} books`,
            });
          }
          break; // Only assign one category per product
        }
      }
    });

    logger.log(`📚 Found ${categoryMap.size} unique categories`);

    // Create or update categories in database
    const categoryDocs = new Map<string, any>();

    for (const [slug, catData] of categoryMap) {
      const existing = await Category.findOne({
        slug,
        navigation_id: navigation._id,
      });

      let category;
      if (existing) {
        category = await Category.findByIdAndUpdate(
          existing._id,
          {
            title: catData.title,
            slug: catData.slug,
            description: catData.description,
            navigation_id: navigation._id,
          },
          { new: true },
        );
        logger.log(`✏️  Updated category: ${slug}`);
      } else {
        category = await Category.create({
          title: catData.title,
          slug: catData.slug,
          description: catData.description,
          navigation_id: navigation._id,
          is_subcategory: false,
          depth: 0,
        });
        logger.log(`✨ Created category: ${slug}`);
      }

      categoryDocs.set(slug, category);
    }

    // Link products to categories based on inferred category
    let linkedCount = 0;
    for (const product of products) {
      const title = product.title?.toLowerCase() || '';
      let categoryFound = false;

      for (const [categorySlug, keywords] of Object.entries(titleKeywords)) {
        if (keywords.some((keyword) => title.includes(keyword))) {
          const categoryDoc = categoryDocs.get(categorySlug);
          if (categoryDoc && !product.categories?.includes(categoryDoc._id)) {
            await Product.findByIdAndUpdate(
              product._id,
              {
                categories: [categoryDoc._id],
              },
              { new: true },
            );
            linkedCount++;
            categoryFound = true;
          }
          break;
        }
      }

      // If no category was inferred, assign to "Fiction" as default
      if (!categoryFound) {
        const defaultCat = categoryDocs.get('fiction');
        if (defaultCat && !product.categories?.includes(defaultCat._id)) {
          await Product.findByIdAndUpdate(
            product._id,
            {
              categories: [defaultCat._id],
            },
            { new: true },
          );
          linkedCount++;
        }
      }
    }

    logger.log(`🔗 Linked ${linkedCount} products to categories`);

    // Update product counts for categories
    for (const [slug, category] of categoryDocs) {
      const count = await Product.countDocuments({
        categories: category._id,
      });

      await Category.findByIdAndUpdate(
        category._id,
        { product_count: count },
        { new: true },
      );

      logger.log(`📊 Category "${slug}": ${count} products`);
    }

    logger.log('✅ Category population complete!');
  } catch (error) {
    logger.error('❌ Error populating categories:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

// Run the script
connectDatabase()
  .then(() => populateCategories())
  .catch((error) => {
    logger.error('❌ Fatal error:', error);
    process.exit(1);
  });
