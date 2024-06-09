export function deepCopy<T extends object>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepCopy) as T;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepCopy(value)])
  ) as T;
}