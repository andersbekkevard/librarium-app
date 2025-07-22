import { render, screen } from '@testing-library/react';
import AppProviders from '../AppProviders';

// Mock all provider modules with inline components
jest.mock('../AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
  useAuthContext: jest.fn(),
}));

jest.mock('../UserProvider', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  ),
  useUserContext: jest.fn(),
}));

jest.mock('../BooksProvider', () => ({
  BooksProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="books-provider">{children}</div>
  ),
  useBooksContext: jest.fn(),
}));

jest.mock('../EventsProvider', () => ({
  EventsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="events-provider">{children}</div>
  ),
  useEventsContext: jest.fn(),
}));

// Import the mocked hook functions  
import { useAuthContext } from '../AuthProvider';
import { useUserContext } from '../UserProvider';
import { useBooksContext } from '../BooksProvider';
import { useEventsContext } from '../EventsProvider';

// Test component that uses all contexts
const TestComponent = () => {
  const auth = useAuthContext();
  const user = useUserContext();
  const books = useBooksContext();
  const events = useEventsContext();

  return (
    <div data-testid="test-component">
      <div data-testid="context-access">All contexts accessed</div>
    </div>
  );
};

describe('AppProviders', () => {
  beforeEach(() => {
    // Mock the context hooks to return mock values
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    });

    (useUserContext as jest.Mock).mockReturnValue({
      profile: null,
      loading: false,
      updateProfile: jest.fn(),
    });

    (useBooksContext as jest.Mock).mockReturnValue({
      books: [],
      loading: false,
      addBook: jest.fn(),
    });

    (useEventsContext as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      refreshEvents: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render children without crashing', () => {
    render(
      <AppProviders>
        <div data-testid="child">Test Child</div>
      </AppProviders>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should wrap children in the correct provider hierarchy', () => {
    render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    );

    // Check that all providers are present in the DOM
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('books-provider')).toBeInTheDocument();
    expect(screen.getByTestId('events-provider')).toBeInTheDocument();

    // Check that the test component can access all contexts
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByTestId('context-access')).toBeInTheDocument();
  });

  it('should maintain proper provider nesting order', () => {
    render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    );

    const authProvider = screen.getByTestId('auth-provider');
    const userProvider = screen.getByTestId('user-provider');
    const booksProvider = screen.getByTestId('books-provider');
    const eventsProvider = screen.getByTestId('events-provider');

    // Check nesting: Auth > User > Books > Events
    expect(authProvider).toContainElement(userProvider);
    expect(userProvider).toContainElement(booksProvider);
    expect(booksProvider).toContainElement(eventsProvider);
    expect(eventsProvider).toContainElement(screen.getByTestId('test-component'));
  });

  it('should allow all context hooks to be called within the provider tree', () => {
    render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    );

    // Verify that all context hooks were called without errors
    expect(useAuthContext).toHaveBeenCalled();
    expect(useUserContext).toHaveBeenCalled();
    expect(useBooksContext).toHaveBeenCalled();
    expect(useEventsContext).toHaveBeenCalled();
  });

  it('should handle multiple children', () => {
    render(
      <AppProviders>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <TestComponent />
      </AppProviders>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('should handle empty children gracefully', () => {
    render(<AppProviders>{null}</AppProviders>);

    // Should not crash and all providers should still be present
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('books-provider')).toBeInTheDocument();
    expect(screen.getByTestId('events-provider')).toBeInTheDocument();
  });

  it('should handle React fragments as children', () => {
    render(
      <AppProviders>
        <>
          <div data-testid="fragment-child-1">Fragment Child 1</div>
          <div data-testid="fragment-child-2">Fragment Child 2</div>
        </>
      </AppProviders>
    );

    expect(screen.getByTestId('fragment-child-1')).toBeInTheDocument();
    expect(screen.getByTestId('fragment-child-2')).toBeInTheDocument();
  });

  it('should provide isolated context instances', () => {
    const TestComponent1 = () => {
      const { user } = useAuthContext();
      return <div data-testid="test-1">User: {user ? 'logged in' : 'not logged in'}</div>;
    };

    const TestComponent2 = () => {
      const { user } = useAuthContext();
      return <div data-testid="test-2">User: {user ? 'logged in' : 'not logged in'}</div>;
    };

    render(
      <AppProviders>
        <TestComponent1 />
        <TestComponent2 />
      </AppProviders>
    );

    // Both components should have access to the same context
    expect(screen.getByTestId('test-1')).toHaveTextContent('not logged in');
    expect(screen.getByTestId('test-2')).toHaveTextContent('not logged in');
  });

  it('should work with complex component hierarchies', () => {
    const DeepChild = () => {
      const { user } = useAuthContext();
      const { profile } = useUserContext();
      const { books } = useBooksContext();
      const { events } = useEventsContext();

      return (
        <div data-testid="deep-child">
          <div>Auth: {user ? 'available' : 'not available'}</div>
          <div>Profile: {profile ? 'available' : 'not available'}</div>
          <div>Books: {Array.isArray(books) ? 'available' : 'not available'}</div>
          <div>Events: {Array.isArray(events) ? 'available' : 'not available'}</div>
        </div>
      );
    };

    const MiddleWrapper = () => (
      <div>
        <div>
          <div>
            <DeepChild />
          </div>
        </div>
      </div>
    );

    render(
      <AppProviders>
        <MiddleWrapper />
      </AppProviders>
    );

    const deepChild = screen.getByTestId('deep-child');
    expect(deepChild).toBeInTheDocument();
    expect(deepChild).toHaveTextContent('Auth: not available');
    expect(deepChild).toHaveTextContent('Profile: not available');
    expect(deepChild).toHaveTextContent('Books: available');
    expect(deepChild).toHaveTextContent('Events: available');
  });

  it('should maintain provider order according to dependency hierarchy', () => {
    // This test ensures that the provider order matches the architectural rules:
    // Auth (no dependencies) > User (depends on Auth) > Books (depends on Auth/User) > Events (depends on Auth/User)
    
    render(
      <AppProviders>
        <div data-testid="content">Content</div>
      </AppProviders>
    );

    const authProvider = screen.getByTestId('auth-provider');
    const userProvider = screen.getByTestId('user-provider');
    const booksProvider = screen.getByTestId('books-provider');
    const eventsProvider = screen.getByTestId('events-provider');

    // Verify the dependency chain is respected
    expect(authProvider.contains(userProvider)).toBe(true);
    expect(userProvider.contains(booksProvider)).toBe(true);
    expect(booksProvider.contains(eventsProvider)).toBe(true);
    expect(eventsProvider.contains(screen.getByTestId('content'))).toBe(true);
  });
});