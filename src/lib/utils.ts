import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Type for Neo4j Integer objects
interface Neo4jInteger {
  low: number;
  high: number;
}

// Type guard to check if an object is a Neo4j Integer
function isNeo4jInteger(obj: unknown): obj is Neo4jInteger {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'low' in obj &&
    'high' in obj &&
    typeof (obj as Neo4jInteger).low === 'number' &&
    typeof (obj as Neo4jInteger).high === 'number'
  );
}

// Helper function to serialize Neo4j objects for client components
export function serializeNeo4jObject<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (typeof obj === 'object') {
    // Check if it's a Neo4j Integer
    if (isNeo4jInteger(obj)) {
      return Number(obj.low) as unknown as T;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => serializeNeo4jObject(item)) as unknown as T;
    }

    // Handle objects
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeNeo4jObject((obj as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }

  // Return primitives as is
  return obj as T;
}
