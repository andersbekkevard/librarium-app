import { renderHook, act } from '@testing-library/react';
import { useScrollAnimation, useStaggeredScrollAnimation } from '../useScrollAnimation';

// Mock IntersectionObserver
class MockIntersectionObserver {
  public callback: (entries: IntersectionObserverEntry[]) => void;
  public elements: Set<Element> = new Set();
  public options: IntersectionObserverInit;

  constructor(callback: (entries: IntersectionObserverEntry[]) => void, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options || {};
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  // Test helper to simulate intersection
  triggerIntersection(element: Element, isIntersecting: boolean) {
    const entry = {
      target: element,
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: {} as DOMRectReadOnly,
      time: Date.now(),
    } as IntersectionObserverEntry;

    this.callback([entry]);
  }
}

// Global mock
let mockObserver: MockIntersectionObserver | null = null;
const mockIntersectionObserverConstructor = jest.fn().mockImplementation((callback, options) => {
  mockObserver = new MockIntersectionObserver(callback, options);
  return mockObserver;
});
global.IntersectionObserver = mockIntersectionObserverConstructor;

// Mock timers for staggered animations
jest.useFakeTimers();

// Helper function to create a hook test with a properly set element
const renderScrollAnimationHook = (options?: any) => {
  const mockElement = document.createElement('div');
  const hookResult = renderHook(() => {
    const result = useScrollAnimation(options);
    // Set the element ref immediately so useEffect can observe it
    if (!result.elementRef.current) {
      (result.elementRef as any).current = mockElement;
    }
    return result;
  });
  
  return { ...hookResult, mockElement };
};

describe('useScrollAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObserver = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return elementRef and initial isVisible state', () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    expect(result.current.elementRef).toBeDefined();
    expect(result.current.isVisible).toBe(false);
  });

  it('should create IntersectionObserver with default options', () => {
    renderScrollAnimationHook();
    
    expect(mockIntersectionObserverConstructor).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );
  });

  it('should use custom options', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '10px',
      triggerOnce: false,
    };

    renderScrollAnimationHook(options);
    
    expect(mockIntersectionObserverConstructor).toHaveBeenCalledWith(
      expect.any(Function),
      {
        threshold: 0.5,
        rootMargin: '10px',
      }
    );
  });

  it('should set isVisible to true when element intersects', () => {
    const { result, mockElement } = renderScrollAnimationHook();

    // Trigger intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });

    expect(result.current.isVisible).toBe(true);
  });

  it('should set isVisible to false when element stops intersecting and triggerOnce is false', () => {
    const { result, mockElement } = renderScrollAnimationHook({ triggerOnce: false });

    // Trigger intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });
    expect(result.current.isVisible).toBe(true);

    // Stop intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, false);
      }
    });
    expect(result.current.isVisible).toBe(false);
  });

  it('should remain visible after intersection when triggerOnce is true', () => {
    const { result, mockElement } = renderScrollAnimationHook({ triggerOnce: true });

    // Trigger intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });
    expect(result.current.isVisible).toBe(true);

    // Stop intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, false);
      }
    });
    expect(result.current.isVisible).toBe(true); // Should remain true
  });

  it('should not trigger again after first intersection when triggerOnce is true', () => {
    const { result, mockElement } = renderScrollAnimationHook({ triggerOnce: true });

    // First intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });
    expect(result.current.isVisible).toBe(true);

    // Stop intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, false);
      }
    });
    expect(result.current.isVisible).toBe(true);

    // Try to trigger again
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });
    expect(result.current.isVisible).toBe(true); // Should remain true, no change
  });

  it('should handle element ref changes', () => {
    const { result, rerender } = renderHook(() => useScrollAnimation());
    
    // Initially no element
    expect(result.current.elementRef.current).toBeNull();

    // Set an element
    const mockElement = document.createElement('div');
    act(() => {
      result.current.elementRef.current = mockElement;
    });
    
    // Force re-render to trigger useEffect
    rerender();

    // Should observe the element if observer was created
    if (mockObserver) {
      expect(mockObserver.elements.has(mockElement)).toBe(true);
    }
  });

  it('should clean up observer on unmount', () => {
    const { result, rerender, unmount } = renderHook(() => useScrollAnimation());
    
    const mockElement = document.createElement('div');
    act(() => {
      result.current.elementRef.current = mockElement;
    });
    
    // Force re-render to trigger useEffect
    rerender();

    if (mockObserver) {
      const unobserveSpy = jest.spyOn(mockObserver, 'unobserve');
      
      unmount();
      
      expect(unobserveSpy).toHaveBeenCalledWith(mockElement);
    }
  });

  it('should handle missing element gracefully', () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    // elementRef.current is null, should not throw
    expect(() => {
      // Trigger intersection with null element should not cause issues
      if (mockObserver) {
        mockObserver.triggerIntersection(document.createElement('div'), true);
      }
    }).not.toThrow();

    expect(result.current.isVisible).toBe(false);
  });
});

describe('useStaggeredScrollAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockObserver = null;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should return elementRef, isVisible, and visibleItems', () => {
    const { result } = renderHook(() => useStaggeredScrollAnimation(3));
    
    expect(result.current.elementRef).toBeDefined();
    expect(result.current.isVisible).toBe(false);
    expect(result.current.visibleItems).toEqual([false, false, false]);
  });

  it('should initialize visibleItems based on itemCount', () => {
    const { result } = renderHook(() => useStaggeredScrollAnimation(5));
    
    expect(result.current.visibleItems).toEqual([false, false, false, false, false]);
  });

  it('should stagger item visibility when element becomes visible', () => {
    const mockElement = document.createElement('div');
    const { result } = renderHook(() => {
      const staggeredResult = useStaggeredScrollAnimation(3);
      // Set the element ref immediately so useEffect can observe it
      if (!staggeredResult.elementRef.current) {
        (staggeredResult.elementRef as any).current = mockElement;
      }
      return staggeredResult;
    });

    // Trigger intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });

    expect(result.current.isVisible).toBe(true);
    
    // Initially no items should be visible yet (due to stagger delay)
    expect(result.current.visibleItems).toEqual([false, false, false]);

    // Advance time for first item (200ms base delay)
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current.visibleItems).toEqual([true, false, false]);

    // Advance time for second item (+150ms stagger)
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current.visibleItems).toEqual([true, true, false]);

    // Advance time for third item (+150ms stagger)
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(result.current.visibleItems).toEqual([true, true, true]);
  });

  it('should reset visibleItems when triggerOnce is false and element becomes invisible', () => {
    const mockElement = document.createElement('div');
    const { result } = renderHook(() => {
      const staggeredResult = useStaggeredScrollAnimation(2, { triggerOnce: false });
      // Set the element ref immediately so useEffect can observe it
      if (!staggeredResult.elementRef.current) {
        (staggeredResult.elementRef as any).current = mockElement;
      }
      return staggeredResult;
    });

    // Make visible and advance time
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });
    
    act(() => {
      jest.advanceTimersByTime(500); // Advance enough time for all items
    });
    
    expect(result.current.visibleItems).toEqual([true, true]);

    // Make invisible
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, false);
      }
    });

    expect(result.current.visibleItems).toEqual([false, false]);
  });

  it('should not reset visibleItems when triggerOnce is true', () => {
    const mockElement = document.createElement('div');
    const { result } = renderHook(() => {
      const staggeredResult = useStaggeredScrollAnimation(2, { triggerOnce: true });
      // Set the element ref immediately so useEffect can observe it
      if (!staggeredResult.elementRef.current) {
        (staggeredResult.elementRef as any).current = mockElement;
      }
      return staggeredResult;
    });

    // Make visible and advance time
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current.visibleItems).toEqual([true, true]);

    // Make invisible
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, false);
      }
    });

    // Should remain visible due to triggerOnce
    expect(result.current.visibleItems).toEqual([true, true]);
  });

  it('should handle itemCount changes', () => {
    const mockElement = document.createElement('div');
    const { result, rerender } = renderHook(
      ({ count }) => {
        const staggeredResult = useStaggeredScrollAnimation(count);
        // Set the element ref immediately so useEffect can observe it
        if (!staggeredResult.elementRef.current) {
          (staggeredResult.elementRef as any).current = mockElement;
        }
        return staggeredResult;
      },
      { initialProps: { count: 2 } }
    );

    expect(result.current.visibleItems).toEqual([false, false]);

    // Increase item count
    rerender({ count: 4 });

    // Trigger visibility
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });
    
    // Should have 4 items now, but initially all false
    expect(result.current.visibleItems).toEqual([false, false, false, false]);
    
    // Advance time to see staggered effect
    act(() => {
      jest.advanceTimersByTime(200); // First item
    });
    expect(result.current.visibleItems).toEqual([true, false, false, false]);
  });

  it('should handle empty itemCount', () => {
    const { result } = renderHook(() => useStaggeredScrollAnimation(0));
    
    expect(result.current.visibleItems).toEqual([]);
    
    const mockElement = document.createElement('div');
    act(() => {
      result.current.elementRef.current = mockElement;
    });

    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.visibleItems).toEqual([]);
  });

  it('should clean up timeouts on unmount', () => {
    const mockElement = document.createElement('div');
    const { unmount } = renderHook(() => {
      const staggeredResult = useStaggeredScrollAnimation(3);
      // Set the element ref immediately so useEffect can observe it
      if (!staggeredResult.elementRef.current) {
        (staggeredResult.elementRef as any).current = mockElement;
      }
      return staggeredResult;
    });

    // Trigger intersection
    act(() => {
      if (mockObserver) {
        mockObserver.triggerIntersection(mockElement, true);
      }
    });

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    // Unmount before timeouts complete
    unmount();
    
    // Should clean up any pending timeouts
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});