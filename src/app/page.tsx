"use client"

import BookCard, { Book } from "@/components/BookCard"

// Sample book data for demonstration
const sampleBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    pages: 180,
    readingState: "finished",
    genre: "Classic Fiction",
    rating: 4,
    coverUrl: "https://covers.openlibrary.org/b/id/8225261-M.jpg"
  },
  {
    id: "2", 
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    pages: 376,
    currentPage: 156,
    readingState: "in_progress",
    genre: "Literary Fiction"
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell", 
    pages: 328,
    readingState: "not_started",
    genre: "Dystopian Fiction",
    coverUrl: "https://covers.openlibrary.org/b/id/7222246-M.jpg"
  },
  {
    id: "4",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    pages: 277,
    currentPage: 89,
    readingState: "in_progress",
    genre: "Coming-of-age"
  },
  {
    id: "5",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    pages: 432,
    readingState: "finished",
    genre: "Romance",
    rating: 5,
    coverUrl: "https://covers.openlibrary.org/b/id/8134973-M.jpg"
  },
  {
    id: "6",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    pages: 1216,
    readingState: "not_started",
    genre: "Fantasy"
  }
]

export default function Home() {
  const handleEdit = (book: Book) => {
    console.log('Edit book:', book.title)
    // Handle edit functionality
  }

  const handleUpdateProgress = (book: Book) => {
    console.log('Update progress for:', book.title)
    // Handle update progress functionality
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📚 Librarium
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your personal book collection and reading tracker
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sampleBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={handleEdit}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
