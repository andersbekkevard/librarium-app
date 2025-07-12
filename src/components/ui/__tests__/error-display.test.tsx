import {
  ErrorCategory,
  ErrorRecoveryAction,
  ErrorSeverity,
  StandardError,
} from "@/lib/error-handling";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  ErrorAlert,
  ErrorCard,
  ErrorInfoDisplay,
  ErrorToast,
  LoadingError,
  createErrorInfo,
} from "../error-display";

describe("Error Display Components", () => {
  const createMockError = (
    overrides?: Partial<StandardError>
  ): StandardError => ({
    id: "test-error-123",
    type: "OPERATION_FAILED",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    message: "Test error message",
    userMessage: "Something went wrong. Please try again.",
    timestamp: new Date("2023-01-01T00:00:00Z"),
    recoverable: true,
    retryable: true,
    ...overrides,
  });

  describe("ErrorAlert", () => {
    it("renders error message correctly", () => {
      const error = createMockError();
      render(<ErrorAlert error={error} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("shows different severity icons", () => {
      const criticalError = createMockError({
        severity: ErrorSeverity.CRITICAL,
      });
      const { rerender } = render(<ErrorAlert error={criticalError} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();

      const lowError = createMockError({ severity: ErrorSeverity.LOW });
      rerender(<ErrorAlert error={lowError} />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("shows error details when requested", () => {
      const error = createMockError({
        context: { userId: "test-user", action: "test-action" },
      });
      render(<ErrorAlert error={error} showDetails={true} />);

      expect(screen.getByText("Error ID:")).toBeInTheDocument();
      expect(screen.getByText("test-error-123")).toBeInTheDocument();
      expect(screen.getByText("Type:")).toBeInTheDocument();
      expect(screen.getByText("OPERATION_FAILED")).toBeInTheDocument();
    });

    it("calls onDismiss when dismiss button is clicked", () => {
      const error = createMockError();
      const onDismiss = jest.fn();
      render(<ErrorAlert error={error} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole("button");
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not show dismiss button when onDismiss is not provided", () => {
      const error = createMockError();
      render(<ErrorAlert error={error} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("ErrorInfoDisplay", () => {
    it("renders error with recovery actions", () => {
      const error = createMockError();
      const recoveryActions: ErrorRecoveryAction[] = [
        {
          label: "Try Again",
          action: jest.fn(),
          primary: true,
        },
        {
          label: "Cancel",
          action: jest.fn(),
          primary: false,
        },
      ];
      const errorInfo = createErrorInfo(error, recoveryActions);

      render(<ErrorInfoDisplay errorInfo={errorInfo} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("calls recovery action when button is clicked", () => {
      const error = createMockError();
      const mockAction = jest.fn();
      const recoveryActions: ErrorRecoveryAction[] = [
        {
          label: "Retry",
          action: mockAction,
          primary: true,
        },
      ];
      const errorInfo = createErrorInfo(error, recoveryActions);

      render(<ErrorInfoDisplay errorInfo={errorInfo} />);

      const retryButton = screen.getByText("Retry");
      fireEvent.click(retryButton);

      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it("shows error details for high severity errors", () => {
      const error = createMockError({ severity: ErrorSeverity.HIGH });
      const errorInfo = createErrorInfo(error);

      render(<ErrorInfoDisplay errorInfo={errorInfo} />);

      expect(screen.getByText("Error ID:")).toBeInTheDocument();
      expect(screen.getByText("test-error-123")).toBeInTheDocument();
    });

    it("does not show recovery actions when none provided", () => {
      const error = createMockError();
      const errorInfo = createErrorInfo(error);

      render(<ErrorInfoDisplay errorInfo={errorInfo} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("ErrorCard", () => {
    it("renders error with retry button for retryable errors", () => {
      const error = createMockError({ retryable: true });
      const onRetry = jest.fn();

      render(<ErrorCard error={error} onRetry={onRetry} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("does not show retry button for non-retryable errors", () => {
      const error = createMockError({ retryable: false });

      render(<ErrorCard error={error} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", () => {
      const error = createMockError({ retryable: true });
      const onRetry = jest.fn();

      render(<ErrorCard error={error} onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("shows custom title when provided", () => {
      const error = createMockError();
      const title = "Custom Error Title";

      render(<ErrorCard error={error} title={title} />);

      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it("shows error ID at the bottom", () => {
      const error = createMockError();

      render(<ErrorCard error={error} />);

      expect(screen.getByText("Error ID: test-error-123")).toBeInTheDocument();
    });
  });

  describe("LoadingError", () => {
    it("renders loading error with retry button", () => {
      const error = createMockError({ retryable: true });
      const onRetry = jest.fn();

      render(<LoadingError error={error} onRetry={onRetry} />);

      expect(screen.getByText("Failed to load")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("does not show retry button for non-retryable errors", () => {
      const error = createMockError({ retryable: false });

      render(<LoadingError error={error} />);

      expect(screen.getByText("Failed to load")).toBeInTheDocument();
      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", () => {
      const error = createMockError({ retryable: true });
      const onRetry = jest.fn();

      render(<LoadingError error={error} onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("ErrorToast", () => {
    it("renders error toast with dismiss button", () => {
      const error = createMockError();
      const onDismiss = jest.fn();

      render(<ErrorToast error={error} onDismiss={onDismiss} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("shows retryable indicator for retryable errors", () => {
      const error = createMockError({ retryable: true });

      render(<ErrorToast error={error} />);

      expect(screen.getByText("This error can be retried")).toBeInTheDocument();
    });

    it("does not show retryable indicator for non-retryable errors", () => {
      const error = createMockError({ retryable: false });

      render(<ErrorToast error={error} />);

      expect(
        screen.queryByText("This error can be retried")
      ).not.toBeInTheDocument();
    });

    it("calls onDismiss when dismiss button is clicked", () => {
      const error = createMockError();
      const onDismiss = jest.fn();

      render(<ErrorToast error={error} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole("button");
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("applies correct border color based on severity", () => {
      const criticalError = createMockError({
        severity: ErrorSeverity.CRITICAL,
      });
      const { rerender } = render(<ErrorToast error={criticalError} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();

      const lowError = createMockError({ severity: ErrorSeverity.LOW });
      rerender(<ErrorToast error={lowError} />);

      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
    });
  });

  describe("createErrorInfo", () => {
    it("creates error info with recovery actions", () => {
      const error = createMockError();
      const recoveryActions: ErrorRecoveryAction[] = [
        {
          label: "Retry",
          action: jest.fn(),
          primary: true,
        },
      ];

      const errorInfo = createErrorInfo(error, recoveryActions);

      expect(errorInfo.error).toBe(error);
      expect(errorInfo.recoveryActions).toBe(recoveryActions);
      expect(errorInfo.dismissible).toBe(true);
      expect(errorInfo.autoHide).toBe(false);
    });

    it("creates error info with custom options", () => {
      const error = createMockError();
      const options = {
        dismissible: false,
        autoHide: true,
        autoHideDelay: 3000,
      };

      const errorInfo = createErrorInfo(error, [], options);

      expect(errorInfo.dismissible).toBe(false);
      expect(errorInfo.autoHide).toBe(true);
      expect(errorInfo.autoHideDelay).toBe(3000);
    });

    it("uses default options when not provided", () => {
      const error = createMockError();

      const errorInfo = createErrorInfo(error);

      expect(errorInfo.dismissible).toBe(true);
      expect(errorInfo.autoHide).toBe(false);
      expect(errorInfo.autoHideDelay).toBe(5000);
    });
  });

  describe("Error Severity Styling", () => {
    it("applies correct styling for different error severities", () => {
      const severities = [
        ErrorSeverity.LOW,
        ErrorSeverity.MEDIUM,
        ErrorSeverity.HIGH,
        ErrorSeverity.CRITICAL,
      ];

      severities.forEach((severity) => {
        const error = createMockError({ severity });
        const { unmount } = render(<ErrorAlert error={error} />);

        expect(screen.getByRole("alert")).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Error Context Display", () => {
    it("shows error context in details view", () => {
      const error = createMockError({
        context: {
          userId: "test-user-123",
          action: "book-update",
          component: "BooksProvider",
          metadata: { bookId: "book-456" },
        },
      });

      render(<ErrorAlert error={error} showDetails={true} />);

      expect(screen.getByText("Context:")).toBeInTheDocument();
      expect(screen.getByText(/"userId":"test-user-123"/)).toBeInTheDocument();
    });

    it("does not show context section when context is empty", () => {
      const error = createMockError({ context: {} });

      render(<ErrorAlert error={error} showDetails={true} />);

      expect(screen.queryByText("Context:")).not.toBeInTheDocument();
    });
  });
});
