/**
 * Tests for AuthProvider
 *
 * Comprehensive test suite for authentication context provider,
 * including user state management, loading states, and error handling.
 */

import { createMockUser } from "@/lib/test-utils/firebase-mock";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuthContext } from "../AuthProvider";

// Define the mocks first
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();

// Mock AuthService
jest.mock("../../api/firebase", () => ({
  auth: {
    onAuthStateChanged: (callback: any) => mockOnAuthStateChanged(callback),
    signOut: mockSignOut,
    currentUser: null,
  },
}));

// Test component to consume auth context
const TestComponent = () => {
  const { user, loading, error, signOut } = useAuthContext();
  return (
    <div>
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="error">{error?.message || "no-error"}</div>
      <button onClick={signOut} data-testid="signout-button">
        Sign Out
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockClear();
    mockSignOut.mockClear();
  });

  it("should provide initial loading state", () => {
    mockOnAuthStateChanged.mockImplementation((callback) => {
      // Simulate async auth check
      setTimeout(() => callback(null), 100);
      return jest.fn(); // Return unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
  });

  it("should provide authenticated user state", async () => {
    const mockUser = createMockUser({
      uid: "test-user-id",
      email: "test@example.com",
      displayName: "Test User",
    });

    mockOnAuthStateChanged.mockImplementation((callback) => {
      setTimeout(() => callback(mockUser), 100);
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });
  });

  it("should handle authentication state changes", async () => {
    const mockUser = createMockUser({
      uid: "test-user-id",
      email: "test@example.com",
    });

    let authCallback: any;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authCallback = callback;
      return jest.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially no user
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");

    // Simulate user login
    authCallback(mockUser);

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });

    // Simulate user logout
    authCallback(null);

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });
  });

  it("should provide signOut functionality", async () => {
    const mockUser = createMockUser({
      uid: "test-user-id",
      email: "test@example.com",
    });

    mockOnAuthStateChanged.mockImplementation((callback) => {
      setTimeout(() => callback(mockUser), 100);
      return jest.fn();
    });

    mockSignOut.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });

    const signOutButton = screen.getByTestId("signout-button");
    signOutButton.click();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("should handle signOut errors", async () => {
    const mockUser = createMockUser({
      uid: "test-user-id",
      email: "test@example.com",
    });

    mockOnAuthStateChanged.mockImplementation((callback) => {
      setTimeout(() => callback(mockUser), 100);
      return jest.fn();
    });

    mockSignOut.mockRejectedValue(new Error("Sign out failed"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });

    const signOutButton = screen.getByTestId("signout-button");
    signOutButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Sign out failed");
    });
  });

  it("should unsubscribe from auth state changes on unmount", () => {
    const unsubscribeMock = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribeMock);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    unmount();

    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });

  it("should throw error when used outside AuthProvider", () => {
    // Suppress console error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuthContext must be used within an AuthProvider");

    console.error = originalError;
  });
});
