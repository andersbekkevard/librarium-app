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
import BookCard from '@/components/app/BookCard'
import { Book } from '@/lib/models'
import { Timestamp } from 'firebase/firestore'

// Sample extended book data for the library - converted to use centralized Book model
const libraryBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    state: "finished",
    progress: { currentPage: 180, totalPages: 180, percentage: 100 },
    isOwned: true,
    rating: 4,
    coverImage: "https://covers.openlibrary.org/b/id/8225261-M.jpg",
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    finishedAt: Timestamp.now()
  },
  {
    id: "2", 
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    state: "in_progress",
    progress: { currentPage: 156, totalPages: 376, percentage: 41 },
    isOwned: true,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    startedAt: Timestamp.now()
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell", 
    state: "not_started",
    progress: { currentPage: 0, totalPages: 328, percentage: 0 },
    isOwned: true,
    coverImage: "https://covers.openlibrary.org/b/id/7222246-M.jpg",
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "4",
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    state: "in_progress",
    progress: { currentPage: 89, totalPages: 277, percentage: 32 },
    isOwned: true,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    startedAt: Timestamp.now()
  },
  {
    id: "5",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    state: "finished",
    progress: { currentPage: 432, totalPages: 432, percentage: 100 },
    isOwned: true,
    rating: 5,
    coverImage: "https://covers.openlibrary.org/b/id/8134973-M.jpg",
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    finishedAt: Timestamp.now()
  },
  {
    id: "6",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    state: "not_started",
    progress: { currentPage: 0, totalPages: 1216, percentage: 0 },
    isOwned: true,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "7",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    state: "in_progress",
    progress: { currentPage: 123, totalPages: 310, percentage: 40 },
    isOwned: true,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    startedAt: Timestamp.now()
  },
  {
    id: "8",
    title: "Dune",
    author: "Frank Herbert",
    state: "finished",
    progress: { currentPage: 688, totalPages: 688, percentage: 100 },
    isOwned: true,
    rating: 5,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    finishedAt: Timestamp.now()
  },
  {
    id: "9",
    title: "The Midnight Library",
    author: "Matt Haig",
    state: "finished",
    progress: { currentPage: 288, totalPages: 288, percentage: 100 },
    isOwned: true,
    rating: 4,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    finishedAt: Timestamp.now()
  },
  {
    id: "10",
    title: "Atomic Habits",
    author: "James Clear",
    state: "in_progress",
    progress: { currentPage: 89, totalPages: 320, percentage: 28 },
    isOwned: true,
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    startedAt: Timestamp.now()
  }
]

type ViewMode = 'grid' | 'list'
type SortOption = 'title' | 'author' | 'pages' | 'rating' | 'progress'
type SortDirection = 'asc' | 'desc'
type FilterStatus = 'all' | 'not_started' | 'in_progress' | 'finished'

interface BookListItemProps {
  book: Book
  onEdit: (book: Book) => void
  onUpdateProgress: (book: Book) => void
}

export const BookListItem: React.FC<BookListItemProps> = ({ book, onEdit, onUpdateProgress }) => {
  const getProgressPercentage = () => {
    if (book.state === 'finished') return 100
    if (book.state === 'in_progress') {
      return book.progress.percentage || 0
    }
    return 0
  }

  const getStatusBadge = () => {
    switch (book.state) {
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
              {book.coverImage ? (
                <img
                  src={book.coverImage}
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
                {book.progress.totalPages || '?'} pages
              </span>
            </div>

            <div>
              {book.isOwned ? (
                <Badge variant="outline" className="text-xs">
                  Owned
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Wishlist
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-center">
              {getStatusBadge()}
            </div>

            <div className="flex items-center justify-between">
              {/* Rating or Progress */}
              <div className="flex items-center gap-1">
                {book.state === 'finished' && book.rating ? (
                  <div className="flex items-center gap-1">
                    {renderStars(book.rating)}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({book.rating}/5)
                    </span>
                  </div>
                ) : book.state === 'in_progress' ? (
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
                {book.state === 'in_progress' && (
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
  const [filterOwnership, setFilterOwnership] = useState<string>('all')


  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = libraryBooks

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(book => book.state === filterStatus)
    }

    // Apply ownership filter
    if (filterOwnership !== 'all') {
      filtered = filtered.filter(book => 
        filterOwnership === 'owned' ? book.isOwned : !book.isOwned
      )
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
          aValue = a.progress.totalPages || 0
          bValue = b.progress.totalPages || 0
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'progress':
          const aProgress = a.state === 'finished' ? 100 : a.progress.percentage || 0
          const bProgress = b.state === 'finished' ? 100 : b.progress.percentage || 0
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
  }, [searchQuery, filterStatus, filterOwnership, sortBy, sortDirection])

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
    setFilterOwnership('all')
    setSortBy('title')
    setSortDirection('asc')
  }

  const activeFiltersCount = [
    filterStatus !== 'all',
    filterOwnership !== 'all'
  ].filter(Boolean).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">My Library</h1>
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

            {/* Ownership Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ownership:</span>
              <select
                value={filterOwnership}
                onChange={(e) => setFilterOwnership(e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Books</option>
                <option value="owned">Owned</option>
                <option value="wishlist">Wishlist</option>
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