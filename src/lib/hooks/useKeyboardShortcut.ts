"use client";

import { useEffect, useCallback } from "react";

type KeyboardShortcutHandler = () => void;

interface UseKeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 * @param handler - Function to call when shortcut is pressed
 * @param options - Keyboard shortcut configuration
 */
export const useKeyboardShortcut = (
  handler: KeyboardShortcutHandler,
  options: UseKeyboardShortcutOptions
) => {
  const {
    key,
    ctrlKey = false,
    metaKey = false,
    shiftKey = false,
    altKey = false,
    preventDefault = true,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const isCorrectKey = event.key.toLowerCase() === key.toLowerCase();
      const isCorrectModifiers =
        event.ctrlKey === ctrlKey &&
        event.metaKey === metaKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey;

      if (isCorrectKey && isCorrectModifiers) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler();
      }
    },
    [handler, key, ctrlKey, metaKey, shiftKey, altKey, preventDefault, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
};

/**
 * Hook specifically for Cmd+K (or Ctrl+K on Windows/Linux)
 * @param handler - Function to call when Cmd+K is pressed
 * @param enabled - Whether the shortcut is enabled
 */
export const useCmdK = (handler: KeyboardShortcutHandler, enabled = true) => {
  // Detect platform - on Mac use metaKey (Cmd), on others use ctrlKey
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  useKeyboardShortcut(handler, {
    key: "k",
    ctrlKey: !isMac, // Use Ctrl on non-Mac
    metaKey: isMac,  // Use Cmd on Mac
    enabled,
  });
};