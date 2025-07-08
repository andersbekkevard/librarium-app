import { googleBooksApi, GoogleBooksApiService, getBestThumbnail, getBestISBN, formatAuthors } from '../google-books-api'

describe('Google Books API Service', () => {
  let mockFetch: jest.Mock
  let originalFetch: typeof global.fetch
  let originalWarn: typeof console.warn

  beforeAll(() => {
    originalFetch = global.fetch
    global.fetch = jest.fn()
    originalWarn = console.warn
    console.warn = jest.fn()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch = global.fetch as jest.Mock
    process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY = 'test-api-key'
  })

  afterAll(() => {
    global.fetch = originalFetch
    console.warn = originalWarn
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with API key from environment', () => {
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
    it('should handle rate limit exceeded error (429)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      })

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'Rate limit exceeded. Please try again later.'
      )
    })

    it('should handle invalid API key error (403)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      })

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'API key invalid or quota exceeded.'
      )
    })

    it('should handle invalid search query error (400)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      })

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'Invalid search query.'
      )
    })

    it('should handle generic API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'API error: 500 Internal Server Error'
      )
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new TypeError('Network error'))

      await expect(googleBooksApi.search('test')).rejects.toThrow(
        'Network error. Please check your connection and try again.'
      )
    })
  })

  describe('searchBooks', () => {
    const mockResponse = {
      items: [
        { id: '1', volumeInfo: { title: 'Book 1' } },
        { id: '2', volumeInfo: { title: 'Book 2' } },
      ],
      totalItems: 2,
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    })

    it('should search books with basic query', async () => {
      const result = await googleBooksApi.searchBooks({ query: 'test book' })

      expect(result).toEqual(mockResponse.items)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=test+book&maxResults=10&key=test-api-key'
      )
    })

    it('should handle all search options', async () => {
      const options = {
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

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=test+book&maxResults=20&startIndex=10&printType=books&filter=free-ebooks&download=epub&langRestrict=en&orderBy=newest&key=test-api-key'
      )
    })

    it('should return empty array if query is empty or whitespace', async () => {
      expect(await googleBooksApi.searchBooks({ query: '' })).toEqual([])
      expect(await googleBooksApi.searchBooks({ query: '   ' })).toEqual([])
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should throw error when not configured', async () => {
      delete process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
      const service = new GoogleBooksApiService()

      await expect(service.searchBooks({ query: 'test' })).rejects.toThrow(
        'Google Books API key is not configured'
      )
    })

    it('should trim query whitespace', async () => {
      await googleBooksApi.searchBooks({ query: '  test book  ' })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=test+book&maxResults=10&key=test-api-key'
      )
    })

    it('should limit maxResults to 40', async () => {
      await googleBooksApi.searchBooks({ query: 'test', maxResults: 50 })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=test&maxResults=40&key=test-api-key'
      )
    })
  })

  describe('search', () => {
    const mockResponse = {
      items: [{ id: '1', volumeInfo: { title: 'Book 1' } }],
      totalItems: 1,
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    })

    it('should call searchBooks with default maxResults', async () => {
      const searchBooksSpy = jest.spyOn(googleBooksApi, 'searchBooks')
      await googleBooksApi.search('test')
      expect(searchBooksSpy).toHaveBeenCalledWith({ query: 'test', maxResults: 10 })
    })

    it('should call searchBooks with custom maxResults', async () => {
      const searchBooksSpy = jest.spyOn(googleBooksApi, 'searchBooks')
      await googleBooksApi.search('test', 5)
      expect(searchBooksSpy).toHaveBeenCalledWith({ query: 'test', maxResults: 5 })
    })
  })

  describe('getBookDetails', () => {
    const mockBookDetails = { id: 'test-id', volumeInfo: { title: 'Detailed Book' } }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBookDetails),
      })
    })

    it('should get book details by volume ID', async () => {
      const result = await googleBooksApi.getBookDetails('test-id')
      expect(result).toEqual(mockBookDetails)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes/test-id?key=test-api-key'
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
    it('should search by ISBN and clean it', async () => {
      const searchBooksSpy = jest.spyOn(googleBooksApi, 'searchBooks')
      await googleBooksApi.searchByISBN('978-1234567890')
      expect(searchBooksSpy).toHaveBeenCalledWith({
        query: 'isbn:9781234567890',
        maxResults: 5,
      })
    })
  })

  describe('searchByTitle', () => {
    it('should search by title', async () => {
      const searchBooksSpy = jest.spyOn(googleBooksApi, 'searchBooks')
      await googleBooksApi.searchByTitle('My Book')
      expect(searchBooksSpy).toHaveBeenCalledWith({
        query: 'intitle:"My Book"',
        maxResults: 10,
      })
    })
  })

  describe('searchByAuthor', () => {
    it('should search by author', async () => {
      const searchBooksSpy = jest.spyOn(googleBooksApi, 'searchBooks')
      await googleBooksApi.searchByAuthor('John Doe')
      expect(searchBooksSpy).toHaveBeenCalledWith({
        query: 'inauthor:"John Doe"',
        maxResults: 10,
      })
    })
  })

  describe('advancedSearch', () => {
    it('should perform advanced search with multiple parameters', async () => {
      const searchBooksSpy = jest.spyOn(googleBooksApi, 'searchBooks')
      const params = {
        title: 'Advanced Title',
        author: 'Advanced Author',
        isbn: '123-456',
        category: 'Fiction',
        publisher: 'Publisher Co.',
        language: 'fr',
        maxResults: 15,
        orderBy: 'newest' as const,
      }
      await googleBooksApi.advancedSearch(params)
      expect(searchBooksSpy).toHaveBeenCalledWith({
        query: 'intitle:"Advanced Title" inauthor:"Advanced Author" isbn:123456 subject:"Fiction" inpublisher:"Publisher Co."',
        maxResults: 15,
        orderBy: 'newest',
        langRestrict: 'fr',
      })
    })

    it('should throw error if no search parameters are provided', async () => {
      await expect(googleBooksApi.advancedSearch({})).rejects.toThrow(
        'At least one search parameter is required'
      )
    })
  })

  describe('searchFreeEbooks', () => {
    it('should search for free ebooks', async () => {
      const searchBooksSpy = jest.spyOn(googleBooksApi, 'searchBooks')
      await googleBooksApi.searchFreeEbooks('free book')
      expect(searchBooksSpy).toHaveBeenCalledWith({
        query: 'free book',
        maxResults: 10,
        filter: 'free-ebooks',
      })
    })
  })

  describe('Static Utility Functions', () => {
    it('getBestThumbnail should return the best available thumbnail', () => {
      const volume = {
        volumeInfo: {
          imageLinks: {
            smallThumbnail: 'small.jpg',
            thumbnail: 'thumb.jpg',
            small: 'small_full.jpg',
            medium: 'medium.jpg',
          },
        },
      } as any
      expect(getBestThumbnail(volume)).toBe('medium.jpg')

      volume.volumeInfo.imageLinks.medium = undefined
      expect(getBestThumbnail(volume)).toBe('small_full.jpg')

      volume.volumeInfo.imageLinks.small = undefined
      expect(getBestThumbnail(volume)).toBe('thumb.jpg')

      volume.volumeInfo.imageLinks.thumbnail = undefined
      expect(getBestThumbnail(volume)).toBe('small.jpg')

      volume.volumeInfo.imageLinks.smallThumbnail = undefined
      expect(getBestThumbnail(volume)).toBeUndefined()

      volume.volumeInfo.imageLinks = undefined
      expect(getBestThumbnail(volume)).toBeUndefined()
    })

    it('getBestISBN should return ISBN-13 if available, otherwise ISBN-10', () => {
      const volumeWithIsbn13 = {
        volumeInfo: {
          industryIdentifiers: [
            { type: 'ISBN_10', identifier: '123456789X' },
            { type: 'ISBN_13', identifier: '9781234567890' },
          ],
        },
      } as any
      expect(getBestISBN(volumeWithIsbn13)).toBe('9781234567890')

      const volumeWithIsbn10 = {
        volumeInfo: {
          industryIdentifiers: [
            { type: 'ISBN_10', identifier: '123456789X' },
          ],
        },
      } as any
      expect(getBestISBN(volumeWithIsbn10)).toBe('123456789X')

      const volumeWithoutIsbn = {
        volumeInfo: {
          industryIdentifiers: [],
        },
      } as any
      expect(getBestISBN(volumeWithoutIsbn)).toBeUndefined()

      const volumeWithOtherIdentifier = {
        volumeInfo: {
          industryIdentifiers: [
            { type: 'OTHER', identifier: 'some-other-id' },
          ],
        },
      } as any
      expect(getBestISBN(volumeWithOtherIdentifier)).toBeUndefined()

      const volumeWithoutIdentifiers = { volumeInfo: {} } as any
      expect(getBestISBN(volumeWithoutIdentifiers)).toBeUndefined()
    })

    it('formatAuthors should format author names correctly', () => {
      expect(formatAuthors(['Author One'])).toBe('Author One')
      expect(formatAuthors(['Author One', 'Author Two'])).toBe('Author One and Author Two')
      expect(formatAuthors(['Author One', 'Author Two', 'Author Three'])).toBe('Author One, Author Two and Author Three')
      expect(formatAuthors([])).toBe('Unknown Author')
      expect(formatAuthors(undefined)).toBe('Unknown Author')
    })
  })

  describe('Singleton Instance', () => {
    it('should export a singleton instance', () => {
      expect(googleBooksApi).toBeInstanceOf(GoogleBooksApiService)
      expect(googleBooksApi.isConfigured()).toBe(true)
    })
  })
})
