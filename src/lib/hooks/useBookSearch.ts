import { useCallback, useState } from "react";
import { GoogleBooksVolume, googleBooksApi } from "../google-books-api";

export const useBookSearch = (): {
  searchResults: GoogleBooksVolume[];
  isSearching: boolean;
  error: string | null;
  search: (query: string, maxResults?: number) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
} => {
  const [searchResults, setSearchResults] = useState<GoogleBooksVolume[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles book search using Google Books API
   *
   * Performs a search against the Google Books API with error handling
   * and loading state management. Updates search results state.
   *
   * @param query - Search query string
   * @param maxResults - Maximum number of results to return (default: 20)
   *
   * @example
   * const { search } = useBookSearch();
   * await search("javascript programming");
   */
  const search = useCallback(async (query: string, maxResults: number = 20) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await googleBooksApi.search(query, maxResults);
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching books:", err);
      setError(
        "Failed to search books. Please check your internet connection and try again."
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Clears search results and error state
   */
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  /**
   * Clears only the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    error,
    search,
    clearResults,
    clearError,
  };
};
