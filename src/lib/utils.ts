/**
 * Utility functions for the Librarium app
 * 
 * Contains common utility functions used throughout the application.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS classes
 * 
 * Combines multiple class values using clsx and merges conflicting
 * Tailwind classes using tailwind-merge. This ensures that later
 * classes override earlier ones properly.
 * 
 * @param inputs - Class values to combine (strings, objects, arrays, etc.)
 * @returns string - Merged class string
 * 
 * @example
 * cn("px-2 py-1", "px-4", { "bg-red-500": isError }) // "py-1 px-4 bg-red-500"
 * cn("text-sm", someCondition && "text-lg") // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
