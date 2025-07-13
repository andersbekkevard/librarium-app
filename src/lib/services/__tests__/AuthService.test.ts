import {
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../api/firebase";
import { ErrorCategory } from "../../errors/error-handling";
import { AuthService } from "../AuthService";

// Mock Firebase Auth functions
jest.mock("firebase/auth", () => {
  const mockAddScope = jest.fn();
  const MockGoogleAuthProvider = jest.fn(() => ({
    addScope: mockAddScope,
  }));
  return {
    GoogleAuthProvider: MockGoogleAuthProvider,
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  };
});

// Mock Firebase app
jest.mock("../../api/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

describe("AuthService", () => {
  let authService: AuthService;
  const mockUser = {
    uid: "test-uid",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: "https://example.com/photo.jpg",
    emailVerified: true,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    (auth as any).currentUser = null; // Reset current user before each test
  });

  describe("signInWithGoogle", () => {
    it("should sign in successfully and return user data", async () => {
      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });

      const result = await authService.signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
      expect(signInWithPopup).toHaveBeenCalledWith(auth, expect.anything());
    });

    it("should handle popup blocked error", async () => {
      const error = { code: "auth/popup-blocked", message: "Popup blocked" };
      (signInWithPopup as jest.Mock).mockRejectedValue(error);

      const result = await authService.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(result.error?.userMessage).toContain("Popup was blocked");
    });

    it("should handle popup closed by user error", async () => {
      const error = {
        code: "auth/popup-closed-by-user",
        message: "Popup closed",
      };
      (signInWithPopup as jest.Mock).mockRejectedValue(error);

      const result = await authService.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(result.error?.userMessage).toContain("Sign-in was cancelled");
    });

    it("should handle network error", async () => {
      const error = {
        code: "auth/network-request-failed",
        message: "Network failed",
      };
      (signInWithPopup as jest.Mock).mockRejectedValue(error);

      const result = await authService.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe(ErrorCategory.NETWORK);
      expect(result.error?.userMessage).toContain("Network error");
    });

    it("should handle generic error", async () => {
      const error = {
        code: "auth/something-else",
        message: "Something else happened",
      };
      (signInWithPopup as jest.Mock).mockRejectedValue(error);

      const result = await authService.signInWithGoogle();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(result.error?.userMessage).toContain("Authentication failed");
    });
  });

  describe("signOut", () => {
    it("should sign out successfully", async () => {
      (firebaseSignOut as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.signOut();

      expect(result.success).toBe(true);
      expect(firebaseSignOut).toHaveBeenCalledWith(auth);
    });

    it("should handle sign out error", async () => {
      const error = {
        code: "auth/sign-out-failed",
        message: "Sign out failed",
      };
      (firebaseSignOut as jest.Mock).mockRejectedValue(error);

      const result = await authService.signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(result.error?.userMessage).toContain("Authentication failed");
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user when authenticated", () => {
      (auth as any).currentUser = mockUser;
      expect(authService.getCurrentUser()).toEqual(mockUser);
    });

    it("should return null when not authenticated", () => {
      (auth as any).currentUser = null;
      expect(authService.getCurrentUser()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when user is authenticated", () => {
      (auth as any).currentUser = mockUser;
      expect(authService.isAuthenticated()).toBe(true);
    });

    it("should return false when user is not authenticated", () => {
      (auth as any).currentUser = null;
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe("onAuthStateChanged", () => {
    it("should subscribe to auth state changes", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      (onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = authService.onAuthStateChanged(mockCallback);

      expect(onAuthStateChanged).toHaveBeenCalledWith(auth, mockCallback);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe("getUserDisplayName", () => {
    it("should return display name if available", () => {
      (auth as any).currentUser = mockUser;
      expect(authService.getUserDisplayName()).toBe("Test User");
    });

    it('should return "Anonymous User" if display name is null', () => {
      (auth as any).currentUser = { ...mockUser, displayName: null };
      expect(authService.getUserDisplayName()).toBe("Anonymous User");
    });

    it('should return "Anonymous User" if no user', () => {
      (auth as any).currentUser = null;
      expect(authService.getUserDisplayName()).toBe("Anonymous User");
    });
  });

  describe("getUserEmail", () => {
    it("should return email if available", () => {
      (auth as any).currentUser = mockUser;
      expect(authService.getUserEmail()).toBe("test@example.com");
    });

    it("should return empty string if email is null", () => {
      (auth as any).currentUser = { ...mockUser, email: null };
      expect(authService.getUserEmail()).toBe("");
    });

    it("should return empty string if no user", () => {
      (auth as any).currentUser = null;
      expect(authService.getUserEmail()).toBe("");
    });
  });

  describe("getUserPhotoURL", () => {
    it("should return photo URL if available", () => {
      (auth as any).currentUser = mockUser;
      expect(authService.getUserPhotoURL()).toBe(
        "https://example.com/photo.jpg"
      );
    });

    it("should return null if photo URL is null", () => {
      (auth as any).currentUser = { ...mockUser, photoURL: null };
      expect(authService.getUserPhotoURL()).toBeNull();
    });

    it("should return null if no user", () => {
      (auth as any).currentUser = null;
      expect(authService.getUserPhotoURL()).toBeNull();
    });
  });

  describe("getUserId", () => {
    it("should return user ID if available", () => {
      (auth as any).currentUser = mockUser;
      expect(authService.getUserId()).toBe("test-uid");
    });

    it("should return null if no user", () => {
      (auth as any).currentUser = null;
      expect(authService.getUserId()).toBeNull();
    });
  });

  describe("isEmailVerified", () => {
    it("should return true if email is verified", () => {
      (auth as any).currentUser = mockUser;
      expect(authService.isEmailVerified()).toBe(true);
    });

    it("should return false if email is not verified", () => {
      (auth as any).currentUser = { ...mockUser, emailVerified: false };
      expect(authService.isEmailVerified()).toBe(false);
    });

    it("should return false if no user", () => {
      (auth as any).currentUser = null;
      expect(authService.isEmailVerified()).toBe(false);
    });
  });
});
