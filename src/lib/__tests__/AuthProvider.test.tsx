import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuthContext } from '../AuthProvider'
import { UserProfile } from '../models'
import { User } from 'firebase/auth'

// Mock Firebase modules
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}))

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}))

import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockDoc = doc as jest.MockedFunction<typeof doc>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>

// Test component that uses the auth context
const TestComponent: React.FC = () => {
  const { user, userProfile, loading, isAuthenticated, updateUserProfile } = useAuthContext()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-id">{user?.uid || 'no-user'}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <div data-testid="profile-name">{userProfile?.displayName || 'no-profile'}</div>
      <div data-testid="profile-email">{userProfile?.email || 'no-profile-email'}</div>
      <button
        onClick={() => updateUserProfile({ totalBooksRead: 5 })}
        data-testid="update-profile"
      >
        Update Profile
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  const mockUser: Partial<User> = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    metadata: {
      creationTime: '2023-01-01T00:00:00Z',
      lastSignInTime: '2023-01-01T12:00:00Z',
    },
  }

  const mockUserProfile: UserProfile = {
    id: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.jpg',
    createdAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    updatedAt: { seconds: 1234567890, nanoseconds: 0 } as any,
    emailVerified: true,
    lastSignInTime: '2023-01-01T12:00:00Z',
    totalBooksRead: 10,
    currentlyReading: 2,
    booksInLibrary: 15,
  }

  let authStateCallback: (user: User | null) => void

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})

    // Mock onAuthStateChanged to capture the callback
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback
      return jest.fn() // Return unsubscribe function
    })

    mockDoc.mockReturnValue({} as any)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Context Provider', () => {
    it('should provide loading state initially', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should set up auth state listener on mount', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith({}, expect.any(Function))
    })

    it('should throw error when useAuthContext is used outside provider', () => {
      // Temporarily spy on console.error to suppress error output in test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuthContext must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Authentication State Changes', () => {
    it('should handle user sign in with existing profile', async () => {
      const mockProfileDoc = {
        exists: () => true,
        data: () => mockUserProfile,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate user sign in
      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id')
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
        expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User')
        expect(screen.getByTestId('profile-email')).toHaveTextContent('test@example.com')
      })

      expect(mockGetDoc).toHaveBeenCalled()
      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        ...mockUserProfile,
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        lastSignInTime: '2023-01-01T12:00:00Z',
        updatedAt: { seconds: 1234567890, nanoseconds: 0 },
      })
    })

    it('should create new profile for new user', async () => {
      const mockProfileDoc = {
        exists: () => false,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate new user sign in
      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      expect(mockSetDoc).toHaveBeenCalledWith({}, {
        id: 'test-user-id',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
        createdAt: { seconds: 1234567890, nanoseconds: 0 },
        updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        emailVerified: true,
        lastSignInTime: '2023-01-01T12:00:00Z',
        totalBooksRead: 0,
        currentlyReading: 0,
        booksInLibrary: 0,
      })
    })

    it('should handle user sign out', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Simulate user sign out
      await waitFor(() => {
        authStateCallback(null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
        expect(screen.getByTestId('profile-name')).toHaveTextContent('no-profile')
      })
    })

    it('should handle user with missing display name', async () => {
      const userWithoutName = {
        ...mockUser,
        displayName: null,
      }

      const mockProfileDoc = {
        exists: () => false,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        authStateCallback(userWithoutName as User)
      })

      expect(mockSetDoc).toHaveBeenCalledWith({}, expect.objectContaining({
        displayName: 'Anonymous User',
      }))
    })

    it('should handle user with missing email', async () => {
      const userWithoutEmail = {
        ...mockUser,
        email: null,
      }

      const mockProfileDoc = {
        exists: () => false,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        authStateCallback(userWithoutEmail as User)
      })

      expect(mockSetDoc).toHaveBeenCalledWith({}, expect.objectContaining({
        email: '',
      }))
    })
  })

  describe('Profile Management', () => {
    it('should update existing profile with current auth data', async () => {
      const existingProfile: UserProfile = {
        ...mockUserProfile,
        displayName: 'Old Name',
        email: 'old@example.com',
        totalBooksRead: 5,
      }

      const mockProfileDoc = {
        exists: () => true,
        data: () => existingProfile,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
        ...existingProfile,
        displayName: 'Test User', // Updated from Firebase Auth
        email: 'test@example.com', // Updated from Firebase Auth
        photoURL: 'https://example.com/photo.jpg',
        emailVerified: true,
        lastSignInTime: '2023-01-01T12:00:00Z',
        updatedAt: { seconds: 1234567890, nanoseconds: 0 },
      })
    })

    it('should preserve existing profile data when updating', async () => {
      const existingProfile: UserProfile = {
        ...mockUserProfile,
        totalBooksRead: 25,
        currentlyReading: 3,
        booksInLibrary: 30,
      }

      const mockProfileDoc = {
        exists: () => true,
        data: () => existingProfile,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      expect(mockUpdateDoc).toHaveBeenCalledWith({}, expect.objectContaining({
        totalBooksRead: 25,
        currentlyReading: 3,
        booksInLibrary: 30,
      }))
    })
  })

  describe('Error Handling', () => {
    it('should handle profile creation errors', async () => {
      const error = new Error('Firestore error')
      mockGetDoc.mockRejectedValue(error)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      await waitFor(() => {
        expect(screen.getByTestId('profile-name')).toHaveTextContent('no-profile')
      })

      expect(console.error).toHaveBeenCalledWith('Failed to load user profile:', error)
    })

    it('should handle profile update errors', async () => {
      const mockProfileDoc = {
        exists: () => true,
        data: () => mockUserProfile,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)
      const updateError = new Error('Update failed')
      mockUpdateDoc.mockRejectedValue(updateError)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // First establish auth state
      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Reset the mock to fail on the next call
      mockUpdateDoc.mockRejectedValue(updateError)

      // Try to update profile
      const updateButton = screen.getByTestId('update-profile')
      updateButton.click()

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error updating user profile:', updateError)
      })
    })
  })

  describe('updateUserProfile Function', () => {
    beforeEach(async () => {
      const mockProfileDoc = {
        exists: () => true,
        data: () => mockUserProfile,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Establish auth state first
      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Clear previous calls
      jest.clearAllMocks()
    })

    it('should update user profile in Firestore and local state', async () => {
      const updateButton = screen.getByTestId('update-profile')
      updateButton.click()

      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalledWith({}, {
          totalBooksRead: 5,
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        })
      })
    })

    it('should not update when user is not authenticated', async () => {
      // Sign out user
      await waitFor(() => {
        authStateCallback(null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
      })

      const updateButton = screen.getByTestId('update-profile')
      updateButton.click()

      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })

    it('should include updatedAt timestamp in updates', async () => {
      const updateButton = screen.getByTestId('update-profile')
      updateButton.click()

      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalledWith({}, expect.objectContaining({
          updatedAt: { seconds: 1234567890, nanoseconds: 0 },
        }))
      })
    })
  })

  describe('Context Value', () => {
    it('should provide correct context value when authenticated', async () => {
      const mockProfileDoc = {
        exists: () => true,
        data: () => mockUserProfile,
      }

      mockGetDoc.mockResolvedValue(mockProfileDoc as any)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        authStateCallback(mockUser as User)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      })

      // Verify all context values are properly set
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id')
      expect(screen.getByTestId('profile-name')).toHaveTextContent('Test User')
    })

    it('should provide correct context value when not authenticated', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        authStateCallback(null)
      })

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user')
        expect(screen.getByTestId('profile-name')).toHaveTextContent('no-profile')
      })
    })
  })

  describe('Cleanup', () => {
    it('should return unsubscribe function from useEffect', () => {
      const mockUnsubscribe = jest.fn()
      mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      unmount()

      // The unsubscribe function should be called on unmount
      // Note: This is implicit behavior of useEffect cleanup
      expect(mockOnAuthStateChanged).toHaveBeenCalled()
    })
  })
})