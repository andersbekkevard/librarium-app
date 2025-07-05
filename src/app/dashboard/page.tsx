"use client"

import { useState } from "react"
import BookCard, { Book } from "@/components/BookCard"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import AddBooksPage from "@/components/AddBooksPage"
import MyLibraryPage from "@/components/MyLibraryPage"
import GoogleAuth from "@/components/GoogleAuth"
import { BookOpen, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [, setFilteredBooks] = useState(sampleBooks)
  const [searchQuery, setSearchQuery] = useState('')

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
    setSearchQuery(query)
    
    // Filter books based on search query for dashboard
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

  const handleAddBookClick = () => {
    setActiveSection('add-books')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed at top */}
      <Header 
        onSearch={handleSearch}
        userName="John Doe"
        userSince="2023"
        notificationCount={3}
      />

      {/* Sidebar - Fixed Position under header */}
      <Sidebar 
        activeItem={activeSection}
        onItemClick={handleSidebarItemClick}
        onAddBookClick={handleAddBookClick}
      />

      {/* Main Content - Adjusted for both fixed header and sidebar */}
      <main className="ml-64 pt-[72px]">
          {activeSection === 'add-books' ? (
            <AddBooksPage />
          ) : activeSection === 'library' ? (
            <MyLibraryPage searchQuery={searchQuery} />
          ) : activeSection === 'auth-demo' ? (
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Firebase Authentication Demo
                </h1>
                <p className="text-muted-foreground">
                  Test Google authentication with Firebase popup.
                </p>
              </div>
              <GoogleAuth />
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back! Here&apos;s your reading overview.
                </p>
              </div>

              {/* Bento Box Dashboard Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Quick Stats Row */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Books */}
                  <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                        <p className="text-2xl font-bold text-foreground">{sampleBooks.length}</p>
                      </div>
                      <div className="h-8 w-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-brand-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Books Read This Year */}
                  <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Read This Year</p>
                        <p className="text-2xl font-bold text-foreground">{sampleBooks.filter(book => book.readingState === 'finished').length}</p>
                      </div>
                      <div className="h-8 w-8 bg-status-success/10 rounded-full flex items-center justify-center">
                        <Star className="h-4 w-4 text-status-success fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Pages Read This Month */}
                  <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pages This Month</p>
                        <p className="text-2xl font-bold text-foreground">1,247</p>
                      </div>
                      <div className="h-8 w-8 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-brand-accent" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reading Streak */}
                <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">Reading Streak</p>
                      <p className="text-2xl font-bold text-white">12 days</p>
                      <p className="text-sm text-white/60 mt-1">Keep it up!</p>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                      <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Currently Reading Books - Takes up 2 columns */}
                <div className="lg:col-span-2">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-foreground">Currently Reading</h2>
                      <Button variant="ghost" size="sm" className="text-brand-primary hover:text-brand-primary-hover">
                        View All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sampleBooks
                        .filter(book => book.readingState === 'in_progress')
                        .slice(0, 6)
                        .map((book) => (
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

                {/* Recent Activity - Takes up 1 column */}
                <div className="lg:col-span-1">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                      {/* Activity Items */}
                      <div className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-status-success rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Finished reading <span className="font-medium">The Great Gatsby</span></p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-brand-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Started reading <span className="font-medium">The Catcher in the Rye</span></p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-status-warning rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Rated <span className="font-medium">Pride and Prejudice</span> 5 stars</p>
                          <p className="text-xs text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-brand-accent rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Added <span className="font-medium">1984</span> to library</p>
                          <p className="text-xs text-muted-foreground">5 days ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="h-2 w-2 bg-status-info rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">Updated progress on <span className="font-medium">To Kill a Mockingbird</span></p>
                          <p className="text-xs text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recently Read Section */}
              <div className="mt-8">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Recently Read</h2>
                    <Button variant="ghost" size="sm" className="text-brand-primary hover:text-brand-primary-hover">
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sampleBooks
                      .filter(book => book.readingState === 'finished')
                      .map((book) => (
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
            </div>
          )}
        </main>
    </div>
  )
}