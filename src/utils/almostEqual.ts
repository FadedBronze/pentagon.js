export const verySmallValue = 0.0005;

export function almostEqual(a: number, b: number) {
  return Math.abs(a - b) < verySmallValue;
}
