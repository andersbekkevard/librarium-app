/**
 * Book Service
 *
 * Handles book operations and business logic.
 * Coordinates between book, event, and user repositories.
 */

import { calculateBookProgress, convertGoogleBookToBook } from "@/lib/books/book-utils";
import {
  ErrorBuilder,
  ErrorCategory,
  ErrorSeverity,
  StandardError,
  createNetworkError,
  createSystemError,
  createValidationError,
} from "@/lib/errors/error-handling";
import { googleBooksApi } from "@/lib/api/google-books-api";
import {
  Book,
  canTransitionTo,
  validateProgress,
  validateRating,
} from "@/lib/models/models";
import { Timestamp } from "firebase/firestore";
import { firebaseBookRepository } from "../repositories/FirebaseBookRepository";
import { firebaseEventRepository } from "../repositories/FirebaseEventRepository";
import { IBookRepository, IEventRepository } from "../repositories/types";
import { IBookService, ServiceResult } from "./types";

export class BookService implements IBookService {
  constructor(
    private bookRepository: IBookRepository = firebaseBookRepository,
    private eventRepository: IEventRepository = firebaseEventRepository
  ) {}

  /**
   * Convert repository errors to standard errors
   */
  private handleRepositoryError(error: string): StandardError {
    if (error.includes("Access denied")) {
      return new ErrorBuilder("Repository access denied")
        .withCategory(ErrorCategory.AUTHORIZATION)
        .withUserMessage("You don't have permission to access this book")
        .withContext({ originalError: error })
        .withSeverity(ErrorSeverity.HIGH)
        .build();
    }

    if (error.includes("Network error")) {
      return createNetworkError("Network error during repository operation");
    }

    if (error.includes("not found")) {
      return createValidationError(
        "Book not found in repository",
        "Book not found"
      );
    }

    return createSystemError(`Database error: ${error}`);
  }

  /**
   * Validate book data
   */
  private validateBookData(book: Partial<Book>): StandardError | null {
    if (book.title !== undefined && book.title.trim().length === 0) {
      return createValidationError("Book title cannot be empty");
    }

    if (book.author !== undefined && book.author.trim().length === 0) {
      return createValidationError("Book author cannot be empty");
    }

    if (book.progress && !validateProgress(book.progress)) {
      return createValidationError("Invalid progress data");
    }

    if (book.rating !== undefined && !validateRating(book.rating)) {
      return createValidationError("Rating must be between 1 and 5");
    }

    return null;
  }

  /**
   * Get a single book
   */
  async getBook(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<Book | null>> {
    try {
      const result = await this.bookRepository.getBook(userId, bookId);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to get book",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Get all books for a user
   */
  async getUserBooks(userId: string): Promise<ServiceResult<Book[]>> {
    try {
      const result = await this.bookRepository.getUserBooks(userId);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to get user books",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Get books by reading state
   */
  async getBooksByState(
    userId: string,
    state: Book["state"]
  ): Promise<ServiceResult<Book[]>> {
    try {
      const result = await this.bookRepository.getBooksByState(userId, state);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to get books by state",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Add a new book to user's collection
   */
  async addBook(
    userId: string,
    book: Omit<Book, "id" | "addedAt" | "updatedAt">
  ): Promise<ServiceResult<string>> {
    try {
      const validationError = this.validateBookData(book);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const result = await this.bookRepository.addBook(userId, book);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      // Log book addition event
      await this.eventRepository.logEvent(userId, {
        type: "state_change",
        bookId: result.data!,
        data: {
          newState: book.state,
        },
      });

      return { success: true, data: result.data! };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to add book",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Update book (general updates)
   */
  async updateBook(
    userId: string,
    bookId: string,
    updates: Partial<Book>
  ): Promise<ServiceResult<void>> {
    try {
      const validationError = this.validateBookData(updates);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Add updatedAt timestamp
      const finalUpdates = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      const result = await this.bookRepository.updateBook(
        userId,
        bookId,
        finalUpdates
      );

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to update book",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Update book progress
   */
  async updateBookProgress(
    userId: string,
    bookId: string,
    currentPage: number
  ): Promise<ServiceResult<void>> {
    try {
      // Validate progress
      if (currentPage < 0) {
        return {
          success: false,
          error: createValidationError("Current page cannot be negative"),
        };
      }

      // Get current book to check state and validate progress
      const bookResult = await this.bookRepository.getBook(userId, bookId);
      if (!bookResult.success) {
        const standardError = this.handleRepositoryError(bookResult.error!);
        return { success: false, error: standardError };
      }

      const book = bookResult.data;
      if (!book) {
        return {
          success: false,
          error: createValidationError("Book not found"),
        };
      }

      // Check if book is in a state that allows progress updates
      if (book.state === "not_started") {
        // Automatically transition to in_progress when progress is first made
        const stateUpdateResult = await this.updateBookState(
          userId,
          bookId,
          "in_progress",
          "not_started"
        );
        if (!stateUpdateResult.success) {
          return stateUpdateResult;
        }
      }

      // Validate progress against total pages if available
      if (book.progress?.totalPages && currentPage > book.progress.totalPages) {
        return {
          success: false,
          error: createValidationError(
            "Current page cannot exceed total pages"
          ),
        };
      }

      // Update progress
      const progressUpdate = {
        progress: {
          currentPage,
          totalPages: book.progress?.totalPages || 0,
          lastUpdated: Timestamp.now(),
        },
      };

      const result = await this.bookRepository.updateBook(
        userId,
        bookId,
        progressUpdate
      );

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      // Log progress update event
      await this.eventRepository.logEvent(userId, {
        type: "progress_update",
        bookId,
        data: {
          previousPage: book.progress?.currentPage || 0,
          newPage: currentPage,
        },
      });

      // Auto-transition to finished if book is completed
      if (
        book.progress?.totalPages &&
        currentPage >= book.progress.totalPages &&
        book.state === "in_progress"
      ) {
        await this.updateBookState(userId, bookId, "finished", "in_progress");
      }

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to update book progress",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Update book state
   */
  async updateBookState(
    userId: string,
    bookId: string,
    newState: Book["state"],
    currentState?: Book["state"]
  ): Promise<ServiceResult<void>> {
    try {
      // Get current book if currentState not provided
      let actualCurrentState = currentState;
      if (!actualCurrentState) {
        const bookResult = await this.bookRepository.getBook(userId, bookId);
        if (!bookResult.success) {
          const standardError = this.handleRepositoryError(bookResult.error!);
          return { success: false, error: standardError };
        }
        if (!bookResult.data) {
          return {
            success: false,
            error: createValidationError("Book not found"),
          };
        }
        actualCurrentState = bookResult.data.state;
      }

      // Validate state transition
      if (!actualCurrentState) {
        return {
          success: false,
          error: createValidationError("Current state is undefined"),
        };
      }
      if (!canTransitionTo(actualCurrentState, newState)) {
        return {
          success: false,
          error: createValidationError(
            `Cannot transition from ${actualCurrentState} to ${newState}`
          ),
        };
      }

      // Update book state
      const updates: Partial<Book> = {
        state: newState,
        updatedAt: Timestamp.now(),
      };

      // Set finishedAt timestamp if transitioning to finished
      if (newState === "finished") {
        updates.finishedAt = Timestamp.now();
      }

      const result = await this.bookRepository.updateBook(
        userId,
        bookId,
        updates
      );

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      // Log state change event
      await this.eventRepository.logEvent(userId, {
        type: "state_change",
        bookId,
        data: {
          previousState: actualCurrentState,
          newState,
        },
      });

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to update book state",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Update book rating
   */
  async updateBookRating(
    userId: string,
    bookId: string,
    rating: number
  ): Promise<ServiceResult<void>> {
    try {
      // Validate rating
      if (!validateRating(rating)) {
        return {
          success: false,
          error: createValidationError("Rating must be between 1 and 5"),
        };
      }

      // Update book rating
      const updates: Partial<Book> = {
        rating,
        updatedAt: Timestamp.now(),
      };

      const result = await this.bookRepository.updateBook(
        userId,
        bookId,
        updates
      );

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      // Log rating event
      await this.eventRepository.logEvent(userId, {
        type: "rating_added",
        bookId,
        data: {
          rating,
        },
      });

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to update book rating",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Delete a book
   */
  async deleteBook(
    userId: string,
    bookId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Get book data before deletion for the event
      const bookResult = await this.bookRepository.getBook(userId, bookId);
      let bookTitle = "Unknown Book";
      let bookAuthor = "Unknown Author";
      
      if (bookResult.success && bookResult.data) {
        bookTitle = bookResult.data.title;
        bookAuthor = bookResult.data.author;
      }

      const result = await this.bookRepository.deleteBook(userId, bookId);

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      // Log book deletion event
      await this.eventRepository.logEvent(userId, {
        type: "delete_book",
        bookId: bookId,
        data: {
          deletedBookTitle: bookTitle,
          deletedBookAuthor: bookAuthor,
        },
      });

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to delete book",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Subscribe to user's book collection
   */
  subscribeToUserBooks(
    userId: string,
    callback: (books: Book[]) => void
  ): () => void {
    return this.bookRepository.subscribeToUserBooks(userId, callback);
  }

  /**
   * Import multiple books
   */
  async importBooks(
    userId: string,
    books: Array<Omit<Book, "id" | "addedAt" | "updatedAt">>
  ): Promise<ServiceResult<string[]>> {
    try {
      const bookIds: string[] = [];
      const errors: string[] = [];

      for (const book of books) {
        const result = await this.addBook(userId, book);
        if (result.success && result.data) {
          bookIds.push(result.data);
        } else {
          errors.push(
            `Failed to import "${book.title}": ${
              result.error?.userMessage || "Unknown error"
            }`
          );
        }
      }

      if (errors.length > 0 && bookIds.length === 0) {
        // All imports failed
        return {
          success: false,
          error: createSystemError(
            `Failed to import books: ${errors.join(", ")}`
          ),
        };
      }

      return { success: true, data: bookIds };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to import books",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Search books in user's library
   */
  async searchBooks(
    userId: string,
    searchQuery: string,
    maxResults: number = 10
  ): Promise<ServiceResult<Book[]>> {
    try {
      if (!searchQuery.trim()) {
        return { success: true, data: [] };
      }

      // Get user's books
      const booksResult = await this.getUserBooks(userId);
      if (!booksResult.success) {
        return { success: false, error: booksResult.error };
      }

      const books = booksResult.data || [];
      const query = searchQuery.toLowerCase();

      // Filter books that match the search query
      const filteredBooks = books.filter((book) => {
        return (
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.genre?.toLowerCase().includes(query) ||
          book.description?.toLowerCase().includes(query)
        );
      });

      // Sort by relevance (exact matches first, then partial matches)
      const sortedBooks = filteredBooks.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aAuthor = a.author.toLowerCase();
        const bAuthor = b.author.toLowerCase();

        // Exact title matches first
        if (aTitle === query && bTitle !== query) return -1;
        if (bTitle === query && aTitle !== query) return 1;

        // Exact author matches next
        if (aAuthor === query && bAuthor !== query) return -1;
        if (bAuthor === query && aAuthor !== query) return 1;

        // Title starts with query
        if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
        if (bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1;

        // Author starts with query
        if (aAuthor.startsWith(query) && !bAuthor.startsWith(query)) return -1;
        if (bAuthor.startsWith(query) && !aAuthor.startsWith(query)) return 1;

        // Default to alphabetical by title
        return aTitle.localeCompare(bTitle);
      });

      // Limit results
      const limitedBooks = sortedBooks.slice(0, maxResults);

      return { success: true, data: limitedBooks };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to search books",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Filter and sort books
   */
  filterAndSortBooks(
    books: Book[],
    searchQuery: string,
    filterStatus: string,
    filterOwnership: string,
    filterGenre: string,
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Book[] {
    let filteredBooks = [...books];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredBooks = filteredBooks.filter((book) => {
        return (
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.genre?.toLowerCase().includes(query) ||
          book.description?.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (filterStatus && filterStatus !== "all") {
      filteredBooks = filteredBooks.filter(
        (book) => book.state === filterStatus
      );
    }

    // Apply ownership filter
    if (filterOwnership && filterOwnership !== "all") {
      filteredBooks = filteredBooks.filter((book) => {
        return filterOwnership === "owned" ? book.isOwned : !book.isOwned;
      });
    }

    // Apply genre filter
    if (filterGenre && filterGenre !== "all") {
      filteredBooks = filteredBooks.filter((book) => {
        return book.genre?.toLowerCase() === filterGenre.toLowerCase();
      });
    }

    // Apply sorting
    filteredBooks.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "author":
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case "pages":
          aValue = a.progress?.totalPages || 0;
          bValue = b.progress?.totalPages || 0;
          break;
        case "dateAdded":
          aValue = a.addedAt.seconds;
          bValue = b.addedAt.seconds;
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "progress":
          aValue = calculateBookProgress(a);
          bValue = calculateBookProgress(b);
          break;
        default:
          aValue = a.addedAt.seconds;
          bValue = b.addedAt.seconds;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filteredBooks;
  }

  /**
   * Manual update book (bypasses state machine validation)
   */
  async updateBookManual(
    userId: string,
    bookId: string,
    updates: Partial<Book>
  ): Promise<ServiceResult<void>> {
    try {
      const validationError = this.validateBookData(updates);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // Add updatedAt timestamp
      const finalUpdates = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      const result = await this.bookRepository.updateBook(
        userId,
        bookId,
        finalUpdates
      );

      if (!result.success) {
        const standardError = this.handleRepositoryError(result.error!);
        return { success: false, error: standardError };
      }

      // Get updated book for logging
      const updatedBookResult = await this.bookRepository.getBook(userId, bookId);
      if (updatedBookResult.success && updatedBookResult.data) {
        // Log manual update event
        await this.eventRepository.logEvent(userId, {
          type: "manual_update",
          bookId,
          data: {
            comment: `Manual update: ${Object.keys(updates).join(", ")}`,
            commentState: updatedBookResult.data.state,
            commentPage: updatedBookResult.data.progress.currentPage,
          },
        });
      }

      return { success: true };
    } catch (error) {
      const standardError = createSystemError(
        "Failed to update book manually",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }

  /**
   * Add a book from ISBN by searching Google Books API
   * 
   * Searches for book metadata using the provided ISBN and adds it to the user's
   * collection. Uses the existing Google Books API integration and book conversion
   * utilities to maintain consistency with other book addition methods.
   * 
   * @param userId - User ID who owns the book
   * @param isbn - ISBN string (ISBN-10 or ISBN-13)
   * @returns Promise<ServiceResult<string>> - Success with book ID or error
   * 
   * @example
   * const result = await bookService.addBookFromISBN(userId, '9781234567890');
   * if (result.success) {
   *   console.log('Book added with ID:', result.data);
   * }
   */
  async addBookFromISBN(
    userId: string,
    isbn: string
  ): Promise<ServiceResult<string>> {
    try {
      if (!isbn || typeof isbn !== 'string' || isbn.trim().length === 0) {
        return {
          success: false,
          error: createValidationError("ISBN is required", "Please provide a valid ISBN")
        };
      }

      // Search for book using Google Books API
      const books = await googleBooksApi.searchByISBN(isbn.trim(), 1);
      
      if (books.length === 0) {
        return {
          success: false,
          error: createValidationError(
            "Book not found for this ISBN",
            "Book not found in our database. You can add it manually using the 'Manual Entry' tab."
          )
        };
      }

      // Convert Google Books volume to internal Book model
      const book = convertGoogleBookToBook(books[0]);
      const { id: _id, ...bookData } = book;
      
      // Add the book using existing addBook method
      const addResult = await this.addBook(userId, bookData);
      
      if (!addResult.success) {
        return addResult;
      }

      return {
        success: true,
        data: addResult.data
      };
    } catch (error) {
      // Handle Google Books API errors
      if (error instanceof Error) {
        if (error.message.includes('Rate limit') || error.message.includes('quota')) {
          return {
            success: false,
            error: createNetworkError("Search limit reached. Please try again in a few minutes.")
          };
        }
        
        if (error.message.includes('Network') || error.message.includes('connection')) {
          return {
            success: false,
            error: createNetworkError("Network error. Please check your internet connection and try again.")
          };
        }
        
        if (error.message.includes('API key')) {
          return {
            success: false,
            error: createSystemError("Book search service unavailable. Please try manual entry.")
          };
        }
      }
      
      const standardError = createSystemError(
        "Failed to add book from ISBN",
        error as Error
      );
      return { success: false, error: standardError };
    }
  }
}

// Export singleton instance
export const bookService = new BookService();
