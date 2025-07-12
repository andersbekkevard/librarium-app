/**
 * Book Service
 *
 * Handles book operations and business logic.
 * Coordinates between book, event, and user repositories.
 */

import { Timestamp } from "firebase/firestore";
import {
  Book,
  canTransitionTo,
  validateProgress,
  validateRating,
} from "../models";
import { firebaseBookRepository } from "../repositories/FirebaseBookRepository";
import { firebaseEventRepository } from "../repositories/FirebaseEventRepository";
import { IBookRepository, IEventRepository } from "../repositories/types";
import {
  IBookService,
  ServiceError,
  ServiceErrorType,
  ServiceResult,
} from "./types";

export class BookService implements IBookService {
  constructor(
    private bookRepository: IBookRepository = firebaseBookRepository,
    private eventRepository: IEventRepository = firebaseEventRepository
  ) {}

  /**
   * Convert repository errors to service errors
   */
  private handleRepositoryError(error: string): ServiceError {
    if (error.includes("Access denied")) {
      return new ServiceError(
        ServiceErrorType.AUTHORIZATION_ERROR,
        "You don't have permission to access this book",
        error
      );
    }

    if (error.includes("Network error")) {
      return new ServiceError(
        ServiceErrorType.EXTERNAL_API_ERROR,
        "Network error. Please check your connection and try again.",
        error
      );
    }

    if (error.includes("not found")) {
      return new ServiceError(
        ServiceErrorType.NOT_FOUND,
        "Book not found",
        error
      );
    }

    return new ServiceError(
      ServiceErrorType.REPOSITORY_ERROR,
      `Database error: ${error}`,
      error
    );
  }

  /**
   * Validate book data
   */
  private validateBookData(book: Partial<Book>): ServiceError | null {
    if (book.title !== undefined && book.title.trim().length === 0) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Book title cannot be empty"
      );
    }

    if (book.author !== undefined && book.author.trim().length === 0) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Book author cannot be empty"
      );
    }

    if (book.progress && !validateProgress(book.progress)) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Invalid progress data"
      );
    }

    if (book.rating !== undefined && !validateRating(book.rating)) {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        "Rating must be between 1 and 5"
      );
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
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: "Failed to get book" };
    }
  }

  /**
   * Get all books for a user
   */
  async getUserBooks(userId: string): Promise<ServiceResult<Book[]>> {
    try {
      const result = await this.bookRepository.getUserBooks(userId);

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      return { success: false, error: "Failed to get user books" };
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
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true, data: result.data || [] };
    } catch (error) {
      return { success: false, error: "Failed to get books by state" };
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
        return { success: false, error: validationError.message };
      }

      const result = await this.bookRepository.addBook(userId, book);

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
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
      return { success: false, error: "Failed to add book" };
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
        return { success: false, error: validationError.message };
      }

      const result = await this.bookRepository.updateBook(
        userId,
        bookId,
        updates
      );

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update book" };
    }
  }

  /**
   * Update book progress with business logic
   */
  async updateBookProgress(
    userId: string,
    bookId: string,
    currentPage: number
  ): Promise<ServiceResult<void>> {
    try {
      // Get current book state
      const bookResult = await this.getBook(userId, bookId);
      if (!bookResult.success || !bookResult.data) {
        return { success: false, error: "Book not found" };
      }

      const book = bookResult.data;
      const totalPages = book.progress.totalPages || 0;

      // Validate progress
      if (currentPage < 0 || (totalPages > 0 && currentPage > totalPages)) {
        return { success: false, error: "Invalid page number" };
      }

      // Determine if state should change based on progress
      let newState = book.state;

      // Auto-transition to in_progress if starting from not_started
      if (book.state === "not_started" && currentPage > 0) {
        newState = "in_progress";
      }

      // Auto-transition to finished if reaching the end
      if (
        book.state === "in_progress" &&
        totalPages > 0 &&
        currentPage >= totalPages
      ) {
        newState = "finished";
      }

      // Update progress
      const progressUpdate: Partial<Book> = {
        progress: {
          ...book.progress,
          currentPage: currentPage,
        },
      };

      // Add timestamps for state changes
      if (newState !== book.state) {
        progressUpdate.state = newState;
        if (newState === "in_progress") {
          progressUpdate.startedAt = Timestamp.now();
        } else if (newState === "finished") {
          progressUpdate.finishedAt = Timestamp.now();
        }
      }

      // Update book
      const updateResult = await this.bookRepository.updateBook(
        userId,
        bookId,
        progressUpdate
      );
      if (!updateResult.success) {
        const serviceError = this.handleRepositoryError(updateResult.error!);
        return { success: false, error: serviceError.message };
      }

      // Log progress update event
      await this.eventRepository.logEvent(userId, {
        type: "progress_update",
        bookId: bookId,
        data: {
          previousPage: book.progress.currentPage || 0,
          newPage: currentPage,
        },
      });

      // Log state change event if state changed
      if (newState !== book.state) {
        await this.eventRepository.logEvent(userId, {
          type: "state_change",
          bookId: bookId,
          data: {
            previousState: book.state,
            newState: newState,
          },
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update book progress" };
    }
  }

  /**
   * Update book reading state with proper event logging
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
        const bookResult = await this.getBook(userId, bookId);
        if (!bookResult.success || !bookResult.data) {
          return { success: false, error: "Book not found" };
        }
        actualCurrentState = bookResult.data.state;
      }

      // Validate state transition
      if (!canTransitionTo(actualCurrentState, newState)) {
        return {
          success: false,
          error: `Cannot transition from ${actualCurrentState} to ${newState}`,
        };
      }

      // Prepare update data
      const updateData: Partial<Book> = {
        state: newState,
      };

      // Add timestamps for state changes
      if (newState === "in_progress") {
        updateData.startedAt = Timestamp.now();
      } else if (newState === "finished") {
        updateData.finishedAt = Timestamp.now();
        // Set progress to 100% when finished
        const bookResult = await this.getBook(userId, bookId);
        if (bookResult.success && bookResult.data) {
          updateData.progress = {
            ...bookResult.data.progress,
            currentPage:
              bookResult.data.progress.totalPages ||
              bookResult.data.progress.currentPage ||
              0,
          };
        }
      }

      // Update book
      const updateResult = await this.bookRepository.updateBook(
        userId,
        bookId,
        updateData
      );
      if (!updateResult.success) {
        const serviceError = this.handleRepositoryError(updateResult.error!);
        return { success: false, error: serviceError.message };
      }

      // Log state change event
      await this.eventRepository.logEvent(userId, {
        type: "state_change",
        bookId: bookId,
        data: {
          previousState: actualCurrentState,
          newState: newState,
        },
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update book state" };
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
      if (!validateRating(rating)) {
        return { success: false, error: "Rating must be between 1 and 5" };
      }

      // Get current book to verify it's finished
      const bookResult = await this.getBook(userId, bookId);
      if (!bookResult.success || !bookResult.data) {
        return { success: false, error: "Book not found" };
      }

      if (bookResult.data.state !== "finished") {
        return { success: false, error: "Can only rate finished books" };
      }

      // Update rating
      const updateResult = await this.bookRepository.updateBook(
        userId,
        bookId,
        { rating }
      );
      if (!updateResult.success) {
        const serviceError = this.handleRepositoryError(updateResult.error!);
        return { success: false, error: serviceError.message };
      }

      // Log rating event
      await this.eventRepository.logEvent(userId, {
        type: "rating_added",
        bookId: bookId,
        data: {
          rating: rating,
        },
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update book rating" };
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
      // Delete book events first
      await this.eventRepository.deleteBookEvents(userId, bookId);

      // Delete book
      const result = await this.bookRepository.deleteBook(userId, bookId);

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to delete book" };
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
      // Validate all books
      for (const book of books) {
        const validationError = this.validateBookData(book);
        if (validationError) {
          return {
            success: false,
            error: `Invalid book data: ${validationError.message}`,
          };
        }
      }

      const result = await this.bookRepository.importBooks(userId, books);

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      return { success: true, data: result.data! };
    } catch (error) {
      return { success: false, error: "Failed to import books" };
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
    sortBy: string,
    sortDirection: "asc" | "desc"
  ): Book[] {
    let filtered = books;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((book) => book.state === filterStatus);
    }

    // Apply ownership filter
    if (filterOwnership !== "all") {
      filtered = filtered.filter((book) =>
        filterOwnership === "owned" ? book.isOwned : !book.isOwned
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

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
          aValue = a.progress.totalPages || 0;
          bValue = b.progress.totalPages || 0;
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "progress":
          aValue = this.calculateProgress(a);
          bValue = this.calculateProgress(b);
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return sorted;
  }

  /**
   * Manual update book (bypasses state machine validation)
   * 
   * This function allows manual editing of all book data including state transitions
   * that would normally be prevented by the state machine. Used for error correction
   * and manual data management.
   */
  async updateBookManual(
    userId: string,
    bookId: string,
    updates: Partial<Book>
  ): Promise<ServiceResult<void>> {
    try {
      // Still validate basic data integrity but allow any state changes
      const validationError = this.validateBookData(updates);
      if (validationError) {
        return { success: false, error: validationError.message };
      }

      // Get current book to prepare proper timestamp updates
      const currentBookResult = await this.getBook(userId, bookId);
      if (!currentBookResult.success || !currentBookResult.data) {
        return { success: false, error: "Book not found" };
      }

      const currentBook = currentBookResult.data;
      const updateData = { ...updates };

      // Handle state-related timestamp updates
      if (updates.state && updates.state !== currentBook.state) {
        switch (updates.state) {
          case "in_progress":
            // Only set startedAt if transitioning from not_started
            if (currentBook.state === "not_started") {
              updateData.startedAt = Timestamp.now();
            }
            // Clear finishedAt if moving from finished back to in_progress
            if (currentBook.state === "finished") {
              updateData.finishedAt = undefined;
            }
            break;
          case "finished":
            // Set finishedAt if not already set
            if (!currentBook.finishedAt) {
              updateData.finishedAt = Timestamp.now();
            }
            // Ensure we have a startedAt timestamp
            if (!currentBook.startedAt) {
              updateData.startedAt = Timestamp.now();
            }
            break;
          case "not_started":
            // Clear both timestamps when resetting to not_started
            updateData.startedAt = undefined;
            updateData.finishedAt = undefined;
            break;
        }
      }

      // Update the book
      const result = await this.bookRepository.updateBook(
        userId,
        bookId,
        updateData
      );

      if (!result.success) {
        const serviceError = this.handleRepositoryError(result.error!);
        return { success: false, error: serviceError.message };
      }

      // Log manual edit event (if state changed)
      if (updates.state && updates.state !== currentBook.state) {
        await this.eventRepository.logEvent(userId, {
          bookId,
          type: "state_change",
          data: {
            previousState: currentBook.state,
            newState: updates.state,
          },
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update book" };
    }
  }

  /**
   * Calculate reading progress percentage
   */
  calculateProgress(book: Book): number {
    if (book.state === "finished") return 100;
    if (book.state === "not_started") return 0;

    const { currentPage, totalPages } = book.progress;
    if (currentPage && totalPages && totalPages > 0) {
      return Math.round((currentPage / totalPages) * 100);
    }
    return 0;
  }
}

// Export singleton instance
export const bookService = new BookService();
