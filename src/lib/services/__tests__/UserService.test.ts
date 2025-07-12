import { Timestamp } from "firebase/firestore";
import { UserService } from "../UserService";
import { UserProfile, Book } from "../../models";
import { IUserRepository, IBookRepository } from "../../repositories/types";
import { ServiceError, ServiceErrorType, UserStats } from "../types";

// Mock Firebase
jest.mock("../../firebase", () => ({
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
  Timestamp: {
    now: jest.fn(() => mockTimestamp),
  },
}));

// Mock repositories
const mockUserRepository: jest.Mocked<IUserRepository> = {
  getProfile: jest.fn(),
  createProfile: jest.fn(),
  updateProfile: jest.fn(),
  deleteProfile: jest.fn(),
  subscribeToProfile: jest.fn(),
};

const mockBookRepository: jest.Mocked<IBookRepository> = {
  getBook: jest.fn(),
  getUserBooks: jest.fn(),
  getBooksByState: jest.fn(),
  addBook: jest.fn(),
  updateBook: jest.fn(),
  deleteBook: jest.fn(),
  subscribeToUserBooks: jest.fn(),
  batchUpdateBooks: jest.fn(),
  importBooks: jest.fn(),
};

// Mock Firebase User
const mockFirebaseUser = {
  uid: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: "https://example.com/photo.jpg",
  emailVerified: true,
  metadata: {
    lastSignInTime: "2023-01-01T00:00:00Z",
  },
} as any;

describe("UserService", () => {
  let userService: UserService;
  const testUserId = "test-user-id";

  const mockUserProfile: UserProfile = {
    id: testUserId,
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    createdAt: mockTimestamp,
    updatedAt: mockTimestamp,
    emailVerified: true,
    lastSignInTime: "2023-01-01T00:00:00Z",
    totalBooksRead: 5,
    currentlyReading: 2,
    booksInLibrary: 10,
  };

  const mockBooks: Book[] = [
    {
      id: "book-1",
      title: "Finished Book 1",
      author: "Author 1",
      state: "finished",
      progress: { currentPage: 300, totalPages: 300 },
      isOwned: true,
      addedAt: mockTimestamp,
      updatedAt: mockTimestamp,
      finishedAt: mockTimestamp,
      rating: 4,
      genre: "Fiction",
    },
    {
      id: "book-2",
      title: "Finished Book 2",
      author: "Author 2",
      state: "finished",
      progress: { currentPage: 250, totalPages: 250 },
      isOwned: false,
      addedAt: mockTimestamp,
      updatedAt: mockTimestamp,
      finishedAt: mockTimestamp,
      rating: 5,
      genre: "Mystery",
    },
    {
      id: "book-3",
      title: "In Progress Book",
      author: "Author 3",
      state: "in_progress",
      progress: { currentPage: 150, totalPages: 400 },
      isOwned: true,
      addedAt: mockTimestamp,
      updatedAt: mockTimestamp,
      startedAt: mockTimestamp,
      genre: "Fiction",
    },
    {
      id: "book-4",
      title: "Not Started Book",
      author: "Author 4",
      state: "not_started",
      progress: { currentPage: 0, totalPages: 200 },
      isOwned: true,
      addedAt: mockTimestamp,
      updatedAt: mockTimestamp,
      genre: "Non-Fiction",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockUserRepository, mockBookRepository);
  });

  describe("getProfile", () => {
    it("should return user profile when found", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const result = await userService.getProfile(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserProfile);
      expect(mockUserRepository.getProfile).toHaveBeenCalledWith(testUserId);
    });

    it("should return null when profile not found", async () => {
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
        error: "Access denied",
      });

      const result = await userService.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You don't have permission to access this user profile");
    });

    it("should handle unexpected errors", async () => {
      mockUserRepository.getProfile.mockRejectedValue(new Error("Unexpected error"));

      const result = await userService.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to get user profile");
    });
  });

  describe("createProfileFromFirebaseUser", () => {
    it("should create new profile when none exists", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: null,
      });
      mockUserRepository.createProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const result = await userService.createProfileFromFirebaseUser(mockFirebaseUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserProfile);
      expect(mockUserRepository.createProfile).toHaveBeenCalledWith(
        mockFirebaseUser.uid,
        expect.objectContaining({
          displayName: mockFirebaseUser.displayName,
          email: mockFirebaseUser.email,
          photoURL: mockFirebaseUser.photoURL,
          emailVerified: mockFirebaseUser.emailVerified,
          totalBooksRead: 0,
          currentlyReading: 0,
          booksInLibrary: 0,
        })
      );
    });

    it("should update existing profile with latest auth data", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });
      mockUserRepository.updateProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const result = await userService.createProfileFromFirebaseUser(mockFirebaseUser);

      expect(result.success).toBe(true);
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(
        mockFirebaseUser.uid,
        expect.objectContaining({
          displayName: mockFirebaseUser.displayName,
          email: mockFirebaseUser.email,
          photoURL: mockFirebaseUser.photoURL,
          emailVerified: mockFirebaseUser.emailVerified,
          lastSignInTime: mockFirebaseUser.metadata.lastSignInTime,
        })
      );
    });

    it("should handle missing Firebase user properties", async () => {
      const incompleteUser = {
        uid: "test-user-id",
        displayName: null,
        email: null,
        photoURL: null,
        emailVerified: false,
        metadata: { lastSignInTime: null },
      } as any;

      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: null,
      });
      mockUserRepository.createProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const result = await userService.createProfileFromFirebaseUser(incompleteUser);

      expect(result.success).toBe(true);
      expect(mockUserRepository.createProfile).toHaveBeenCalledWith(
        incompleteUser.uid,
        expect.objectContaining({
          displayName: "Anonymous User",
          email: "",
          photoURL: undefined,
          emailVerified: false,
          lastSignInTime: "",
        })
      );
    });

    it("should handle validation errors", async () => {
      const invalidUser = {
        uid: "test-user-id",
        displayName: "",
        email: "test@example.com",
        emailVerified: true,
        metadata: { lastSignInTime: "2023-01-01T00:00:00Z" },
      } as any;

      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await userService.createProfileFromFirebaseUser(invalidUser);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Display name cannot be empty");
      expect(mockUserRepository.createProfile).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: null,
      });
      mockUserRepository.createProfile.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await userService.createProfileFromFirebaseUser(mockFirebaseUser);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Database error");
    });

    it("should handle unexpected errors", async () => {
      mockUserRepository.getProfile.mockRejectedValue(new Error("Unexpected error"));

      const result = await userService.createProfileFromFirebaseUser(mockFirebaseUser);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create user profile");
    });
  });

  describe("updateProfile", () => {
    const updates = { displayName: "Updated Name" };

    it("should update profile successfully", async () => {
      mockUserRepository.updateProfile.mockResolvedValue({
        success: true,
        data: { ...mockUserProfile, ...updates },
      });

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ ...mockUserProfile, ...updates });
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(testUserId, updates);
    });

    it("should validate updates", async () => {
      const invalidUpdates = { displayName: "" };

      const result = await userService.updateProfile(testUserId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Display name cannot be empty");
      expect(mockUserRepository.updateProfile).not.toHaveBeenCalled();
    });

    it("should validate negative numbers", async () => {
      const invalidUpdates = { totalBooksRead: -1 };

      const result = await userService.updateProfile(testUserId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Total books read cannot be negative");
    });

    it("should handle repository errors", async () => {
      mockUserRepository.updateProfile.mockResolvedValue({
        success: false,
        error: "not found",
      });

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User profile not found");
    });

    it("should handle unexpected errors", async () => {
      mockUserRepository.updateProfile.mockRejectedValue(new Error("Unexpected error"));

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update user profile");
    });
  });

  describe("deleteProfile", () => {
    it("should delete profile successfully", async () => {
      mockUserRepository.deleteProfile.mockResolvedValue({
        success: true,
      });

      const result = await userService.deleteProfile(testUserId);

      expect(result.success).toBe(true);
      expect(mockUserRepository.deleteProfile).toHaveBeenCalledWith(testUserId);
    });

    it("should handle repository errors", async () => {
      mockUserRepository.deleteProfile.mockResolvedValue({
        success: false,
        error: "Access denied",
      });

      const result = await userService.deleteProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You don't have permission to access this user profile");
    });

    it("should handle unexpected errors", async () => {
      mockUserRepository.deleteProfile.mockRejectedValue(new Error("Unexpected error"));

      const result = await userService.deleteProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete user profile");
    });
  });

  describe("updateUserStats", () => {
    it("should update user stats successfully", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
      });
      mockUserRepository.updateProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const result = await userService.updateUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(testUserId, {
        totalBooksRead: 2, // 2 finished books
        currentlyReading: 1, // 1 in progress book
        booksInLibrary: 4, // total books
      });
    });

    it("should handle empty book collection", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: [],
      });
      mockUserRepository.updateProfile.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const result = await userService.updateUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(testUserId, {
        totalBooksRead: 0,
        currentlyReading: 0,
        booksInLibrary: 0,
      });
    });

    it("should handle book repository errors", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: false,
        error: "Network error",
      });

      const result = await userService.updateUserStats(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to get user books for statistics");
    });

    it("should handle user repository errors", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
      });
      mockUserRepository.updateProfile.mockResolvedValue({
        success: false,
        error: "Access denied",
      });

      const result = await userService.updateUserStats(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You don't have permission to access this user profile");
    });

    it("should handle unexpected errors", async () => {
      mockBookRepository.getUserBooks.mockRejectedValue(new Error("Unexpected error"));

      const result = await userService.updateUserStats(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update user statistics");
    });
  });

  describe("getUserStats", () => {
    it("should calculate comprehensive user stats", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: mockBooks,
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalBooksRead: 2,
        currentlyReading: 1,
        booksInLibrary: 4,
        totalPagesRead: 550, // 300 + 250 from finished books
        averageRating: 4.5, // (4 + 5) / 2
        readingStreak: 0, // simplified implementation
        booksReadThisMonth: 0,
        booksReadThisYear: 0,
        favoriteGenres: ["Fiction", "Mystery", "Non-Fiction"],
      });
    });

    it("should handle books without ratings", async () => {
      const booksWithoutRatings = mockBooks.map(book => ({
        ...book,
        rating: undefined,
      }));

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: booksWithoutRatings,
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data?.averageRating).toBe(0);
    });

    it("should handle books without genres", async () => {
      const booksWithoutGenres = mockBooks.map(book => ({
        ...book,
        genre: undefined,
      }));

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: booksWithoutGenres,
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data?.favoriteGenres).toEqual([]);
    });

    it("should handle empty book collection", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalBooksRead: 0,
        currentlyReading: 0,
        booksInLibrary: 0,
        totalPagesRead: 0,
        averageRating: 0,
        readingStreak: 0,
        booksReadThisMonth: 0,
        booksReadThisYear: 0,
        favoriteGenres: [],
      });
    });

    it("should handle repository errors", async () => {
      mockBookRepository.getUserBooks.mockResolvedValue({
        success: false,
        error: "Network error",
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to get user books for statistics");
    });

    it("should handle unexpected errors", async () => {
      mockBookRepository.getUserBooks.mockRejectedValue(new Error("Unexpected error"));

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to calculate user statistics");
    });
  });

  describe("subscribeToProfile", () => {
    it("should subscribe to profile changes", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      mockUserRepository.subscribeToProfile.mockReturnValue(mockUnsubscribe);

      const unsubscribe = userService.subscribeToProfile(testUserId, mockCallback);

      expect(mockUserRepository.subscribeToProfile).toHaveBeenCalledWith(
        testUserId,
        mockCallback
      );
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe("validation", () => {
    it("should validate display name", async () => {
      const updates = { displayName: "   " };

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Display name cannot be empty");
    });

    it("should validate email", async () => {
      const updates = { email: "   " };

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email cannot be empty");
    });

    it("should validate currentlyReading count", async () => {
      const updates = { currentlyReading: -1 };

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Currently reading count cannot be negative");
    });

    it("should validate booksInLibrary count", async () => {
      const updates = { booksInLibrary: -1 };

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Books in library count cannot be negative");
    });

    it("should allow valid updates", async () => {
      const updates = {
        displayName: "Valid Name",
        email: "valid@example.com",
        totalBooksRead: 5,
        currentlyReading: 2,
        booksInLibrary: 10,
      };

      mockUserRepository.updateProfile.mockResolvedValue({
        success: true,
        data: { ...mockUserProfile, ...updates },
      });

      const result = await userService.updateProfile(testUserId, updates);

      expect(result.success).toBe(true);
      expect(mockUserRepository.updateProfile).toHaveBeenCalledWith(testUserId, updates);
    });
  });

  describe("error handling", () => {
    it("should handle different repository error types", async () => {
      // Test access denied
      mockUserRepository.getProfile.mockResolvedValue({
        success: false,
        error: "Access denied to resource",
      });

      let result = await userService.getProfile(testUserId);
      expect(result.error).toBe("You don't have permission to access this user profile");

      // Test network error
      mockUserRepository.getProfile.mockResolvedValue({
        success: false,
        error: "Network error occurred",
      });

      result = await userService.getProfile(testUserId);
      expect(result.error).toBe("Network error. Please check your connection and try again.");

      // Test not found
      mockUserRepository.getProfile.mockResolvedValue({
        success: false,
        error: "User not found in database",
      });

      result = await userService.getProfile(testUserId);
      expect(result.error).toBe("User profile not found");

      // Test generic error
      mockUserRepository.getProfile.mockResolvedValue({
        success: false,
        error: "Some other error",
      });

      result = await userService.getProfile(testUserId);
      expect(result.error).toBe("Database error: Some other error");
    });
  });

  describe("reading streak calculation", () => {
    it("should calculate reading streak correctly", async () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const oldDate = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000); // 40 days ago

      const recentFinishedBooks = [
        {
          ...mockBooks[0],
          finishedAt: {
            toDate: () => recentDate,
          } as Timestamp,
        },
        {
          ...mockBooks[1],
          finishedAt: {
            toDate: () => oldDate,
          } as Timestamp,
        },
      ];

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: recentFinishedBooks,
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data?.readingStreak).toBe(1); // Only one book finished in last 30 days
    });

    it("should handle books without finishedAt", async () => {
      const booksWithoutFinishedAt = mockBooks.map(book => ({
        ...book,
        finishedAt: undefined,
      }));

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: booksWithoutFinishedAt,
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data?.readingStreak).toBe(0);
    });
  });

  describe("favorite genres calculation", () => {
    it("should calculate favorite genres correctly", async () => {
      const booksWithGenres = [
        { ...mockBooks[0], genre: "Fiction" },
        { ...mockBooks[1], genre: "Fiction" },
        { ...mockBooks[2], genre: "Mystery" },
        { ...mockBooks[3], genre: "Non-Fiction" },
      ];

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: booksWithGenres,
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data?.favoriteGenres).toEqual(["Fiction", "Mystery", "Non-Fiction"]);
    });

    it("should limit favorite genres to 5", async () => {
      const booksWithManyGenres = Array.from({ length: 10 }, (_, i) => ({
        ...mockBooks[0],
        id: `book-${i}`,
        genre: `Genre ${i}`,
      }));

      mockBookRepository.getUserBooks.mockResolvedValue({
        success: true,
        data: booksWithManyGenres,
      });

      const result = await userService.getUserStats(testUserId);

      expect(result.success).toBe(true);
      expect(result.data?.favoriteGenres).toHaveLength(5);
    });
  });
});