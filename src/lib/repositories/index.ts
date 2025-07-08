/**
 * Repository layer exports
 * 
 * Provides a clean interface for importing repository implementations
 * and types throughout the application.
 */

// Types and interfaces
export * from "./types";

// Repository implementations
export { FirebaseUserRepository, firebaseUserRepository } from "./FirebaseUserRepository";
export { FirebaseBookRepository, firebaseBookRepository } from "./FirebaseBookRepository";
export { FirebaseEventRepository, firebaseEventRepository } from "./FirebaseEventRepository";