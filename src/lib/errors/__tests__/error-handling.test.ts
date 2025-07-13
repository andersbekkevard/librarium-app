import { AuthError } from "firebase/auth";
import { FirestoreError } from "firebase/firestore";
import {
  ErrorBuilder,
  ErrorCategory,
  ErrorHandlerUtils,
  ErrorSeverity,
  createAuthError,
  createNetworkError,
  createProviderError,
  createProviderSuccess,
  createSystemError,
  createValidationError,
  safeAsyncOperation,
  safeSyncOperation,
} from "../error-handling";

describe("Error Handling System", () => {
  describe("ErrorBuilder", () => {
    it("creates a basic error with default values", () => {
      const error = new ErrorBuilder("Test error").build();

      expect(error.message).toBe("Test error");
      expect(error.userMessage).toBe("Test error");
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.category).toBe(ErrorCategory.SYSTEM);
      expect(error.recoverable).toBe(true);
      expect(error.retryable).toBe(false);
      expect(error.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it("allows customizing all error properties", () => {
      const context = { userId: "test-user" };
      const originalError = new Error("Original error");

      const error = new ErrorBuilder("Test error")
        .withType("TEST_ERROR")
        .withCategory(ErrorCategory.VALIDATION)
        .withSeverity(ErrorSeverity.HIGH)
        .withUserMessage("User-friendly message")
        .withContext(context)
        .withOriginalError(originalError)
        .notRecoverable()
        .retryable()
        .build();

      expect(error.type).toBe("TEST_ERROR");
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.userMessage).toBe("User-friendly message");
      expect(error.context).toEqual(context);
      expect(error.originalError).toBe(originalError);
      expect(error.stack).toBe(originalError.stack);
      expect(error.recoverable).toBe(false);
      expect(error.retryable).toBe(true);
    });

    it("merges context when called multiple times", () => {
      const error = new ErrorBuilder("Test error")
        .withContext({ userId: "test-user" })
        .withContext({ action: "test-action" })
        .build();

      expect(error.context).toEqual({
        userId: "test-user",
        action: "test-action",
      });
    });

    it("generates unique error IDs", () => {
      const error1 = new ErrorBuilder("Test error 1").build();
      const error2 = new ErrorBuilder("Test error 2").build();

      expect(error1.id).not.toBe(error2.id);
    });
  });

  describe("ErrorHandlerUtils", () => {
    describe("handleFirebaseAuthError", () => {
      it("handles popup-blocked error", () => {
        const authError = {
          code: "auth/popup-blocked",
          message: "Popup blocked",
        } as AuthError;

        const error = ErrorHandlerUtils.handleFirebaseAuthError(authError);

        expect(error.type).toBe("auth/popup-blocked");
        expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
        expect(error.userMessage).toBe(
          "Popup was blocked by your browser. Please allow popups and try again."
        );
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
        expect(error.originalError).toBe(authError);
      });

      it("handles popup-closed-by-user error", () => {
        const authError = {
          code: "auth/popup-closed-by-user",
          message: "Popup closed",
        } as AuthError;

        const error = ErrorHandlerUtils.handleFirebaseAuthError(authError);

        expect(error.userMessage).toBe(
          "Sign-in was cancelled. Please try again."
        );
        expect(error.severity).toBe(ErrorSeverity.LOW);
        expect(error.retryable).toBe(true);
      });

      it("handles network-request-failed error", () => {
        const authError = {
          code: "auth/network-request-failed",
          message: "Network error",
        } as AuthError;

        const error = ErrorHandlerUtils.handleFirebaseAuthError(authError);

        expect(error.userMessage).toBe(
          "Network error. Please check your connection and try again."
        );
        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
      });

      it("handles too-many-requests error", () => {
        const authError = {
          code: "auth/too-many-requests",
          message: "Too many requests",
        } as AuthError;

        const error = ErrorHandlerUtils.handleFirebaseAuthError(authError);

        expect(error.userMessage).toBe(
          "Too many failed attempts. Please try again later."
        );
        expect(error.severity).toBe(ErrorSeverity.HIGH);
        expect(error.retryable).toBe(false);
      });

      it("handles unknown auth errors", () => {
        const authError = {
          code: "auth/unknown-error",
          message: "Unknown error",
        } as AuthError;

        const error = ErrorHandlerUtils.handleFirebaseAuthError(authError);

        expect(error.userMessage).toBe(
          "Authentication failed. Please try again."
        );
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
      });
    });

    describe("handleFirestoreError", () => {
      it("handles permission-denied error", () => {
        const firestoreError = {
          code: "permission-denied",
          message: "Permission denied",
        } as FirestoreError;

        const error = ErrorHandlerUtils.handleFirestoreError(firestoreError);

        expect(error.type).toBe("permission-denied");
        expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
        expect(error.userMessage).toBe(
          "You don't have permission to access this data."
        );
        expect(error.severity).toBe(ErrorSeverity.HIGH);
        expect(error.recoverable).toBe(false);
      });

      it("handles unavailable error", () => {
        const firestoreError = {
          code: "unavailable",
          message: "Service unavailable",
        } as FirestoreError;

        const error = ErrorHandlerUtils.handleFirestoreError(firestoreError);

        expect(error.userMessage).toBe(
          "Service temporarily unavailable. Please try again."
        );
        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.retryable).toBe(true);
      });

      it("handles not-found error", () => {
        const firestoreError = {
          code: "not-found",
          message: "Document not found",
        } as FirestoreError;

        const error = ErrorHandlerUtils.handleFirestoreError(firestoreError);

        expect(error.userMessage).toBe(
          "The requested data could not be found."
        );
      });

      it("handles already-exists error", () => {
        const firestoreError = {
          code: "already-exists",
          message: "Document already exists",
        } as FirestoreError;

        const error = ErrorHandlerUtils.handleFirestoreError(firestoreError);

        expect(error.userMessage).toBe("This item already exists.");
        expect(error.category).toBe(ErrorCategory.VALIDATION);
      });

      it("handles unknown firestore errors", () => {
        const firestoreError = {
          code: "unknown",
          message: "Unknown error",
        } as FirestoreError;

        const error = ErrorHandlerUtils.handleFirestoreError(firestoreError);

        expect(error.userMessage).toBe(
          "A database error occurred. Please try again."
        );
        expect(error.retryable).toBe(true);
      });
    });

    describe("handleGenericError", () => {
      it("handles Error objects", () => {
        const originalError = new Error("Test error");
        const context = { userId: "test-user" };

        const error = ErrorHandlerUtils.handleGenericError(
          originalError,
          context,
          ErrorCategory.VALIDATION
        );

        expect(error.message).toBe("Test error");
        expect(error.category).toBe(ErrorCategory.VALIDATION);
        expect(error.context).toEqual(context);
        expect(error.originalError).toBe(originalError);
        expect(error.userMessage).toBe(
          "An unexpected error occurred. Please try again."
        );
      });

      it("handles string errors", () => {
        const errorMessage = "String error";
        const context = { action: "test" };

        const error = ErrorHandlerUtils.handleGenericError(
          errorMessage,
          context,
          ErrorCategory.NETWORK
        );

        expect(error.message).toBe(errorMessage);
        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.context).toEqual(context);
        expect(error.originalError).toBeUndefined();
      });

      it("uses default category when not provided", () => {
        const error = ErrorHandlerUtils.handleGenericError("Test error");

        expect(error.category).toBe(ErrorCategory.SYSTEM);
      });
    });

    describe("createValidationError", () => {
      it("creates validation error with field name", () => {
        const error = ErrorHandlerUtils.createValidationError(
          "email",
          "Invalid email format"
        );

        expect(error.category).toBe(ErrorCategory.VALIDATION);
        expect(error.severity).toBe(ErrorSeverity.LOW);
        expect(error.userMessage).toBe("email: Invalid email format");
        expect(error.context).toEqual({ fieldName: "email" });
      });
    });

    describe("createNetworkError", () => {
      it("creates network error with default message", () => {
        const error = ErrorHandlerUtils.createNetworkError();

        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.userMessage).toBe(
          "Network error. Please check your connection and try again."
        );
        expect(error.retryable).toBe(true);
      });

      it("creates network error with custom message", () => {
        const error =
          ErrorHandlerUtils.createNetworkError("Connection timeout");

        expect(error.message).toBe("Connection timeout");
        expect(error.category).toBe(ErrorCategory.NETWORK);
      });
    });
  });

  describe("Convenience Functions", () => {
    describe("createValidationError", () => {
      it("creates validation error with default user message", () => {
        const error = createValidationError("Test validation error");

        expect(error.category).toBe(ErrorCategory.VALIDATION);
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.userMessage).toBe("Test validation error");
      });

      it("creates validation error with custom user message", () => {
        const error = createValidationError(
          "Technical message",
          "User-friendly message"
        );

        expect(error.message).toBe("Technical message");
        expect(error.userMessage).toBe("User-friendly message");
      });
    });

    describe("createNetworkError", () => {
      it("creates network error with default user message", () => {
        const error = createNetworkError("Connection failed");

        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
        expect(error.userMessage).toBe(
          "Please check your connection and try again"
        );
      });

      it("creates network error with custom user message", () => {
        const error = createNetworkError("Timeout", "Request timed out");

        expect(error.message).toBe("Timeout");
        expect(error.userMessage).toBe("Request timed out");
      });
    });

    describe("createAuthError", () => {
      it("creates auth error with default user message", () => {
        const error = createAuthError("Invalid credentials");

        expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
        expect(error.severity).toBe(ErrorSeverity.HIGH);
        expect(error.userMessage).toBe("Authentication failed");
      });

      it("creates auth error with custom user message", () => {
        const error = createAuthError("Token expired", "Please sign in again");

        expect(error.message).toBe("Token expired");
        expect(error.userMessage).toBe("Please sign in again");
      });
    });

    describe("createSystemError", () => {
      it("creates system error without original error", () => {
        const error = createSystemError("Database connection failed");

        expect(error.category).toBe(ErrorCategory.SYSTEM);
        expect(error.severity).toBe(ErrorSeverity.HIGH);
        expect(error.userMessage).toBe("An unexpected error occurred");
        expect(error.originalError).toBeUndefined();
      });

      it("creates system error with original error", () => {
        const originalError = new Error("Database timeout");
        const error = createSystemError("System failure", originalError);

        expect(error.message).toBe("System failure");
        expect(error.originalError).toBe(originalError);
      });
    });
  });

  describe("Provider Result Helpers", () => {
    describe("createProviderSuccess", () => {
      it("creates successful provider result", () => {
        const data = { id: "123", name: "Test" };
        const result = createProviderSuccess(data);

        expect(result.success).toBe(true);
        expect(result.data).toBe(data);
        expect(result.error).toBeUndefined();
      });
    });

    describe("createProviderError", () => {
      it("creates error provider result", () => {
        const error = createSystemError("Test error");
        const result = createProviderError(error);

        expect(result.success).toBe(false);
        expect(result.error).toBe(error);
        expect(result.data).toBeUndefined();
      });
    });
  });

  describe("Safe Operation Wrappers", () => {
    describe("safeAsyncOperation", () => {
      it("returns success result for successful operation", async () => {
        const operation = async () => "success";
        const result = await safeAsyncOperation(operation);

        expect(result.success).toBe(true);
        expect(result.data).toBe("success");
        expect(result.error).toBeUndefined();
      });

      it("returns error result for failed operation", async () => {
        const operation = async () => {
          throw new Error("Operation failed");
        };
        const result = await safeAsyncOperation(operation);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error?.category).toBe(ErrorCategory.SYSTEM);
        expect(result.data).toBeUndefined();
      });

      it("uses custom error category", async () => {
        const operation = async () => {
          throw new Error("Validation failed");
        };
        const result = await safeAsyncOperation(
          operation,
          undefined,
          ErrorCategory.VALIDATION
        );

        expect(result.success).toBe(false);
        expect(result.error?.category).toBe(ErrorCategory.VALIDATION);
      });
    });

    describe("safeSyncOperation", () => {
      it("returns success result for successful operation", () => {
        const operation = () => "success";
        const result = safeSyncOperation(operation);

        expect(result.success).toBe(true);
        expect(result.data).toBe("success");
        expect(result.error).toBeUndefined();
      });

      it("returns error result for failed operation", () => {
        const operation = () => {
          throw new Error("Operation failed");
        };
        const result = safeSyncOperation(operation);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error?.category).toBe(ErrorCategory.SYSTEM);
        expect(result.data).toBeUndefined();
      });
    });
  });
});
