'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import { 
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
  BookOpen,
  Star,
  User
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import BookCard, { Book } from '@/components/BookCard'

// Sample extended book data for the library
const libraryBooks: Book[] = [
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
  },
  {
    id: "9",
    title: "The Midnight Library",
    author: "Matt Haig",
    pages: 288,
    readingState: "finished",
    genre: "Fiction",
    rating: 4
  },
  {
    id: "10",
    title: "Atomic Habits",
    author: "James Clear",
    pages: 320,
    currentPage: 89,
    readingState: "in_progress",
    genre: "Self-Help"
  }
]

type ViewMode = 'grid' | 'list'
type SortOption = 'title' | 'author' | 'pages' | 'genre' | 'rating' | 'progress'
type SortDirection = 'asc' | 'desc'
type FilterStatus = 'all' | 'not_started' | 'in_progress' | 'finished'

interface BookListItemProps {
  book: Book
  onEdit: (book: Book) => void
  onUpdateProgress: (book: Book) => void
}

const BookListItem: React.FC<BookListItemProps> = ({ book, onEdit, onUpdateProgress }) => {
  const getProgressPercentage = () => {
    if (book.readingState === 'finished') return 100
    if (book.readingState === 'in_progress' && book.currentPage) {
      return Math.round((book.currentPage / book.pages) * 100)
    }
    return 0
  }

  const getStatusBadge = () => {
    switch (book.readingState) {
      case 'not_started':
        return <Badge variant="secondary">Not Started</Badge>
      case 'in_progress':
        return <Badge variant="default">Reading</Badge>
      case 'finished':
        return <Badge variant="outline">Finished</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating 
            ? 'fill-status-warning text-status-warning' 
            : 'fill-muted text-muted'
        }`}
      />
    ))
  }

  return (
    <Card className="w-full">
      <CardContent className="p-2">
        <div className="flex gap-2 items-center">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="w-8 h-11 bg-muted rounded flex items-center justify-center">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <BookOpen className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-foreground truncate">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {book.author}
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {book.pages} pages
              </span>
            </div>

            <div>
              {book.genre && (
                <Badge variant="outline" className="text-xs">
                  {book.genre}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-center">
              {getStatusBadge()}
            </div>

            <div className="flex items-center justify-between">
              {/* Rating or Progress */}
              <div className="flex items-center gap-1">
                {book.readingState === 'finished' && book.rating ? (
                  <div className="flex items-center gap-1">
                    {renderStars(book.rating)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({book.rating}/5)
                    </span>
                  </div>
                ) : book.readingState === 'in_progress' ? (
                  <div className="text-xs text-muted-foreground">
                    {getProgressPercentage()}% complete
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Not started
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(book)}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Edit</span>
                  ✏️
                </Button>
                {book.readingState === 'in_progress' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateProgress(book)}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Update Progress</span>
                    📖
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MyLibraryPageProps {
  searchQuery?: string
}

export const MyLibraryPage: React.FC<MyLibraryPageProps> = ({ searchQuery = '' }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('title')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterGenre, setFilterGenre] = useState<string>('all')

  // Get unique genres for filter dropdown
  const availableGenres = useMemo(() => {
    const genres = libraryBooks
      .map(book => book.genre)
      .filter((genre): genre is string => !!genre)
    return [...new Set(genres)].sort()
  }, [])

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = libraryBooks

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(book => book.readingState === filterStatus)
    }

    // Apply genre filter
    if (filterGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === filterGenre)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'author':
          aValue = a.author.toLowerCase()
          bValue = b.author.toLowerCase()
          break
        case 'pages':
          aValue = a.pages
          bValue = b.pages
          break
        case 'genre':
          aValue = a.genre?.toLowerCase() || ''
          bValue = b.genre?.toLowerCase() || ''
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'progress':
          const aProgress = a.readingState === 'finished' ? 100 : 
                          a.readingState === 'in_progress' && a.currentPage ? 
                          (a.currentPage / a.pages) * 100 : 0
          const bProgress = b.readingState === 'finished' ? 100 : 
                          b.readingState === 'in_progress' && b.currentPage ? 
                          (b.currentPage / b.pages) * 100 : 0
          aValue = aProgress
          bValue = bProgress
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

    return sorted
  }, [searchQuery, filterStatus, filterGenre, sortBy, sortDirection])

  const handleEdit = (book: Book) => {
    console.log('Edit book:', book.title)
  }

  const handleUpdateProgress = (book: Book) => {
    console.log('Update progress for:', book.title)
  }

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(option)
      setSortDirection('asc')
    }
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setFilterGenre('all')
    setSortBy('title')
    setSortDirection('asc')
  }

  const activeFiltersCount = [
    filterStatus !== 'all',
    filterGenre !== 'all'
  ].filter(Boolean).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Library</h1>
          <p className="text-muted-foreground">
            Manage and organize your book collection
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search info - controlled by header */}
          {searchQuery.trim() && (
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                Searching for: <span className="font-medium text-foreground">&quot;{searchQuery}&quot;</span>
              </p>
            </div>
          )}

          {/* Filters and Sorting */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">Reading</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Genre:</span>
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Genres</option>
                {availableGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <div className="flex gap-1">
                {[
                  { key: 'title' as const, label: 'Title' },
                  { key: 'author' as const, label: 'Author' },
                  { key: 'pages' as const, label: 'Pages' },
                  { key: 'genre' as const, label: 'Genre' },
                  { key: 'rating' as const, label: 'Rating' },
                  { key: 'progress' as const, label: 'Progress' }
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={sortBy === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSort(key)}
                    className="flex items-center gap-1"
                  >
                    {label}
                    {sortBy === key && (
                      sortDirection === 'asc' ? 
                        <SortAsc className="h-3 w-3" /> : 
                        <SortDesc className="h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedBooks.length} of {libraryBooks.length} books
        </p>
      </div>

      {/* Books Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredAndSortedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={handleEdit}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredAndSortedBooks.map((book) => (
            <BookListItem
              key={book.id}
              book={book}
              onEdit={handleEdit}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedBooks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No books found</h3>
            <p className="text-muted-foreground">
              {activeFiltersCount > 0 
                ? "Try adjusting your filters or search terms"
                : "Your library is empty. Start by adding some books!"
              }
            </p>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MyLibraryPage 