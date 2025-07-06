'use client'

import * as React from 'react'
import { useState } from 'react'
import { 
  Search, 
  Plus, 
  BookOpen,
  ExternalLink,
  Camera,
  FileText,
  Check,
  X,
  Star,
  Calendar,
  User,
  Building,
  Loader2,
  AlertCircle
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Book } from '@/lib/models'
import { bookOperations } from '@/lib/firebase-utils'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Timestamp } from 'firebase/firestore'

// Mock Google Books API response structure
interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    pageCount?: number
    publishedDate?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    categories?: string[]
    averageRating?: number
    ratingsCount?: number
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    publisher?: string
    language?: string
  }
}

// Mock search results
const mockGoogleBooks: GoogleBook[] = [
  {
    id: 'book1',
    volumeInfo: {
      title: 'The Midnight Library',
      authors: ['Matt Haig'],
      description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
      pageCount: 288,
      publishedDate: '2020-08-13',
      imageLinks: {
        thumbnail: 'https://books.google.com/books/content/images/frontcover/placeholder.jpg'
      },
      categories: ['Fiction', 'Philosophy'],
      averageRating: 4.2,
      ratingsCount: 12847,
      industryIdentifiers: [
        { type: 'ISBN_13', identifier: '9780525559474' }
      ],
      publisher: 'Viking',
      language: 'en'
    }
  },
  {
    id: 'book2',
    volumeInfo: {
      title: 'Atomic Habits',
      authors: ['James Clear'],
      description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
      pageCount: 320,
      publishedDate: '2018-10-16',
      imageLinks: {
        thumbnail: 'https://books.google.com/books/content/images/frontcover/placeholder2.jpg'
      },
      categories: ['Self-Help', 'Psychology'],
      averageRating: 4.6,
      ratingsCount: 8234,
      industryIdentifiers: [
        { type: 'ISBN_13', identifier: '9780735211292' }
      ],
      publisher: 'Avery',
      language: 'en'
    }
  },
  {
    id: 'book3',
    volumeInfo: {
      title: 'Dune',
      authors: ['Frank Herbert'],
      description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.',
      pageCount: 688,
      publishedDate: '1965-08-01',
      imageLinks: {
        thumbnail: 'https://books.google.com/books/content/images/frontcover/placeholder3.jpg'
      },
      categories: ['Fiction', 'Science Fiction'],
      averageRating: 4.3,
      ratingsCount: 15632,
      industryIdentifiers: [
        { type: 'ISBN_13', identifier: '9780441172719' }
      ],
      publisher: 'Ace',
      language: 'en'
    }
  }
]

const SearchResults = ({ 
  books, 
  onAddBook, 
  addedBooks,
  isAdding 
}: { 
  books: GoogleBook[]
  onAddBook: (book: GoogleBook) => void
  addedBooks: Set<string>
  isAdding: boolean
}) => {
  if (books.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Search for books to add to your library</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <Card key={book.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                <div className="w-16 h-24 bg-muted rounded flex items-center justify-center">
                  {book.volumeInfo.imageLinks?.thumbnail ? (
                    <img 
                      src={book.volumeInfo.imageLinks.thumbnail} 
                      alt={book.volumeInfo.title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Book Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate text-foreground">
                      {book.volumeInfo.title}
                    </h3>
                    
                    {book.volumeInfo.authors && (
                      <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        {book.volumeInfo.authors.join(', ')}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {book.volumeInfo.publishedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(book.volumeInfo.publishedDate).getFullYear()}
                        </span>
                      )}
                      
                      {book.volumeInfo.pageCount && (
                        <span>{book.volumeInfo.pageCount} pages</span>
                      )}
                      
                      {book.volumeInfo.publisher && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {book.volumeInfo.publisher}
                        </span>
                      )}
                    </div>

                    {book.volumeInfo.averageRating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-status-warning text-status-warning" />
                        <span className="text-sm">
                          {book.volumeInfo.averageRating} 
                          {book.volumeInfo.ratingsCount && (
                            <span className="text-muted-foreground ml-1">
                              ({book.volumeInfo.ratingsCount.toLocaleString()} reviews)
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {book.volumeInfo.categories && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {book.volumeInfo.categories.slice(0, 3).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {book.volumeInfo.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {book.volumeInfo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAddBook(book)}
                      disabled={addedBooks.has(book.id) || isAdding}
                      className="whitespace-nowrap"
                    >
                      {addedBooks.has(book.id) ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Added
                        </>
                      ) : isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Book
                        </>
                      )}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Convert GoogleBook to our Book model
const convertGoogleBookToBook = (googleBook: GoogleBook): Book => {
  const isbn = googleBook.volumeInfo.industryIdentifiers?.find(
    id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier
  
  const book: Book = {
    id: googleBook.id,
    title: googleBook.volumeInfo.title,
    author: googleBook.volumeInfo.authors?.[0] || 'Unknown Author',
    state: 'not_started',
    progress: {
      currentPage: 0,
      totalPages: googleBook.volumeInfo.pageCount || 0,
      percentage: 0
    },
    isOwned: false, // Default to wishlist
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }

  // Only add optional fields if they have values
  if (isbn) book.isbn = isbn
  if (googleBook.volumeInfo.imageLinks?.thumbnail) book.coverImage = googleBook.volumeInfo.imageLinks.thumbnail
  if (googleBook.volumeInfo.publishedDate) book.publishedDate = googleBook.volumeInfo.publishedDate
  if (googleBook.volumeInfo.description) book.description = googleBook.volumeInfo.description

  return book
}

// Convert manual entry to our Book model
const convertManualEntryToBook = (formData: {
  title: string;
  author: string;
  isbn: string;
  pages: string;
  publishedYear: string;
  ownership: string;
  description: string;
}): Book => {
  const book: Book = {
    id: `manual-${Date.now()}`,
    title: formData.title.trim(),
    author: formData.author.trim(),
    state: 'not_started',
    progress: {
      currentPage: 0,
      totalPages: formData.pages ? parseInt(formData.pages) : 0,
      percentage: 0
    },
    isOwned: formData.ownership === 'owned',
    addedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }

  // Only add optional fields if they have values
  if (formData.isbn && formData.isbn.trim()) book.isbn = formData.isbn.trim()
  if (formData.publishedYear && formData.publishedYear.trim()) {
    book.publishedDate = `${formData.publishedYear.trim()}-01-01`
  }
  if (formData.description && formData.description.trim()) {
    book.description = formData.description.trim()
  }

  return book
}

const ManualEntryForm = ({ onAddBook, isAdding }: { onAddBook: (book: Book) => void, isAdding: boolean }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    pages: '',
    publishedYear: '',
    ownership: 'wishlist',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const book = convertManualEntryToBook(formData)
    await onAddBook(book)
    
    // Reset form
    setFormData({
      title: '',
      author: '',
      isbn: '',
      pages: '',
      publishedYear: '',
      ownership: 'wishlist',
      description: ''
    })
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Add Book Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => updateField('author', e.target.value)}
                placeholder="Enter author name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN (optional)</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => updateField('isbn', e.target.value)}
                placeholder="Enter ISBN (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) => updateField('pages', e.target.value)}
                placeholder="Number of pages"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publishedYear">Published Year</Label>
              <Input
                id="publishedYear"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => updateField('publishedYear', e.target.value)}
                placeholder="Year published"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownership">Ownership Status</Label>
              <select
                id="ownership"
                value={formData.ownership || 'wishlist'}
                onChange={(e) => updateField('ownership', e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-2 text-sm w-full"
              >
                <option value="wishlist">Wishlist</option>
                <option value="owned">Owned</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Book description (optional)"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Library
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isAdding}
              onClick={() => setFormData({
                title: '',
                author: '',
                isbn: '',
                pages: '',
                publishedYear: '',
                ownership: 'wishlist',
                description: ''
              })}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export const AddBooksPage = () => {
  const { user } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set())
  const [recentlyAdded, setRecentlyAdded] = useState<Array<{ id: string, title: string, author: string }>>([])
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    setTimeout(() => {
      const filtered = mockGoogleBooks.filter(book => 
        book.volumeInfo.title.toLowerCase().includes(query.toLowerCase()) ||
        book.volumeInfo.authors?.some(author => 
          author.toLowerCase().includes(query.toLowerCase())
        )
      )
      setSearchResults(filtered)
      setIsSearching(false)
    }, 500)
  }

  const handleAddGoogleBook = async (googleBook: GoogleBook) => {
    if (!user) {
      setError('You must be logged in to add books')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const book = convertGoogleBookToBook(googleBook)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...bookData } = book
      
      const bookId = await bookOperations.addBook(user.uid, bookData)
      
      setAddedBooks(prev => new Set([...prev, googleBook.id]))
      setRecentlyAdded(prev => [
        {
          id: bookId,
          title: book.title,
          author: book.author
        },
        ...prev.slice(0, 4)
      ])
    } catch (err) {
      console.error('Error adding book:', err)
      setError('Failed to add book. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddManualBook = async (book: Book) => {
    if (!user) {
      setError('You must be logged in to add books')
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...bookData } = book
      const bookId = await bookOperations.addBook(user.uid, bookData)
      
      setRecentlyAdded(prev => [
        {
          id: bookId,
          title: book.title,
          author: book.author
        },
        ...prev.slice(0, 4)
      ])
    } catch (err) {
      console.error('Error adding book:', err)
      setError('Failed to add book. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Add Books</h1>
          <p className="text-muted-foreground">
            Search for books online or add them manually to your library.
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentlyAdded.map((book) => (
                <Badge key={book.id} variant="secondary" className="px-3 py-1">
                  <Check className="h-3 w-3 mr-1" />
                  {book.title} by {book.author}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Books
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scan ISBN
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Input */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isSearching && (
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              )}
            </CardContent>
          </Card>

          {/* Search Results */}
          <SearchResults 
            books={searchResults}
            onAddBook={handleAddGoogleBook}
            addedBooks={addedBooks}
            isAdding={isAdding}
          />
        </TabsContent>

        <TabsContent value="manual">
          <ManualEntryForm onAddBook={handleAddManualBook} isAdding={isAdding} />
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scan ISBN Barcode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 space-y-4">
                <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium text-foreground">ISBN Scanner Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Use your device&apos;s camera to scan book barcodes and automatically add them to your library.
                  </p>
                </div>
                <Button disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Enable Camera
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AddBooksPage 