import { Timestamp } from 'firebase/firestore'
import {
  convertGoogleBookToBook,
  convertManualEntryToBook,
  filterAndSortBooks,
  calculateBookProgress,
} from '../book-utils'
import { GoogleBooksVolume } from '../google-books-api'
import { Book } from '../models'

// Mock Firebase Timestamp
jest.mock('firebase/firestore', () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}))

// Mock the google-books-api utility functions
jest.mock('../google-books-api', () => ({
  ...jest.requireActual('../google-books-api'),
  getBestISBN: jest.fn(),
  getBestThumbnail: jest.fn(),
  formatAuthors: jest.fn(),
}))

import { getBestISBN, getBestThumbnail, formatAuthors } from '../google-books-api'

const mockGetBestISBN = getBestISBN as jest.MockedFunction<typeof getBestISBN>
const mockGetBestThumbnail = getBestThumbnail as jest.MockedFunction<typeof getBestThumbnail>
const mockFormatAuthors = formatAuthors as jest.MockedFunction<typeof formatAuthors>

describe('Book Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset Timestamp.now mock
    ;(Timestamp.now as jest.Mock).mockReturnValue({
      seconds: 1234567890,
      nanoseconds: 0,
    })
  })

  describe('convertGoogleBookToBook', () => {
    const mockGoogleBook: GoogleBooksVolume = {
      kind: 'books#volume',
      id: 'test-book-id',
      etag: 'test-etag',
      selfLink: 'https://www.googleapis.com/books/v1/volumes/test-book-id',
      volumeInfo: {
        title: 'Test Book',
        authors: ['Test Author'],
        description: 'A test book description',
        pageCount: 200,
        publishedDate: '2023-01-01',
        categories: ['Fiction'],
        imageLinks: {
          thumbnail: 'https://example.com/thumbnail.jpg',
        },
      },
    }

    it('should convert a Google Book to internal Book model', () => {
      mockFormatAuthors.mockReturnValue('Test Author')
      mockGetBestISBN.mockReturnValue('1234567890')
      mockGetBestThumbnail.mockReturnValue('https://example.com/thumbnail.jpg')

      const result = convertGoogleBookToBook(mockGoogleBook)

      expect(result).toEqual({
        id: 'test-book-id',
        title: 'Test Book',
        author: 'Test Author',
        state: 'not_started',
        progress: {
          currentPage: 0,
          totalPages: 200,
        },
        genre: 'Fiction',
        isOwned: false,
        isbn: '1234567890',
        coverImage: 'https://example.com/thumbnail.jpg',
        publishedDate: '2023-01-01',
        description: 'A test book description',
        addedAt: { seconds: 1234567890, nanoseconds: 0 },
        updatedAt: { seconds: 1234567890, nanoseconds: 0 },
      })
    })

    it('should handle missing optional fields', () => {
      const minimalGoogleBook: GoogleBooksVolume = {
        kind: 'books#volume',
        id: 'minimal-book-id',
        etag: 'test-etag',
        selfLink: 'https://www.googleapis.com/books/v1/volumes/minimal-book-id',
        volumeInfo: {
          title: 'Minimal Book',
          authors: ['Author Name'],
        },
      }

      mockFormatAuthors.mockReturnValue('Author Name')
      mockGetBestISBN.mockReturnValue(undefined)
      mockGetBestThumbnail.mockReturnValue(undefined)

      const result = convertGoogleBookToBook(minimalGoogleBook)

      expect(result).toEqual({
        id: 'minimal-book-id',
        title: 'Minimal Book',
        author: 'Author Name',
        state: 'not_started',
        progress: {
          currentPage: 0,
          totalPages: 0,
        },
        genre: '',
        isOwned: false,
        addedAt: { seconds: 1234567890, nanoseconds: 0 },
        updatedAt: { seconds: 1234567890, nanoseconds: 0 },
      })

      // Should not have optional fields
      expect(result.isbn).toBeUndefined()
      expect(result.coverImage).toBeUndefined()
      expect(result.publishedDate).toBeUndefined()
      expect(result.description).toBeUndefined()
    })

    it('should handle missing page count', () => {
      const bookWithoutPages: GoogleBooksVolume = {
        kind: 'books#volume',
        id: 'no-pages-book',
        etag: 'test-etag',
        selfLink: 'https://www.googleapis.com/books/v1/volumes/no-pages-book',
        volumeInfo: {
          title: 'No Pages Book',
          authors: ['Author'],
        },
      }

      mockFormatAuthors.mockReturnValue('Author')
      mockGetBestISBN.mockReturnValue(undefined)
      mockGetBestThumbnail.mockReturnValue(undefined)

      const result = convertGoogleBookToBook(bookWithoutPages)

      expect(result.progress.totalPages).toBe(0)
    })

    it('should handle missing categories', () => {
      const bookWithoutCategories: GoogleBooksVolume = {
        kind: 'books#volume',
        id: 'no-categories-book',
        etag: 'test-etag',
        selfLink: 'https://www.googleapis.com/books/v1/volumes/no-categories-book',
        volumeInfo: {
          title: 'No Categories Book',
          authors: ['Author'],
        },
      }

      mockFormatAuthors.mockReturnValue('Author')

      const result = convertGoogleBookToBook(bookWithoutCategories)

      expect(result.genre).toBe('')
    })
  })

  describe('convertManualEntryToBook', () => {
    const mockFormData = {
      title: 'Manual Book',
      author: 'Manual Author',
      genre: 'Fantasy',
      pages: '300',
      publishedYear: '2022',
      ownership: 'owned',
      description: 'A manually entered book',
    }

    it('should convert form data to internal Book model', () => {
      const result = convertManualEntryToBook(mockFormData)

      expect(result.title).toBe('Manual Book')
      expect(result.author).toBe('Manual Author')
      expect(result.genre).toBe('Fantasy')
      expect(result.progress.totalPages).toBe(300)
      expect(result.publishedDate).toBe('2022-01-01')
      expect(result.isOwned).toBe(true)
      expect(result.description).toBe('A manually entered book')
      expect(result.state).toBe('not_started')
      expect(result.progress.currentPage).toBe(0)
    })

    it('should handle wishlist ownership', () => {
      const wishlistFormData = {
        ...mockFormData,
        ownership: 'wishlist',
      }

      const result = convertManualEntryToBook(wishlistFormData)

      expect(result.isOwned).toBe(false)
    })

    it('should handle empty optional fields', () => {
      const minimalFormData = {
        title: 'Minimal Book',
        author: 'Author',
        genre: '',
        pages: '',
        publishedYear: '',
        ownership: 'owned',
        description: '',
      }

      const result = convertManualEntryToBook(minimalFormData)

      expect(result.title).toBe('Minimal Book')
      expect(result.author).toBe('Author')
      expect(result.progress.totalPages).toBe(0)
      expect(result.isOwned).toBe(true)
      expect(result.genre).toBeUndefined()
      expect(result.publishedDate).toBeUndefined()
      expect(result.description).toBeUndefined()
    })

    it('should trim whitespace from inputs', () => {
      const dataWithWhitespace = {
        title: '  Whitespace Book  ',
        author: '  Whitespace Author  ',
        genre: '  Fantasy  ',
        pages: '300',
        publishedYear: '  2022  ',
        ownership: 'owned',
        description: '  Description with spaces  ',
      }

      const result = convertManualEntryToBook(dataWithWhitespace)

      expect(result.title).toBe('Whitespace Book')
      expect(result.author).toBe('Whitespace Author')
      expect(result.genre).toBe('Fantasy')
      expect(result.publishedDate).toBe('2022-01-01')
      expect(result.description).toBe('Description with spaces')
    })

    it('should handle invalid page numbers', () => {
      const invalidPagesData = {
        ...mockFormData,
        pages: 'invalid',
      }

      const result = convertManualEntryToBook(invalidPagesData)

      expect(result.progress.totalPages).toBe(0)
    })

    it('should generate unique IDs', () => {
      const result1 = convertManualEntryToBook(mockFormData)
      const result2 = convertManualEntryToBook(mockFormData)

      expect(result1.id).toMatch(/^manual-\d+$/)
      expect(result2.id).toMatch(/^manual-\d+$/)
      expect(result1.id).not.toBe(result2.id)
    })
  })

  describe('filterAndSortBooks', () => {
    const mockBooks: Book[] = [
      {
        id: '1',
        title: 'Alpha Book',
        author: 'Alpha Author',
        state: 'not_started',
        progress: { currentPage: 0, totalPages: 100 },
        isOwned: true,
        rating: 4,
        description: 'First book in alphabet',
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      },
      {
        id: '2',
        title: 'Beta Book',
        author: 'Beta Author',
        state: 'in_progress',
        progress: { currentPage: 50, totalPages: 200 },
        isOwned: false,
        rating: 5,
        description: 'Second book in alphabet',
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      },
      {
        id: '3',
        title: 'Gamma Book',
        author: 'Gamma Author',
        state: 'finished',
        progress: { currentPage: 300, totalPages: 300 },
        isOwned: true,
        rating: 3,
        description: 'Third book in alphabet',
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      },
    ]

    describe('filtering', () => {
      it('should filter by search query (title)', () => {
        const result = filterAndSortBooks(
          mockBooks,
          'Alpha',
          'all',
          'all',
          'title',
          'asc'
        )

        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('Alpha Book')
      })

      it('should filter by search query (author)', () => {
        const result = filterAndSortBooks(
          mockBooks,
          'Beta Author',
          'all',
          'all',
          'title',
          'asc'
        )

        expect(result).toHaveLength(1)
        expect(result[0].author).toBe('Beta Author')
      })

      it('should filter by search query (description)', () => {
        const result = filterAndSortBooks(
          mockBooks,
          'Third book',
          'all',
          'all',
          'title',
          'asc'
        )

        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('Gamma Book')
      })

      it('should filter by reading state', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'in_progress',
          'all',
          'title',
          'asc'
        )

        expect(result).toHaveLength(1)
        expect(result[0].state).toBe('in_progress')
      })

      it('should filter by ownership status', () => {
        const ownedResult = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'owned',
          'title',
          'asc'
        )

        expect(ownedResult).toHaveLength(2)
        expect(ownedResult.every(book => book.isOwned)).toBe(true)

        const wishlistResult = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'wishlist',
          'title',
          'asc'
        )

        expect(wishlistResult).toHaveLength(1)
        expect(wishlistResult[0].isOwned).toBe(false)
      })

      it('should apply multiple filters', () => {
        const result = filterAndSortBooks(
          mockBooks,
          'Book',
          'not_started',
          'owned',
          'title',
          'asc'
        )

        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('Alpha Book')
        expect(result[0].state).toBe('not_started')
        expect(result[0].isOwned).toBe(true)
      })

      it('should handle case-insensitive search', () => {
        const result = filterAndSortBooks(
          mockBooks,
          'ALPHA',
          'all',
          'all',
          'title',
          'asc'
        )

        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('Alpha Book')
      })

      it('should return empty array when no matches', () => {
        const result = filterAndSortBooks(
          mockBooks,
          'NonExistent',
          'all',
          'all',
          'title',
          'asc'
        )

        expect(result).toHaveLength(0)
      })
    })

    describe('sorting', () => {
      it('should sort by title ascending', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'all',
          'title',
          'asc'
        )

        expect(result[0].title).toBe('Alpha Book')
        expect(result[1].title).toBe('Beta Book')
        expect(result[2].title).toBe('Gamma Book')
      })

      it('should sort by title descending', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'all',
          'title',
          'desc'
        )

        expect(result[0].title).toBe('Gamma Book')
        expect(result[1].title).toBe('Beta Book')
        expect(result[2].title).toBe('Alpha Book')
      })

      it('should sort by author', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'all',
          'author',
          'asc'
        )

        expect(result[0].author).toBe('Alpha Author')
        expect(result[1].author).toBe('Beta Author')
        expect(result[2].author).toBe('Gamma Author')
      })

      it('should sort by pages', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'all',
          'pages',
          'asc'
        )

        expect(result[0].progress.totalPages).toBe(100)
        expect(result[1].progress.totalPages).toBe(200)
        expect(result[2].progress.totalPages).toBe(300)
      })

      it('should sort by rating', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'all',
          'rating',
          'desc'
        )

        expect(result[0].rating).toBe(5)
        expect(result[1].rating).toBe(4)
        expect(result[2].rating).toBe(3)
      })

      it('should sort by progress', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'all',
          'progress',
          'asc'
        )

        // not_started: 0%, in_progress: 25%, finished: 100%
        expect(result[0].state).toBe('not_started')
        expect(result[1].state).toBe('in_progress')
        expect(result[2].state).toBe('finished')
      })

      it('should handle books without ratings', () => {
        const booksWithoutRatings = mockBooks.map(book => ({
          ...book,
          rating: undefined,
        }))

        const result = filterAndSortBooks(
          booksWithoutRatings,
          '',
          'all',
          'all',
          'rating',
          'desc'
        )

        expect(result).toHaveLength(3)
        // All books should have rating treated as 0
      })

      it('should handle unknown sort field', () => {
        const result = filterAndSortBooks(
          mockBooks,
          '',
          'all',
          'all',
          'unknown',
          'asc'
        )

        // Should fall back to title sorting
        expect(result[0].title).toBe('Alpha Book')
        expect(result[1].title).toBe('Beta Book')
        expect(result[2].title).toBe('Gamma Book')
      })
    })
  })

  describe('calculateBookProgress', () => {
    it('should return 100 for finished books', () => {
      const finishedBook: Book = {
        id: '1',
        title: 'Finished Book',
        author: 'Author',
        state: 'finished',
        progress: { currentPage: 100, totalPages: 100 },
        isOwned: true,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }

      expect(calculateBookProgress(finishedBook)).toBe(100)
    })

    it('should return 0 for not started books', () => {
      const notStartedBook: Book = {
        id: '1',
        title: 'Not Started Book',
        author: 'Author',
        state: 'not_started',
        progress: { currentPage: 0, totalPages: 100 },
        isOwned: true,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }

      expect(calculateBookProgress(notStartedBook)).toBe(0)
    })

    it('should calculate progress for in-progress books', () => {
      const inProgressBook: Book = {
        id: '1',
        title: 'In Progress Book',
        author: 'Author',
        state: 'in_progress',
        progress: { currentPage: 50, totalPages: 100 },
        isOwned: true,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }

      expect(calculateBookProgress(inProgressBook)).toBe(50)
    })

    it('should handle partial progress calculation', () => {
      const book: Book = {
        id: '1',
        title: 'Book',
        author: 'Author',
        state: 'in_progress',
        progress: { currentPage: 33, totalPages: 100 },
        isOwned: true,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }

      expect(calculateBookProgress(book)).toBe(33)
    })

    it('should round progress to nearest integer', () => {
      const book: Book = {
        id: '1',
        title: 'Book',
        author: 'Author',
        state: 'in_progress',
        progress: { currentPage: 33, totalPages: 99 },
        isOwned: true,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }

      expect(calculateBookProgress(book)).toBe(33) // 33/99 = 33.33%, rounded to 33%
    })

    it('should handle edge cases', () => {
      const bookWithZeroPages: Book = {
        id: '1',
        title: 'Book',
        author: 'Author',
        state: 'in_progress',
        progress: { currentPage: 0, totalPages: 0 },
        isOwned: true,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }

      expect(calculateBookProgress(bookWithZeroPages)).toBe(0)

      const bookWithMissingPages: Book = {
        id: '1',
        title: 'Book',
        author: 'Author',
        state: 'in_progress',
        progress: { currentPage: undefined as any, totalPages: 100 },
        isOwned: true,
        addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
      }

      expect(calculateBookProgress(bookWithMissingPages)).toBe(0)
    })
  })
})