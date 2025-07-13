// TODO Fix Skipped Tests, either remove them or fix class

/**
 * Tests for UserProvider
 *
 * Comprehensive test suite for user profile context provider,
 * including profile management, statistics, and updates.
 */

import { StandardError } from "@/lib/errors/error-handling";
import { createMockUserProfile } from "@/lib/test-utils/firebase-mock";
import { render, screen, waitFor } from "@testing-library/react";
import { UserProvider, useUserContext } from "../UserProvider";

// Mock UserService
jest.mock("../../services/UserService", () => ({
  userService: {
    getProfile: jest.fn(),
    createProfileFromFirebaseUser: jest.fn(),
    updateProfile: jest.fn(),
    getUserStats: jest.fn(),
    updateUserStats: jest.fn(),
    refreshUserStats: jest.fn(),
  },
}));

// Get references to the mocked functions
import { userService } from "../../services/UserService";
const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock AuthProvider
jest.mock("../AuthProvider", () => ({
  useAuthContext: () => ({
    user: {
      uid: "test-user-id",
      email: "test@example.com",
      displayName: "Test User",
    },
  }),
}));

// Mock Firebase
jest.mock("../../api/firebase", () => ({
  // Mocked exports as needed
}));

// Test component to consume user context
const TestComponent = () => {
  const { userProfile, loading, error, refreshUserStats, updateUserProfile } =
    useUserContext();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="error">{error?.message || "no-error"}</div>
      <div data-testid="user-name">{userProfile?.displayName || "no-user"}</div>
      <div data-testid="books-read">{userProfile?.totalBooksRead || 0}</div>

      <button data-testid="refresh-stats" onClick={refreshUserStats}>
        Refresh Stats
      </button>

      <button
        data-testid="update-profile"
        onClick={() => updateUserProfile({ displayName: "Updated Name" })}
      >
        Update Profile
      </button>
    </div>
  );
};

describe("UserProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mocks to resolve quickly
    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: null,
    });
    mockUserService.createProfileFromFirebaseUser.mockResolvedValue({
      success: true,
      data: createMockUserProfile({ id: "test-user-id" }),
    });
    mockUserService.getUserStats.mockResolvedValue({
      success: true,
      data: {
        totalBooksRead: 0,
        currentlyReading: 0,
        booksInLibrary: 0,
        totalPagesRead: 0,
        averageRating: 0,
        readingStreak: 0,
        booksReadThisMonth: 0,
        booksReadThisYear: 0,
        favoriteGenres: [],
      },
    });
  });

  it.skip("should provide initial loading state", () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it.skip("should load existing user profile", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Test User",
      totalBooksRead: 42,
    });

    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
      expect(screen.getByTestId("books-read")).toHaveTextContent("42");
    });
  });

  it.skip("should create new user profile when none exists", async () => {
    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: null,
    });

    const newProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Test User",
      email: "test@example.com",
      totalBooksRead: 0,
    });

    mockUserService.updateProfile.mockResolvedValue({
      success: true,
      data: newProfile,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        "test-user-id",
        {
          displayName: "Test User",
          email: "test@example.com",
        }
      );
    });
  });

  it.skip("should handle profile loading errors", async () => {
    mockUserService.getProfile.mockResolvedValue({
      success: false,
      error: { message: "Failed to load profile" } as StandardError,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Failed to load profile"
      );
    });
  });

  it.skip("should update user profile", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Original Name",
    });

    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    const updatedProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Updated Name",
    });

    mockUserService.updateProfile.mockResolvedValue({
      success: true,
      data: updatedProfile,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const updateButton = screen.getByTestId("update-profile");
    updateButton.click();

    await waitFor(() => {
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        "test-user-id",
        {
          displayName: "Updated Name",
        }
      );
      expect(screen.getByTestId("user-name")).toHaveTextContent("Updated Name");
    });
  });

  it.skip("should refresh user statistics", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      totalBooksRead: 10,
    });

    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    const refreshedProfile = createMockUserProfile({
      id: "test-user-id",
      totalBooksRead: 15,
    });

    mockUserService.updateProfile.mockResolvedValue({
      success: true,
      data: refreshedProfile,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("books-read")).toHaveTextContent("10");
    });

    const refreshButton = screen.getByTestId("refresh-stats");
    refreshButton.click();

    await waitFor(() => {
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        "test-user-id"
      );
      expect(screen.getByTestId("books-read")).toHaveTextContent("15");
    });
  });

  it.skip("should handle profile update errors", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Original Name",
    });

    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    mockUserService.updateProfile.mockResolvedValue({
      success: false,
      error: { message: "Update failed" } as StandardError,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const updateButton = screen.getByTestId("update-profile");
    updateButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Update failed");
    });
  });

  it.skip("should handle refresh stats errors", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      totalBooksRead: 10,
    });

    mockUserService.getProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    mockUserService.updateProfile.mockResolvedValue({
      success: false,
      error: { message: "Refresh failed" } as StandardError,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const refreshButton = screen.getByTestId("refresh-stats");
    refreshButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Refresh failed");
    });
  });

  it.skip("should throw error when used outside UserProvider", () => {
    // Suppress console error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useUserContext must be used within a UserProvider");

    console.error = originalError;
  });
});
