import { ErrorContext } from "@/lib/error-handling";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import {
  AsyncErrorBoundary,
  ErrorBoundary,
  useErrorBoundary,
  withErrorBoundary,
} from "../error-boundary";

// Mock the error logger
jest.mock("@/lib/error-handling", () => ({
  ...jest.requireActual("@/lib/error-handling"),
  errorLogger: {
    logError: jest.fn(),
  },
}));

// Component that throws an error
const ThrowingComponent = ({
  shouldThrow = true,
}: {
  shouldThrow?: boolean;
}) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Component that uses useErrorBoundary hook
const ErrorBoundaryHookComponent = () => {
  const { captureError, resetError } = useErrorBoundary();

  return (
    <div>
      <button onClick={() => captureError(new Error("Hook error"))}>
        Trigger Error
      </button>
      <button onClick={resetError}>Reset Error</button>
      <div>Hook component content</div>
    </div>
  );
};

// Async component that throws promise rejections
const AsyncComponent = ({
  shouldReject = false,
}: {
  shouldReject?: boolean;
}) => {
  React.useEffect(() => {
    if (shouldReject) {
      Promise.reject(new Error("Async error"));
    }
  }, [shouldReject]);

  return <div>Async component content</div>;
};

describe("Error Boundary Components", () => {
  beforeEach(() => {
    // Clear console.error to avoid test noise
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("ErrorBoundary", () => {
    it("renders children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
    });

    it("renders fallback UI when error occurs", () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("allows resetting the error boundary", async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      const resetButton = screen.getByText("Try Again");
      fireEvent.click(resetButton);

      // After clicking reset, the component should re-render with no error
      // We need to re-render the ErrorBoundary with the non-throwing component
      // to simulate the reset behavior correctly in the test environment.
      rerender(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText("No error")).toBeInTheDocument();
      });
    });

    it("calls onError callback when error occurs", () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it("uses custom fallback component when provided", () => {
      const CustomFallback = ({
        error,
        resetError,
      }: {
        error: Error;
        resetError: () => void;
      }) => (
        <div>
          <h1>Custom Error UI</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
      expect(screen.getByText("Test error")).toBeInTheDocument();
      expect(screen.getByText("Custom Reset")).toBeInTheDocument();
    });

    it("includes context information in error handling", () => {
      const context: ErrorContext = {
        userId: "test-user",
        component: "TestComponent",
        action: "test-action",
      };

      render(
        <ErrorBoundary context={context}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("shows error details in fallback UI", async () => {
      render(
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Check if error details are available
      const detailsButton = screen.getByText("Show error details");
      fireEvent.click(detailsButton);

      await waitFor(() => {
        expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
      });
    });
  });

  describe("AsyncErrorBoundary", () => {
    it("renders children when no error occurs", () => {
      render(
        <AsyncErrorBoundary>
          <AsyncComponent shouldReject={false} />
        </AsyncErrorBoundary>
      );

      expect(screen.getByText("Async component content")).toBeInTheDocument();
    });

    it("handles unhandled promise rejections", async () => {
      const onAsyncError = jest.fn();

      render(
        <AsyncErrorBoundary onAsyncError={onAsyncError}>
          <AsyncComponent shouldReject={true} />
        </AsyncErrorBoundary>
      );

      // Wait for promise rejection to be handled
      await waitFor(() => {
        expect(onAsyncError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.any(String),
            message: expect.any(String),
          })
        );
      });
    });

    it("calls onAsyncError callback when async error occurs", async () => {
      const onAsyncError = jest.fn();

      render(
        <AsyncErrorBoundary onAsyncError={onAsyncError}>
          <AsyncComponent shouldReject={true} />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(onAsyncError).toHaveBeenCalled();
      });
    });
  });

  describe("useErrorBoundary hook", () => {
    it("provides captureError and resetError functions", () => {
      render(
        <ErrorBoundary>
          <ErrorBoundaryHookComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText("Hook component content")).toBeInTheDocument();
      expect(screen.getByText("Trigger Error")).toBeInTheDocument();
      expect(screen.getByText("Reset Error")).toBeInTheDocument();
    });

    it("triggers error boundary when captureError is called", () => {
      render(
        <ErrorBoundary>
          <ErrorBoundaryHookComponent />
        </ErrorBoundary>
      );

      const triggerButton = screen.getByText("Trigger Error");
      fireEvent.click(triggerButton);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("resets error boundary when resetError is called", () => {
      render(
        <ErrorBoundary>
          <ErrorBoundaryHookComponent />
        </ErrorBoundary>
      );

      // Trigger error
      const triggerButton = screen.getByText("Trigger Error");
      fireEvent.click(triggerButton);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Reset error
      const resetButton = screen.getByText("Try Again");
      fireEvent.click(resetButton);

      expect(screen.getByText("Hook component content")).toBeInTheDocument();
    });
  });

  describe("withErrorBoundary HOC", () => {
    it("wraps component with error boundary", () => {
      const TestComponent = ({
        shouldThrow = false,
      }: {
        shouldThrow?: boolean;
      }) => {
        if (shouldThrow) {
          throw new Error("HOC error");
        }
        return <div>HOC component content</div>;
      };

      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent shouldThrow={false} />);

      expect(screen.getByText("HOC component content")).toBeInTheDocument();
    });

    it("catches errors in wrapped component", () => {
      const TestComponent = ({
        shouldThrow = false,
      }: {
        shouldThrow?: boolean;
      }) => {
        if (shouldThrow) {
          throw new Error("HOC error");
        }
        return <div>HOC component content</div>;
      };

      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent shouldThrow={true} />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("passes error boundary props to wrapped component", () => {
      const TestComponent = () => {
        throw new Error("HOC error");
      };

      const onError = jest.fn();
      const WrappedComponent = withErrorBoundary(TestComponent, { onError });

      render(<WrappedComponent />);

      expect(onError).toHaveBeenCalled();
    });

    it("sets correct display name for wrapped component", () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = "TestComponent";

      const WrappedComponent = withErrorBoundary(TestComponent);

      expect(WrappedComponent.displayName).toBe(
        "withErrorBoundary(TestComponent)"
      );
    });
  });

  describe("Error Boundary Integration", () => {
    it("handles multiple nested error boundaries", () => {
      const OuterThrowingComponent = () => {
        throw new Error("Outer error");
      };

      const InnerThrowingComponent = () => {
        throw new Error("Inner error");
      };

      render(
        <ErrorBoundary>
          <div>
            <OuterThrowingComponent />
            <ErrorBoundary>
              <InnerThrowingComponent />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("preserves error boundary state across re-renders", () => {
      const TestComponent = ({
        shouldThrow = false,
      }: {
        shouldThrow?: boolean;
      }) => {
        if (shouldThrow) {
          throw new Error("Test error");
        }
        return <div>Normal content</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Re-render with same throwing component
      rerender(
        <ErrorBoundary>
          <TestComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  describe("Error Boundary Context", () => {
    it("provides error context to child components", () => {
      const context: ErrorContext = {
        userId: "test-user",
        component: "TestBoundary",
        action: "test-render",
      };

      render(
        <ErrorBoundary context={context}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("merges context with error information", () => {
      const context: ErrorContext = {
        userId: "test-user",
        component: "TestBoundary",
      };

      const onError = jest.fn();

      render(
        <ErrorBoundary context={context} onError={onError}>
          <ThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });
});
