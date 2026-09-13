import type { Pt, Line, Segment } from './types.ts';
import { sub, add, mul, dot, cross, len, dist, norm, perp, EPS } from './vector.ts';

/** 两直线相交 (a1-a2 与 b1-b2) */
export const lineIntersect = (a1: Pt, a2: Pt, b1: Pt, b2: Pt): Pt | null => {
  const r = sub(a2, a1);
  const s = sub(b2, b1);
  const denom = cross(r, s);
  if (Math.abs(denom) < EPS) return null;
  const t = cross(sub(b1, a1), s) / denom;
  return add(a1, mul(r, t));
};

/** 射线-射线相交 (p1 沿方向 d1 与 p2 沿方向 d2) */
export const rayRayIntersect = (p1: Pt, d1: Pt, p2: Pt, d2: Pt): Pt | null => {
  return lineIntersect(p1, add(p1, d1), p2, add(p2, d2));
};

/** 点 p 到直线 a-b 的垂足 */
export const foot = (p: Pt, a: Pt, b: Pt): Pt => {
  const ab = sub(b, a);
  const l2 = dot(ab, ab);
  if (l2 < EPS) return a;
  const t = dot(sub(p, a), ab) / l2;
  return add(a, mul(ab, t));
};

/** 点 p 到直线 a-b 的距离 */
export const distPointToLine = (p: Pt, a: Pt, b: Pt): number => dist(p, foot(p, a, b));

/** 点 p 关于直线 a-b 的对称点 */
export const reflectPoint = (p: Pt, a: Pt, b: Pt): Pt => {
  const f = foot(p, a, b);
  return sub(mul(f, 2), p);
};

/** 线段 a-b 的垂直平分线上的两点 */
export const perpendicularBisector = (a: Pt, b: Pt, ext = 100): Line => {
  const mid = mul(add(a, b), 0.5);
  const dir = perp(sub(b, a));
  const u = norm(dir);
  return {
    a: sub(mid, mul(u, ext)),
    b: add(mid, mul(u, ext)),
  };
};

/** 判定三点是否共线 */
export const isCollinear = (p1: Pt, p2: Pt, p3: Pt, tol = 1e-4): boolean => {
  const area2 = Math.abs(cross(sub(p2, p1), sub(p3, p1)));
  return area2 < tol;
};

/** 判定三直线是否共点 (l1, l2, l3) */
export const isConcurrent = (
  l1: [Pt, Pt],
  l2: [Pt, Pt],
  l3: [Pt, Pt],
  tol = 1e-4
): boolean => {
  const p = lineIntersect(l1[0], l1[1], l2[0], l2[1]);
  if (!p) return false;
  return distPointToLine(p, l3[0], l3[1]) < tol;
};

/** 将直线裁剪到矩形画布内 (w, h) */
export const clipLineToBox = (a: Pt, b: Pt, w = 700, h = 520): [Pt, Pt] | null => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let tmin = -Infinity;
  let tmax = Infinity;
  const check = (p: number, q: number): boolean => {
    if (Math.abs(p) < 1e-12) return q >= 0;
    const r = q / p;
    if (p < 0) {
      if (r > tmax) return false;
      if (r > tmin) tmin = r;
    } else {
      if (r < tmin) return false;
      if (r < tmax) tmax = r;
    }
    return true;
  };
  if (!check(-dx, a.x)) return null;
  if (!check(dx, w - a.x)) return null;
  if (!check(-dy, a.y)) return null;
  if (!check(dy, h - a.y)) return null;
  if (tmin > tmax) return null;
  return [
    { x: a.x + tmin * dx, y: a.y + tmin * dy },
    { x: a.x + tmax * dx, y: a.y + tmax * dy },
  ];
};
