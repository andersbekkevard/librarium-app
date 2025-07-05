"use client"

import { useState } from "react"
import BookCard, { Book } from "@/components/BookCard"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"

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
  },
  {
    id: "7",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    pages: 310,
    currentPage: 123,
    readingState: "in_progress",
    genre: "Fantasy"
  },
  {
    id: "8",
    title: "Dune",
    author: "Frank Herbert",
    pages: 688,
    readingState: "finished",
    genre: "Science Fiction",
    rating: 5
  }
]

export default function Home() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [filteredBooks, setFilteredBooks] = useState(sampleBooks)

  const handleEdit = (book: Book) => {
    console.log('Edit book:', book.title)
    // Handle edit functionality
  }

  const handleUpdateProgress = (book: Book) => {
    console.log('Update progress for:', book.title)
    // Handle update progress functionality
  }

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
    // Filter books based on search query
    if (query.trim() === '') {
      setFilteredBooks(sampleBooks)
    } else {
      const filtered = sampleBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.genre?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredBooks(filtered)
    }
  }

  const handleSidebarItemClick = (itemId: string) => {
    setActiveSection(itemId)
    console.log('Sidebar item clicked:', itemId)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeSection}
        onItemClick={handleSidebarItemClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          onSearch={handleSearch}
          userName="John Doe"
          userSince="2023"
          notificationCount={3}
        />

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here's your reading overview.
            </p>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={handleEdit}
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No books found. Try adjusting your search.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
