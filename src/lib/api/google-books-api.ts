/**
 * Google Books API service for client-side searches
 * Handles all interactions with the Google Books API v1
 */

import {
  ErrorBuilder,
  ErrorCategory,
  ErrorSeverity,
  createNetworkError,
  createSystemError,
  createValidationError,
} from "@/lib/errors/error-handling";
import { ServiceResult } from "@/lib/services/types";
import { API_CONFIG } from "../constants/constants";

// Google Books API response interfaces
export interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  pageCount?: number;
  publishedDate?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };

  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  industryIdentifiers?: Array<{
    type: "ISBN_10" | "ISBN_13" | "ISSN" | "OTHER";
    identifier: string;
  }>;
  publisher?: string;
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
  subtitle?: string;
  maturityRating?: string;
  allowAnonLogging?: boolean;
  contentVersion?: string;
  panelizationSummary?: {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
  };
  readingModes?: {
    text: boolean;
    image: boolean;
  };
  printType?: string;
  mainCategory?: string;
}

export interface GoogleBooksVolume {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: GoogleBooksVolumeInfo;
  saleInfo?: {
    country: string;
    saleability: string;
    isEbook: boolean;
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
    buyLink?: string;
    offers?: Array<{
      finskyOfferType: number;
      listPrice: {
        amountInMicros: number;
        currencyCode: string;
      };
      retailPrice: {
        amountInMicros: number;
        currencyCode: string;
      };
    }>;
  };
  accessInfo?: {
    country: string;
    viewability: string;
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: string;
    epub: {
      isAvailable: boolean;
      acsTokenLink?: string;
    };
    pdf: {
      isAvailable: boolean;
      acsTokenLink?: string;
    };
    webReaderLink: string;
    accessViewStatus: string;
    quoteSharingAllowed: boolean;
  };
  searchInfo?: {
    textSnippet: string;
  };
}

export interface GoogleBooksSearchResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}

export interface SearchOptions {
  query: string;
  maxResults?: number;
  startIndex?: number;
  printType?: "all" | "books" | "magazines";
  filter?: "partial" | "full" | "free-ebooks" | "paid-ebooks" | "ebooks";
  download?: "epub";
  langRestrict?: string;
  orderBy?: "newest" | "relevance";
}

export interface AdvancedSearchParams {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  publisher?: string;
  language?: string;
  maxResults?: number;
  orderBy?: "newest" | "relevance";
}

const GOOGLE_BOOKS_API_BASE_URL = "https://www.googleapis.com/books/v1";

export class GoogleBooksApiService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || "";
  }

  /**
   * Check if the API service is properly configured
   */
  public isConfigured(): ServiceResult<boolean> {
    if (!this.apiKey) {
      return {
        success: false,
        error: createSystemError(
          "Google Books API key not found. Please set NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY in your environment variables."
        ),
      };
    }
    return {
      success: true,
      data: true,
    };
  }

  /**
   * Build URL with parameters for API requests
   */
  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const urlParams = new URLSearchParams();
    for (const key in params) {
      if (params[key]) {
        urlParams.append(key, params[key]);
      }
    }
    urlParams.append("key", this.apiKey);
    return `${GOOGLE_BOOKS_API_BASE_URL}${endpoint}?${urlParams}`;
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest<T>(url: string): Promise<ServiceResult<T>> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          return {
            success: false,
            error: new ErrorBuilder("Rate limit exceeded")
              .withCategory(ErrorCategory.NETWORK)
              .withUserMessage("Rate limit exceeded. Please try again later.")
              .withSeverity(ErrorSeverity.MEDIUM)
              .build(),
          };
        } else if (response.status === 403) {
          return {
            success: false,
            error: new ErrorBuilder("API key invalid")
              .withCategory(ErrorCategory.AUTHORIZATION)
              .withUserMessage("API key invalid or quota exceeded.")
              .withSeverity(ErrorSeverity.HIGH)
              .build(),
          };
        } else if (response.status === 400) {
          return {
            success: false,
            error: createValidationError("Invalid search query"),
          };
        } else {
          return {
            success: false,
            error: new ErrorBuilder(
              `API error: ${response.status} ${response.statusText}`
            )
              .withCategory(ErrorCategory.NETWORK)
              .withUserMessage(
                "Google Books API is temporarily unavailable. Please try again later."
              )
              .withSeverity(ErrorSeverity.MEDIUM)
              .build(),
          };
        }
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: createNetworkError(error.message),
        };
      }
      return {
        success: false,
        error: createNetworkError(
          "Network error. Please check your connection and try again."
        ),
      };
    }
  }

  /**
   * Search for books using the Google Books API
   * @param options - Search options including query and filters
   * @returns Promise<ServiceResult<GoogleBooksVolume[]>>
   */
  async searchBooks(
    options: SearchOptions
  ): Promise<ServiceResult<GoogleBooksVolume[]>> {
    const configResult = this.isConfigured();
    if (!configResult.success) {
      return {
        success: false,
        error: configResult.error,
      };
    }

    if (!options.query.trim()) {
      return {
        success: true,
        data: [],
      };
    }

    const params: Record<string, string> = {
      q: options.query.trim(),
      maxResults: Math.min(
        options.maxResults || API_CONFIG.GOOGLE_BOOKS.DEFAULT_SEARCH_RESULTS,
        API_CONFIG.GOOGLE_BOOKS.MAX_SEARCH_RESULTS
      ).toString(),
    };

    if (options.startIndex) params.startIndex = options.startIndex.toString();
    if (options.printType) params.printType = options.printType;
    if (options.filter) params.filter = options.filter;
    if (options.download) params.download = options.download;
    if (options.langRestrict) params.langRestrict = options.langRestrict;
    if (options.orderBy) params.orderBy = options.orderBy;

    const url = this.buildUrl("/volumes", params);
    const result = await this.makeRequest<GoogleBooksSearchResponse>(url);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data?.items || [],
    };
  }

  /**
   * Simple search method for basic queries
   * @param query - Search query (title, author, ISBN, etc.)
   * @param maxResults - Maximum number of results to return (default: 10, max: 40)
   * @returns Promise<ServiceResult<GoogleBooksVolume[]>>
   */
  async search(
    query: string,
    maxResults: number = API_CONFIG.GOOGLE_BOOKS.DEFAULT_SEARCH_RESULTS
  ): Promise<ServiceResult<GoogleBooksVolume[]>> {
    return this.searchBooks({ query, maxResults });
  }

  /**
   * Get detailed information about a specific book
   * @param volumeId - The Google Books volume ID
   * @returns Promise<ServiceResult<GoogleBooksVolume>>
   */
  async getBookDetails(
    volumeId: string
  ): Promise<ServiceResult<GoogleBooksVolume>> {
    const configResult = this.isConfigured();
    if (!configResult.success) {
      return {
        success: false,
        error: configResult.error,
      };
    }

    const url = this.buildUrl(`/volumes/${volumeId}`, {});
    return this.makeRequest<GoogleBooksVolume>(url);
  }

  /**
   * Search books by ISBN
   * @param isbn - ISBN-10 or ISBN-13
   * @param maxResults - Maximum number of results
   * @returns Promise<ServiceResult<GoogleBooksVolume[]>>
   */
  async searchByISBN(
    isbn: string,
    maxResults: number = API_CONFIG.GOOGLE_BOOKS.AUTHOR_SEARCH_RESULTS
  ): Promise<ServiceResult<GoogleBooksVolume[]>> {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    return this.searchBooks({
      query: `isbn:${cleanIsbn}`,
      maxResults,
    });
  }

  /**
   * Search books by title
   * @param title - Book title
   * @param maxResults - Maximum number of results
   * @returns Promise<ServiceResult<GoogleBooksVolume[]>>
   */
  async searchByTitle(
    title: string,
    maxResults: number = API_CONFIG.GOOGLE_BOOKS.DEFAULT_SEARCH_RESULTS
  ): Promise<ServiceResult<GoogleBooksVolume[]>> {
    return this.searchBooks({
      query: `intitle:"${title}"`,
      maxResults,
    });
  }

  /**
   * Search books by author
   * @param author - Author name
   * @param maxResults - Maximum number of results
   * @returns Promise<ServiceResult<GoogleBooksVolume[]>>
   */
  async searchByAuthor(
    author: string,
    maxResults: number = API_CONFIG.GOOGLE_BOOKS.DEFAULT_SEARCH_RESULTS
  ): Promise<ServiceResult<GoogleBooksVolume[]>> {
    return this.searchBooks({
      query: `inauthor:"${author}"`,
      maxResults,
    });
  }

  /**
   * Advanced search with multiple parameters
   * @param params - Advanced search parameters
   * @returns Promise<ServiceResult<GoogleBooksVolume[]>>
   */
  async advancedSearch(
    params: AdvancedSearchParams
  ): Promise<ServiceResult<GoogleBooksVolume[]>> {
    const queryParts: string[] = [];

    if (params.title) queryParts.push(`intitle:"${params.title}"`);
    if (params.author) queryParts.push(`inauthor:"${params.author}"`);
    if (params.isbn) {
      const cleanIsbn = params.isbn.replace(/[-\s]/g, "");
      queryParts.push(`isbn:${cleanIsbn}`);
    }
    if (params.category) queryParts.push(`subject:"${params.category}"`);
    if (params.publisher) queryParts.push(`inpublisher:"${params.publisher}"`);

    if (queryParts.length === 0) {
      return {
        success: false,
        error: createValidationError(
          "At least one search parameter is required"
        ),
      };
    }

    const query = queryParts.join(" ");

    return this.searchBooks({
      query,
      maxResults:
        params.maxResults || API_CONFIG.GOOGLE_BOOKS.DEFAULT_SEARCH_RESULTS,
      orderBy: params.orderBy,
      langRestrict: params.language,
    });
  }

  /**
   * Search for free ebooks
   * @param query - Search query
   * @param maxResults - Maximum number of results
   * @returns Promise<ServiceResult<GoogleBooksVolume[]>>
   */
  async searchFreeEbooks(
    query: string,
    maxResults: number = API_CONFIG.GOOGLE_BOOKS.DEFAULT_SEARCH_RESULTS
  ): Promise<ServiceResult<GoogleBooksVolume[]>> {
    return this.searchBooks({
      query,
      maxResults,
      filter: "free-ebooks",
    });
  }

  /**
   * Get the best thumbnail URL for a book
   * @param volume - Google Books volume
   * @returns string | undefined
   */
  static getBestThumbnail(volume: GoogleBooksVolume): string | undefined {
    const imageLinks = volume.volumeInfo.imageLinks;
    if (!imageLinks) return undefined;

    // Priority: medium > small > thumbnail > smallThumbnail
    return (
      imageLinks.medium ||
      imageLinks.small ||
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail
    );
  }

  /**
   * Get the best ISBN for a book (prefers ISBN-13)
   * @param volume - Google Books volume
   * @returns string | undefined
   */
  static getBestISBN(volume: GoogleBooksVolume): string | undefined {
    const identifiers = volume.volumeInfo.industryIdentifiers;
    if (!identifiers || identifiers.length === 0) return undefined;

    // Prefer ISBN-13 over ISBN-10
    const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
    const isbn10 = identifiers.find((id) => id.type === "ISBN_10");

    return isbn13?.identifier || isbn10?.identifier;
  }

  /**
   * Format authors array into a readable string
   * @param authors - Array of author names
   * @returns string
   */
  static formatAuthors(authors?: string[]): string {
    if (!authors || authors.length === 0) return "Unknown Author";
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(" and ");
    return `${authors.slice(0, -1).join(", ")} and ${
      authors[authors.length - 1]
    }`;
  }
}

// Export a singleton instance
export const googleBooksApi = new GoogleBooksApiService();

// Export utility functions
export const { getBestThumbnail, getBestISBN, formatAuthors } =
  GoogleBooksApiService;
