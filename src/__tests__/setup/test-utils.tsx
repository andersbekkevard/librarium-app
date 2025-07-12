/**
 * Custom render functions with all necessary providers for testing
 * 
 * This module provides enhanced testing utilities that wrap components
 * with all required providers and context for comprehensive testing.
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { BooksProvider } from '@/lib/providers/BooksProvider';
import { UserProvider } from '@/lib/providers/UserProvider';
import { User } from 'firebase/auth';
import { Book, UserProfile } from '@/lib/models';
import { 
  createMockUser, 
  createMockUserProfile, 
  createMockBook,
  mockFirestore,
  testDataPresets 
} from './firebase-mock';

// Mock Next.js router for testing
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterBack = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: mockRouterReplace,
    back: mockRouterBack,
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    getAll: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Test context configuration
export interface TestContextConfig {
  user?: User | null;
  userProfile?: UserProfile | null;
  books?: Book[];
  initialPath?: string;
  preloadedState?: 'empty' | 'small' | 'large' | 'mixed';
}

// Default test configuration
const defaultTestConfig: TestContextConfig = {
  user: createMockUser(),
  userProfile: createMockUserProfile(),
  books: [],
  initialPath: '/',
};

// Provider wrapper component
interface TestProvidersProps {
  children: ReactNode;
  config?: TestContextConfig;
}

const TestProviders: React.FC<TestProvidersProps> = ({ 
  children, 
  config = defaultTestConfig 
}) => {
  const testConfig = { ...defaultTestConfig, ...config };
  
  // Pre-seed firestore with test data if preloaded state is specified
  React.useEffect(() => {
    if (testConfig.preloadedState) {
      const preset = testDataPresets[testConfig.preloadedState];
      mockFirestore.clearData();
      
      if (preset.user) {
        mockFirestore.seedData('users', [preset.user]);
      }
      if (preset.books.length > 0) {
        mockFirestore.seedData('books', preset.books);
      }
      if (preset.events.length > 0) {
        mockFirestore.seedData('events', preset.events);
      }
    }
  }, [testConfig.preloadedState]);

  return (
    <AuthProvider initialUser={testConfig.user}>
      <UserProvider initialProfile={testConfig.userProfile}>
        <BooksProvider initialBooks={testConfig.books}>
          {children}
        </BooksProvider>
      </UserProvider>
    </AuthProvider>
  );
};

// Custom render function with providers
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  config?: TestContextConfig;
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & {
  config: TestContextConfig;
  rerender: (ui: ReactElement, newConfig?: TestContextConfig) => void;
} {
  const { config, wrapper, ...renderOptions } = options;
  const testConfig = { ...defaultTestConfig, ...config };

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const CustomWrapper = wrapper;
    const content = (
      <TestProviders config={testConfig}>
        {children}
      </TestProviders>
    );

    return CustomWrapper ? <CustomWrapper>{content}</CustomWrapper> : content;
  };

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  // Enhanced rerender function that accepts new config
  const originalRerender = renderResult.rerender;
  const enhancedRerender = (newUi: ReactElement, newConfig?: TestContextConfig) => {
    const updatedConfig = { ...testConfig, ...newConfig };
    return originalRerender(
      <TestProviders config={updatedConfig}>
        {newUi}
      </TestProviders>
    );
  };

  return {
    ...renderResult,
    config: testConfig,
    rerender: enhancedRerender,
  };
}

// Render function for components that need authentication
export function renderWithAuth(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { config: TestContextConfig } {
  const authConfig: TestContextConfig = {
    user: createMockUser(),
    userProfile: createMockUserProfile(),
    books: [],
    ...options.config,
  };

  return renderWithProviders(ui, { ...options, config: authConfig });
}

// Render function for components that need unauthenticated state
export function renderWithoutAuth(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { config: TestContextConfig } {
  const noAuthConfig: TestContextConfig = {
    user: null,
    userProfile: null,
    books: [],
    ...options.config,
  };

  return renderWithProviders(ui, { ...options, config: noAuthConfig });
}

// Render function for components with specific data presets
export function renderWithPreset(
  ui: ReactElement,
  preset: 'empty' | 'small' | 'large' | 'mixed',
  options: CustomRenderOptions = {}
): RenderResult & { config: TestContextConfig } {
  const presetData = testDataPresets[preset];
  const presetConfig: TestContextConfig = {
    user: createMockUser(),
    userProfile: presetData.user,
    books: presetData.books,
    preloadedState: preset,
    ...options.config,
  };

  return renderWithProviders(ui, { ...options, config: presetConfig });
}

// Render function for testing loading states
export function renderWithLoading(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { config: TestContextConfig } {
  const loadingConfig: TestContextConfig = {
    user: undefined, // undefined triggers loading state
    userProfile: undefined,
    books: [],
    ...options.config,
  };

  return renderWithProviders(ui, { ...options, config: loadingConfig });
}

// Utility functions for test setup and teardown
export const testUtils = {
  // Clear all mocks between tests
  clearMocks: () => {
    jest.clearAllMocks();
    mockRouterPush.mockClear();
    mockRouterReplace.mockClear();
    mockRouterBack.mockClear();
    mockFirestore.clearData();
  },

  // Setup common test data
  setupTestData: (config: TestContextConfig) => {
    const { user, userProfile, books } = config;
    
    if (user) {
      mockFirestore.seedData('users', [user]);
    }
    if (userProfile) {
      mockFirestore.seedData('users', [userProfile]);
    }
    if (books && books.length > 0) {
      mockFirestore.seedData('books', books);
    }
  },

  // Simulate user interactions
  simulateAuth: (user?: User) => {
    const mockUser = user || createMockUser();
    // Mock authentication state change
    return mockUser;
  },

  // Simulate network delays for testing loading states
  simulateNetworkDelay: (ms: number = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Create test books with specific patterns
  createTestBooks: {
    withProgress: (count: number) => 
      Array.from({ length: count }, (_, i) => 
        createMockBook({
          id: `progress-book-${i}`,
          state: 'in_progress',
          progress: { currentPage: (i + 1) * 50, totalPages: 200 }
        })
      ),
    
    withRatings: (count: number) => 
      Array.from({ length: count }, (_, i) => 
        createMockBook({
          id: `rated-book-${i}`,
          state: 'finished',
          rating: (i % 5) + 1,
          progress: { currentPage: 200, totalPages: 200 }
        })
      ),
    
    wishlist: (count: number) => 
      Array.from({ length: count }, (_, i) => 
        createMockBook({
          id: `wishlist-book-${i}`,
          isOwned: false,
          state: 'not_started'
        })
      ),
  },

  // Router utilities
  router: {
    push: mockRouterPush,
    replace: mockRouterReplace,
    back: mockRouterBack,
    expectNavigation: (path: string) => {
      expect(mockRouterPush).toHaveBeenCalledWith(path);
    },
    expectNoNavigation: () => {
      expect(mockRouterPush).not.toHaveBeenCalled();
      expect(mockRouterReplace).not.toHaveBeenCalled();
    },
  },

  // Wait for async operations
  waitFor: async (assertion: () => void | Promise<void>, timeout: number = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        await assertion();
        return;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    throw new Error(`Assertion failed after ${timeout}ms timeout`);
  },

  // Mock fetch for API calls
  mockFetch: (response: any, status: number = 200) => {
    const mockResponse = {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);
    return mockResponse;
  },

  // Performance testing helpers
  performance: {
    measureRender: async (renderFn: () => void) => {
      const start = performance.now();
      await renderFn();
      const end = performance.now();
      return end - start;
    },
    
    measureInteraction: async (interactionFn: () => Promise<void>) => {
      const start = performance.now();
      await interactionFn();
      const end = performance.now();
      return end - start;
    },
  },

  // Accessibility testing helpers
  accessibility: {
    checkKeyboardNavigation: async (element: HTMLElement, expectedFocusableCount: number) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements).toHaveLength(expectedFocusableCount);
    },

    checkAriaLabels: (element: HTMLElement, expectedLabels: string[]) => {
      expectedLabels.forEach(label => {
        const elementWithLabel = element.querySelector(`[aria-label="${label}"]`);
        expect(elementWithLabel).toBeInTheDocument();
      });
    },

    checkHeadingStructure: (element: HTMLElement) => {
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map(h => parseInt(h.tagName.charAt(1)));
      
      // Check that headings follow proper nesting (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    },
  },
};

// Export the regular render function for backwards compatibility
export { render } from '@testing-library/react';

// Export testing library utilities
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Export firestore mock for direct access in tests
export { mockFirestore } from './firebase-mock';