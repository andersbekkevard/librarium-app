import React from 'react';
import { screen } from '@testing-library/react';
import {
  renderWithProviders,
  renderWithAuth,
  renderWithoutAuth,
  renderWithPreset,
  renderWithLoading,
  testUtils,
  TestContextConfig,
} from '../test-utils';
import { useAuthContext } from '@/lib/providers/AuthProvider';
import { useUserContext } from '@/lib/providers/UserProvider';
import { useBooksContext } from '@/lib/providers/BooksProvider';
import { createMockUser, createMockUserProfile, createMockBook } from '../firebase-mock';

// Test components
const TestComponent = () => {
  return <div data-testid="test-component">Test Content</div>;
};

const AuthAwareComponent = () => {
  const { user } = useAuthContext();
  return (
    <div data-testid="auth-aware">
      {user ? `User: ${user.displayName}` : 'No user'}
    </div>
  );
};

const UserProfileComponent = () => {
  const { profile } = useUserContext();
  return (
    <div data-testid="user-profile">
      {profile ? `Profile: ${profile.displayName}` : 'No profile'}
    </div>
  );
};

const BooksComponent = () => {
  const { books } = useBooksContext();
  return (
    <div data-testid="books-component">
      Books count: {books?.length || 0}
    </div>
  );
};

describe('renderWithProviders', () => {
  afterEach(() => {
    testUtils.clearMocks();
  });

  it('should render component with default providers', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('should provide default configuration', () => {
    const { config } = renderWithProviders(<AuthAwareComponent />);
    
    expect(config.user).toBeDefined();
    expect(config.userProfile).toBeDefined();
    expect(config.books).toEqual([]);
    expect(config.initialPath).toBe('/');
  });

  it('should accept custom configuration', () => {
    const customConfig: TestContextConfig = {
      user: createMockUser({ displayName: 'Custom User' }),
      userProfile: createMockUserProfile({ displayName: 'Custom Profile' }),
      books: [createMockBook({ title: 'Custom Book' })],
    };

    const { config } = renderWithProviders(
      <AuthAwareComponent />, 
      { config: customConfig }
    );
    
    expect(config.user?.displayName).toBe('Custom User');
    expect(config.userProfile?.displayName).toBe('Custom Profile');
    expect(config.books).toHaveLength(1);
  });

  it('should support rerender with new config', () => {
    const { rerender } = renderWithProviders(<AuthAwareComponent />);
    
    // Initial render
    expect(screen.getByTestId('auth-aware')).toBeInTheDocument();
    
    // Rerender with new config
    rerender(
      <AuthAwareComponent />, 
      { user: createMockUser({ displayName: 'New User' }) }
    );
    
    expect(screen.getByTestId('auth-aware')).toBeInTheDocument();
  });

  it('should handle custom wrapper component', () => {
    const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="custom-wrapper">{children}</div>
    );

    renderWithProviders(<TestComponent />, { wrapper: CustomWrapper });
    
    expect(screen.getByTestId('custom-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('should support preloaded state seeding', () => {
    renderWithProviders(
      <TestComponent />, 
      { config: { preloadedState: 'small' } }
    );
    
    // Component should render successfully with seeded data
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});

describe('renderWithAuth', () => {
  afterEach(() => {
    testUtils.clearMocks();
  });

  it('should render with authenticated user by default', () => {
    const { config } = renderWithAuth(<AuthAwareComponent />);
    
    expect(config.user).toBeDefined();
    expect(config.userProfile).toBeDefined();
    expect(config.user?.uid).toBe('test-user-id');
  });

  it('should accept custom auth configuration', () => {
    const customUser = createMockUser({ displayName: 'Auth User' });
    
    const { config } = renderWithAuth(
      <AuthAwareComponent />, 
      { config: { user: customUser } }
    );
    
    expect(config.user?.displayName).toBe('Auth User');
  });

  it('should provide both user and profile by default', () => {
    const { config } = renderWithAuth(<UserProfileComponent />);
    
    expect(config.user).toBeDefined();
    expect(config.userProfile).toBeDefined();
    expect(config.books).toEqual([]);
  });
});

describe('renderWithoutAuth', () => {
  afterEach(() => {
    testUtils.clearMocks();
  });

  it('should render with null user and profile', () => {
    const { config } = renderWithoutAuth(<AuthAwareComponent />);
    
    expect(config.user).toBeNull();
    expect(config.userProfile).toBeNull();
    expect(config.books).toEqual([]);
  });

  it('should still accept custom config overrides', () => {
    const customBooks = [createMockBook({ title: 'Unauthenticated Book' })];
    
    const { config } = renderWithoutAuth(
      <BooksComponent />, 
      { config: { books: customBooks } }
    );
    
    expect(config.user).toBeNull();
    expect(config.books).toHaveLength(1);
  });
});

describe('renderWithPreset', () => {
  afterEach(() => {
    testUtils.clearMocks();
  });

  it('should render with empty preset', () => {
    const { config } = renderWithPreset(<BooksComponent />, 'empty');
    
    expect(config.preloadedState).toBe('empty');
    expect(config.books).toEqual([]);
  });

  it('should render with small preset', () => {
    const { config } = renderWithPreset(<BooksComponent />, 'small');
    
    expect(config.preloadedState).toBe('small');
    expect(config.books).toHaveLength(3);
  });

  it('should render with large preset', () => {
    const { config } = renderWithPreset(<BooksComponent />, 'large');
    
    expect(config.preloadedState).toBe('large');
    expect(config.books).toHaveLength(15);
  });

  it('should render with mixed preset', () => {
    const { config } = renderWithPreset(<BooksComponent />, 'mixed');
    
    expect(config.preloadedState).toBe('mixed');
    expect(config.books).toHaveLength(3);
  });

  it('should still accept config overrides', () => {
    const customUser = createMockUser({ displayName: 'Preset User' });
    
    const { config } = renderWithPreset(
      <AuthAwareComponent />, 
      'small',
      { config: { user: customUser } }
    );
    
    expect(config.user?.displayName).toBe('Preset User');
    expect(config.preloadedState).toBe('small');
  });
});

describe('renderWithLoading', () => {
  afterEach(() => {
    testUtils.clearMocks();
  });

  it('should render with undefined user and profile', () => {
    const { config } = renderWithLoading(<AuthAwareComponent />);
    
    expect(config.user).toBeUndefined();
    expect(config.userProfile).toBeUndefined();
    expect(config.books).toEqual([]);
  });

  it('should accept config overrides', () => {
    const customBooks = [createMockBook()];
    
    const { config } = renderWithLoading(
      <BooksComponent />, 
      { config: { books: customBooks } }
    );
    
    expect(config.user).toBeUndefined();
    expect(config.books).toHaveLength(1);
  });
});

describe('testUtils', () => {
  describe('clearMocks', () => {
    it('should clear all mocks', () => {
      // This test mainly ensures the function doesn't throw
      expect(() => testUtils.clearMocks()).not.toThrow();
    });
  });

  describe('setupTestData', () => {
    it('should setup test data without throwing', () => {
      const config: TestContextConfig = {
        user: createMockUser(),
        userProfile: createMockUserProfile(),
        books: [createMockBook()],
      };

      expect(() => testUtils.setupTestData(config)).not.toThrow();
    });

    it('should handle empty config', () => {
      expect(() => testUtils.setupTestData({})).not.toThrow();
    });
  });

  describe('simulateAuth', () => {
    it('should return mock user', () => {
      const user = testUtils.simulateAuth();
      
      expect(user).toBeDefined();
      expect(user.uid).toBe('test-user-id');
    });

    it('should accept custom user', () => {
      const customUser = createMockUser({ uid: 'custom-id' });
      const user = testUtils.simulateAuth(customUser);
      
      expect(user.uid).toBe('custom-id');
    });
  });

  describe('simulateNetworkDelay', () => {
    it('should return a promise', () => {
      const result = testUtils.simulateNetworkDelay(100);
      
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve after specified time', async () => {
      const start = Date.now();
      await testUtils.simulateNetworkDelay(50);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(45); // Allow some tolerance
    });
  });

  describe('createTestBooks', () => {
    describe('withProgress', () => {
      it('should create books with progress', () => {
        const books = testUtils.createTestBooks.withProgress(3);
        
        expect(books).toHaveLength(3);
        books.forEach((book, index) => {
          expect(book.state).toBe('in_progress');
          expect(book.progress.currentPage).toBe((index + 1) * 50);
          expect(book.progress.totalPages).toBe(200);
        });
      });
    });

    describe('withRatings', () => {
      it('should create books with ratings', () => {
        const books = testUtils.createTestBooks.withRatings(5);
        
        expect(books).toHaveLength(5);
        books.forEach((book, index) => {
          expect(book.state).toBe('finished');
          expect(book.rating).toBe((index % 5) + 1);
          expect(book.progress.currentPage).toBe(200);
          expect(book.progress.totalPages).toBe(200);
        });
      });
    });

    describe('wishlist', () => {
      it('should create wishlist books', () => {
        const books = testUtils.createTestBooks.wishlist(2);
        
        expect(books).toHaveLength(2);
        books.forEach(book => {
          expect(book.isOwned).toBe(false);
          expect(book.state).toBe('not_started');
        });
      });
    });
  });

  describe('router', () => {
    beforeEach(() => {
      testUtils.clearMocks();
    });

    it('should provide router mock functions', () => {
      expect(testUtils.router.push).toBeDefined();
      expect(testUtils.router.replace).toBeDefined();
      expect(testUtils.router.back).toBeDefined();
    });

    it('should provide navigation expectation helpers', () => {
      // First make a router call to test the expectation
      testUtils.router.push('/test');
      expect(() => testUtils.router.expectNavigation('/test')).not.toThrow();
      
      // Clear mocks and test no navigation expectation
      testUtils.clearMocks();
      expect(() => testUtils.router.expectNoNavigation()).not.toThrow();
    });
  });

  describe('waitFor', () => {
    it('should resolve when assertion passes', async () => {
      let counter = 0;
      const assertion = () => {
        counter++;
        if (counter < 3) throw new Error('Not ready');
      };

      await expect(testUtils.waitFor(assertion, 1000)).resolves.not.toThrow();
      expect(counter).toBeGreaterThanOrEqual(3);
    });

    it('should timeout when assertion never passes', async () => {
      const assertion = () => {
        throw new Error('Always fails');
      };

      await expect(testUtils.waitFor(assertion, 100)).rejects.toThrow('Assertion failed after 100ms timeout');
    });
  });

  describe('mockFetch', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should mock fetch with success response', () => {
      const responseData = { message: 'success' };
      const mockResponse = testUtils.mockFetch(responseData);

      expect(mockResponse.ok).toBe(true);
      expect(mockResponse.status).toBe(200);
    });

    it('should mock fetch with error response', () => {
      const responseData = { error: 'failed' };
      const mockResponse = testUtils.mockFetch(responseData, 404);

      expect(mockResponse.ok).toBe(false);
      expect(mockResponse.status).toBe(404);
    });
  });

  describe('performance', () => {
    it('should measure render performance', async () => {
      const renderFn = () => {
        // Simulate some work
        for (let i = 0; i < 1000; i++) {
          Math.random();
        }
      };

      const duration = await testUtils.performance.measureRender(renderFn);
      
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThan(0);
    });

    it('should measure interaction performance', async () => {
      const interactionFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      };

      const duration = await testUtils.performance.measureInteraction(interactionFn);
      
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('accessibility', () => {
    it('should check keyboard navigation', async () => {
      const div = document.createElement('div');
      div.innerHTML = '<button>Button 1</button><button>Button 2</button>';

      await expect(
        testUtils.accessibility.checkKeyboardNavigation(div, 2)
      ).resolves.not.toThrow();
    });

    it('should check aria labels', () => {
      const div = document.createElement('div');
      div.innerHTML = '<button aria-label="Close">X</button><input aria-label="Search" />';
      
      // Add the div to document for the test to work properly
      document.body.appendChild(div);

      expect(() => 
        testUtils.accessibility.checkAriaLabels(div, ['Close', 'Search'])
      ).not.toThrow();
      
      // Clean up
      document.body.removeChild(div);
    });

    it('should check heading structure', () => {
      const div = document.createElement('div');
      div.innerHTML = '<h1>Title</h1><h2>Subtitle</h2><h3>Sub-subtitle</h3>';

      expect(() => 
        testUtils.accessibility.checkHeadingStructure(div)
      ).not.toThrow();
    });

    it('should detect improper heading nesting', () => {
      const div = document.createElement('div');
      div.innerHTML = '<h1>Title</h1><h3>Skipped h2</h3>'; // Skips h2

      expect(() => 
        testUtils.accessibility.checkHeadingStructure(div)
      ).toThrow();
    });
  });
});

describe('Integration tests', () => {
  afterEach(() => {
    testUtils.clearMocks();
  });

  it('should work with multiple render utilities together', () => {
    // Test that different render functions work correctly
    const authResult = renderWithAuth(<AuthAwareComponent />);
    const noAuthResult = renderWithoutAuth(<AuthAwareComponent />);
    const presetResult = renderWithPreset(<BooksComponent />, 'small');

    expect(authResult.config.user).toBeDefined();
    expect(noAuthResult.config.user).toBeNull();
    expect(presetResult.config.books).toHaveLength(3);
  });

  it('should support complex testing workflows', async () => {
    // Setup test data
    const config: TestContextConfig = {
      user: createMockUser({ displayName: 'Test User' }),
      books: testUtils.createTestBooks.withProgress(2),
    };

    testUtils.setupTestData(config);

    // Render component with auth
    renderWithAuth(<BooksComponent />, { config });

    // Simulate user interactions
    const user = testUtils.simulateAuth();
    expect(user).toBeDefined();

    // Test performance
    const duration = await testUtils.performance.measureRender(() => {
      renderWithPreset(<TestComponent />, 'empty');
    });

    expect(duration).toBeGreaterThan(0);
  });

  it('should handle error scenarios gracefully', async () => {
    // Test with invalid data
    expect(() => testUtils.setupTestData({ user: null })).not.toThrow();
    
    // Test with network delay
    await expect(testUtils.simulateNetworkDelay(10)).resolves.toBeUndefined();
    
    // Test with failing assertions
    await expect(
      testUtils.waitFor(() => { throw new Error('fail'); }, 50)
    ).rejects.toThrow();
  });

  it('should clean up properly between tests', () => {
    // Make some mock calls
    testUtils.router.push('/test');
    testUtils.setupTestData({ user: createMockUser() });

    // Clear mocks
    testUtils.clearMocks();

    // Router should be cleared
    testUtils.router.expectNoNavigation();
  });
});