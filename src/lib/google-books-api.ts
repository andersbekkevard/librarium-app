/**
 * Google Books API service for client-side searches
 * Handles all interactions with the Google Books API v1
 */

// Google Books API response interfaces
export interface GoogleBooksVolumeInfo {
  title: string
  authors?: string[]
  description?: string
  pageCount?: number
  publishedDate?: string
  imageLinks?: {
    thumbnail?: string
    smallThumbnail?: string
    small?: string
    medium?: string
    large?: string
    extraLarge?: string
  }
  categories?: string[]
  averageRating?: number
  ratingsCount?: number
  industryIdentifiers?: Array<{
    type: 'ISBN_10' | 'ISBN_13' | 'ISSN' | 'OTHER'
    identifier: string
  }>
  publisher?: string
  language?: string
  previewLink?: string
  infoLink?: string
  canonicalVolumeLink?: string
  subtitle?: string
  maturityRating?: string
  allowAnonLogging?: boolean
  contentVersion?: string
  panelizationSummary?: {
    containsEpubBubbles: boolean
    containsImageBubbles: boolean
  }
  readingModes?: {
    text: boolean
    image: boolean
  }
  printType?: string
  mainCategory?: string
}

export interface GoogleBooksVolume {
  kind: string
  id: string
  etag: string
  selfLink: string
  volumeInfo: GoogleBooksVolumeInfo
  saleInfo?: {
    country: string
    saleability: string
    isEbook: boolean
    listPrice?: {
      amount: number
      currencyCode: string
    }
    retailPrice?: {
      amount: number
      currencyCode: string
    }
    buyLink?: string
    offers?: Array<{
      finskyOfferType: number
      listPrice: {
        amountInMicros: number
        currencyCode: string
      }
      retailPrice: {
        amountInMicros: number
        currencyCode: string
      }
    }>
  }
  accessInfo?: {
    country: string
    viewability: string
    embeddable: boolean
    publicDomain: boolean
    textToSpeechPermission: string
    epub: {
      isAvailable: boolean
      acsTokenLink?: string
    }
    pdf: {
      isAvailable: boolean
      acsTokenLink?: string
    }
    webReaderLink: string
    accessViewStatus: string
    quoteSharingAllowed: boolean
  }
  searchInfo?: {
    textSnippet: string
  }
}

export interface GoogleBooksSearchResponse {
  kind: string
  totalItems: number
  items?: GoogleBooksVolume[]
}

export interface SearchOptions {
  query: string
  maxResults?: number
  startIndex?: number
  printType?: 'all' | 'books' | 'magazines'
  filter?: 'partial' | 'full' | 'free-ebooks' | 'paid-ebooks' | 'ebooks'
  download?: 'epub'
  langRestrict?: string
  orderBy?: 'newest' | 'relevance'
}

export interface AdvancedSearchParams {
  title?: string
  author?: string
  isbn?: string
  category?: string
  publisher?: string
  language?: string
  maxResults?: number
  orderBy?: 'newest' | 'relevance'
}

const GOOGLE_BOOKS_API_BASE_URL = 'https://www.googleapis.com/books/v1'

class GoogleBooksApiService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Google Books API key not found. Please set NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY in your environment variables.')
    }
  }

  /**
   * Check if the API service is properly configured
   */
  public isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * Build URL with parameters for API requests
   */
  private buildUrl(endpoint: string, params: Record<string, string>): string {
    const urlParams = new URLSearchParams({
      ...params,
      key: this.apiKey
    })
    return `${GOOGLE_BOOKS_API_BASE_URL}${endpoint}?${urlParams}`
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else if (response.status === 403) {
          throw new Error('API key invalid or quota exceeded.')
        } else if (response.status === 400) {
          throw new Error('Invalid search query.')
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error. Please check your connection and try again.')
    }
  }

  /**
   * Search for books using the Google Books API
   * @param options - Search options including query and filters
   * @returns Promise<GoogleBooksVolume[]>
   */
  async searchBooks(options: SearchOptions): Promise<GoogleBooksVolume[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Books API key is not configured')
    }

    if (!options.query.trim()) {
      return []
    }

    const params: Record<string, string> = {
      q: options.query.trim(),
      maxResults: Math.min(options.maxResults || 10, 40).toString()
    }

    if (options.startIndex) params.startIndex = options.startIndex.toString()
    if (options.printType) params.printType = options.printType
    if (options.filter) params.filter = options.filter
    if (options.download) params.download = options.download
    if (options.langRestrict) params.langRestrict = options.langRestrict
    if (options.orderBy) params.orderBy = options.orderBy

    const url = this.buildUrl('/volumes', params)
    const data = await this.makeRequest<GoogleBooksSearchResponse>(url)
    
    return data.items || []
  }

  /**
   * Simple search method for basic queries
   * @param query - Search query (title, author, ISBN, etc.)
   * @param maxResults - Maximum number of results to return (default: 10, max: 40)
   * @returns Promise<GoogleBooksVolume[]>
   */
  async search(query: string, maxResults: number = 10): Promise<GoogleBooksVolume[]> {
    return this.searchBooks({ query, maxResults })
  }

  /**
   * Get detailed information about a specific book
   * @param volumeId - The Google Books volume ID
   * @returns Promise<GoogleBooksVolume>
   */
  async getBookDetails(volumeId: string): Promise<GoogleBooksVolume> {
    if (!this.isConfigured()) {
      throw new Error('Google Books API key is not configured')
    }

    const url = this.buildUrl(`/volumes/${volumeId}`, {})
    return this.makeRequest<GoogleBooksVolume>(url)
  }

  /**
   * Search books by ISBN
   * @param isbn - ISBN-10 or ISBN-13
   * @param maxResults - Maximum number of results
   * @returns Promise<GoogleBooksVolume[]>
   */
  async searchByISBN(isbn: string, maxResults: number = 5): Promise<GoogleBooksVolume[]> {
    const cleanIsbn = isbn.replace(/[-\s]/g, '')
    return this.searchBooks({ 
      query: `isbn:${cleanIsbn}`, 
      maxResults 
    })
  }

  /**
   * Search books by title
   * @param title - Book title
   * @param maxResults - Maximum number of results
   * @returns Promise<GoogleBooksVolume[]>
   */
  async searchByTitle(title: string, maxResults: number = 10): Promise<GoogleBooksVolume[]> {
    return this.searchBooks({ 
      query: `intitle:"${title}"`, 
      maxResults 
    })
  }

  /**
   * Search books by author
   * @param author - Author name
   * @param maxResults - Maximum number of results
   * @returns Promise<GoogleBooksVolume[]>
   */
  async searchByAuthor(author: string, maxResults: number = 10): Promise<GoogleBooksVolume[]> {
    return this.searchBooks({ 
      query: `inauthor:"${author}"`, 
      maxResults 
    })
  }

  /**
   * Advanced search with multiple parameters
   * @param params - Advanced search parameters
   * @returns Promise<GoogleBooksVolume[]>
   */
  async advancedSearch(params: AdvancedSearchParams): Promise<GoogleBooksVolume[]> {
    const queryParts: string[] = []

    if (params.title) queryParts.push(`intitle:"${params.title}"`)
    if (params.author) queryParts.push(`inauthor:"${params.author}"`)
    if (params.isbn) {
      const cleanIsbn = params.isbn.replace(/[-\s]/g, '')
      queryParts.push(`isbn:${cleanIsbn}`)
    }
    if (params.category) queryParts.push(`subject:"${params.category}"`)
    if (params.publisher) queryParts.push(`inpublisher:"${params.publisher}"`)

    if (queryParts.length === 0) {
      throw new Error('At least one search parameter is required')
    }

    const query = queryParts.join(' ')
    
    return this.searchBooks({
      query,
      maxResults: params.maxResults || 10,
      orderBy: params.orderBy,
      langRestrict: params.language
    })
  }

  /**
   * Search for free ebooks
   * @param query - Search query
   * @param maxResults - Maximum number of results
   * @returns Promise<GoogleBooksVolume[]>
   */
  async searchFreeEbooks(query: string, maxResults: number = 10): Promise<GoogleBooksVolume[]> {
    return this.searchBooks({
      query,
      maxResults,
      filter: 'free-ebooks'
    })
  }

  /**
   * Get the best thumbnail URL for a book
   * @param volume - Google Books volume
   * @returns string | undefined
   */
  static getBestThumbnail(volume: GoogleBooksVolume): string | undefined {
    const imageLinks = volume.volumeInfo.imageLinks
    if (!imageLinks) return undefined

    // Priority: medium > small > thumbnail > smallThumbnail
    return imageLinks.medium || 
           imageLinks.small || 
           imageLinks.thumbnail || 
           imageLinks.smallThumbnail
  }

  /**
   * Get the best ISBN for a book (prefers ISBN-13)
   * @param volume - Google Books volume
   * @returns string | undefined
   */
  static getBestISBN(volume: GoogleBooksVolume): string | undefined {
    const identifiers = volume.volumeInfo.industryIdentifiers
    if (!identifiers || identifiers.length === 0) return undefined

    // Prefer ISBN-13 over ISBN-10
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13')
    const isbn10 = identifiers.find(id => id.type === 'ISBN_10')
    
    return isbn13?.identifier || isbn10?.identifier
  }

  /**
   * Format authors array into a readable string
   * @param authors - Array of author names
   * @returns string
   */
  static formatAuthors(authors?: string[]): string {
    if (!authors || authors.length === 0) return 'Unknown Author'
    if (authors.length === 1) return authors[0]
    if (authors.length === 2) return authors.join(' and ')
    return `${authors.slice(0, -1).join(', ')} and ${authors[authors.length - 1]}`
  }
}

// Export a singleton instance
export const googleBooksApi = new GoogleBooksApiService()

// Export utility functions
export const { getBestThumbnail, getBestISBN, formatAuthors } = GoogleBooksApiService 