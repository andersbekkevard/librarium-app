/**
 * Error Boundary Component
 *
 * React Error Boundary that catches unhandled errors and displays
 * a consistent fallback UI using the standardized error system.
 */

import {
  ErrorCategory,
  ErrorContext,
  ErrorHandlerUtils,
  StandardError,
  errorLogger,
} from "@/lib/error-handling";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorBoundaryFallback } from "./error-display";

interface ErrorBoundaryState {
  hasError: boolean;
  error: StandardError | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    className?: string;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: ErrorContext;
  className?: string;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Convert the error to a standardized error
    const standardError = ErrorHandlerUtils.handleGenericError(
      error,
      {
        component: "ErrorBoundary",
        action: "render",
        timestamp: new Date(),
      },
      ErrorCategory.SYSTEM
    );

    return {
      hasError: true,
      error: standardError,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with context
    const context: ErrorContext = {
      ...this.props.context,
      component: "ErrorBoundary",
      action: "componentDidCatch",
      timestamp: new Date(),
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
      },
    };

    const standardError = ErrorHandlerUtils.handleGenericError(
      error,
      context,
      ErrorCategory.SYSTEM
    );

    // Log the error
    errorLogger.logError(standardError, context);

    // Update state with error info
    this.setState((prevState) => ({
      ...prevState,
      errorInfo,
    }));

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorBoundaryFallback;

      // Create a native Error object for the fallback component
      const nativeError =
        this.state.error.originalError || new Error(this.state.error.message);

      return (
        <FallbackComponent
          error={nativeError}
          resetError={this.resetError}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

/**
 * Hook for programmatically triggering error boundaries
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw the error during render to trigger the error boundary
  if (error) {
    throw error;
  }

  return {
    captureError,
    resetError,
  };
}

/**
 * Custom error boundary for async operations
 */
interface AsyncErrorBoundaryProps extends ErrorBoundaryProps {
  onAsyncError?: (error: StandardError) => void;
}

export class AsyncErrorBoundary extends ErrorBoundary {
  private asyncErrorHandler = (error: StandardError) => {
    const props = this.props as AsyncErrorBoundaryProps;

    // Update state to show error
    this.setState({
      hasError: true,
      error: error,
      errorInfo: null,
    });

    // Call optional async error handler
    if (props.onAsyncError) {
      props.onAsyncError(error);
    }
  };

  componentDidMount() {
    // Listen for unhandled promise rejections
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection
    );
  }

  componentWillUnmount() {
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection
    );
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const standardError = ErrorHandlerUtils.handleGenericError(
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "AsyncErrorBoundary",
        action: "unhandledRejection",
        timestamp: new Date(),
      },
      ErrorCategory.SYSTEM
    );

    this.asyncErrorHandler(standardError);

    // Prevent the default browser error handling
    event.preventDefault();
  };
}

/**
 * Provider for error boundary context
 */
const ErrorBoundaryContext = React.createContext<{
  captureError: (error: Error) => void;
  resetError: () => void;
} | null>(null);

export const ErrorBoundaryProvider: React.FC<{
  children: ReactNode;
  context?: ErrorContext;
}> = ({ children, context }) => {
  const { captureError, resetError } = useErrorBoundary();

  return (
    <ErrorBoundaryContext.Provider value={{ captureError, resetError }}>
      <ErrorBoundary context={context}>{children}</ErrorBoundary>
    </ErrorBoundaryContext.Provider>
  );
};

/**
 * Hook to access error boundary context
 */
export function useErrorBoundaryContext() {
  const context = React.useContext(ErrorBoundaryContext);
  if (!context) {
    throw new Error(
      "useErrorBoundaryContext must be used within an ErrorBoundaryProvider"
    );
  }
  return context;
}
