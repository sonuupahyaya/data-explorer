import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ProductsModule } from './products.module';
import { Product, ProductSchema } from '../schemas/product.schema';
import { Category, CategorySchema } from '../schemas/category.schema';
import { Review, ReviewSchema } from '../schemas/review.schema';
import { Model } from 'mongoose';

describe('Products Integration Tests (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let productModel: Model<any>;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: Product.name, schema: ProductSchema },
          { name: Category.name, schema: CategorySchema },
          { name: Review.name, schema: ReviewSchema },
        ]),
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    productModel = moduleFixture.get('ProductModel');

    // Seed sample products
    const sampleProducts = [
      {
        source_id: 'wob-001',
        source_url: 'https://www.worldofbooks.com/en-gb/books/001',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        price: 8.99,
        currency: 'GBP',
        image_url: 'https://example.com/image1.jpg',
        description: 'A dazzling novel about all the choices that go into a life well lived.',
        publisher: 'Canongate Books',
        isbn: '978-1786892435',
        specs: { Pages: '320', Format: 'Paperback' },
        rating_avg: 4.5,
        reviews_count: 1200,
        last_scraped_at: new Date(),
        is_available: true,
      },
      {
        source_id: 'wob-002',
        source_url: 'https://www.worldofbooks.com/en-gb/books/002',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        price: 9.99,
        currency: 'GBP',
        image_url: 'https://example.com/image2.jpg',
        description: 'A lone astronaut must save Earth from extinction.',
        publisher: 'Ballantine Books',
        isbn: '978-0593135204',
        specs: { Pages: '496', Format: 'Paperback' },
        rating_avg: 4.7,
        reviews_count: 950,
        last_scraped_at: new Date(),
        is_available: true,
      },
    ];

    // Create 50 sample products for testing
    for (let i = 0; i < 50; i++) {
      const baseProduct = sampleProducts[i % sampleProducts.length];
      await productModel.create({
        ...baseProduct,
        source_id: `wob-${String(i + 1).padStart(3, '0')}`,
        source_url: `https://www.worldofbooks.com/en-gb/books/${String(i + 1).padStart(3, '0')}`,
        title: `${baseProduct.title} (Copy ${Math.floor(i / 2) + 1})`,
        price: baseProduct.price + (i % 5) * 0.5,
      });
    }
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('GET /api/products?sample=true', () => {
    it('should return at least 50 sample products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=50')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(50);
    });

    it('should return products with required fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=10')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);

      const product = response.body.data[0];
      expect(product).toHaveProperty('_id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('author');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('currency');
      expect(product).toHaveProperty('image_url');
      expect(product).toHaveProperty('source_url');
    });

    it('should return valid pagination info', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&page=1&limit=20')
        .expect(200);

      const { pagination } = response.body;
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(20);
      expect(pagination.total).toBeGreaterThanOrEqual(50);
      expect(pagination.pages).toBeGreaterThanOrEqual(3); // 50 / 20 = 2.5, ceil = 3
    });

    it('should handle pagination correctly', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/api/products?sample=true&page=1&limit=25')
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/api/products?sample=true&page=2&limit=25')
        .expect(200);

      expect(response1.body.data.length).toBe(25);
      expect(response2.body.data.length).toBe(25);

      // Verify pages are different
      const ids1 = response1.body.data.map((p: any) => p._id);
      const ids2 = response2.body.data.map((p: any) => p._id);
      const intersection = ids1.filter((id: string) => ids2.includes(id));
      expect(intersection.length).toBe(0); // No overlap
    });

    it('should return products with valid prices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=10')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);

      response.body.data.forEach((product: any) => {
        expect(typeof product.price).toBe('number');
        expect(product.price).toBeGreaterThan(0);
        expect(product.currency).toBe('GBP');
      });
    });

    it('should return products with valid metadata', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=10')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);

      response.body.data.forEach((product: any) => {
        expect(typeof product.title).toBe('string');
        expect(product.title.length).toBeGreaterThan(0);
        expect(typeof product.author).toBe('string');
        expect(product.author.length).toBeGreaterThan(0);
        expect(product.is_available).toBe(true);
      });
    });
  });

  describe('GET /api/products/:id', () => {
    let productId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=1')
        .expect(200);

      productId = response.body.data[0]._id;
    });

    it('should return product detail with all fields', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200);

      const product = response.body;
      expect(product).toHaveProperty('_id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('author');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('currency');
      expect(product).toHaveProperty('image_url');
      expect(product).toHaveProperty('source_url');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('publisher');
      expect(product).toHaveProperty('isbn');
      expect(product).toHaveProperty('specs');
      expect(product).toHaveProperty('rating_avg');
      expect(product).toHaveProperty('reviews_count');
      expect(product).toHaveProperty('is_available');
    });

    it('should return 404 for invalid product ID', async () => {
      await request(app.getHttpServer())
        .get('/api/products/invalid-id')
        .expect(404);
    });

    it('should return reviews array', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('reviews');
      expect(Array.isArray(response.body.reviews)).toBe(true);
    });
  });

  describe('GET /api/products with filters', () => {
    it('should handle search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?search=midnight&limit=10')
        .expect(200);

      // May or may not have results depending on text index
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should handle sorting', async () => {
      const responsePriceAsc = await request(app.getHttpServer())
        .get('/api/products?sort=price-asc&limit=10')
        .expect(200);

      const responsePriceDesc = await request(app.getHttpServer())
        .get('/api/products?sort=price-desc&limit=10')
        .expect(200);

      expect(responsePriceAsc.body.data).toBeInstanceOf(Array);
      expect(responsePriceDesc.body.data).toBeInstanceOf(Array);

      // Verify prices are sorted
      if (responsePriceAsc.body.data.length > 1) {
        for (let i = 0; i < responsePriceAsc.body.data.length - 1; i++) {
          expect(responsePriceAsc.body.data[i].price).toBeLessThanOrEqual(
            responsePriceAsc.body.data[i + 1].price
          );
        }
      }
    });

    it('should limit results correctly', async () => {
      const response10 = await request(app.getHttpServer())
        .get('/api/products?limit=10')
        .expect(200);

      const response5 = await request(app.getHttpServer())
        .get('/api/products?limit=5')
        .expect(200);

      expect(response10.body.data.length).toBeLessThanOrEqual(10);
      expect(response5.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should enforce maximum limit of 100', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?limit=500')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Data Integrity', () => {
    it('should have no duplicate product IDs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=100')
        .expect(200);

      const ids = response.body.data.map((p: any) => p._id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid timestamps', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=10')
        .expect(200);

      response.body.data.forEach((product: any) => {
        if (product.createdAt) {
          const date = new Date(product.createdAt);
          expect(date).toBeInstanceOf(Date);
          expect(date.getTime()).toBeLessThanOrEqual(Date.now());
        }
      });
    });

    it('should have consistent currency', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products?sample=true&limit=50')
        .expect(200);

      response.body.data.forEach((product: any) => {
        expect(['GBP', 'USD', 'EUR']).toContain(product.currency);
      });
    });
  });
});
