import { useCallback, useState } from "react";
import { GoogleBooksVolume, googleBooksApi } from "../api/google-books-api";
import { API_CONFIG } from "../constants/constants";
import { StandardError, createNetworkError } from "../errors/error-handling";
import { ServiceResult } from "../services/types";

export const useBookSearch = (): {
  searchResults: GoogleBooksVolume[];
  isSearching: boolean;
  error: StandardError | null;
  search: (
    query: string,
    maxResults?: number,
    searchType?: "title" | "author" | "general" | "isbn"
  ) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
} => {
  const [searchResults, setSearchResults] = useState<GoogleBooksVolume[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<StandardError | null>(null);

  /**
   * Handles book search using Google Books API
   *
   * Performs a search against the Google Books API with error handling
   * and loading state management. Updates search results state.
   *
   * @param query - Search query string
   * @param maxResults - Maximum number of results to return (default: 20)
   * @param searchType - Type of search: 'title', 'author', 'isbn', or 'general' (default: 'general')
   *
   * @example
   * const { search } = useBookSearch();
   * await search("javascript programming", 20, 'title');
   * await search("9781234567890", 5, 'isbn');
   */
  const search = useCallback(
    async (
      query: string,
      maxResults: number = API_CONFIG.SEARCH.DEFAULT_LIMIT,
      searchType: "title" | "author" | "general" | "isbn" = "general"
    ) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        let serviceResult: ServiceResult<GoogleBooksVolume[]>;

        switch (searchType) {
          case "title":
            serviceResult = await googleBooksApi.searchByTitle(
              query,
              maxResults
            );
            break;
          case "author":
            serviceResult = await googleBooksApi.searchByAuthor(
              query,
              maxResults
            );
            break;
          case "isbn":
            serviceResult = await googleBooksApi.searchByISBN(
              query,
              maxResults
            );
            break;
          case "general":
          default:
            serviceResult = await googleBooksApi.search(query, maxResults);
            break;
        }

        if (serviceResult.success && serviceResult.data) {
          setSearchResults(serviceResult.data);
        } else {
          setSearchResults([]);
          if (serviceResult.error) {
            setError(serviceResult.error);
          }
        }
      } catch (err) {
        console.error("Error searching books:", err);
        const standardError = createNetworkError(
          "Failed to search books",
          "Failed to search books. Please check your internet connection and try again."
        );
        setError(standardError);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

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
