import { Timestamp } from "firebase/firestore";
import {
  formatAuthors,
  getBestISBN,
  getBestThumbnail,
  GoogleBooksVolume,
} from "../api/google-books-api";
import { Book } from "../models/models";

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
  const totalPages = parseInt(formData.pages);
  const book: Book = {
    id: `manual-${Date.now()}-${Math.random()}`,
    title: formData.title.trim(),
    author: formData.author.trim(),
    state: "not_started",
    progress: {
      currentPage: 0,
      totalPages: isNaN(totalPages) ? 0 : totalPages,
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

const calculateBookProgress = (book: Book): number => {
  if (book.state === "finished") {
    return 100;
  }
  if (book.state === "not_started") {
    return 0;
  }
  if (!book.progress.totalPages || !book.progress.currentPage) {
    return 0;
  }
  return Math.round(
    (book.progress.currentPage / book.progress.totalPages) * 100
  );
};

export {
  calculateBookProgress,
  convertGoogleBookToBook,
  convertManualEntryToBook,
};
