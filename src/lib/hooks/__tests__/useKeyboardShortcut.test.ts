import { renderHook } from '@testing-library/react';
import { useKeyboardShortcut, useCmdK } from '../useKeyboardShortcut';

// Mock navigator for Mac detection
const mockNavigator = (platform: string) => {
  Object.defineProperty(navigator, 'platform', {
    writable: true,
    configurable: true,
    value: platform,
  });
};

// Helper to create keyboard events
const createKeyboardEvent = (key: string, modifiers: Partial<{
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}> = {}) => {
  const event = new KeyboardEvent('keydown', {
    key,
    ctrlKey: modifiers.ctrlKey || false,
    metaKey: modifiers.metaKey || false,
    shiftKey: modifiers.shiftKey || false,
    altKey: modifiers.altKey || false,
    bubbles: true,
    cancelable: true,
  });
  
  // Add preventDefault spy
  jest.spyOn(event, 'preventDefault');
  return event;
};

describe('useKeyboardShortcut', () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockHandler = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call handler when correct key is pressed', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { key: 'Enter' }));

    const event = createKeyboardEvent('Enter');
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not call handler when different key is pressed', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { key: 'Enter' }));

    const event = createKeyboardEvent('Escape');
    document.dispatchEvent(event);

    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should handle key case insensitivity', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { key: 'k' }));

    const lowerEvent = createKeyboardEvent('k');
    const upperEvent = createKeyboardEvent('K');
    
    document.dispatchEvent(lowerEvent);
    document.dispatchEvent(upperEvent);

    expect(mockHandler).toHaveBeenCalledTimes(2);
  });

  it('should handle Ctrl+key combinations', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 's', 
      ctrlKey: true 
    }));

    // Should trigger with Ctrl+S
    const correctEvent = createKeyboardEvent('s', { ctrlKey: true });
    document.dispatchEvent(correctEvent);
    expect(mockHandler).toHaveBeenCalledTimes(1);

    // Should not trigger with just S
    const incorrectEvent = createKeyboardEvent('s');
    document.dispatchEvent(incorrectEvent);
    expect(mockHandler).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it('should handle Cmd+key combinations (metaKey)', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 's', 
      metaKey: true 
    }));

    const event = createKeyboardEvent('s', { metaKey: true });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should handle Shift+key combinations', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 'F1', 
      shiftKey: true 
    }));

    const event = createKeyboardEvent('F1', { shiftKey: true });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should handle Alt+key combinations', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 'Tab', 
      altKey: true 
    }));

    const event = createKeyboardEvent('Tab', { altKey: true });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should handle complex modifier combinations', () => {
    renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 'Delete',
      ctrlKey: true,
      shiftKey: true
    }));

    // Should trigger with Ctrl+Shift+Delete
    const correctEvent = createKeyboardEvent('Delete', { 
      ctrlKey: true, 
      shiftKey: true 
    });
    document.dispatchEvent(correctEvent);
    expect(mockHandler).toHaveBeenCalledTimes(1);

    // Should not trigger with just Ctrl+Delete
    const incorrectEvent = createKeyboardEvent('Delete', { ctrlKey: true });
    document.dispatchEvent(incorrectEvent);
    expect(mockHandler).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should respect preventDefault option', () => {
    // Test with preventDefault: false
    renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 'Enter',
      preventDefault: false
    }));

    const event = createKeyboardEvent('Enter');
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should respect enabled option', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useKeyboardShortcut(mockHandler, { 
        key: 'Enter',
        enabled
      }),
      { initialProps: { enabled: true } }
    );

    // Should work when enabled
    document.dispatchEvent(createKeyboardEvent('Enter'));
    expect(mockHandler).toHaveBeenCalledTimes(1);

    // Should not work when disabled
    rerender({ enabled: false });
    document.dispatchEvent(createKeyboardEvent('Enter'));
    expect(mockHandler).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should not add event listener when disabled', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 'Enter',
      enabled: false
    }));

    expect(addEventListenerSpy).not.toHaveBeenCalled();
    addEventListenerSpy.mockRestore();
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcut(mockHandler, { 
      key: 'Enter' 
    }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('should update handler reference correctly', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();

    const { rerender } = renderHook(
      ({ handler }) => useKeyboardShortcut(handler, { key: 'Enter' }),
      { initialProps: { handler: handler1 } }
    );

    document.dispatchEvent(createKeyboardEvent('Enter'));
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();

    rerender({ handler: handler2 });
    document.dispatchEvent(createKeyboardEvent('Enter'));
    expect(handler1).toHaveBeenCalledTimes(1); // Still 1
    expect(handler2).toHaveBeenCalledTimes(1); // New handler called
  });
});

describe('useCmdK', () => {
  let mockHandler: jest.Mock;

  beforeEach(() => {
    mockHandler = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use metaKey on Mac platforms', () => {
    mockNavigator('MacIntel');

    renderHook(() => useCmdK(mockHandler));

    // Should trigger with Cmd+K on Mac
    const event = createKeyboardEvent('k', { metaKey: true });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should use ctrlKey on non-Mac platforms', () => {
    mockNavigator('Win32');

    renderHook(() => useCmdK(mockHandler));

    // Should trigger with Ctrl+K on Windows
    const event = createKeyboardEvent('k', { ctrlKey: true });
    document.dispatchEvent(event);

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  it('should not trigger with wrong modifier on Mac', () => {
    mockNavigator('MacIntel');

    renderHook(() => useCmdK(mockHandler));

    // Should not trigger with Ctrl+K on Mac
    const event = createKeyboardEvent('k', { ctrlKey: true });
    document.dispatchEvent(event);

    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should not trigger with wrong modifier on Windows', () => {
    mockNavigator('Win32');

    renderHook(() => useCmdK(mockHandler));

    // Should not trigger with Cmd+K on Windows
    const event = createKeyboardEvent('k', { metaKey: true });
    document.dispatchEvent(event);

    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('should respect enabled parameter', () => {
    mockNavigator('MacIntel');

    const { rerender } = renderHook(
      ({ enabled }) => useCmdK(mockHandler, enabled),
      { initialProps: { enabled: true } }
    );

    // Should work when enabled
    document.dispatchEvent(createKeyboardEvent('k', { metaKey: true }));
    expect(mockHandler).toHaveBeenCalledTimes(1);

    // Should not work when disabled
    rerender({ enabled: false });
    document.dispatchEvent(createKeyboardEvent('k', { metaKey: true }));
    expect(mockHandler).toHaveBeenCalledTimes(1); // Still 1
  });

  it('should handle different Mac platform strings', () => {
    const macPlatforms = ['MacIntel', 'MacPPC', 'Mac68K'];
    
    macPlatforms.forEach(platform => {
      mockNavigator(platform);

      const { unmount } = renderHook(() => useCmdK(mockHandler));

      document.dispatchEvent(createKeyboardEvent('k', { metaKey: true }));
      expect(mockHandler).toHaveBeenCalled();

      unmount();
      mockHandler.mockClear();
    });
  });

  it('should handle undefined navigator', () => {
    const originalNavigator = navigator;
    // @ts-expect-error - testing edge case
    delete (global as any).navigator;

    const { unmount } = renderHook(() => useCmdK(mockHandler));

    // Should default to non-Mac behavior (Ctrl+K)
    document.dispatchEvent(createKeyboardEvent('k', { ctrlKey: true }));
    expect(mockHandler).toHaveBeenCalledTimes(1);

    unmount();
    (global as any).navigator = originalNavigator;
  });
});