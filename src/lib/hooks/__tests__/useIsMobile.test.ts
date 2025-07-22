import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../useIsMobile';

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock resize event
const fireResizeEvent = () => {
  window.dispatchEvent(new Event('resize'));
};

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset to default desktop width
    mockInnerWidth(1024);
  });

  afterEach(() => {
    // Clean up any event listeners
    jest.clearAllMocks();
  });

  it('should return false for desktop width by default', () => {
    mockInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should return true for mobile width by default', () => {
    mockInnerWidth(600);
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should use default breakpoint of 768px', () => {
    // Test just below breakpoint
    mockInnerWidth(767);
    const { result: resultMobile } = renderHook(() => useIsMobile());
    expect(resultMobile.current).toBe(true);

    // Test at breakpoint
    mockInnerWidth(768);
    const { result: resultDesktop } = renderHook(() => useIsMobile());
    expect(resultDesktop.current).toBe(false);
  });

  it('should accept custom breakpoint', () => {
    const customBreakpoint = 1200;
    
    // Test below custom breakpoint
    mockInnerWidth(1199);
    const { result: resultMobile } = renderHook(() => useIsMobile(customBreakpoint));
    expect(resultMobile.current).toBe(true);

    // Test at custom breakpoint
    mockInnerWidth(1200);
    const { result: resultDesktop } = renderHook(() => useIsMobile(customBreakpoint));
    expect(resultDesktop.current).toBe(false);
  });

  it('should respond to window resize events', () => {
    mockInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    
    // Initially desktop
    expect(result.current).toBe(false);

    // Resize to mobile
    act(() => {
      mockInnerWidth(600);
      fireResizeEvent();
    });
    
    expect(result.current).toBe(true);

    // Resize back to desktop
    act(() => {
      mockInnerWidth(1024);
      fireResizeEvent();
    });
    
    expect(result.current).toBe(false);
  });

  it('should respond to breakpoint changes', () => {
    mockInnerWidth(900);
    const { result, rerender } = renderHook(
      ({ breakpoint }) => useIsMobile(breakpoint),
      { initialProps: { breakpoint: 768 } }
    );

    // With 768 breakpoint, 900 should be desktop
    expect(result.current).toBe(false);

    // Change breakpoint to 1000
    rerender({ breakpoint: 1000 });
    
    // Now 900 should be mobile
    expect(result.current).toBe(true);
  });

  it('should add and remove resize event listener', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useIsMobile());

    // Check event listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    // Unmount and check event listener was removed
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('should handle multiple resize events correctly', () => {
    mockInnerWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);

    // Multiple rapid resize events
    act(() => {
      mockInnerWidth(500);
      fireResizeEvent();
      fireResizeEvent();
      fireResizeEvent();
    });
    
    expect(result.current).toBe(true);
  });

  it('should handle edge case widths', () => {
    // Test width of 0
    mockInnerWidth(0);
    const { result: zeroResult } = renderHook(() => useIsMobile());
    expect(zeroResult.current).toBe(true);

    // Test very large width
    mockInnerWidth(9999);
    const { result: largeResult } = renderHook(() => useIsMobile());
    expect(largeResult.current).toBe(false);
  });

  it('should work with different breakpoint values', () => {
    const testCases = [
      { breakpoint: 320, width: 319, expected: true },
      { breakpoint: 320, width: 320, expected: false },
      { breakpoint: 640, width: 639, expected: true },
      { breakpoint: 640, width: 641, expected: false },
      { breakpoint: 1024, width: 1023, expected: true },
      { breakpoint: 1024, width: 1024, expected: false },
    ];

    testCases.forEach(({ breakpoint, width, expected }) => {
      mockInnerWidth(width);
      const { result } = renderHook(() => useIsMobile(breakpoint));
      expect(result.current).toBe(expected);
    });
  });
});