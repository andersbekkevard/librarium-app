import {
  GoogleBooksApiService,
  googleBooksApi,
  getBestThumbnail,
  getBestISBN,
  formatAuthors,
  type GoogleBooksVolume,
  type GoogleBooksSearchResponse,
  type SearchOptions,
  type AdvancedSearchParams,
} from '../google-books-api'

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Google Books API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variable
    process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY = 'test-api-key'
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with API key from environment', () => {
      process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY = 'my-test-key'
      const service = new GoogleBooksApiService()
      
      expect(service.isConfigured()).toBe(true)
    })

    it('should warn when API key is missing', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
      
      new GoogleBooksApiService()
      
      expect(console.warn).toHaveBeenCalledWith(
        'Google Books API key not found. Please set NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY in your environment variables.'
      )
    })

    it('should report as not configured when API key is missing', () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
      const service = new GoogleBooksApiService()
      
      expect(service.isConfigured()).toBe(false)
    })
  })

  describe('API Error Handling', () => {
    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response)

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'Rate limit exceeded. Please try again later.'
      )
    })

    it('should handle 403 forbidden error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response)

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'API key invalid or quota exceeded.'
      )
    })

    it('should handle 400 bad request error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response)

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'Invalid search query.'
      )
    })

    it('should handle generic HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'API error: 500 Internal Server Error'
      )
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'Network error. Please check your connection and try again.'
      )
    })

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValue('String error')

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'Network error. Please check your connection and try again.'
      )
    })
  })

  describe('searchBooks', () => {
    const mockResponse: GoogleBooksSearchResponse = {
      kind: 'books#volumes',
      totalItems: 1,
      items: [
        {
          kind: 'books#volume',
          id: 'test-id',
          etag: 'test-etag',
          selfLink: 'https://www.googleapis.com/books/v1/volumes/test-id',
          volumeInfo: {
            title: 'Test Book',
            authors: ['Test Author'],
          },
        },
      ],
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)
    })

    it('should search books with basic query', async () => {
      const options: SearchOptions = {
        query: 'test book',
      }

      const result = await googleBooksApi.searchBooks(options)

      expect(result).toEqual(mockResponse.items)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=test%20book')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=10')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('key=test-api-key')
      )
    })

    it('should handle all search options', async () => {
      const options: SearchOptions = {
        query: 'test book',
        maxResults: 20,
        startIndex: 10,
        printType: 'books',
        filter: 'free-ebooks',
        download: 'epub',
        langRestrict: 'en',
        orderBy: 'newest',
      }

      await googleBooksApi.searchBooks(options)

      const call = mockFetch.mock.calls[0][0] as string
      expect(call).toContain('q=test%20book')
      expect(call).toContain('maxResults=20')
      expect(call).toContain('startIndex=10')
      expect(call).toContain('printType=books')
      expect(call).toContain('filter=free-ebooks')
      expect(call).toContain('download=epub')
      expect(call).toContain('langRestrict=en')
      expect(call).toContain('orderBy=newest')
    })

    it('should limit maxResults to 40', async () => {
      const options: SearchOptions = {
        query: 'test',
        maxResults: 100,
      }

      await googleBooksApi.searchBooks(options)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=40')
      )
    })

    it('should return empty array for empty query', async () => {
      const result = await googleBooksApi.searchBooks({ query: '' })

      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return empty array for whitespace-only query', async () => {
      const result = await googleBooksApi.searchBooks({ query: '   ' })

      expect(result).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should throw error when not configured', async () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
      const service = new GoogleBooksApiService()

      await expect(service.searchBooks({ query: 'test' })).rejects.toThrow(
        'Google Books API key is not configured'
      )
    })

    it('should handle response without items', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ kind: 'books#volumes', totalItems: 0 }),
      } as Response)

      const result = await googleBooksApi.searchBooks({ query: 'test' })

      expect(result).toEqual([])
    })

    it('should trim query whitespace', async () => {
      await googleBooksApi.searchBooks({ query: '  test book  ' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=test%20book')
      )
    })
  })

  describe('Simple search method', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ kind: 'books#volumes', totalItems: 0, items: [] }),
      } as Response)
    })

    it('should call searchBooks with correct parameters', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.search('test query', 15)

      expect(spy).toHaveBeenCalledWith({
        query: 'test query',
        maxResults: 15,
      })
    })

    it('should use default maxResults', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.search('test query')

      expect(spy).toHaveBeenCalledWith({
        query: 'test query',
        maxResults: 10,
      })
    })
  })

  describe('getBookDetails', () => {
    const mockBook: GoogleBooksVolume = {
      kind: 'books#volume',
      id: 'test-id',
      etag: 'test-etag',
      selfLink: 'https://www.googleapis.com/books/v1/volumes/test-id',
      volumeInfo: {
        title: 'Test Book',
        authors: ['Test Author'],
      },
    }

    it('should get book details by volume ID', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBook),
      } as Response)

      const result = await googleBooksApi.getBookDetails('test-id')

      expect(result).toEqual(mockBook)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/volumes/test-id')
      )
    })

    it('should throw error when not configured', async () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
      const service = new GoogleBooksApiService()

      await expect(service.getBookDetails('test-id')).rejects.toThrow(
        'Google Books API key is not configured'
      )
    })
  })

  describe('searchByISBN', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ kind: 'books#volumes', totalItems: 0, items: [] }),
      } as Response)
    })

    it('should search by ISBN', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchByISBN('978-0123456789')

      expect(spy).toHaveBeenCalledWith({
        query: 'isbn:9780123456789',
        maxResults: 5,
      })
    })

    it('should clean ISBN (remove dashes and spaces)', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchByISBN('978-0-123-456-789')

      expect(spy).toHaveBeenCalledWith({
        query: 'isbn:9780123456789',
        maxResults: 5,
      })
    })

    it('should accept custom maxResults', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchByISBN('978-0123456789', 10)

      expect(spy).toHaveBeenCalledWith({
        query: 'isbn:9780123456789',
        maxResults: 10,
      })
    })
  })

  describe('searchByTitle', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ kind: 'books#volumes', totalItems: 0, items: [] }),
      } as Response)
    })

    it('should search by title', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchByTitle('The Great Gatsby')

      expect(spy).toHaveBeenCalledWith({
        query: 'intitle:"The Great Gatsby"',
        maxResults: 10,
      })
    })

    it('should accept custom maxResults', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchByTitle('Test Book', 15)

      expect(spy).toHaveBeenCalledWith({
        query: 'intitle:"Test Book"',
        maxResults: 15,
      })
    })
  })

  describe('searchByAuthor', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ kind: 'books#volumes', totalItems: 0, items: [] }),
      } as Response)
    })

    it('should search by author', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchByAuthor('F. Scott Fitzgerald')

      expect(spy).toHaveBeenCalledWith({
        query: 'inauthor:"F. Scott Fitzgerald"',
        maxResults: 10,
      })
    })

    it('should accept custom maxResults', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchByAuthor('Test Author', 20)

      expect(spy).toHaveBeenCalledWith({
        query: 'inauthor:"Test Author"',
        maxResults: 20,
      })
    })
  })

  describe('advancedSearch', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ kind: 'books#volumes', totalItems: 0, items: [] }),
      } as Response)
    })

    it('should build query with all parameters', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      const params: AdvancedSearchParams = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0123456789',
        category: 'Fiction',
        publisher: 'Test Publisher',
        language: 'en',
        maxResults: 15,
        orderBy: 'newest',
      }

      await googleBooksApi.advancedSearch(params)

      expect(spy).toHaveBeenCalledWith({
        query: 'intitle:"Test Book" inauthor:"Test Author" isbn:9780123456789 subject:"Fiction" inpublisher:"Test Publisher"',
        maxResults: 15,
        orderBy: 'newest',
        langRestrict: 'en',
      })
    })

    it('should handle partial parameters', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      const params: AdvancedSearchParams = {
        title: 'Test Book',
        author: 'Test Author',
      }

      await googleBooksApi.advancedSearch(params)

      expect(spy).toHaveBeenCalledWith({
        query: 'intitle:"Test Book" inauthor:"Test Author"',
        maxResults: 10,
        orderBy: undefined,
        langRestrict: undefined,
      })
    })

    it('should clean ISBN in advanced search', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      const params: AdvancedSearchParams = {
        isbn: '978-0-123-456-789',
      }

      await googleBooksApi.advancedSearch(params)

      expect(spy).toHaveBeenCalledWith({
        query: 'isbn:9780123456789',
        maxResults: 10,
        orderBy: undefined,
        langRestrict: undefined,
      })
    })

    it('should throw error with no parameters', async () => {
      await expect(googleBooksApi.advancedSearch({})).rejects.toThrow(
        'At least one search parameter is required'
      )
    })
  })

  describe('searchFreeEbooks', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ kind: 'books#volumes', totalItems: 0, items: [] }),
      } as Response)
    })

    it('should search for free ebooks', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchFreeEbooks('programming')

      expect(spy).toHaveBeenCalledWith({
        query: 'programming',
        maxResults: 10,
        filter: 'free-ebooks',
      })
    })

    it('should accept custom maxResults', async () => {
      const spy = jest.spyOn(googleBooksApi, 'searchBooks')
      
      await googleBooksApi.searchFreeEbooks('programming', 20)

      expect(spy).toHaveBeenCalledWith({
        query: 'programming',
        maxResults: 20,
        filter: 'free-ebooks',
      })
    })
  })

  describe('Utility Functions', () => {
    describe('getBestThumbnail', () => {
      it('should return medium image when available', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
            imageLinks: {
              thumbnail: 'thumbnail.jpg',
              small: 'small.jpg',
              medium: 'medium.jpg',
              large: 'large.jpg',
            },
          },
        }

        expect(getBestThumbnail(volume)).toBe('medium.jpg')
      })

      it('should fallback to small image', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
            imageLinks: {
              thumbnail: 'thumbnail.jpg',
              small: 'small.jpg',
            },
          },
        }

        expect(getBestThumbnail(volume)).toBe('small.jpg')
      })

      it('should fallback to thumbnail', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
            imageLinks: {
              thumbnail: 'thumbnail.jpg',
            },
          },
        }

        expect(getBestThumbnail(volume)).toBe('thumbnail.jpg')
      })

      it('should return undefined when no images', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
          },
        }

        expect(getBestThumbnail(volume)).toBeUndefined()
      })
    })

    describe('getBestISBN', () => {
      it('should prefer ISBN-13 over ISBN-10', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
            industryIdentifiers: [
              { type: 'ISBN_10', identifier: '0123456789' },
              { type: 'ISBN_13', identifier: '9780123456789' },
            ],
          },
        }

        expect(getBestISBN(volume)).toBe('9780123456789')
      })

      it('should return ISBN-10 when ISBN-13 not available', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
            industryIdentifiers: [
              { type: 'ISBN_10', identifier: '0123456789' },
            ],
          },
        }

        expect(getBestISBN(volume)).toBe('0123456789')
      })

      it('should return undefined when no ISBNs', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
          },
        }

        expect(getBestISBN(volume)).toBeUndefined()
      })

      it('should ignore non-ISBN identifiers', () => {
        const volume: GoogleBooksVolume = {
          kind: 'books#volume',
          id: 'test',
          etag: 'test',
          selfLink: 'test',
          volumeInfo: {
            title: 'Test',
            industryIdentifiers: [
              { type: 'ISSN', identifier: '12345678' },
              { type: 'OTHER', identifier: 'other123' },
            ],
          },
        }

        expect(getBestISBN(volume)).toBeUndefined()
      })
    })

    describe('formatAuthors', () => {
      it('should handle single author', () => {
        expect(formatAuthors(['John Doe'])).toBe('John Doe')
      })

      it('should handle two authors', () => {
        expect(formatAuthors(['John Doe', 'Jane Smith'])).toBe('John Doe and Jane Smith')
      })

      it('should handle three authors', () => {
        expect(formatAuthors(['John Doe', 'Jane Smith', 'Bob Johnson'])).toBe(
          'John Doe, Jane Smith and Bob Johnson'
        )
      })

      it('should handle many authors', () => {
        expect(formatAuthors(['A', 'B', 'C', 'D', 'E'])).toBe('A, B, C, D and E')
      })

      it('should handle no authors', () => {
        expect(formatAuthors([])).toBe('Unknown Author')
        expect(formatAuthors(undefined)).toBe('Unknown Author')
      })
    })
  })

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(googleBooksApi).toBeInstanceOf(GoogleBooksApiService)
      expect(googleBooksApi.isConfigured()).toBe(true)
    })
  })
})