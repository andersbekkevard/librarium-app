import {
  filterUndefinedValues,
  handleFirebaseError,
} from "../firebase-repository-utils";
import { RepositoryError, RepositoryErrorType } from "../types";

describe("filterUndefinedValues", () => {
  it("should remove undefined values from object", () => {
    const input = {
      name: "John",
      age: undefined,
      email: "john@example.com",
      phone: undefined,
      active: true,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      name: "John",
      email: "john@example.com",
      active: true,
    });
  });

  it("should handle empty object", () => {
    const result = filterUndefinedValues({});
    expect(result).toEqual({});
  });

  it("should handle object with all undefined values", () => {
    const input = {
      a: undefined,
      b: undefined,
      c: undefined,
    };

    const result = filterUndefinedValues(input);
    expect(result).toEqual({});
  });

  it("should handle object with no undefined values", () => {
    const input = {
      name: "Jane",
      age: 30,
      active: false,
      score: 0,
      description: "",
    };

    const result = filterUndefinedValues(input);
    expect(result).toEqual(input);
  });

  it("should preserve null values", () => {
    const input = {
      name: "John",
      age: null,
      email: undefined,
      phone: null,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      name: "John",
      age: null,
      phone: null,
    });
  });

  it("should preserve false and 0 values", () => {
    const input = {
      active: false,
      count: 0,
      score: undefined,
      enabled: false,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      active: false,
      count: 0,
      enabled: false,
    });
  });

  it("should handle nested objects correctly", () => {
    const input = {
      user: {
        name: "John",
        age: undefined,
      },
      settings: undefined,
      active: true,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      user: {
        name: "John",
        age: undefined, // Nested undefined values are preserved
      },
      active: true,
    });
  });

  it("should handle arrays correctly", () => {
    const input = {
      names: ["John", "Jane"],
      ages: undefined,
      active: true,
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      names: ["John", "Jane"],
      active: true,
    });
  });

  it("should preserve empty strings and arrays", () => {
    const input = {
      name: "",
      items: [],
      description: undefined,
      tags: [],
    };

    const result = filterUndefinedValues(input);

    expect(result).toEqual({
      name: "",
      items: [],
      tags: [],
    });
  });

  it("should handle complex data types", () => {
    const date = new Date();
    const regex = /test/;

    const input = {
      timestamp: date,
      pattern: regex,
      callback: () => {},
      missing: undefined,
    };

    const result = filterUndefinedValues(input);

    expect(result.timestamp).toBe(date);
    expect(result.pattern).toBe(regex);
    expect(typeof result.callback).toBe("function");
    expect(result).not.toHaveProperty("missing");
  });

  it("should maintain type safety with generic type parameter", () => {
    interface TestObject {
      name: string;
      age?: number;
      email: string;
    }

    const input: TestObject = {
      name: "John",
      age: undefined,
      email: "john@example.com",
    };

    const result = filterUndefinedValues(input);

    // TypeScript should infer the correct type
    expect(result).toEqual({
      name: "John",
      email: "john@example.com",
    });
  });

  it("should handle objects with symbol keys", () => {
    const symbolKey = Symbol("test");
    const input = {
      [symbolKey]: "value",
      regularKey: undefined,
      anotherKey: "value2",
    };

    const result = filterUndefinedValues(input);

    expect(result[symbolKey]).toBe("value");
    expect(result.anotherKey).toBe("value2");
    expect(result).not.toHaveProperty("regularKey");
  });
});

describe("handleFirebaseError", () => {
  it("should handle permission denied errors", () => {
    const firebaseError = {
      code: "permission-denied",
      message: "Missing or insufficient permissions.",
    };

    const result = handleFirebaseError(firebaseError, "books");

    expect(result).toBeInstanceOf(RepositoryError);
    expect(result.type).toBe(RepositoryErrorType.PERMISSION_DENIED);
    expect(result.message).toBe("Access denied to books");
    expect(result.originalError).toBe(firebaseError);
  });

  it("should handle unavailable service errors", () => {
    const firebaseError = {
      code: "unavailable",
      message: "The service is currently unavailable.",
    };

    const result = handleFirebaseError(firebaseError, "users");

    expect(result).toBeInstanceOf(RepositoryError);
    expect(result.type).toBe(RepositoryErrorType.NETWORK_ERROR);
    expect(result.message).toBe("Network error accessing users");
    expect(result.originalError).toBe(firebaseError);
  });

  it("should handle deadline exceeded errors", () => {
    const firebaseError = {
      code: "deadline-exceeded",
      message: "Request deadline exceeded.",
    };

    const result = handleFirebaseError(firebaseError, "events");

    expect(result).toBeInstanceOf(RepositoryError);
    expect(result.type).toBe(RepositoryErrorType.NETWORK_ERROR);
    expect(result.message).toBe("Network error accessing events");
    expect(result.originalError).toBe(firebaseError);
  });

  it("should handle unknown errors", () => {
    const firebaseError = {
      code: "unknown-error",
      message: "Something went wrong.",
    };

    const result = handleFirebaseError(firebaseError, "profiles");

    expect(result).toBeInstanceOf(RepositoryError);
    expect(result.type).toBe(RepositoryErrorType.UNKNOWN_ERROR);
    expect(result.message).toBe("Database error: Something went wrong.");
    expect(result.originalError).toBe(firebaseError);
  });

  it("should use default context when none provided", () => {
    const firebaseError = {
      code: "permission-denied",
      message: "Access denied.",
    };

    const result = handleFirebaseError(firebaseError);

    expect(result.message).toBe("Access denied to collection");
  });

  it("should handle errors without code property", () => {
    const firebaseError = {
      message: "Generic error message",
    };

    const result = handleFirebaseError(firebaseError, "data");

    expect(result.type).toBe(RepositoryErrorType.UNKNOWN_ERROR);
    expect(result.message).toBe("Database error: Generic error message");
  });

  it("should handle errors without message property", () => {
    const firebaseError = {
      code: "permission-denied",
    };

    const result = handleFirebaseError(firebaseError, "documents");

    expect(result.type).toBe(RepositoryErrorType.PERMISSION_DENIED);
    expect(result.message).toBe("Access denied to documents");
  });

  it("should handle Error instances", () => {
    const firebaseError = new Error("Firebase connection failed");
    // @ts-expect-error - Adding code property to Error instance
    firebaseError.code = "unavailable";

    const result = handleFirebaseError(firebaseError, "firestore");

    expect(result.type).toBe(RepositoryErrorType.NETWORK_ERROR);
    expect(result.message).toBe("Network error accessing firestore");
    expect(result.originalError).toBe(firebaseError);
  });

  it("should handle string errors", () => {
    const result = handleFirebaseError("Simple error string", "service");

    expect(result.type).toBe(RepositoryErrorType.UNKNOWN_ERROR);
    expect(result.message).toBe("Database error: Simple error string");
  });

  it("should handle null/undefined errors", () => {
    const nullResult = handleFirebaseError(null, "service");
    const undefinedResult = handleFirebaseError(undefined, "service");

    expect(nullResult.type).toBe(RepositoryErrorType.UNKNOWN_ERROR);
    expect(undefinedResult.type).toBe(RepositoryErrorType.UNKNOWN_ERROR);
  });

  it("should preserve error name as RepositoryError", () => {
    const firebaseError = {
      code: "permission-denied",
      message: "Access denied.",
    };

    const result = handleFirebaseError(firebaseError);

    expect(result.name).toBe("RepositoryError");
  });

  it("should handle various Firebase error codes", () => {
    const testCases = [
      {
        code: "permission-denied",
        expectedType: RepositoryErrorType.PERMISSION_DENIED,
        expectedMessage: "Access denied to test",
      },
      {
        code: "unavailable",
        expectedType: RepositoryErrorType.NETWORK_ERROR,
        expectedMessage: "Network error accessing test",
      },
      {
        code: "deadline-exceeded",
        expectedType: RepositoryErrorType.NETWORK_ERROR,
        expectedMessage: "Network error accessing test",
      },
      {
        code: "not-found",
        expectedType: RepositoryErrorType.UNKNOWN_ERROR,
        expectedMessage: "Database error: Resource not found",
      },
      {
        code: "already-exists",
        expectedType: RepositoryErrorType.UNKNOWN_ERROR,
        expectedMessage: "Database error: Resource already exists",
      },
    ];

    testCases.forEach(({ code, expectedType, expectedMessage }) => {
      const firebaseError = {
        code,
        message:
          code === "not-found"
            ? "Resource not found"
            : "Resource already exists",
      };

      const result = handleFirebaseError(firebaseError, "test");

      expect(result.type).toBe(expectedType);
      if (
        expectedType !== RepositoryErrorType.UNKNOWN_ERROR ||
        code === "not-found" ||
        code === "already-exists"
      ) {
        expect(result.message).toBe(expectedMessage);
      }
    });
  });

  it("should handle complex error objects", () => {
    const complexError = {
      code: "permission-denied",
      message: "Insufficient permissions",
      details: {
        resource: "books",
        action: "read",
        user: "user123",
      },
      stack: "Error stack trace...",
    };

    const result = handleFirebaseError(complexError, "books");

    expect(result.type).toBe(RepositoryErrorType.PERMISSION_DENIED);
    expect(result.message).toBe("Access denied to books");
    expect(result.originalError).toBe(complexError);
  });
});

describe("RepositoryError class", () => {
  it("should create instance with correct properties", () => {
    const originalError = new Error("Original error");
    const error = new RepositoryError(
      RepositoryErrorType.PERMISSION_DENIED,
      "Access denied",
      originalError
    );

    expect(error.type).toBe(RepositoryErrorType.PERMISSION_DENIED);
    expect(error.message).toBe("Access denied");
    expect(error.originalError).toBe(originalError);
    expect(error.name).toBe("RepositoryError");
    expect(error).toBeInstanceOf(Error);
  });

  it("should create instance without original error", () => {
    const error = new RepositoryError(
      RepositoryErrorType.NETWORK_ERROR,
      "Network timeout"
    );

    expect(error.type).toBe(RepositoryErrorType.NETWORK_ERROR);
    expect(error.message).toBe("Network timeout");
    expect(error.originalError).toBeUndefined();
  });

  it("should inherit from Error correctly", () => {
    const error = new RepositoryError(
      RepositoryErrorType.VALIDATION_ERROR,
      "Invalid data"
    );

    expect(error instanceof Error).toBe(true);
    expect(error instanceof RepositoryError).toBe(true);
  });

  it("should have proper error enumeration values", () => {
    expect(RepositoryErrorType.NOT_FOUND).toBe("NOT_FOUND");
    expect(RepositoryErrorType.PERMISSION_DENIED).toBe("PERMISSION_DENIED");
    expect(RepositoryErrorType.NETWORK_ERROR).toBe("NETWORK_ERROR");
    expect(RepositoryErrorType.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    expect(RepositoryErrorType.UNKNOWN_ERROR).toBe("UNKNOWN_ERROR");
  });

  it("should be serializable", () => {
    const error = new RepositoryError(
      RepositoryErrorType.NOT_FOUND,
      "Resource not found"
    );

    const serialized = JSON.stringify(error);
    const parsed = JSON.parse(serialized);

    expect(parsed.name).toBe("RepositoryError");
    expect(parsed.message).toBe("Resource not found");
  });
});

describe("Integration tests", () => {
  it("should work together in typical error handling flow", () => {
    // Simulate a typical repository operation
    const userData = {
      name: "John",
      email: "john@example.com",
      age: undefined,
      preferences: undefined,
    };

    // Filter undefined values before Firebase operation
    const cleanedData = filterUndefinedValues(userData);
    expect(cleanedData).toEqual({
      name: "John",
      email: "john@example.com",
    });

    // Simulate Firebase error response
    const firebaseError = {
      code: "permission-denied",
      message: "Insufficient permissions to write to users collection",
    };

    // Handle the error
    const repositoryError = handleFirebaseError(firebaseError, "users");

    expect(repositoryError.type).toBe(RepositoryErrorType.PERMISSION_DENIED);
    expect(repositoryError.message).toBe("Access denied to users");
    expect(repositoryError.originalError).toBe(firebaseError);
  });

  it("should handle edge cases in error handling workflow", () => {
    // Test with empty data object
    const emptyData = {};
    const filteredEmpty = filterUndefinedValues(emptyData);
    expect(filteredEmpty).toEqual({});

    // Test with undefined error
    const undefinedError = handleFirebaseError(undefined);
    expect(undefinedError.type).toBe(RepositoryErrorType.UNKNOWN_ERROR);

    // Test with null data
    const nullData = { value: null, missing: undefined };
    const filteredNull = filterUndefinedValues(nullData);
    expect(filteredNull).toEqual({ value: null });
  });
});
