import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { FirebaseUserRepository } from "../FirebaseUserRepository";
import { UserProfile } from "../../models";
import { RepositoryErrorType } from "../types";

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

  const mockDocRef = {
    path: `users/${testUserId}/profile/main`,
  };

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
      expect(doc).toHaveBeenCalledWith({}, `users/${testUserId}/profile/main`);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("should return null when profile not found", async () => {
      const mockDocSnap = {
        exists: () => false,
      };
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

    it("should handle network errors", async () => {
      const error = { code: "unavailable", message: "Network unavailable" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing user profile");
    });

    it("should handle deadline exceeded error", async () => {
      const error = { code: "deadline-exceeded", message: "Deadline exceeded" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing user profile");
    });

    it("should handle unknown errors", async () => {
      const error = { code: "unknown", message: "Unknown error" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Unknown error");
    });
  });

  describe("createProfile", () => {
    it("should create profile successfully", async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const result = await repository.createProfile(testUserId, mockProfileData);

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

    it("should handle permission denied error", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (setDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.createProfile(testUserId, mockProfileData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to user profile");
    });

    it("should handle network errors", async () => {
      const error = { code: "unavailable", message: "Network unavailable" };
      (setDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.createProfile(testUserId, mockProfileData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing user profile");
    });

    it("should handle unknown errors", async () => {
      const error = { code: "unknown", message: "Unknown error" };
      (setDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.createProfile(testUserId, mockProfileData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Unknown error");
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      // Mock getProfile to return existing profile
      const getProfileSpy = jest.spyOn(repository, 'getProfile');
      getProfileSpy.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

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
      expect(getProfileSpy).toHaveBeenCalledWith(testUserId);

      getProfileSpy.mockRestore();
    });

    it("should handle profile not found during update", async () => {
      // Mock getProfile to return null
      const getProfileSpy = jest.spyOn(repository, 'getProfile');
      getProfileSpy.mockResolvedValue({
        success: true,
        data: null,
      });

      const updates = { displayName: "Updated Name" };
      const result = await repository.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User profile not found");
      expect(updateDoc).not.toHaveBeenCalled();

      getProfileSpy.mockRestore();
    });

    it("should handle getProfile error during update", async () => {
      // Mock getProfile to return error
      const getProfileSpy = jest.spyOn(repository, 'getProfile');
      getProfileSpy.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const updates = { displayName: "Updated Name" };
      const result = await repository.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User profile not found");
      expect(updateDoc).not.toHaveBeenCalled();

      getProfileSpy.mockRestore();
    });

    it("should handle updateDoc errors", async () => {
      // Mock getProfile to return existing profile
      const getProfileSpy = jest.spyOn(repository, 'getProfile');
      getProfileSpy.mockResolvedValue({
        success: true,
        data: mockUserProfile,
      });

      const error = { code: "permission-denied", message: "Permission denied" };
      (updateDoc as jest.Mock).mockRejectedValue(error);

      const updates = { displayName: "Updated Name" };
      const result = await repository.updateProfile(testUserId, updates);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to user profile");

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

    it("should handle permission denied error", async () => {
      const error = { code: "permission-denied", message: "Permission denied" };
      (deleteDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.deleteProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Access denied to user profile");
    });

    it("should handle network errors", async () => {
      const error = { code: "unavailable", message: "Network unavailable" };
      (deleteDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.deleteProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error accessing user profile");
    });

    it("should handle unknown errors", async () => {
      const error = { code: "unknown", message: "Unknown error" };
      (deleteDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.deleteProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Unknown error");
    });
  });

  describe("subscribeToProfile", () => {
    it("should subscribe to profile changes", () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = repository.subscribeToProfile(testUserId, mockCallback);

      expect(unsubscribe).toBe(mockUnsubscribe);
      expect(onSnapshot).toHaveBeenCalledWith(
        mockDocRef,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("should handle profile document exists", () => {
      const mockCallback = jest.fn();
      let snapshotHandler: (doc: any) => void;
      
      (onSnapshot as jest.Mock).mockImplementation((ref, successCallback, errorCallback) => {
        snapshotHandler = successCallback;
        return jest.fn();
      });

      repository.subscribeToProfile(testUserId, mockCallback);

      const mockDoc = {
        exists: () => true,
        id: testUserId,
        data: () => mockProfileData,
      };

      snapshotHandler(mockDoc);

      expect(mockCallback).toHaveBeenCalledWith({
        id: testUserId,
        ...mockProfileData,
      });
    });

    it("should handle profile document does not exist", () => {
      const mockCallback = jest.fn();
      let snapshotHandler: (doc: any) => void;
      
      (onSnapshot as jest.Mock).mockImplementation((ref, successCallback, errorCallback) => {
        snapshotHandler = successCallback;
        return jest.fn();
      });

      repository.subscribeToProfile(testUserId, mockCallback);

      const mockDoc = {
        exists: () => false,
      };

      snapshotHandler(mockDoc);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });

    it("should handle subscription errors", () => {
      const mockCallback = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      let errorHandler: (error: any) => void;
      
      (onSnapshot as jest.Mock).mockImplementation((ref, successCallback, errorCallback) => {
        errorHandler = errorCallback;
        return jest.fn();
      });

      repository.subscribeToProfile(testUserId, mockCallback);

      const error = new Error("Subscription error");
      errorHandler(error);

      expect(consoleSpy).toHaveBeenCalledWith("Error in profile subscription:", error);
      expect(mockCallback).toHaveBeenCalledWith(null);
      
      consoleSpy.mockRestore();
    });
  });

  describe("private methods", () => {
    it("should create correct document reference", () => {
      // This is tested implicitly through other tests
      expect(doc).toHaveBeenCalledWith({}, `users/${testUserId}/profile/main`);
    });
  });

  describe("error handling edge cases", () => {
    it("should handle errors without code property", async () => {
      const error = { message: "Generic error" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: Generic error");
    });

    it("should handle errors without message property", async () => {
      const error = { code: "unknown" };
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: undefined");
    });

    it("should handle string errors", async () => {
      const error = "String error";
      (getDoc as jest.Mock).mockRejectedValue(error);

      const result = await repository.getProfile(testUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error: undefined");
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete profile lifecycle", async () => {
      // Create profile
      (setDoc as jest.Mock).mockResolvedValue(undefined);
      
      const createResult = await repository.createProfile(testUserId, mockProfileData);
      expect(createResult.success).toBe(true);

      // Get profile
      const mockDocSnap = {
        exists: () => true,
        id: testUserId,
        data: () => ({ ...mockProfileData, id: testUserId, createdAt: mockTimestamp, updatedAt: mockTimestamp }),
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const getResult = await repository.getProfile(testUserId);
      expect(getResult.success).toBe(true);
      expect(getResult.data?.id).toBe(testUserId);

      // Update profile
      const getProfileSpy = jest.spyOn(repository, 'getProfile');
      getProfileSpy.mockResolvedValue({
        success: true,
        data: { ...mockUserProfile, id: testUserId },
      });
      (updateDoc as jest.Mock).mockResolvedValue(undefined);

      const updateResult = await repository.updateProfile(testUserId, { displayName: "Updated Name" });
      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.displayName).toBe("Updated Name");

      // Delete profile
      (deleteDoc as jest.Mock).mockResolvedValue(undefined);
      
      const deleteResult = await repository.deleteProfile(testUserId);
      expect(deleteResult.success).toBe(true);

      getProfileSpy.mockRestore();
    });

    it("should handle concurrent operations", async () => {
      // Simulate multiple concurrent operations
      const promises = [
        repository.getProfile(testUserId),
        repository.getProfile(testUserId),
        repository.getProfile(testUserId),
      ];

      const mockDocSnap = {
        exists: () => true,
        id: testUserId,
        data: () => mockProfileData,
      };
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data?.id).toBe(testUserId);
      });
    });
  });
});