import {
  Timestamp,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../api/firebase";
import { UserProfile } from "../../models/models";
import { FirebaseUserRepository } from "../FirebaseUserRepository";

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  Timestamp: {
    now: jest.fn(),
  },
}));

// Mock Firebase config
jest.mock("../../api/firebase", () => ({
  db: { app: { name: "mock-app" } }, // Mock db instance
  auth: {},
  storage: {},
}));

// Mock Firebase Timestamp
const mockTimestamp = {
  seconds: 1234567890,
  nanoseconds: 0,
  toDate: () => new Date(1234567890000),
} as Timestamp;

describe("FirebaseUserRepository", () => {
  let repository: FirebaseUserRepository;
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

  const mockProfileData = {
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    emailVerified: true,
    lastSignInTime: "2023-01-01T00:00:00Z",
    totalBooksRead: 5,
    currentlyReading: 2,
    booksInLibrary: 10,
  };

  const mockDocRef = { path: `users/${testUserId}/profile/main` };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new FirebaseUserRepository();

    // Setup default mocks
    (Timestamp.now as jest.Mock).mockReturnValue(mockTimestamp);
    (doc as jest.Mock).mockReturnValue(mockDocRef);
  });

  describe("getProfile", () => {
    it("should return user profile when found", async () => {
      const mockDocSnap = {
        exists: () => true,
        id: testUserId,
        data: () => mockProfileData,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: testUserId, ...mockProfileData });
      expect(doc).toHaveBeenCalledWith(db, `users/${testUserId}/profile/main`);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("should return null when profile not found", async () => {
      const mockDocSnap = { exists: () => false };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should handle permission denied error", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to user profile");
    });
  });

  describe("createProfile", () => {
    it("should create profile successfully", async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.createProfile(
        testUserId,
        mockProfileData
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...mockProfileData,
        id: testUserId,
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
      });
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        ...mockProfileData,
        id: testUserId,
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
      });
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      const getProfileSpy = jest
        .spyOn(repository, "getProfile")
        .mockResolvedValue({ success: true, data: mockUserProfile });

      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const updates = { displayName: "Updated Name" };
      const result = await repository.updateProfile(testUserId, updates);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        ...mockUserProfile,
        ...updates,
        updatedAt: mockTimestamp,
      });
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        ...updates,
        updatedAt: mockTimestamp,
      });

      getProfileSpy.mockRestore();
    });
  });

  describe("deleteProfile", () => {
    it("should delete profile successfully", async () => {
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.deleteProfile(testUserId);

      expect(result.success).toBe(true);
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });
  });

  describe("subscribeToProfile", () => {
    it("should subscribe to profile changes", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = repository.subscribeToProfile(
        testUserId,
        mockCallback
      );

      expect(unsubscribe).toBe(mockUnsubscribe);
      expect(onSnapshot).toHaveBeenCalledWith(
        mockDocRef,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });
});
