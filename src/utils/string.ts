export function nthIndex(text: string, pattern: string, n: number) {
  let i = -1;
  while (n-- && i++ < text.length) {
    i = text.indexOf(pattern, i);
    if (i < 0) break;
  }
  return i;
}