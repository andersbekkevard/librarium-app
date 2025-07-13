import { SimpleErrorLogger } from '../error-logging';
import { ErrorCategory, ErrorSeverity, StandardError } from '../error-handling';

/** Helper to create a minimal error object for logging */
const createError = (): StandardError => ({
  id: '1',
  type: 'test',
  category: ErrorCategory.SYSTEM,
  severity: ErrorSeverity.MEDIUM,
  message: 'failure',
  userMessage: 'failure',
  timestamp: new Date(),
  recoverable: true,
  retryable: false,
});

describe('SimpleErrorLogger', () => {
  /** Log entries should be persisted in localStorage for later retrieval */
  it('stores error logs in localStorage', () => {
    const logger = new SimpleErrorLogger({ enableConsole: false, enableLocalStorage: true });
    logger.clearStoredLogs();
    logger.logError(createError());
    const stored = logger.getStoredLogs();
    expect(stored.length).toBe(1);
    expect(stored[0].level).toBe('error');
  });

  /** When console logging is enabled the message should be printed */
  it('outputs info logs to console', () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new SimpleErrorLogger({ enableConsole: true, enableLocalStorage: false });
    logger.logInfo('hello');
    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls[0][1]).toBe('hello');
    infoSpy.mockRestore();
  });
});

