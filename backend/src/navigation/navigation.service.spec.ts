import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NavigationService } from './navigation.service';
import { Navigation } from '../schemas/navigation.schema';
import { Category } from '../schemas/category.schema';
import { ScraperService } from '../scraper/scraper.service';

describe('NavigationService', () => {
  let service: NavigationService;

  const mockNavigationModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };

  const mockCategoryModel = {
    find: jest.fn(),
  };

  const mockScraperService = {
    scrapeNavigation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NavigationService,
        {
          provide: getModelToken(Navigation.name),
          useValue: mockNavigationModel,
        },
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
        {
          provide: ScraperService,
          useValue: mockScraperService,
        },
      ],
    }).compile();

    service = module.get<NavigationService>(NavigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNavigation', () => {
    it('should return cached navigation items', async () => {
      const mockNav = [
        { _id: '1', slug: 'books', title: 'Books' },
      ];

      mockNavigationModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNav),
        }),
      });

      const result = await service.getNavigation();
      expect(result).toEqual(mockNav);
    });
  });

  describe('refreshNavigation', () => {
    it('should scrape and update navigation', async () => {
      const scraped = {
        headings: [
          { title: 'Books', slug: 'books', url: 'http://example.com/books' },
        ],
      };

      mockScraperService.scrapeNavigation.mockResolvedValue(scraped);

      mockNavigationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: '1', slug: 'books', title: 'Books' }),
      });

      const result = await service.refreshNavigation();
      expect(result).toBeDefined();
      expect(mockNavigationModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
