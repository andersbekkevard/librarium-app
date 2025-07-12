import { AuthError } from "firebase/auth";
import { FirestoreError } from "firebase/firestore";
import {
  ErrorBuilder,
  ErrorCategory,
  ErrorHandlerUtils,
  ErrorSeverity,
  ProviderErrorType,
  createProviderError,
  createProviderSuccess,
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
      expect(error.category).toBe(ErrorCategory.UNKNOWN);
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
        expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
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
        expect(error.severity).toBe(ErrorSeverity.LOW);
      });

      it("handles already-exists error", () => {
        const firestoreError = {
          code: "already-exists",
          message: "Document already exists",
        } as FirestoreError;

        const error = ErrorHandlerUtils.handleFirestoreError(firestoreError);

        expect(error.userMessage).toBe("This item already exists.");
        expect(error.category).toBe(ErrorCategory.VALIDATION);
        expect(error.severity).toBe(ErrorSeverity.LOW);
      });

      it("handles unknown firestore errors", () => {
        const firestoreError = {
          code: "internal",
          message: "Unknown error",
          name: "FirestoreError",
        } as FirestoreError;

        const error = ErrorHandlerUtils.handleFirestoreError(firestoreError);

        expect(error.userMessage).toBe(
          "A database error occurred. Please try again."
        );
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
      });
    });

    describe("handleProviderError", () => {
      it("handles initialization failed error", () => {
        const context = { component: "TestProvider" };
        const error = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.INITIALIZATION_FAILED,
          "Init failed",
          context
        );

        expect(error.type).toBe(ProviderErrorType.INITIALIZATION_FAILED);
        expect(error.userMessage).toBe(
          "Failed to initialize. Please refresh the page."
        );
        expect(error.severity).toBe(ErrorSeverity.HIGH);
        expect(error.retryable).toBe(true);
        expect(error.context).toEqual(context);
      });

      it("handles subscription failed error", () => {
        const error = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.SUBSCRIPTION_FAILED,
          "Subscription failed"
        );

        expect(error.userMessage).toBe(
          "Connection lost. Data may not be up to date."
        );
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
      });

      it("handles timeout error", () => {
        const error = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.TIMEOUT,
          "Request timeout"
        );

        expect(error.userMessage).toBe("Request timed out. Please try again.");
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
      });

      it("includes original error when provided", () => {
        const originalError = new Error("Original error");
        const error = ErrorHandlerUtils.handleProviderError(
          ProviderErrorType.OPERATION_FAILED,
          "Operation failed",
          undefined,
          originalError
        );

        expect(error.originalError).toBe(originalError);
      });
    });

    describe("handleGenericError", () => {
      it("handles Error objects", () => {
        const originalError = new Error("Test error");
        const context = { component: "TestComponent" };

        const error = ErrorHandlerUtils.handleGenericError(
          originalError,
          context,
          ErrorCategory.BUSINESS_LOGIC
        );

        expect(error.message).toBe("Test error");
        expect(error.userMessage).toBe(
          "An unexpected error occurred. Please try again."
        );
        expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC);
        expect(error.context).toEqual(context);
        expect(error.originalError).toBe(originalError);
        expect(error.retryable).toBe(true);
      });

      it("handles string errors", () => {
        const error = ErrorHandlerUtils.handleGenericError("String error", {
          action: "test",
        });

        expect(error.message).toBe("String error");
        expect(error.userMessage).toBe(
          "An unexpected error occurred. Please try again."
        );
        expect(error.category).toBe(ErrorCategory.UNKNOWN);
        expect(error.originalError).toBeUndefined();
      });

      it("uses default category when not provided", () => {
        const error = ErrorHandlerUtils.handleGenericError("Test error");

        expect(error.category).toBe(ErrorCategory.UNKNOWN);
      });
    });

    describe("createValidationError", () => {
      it("creates validation error with field context", () => {
        const error = ErrorHandlerUtils.createValidationError(
          "email",
          "Email is required",
          { userId: "test-user" }
        );

        expect(error.category).toBe(ErrorCategory.VALIDATION);
        expect(error.userMessage).toBe("email: Email is required");
        expect(error.severity).toBe(ErrorSeverity.LOW);
        expect(error.context).toEqual({
          fieldName: "email",
          userId: "test-user",
        });
      });
    });

    describe("createNetworkError", () => {
      it("creates network error with default message", () => {
        const error = ErrorHandlerUtils.createNetworkError();

        expect(error.category).toBe(ErrorCategory.NETWORK);
        expect(error.userMessage).toBe(
          "Network error. Please check your connection and try again."
        );
        expect(error.severity).toBe(ErrorSeverity.MEDIUM);
        expect(error.retryable).toBe(true);
      });

      it("creates network error with custom message", () => {
        const error = ErrorHandlerUtils.createNetworkError("Connection failed");

        expect(error.userMessage).toBe(
          "Network error. Please check your connection and try again."
        );
      });
    });

    describe("createBusinessLogicError", () => {
      it("creates business logic error", () => {
        const error = ErrorHandlerUtils.createBusinessLogicError(
          "Invalid operation",
          "You cannot perform this action",
          { action: "delete" }
        );

        expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC);
        expect(error.message).toBe("Invalid operation");
        expect(error.userMessage).toBe("You cannot perform this action");
        expect(error.context).toEqual({ action: "delete" });
      });
    });
  });

  describe("Provider Result Patterns", () => {
    describe("createProviderSuccess", () => {
      it("creates successful provider result", () => {
        const data = { id: "test", name: "Test" };
        const result = createProviderSuccess(data);

        expect(result.success).toBe(true);
        expect(result.data).toBe(data);
        expect(result.error).toBeUndefined();
      });

      it("handles null data", () => {
        const result = createProviderSuccess(null);

        expect(result.success).toBe(true);
        expect(result.data).toBe(null);
      });

      it("handles undefined data", () => {
        const result = createProviderSuccess(undefined);

        expect(result.success).toBe(true);
        expect(result.data).toBe(undefined);
      });
    });

    describe("createProviderError", () => {
      it("creates error provider result", () => {
        const error = new ErrorBuilder("Test error").build();
        const result = createProviderError(error);

        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.error).toBe(error);
      });
    });
  });

  describe("Safe Operations", () => {
    describe("safeAsyncOperation", () => {
      it("returns success for successful async operation", async () => {
        const operation = jest.fn().mockResolvedValue("success");
        const result = await safeAsyncOperation(operation);

        expect(result.success).toBe(true);
        expect(result.data).toBe("success");
        expect(result.error).toBeUndefined();
        expect(operation).toHaveBeenCalledTimes(1);
      });

      it("returns error for failed async operation", async () => {
        const operation = jest.fn().mockRejectedValue(new Error("Async error"));
        const context = { component: "TestComponent" };

        const result = await safeAsyncOperation(
          operation,
          context,
          ErrorCategory.BUSINESS_LOGIC
        );

        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe("Async error");
        expect(result.error?.category).toBe(ErrorCategory.BUSINESS_LOGIC);
        expect(result.error?.context).toEqual(context);
      });

      it("uses default error category", async () => {
        const operation = jest.fn().mockRejectedValue(new Error("Test error"));
        const result = await safeAsyncOperation(operation);

        expect(result.success).toBe(false);
        expect(result.error?.category).toBe(ErrorCategory.UNKNOWN);
      });
    });

    describe("safeSyncOperation", () => {
      it("returns success for successful sync operation", () => {
        const operation = jest.fn().mockReturnValue("success");
        const result = safeSyncOperation(operation);

        expect(result.success).toBe(true);
        expect(result.data).toBe("success");
        expect(result.error).toBeUndefined();
        expect(operation).toHaveBeenCalledTimes(1);
      });

      it("returns error for failed sync operation", () => {
        const operation = jest.fn().mockImplementation(() => {
          throw new Error("Sync error");
        });
        const context = { component: "TestComponent" };

        const result = safeSyncOperation(
          operation,
          context,
          ErrorCategory.VALIDATION
        );

        expect(result.success).toBe(false);
        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe("Sync error");
        expect(result.error?.category).toBe(ErrorCategory.VALIDATION);
        expect(result.error?.context).toEqual(context);
      });

      it("uses default error category", () => {
        const operation = jest.fn().mockImplementation(() => {
          throw new Error("Test error");
        });
        const result = safeSyncOperation(operation);

        expect(result.success).toBe(false);
        expect(result.error?.category).toBe(ErrorCategory.UNKNOWN);
      });
    });
  });

  describe("Error Enums", () => {
    it("has all expected error severities", () => {
      expect(ErrorSeverity.LOW).toBe("low");
      expect(ErrorSeverity.MEDIUM).toBe("medium");
      expect(ErrorSeverity.HIGH).toBe("high");
      expect(ErrorSeverity.CRITICAL).toBe("critical");
    });

    it("has all expected error categories", () => {
      expect(ErrorCategory.AUTHENTICATION).toBe("authentication");
      expect(ErrorCategory.AUTHORIZATION).toBe("authorization");
      expect(ErrorCategory.VALIDATION).toBe("validation");
      expect(ErrorCategory.NETWORK).toBe("network");
      expect(ErrorCategory.BUSINESS_LOGIC).toBe("business_logic");
      expect(ErrorCategory.EXTERNAL_API).toBe("external_api");
      expect(ErrorCategory.SYSTEM).toBe("system");
      expect(ErrorCategory.USER_INPUT).toBe("user_input");
      expect(ErrorCategory.UNKNOWN).toBe("unknown");
    });

    it("has all expected provider error types", () => {
      expect(ProviderErrorType.INITIALIZATION_FAILED).toBe(
        "initialization_failed"
      );
      expect(ProviderErrorType.SUBSCRIPTION_FAILED).toBe("subscription_failed");
      expect(ProviderErrorType.STATE_UPDATE_FAILED).toBe("state_update_failed");
      expect(ProviderErrorType.OPERATION_FAILED).toBe("operation_failed");
      expect(ProviderErrorType.TIMEOUT).toBe("timeout");
      expect(ProviderErrorType.UNKNOWN).toBe("unknown");
    });
  });
});
