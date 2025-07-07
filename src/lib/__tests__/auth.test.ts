import {
  signInWithGoogle,
  signOut,
  isAuthenticated,
  getCurrentUser,
  type AuthResult,
  type AuthError,
} from '../auth'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(() => ({
    addScope: jest.fn(),
  })),
  signOut: jest.fn(),
}))

jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}))

import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
const mockFirebaseSignOut = firebaseSignOut as jest.MockedFunction<typeof firebaseSignOut>
const mockGoogleAuthProvider = GoogleAuthProvider as jest.MockedFunction<typeof GoogleAuthProvider>

describe('Auth Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {})
    // Reset auth.currentUser
    ;(auth as any).currentUser = null
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('signInWithGoogle', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
    }

    const mockProvider = {
      addScope: jest.fn(),
    }

    beforeEach(() => {
      mockGoogleAuthProvider.mockReturnValue(mockProvider as any)
    })

    it('should sign in successfully', async () => {
      const mockResult = {
        user: mockUser,
        credential: null,
        operationType: 'signIn' as const,
      }

      mockSignInWithPopup.mockResolvedValue(mockResult)

      const result: AuthResult = await signInWithGoogle()

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeUndefined()

      // Verify provider setup
      expect(mockGoogleAuthProvider).toHaveBeenCalled()
      expect(mockProvider.addScope).toHaveBeenCalledWith('email')
      expect(mockProvider.addScope).toHaveBeenCalledWith('profile')

      // Verify sign-in call
      expect(mockSignInWithPopup).toHaveBeenCalledWith(auth, mockProvider)
    })

    it('should handle popup blocked error', async () => {
      const error = {
        code: 'auth/popup-blocked',
        message: 'Popup blocked',
      }

      mockSignInWithPopup.mockRejectedValue(error)

      const result: AuthResult = await signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.user).toBeUndefined()
      expect(result.error).toEqual({
        code: 'auth/popup-blocked',
        message: 'Popup was blocked by your browser. Please allow popups and try again.',
      })
    })

    it('should handle popup closed by user error', async () => {
      const error = {
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed',
      }

      mockSignInWithPopup.mockRejectedValue(error)

      const result: AuthResult = await signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'auth/popup-closed-by-user',
        message: 'Sign-in was cancelled. Please try again.',
      })
    })

    it('should handle network error', async () => {
      const error = {
        code: 'auth/network-request-failed',
        message: 'Network error',
      }

      mockSignInWithPopup.mockRejectedValue(error)

      const result: AuthResult = await signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'auth/network-request-failed',
        message: 'Network error. Please check your connection and try again.',
      })
    })

    it('should handle generic error with message', async () => {
      const error = {
        code: 'auth/some-error',
        message: 'Some custom error message',
      }

      mockSignInWithPopup.mockRejectedValue(error)

      const result: AuthResult = await signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'auth/some-error',
        message: 'Some custom error message',
      })
    })

    it('should handle error without code or message', async () => {
      const error = new Error('Unknown error')

      mockSignInWithPopup.mockRejectedValue(error)

      const result: AuthResult = await signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'unknown',
        message: 'Unknown error',
      })
    })

    it('should handle error without any properties', async () => {
      const error = {}

      mockSignInWithPopup.mockRejectedValue(error)

      const result: AuthResult = await signInWithGoogle()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'unknown',
        message: 'Failed to sign in with Google',
      })
    })

    it('should log error to console', async () => {
      const error = {
        code: 'auth/test-error',
        message: 'Test error',
      }

      mockSignInWithPopup.mockRejectedValue(error)

      await signInWithGoogle()

      expect(console.error).toHaveBeenCalledWith('Google sign-in error:', error)
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockFirebaseSignOut.mockResolvedValue()

      const result: AuthResult = await signOut()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockFirebaseSignOut).toHaveBeenCalledWith(auth)
    })

    it('should handle sign out error with code and message', async () => {
      const error = {
        code: 'auth/network-error',
        message: 'Network error during sign out',
      }

      mockFirebaseSignOut.mockRejectedValue(error)

      const result: AuthResult = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'auth/network-error',
        message: 'Network error during sign out',
      })
    })

    it('should handle sign out error without code', async () => {
      const error = {
        message: 'Some error message',
      }

      mockFirebaseSignOut.mockRejectedValue(error)

      const result: AuthResult = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'unknown',
        message: 'Some error message',
      })
    })

    it('should handle sign out error without message', async () => {
      const error = {
        code: 'auth/some-error',
      }

      mockFirebaseSignOut.mockRejectedValue(error)

      const result: AuthResult = await signOut()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'auth/some-error',
        message: 'Failed to sign out',
      })
    })

    it('should log error to console', async () => {
      const error = {
        code: 'auth/test-error',
        message: 'Test error',
      }

      mockFirebaseSignOut.mockRejectedValue(error)

      await signOut()

      expect(console.error).toHaveBeenCalledWith('Sign-out error:', error)
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      ;(auth as any).currentUser = {
        uid: 'test-uid',
        email: 'test@example.com',
      }

      expect(isAuthenticated()).toBe(true)
    })

    it('should return false when user is not authenticated', () => {
      ;(auth as any).currentUser = null

      expect(isAuthenticated()).toBe(false)
    })

    it('should return false when currentUser is undefined', () => {
      ;(auth as any).currentUser = undefined

      expect(isAuthenticated()).toBe(false)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      ;(auth as any).currentUser = mockUser

      expect(getCurrentUser()).toEqual(mockUser)
    })

    it('should return null when not authenticated', () => {
      ;(auth as any).currentUser = null

      expect(getCurrentUser()).toBe(null)
    })

    it('should return undefined when currentUser is undefined', () => {
      ;(auth as any).currentUser = undefined

      expect(getCurrentUser()).toBeUndefined()
    })
  })

  describe('Type Definitions', () => {
    it('should have correct AuthError interface', () => {
      const authError: AuthError = {
        code: 'auth/test-error',
        message: 'Test error message',
      }

      expect(authError.code).toBe('auth/test-error')
      expect(authError.message).toBe('Test error message')
    })

    it('should have correct AuthResult interface for success', () => {
      const successResult: AuthResult = {
        success: true,
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
        },
      }

      expect(successResult.success).toBe(true)
      expect(successResult.user).toBeDefined()
      expect(successResult.error).toBeUndefined()
    })

    it('should have correct AuthResult interface for error', () => {
      const errorResult: AuthResult = {
        success: false,
        error: {
          code: 'auth/test-error',
          message: 'Test error',
        },
      }

      expect(errorResult.success).toBe(false)
      expect(errorResult.error).toBeDefined()
      expect(errorResult.user).toBeUndefined()
    })

    it('should allow AuthResult with both user and error undefined', () => {
      const minimalResult: AuthResult = {
        success: true,
      }

      expect(minimalResult.success).toBe(true)
      expect(minimalResult.user).toBeUndefined()
      expect(minimalResult.error).toBeUndefined()
    })
  })
})