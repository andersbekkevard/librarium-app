import {
  bookOperations,
  eventOperations,
  statsOperations,
  batchOperations,
} from '../firebase-utils'
import { Book, BookEvent } from '../models'

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
  writeBatch: jest.fn(),
}))

jest.mock('./firebase', () => ({
  db: {},
}))

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'

// Type the mocked functions
const mockCollection = collection as jest.MockedFunction<typeof collection>
const mockDoc = doc as jest.MockedFunction<typeof doc>
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockQuery = query as jest.MockedFunction<typeof query>
const mockWhere = where as jest.MockedFunction<typeof where>
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>
const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>
const mockWriteBatch = writeBatch as jest.MockedFunction<typeof writeBatch>

describe('Firebase Utils', () => {
  const userId = 'test-user-id'
  const bookId = 'test-book-id'

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup common mocks
    mockCollection.mockReturnValue({} as any)
    mockDoc.mockReturnValue({} as any)
    mockQuery.mockReturnValue({} as any)
    mockWhere.mockReturnValue({} as any)
    mockOrderBy.mockReturnValue({} as any)
  })

  describe('bookOperations', () => {
    describe('addBook', () => {
      it('should add a book with generated timestamps', async () => {
        const mockDocRef = { id: 'generated-id' }
        mockAddDoc.mockResolvedValue(mockDocRef as any)

        const bookData: Omit<Book, 'id' | 'addedAt' | 'updatedAt'> = {
          title: 'Test Book',
          author: 'Test Author',
          state: 'not_started',
          progress: { currentPage: 0, totalPages: 100 },
          isOwned: true,
        }

        const result = await bookOperations.addBook(userId, bookData)

        expect(result).toBe('generated-id')
        expect(mockCollection).toHaveBeenCalledWith({}, `users/${userId}/books`)
        expect(mockAddDoc).toHaveBeenCalledWith({}, {
          ...bookData,
          addedAt: { seconds: 1234567890, nanoseconds: 0 },
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
      })
    })

    describe('updateBook', () => {
      it('should update a book with new timestamp', async () => {
        const updates: Partial<Book> = {
          title: 'Updated Title',
          rating: 4,
        }

        await bookOperations.updateBook(userId, bookId, updates)

        expect(mockDoc).toHaveBeenCalledWith({}, `users/${userId}/books/${bookId}`)
        expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
          ...updates,
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
      })
    })

    describe('deleteBook', () => {
      it('should delete a book', async () => {
        await bookOperations.deleteBook(userId, bookId)

        expect(mockDoc).toHaveBeenCalledWith({}, `users/${userId}/books/${bookId}`)
        expect(mockDeleteDoc).toHaveBeenCalledWith({})
      })
    })

    describe('getBook', () => {
      it('should get a book when it exists', async () => {
        const mockBookData = {
          title: 'Test Book',
          author: 'Test Author',
          state: 'not_started',
        }

        const mockSnapshot = {
          exists: () => true,
          id: bookId,
          data: () => mockBookData,
        }

        mockGetDoc.mockResolvedValue(mockSnapshot as any)

        const result = await bookOperations.getBook(userId, bookId)

        expect(result).toEqual({
          id: bookId,
          ...mockBookData,
        })
        expect(mockDoc).toHaveBeenCalledWith({}, `users/${userId}/books/${bookId}`)
        expect(mockGetDoc).toHaveBeenCalledWith({})
      })

      it('should return null when book does not exist', async () => {
        const mockSnapshot = {
          exists: () => false,
        }

        mockGetDoc.mockResolvedValue(mockSnapshot as any)

        const result = await bookOperations.getBook(userId, bookId)

        expect(result).toBeNull()
      })
    })

    describe('getUserBooks', () => {
      it('should get all user books ordered by addedAt', async () => {
        const mockBooksData = [
          { title: 'Book 1', author: 'Author 1' },
          { title: 'Book 2', author: 'Author 2' },
        ]

        const mockSnapshot = {
          docs: mockBooksData.map((data, index) => ({
            id: `book-${index}`,
            data: () => data,
          })),
        }

        mockGetDocs.mockResolvedValue(mockSnapshot as any)

        const result = await bookOperations.getUserBooks(userId)

        expect(result).toEqual([
          { id: 'book-0', ...mockBooksData[0] },
          { id: 'book-1', ...mockBooksData[1] },
        ])
        expect(mockCollection).toHaveBeenCalledWith({}, `users/${userId}/books`)
        expect(mockQuery).toHaveBeenCalledWith({}, {}, {})
        expect(mockOrderBy).toHaveBeenCalledWith('addedAt', 'desc')
      })
    })

    describe('getBooksByState', () => {
      it('should get books filtered by state', async () => {
        const mockBooksData = [
          { title: 'Book 1', state: 'in_progress' },
        ]

        const mockSnapshot = {
          docs: mockBooksData.map((data, index) => ({
            id: `book-${index}`,
            data: () => data,
          })),
        }

        mockGetDocs.mockResolvedValue(mockSnapshot as any)

        const result = await bookOperations.getBooksByState(userId, 'in_progress')

        expect(result).toEqual([
          { id: 'book-0', ...mockBooksData[0] },
        ])
        expect(mockWhere).toHaveBeenCalledWith('state', '==', 'in_progress')
        expect(mockOrderBy).toHaveBeenCalledWith('updatedAt', 'desc')
      })
    })

    describe('subscribeToUserBooks', () => {
      it('should set up real-time listener for user books', () => {
        const callback = jest.fn()
        const mockUnsubscribe = jest.fn()

        mockOnSnapshot.mockImplementation((query, callbackFn) => {
          const mockSnapshot = {
            docs: [
              { id: 'book-1', data: () => ({ title: 'Book 1' }) },
            ],
          }
          callbackFn(mockSnapshot)
          return mockUnsubscribe
        })

        const unsubscribe = bookOperations.subscribeToUserBooks(userId, callback)

        expect(callback).toHaveBeenCalledWith([
          { id: 'book-1', title: 'Book 1' },
        ])
        expect(unsubscribe).toBe(mockUnsubscribe)
        expect(mockCollection).toHaveBeenCalledWith({}, `users/${userId}/books`)
        expect(mockOrderBy).toHaveBeenCalledWith('addedAt', 'desc')
      })
    })

    describe('updateBookState', () => {
      it('should update book state and create event', async () => {
        const mockBatch = {
          update: jest.fn(),
          set: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        }

        mockWriteBatch.mockReturnValue(mockBatch as any)

        await bookOperations.updateBookState(userId, bookId, 'in_progress', 'not_started')

        expect(mockWriteBatch).toHaveBeenCalled()
        expect(mockBatch.update).toHaveBeenCalledWith({}, {
          state: 'in_progress',
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
          startedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
        expect(mockBatch.set).toHaveBeenCalledWith({}, {
          bookId,
          userId,
          type: 'state_change',
          timestamp: { seconds: 1234567890, nanoseconds: 0 },
          data: {
            previousState: 'not_started',
            newState: 'in_progress',
          },
        })
        expect(mockBatch.commit).toHaveBeenCalled()
      })

      it('should add finishedAt timestamp when finishing book', async () => {
        const mockBatch = {
          update: jest.fn(),
          set: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        }

        mockWriteBatch.mockReturnValue(mockBatch as any)

        await bookOperations.updateBookState(userId, bookId, 'finished', 'in_progress')

        expect(mockBatch.update).toHaveBeenCalledWith({}, {
          state: 'finished',
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
          finishedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
      })
    })
  })

  describe('eventOperations', () => {
    describe('logEvent', () => {
      it('should log an event with generated timestamp and userId', async () => {
        const mockDocRef = { id: 'event-id' }
        mockAddDoc.mockResolvedValue(mockDocRef as any)

        const eventData: Omit<BookEvent, 'id' | 'userId' | 'timestamp'> = {
          bookId: 'book-id',
          type: 'progress_update',
          data: {
            previousPage: 50,
            newPage: 75,
          },
        }

        const result = await eventOperations.logEvent(userId, eventData)

        expect(result).toBe('event-id')
        expect(mockCollection).toHaveBeenCalledWith({}, `users/${userId}/events`)
        expect(mockAddDoc).toHaveBeenCalledWith({}, {
          ...eventData,
          userId,
          timestamp: { seconds: 1234567890, nanoseconds: 0 },
        })
      })
    })

    describe('getBookEvents', () => {
      it('should get events for a specific book', async () => {
        const mockEventsData = [
          { type: 'state_change', data: { newState: 'in_progress' } },
          { type: 'progress_update', data: { newPage: 50 } },
        ]

        const mockSnapshot = {
          docs: mockEventsData.map((data, index) => ({
            id: `event-${index}`,
            data: () => data,
          })),
        }

        mockGetDocs.mockResolvedValue(mockSnapshot as any)

        const result = await eventOperations.getBookEvents(userId, bookId)

        expect(result).toEqual([
          { id: 'event-0', ...mockEventsData[0] },
          { id: 'event-1', ...mockEventsData[1] },
        ])
        expect(mockWhere).toHaveBeenCalledWith('bookId', '==', bookId)
        expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc')
      })
    })

    describe('getRecentEvents', () => {
      it('should get recent events with default limit', async () => {
        const mockEventsData = Array.from({ length: 15 }, (_, i) => ({
          type: 'progress_update',
          data: { newPage: i * 10 },
        }))

        const mockSnapshot = {
          docs: mockEventsData.map((data, index) => ({
            id: `event-${index}`,
            data: () => data,
          })),
        }

        mockGetDocs.mockResolvedValue(mockSnapshot as any)

        const result = await eventOperations.getRecentEvents(userId)

        expect(result).toHaveLength(10) // Default limit
        expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'desc')
      })

      it('should respect custom limit', async () => {
        const mockEventsData = Array.from({ length: 10 }, (_, i) => ({
          type: 'progress_update',
          data: { newPage: i * 10 },
        }))

        const mockSnapshot = {
          docs: mockEventsData.map((data, index) => ({
            id: `event-${index}`,
            data: () => data,
          })),
        }

        mockGetDocs.mockResolvedValue(mockSnapshot as any)

        const result = await eventOperations.getRecentEvents(userId, 5)

        expect(result).toHaveLength(5)
      })
    })
  })

  describe('statsOperations', () => {
    describe('updateUserStats', () => {
      it('should calculate and update user statistics', async () => {
        const mockBooks: Book[] = [
          {
            id: '1',
            title: 'Book 1',
            author: 'Author 1',
            state: 'finished',
            progress: { currentPage: 100, totalPages: 100 },
            isOwned: true,
            addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
          },
          {
            id: '2',
            title: 'Book 2',
            author: 'Author 2',
            state: 'in_progress',
            progress: { currentPage: 50, totalPages: 200 },
            isOwned: true,
            addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
          },
          {
            id: '3',
            title: 'Book 3',
            author: 'Author 3',
            state: 'not_started',
            progress: { currentPage: 0, totalPages: 150 },
            isOwned: false,
            addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
          },
        ]

        // Mock getUserBooks to return our test data
        jest.spyOn(bookOperations, 'getUserBooks').mockResolvedValue(mockBooks)

        await statsOperations.updateUserStats(userId)

        expect(mockDoc).toHaveBeenCalledWith({}, `users/${userId}/profile/main`)
        expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
          totalBooksRead: 1,
          currentlyReading: 1,
          booksInLibrary: 3,
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
      })
    })

    describe('getUserStats', () => {
      it('should calculate comprehensive user statistics', async () => {
        const mockBooks: Book[] = [
          {
            id: '1',
            title: 'Book 1',
            author: 'Author 1',
            state: 'finished',
            progress: { currentPage: 200, totalPages: 200 },
            isOwned: true,
            rating: 4,
            addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
          },
          {
            id: '2',
            title: 'Book 2',
            author: 'Author 2',
            state: 'finished',
            progress: { currentPage: 300, totalPages: 300 },
            isOwned: true,
            rating: 5,
            addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
          },
          {
            id: '3',
            title: 'Book 3',
            author: 'Author 3',
            state: 'in_progress',
            progress: { currentPage: 50, totalPages: 150 },
            isOwned: true,
            addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
          },
        ]

        jest.spyOn(bookOperations, 'getUserBooks').mockResolvedValue(mockBooks)

        const result = await statsOperations.getUserStats(userId)

        expect(result).toEqual({
          totalBooksRead: 2,
          currentlyReading: 1,
          booksInLibrary: 3,
          totalPagesRead: 500, // 200 + 300
          averageRating: 4.5, // (4 + 5) / 2
        })
      })

      it('should handle books without ratings', async () => {
        const mockBooks: Book[] = [
          {
            id: '1',
            title: 'Book 1',
            author: 'Author 1',
            state: 'finished',
            progress: { currentPage: 100, totalPages: 100 },
            isOwned: true,
            addedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
          },
        ]

        jest.spyOn(bookOperations, 'getUserBooks').mockResolvedValue(mockBooks)

        const result = await statsOperations.getUserStats(userId)

        expect(result.averageRating).toBe(0)
      })
    })
  })

  describe('batchOperations', () => {
    describe('importBooks', () => {
      it('should import multiple books using batch operations', async () => {
        const mockBatch = {
          set: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        }

        mockWriteBatch.mockReturnValue(mockBatch as any)
        mockDoc.mockImplementation(() => ({ id: `book-${Math.random()}` }))

        const booksData: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>[] = [
          {
            title: 'Book 1',
            author: 'Author 1',
            state: 'not_started',
            progress: { currentPage: 0, totalPages: 100 },
            isOwned: true,
          },
          {
            title: 'Book 2',
            author: 'Author 2',
            state: 'not_started',
            progress: { currentPage: 0, totalPages: 200 },
            isOwned: false,
          },
        ]

        const result = await batchOperations.importBooks(userId, booksData)

        expect(result).toHaveLength(2)
        expect(mockBatch.set).toHaveBeenCalledTimes(2)
        expect(mockBatch.commit).toHaveBeenCalled()
      })
    })

    describe('updateMultipleBooks', () => {
      it('should update multiple books using batch operations', async () => {
        const mockBatch = {
          update: jest.fn(),
          commit: jest.fn().mockResolvedValue(undefined),
        }

        mockWriteBatch.mockReturnValue(mockBatch as any)

        const updates = [
          { bookId: 'book-1', data: { rating: 4 } },
          { bookId: 'book-2', data: { state: 'finished' as const } },
        ]

        await batchOperations.updateMultipleBooks(userId, updates)

        expect(mockBatch.update).toHaveBeenCalledTimes(2)
        expect(mockBatch.update).toHaveBeenCalledWith({}, {
          rating: 4,
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
        expect(mockBatch.update).toHaveBeenCalledWith({}, {
          state: 'finished',
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
        expect(mockBatch.commit).toHaveBeenCalled()
      })
    })
  })

  describe('Error Handling', () => {
    it('should propagate errors from Firebase operations', async () => {
      const error = new Error('Firebase error')
      mockAddDoc.mockRejectedValue(error)

      const bookData: Omit<Book, 'id' | 'addedAt' | 'updatedAt'> = {
        title: 'Test Book',
        author: 'Test Author',
        state: 'not_started',
        progress: { currentPage: 0, totalPages: 100 },
        isOwned: true,
      }

      await expect(bookOperations.addBook(userId, bookData)).rejects.toThrow('Firebase error')
    })

    it('should handle batch operation failures', async () => {
      const mockBatch = {
        set: jest.fn(),
        commit: jest.fn().mockRejectedValue(new Error('Batch commit failed')),
      }

      mockWriteBatch.mockReturnValue(mockBatch as any)

      const booksData: Omit<Book, 'id' | 'addedAt' | 'updatedAt'>[] = [
        {
          title: 'Book 1',
          author: 'Author 1',
          state: 'not_started',
          progress: { currentPage: 0, totalPages: 100 },
          isOwned: true,
        },
      ]

      await expect(batchOperations.importBooks(userId, booksData))
        .rejects.toThrow('Batch commit failed')
    })
  })
})