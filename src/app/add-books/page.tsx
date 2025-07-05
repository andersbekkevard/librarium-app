"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  FileText, 
  Check, 
  Plus, 
  ExternalLink,
  User,
  Calendar,
  BookOpen,
  Building,
  Star,
  X,
  ArrowLeft
} from "lucide-react"

// Types
interface SearchBook {
  id: string
  title: string
  authors: string[]
  description?: string
  publishedDate?: string
  pageCount?: number
  publisher?: string
  averageRating?: number
  ratingsCount?: number
  categories?: string[]
  imageLinks?: {
    thumbnail?: string
  }
  industryIdentifiers?: {
    type: string
    identifier: string
  }[]
}

interface RecentlyAddedBook {
  id: string
  title: string
  author: string
}

// Mock data for recently added books
const recentlyAddedBooks: RecentlyAddedBook[] = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee" },
  { id: "3", title: "1984", author: "George Orwell" },
]

// Mock search results
const mockSearchResults: SearchBook[] = [
  {
    id: "1",
    title: "The Catcher in the Rye",
    authors: ["J.D. Salinger"],
    description: "A controversial novel originally published for adults, it has since become popular with adolescent readers for its themes of teenage angst and alienation.",
    publishedDate: "1951",
    pageCount: 234,
    publisher: "Little, Brown and Company",
    averageRating: 3.8,
    ratingsCount: 2847,
    categories: ["Fiction", "Classic Literature"],
    imageLinks: {
      thumbnail: "https://via.placeholder.com/128x192?text=Book+Cover"
    }
  },
  {
    id: "2",
    title: "Pride and Prejudice",
    authors: ["Jane Austen"],
    description: "A romantic novel of manners written by Jane Austen in 1813. The novel follows the character development of Elizabeth Bennet.",
    publishedDate: "1813",
    pageCount: 432,
    publisher: "T. Egerton",
    averageRating: 4.2,
    ratingsCount: 5234,
    categories: ["Romance", "Classic Literature", "Fiction"],
    imageLinks: {
      thumbnail: "https://via.placeholder.com/128x192?text=Book+Cover"
    }
  }
]

// Search Book Card Component
const SearchBookCard: React.FC<{ book: SearchBook; onAddBook: (book: SearchBook) => void }> = ({ 
  book, 
  onAddBook 
}) => {
  const [isAdded, setIsAdded] = React.useState(false)
  
  const handleAddBook = () => {
    onAddBook(book)
    setIsAdded(true)
  }

  const formatAuthors = (authors: string[]) => {
    return authors.join(", ")
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'fill-status-warning text-status-warning' 
            : 'fill-muted text-muted'
        }`}
      />
    ))
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-24 rounded-md overflow-hidden bg-muted">
              {book.imageLinks?.thumbnail ? (
                <img
                  src={book.imageLinks.thumbnail}
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {book.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">{formatAuthors(book.authors)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-1 ml-4">
                <Button
                  size="sm"
                  onClick={handleAddBook}
                  disabled={isAdded}
                  className="whitespace-nowrap"
                >
                  {isAdded ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Book
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
            </div>

            {/* Metadata Row */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
              {book.publishedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{book.publishedDate}</span>
                </div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{book.pageCount} pages</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span className="truncate">{book.publisher}</span>
                </div>
              )}
            </div>

            {/* Rating Row */}
            {book.averageRating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  {renderStars(book.averageRating)}
                  <span className="text-xs text-muted-foreground ml-1">
                    {book.averageRating} ({book.ratingsCount} reviews)
                  </span>
                </div>
              </div>
            )}

            {/* Categories */}
            {book.categories && book.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {book.categories.slice(0, 3).map((category) => (
                  <Badge key={category} variant="outline" className="text-xs">
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            {book.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {book.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AddBooksPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<SearchBook[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "",
    author: "",
    isbn: "",
    pages: "",
    year: "",
    genre: "",
    publisher: "",
    description: ""
  })

  const handleSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockSearchResults)
      setIsSearching(false)
    }, 1000)
  }, [])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleAddBook = (book: SearchBook) => {
    console.log("Adding book:", book)
    // Here you would typically add the book to your library
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Manual entry:", formData)
    // Here you would typically add the book to your library
  }

  const handleFormReset = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      pages: "",
      year: "",
      genre: "",
      publisher: "",
      description: ""
    })
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Add Books</h1>
          <p className="text-muted-foreground">
            Search for books online or add them manually to your library
          </p>
        </div>
        <div>
          {/* Reserved for future actions */}
        </div>
      </div>

      {/* Recently Added */}
      {recentlyAddedBooks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Recently Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentlyAddedBooks.map((book) => (
                <Badge key={book.id} variant="secondary" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {book.title} - {book.author}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Books
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        {/* Search Books Tab */}
        <TabsContent value="search" className="space-y-4">
          {/* Search Input */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for books by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="space-y-4">
            {isSearching && (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Searching for books...</p>
                </CardContent>
              </Card>
            )}

            {searchResults.map((book) => (
              <SearchBookCard
                key={book.id}
                book={book}
                onAddBook={handleAddBook}
              />
            ))}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No books found for "{searchQuery}"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Add Book Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pages">Pages</Label>
                    <Input
                      id="pages"
                      name="pages"
                      type="number"
                      value={formData.pages}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add to Library
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFormReset}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 