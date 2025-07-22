import { act, renderHook } from "@testing-library/react";
import { GoogleBooksVolume, googleBooksApi } from "../../api/google-books-api";
import { ErrorCategory, ErrorSeverity } from "../../errors/error-handling";
import { useBookSearch } from "../useBookSearch";

// Mock the Google Books API
jest.mock("../../api/google-books-api", () => ({
  googleBooksApi: {
    search: jest.fn(),
    searchByTitle: jest.fn(),
    searchByAuthor: jest.fn(),
    searchByISBN: jest.fn(),
  },
}));

const mockGoogleBooksApi = googleBooksApi as jest.Mocked<typeof googleBooksApi>;

describe("useBookSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should perform search and update results", async () => {
    const mockResults: GoogleBooksVolume[] = [
      {
        id: "book1",
        volumeInfo: {
          title: "JavaScript: The Good Parts",
          authors: ["Douglas Crockford"],
        },
      } as GoogleBooksVolume,
    ];

    mockGoogleBooksApi.search.mockResolvedValue({
      success: true,
      data: mockResults,
    });

    const { result } = renderHook(() => useBookSearch());

    await act(async () => {
      await result.current.search("javascript");
    });

    expect(result.current.searchResults).toEqual(mockResults);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockGoogleBooksApi.search).toHaveBeenCalledWith("javascript", 20);
  });

  it("should use searchByISBN when searchType is 'isbn'", async () => {
    const mockResults: GoogleBooksVolume[] = [
      {
        id: "book1",
        volumeInfo: {
          title: "Test Book",
          authors: ["Test Author"],
        },
      } as GoogleBooksVolume,
    ];

    mockGoogleBooksApi.searchByISBN.mockResolvedValue({
      success: true,
      data: mockResults,
    });

    const { result } = renderHook(() => useBookSearch());

    await act(async () => {
      await result.current.search("9781234567890", 5, "isbn");
    });

    expect(result.current.searchResults).toEqual(mockResults);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockGoogleBooksApi.searchByISBN).toHaveBeenCalledWith(
      "9781234567890",
      5
    );
    expect(mockGoogleBooksApi.search).not.toHaveBeenCalled();
  });

  it("should handle search errors", async () => {
    const mockError = new Error("Network error");
    mockGoogleBooksApi.search.mockResolvedValue({
      success: false,
      error: {
        id: "test-error",
        type: "network",
        category: "network" as ErrorCategory,
        severity: ErrorSeverity.HIGH,
        message: "Network error",
        userMessage:
          "Failed to search books. Please check your internet connection and try again.",
        timestamp: new Date(),
        retryable: true,
        recoverable: true,
      },
    });

    const { result } = renderHook(() => useBookSearch());

    await act(async () => {
      await result.current.search("javascript");
    });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.userMessage).toBe(
      "Failed to search books. Please check your internet connection and try again."
    );
    expect(result.current.error?.category).toBe(ErrorCategory.NETWORK);
  });
});
