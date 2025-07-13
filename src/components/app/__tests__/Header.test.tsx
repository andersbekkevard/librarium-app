import { render, screen } from '@testing-library/react'
import { Header } from '../Header'
import { useAuthContext } from '@/lib/providers/AuthProvider'

jest.mock('@/lib/providers/AuthProvider', () => ({
  useAuthContext: jest.fn(),
}))

jest.mock('../UserProfileDropdown', () => {
  const MockUserProfileDropdown = () => <div data-testid="profile" />
  MockUserProfileDropdown.displayName = 'MockUserProfileDropdown'
  return MockUserProfileDropdown
})

jest.mock('../SearchDropdown', () => {
  const MockSearchDropdown = () => <div data-testid="search" />
  MockSearchDropdown.displayName = 'MockSearchDropdown'
  return MockSearchDropdown
})

const mockUseAuth = useAuthContext as jest.Mock

describe('Header', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ loading: false })
  })

  it('renders default notification count', () => {
    render(<Header />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders custom notification count', () => {
    render(<Header notificationCount={7} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('shows loader when auth is loading', () => {
    mockUseAuth.mockReturnValueOnce({ loading: true })
    const { container } = render(<Header />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByTestId('profile')).not.toBeInTheDocument()
  })

  it('shows profile dropdown when not loading', () => {
    render(<Header />)
    expect(screen.getByTestId('profile')).toBeInTheDocument()
  })

  it('renders search dropdown', () => {
    render(<Header />)
    expect(screen.getByTestId('search')).toBeInTheDocument()
  })
})
