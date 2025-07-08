/**
 * Service layer exports
 * 
 * Provides a clean interface for importing service implementations
 * and types throughout the application.
 */

// Types and interfaces
export * from "./types";

// Service implementations
export { AuthService, authService } from "./AuthService";
export { UserService, userService } from "./UserService";
export { BookService, bookService } from "./BookService";