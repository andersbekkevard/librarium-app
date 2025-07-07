import { Timestamp } from "firebase/firestore";
import {
  formatAuthors,
  getBestISBN,
  getBestThumbnail,
  GoogleBooksVolume,
} from "./google-books-api";
import { Book } from "./models";

/**
 * Converts Google Books API volume to internal Book model
 *
 * Transforms a GoogleBooksVolume object from the Google Books API
 * into the app's internal Book model. Handles optional fields gracefully
 * and sets appropriate defaults for new books.
 *
 * @param googleBook - Google Books API volume object
 * @returns Book - Internal book model ready for Firestore storage
 *
 * @example
 * const googleBook = await googleBooksApi.search("The Great Gatsby")[0];
 * const book = convertGoogleBookToBook(googleBook);
 * await bookOperations.addBook(user.uid, book);
 */
const convertGoogleBookToBook = (googleBook: GoogleBooksVolume): Book => {
  const isbn = getBestISBN(googleBook);

  const book: Book = {
    id: googleBook.id,
    title: googleBook.volumeInfo.title,
    author: formatAuthors(googleBook.volumeInfo.authors),
    state: "not_started",
    progress: {
      currentPage: 0,
      totalPages: googleBook.volumeInfo.pageCount || 0,
    },
    genre: googleBook.volumeInfo.categories?.[0] || "",
    isOwned: false, // TODO Think about this: "Default to wishlist"
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Only add optional fields if they have values
  if (isbn) book.isbn = isbn;
  if (getBestThumbnail(googleBook))
    book.coverImage = getBestThumbnail(googleBook);
  if (googleBook.volumeInfo.publishedDate)
    book.publishedDate = googleBook.volumeInfo.publishedDate;
  if (googleBook.volumeInfo.description)
    book.description = googleBook.volumeInfo.description;

  return book;
};

/**
 * Converts manual form entry to internal Book model
 *
 * Transforms user-entered form data into the app's internal Book model.
 * Handles form validation, type conversion, and optional field processing.
 * Used by ManualEntryForm component.
 *
 * @param formData - Form data object with string values from form inputs
 * @param formData.title - Book title (required)
 * @param formData.author - Author name (required)
 * @param formData.genre - Genre (optional)
 * @param formData.pages - Page count as string (optional)
 * @param formData.publishedYear - Publication year as string (optional)
 * @param formData.ownership - Ownership status ("owned" or "wishlist")
 * @param formData.description - Book description (optional)
 * @returns Book - Internal book model ready for Firestore storage
 *
 * @example
 * const formData = {
 *   title: "My Book",
 *   author: "John Doe",
 *   genre: "Fantasy",
 *   pages: "200",
 *   publishedYear: "2023",
 *   ownership: "owned",
 *   description: "A great book"
 * };
 * const book = convertManualEntryToBook(formData);
 */
const convertManualEntryToBook = (formData: {
  title: string;
  author: string;
  genre: string;
  pages: string;
  publishedYear: string;
  ownership: string;
  description: string;
}): Book => {
  const book: Book = {
    id: `manual-${Date.now()}`,
    title: formData.title.trim(),
    author: formData.author.trim(),
    state: "not_started",
    progress: {
      currentPage: 0,
      totalPages: formData.pages ? parseInt(formData.pages) : 0,
    },
    isOwned: formData.ownership === "owned",
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Only add optional fields if they have values
  if (formData.genre && formData.genre.trim())
    book.genre = formData.genre.trim();
  if (formData.publishedYear && formData.publishedYear.trim()) {
    book.publishedDate = `${formData.publishedYear.trim()}-01-01`;
  }
  if (formData.description && formData.description.trim()) {
    book.description = formData.description.trim();
  }

  return book;
};

/**
 * Filters and sorts the book collection based on current filters and sort settings
 *
 * Applies multiple filters (search query, reading status, ownership status)
 * and sorting (by title, author, pages, rating, or progress) to the book collection.
 * This is the core data processing function that powers the library display.
 *
 * @param books - Array of books to filter and sort
 * @param searchQuery - Search query string for title/author/description
 * @param filterStatus - Reading status filter ("all" | "not_started" | "in_progress" | "finished")
 * @param filterOwnership - Ownership filter ("all" | "owned" | "wishlist")
 * @param sortBy - Field to sort by ("title" | "author" | "pages" | "rating" | "progress")
 * @param sortDirection - Sort direction ("asc" | "desc")
 * @returns Book[] - Filtered and sorted array of books
 *
 * Filtering logic:
 * - Search: Matches title, author, or description (case-insensitive)
 * - Status: Filters by reading state (not_started, in_progress, finished)
 * - Ownership: Filters by owned vs wishlist status
 *
 * Sorting logic:
 * - title/author: Alphabetical sorting (case-insensitive)
 * - pages: Sorts by total page count
 * - rating: Sorts by user rating (unrated books = 0)
 * - progress: Sorts by reading progress percentage
 */
const filterAndSortBooks = (
  books: Book[],
  searchQuery: string,
  filterStatus: string,
  filterOwnership: string,
  sortBy: string,
  sortDirection: "asc" | "desc"
): Book[] => {
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
        const aProgress =
          a.state === "finished"
            ? 100
            : a.progress.currentPage &&
              a.progress.totalPages &&
              a.progress.totalPages > 0
            ? Math.round((a.progress.currentPage / a.progress.totalPages) * 100)
            : 0;
        const bProgress =
          b.state === "finished"
            ? 100
            : b.progress.currentPage &&
              b.progress.totalPages &&
              b.progress.totalPages > 0
            ? Math.round((b.progress.currentPage / b.progress.totalPages) * 100)
            : 0;
        aValue = aProgress;
        bValue = bProgress;
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
};

const calculateBookProgress = (book: Book): number => {
  if (book.state === "finished") return 100;
  if (book.state === "not_started") return 0;

  const { currentPage, totalPages } = book.progress;
  if (currentPage && totalPages && totalPages > 0) {
    return Math.round((currentPage / totalPages) * 100);
  }
  return 0;
};

export {
  convertGoogleBookToBook,
  convertManualEntryToBook,
  filterAndSortBooks,
  calculateBookProgress,
};
