import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { Book, UserProfile } from "../../models/models";
import { IUserRepository } from "../../repositories/types";
import { UserService } from "../UserService";

// Mock Firebase
jest.mock("../../api/firebase", () => ({
  db: {},
  auth: {},
  storage: {},
}));

// Mock Firebase Timestamp
const mockTimestamp = {
  seconds: 1234567890,
  nanoseconds: 0,
  toDate: () => new Date(1234567890000),
} as Timestamp;

jest.mock("firebase/firestore", () => ({
  __esModule: true,
  ...jest.requireActual("firebase/firestore"),
  Timestamp: {
    now: jest.fn(() => mockTimestamp),
  },
}));

// Mock repositories
const mockUserRepository: jest.Mocked<IUserRepository> = {
  getProfile: jest.fn(),
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  getUserBooks: jest.fn(),
};

const mockBookRepository = {
  getUserBooks: jest.fn(),
  getBooksByState: jest.fn(),
};

describe("UserService", () => {
  let userService: UserService;
  const testUserId = "test-user-id";

  const mockUserProfile: UserProfile = {
    id: testUserId,
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    emailVerified: true,
    lastSignInTime: "2023-01-01T00:00:00Z",
    totalBooksRead: 42,
    currentlyReading: 5,
    booksInLibrary: 50,
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
  };

  const mockFirebaseUser: Partial<User> = {
    uid: testUserId,
    email: "test@example.com",
    displayName: "Test User",
    photoURL: "https://example.com/photo.jpg",
    emailVerified: true,
    metadata: {
      lastSignInTime: "2023-01-01T00:00:00Z",
      creationTime: "2023-01-01T00:00:00Z",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockUserRepository, mockBookRepository);
  });

  describe("getProfile", () => {
    it("should retrieve user profile successfully", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const result = await userService.getProfile(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserProfile);
    });

    it("should handle profile not found", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await userService.getProfile(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle repository errors", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await userService.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("createProfileFromFirebaseUser", () => {
    it("should create user profile from Firebase user", async () => {
      const expectedProfile = {
        ...mockUserProfile,
        totalBooksRead: 0,
        currentlyReading: 0,
        booksInLibrary: 0,
      };

      mockUserRepository.createProfile.mockResolvedValue({
        success: true,
        data: expectedProfile,
      });

      const result = await userService.createProfileFromFirebaseUser(
        mockFirebaseUser as User
      );

      expect(result.success).toBe(true);
      expect(mockUserRepository.createProfile).toHaveBeenCalledWith(
        testUserId,
        {
          displayName: "Test User",
          email: "test@example.com",
          photoURL: "https://example.com/photo.jpg",
          emailVerified: true,
          lastSignInTime: "2023-01-01T00:00:00Z",
          totalBooksRead: 0,
          currentlyReading: 0,
          booksInLibrary: 0,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
        }
      );
    });

    it("should handle repository errors", async () => {
      mockUserRepository.createProfile.mockResolvedValue({
        success: false,
        error: "Creation failed",
      });

      const result = await userService.createProfileFromFirebaseUser(
        mockFirebaseUser as User
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Failed to create user profile");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const updates = { displayName: "Updated Name" };
      const updatedProfile = { ...mockUserProfile, ...updates };

      mockUserRepository.updateProfile.mockResolvedValue({
        success: true,
        data: updatedProfile,
      });

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(true);
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(
        testUserId,
        updates
      );
    });

    it("should validate updates before applying", async () => {
      const invalidUpdates = { displayName: "", totalBooksRead: -1 };

      const result = await userService.updateProfile(
        testUserId,
        invalidUpdates
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Display name cannot be empty");
    });
  });

  describe("updateUserStats", () => {
    it("should calculate and update user statistics", async () => {
      const mockBooks: Book[] = [
        { id: "book-1", state: "finished", isOwned: true } as Book,
        { id: "book-2", state: "in_progress", isOwned: true } as Book,
        { id: "book-3", state: "not_started", isOwned: true } as Book,
        { id: "book-4", state: "finished", isOwned: false } as Book,
      ];

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
      });

      const result = await userService.updateUserStats(testUserId);

      expect(result.success).toBe(true);
    });

    it("should handle zero books", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await userService.updateUserStats(testUserId);

      expect(result.success).toBe(true);
    });
  });
});
