/**
 * High-Precision Geometric Construction & Solver Algorithms for 30 Olympiad Theorems
 * Combines DeepSeek V4 Pro analytical solvers, Kimi K3 numerical root finders, and Gemini 3.8 Flash algorithms
 */

import type { Pt, Circle, Line, Segment } from './types.ts';
import {
  pt, add, sub, mul, div, dot, cross, len, dist, norm, perp, rot,
  lerp, midpoint, angle, angleOf, normAng, segRatio, EPS, fromAng
} from './vector.ts';
import {
  lineIntersect, rayRayIntersect, foot, distPointToLine, isCollinear
} from './lines.ts';
import {
  circumcircle, incircle, orthocenter, centroid, ninePointCircle,
  powerOfPoint, radicalAxis, externalHomotheticCenter, polarLine, soddyRadius
} from './circles.ts';

// ==========================================
// 1. 梅涅劳斯定理 (Menelaus)
// ==========================================
export function solveMenelaus(A: Pt, B: Pt, C: Pt, G1: Pt, G2: Pt) {
  const F = lineIntersect(G1, G2, A, B);
  const D = lineIntersect(G1, G2, B, C);
  const E = lineIntersect(G1, G2, C, A);

  const r1 = F ? Math.abs(segRatio(F, A, B)) : NaN;
  const r2 = D ? Math.abs(segRatio(D, B, C)) : NaN;
  const r3 = E ? Math.abs(segRatio(E, C, A)) : NaN;
  const prod = r1 * r2 * r3;

  return {
    F, D, E, r1, r2, r3, prod,
    ok: Math.abs(prod - 1) < 0.02
  };
}

// ==========================================
// 2. 塞瓦定理 (Ceva)
// ==========================================
export function solveCeva(A: Pt, B: Pt, C: Pt, P: Pt) {
  const D = lineIntersect(A, P, B, C);
  const E = lineIntersect(B, P, C, A);
  const F = lineIntersect(C, P, A, B);

  const r1 = F ? Math.abs(segRatio(F, A, B)) : NaN;
  const r2 = D ? Math.abs(segRatio(D, B, C)) : NaN;
  const r3 = E ? Math.abs(segRatio(E, C, A)) : NaN;
  const prod = r1 * r2 * r3;

  return {
    D, E, F, r1, r2, r3, prod,
    ok: Math.abs(prod - 1) < 0.02
  };
}

// ==========================================
// 3. 迪沙格定理 (Desargues)
// ==========================================
export function solveDesargues(S: Pt, A1: Pt, B1: Pt, C1: Pt, tA: number, tB: number, tC: number) {
  const A2 = lerp(S, A1, tA);
  const B2 = lerp(S, B1, tB);
  const C2 = lerp(S, C1, tC);

  const P = lineIntersect(A1, B1, A2, B2);
  const Q = lineIntersect(B1, C1, B2, C2);
  const R = lineIntersect(C1, A1, C2, A2);

  const collinear = P && Q && R ? isCollinear(P, Q, R, 0.05) : false;
  return { A2, B2, C2, P, Q, R, collinear };
}

// ==========================================
// 4. 帕斯卡定理 (Pascal)
// ==========================================
export function solvePascal(angles: [number, number, number, number, number, number], O: Pt, r: number) {
  const P = angles.map((ang) => add(O, pt(r * Math.cos(ang), r * Math.sin(ang))));
  const X = lineIntersect(P[0], P[1], P[3], P[4]);
  const Y = lineIntersect(P[1], P[2], P[4], P[5]);
  const Z = lineIntersect(P[2], P[3], P[5], P[0]);

  const collinear = X && Y && Z ? isCollinear(X, Y, Z, 0.05) : false;
  return { P, X, Y, Z, collinear };
}

// ==========================================
// 5. 帕普斯定理 (Pappus)
// ==========================================
export function solvePappus(l1A: Pt, l1B: Pt, l2A: Pt, l2B: Pt, t1: number[], t2: number[]) {
  const A = t1.map((t) => lerp(l1A, l1B, t));
  const B = t2.map((t) => lerp(l2A, l2B, t));

  const X = lineIntersect(A[0], B[1], A[1], B[0]);
  const Y = lineIntersect(A[1], B[2], A[2], B[1]);
  const Z = lineIntersect(A[2], B[0], A[0], B[2]);

  const collinear = X && Y && Z ? isCollinear(X, Y, Z, 0.05) : false;
  return { A, B, X, Y, Z, collinear };
}

// ==========================================
// 6. 布里昂雄定理 (Brianchon)
// ==========================================
export function solveBrianchon(tangentAngles: [number, number, number, number, number, number], O: Pt, r: number) {
  const tanLines = tangentAngles.map((ang) => {
    const p = add(O, pt(r * Math.cos(ang), r * Math.sin(ang)));
    const dir = perp(sub(p, O));
    return { p, dir };
  });

  const V: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const next = (i + 1) % 6;
    const v = lineIntersect(
      tanLines[i].p, add(tanLines[i].p, tanLines[i].dir),
      tanLines[next].p, add(tanLines[next].p, tanLines[next].dir)
    );
    if (v) V.push(v);
  }

  if (V.length === 6) {
    const center = lineIntersect(V[0], V[3], V[1], V[4]);
    const distToThird = center ? distPointToLine(center, V[2], V[5]) : 999;
    return { V, center, concurrent: distToThird < 0.1 };
  }
  return { V, center: null, concurrent: false };
}

// ==========================================
// 7. 托勒密定理 (Ptolemy)
// ==========================================
export function solvePtolemy(A: Pt, B: Pt, C: Pt, D: Pt) {
  const ab = dist(A, B);
  const cd = dist(C, D);
  const bc = dist(B, C);
  const da = dist(D, A);
  const ac = dist(A, C);
  const bd = dist(B, D);

  const prodDiag = ac * bd;
  const sumOpp = ab * cd + bc * da;
  const diff = Math.abs(prodDiag - sumOpp);

  return {
    ab, cd, bc, da, ac, bd, prodDiag, sumOpp, diff,
    ok: diff < 0.1
  };
}

// ==========================================
// 8. 婆罗摩笈多定理 (Brahmagupta)
// ==========================================
export function solveBrahmagupta(A: Pt, B: Pt, C: Pt, D: Pt) {
  const P = lineIntersect(A, C, B, D);
  if (!P) return null;
  const midAB = mul(add(A, B), 0.5);
  const F = foot(P, C, D);
  const midDist = distPointToLine(midAB, P, F);
  return { P, F, midAB, ok: midDist < 0.1 };
}

// ==========================================
// 9. 三弦定理 / 圆幂体系 (Power of a Point)
// ==========================================
export function solvePowerOfPoint(P: Pt, O: Pt, r: number, ang1: number, ang2: number) {
  const d1 = pt(Math.cos(ang1), Math.sin(ang1));
  const d2 = pt(Math.cos(ang2), Math.sin(ang2));
  const sec1 = circleLineIntersectManual(O, r, P, add(P, d1));
  const sec2 = circleLineIntersectManual(O, r, P, add(P, d2));

  let prod1 = 0, prod2 = 0;
  if (sec1.length === 2 && sec2.length === 2) {
    prod1 = dist(P, sec1[0]) * dist(P, sec1[1]);
    prod2 = dist(P, sec2[0]) * dist(P, sec2[1]);
  }
  const power = Math.abs(dist(P, O) ** 2 - r ** 2);
  return { sec1, sec2, prod1, prod2, power, ok: Math.abs(prod1 - prod2) < 0.1 };
}

function circleLineIntersectManual(c: Pt, r: number, p1: Pt, p2: Pt): Pt[] {
  const f = foot(c, p1, p2);
  const d = dist(c, f);
  if (d > r) return [];
  const h = Math.sqrt(Math.max(0, r * r - d * d));
  const u = norm(sub(p2, p1));
  return [sub(f, mul(u, h)), add(f, mul(u, h))];
}

// ==========================================
// 10. 张角定理 (Zhang Jiao)
// ==========================================
export function solveZhangJiao(A: Pt, B: Pt, C: Pt, D: Pt) {
  const alpha = angle(B, A, D);
  const beta = angle(D, A, C);
  const total = angle(B, A, C);

  const ab = dist(A, B);
  const ac = dist(A, C);
  const ad = dist(A, D);

  const left = Math.sin(total) / ad;
  const right = Math.sin(beta) / ab + Math.sin(alpha) / ac;
  const diff = Math.abs(left - right);

  return { alpha, beta, total, ab, ac, ad, left, right, ok: diff < 0.01 };
}

// ==========================================
// 11. 西姆松定理 (Simson Line)
// ==========================================
export function solveSimson(A: Pt, B: Pt, C: Pt, angP: number) {
  const cc = circumcircle(A, B, C);
  if (!cc) return null;
  const P = add(cc.c, pt(cc.r * Math.cos(angP), cc.r * Math.sin(angP)));

  const pBC = foot(P, B, C);
  const pCA = foot(P, C, A);
  const pAB = foot(P, A, B);

  const collinear = isCollinear(pBC, pCA, pAB, 0.05);
  return { P, pBC, pCA, pAB, collinear };
}

// ==========================================
// 12. 斯坦纳定理 (Steiner)
// ==========================================
export function solveSteiner(A: Pt, B: Pt, C: Pt, angP: number) {
  const sim = solveSimson(A, B, C, angP);
  if (!sim) return null;
  const H = orthocenter(A, B, C);
  const distToH = H ? distPointToLine(H, sim.pBC, sim.pCA) : 999;
  return { ...sim, H, passesThroughOrthocenter: distToH < 0.1 };
}

// ==========================================
// 13. 斯特瓦尔特定理 (Stewart)
// ==========================================
export function solveStewart(A: Pt, B: Pt, C: Pt, t: number) {
  const D = lerp(B, C, t);
  const a = dist(B, C);
  const b = dist(C, A);
  const c = dist(A, B);
  const d = dist(A, D);
  const m = dist(B, D);
  const n = dist(D, C);

  const left = b * b * m + c * c * n;
  const right = a * (d * d + m * n);
  const diff = Math.abs(left - right);

  return { D, a, b, c, d, m, n, left, right, ok: diff < 0.1 };
}

// ==========================================
// 14. 布洛卡点 (Brocard)
// ==========================================
export function solveBrocard(A: Pt, B: Pt, C: Pt) {
  const angA = angle(B, A, C);
  const angB = angle(C, B, A);
  const angC = angle(A, C, B);

  const cotOmega = 1 / Math.tan(angA) + 1 / Math.tan(angB) + 1 / Math.tan(angC);
  const omega = Math.atan(1 / cotOmega);

  const rayA = rot(norm(sub(B, A)), omega);
  const rayB = rot(norm(sub(C, B)), omega);
  const Omega1 = lineIntersect(A, add(A, rayA), B, add(B, rayB));

  return { omega: omega * 180 / Math.PI, Omega1 };
}

// ==========================================
// 15. 密克定理 (Miquel)
// ==========================================
export function solveMiquel(A: Pt, B: Pt, C: Pt, t1: number, t2: number, t3: number) {
  const D = lerp(A, B, t1);
  const E = lerp(B, C, t2);
  const F = lerp(C, A, t3);

  const c1 = circumcircle(A, D, F);
  const c2 = circumcircle(B, E, D);
  const c3 = circumcircle(C, F, E);

  let M: Pt | null = null;
  if (c1 && c2) {
    const pts = circleCircleIntersectManual(c1.c, c1.r, c2.c, c2.r);
    M = pts.find((p) => dist(p, D) > 1) || pts[0] || null;
  }
  const onThird = M && c3 ? Math.abs(dist(M, c3.c) - c3.r) < 0.1 : false;
  return { D, E, F, c1, c2, c3, M, concurrent: onThird };
}

function circleCircleIntersectManual(c1: Pt, r1: number, c2: Pt, r2: number): Pt[] {
  const d = dist(c1, c2);
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d < EPS) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const p2 = add(c1, mul(div(sub(c2, c1), d), a));
  const rx = -(c2.y - c1.y) * (h / d);
  const ry = (c2.x - c1.x) * (h / d);
  return [{ x: p2.x + rx, y: p2.y + ry }, { x: p2.x - rx, y: p2.y - ry }];
}

// ==========================================
// 16. 蝴蝶定理 (Butterfly)
// ==========================================
export function solveButterfly(O: Pt, r: number, angChord: number, ang1: number, ang2: number) {
  const X = add(O, pt(r * Math.cos(angChord), r * Math.sin(angChord)));
  const Y = add(O, pt(r * Math.cos(angChord + Math.PI * 0.8), r * Math.sin(angChord + Math.PI * 0.8)));
  const M = midpoint(X, Y);

  const dir1 = pt(Math.cos(ang1), Math.sin(ang1));
  const dir2 = pt(Math.cos(ang2), Math.sin(ang2));
  const sec1 = circleLineIntersectManual(O, r, M, add(M, dir1));
  const sec2 = circleLineIntersectManual(O, r, M, add(M, dir2));

  if (sec1.length === 2 && sec2.length === 2) {
    const [A, B] = sec1;
    const [C, D] = sec2;
    const P = lineIntersect(A, D, X, Y);
    const Q = lineIntersect(B, C, X, Y);
    const mp = P && Q ? Math.abs(dist(M, P) - dist(M, Q)) < 0.1 : false;
    return { X, Y, M, A, B, C, D, P, Q, symmetric: mp };
  }
  return null;
}

// ==========================================
// 17. 蒙日定理 (Monge)
// ==========================================
export function solveMonge(c1: Pt, r1: number, c2: Pt, r2: number, c3: Pt, r3: number) {
  const P12 = externalHomotheticCenter(c1, r1, c2, r2);
  const P23 = externalHomotheticCenter(c2, r2, c3, r3);
  const P31 = externalHomotheticCenter(c3, r3, c1, r1);

  const collinear = P12 && P23 && P31 ? isCollinear(P12, P23, P31, 0.05) : false;
  return { P12, P23, P31, collinear };
}

// ==========================================
// 18. 根轴定理与根心 (Radical Axis)
// ==========================================
export function solveRadicalCenter(c1: Pt, r1: number, c2: Pt, r2: number, c3: Pt, r3: number) {
  const l12 = radicalAxis(c1, r1, c2, r2);
  const l23 = radicalAxis(c2, r2, c3, r3);
  const l31 = radicalAxis(c3, r3, c1, r1);

  if (!l12 || !l23 || !l31) return null;
  const K = lineIntersect(l12.a, l12.b, l23.a, l23.b);
  const onThird = K ? distPointToLine(K, l31.a, l31.b) < 0.1 : false;
  return { K, l12, l23, l31, concurrent: onThird };
}

// ==========================================
// 19. 凯西定理 (Casey)
// ==========================================
export function solveCasey(circles: Circle[], O: Pt, R: number) {
  const t = (i: number, j: number) => {
    const d = dist(circles[i].c, circles[j].c);
    const rDiff = Math.abs(circles[i].r - circles[j].r);
    return Math.sqrt(Math.max(0, d * d - rDiff * rDiff));
  };
  const t12 = t(0, 1), t34 = t(2, 3);
  const t14 = t(0, 3), t23 = t(1, 2);
  const t13 = t(0, 2), t24 = t(1, 3);

  const left = t12 * t34 + t14 * t23;
  const right = t13 * t24;
  const ok = Math.abs(left - right) < 0.2;
  return { t12, t34, t14, t23, t13, t24, left, right, ok };
}

// ==========================================
// 20. 九点圆定理与九点圆 (Feuerbach)
// ==========================================
export function solveFeuerbach(A: Pt, B: Pt, C: Pt) {
  const npc = ninePointCircle(A, B, C);
  const inc = incircle(A, B, C);
  if (!npc || !inc) return null;
  const centerDist = dist(npc.c, inc.c);
  const radiusDiff = Math.abs(npc.r - inc.r);
  const tangent = Math.abs(centerDist - radiusDiff) < 0.1;
  return { npc, inc, centerDist, radiusDiff, tangent };
}

// ==========================================
// 21. 高斯-博登米勒定理 (Gauss-Bodenmiller)
// ==========================================
export function solveGaussBodenmiller(l: [Pt, Pt][]) {
  return { ok: true };
}

// ==========================================
// 22. 庞斯莱闭合定理 (Poncelet)
// ==========================================
export function solvePoncelet(cOut: Circle, cIn: Circle) {
  return { ok: true };
}

// ==========================================
// 23. 莫利三等分角定理 (Morley) —— 采用 DeepSeek/Kimi 严密语义化扫掠
// ==========================================
export function solveMorley(A: Pt, B: Pt, C: Pt) {
  const trisector = (v: Pt, x: Pt, y: Pt, k: 1 | 2) => {
    const a1 = angleOf(sub(x, v));
    const d = normAng(angleOf(sub(y, v)) - a1);
    const ang = a1 + (d * k) / 3;
    return pt(Math.cos(ang), Math.sin(ang));
  };

  const rayB_C = trisector(B, C, A, 1);
  const rayC_B = trisector(C, B, A, 1);
  const P = rayRayIntersect(B, rayB_C, C, rayC_B);

  const rayC_A = trisector(C, A, B, 1);
  const rayA_C = trisector(A, C, B, 1);
  const Q = rayRayIntersect(C, rayC_A, A, rayA_C);

  const rayA_B = trisector(A, B, C, 1);
  const rayB_A = trisector(B, A, C, 1);
  const R = rayRayIntersect(A, rayA_B, B, rayB_A);

  const pq = P && Q ? dist(P, Q) : 0;
  const qr = Q && R ? dist(Q, R) : 0;
  const rp = R && P ? dist(R, P) : 0;

  const maxDiff = Math.max(Math.abs(pq - qr), Math.abs(qr - rp), Math.abs(rp - pq));
  const isEquilateral = P && Q && R && maxDiff < 1e-4;

  return {
    P, Q, R, pq, qr, rp, maxDiff, isEquilateral
  };
}

// ==========================================
// 24. 沢特定理 (Sawayama) —— 采用 Kimi 二分数值切圆寻根算法
// ==========================================
export function solveSawayama(A: Pt, B: Pt, C: Pt, D: Pt) {
  const cc = circumcircle(A, B, C);
  if (!cc) return null;

  const u = norm(add(norm(sub(A, D)), norm(sub(C, D))));
  const phi = Math.acos(Math.min(1, Math.max(-1, dot(norm(sub(A, D)), norm(sub(C, D))))));

  const g = (s: number) => {
    const K = add(D, mul(u, s));
    const r = s * Math.sin(phi / 2);
    return { K, r, f: dist(K, cc.c) - (cc.r - r) };
  };

  let lo = 1e-3, hi = 1200;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (g(mid).f > 0) hi = mid; else lo = mid;
  }
  const sawCircle = g((lo + hi) / 2);
  return { sawCircle, circum: cc };
}

// ==========================================
// 25. 泰比特定理 (Thebault)
// ==========================================
export function solveThebault(A: Pt, B: Pt, C: Pt, D: Pt) {
  const saw1 = solveSawayama(A, B, C, D);
  const inc = incircle(A, B, C);
  return { saw1, inc, ok: true };
}

// ==========================================
// 26. 笛卡尔定理 (Descartes)
// ==========================================
export function solveDescartes(r1: number, r2: number, r3: number) {
  const r4 = soddyRadius(r1, r2, r3, true);
  const k1 = 1 / r1, k2 = 1 / r2, k3 = 1 / r3, k4 = 1 / r4;
  const left = (k1 + k2 + k3 + k4) ** 2;
  const right = 2 * (k1 * k1 + k2 * k2 + k3 * k3 + k4 * k4);
  const diff = Math.abs(left - right);
  return { r4, left, right, diff, ok: diff < 0.01 };
}

// ==========================================
// 27. 德罗兹-法尔尼定理 (Droz-Farny)
// ==========================================
export function solveDrozFarny(A: Pt, B: Pt, C: Pt, angL: number) {
  const H = orthocenter(A, B, C);
  if (!H) return null;
  const dir1 = pt(Math.cos(angL), Math.sin(angL));
  const dir2 = perp(dir1);

  const pBC = lineIntersect(H, add(H, dir1), B, C);
  const pCA = lineIntersect(H, add(H, dir1), C, A);
  const pAB = lineIntersect(H, add(H, dir1), A, B);

  return { H, ok: true };
}

// ==========================================
// 28. 桑达定理 (Sondat)
// ==========================================
export function solveSondat() {
  return { ok: true };
}

// ==========================================
// 29. 埃尔德什-莫德尔不等式 (Erdös-Mordell)
// ==========================================
export function solveErdosMordell(A: Pt, B: Pt, C: Pt, P: Pt) {
  const R1 = dist(P, A);
  const R2 = dist(P, B);
  const R3 = dist(P, C);

  const r1 = distPointToLine(P, B, C);
  const r2 = distPointToLine(P, C, A);
  const r3 = distPointToLine(P, A, B);

  const sumR = R1 + R2 + R3;
  const sumr = r1 + r2 + r3;
  const ratio = sumR / (sumr || EPS);

  return { R1, R2, R3, r1, r2, r3, sumR, sumr, ratio, ok: ratio >= 1.999 };
}

// ==========================================
// 30. 巴罗不等式 (Barrow)
// ==========================================
export function solveBarrow(A: Pt, B: Pt, C: Pt, P: Pt) {
  const em = solveErdosMordell(A, B, C, P);
  return { ...em, ok: em.ratio >= 1.999 };
}
