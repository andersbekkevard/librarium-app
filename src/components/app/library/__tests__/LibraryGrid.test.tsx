import { fireEvent, render, screen } from '@testing-library/react'
import { Timestamp } from 'firebase/firestore'
import LibraryGrid from '../LibraryGrid'
import '@testing-library/jest-dom'

const createBook = (overrides: Partial<any> = {}) => ({
  id: 'book-id',
  title: 'Book',
  author: 'Author',
  state: 'not_started',
  isOwned: true,
  progress: { currentPage: 0, totalPages: 100 },
  addedAt: { seconds: 0, nanoseconds: 0 } as Timestamp,
  updatedAt: { seconds: 0, nanoseconds: 0 } as Timestamp,
  ...overrides,
})

jest.mock('../../books/BookCard', () => ({
  __esModule: true,
  default: ({ book }: any) => <div data-testid='book-card'>{book.title}</div>,
}))

jest.mock('../BookListItem', () => ({
  __esModule: true,
  BookListItem: ({ book }: any) => (
    <div data-testid='book-list-item'>{book.title}</div>
  ),
}))

describe('LibraryGrid', () => {
  it('shows loading state', () => {
    render(<LibraryGrid books={[]} viewMode='grid' loading />)
    expect(screen.getByText('Loading your library...')).toBeInTheDocument()
  })

  it('shows error state and refresh action', () => {
    const onRefresh = jest.fn()
    render(<LibraryGrid books={[]} viewMode='grid' error='Oops' onRefresh={onRefresh} />)
    expect(screen.getByText('Error loading books')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Try again'))
    expect(onRefresh).toHaveBeenCalled()
  })

  it('shows empty state with clear filters button', () => {
    const onClear = jest.fn()
    render(<LibraryGrid books={[]} viewMode='grid' activeFiltersCount={1} onClearFilters={onClear} />)
    fireEvent.click(screen.getByText('Clear all filters'))
    expect(onClear).toHaveBeenCalled()
  })

  it('renders books in grid mode', () => {
    const books = [createBook({ id: '1', title: 'A' }), createBook({ id: '2', title: 'B' })]
    render(<LibraryGrid books={books} viewMode='grid' />)
    expect(screen.getAllByTestId('book-card')).toHaveLength(2)
  })

  it('renders books in list mode', () => {
    const books = [createBook({ id: '1', title: 'A' }), createBook({ id: '2', title: 'B' })]
    render(<LibraryGrid books={books} viewMode='list' />)
    expect(screen.getAllByTestId('book-list-item')).toHaveLength(2)
  })
})
