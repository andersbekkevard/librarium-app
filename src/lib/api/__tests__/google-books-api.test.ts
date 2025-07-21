import { GoogleBooksApiService, getBestThumbnail, getBestISBN, formatAuthors } from '../google-books-api';

describe('Google Books API Service', () => {
  let googleBooksApi: GoogleBooksApiService;
  let originalApiKey: string | undefined;

  beforeEach(() => {
    originalApiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    jest.resetModules(); // Clears the cache
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY = originalApiKey;
  });

  describe('Configuration', () => {
    it('should be configured when API key is present', () => {
      process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY = 'test-key';
      googleBooksApi = new GoogleBooksApiService();
      const result = googleBooksApi.isConfigured();
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should not be configured when API key is missing', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
      googleBooksApi = new GoogleBooksApiService();
      const result = googleBooksApi.isConfigured();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});