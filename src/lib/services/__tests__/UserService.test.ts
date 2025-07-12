import { Timestamp } from "firebase/firestore";
import { UserService } from "../UserService";
import { IUserRepository, IBookRepository } from "../../repositories/types";

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
    userService = new UserService(mockUserRepository, mockBookRepository);
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

      const result = await userService.createProfileFromFirebaseUser(invalidUser);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Display name cannot be empty");
    });

    it("should handle unexpected errors", async () => {
      mockUserRepository.getProfile.mockRejectedValue(new Error("Unexpected error"));

      const result = await userService.createProfileFromFirebaseUser(mockFirebaseUser);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create user profile");
    });
  });
});