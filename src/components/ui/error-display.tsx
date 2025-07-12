/**
 * Error Display Components
 *
 * Provides consistent error feedback UI components using the standardized
 * error handling system.
 */

import { STATUS_COLORS } from "@/lib/colors";
import {
  ErrorInfo,
  ErrorRecoveryAction,
  ErrorSeverity,
  StandardError,
} from "@/lib/error-handling";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from "lucide-react";
import React from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

/**
 * Error alert component props
 */
interface ErrorAlertProps {
  error: StandardError;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

/**
 * Error alert component for displaying standardized errors
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onDismiss,
  className,
  showDetails = false,
}) => {
  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="h-4 w-4" />;
      case ErrorSeverity.MEDIUM:
        return <AlertCircle className="h-4 w-4" />;
      case ErrorSeverity.LOW:
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return {
          container: `${STATUS_COLORS.error.bgLight} ${STATUS_COLORS.error.borderLight}`,
          text: STATUS_COLORS.error.text,
          icon: STATUS_COLORS.error.text,
        };
      case ErrorSeverity.MEDIUM:
        return {
          container: `${STATUS_COLORS.warning.bgLight} ${STATUS_COLORS.warning.borderLight}`,
          text: STATUS_COLORS.warning.text,
          icon: STATUS_COLORS.warning.text,
        };
      case ErrorSeverity.LOW:
        return {
          container: `${STATUS_COLORS.info.bgLight} ${STATUS_COLORS.info.borderLight}`,
          text: STATUS_COLORS.info.text,
          icon: STATUS_COLORS.info.text,
        };
      default:
        return {
          container: `${STATUS_COLORS.error.bgLight} ${STATUS_COLORS.error.borderLight}`,
          text: STATUS_COLORS.error.text,
          icon: STATUS_COLORS.error.text,
        };
    }
  };

  const styles = getSeverityStyles(error.severity);
  const icon = getSeverityIcon(error.severity);

  return (
    <div
      className={cn("p-4 border rounded-lg", styles.container, className)}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 flex-shrink-0", styles.icon)}>{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn("font-medium", styles.text)}>
                {error.userMessage}
              </p>

              {showDetails && (
                <div className="mt-2 space-y-1">
                  <p className={cn("text-sm", styles.text)}>
                    <span className="font-medium">Error ID:</span> {error.id}
                  </p>
                  <p className={cn("text-sm", styles.text)}>
                    <span className="font-medium">Type:</span> {error.type}
                  </p>
                  <p className={cn("text-sm", styles.text)}>
                    <span className="font-medium">Time:</span>{" "}
                    {error.timestamp.toLocaleString()}
                  </p>
                  {error.context && Object.keys(error.context).length > 0 && (
                    <p className={cn("text-sm", styles.text)}>
                      <span className="font-medium">Context:</span>{" "}
                      {JSON.stringify(error.context)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className={cn("h-6 w-6 p-0", styles.text)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Error info component props
 */
interface ErrorInfoProps {
  errorInfo: ErrorInfo;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Error info component with recovery actions
 */
export const ErrorInfoDisplay: React.FC<ErrorInfoProps> = ({
  errorInfo,
  onDismiss,
  className,
}) => {
  const { error, recoveryActions, dismissible = true } = errorInfo;

  return (
    <div className={cn("space-y-3", className)}>
      <ErrorAlert
        error={error}
        onDismiss={dismissible ? onDismiss : undefined}
        showDetails={
          error.severity === ErrorSeverity.HIGH ||
          error.severity === ErrorSeverity.CRITICAL
        }
      />

      {recoveryActions && recoveryActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recoveryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.primary ? "default" : "outline"}
              size="sm"
              onClick={action.action}
              className="text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Error card component for major errors
 */
interface ErrorCardProps {
  error: StandardError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  title?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onRetry,
  onDismiss,
  className,
  title,
}) => {
  return (
    <Card className={cn("border-destructive", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            {title && (
              <h3 className="font-medium text-foreground mb-1">{title}</h3>
            )}
            <p className="text-sm text-muted-foreground mb-3">
              {error.userMessage}
            </p>

            <div className="flex flex-wrap gap-2">
              {error.retryable && onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="text-xs"
                >
                  Dismiss
                </Button>
              )}
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Error ID: {error.id}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Loading error state component
 */
interface LoadingErrorProps {
  error: StandardError;
  onRetry?: () => void;
  className?: string;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  error,
  onRetry,
  className,
}) => {
  return (
    <div className={cn("text-center p-8", className)}>
      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h3 className="text-lg font-medium text-foreground mb-2">
        Failed to load
      </h3>
      <p className="text-muted-foreground mb-4">{error.userMessage}</p>
      {error.retryable && onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

/**
 * Inline error component for form fields
 */
interface InlineErrorProps {
  error: StandardError;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  error,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-sm text-destructive",
        className
      )}
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{error.userMessage}</span>
    </div>
  );
};

/**
 * Error toast component for notifications
 */
interface ErrorToastProps {
  error: StandardError;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  className,
}) => {
  const getSeverityBorder = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return STATUS_COLORS.error.borderLeft;
      case ErrorSeverity.MEDIUM:
        return STATUS_COLORS.warning.borderLeft;
      case ErrorSeverity.LOW:
        return STATUS_COLORS.info.borderLeft;
      default:
        return STATUS_COLORS.error.borderLeft;
    }
  };

  return (
    <div
      className={cn(
        "bg-card border border-l-4 rounded-lg p-4 shadow-lg",
        getSeverityBorder(error.severity),
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {error.userMessage}
          </p>
          {error.retryable && (
            <p className="text-xs text-muted-foreground mt-1">
              This error can be retried
            </p>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Error boundary fallback component
 */
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
  className?: string;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
  className,
}) => {
  return (
    <div className={cn("p-8 text-center", className)}>
      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground mb-4">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <div className="space-y-2">
        <Button onClick={resetError} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Show error details
          </summary>
          <pre className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
};

/**
 * Helper function to create error info with recovery actions
 */
export function createErrorInfo(
  error: StandardError,
  recoveryActions?: ErrorRecoveryAction[],
  options?: {
    dismissible?: boolean;
    autoHide?: boolean;
    autoHideDelay?: number;
  }
): ErrorInfo {
  return {
    error,
    recoveryActions,
    dismissible: options?.dismissible ?? true,
    autoHide: options?.autoHide ?? false,
    autoHideDelay: options?.autoHideDelay ?? 5000,
  };
}

/**
 * Hook for managing error state
 */
export function useErrorState(initialError?: StandardError | null) {
  const [error, setError] = React.useState<StandardError | null>(
    initialError || null
  );

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const setErrorState = React.useCallback((error: StandardError | null) => {
    setError(error);
  }, []);

  return {
    error,
    setError: setErrorState,
    clearError,
    hasError: !!error,
  };
}
