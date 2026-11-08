/**
 * Cubic-bezier easing, enough to reproduce the original `bezier-easing` call
 * used by the finale animation.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const A = (a: number, b: number) => 1 - 3 * b + 3 * a
  const B = (a: number, b: number) => 3 * b - 6 * a
  const C = (a: number) => 3 * a
  const calc = (t: number, a: number, b: number) =>
    ((A(a, b) * t + B(a, b)) * t + C(a)) * t
  const slope = (t: number, a: number, b: number) =>
    3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a)

  const solve = (x: number) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const currentSlope = slope(t, x1, x2)
      if (currentSlope === 0) break
      const currentX = calc(t, x1, x2) - x
      t -= currentX / currentSlope
    }
    return t
  }

  return (progress: number) => {
    if (progress <= 0) return 0
    if (progress >= 1) return 1
    return calc(solve(progress), y1, y2)
  }
}
