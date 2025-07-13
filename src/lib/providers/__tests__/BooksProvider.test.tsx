/**
 * Tests for BooksProvider
 *
 * Comprehensive test suite for books context provider,
 * including state management, CRUD operations, and real-time updates.
 */

import { createMockBook } from "@/lib/test-utils/firebase-mock";
import { render, screen, waitFor } from "@testing-library/react";
import { BooksProvider, useBooksContext } from "../BooksProvider";

// Define the mock first
const mockBookService = {
  getBooks: jest.fn(),
  addBook: jest.fn(),
  updateBook: jest.fn(),
  updateBookManual: jest.fn(),
  updateBookProgress: jest.fn(),
  updateBookState: jest.fn(),
  updateBookRating: jest.fn(),
  deleteBook: jest.fn(),
  subscribeToUserBooks: jest.fn(),
};

// Mock AuthProvider
jest.mock("../AuthProvider", () => ({
  useAuthContext: () => ({
    user: { uid: "test-user-id" },
  }),
}));

// Mock UserProvider
jest.mock("../UserProvider", () => ({
  useUserContext: () => ({
    refreshUserStats: jest.fn(),
  }),
}));

// Mock BookService
jest.mock("../../api/firebase", () => ({
  // ...mocked exports as needed
}));

// Test component to consume books context
const TestComponent = () => {
  const {
    books,
    loading,
    error,
    addBook,
    updateBook,
    updateBookManual,
    updateBookProgress,
    updateBookState,
    updateBookRating,
    deleteBook,
  } = useBooksContext();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="error">{error?.message || "no-error"}</div>
      <div data-testid="book-count">{books.length}</div>
      <div data-testid="books">{books.map((b) => b.title).join(", ")}</div>

      <button
        data-testid="add-book"
        onClick={() =>
          addBook({
            title: "New Book",
            author: "New Author",
            state: "not_started",
            isOwned: true,
          })
        }
      >
        Add Book
      </button>

      <button
        data-testid="update-book"
        onClick={() => updateBook("book-1", { title: "Updated Title" })}
      >
        Update Book
      </button>

      <button data-testid="delete-book" onClick={() => deleteBook("book-1")}>
        Delete Book
      </button>
    </div>
  );
};

describe("BooksProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide initial loading state", () => {
    mockBookService.getUserBooks.mockResolvedValue({
      success: true,
      data: [],
    });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it("should load and display books on mount", async () => {
    const mockBooks = [
      createMockBook({ id: "book-1", title: "Book One" }),
      createMockBook({ id: "book-2", title: "Book Two" }),
    ];

    mockBookService.getUserBooks.mockResolvedValue({
      success: true,
      data: mockBooks,
    });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("book-count")).toHaveTextContent("2");
      expect(screen.getByTestId("books")).toHaveTextContent(
        "Book One, Book Two"
      );
    });
  });

  it("should handle book loading errors", async () => {
    mockBookService.getUserBooks.mockResolvedValue({
      success: false,
      error: "Failed to load books",
    });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Failed to load books"
      );
    });
  });

  it("should add a new book", async () => {
    const mockBooks = [
      createMockBook({ id: "book-1", title: "Existing Book" }),
    ];
    const newBook = createMockBook({ id: "book-2", title: "New Book" });

    mockBookService.getUserBooks.mockResolvedValue({
      success: true,
      data: mockBooks,
    });

    mockBookService.addBook.mockResolvedValue({
      success: true,
      data: "book-2",
    });

    mockBookService.getUserBooks.mockResolvedValueOnce({
      success: true,
      data: [...mockBooks, newBook],
    });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const addButton = screen.getByTestId("add-book");
    addButton.click();

    await waitFor(() => {
      expect(mockBookService.addBook).toHaveBeenCalledWith("test-user-id", {
        title: "New Book",
        author: "New Author",
        state: "not_started",
        isOwned: true,
      });
    });
  });

  it("should update an existing book", async () => {
    const mockBooks = [
      createMockBook({ id: "book-1", title: "Original Title" }),
    ];

    mockBookService.getUserBooks.mockResolvedValue({
      success: true,
      data: mockBooks,
    });

    mockBookService.updateBook.mockResolvedValue({
      success: true,
    });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const updateButton = screen.getByTestId("update-book");
    updateButton.click();

    await waitFor(() => {
      expect(mockBookService.updateBook).toHaveBeenCalledWith(
        "test-user-id",
        "book-1",
        { title: "Updated Title" }
      );
    });
  });

  it("should delete a book", async () => {
    const mockBooks = [
      createMockBook({ id: "book-1", title: "Book to Delete" }),
    ];

    mockBookService.getUserBooks.mockResolvedValue({
      success: true,
      data: mockBooks,
    });

    mockBookService.deleteBook.mockResolvedValue({
      success: true,
    });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const deleteButton = screen.getByTestId("delete-book");
    deleteButton.click();

    await waitFor(() => {
      expect(mockBookService.deleteBook).toHaveBeenCalledWith(
        "test-user-id",
        "book-1"
      );
    });
  });

  it("should handle book updates with errors", async () => {
    const mockBooks = [createMockBook({ id: "book-1", title: "Book One" })];

    mockBookService.getUserBooks.mockResolvedValue({
      success: true,
      data: mockBooks,
    });

    mockBookService.updateBook.mockResolvedValue({
      success: false,
      error: "Update failed",
    });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const updateButton = screen.getByTestId("update-book");
    updateButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Update failed");
    });
  });

  it("should refresh books after operations", async () => {
    const mockBooks = [createMockBook({ id: "book-1", title: "Book One" })];
    const updatedBooks = [
      createMockBook({ id: "book-1", title: "Updated Book" }),
    ];

    mockBookService.getUserBooks
      .mockResolvedValueOnce({ success: true, data: mockBooks })
      .mockResolvedValueOnce({ success: true, data: updatedBooks });

    mockBookService.updateBook.mockResolvedValue({ success: true });

    render(
      <BooksProvider>
        <TestComponent />
      </BooksProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const updateButton = screen.getByTestId("update-book");
    updateButton.click();

    await waitFor(() => {
      expect(mockBookService.getUserBooks).toHaveBeenCalledTimes(2);
    });
  });

  it("should throw error when used outside BooksProvider", () => {
    // Suppress console error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useBooksContext must be used within a BooksProvider");

    console.error = originalError;
  });
});
