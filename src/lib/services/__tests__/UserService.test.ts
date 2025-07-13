import { Timestamp } from "firebase/firestore";
import { IBookRepository, IUserRepository } from "../../repositories/types";
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

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(
      mockUserRepository as any,
      mockBookRepository as any
    );
  });

  describe("createProfileFromFirebaseUser", () => {
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

      mockUserRepository.createProfile.mockResolvedValue({
        success: true,
        data: {
          id: "test-user-id",
          displayName: "Anonymous User",
          email: "test@example.com",
          emailVerified: true,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
          lastSignInTime: "2023-01-01T00:00:00Z",
          totalBooksRead: 0,
          currentlyReading: 0,
          booksInLibrary: 0,
        },
      });

      const result = await userService.createProfileFromFirebaseUser(
        invalidUser
      );

      expect(result.success).toBe(true);
      expect(result.data?.displayName).toBe("Anonymous User");
    });

    it("should handle unexpected errors", async () => {
      mockUserRepository.getProfile.mockResolvedValue({
        success: true,
        data: null,
      });

      mockUserRepository.createProfile.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const result = await userService.createProfileFromFirebaseUser(
        mockFirebaseUser
      );

      expect(result.success).toBe(false);
      expect(result.error).toEqual(
        expect.objectContaining({
          message: "Failed to create user profile",
          category: "system",
          userMessage: "An unexpected error occurred",
        })
      );
    });
  });
});
