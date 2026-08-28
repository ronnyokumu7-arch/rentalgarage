// src/lib/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS classes
 * 
 * @param inputs - Class names to merge
 * @returns Merged class names string
 * 
 * @example
 * cn('text-red-500', 'hover:text-red-700', condition && 'active')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
