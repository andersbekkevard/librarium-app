/**
 * Firebase Repository Utilities
 *
 * Shared utilities for Firebase repository implementations.
 * Centralizes common logic to avoid duplication across repositories.
 */

import { RepositoryError, RepositoryErrorType } from "./types";

/**
 * Filters out undefined values from data for Firebase compatibility
 * Firebase Firestore doesn't allow undefined values in documents
 */
export function filterUndefinedValues<T extends Record<string, any>>(
  data: T
): Partial<T> {
  const filtered: Partial<T> = {};

  // Handle both string and symbol keys
  const keys = [...Object.keys(data), ...Object.getOwnPropertySymbols(data)];
  
  keys.forEach((key) => {
    const value = data[key as keyof T];
    if (value !== undefined) {
      filtered[key as keyof T] = value;
    }
  });

  return filtered;
}

/**
 * Convert Firebase errors to repository errors
 * Provides consistent error handling across all Firebase repositories
 */
export function handleFirebaseError(
  error: any,
  context: string = "collection"
): RepositoryError {
  // Handle null, undefined, or string errors
  if (!error || typeof error === 'string') {
    return new RepositoryError(
      RepositoryErrorType.UNKNOWN_ERROR,
      `Database error: ${error || 'Unknown error'}`,
      error
    );
  }

  if (error.code === "permission-denied") {
    return new RepositoryError(
      RepositoryErrorType.PERMISSION_DENIED,
      `Access denied to ${context}`,
      error
    );
  }

  if (error.code === "unavailable" || error.code === "deadline-exceeded") {
    return new RepositoryError(
      RepositoryErrorType.NETWORK_ERROR,
      `Network error accessing ${context}`,
      error
    );
  }

  return new RepositoryError(
    RepositoryErrorType.UNKNOWN_ERROR,
    `Database error: ${error.message || 'Unknown error'}`,
    error
  );
}
