// Evaluates a CSS cubic-bezier(x1, y1, x2, y2) curve in JavaScript, so number
// animations can use the exact same easing token as the CSS animations.
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const sample = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Bisection: find the curve parameter t whose x equals the input progress.
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (sample(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return sample(y1, y2, (lo + hi) / 2);
  };
}
