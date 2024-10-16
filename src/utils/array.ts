export function getRandomElement<T>(array: T[]) {
  const index = Math.floor(Math.random() * array.length)
  return { element: array[index], index }
}