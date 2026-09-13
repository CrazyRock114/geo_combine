import type { Pt, Vec } from './types.ts';

export const EPS = 1e-9;

/** 构造点/向量 */
export const pt = (x: number, y: number): Pt => ({ x, y });

/** 克隆点 */
export const clone = (p: Pt): Pt => ({ x: p.x, y: p.y });

/** 向量加法 a + b */
export const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });

/** 向量减法 a - b */
export const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });

/** 向量数乘 a * s */
export const mul = (a: Pt, s: number): Pt => ({ x: a.x * s, y: a.y * s });

/** 向量数除 a / s */
export const div = (a: Pt, s: number): Pt => ({ x: a.x / (s || EPS), y: a.y / (s || EPS) });

/** 向量点积 a · b */
export const dot = (a: Pt, b: Pt): number => a.x * b.x + a.y * b.y;

/** 向量叉积 a × b (2D) */
export const cross = (a: Pt, b: Pt): number => a.x * b.y - a.y * b.x;

/** 向量模长 |v| */
export const len = (v: Vec): number => Math.hypot(v.x, v.y);

/** 两点间距离 */
export const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

/** 两点间距离平方 */
export const distSq = (a: Pt, b: Pt): number => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/** 单位向量 */
export const norm = (v: Vec): Vec => {
  const l = len(v);
  return l > EPS ? div(v, l) : pt(0, 0);
};

/** 逆时针 90 度垂直向量 */
export const perp = (v: Vec): Vec => pt(-v.y, v.x);

/** 顺时针 90 度垂直向量 */
export const perpCW = (v: Vec): Vec => pt(v.y, -v.x);

/** 向量旋转 rad 弧度 (逆时针为正) */
export const rot = (v: Vec, rad: number): Vec => {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return pt(v.x * c - v.y * s, v.x * s + v.y * c);
};

/** 线性插值 (1-t)a + tb */
export const lerp = (a: Pt, b: Pt, t: number): Pt => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** 中点 */
export const midpoint = (a: Pt, b: Pt): Pt => lerp(a, b, 0.5);

/** 向量方位角，范围 (-π, π] */
export const angleOf = (v: Vec): number => Math.atan2(v.y, v.x);

/** 将角规格化到 (-π, π] */
export const normAng = (rad: number): number => {
  let a = rad % (2 * Math.PI);
  if (a > Math.PI) a -= 2 * Math.PI;
  if (a <= -Math.PI) a += 2 * Math.PI;
  return a;
};

/** 夹角 ∠a-o-b，范围 [0, π] */
export const angle = (a: Pt, o: Pt, b: Pt): number => {
  const oa = sub(a, o);
  const ob = sub(b, o);
  const la = len(oa);
  const lb = len(ob);
  if (la < EPS || lb < EPS) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot(oa, ob) / (la * lb)));
  return Math.acos(cosTheta);
};

/** 有向夹角 (oa 转向 ob，逆时针为正)，范围 (-π, π] */
export const signedAngle = (a: Pt, o: Pt, b: Pt): number => {
  const angA = angleOf(sub(a, o));
  const angB = angleOf(sub(b, o));
  return normAng(angB - angA);
};

/** 从基准点 base 出发，沿 ang 角度方向延伸 length 的点 */
export const fromAng = (base: Pt, length: number, ang: number): Pt => ({
  x: base.x + length * Math.cos(ang),
  y: base.y + length * Math.sin(ang),
});

/** 有向线段分比 AP / PB (P 在直线 AB 上) */
export const segRatio = (p: Pt, a: Pt, b: Pt): number => {
  const ab = sub(b, a);
  const ap = sub(p, a);
  const pb = sub(b, p);
  const l2 = dot(ab, ab);
  if (l2 < EPS) return 1;
  const t = dot(ap, ab) / l2;
  const denom = 1 - t;
  if (Math.abs(denom) < 1e-6) return 999999;
  return t / denom;
};

/** 数值格式化，保留 d 位小数 */
export const fmt = (n: number | null | undefined, d = 3): string => {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return n.toFixed(d);
};
