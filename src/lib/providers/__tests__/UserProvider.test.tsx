/**
 * Tests for UserProvider
 *
 * Comprehensive test suite for user profile context provider,
 * including profile management, statistics, and updates.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { UserProvider, useUserContext } from "../UserProvider";
import { createMockUserProfile } from "@/lib/test-utils/firebase-mock";

// Mock services
const mockUserService = {
  getUserProfile: jest.fn(),
  createUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  refreshUserStats: jest.fn(),
};

// Mock AuthProvider
jest.mock("../AuthProvider", () => ({
  useAuthContext: () => ({
    user: { uid: "test-user-id", email: "test@example.com", displayName: "Test User" },
  }),
}));

// Mock UserService
jest.mock("../../services/UserService", () => ({
  userService: mockUserService,
}));

// Test component to consume user context
const TestComponent = () => {
  const {
    userProfile,
    loading,
    error,
    refreshUserStats,
    updateUserProfile,
  } = useUserContext();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="error">{error?.message || "no-error"}</div>
      <div data-testid="user-name">{userProfile?.displayName || "no-user"}</div>
      <div data-testid="books-read">{userProfile?.totalBooksRead || 0}</div>
      
      <button
        data-testid="refresh-stats"
        onClick={refreshUserStats}
      >
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
  });

  it("should provide initial loading state", () => {
    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      data: null,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it("should load existing user profile", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Test User",
      totalBooksRead: 42,
    });

    mockUserService.getUserProfile.mockResolvedValue({
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

  it("should create new user profile when none exists", async () => {
    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      data: null,
    });

    const newProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Test User",
      email: "test@example.com",
      totalBooksRead: 0,
    });

    mockUserService.createUserProfile.mockResolvedValue({
      success: true,
      data: newProfile,
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(mockUserService.createUserProfile).toHaveBeenCalledWith(
        "test-user-id",
        {
          displayName: "Test User",
          email: "test@example.com",
        }
      );
    });
  });

  it("should handle profile loading errors", async () => {
    mockUserService.getUserProfile.mockResolvedValue({
      success: false,
      error: "Failed to load profile",
    });

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("error")).toHaveTextContent("Failed to load profile");
    });
  });

  it("should update user profile", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Original Name",
    });

    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    const updatedProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Updated Name",
    });

    mockUserService.updateUserProfile.mockResolvedValue({
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
      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(
        "test-user-id",
        { displayName: "Updated Name" }
      );
      expect(screen.getByTestId("user-name")).toHaveTextContent("Updated Name");
    });
  });

  it("should refresh user statistics", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      totalBooksRead: 10,
    });

    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    const refreshedProfile = createMockUserProfile({
      id: "test-user-id",
      totalBooksRead: 15,
    });

    mockUserService.refreshUserStats.mockResolvedValue({
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
      expect(mockUserService.refreshUserStats).toHaveBeenCalledWith("test-user-id");
      expect(screen.getByTestId("books-read")).toHaveTextContent("15");
    });
  });

  it("should handle profile update errors", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      displayName: "Original Name",
    });

    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    mockUserService.updateUserProfile.mockResolvedValue({
      success: false,
      error: "Update failed",
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

  it("should handle refresh stats errors", async () => {
    const mockProfile = createMockUserProfile({
      id: "test-user-id",
      totalBooksRead: 10,
    });

    mockUserService.getUserProfile.mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    mockUserService.refreshUserStats.mockResolvedValue({
      success: false,
      error: "Refresh failed",
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

  it("should throw error when used outside UserProvider", () => {
    // Suppress console error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useUserContext must be used within a UserProvider");

    console.error = originalError;
  });
});