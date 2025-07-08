const mockGoogleBooksApiService = jest.fn();
const mockGoogleBooksApi = {
  isConfigured: jest.fn(),
  searchBooks: jest.fn(),
  getBookDetails: jest.fn(),
  search: jest.fn(),
  searchByISBN: jest.fn(),
  searchByTitle: jest.fn(),
  searchByAuthor: jest.fn(),
  advancedSearch: jest.fn(),
  searchFreeEbooks: jest.fn(),
};

jest.mock('../google-books-api', () => ({
  GoogleBooksApiService: mockGoogleBooksApiService,
  googleBooksApi: mockGoogleBooksApi,
  getBestThumbnail: jest.fn(),
  getBestISBN: jest.fn(),
  formatAuthors: jest.fn(),
}));

import { googleBooksApi, getBestThumbnail, getBestISBN, formatAuthors, type GoogleBooksVolume, type GoogleBooksSearchResponse, type SearchOptions, type AdvancedSearchParams } from '../google-books-api';
