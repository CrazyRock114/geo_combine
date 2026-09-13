import type { Pt, Circle, Line } from './types.ts';
import { sub, add, mul, div, dot, cross, len, dist, norm, perp, EPS, pt } from './vector.ts';
import { foot, lineIntersect } from './lines.ts';

/** 三角形重心 */
export const centroid = (a: Pt, b: Pt, c: Pt): Pt => ({
  x: (a.x + b.x + c.x) / 3,
  y: (a.y + b.y + c.y) / 3,
});

/** 三角形外接圆 */
export const circumcircle = (a: Pt, b: Pt, c: Pt): Circle | null => {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < EPS) return null;

  const a2 = a.x * a.x + a.y * a.y;
  const b2 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;

  const ux = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
  const uy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;
  const center: Pt = { x: ux, y: uy };
  const r = dist(center, a);
  return { c: center, r };
};

/** 三角形内切圆 */
export const incircle = (a: Pt, b: Pt, c: Pt): Circle | null => {
  const bc = dist(b, c);
  const ca = dist(c, a);
  const ab = dist(a, b);
  const p = bc + ca + ab;
  if (p < EPS) return null;

  const incenter: Pt = {
    x: (bc * a.x + ca * b.x + ab * c.x) / p,
    y: (bc * a.y + ca * b.y + ab * c.y) / p,
  };

  const s = p / 2;
  const area = Math.abs(cross(sub(b, a), sub(c, a))) / 2;
  const r = area / s;
  return { c: incenter, r };
};

/** 三角形垂心 */
export const orthocenter = (a: Pt, b: Pt, c: Pt): Pt | null => {
  const cc = circumcircle(a, b, c);
  if (!cc) return null;
  return {
    x: a.x + b.x + c.x - 2 * cc.c.x,
    y: a.y + b.y + c.y - 2 * cc.c.y,
  };
};

/** 三角形九点圆 (欧拉圆) */
export const ninePointCircle = (a: Pt, b: Pt, c: Pt): Circle | null => {
  const cc = circumcircle(a, b, c);
  const h = orthocenter(a, b, c);
  if (!cc || !h) return null;
  const center: Pt = {
    x: (cc.c.x + h.x) / 2,
    y: (cc.c.y + h.y) / 2,
  };
  return { c: center, r: cc.r / 2 };
};

/** 点相对于圆的圆幂 */
export const powerOfPoint = (p: Pt, center: Pt, r: number): number => {
  const d = dist(p, center);
  return d * d - r * r;
};

/** 圆与直线的交点 */
export const circleLineIntersect = (center: Pt, r: number, p1: Pt, p2: Pt): Pt[] => {
  const f = foot(center, p1, p2);
  const d = dist(center, f);
  if (d > r + EPS) return [];
  if (Math.abs(d - r) <= EPS) return [f];
  const halfChord = Math.sqrt(Math.max(0, r * r - d * d));
  const dir = norm(sub(p2, p1));
  return [
    sub(f, mul(dir, halfChord)),
    add(f, mul(dir, halfChord)),
  ];
};

/** 两圆相交交点 */
export const circleCircleIntersect = (c1: Pt, r1: number, c2: Pt, r2: number): Pt[] => {
  const d = dist(c1, c2);
  if (d > r1 + r2 + EPS || d < Math.abs(r1 - r2) - EPS || d < EPS) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const p2 = add(c1, mul(div(sub(c2, c1), d), a));
  if (h < EPS) return [p2];
  const rx = -(c2.y - c1.y) * (h / d);
  const ry = (c2.x - c1.x) * (h / d);
  return [
    { x: p2.x + rx, y: p2.y + ry },
    { x: p2.x - rx, y: p2.y - ry },
  ];
};

/** 两圆的根轴（等幂线） */
export const radicalAxis = (c1: Pt, r1: number, c2: Pt, r2: number): Line | null => {
  const d = dist(c1, c2);
  if (d < EPS) return null;
  const d1 = (d * d + r1 * r1 - r2 * r2) / (2 * d);
  const u = div(sub(c2, c1), d);
  const p = add(c1, mul(u, d1));
  const perpDir = perp(u);
  return {
    a: sub(p, mul(perpDir, 1000)),
    b: add(p, mul(perpDir, 1000)),
  };
};

/** 三圆根心 */
export const radicalCenter = (
  c1: Pt, r1: number,
  c2: Pt, r2: number,
  c3: Pt, r3: number
): Pt | null => {
  const l12 = radicalAxis(c1, r1, c2, r2);
  const l23 = radicalAxis(c2, r2, c3, r3);
  if (!l12 || !l23) return null;
  return lineIntersect(l12.a, l12.b, l23.a, l23.b);
};

/** 两圆外位似中心 */
export const externalHomotheticCenter = (c1: Pt, r1: number, c2: Pt, r2: number): Pt | null => {
  if (Math.abs(r1 - r2) < EPS) return null;
  return {
    x: (r1 * c2.x - r2 * c1.x) / (r1 - r2),
    y: (r1 * c2.y - r2 * c1.y) / (r1 - r2),
  };
};

/** 两圆内位似中心 */
export const internalHomotheticCenter = (c1: Pt, r1: number, c2: Pt, r2: number): Pt | null => {
  const s = r1 + r2;
  if (s < EPS) return null;
  return {
    x: (r1 * c2.x + r2 * c1.x) / s,
    y: (r1 * c2.y + r2 * c1.y) / s,
  };
};

/** 点 P 关于圆 (c, r) 的极线 */
export const polarLine = (p: Pt, center: Pt, r: number): Line | null => {
  const v = sub(p, center);
  const d2 = dot(v, v);
  if (d2 < EPS) return null;
  const footPt = add(center, mul(v, (r * r) / d2));
  const perpDir = perp(norm(v));
  return {
    a: sub(footPt, mul(perpDir, 1000)),
    b: add(footPt, mul(perpDir, 1000)),
  };
};

/** 笛卡尔定理：索迪圆半径求解 (三互切圆求第四切圆) */
export const soddyRadius = (r1: number, r2: number, r3: number, inner = true): number => {
  const k1 = 1 / r1;
  const k2 = 1 / r2;
  const k3 = 1 / r3;
  const sumK = k1 + k2 + k3;
  const sqrtPart = 2 * Math.sqrt(k1 * k2 + k2 * k3 + k3 * k1);
  const k4 = inner ? sumK + sqrtPart : sumK - sqrtPart;
  return Math.abs(1 / (k4 || EPS));
};
