import { act, renderHook } from "@testing-library/react";
import { useBookSearch } from "../useBookSearch";
import { googleBooksApi, GoogleBooksVolume } from "../../google-books-api";

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
  });
});
