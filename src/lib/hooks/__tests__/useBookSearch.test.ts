import { act, renderHook } from "@testing-library/react";
import type { GoogleBooksVolume } from "../../google-books-api";
import { googleBooksApi } from "../../google-books-api";
import { useBookSearch } from "../useBookSearch";

// Mock the Google Books API
jest.mock("../../google-books-api", () => ({
  googleBooksApi: {
    search: jest.fn(),
  },
}));

const mockGoogleBooksApi = googleBooksApi as jest.Mocked<typeof googleBooksApi>;

describe("useBookSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear console.error mock between tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useBookSearch());

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.search).toBe("function");
    expect(typeof result.current.clearResults).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  describe("search function", () => {
    it("should clear results for empty query", async () => {
      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("");
      });

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockGoogleBooksApi.search).not.toHaveBeenCalled();
    });

    it("should clear results for whitespace-only query", async () => {
      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("   ");
      });

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockGoogleBooksApi.search).not.toHaveBeenCalled();
    });

    it("should perform search and update results", async () => {
      const mockResults: GoogleBooksVolume[] = [
        {
          id: "book1",
          volumeInfo: {
            title: "JavaScript: The Good Parts",
            authors: ["Douglas Crockford"],
          },
        },
        {
          id: "book2",
          volumeInfo: {
            title: "You Don't Know JS",
            authors: ["Kyle Simpson"],
          },
        },
      ];

      mockGoogleBooksApi.search.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("javascript");
      });

      expect(result.current.searchResults).toEqual(mockResults);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockGoogleBooksApi.search).toHaveBeenCalledWith("javascript", 20);
    });

    it("should use custom maxResults parameter", async () => {
      const mockResults: GoogleBooksVolume[] = [];
      mockGoogleBooksApi.search.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("javascript", 10);
      });

      expect(mockGoogleBooksApi.search).toHaveBeenCalledWith("javascript", 10);
    });

    it("should set isSearching to true during search", async () => {
      let resolveSearch: (value: GoogleBooksVolume[]) => void;
      const searchPromise = new Promise<GoogleBooksVolume[]>((resolve) => {
        resolveSearch = resolve;
      });

      mockGoogleBooksApi.search.mockReturnValue(searchPromise);

      const { result } = renderHook(() => useBookSearch());

      // Start search
      act(() => {
        result.current.search("javascript");
      });

      // Check that isSearching is true
      expect(result.current.isSearching).toBe(true);
      expect(result.current.error).toBe(null);

      // Resolve search
      await act(async () => {
        resolveSearch!([]);
      });

      // Check that isSearching is false
      expect(result.current.isSearching).toBe(false);
    });

    it("should handle search errors", async () => {
      const mockError = new Error("Network error");
      mockGoogleBooksApi.search.mockRejectedValue(mockError);

      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("javascript");
      });

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(
        "Failed to search books. Please check your internet connection and try again."
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error searching books:",
        mockError
      );
    });

    it("should clear error before new search", async () => {
      // First search fails
      mockGoogleBooksApi.search.mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("javascript");
      });

      expect(result.current.error).toBeTruthy();

      // Second search succeeds
      const mockResults: GoogleBooksVolume[] = [
        {
          id: "book1",
          volumeInfo: {
            title: "JavaScript: The Good Parts",
            authors: ["Douglas Crockford"],
          },
        },
      ];
      mockGoogleBooksApi.search.mockResolvedValue(mockResults);

      await act(async () => {
        await result.current.search("javascript");
      });

      expect(result.current.error).toBe(null);
      expect(result.current.searchResults).toEqual(mockResults);
    });

    it("should maintain consistent loading states", async () => {
      const { result } = renderHook(() => useBookSearch());

      // Initially not searching
      expect(result.current.isSearching).toBe(false);

      // Start multiple searches
      const mockResults: GoogleBooksVolume[] = [
        {
          id: "book1",
          volumeInfo: {
            title: "JavaScript: The Good Parts",
            authors: ["Douglas Crockford"],
          },
        },
      ];
      mockGoogleBooksApi.search.mockResolvedValue(mockResults);

      // First search
      await act(async () => {
        await result.current.search("javascript");
      });

      expect(result.current.isSearching).toBe(false);

      // Second search
      await act(async () => {
        await result.current.search("python");
      });

      expect(result.current.isSearching).toBe(false);
    });

    it("should handle concurrent searches properly", async () => {
      const { result } = renderHook(() => useBookSearch());

      const mockResults1: GoogleBooksVolume[] = [
        {
          id: "book1",
          volumeInfo: {
            title: "JavaScript Book",
            authors: ["Author 1"],
          },
        },
      ];

      const mockResults2: GoogleBooksVolume[] = [
        {
          id: "book2",
          volumeInfo: {
            title: "Python Book",
            authors: ["Author 2"],
          },
        },
      ];

      mockGoogleBooksApi.search
        .mockResolvedValueOnce(mockResults1)
        .mockResolvedValueOnce(mockResults2);

      // Start concurrent searches
      const promises = [
        act(async () => {
          await result.current.search("javascript");
        }),
        act(async () => {
          await result.current.search("python");
        }),
      ];

      await Promise.all(promises);

      // The last search should win
      expect(result.current.searchResults).toEqual(mockResults2);
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe("clearResults function", () => {
    it("should clear search results and error", async () => {
      const mockResults: GoogleBooksVolume[] = [
        {
          id: "book1",
          volumeInfo: {
            title: "Test Book",
            authors: ["Test Author"],
          },
        },
      ];

      mockGoogleBooksApi.search.mockResolvedValue(mockResults);
      const { result } = renderHook(() => useBookSearch());

      // Perform search
      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.searchResults).toEqual(mockResults);

      // Clear results
      act(() => {
        result.current.clearResults();
      });

      expect(result.current.searchResults).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.isSearching).toBe(false);
    });

    it("should clear error state", async () => {
      mockGoogleBooksApi.search.mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useBookSearch());

      // Perform failing search
      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.error).toBeTruthy();

      // Clear results
      act(() => {
        result.current.clearResults();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.searchResults).toEqual([]);
    });

    it("should be stable across renders", () => {
      const { result, rerender } = renderHook(() => useBookSearch());

      const clearResults1 = result.current.clearResults;

      rerender();

      const clearResults2 = result.current.clearResults;

      expect(clearResults1).toBe(clearResults2);
    });
  });

  describe("clearError function", () => {
    it("should clear only error state", async () => {
      const mockResults: GoogleBooksVolume[] = [
        {
          id: "book1",
          volumeInfo: {
            title: "Test Book",
            authors: ["Test Author"],
          },
        },
      ];

      mockGoogleBooksApi.search
        .mockResolvedValueOnce(mockResults)
        .mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useBookSearch());

      // Perform successful search
      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.searchResults).toEqual(mockResults);

      // Perform failing search
      await act(async () => {
        await result.current.search("test2");
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.searchResults).toEqual([]);

      // Clear only error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.searchResults).toEqual([]);
    });

    it("should be stable across renders", () => {
      const { result, rerender } = renderHook(() => useBookSearch());

      const clearError1 = result.current.clearError;

      rerender();

      const clearError2 = result.current.clearError;

      expect(clearError1).toBe(clearError2);
    });
  });

  describe("hook stability", () => {
    it("should have stable function references", () => {
      const { result } = renderHook(() => useBookSearch());

      const initialFunctions = {
        search: result.current.search,
        clearResults: result.current.clearResults,
        clearError: result.current.clearError,
      };

      // Re-render to check stability
      const { result: rerenderedResult } = renderHook(() => useBookSearch());

      expect(rerenderedResult.current.search).toBe(initialFunctions.search);
      expect(rerenderedResult.current.clearResults).toBe(
        initialFunctions.clearResults
      );
      expect(rerenderedResult.current.clearError).toBe(
        initialFunctions.clearError
      );
    });

    it("should maintain state across re-renders", async () => {
      const mockResults: GoogleBooksVolume[] = [
        {
          id: "book1",
          volumeInfo: {
            title: "Test Book",
            authors: ["Test Author"],
          },
        },
      ];

      mockGoogleBooksApi.search.mockResolvedValue(mockResults);
      const { result, rerender } = renderHook(() => useBookSearch());

      // Perform search
      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.searchResults).toEqual(mockResults);

      // Re-render
      rerender();

      // State should be maintained
      expect(result.current.searchResults).toEqual(mockResults);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe("error handling edge cases", () => {
    it("should handle undefined error", async () => {
      mockGoogleBooksApi.search.mockRejectedValue(undefined);
      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.error).toBe(
        "Failed to search books. Please check your internet connection and try again."
      );
    });

    it("should handle null error", async () => {
      mockGoogleBooksApi.search.mockRejectedValue(null);
      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.error).toBe(
        "Failed to search books. Please check your internet connection and try again."
      );
    });

    it("should handle string error", async () => {
      mockGoogleBooksApi.search.mockRejectedValue("String error");
      const { result } = renderHook(() => useBookSearch());

      await act(async () => {
        await result.current.search("test");
      });

      expect(result.current.error).toBe(
        "Failed to search books. Please check your internet connection and try again."
      );
    });
  });

  describe("performance considerations", () => {
    it("should not trigger unnecessary re-renders", () => {
      const { result } = renderHook(() => useBookSearch());

      // Functions should be memoized
      const initialSearch = result.current.search;
      const initialClearResults = result.current.clearResults;
      const initialClearError = result.current.clearError;

      // Trigger a state change
      act(() => {
        result.current.clearResults();
      });

      // Functions should remain the same
      expect(result.current.search).toBe(initialSearch);
      expect(result.current.clearResults).toBe(initialClearResults);
      expect(result.current.clearError).toBe(initialClearError);
    });
  });
});
