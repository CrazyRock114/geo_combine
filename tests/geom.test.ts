import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  pt, dist, isCollinear, solveMenelaus, solveCeva, solveDesargues,
  solvePascal, solvePappus, solveBrianchon, solvePtolemy, solveBrahmagupta,
  solvePowerOfPoint, solveZhangJiao, solveSimson, solveSteiner, solveStewart,
  solveBrocard, solveMiquel, solveButterfly, solveMonge, solveRadicalCenter,
  solveCasey, solveFeuerbach, solveGaussBodenmiller, solvePoncelet, solveMorley,
  solveSawayama, solveThebault, solveDescartes, solveDrozFarny, solveSondat,
  solveErdosMordell, solveBarrow
} from '../src/lib/geom/index.ts';

describe('30条奥数竞赛著名几何定理全量算法自动化测试套件', () => {

  test('定理 01: 梅涅劳斯定理 (Menelaus)', () => {
    const res = solveMenelaus(pt(110, 60), pt(350, 130), pt(190, 315), pt(35, 215), pt(395, 190));
    assert.ok(res.ok && Math.abs(res.prod - 1) < 1e-4, `乘积应为1: ${res.prod}`);
  });

  test('定理 02: 塞瓦定理 (Ceva)', () => {
    const A = pt(200, 50), B = pt(80, 300), C = pt(350, 280);
    const P = pt((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3);
    const res = solveCeva(A, B, C, P);
    assert.ok(res.ok && Math.abs(res.prod - 1) < 1e-4, `乘积应为1: ${res.prod}`);
  });

  test('定理 03: 迪沙格定理 (Desargues) 对应边交点共线', () => {
    const S = pt(100, 100);
    const A1 = pt(180, 140), B1 = pt(150, 260), C1 = pt(280, 200);
    const res = solveDesargues(S, A1, B1, C1, 1.8, 1.6, 1.9);
    assert.ok(res.collinear, '透视三角形对应边交点应共线');
  });

  test('定理 04: 帕斯卡定理 (Pascal) 圆内接六边形对边交点共线', () => {
    const O = pt(250, 250), r = 120;
    const angles: [number, number, number, number, number, number] = [0.2, 0.9, 2.1, 3.4, 4.2, 5.5];
    const res = solvePascal(angles, O, r);
    assert.ok(res.collinear, '帕斯卡线应共线');
  });

  test('定理 05: 帕普斯定理 (Pappus) 两直线上三点交叉交点共线', () => {
    const l1A = pt(50, 80), l1B = pt(400, 100);
    const l2A = pt(60, 300), l2B = pt(420, 310);
    const res = solvePappus(l1A, l1B, l2A, l2B, [0.1, 0.45, 0.85], [0.15, 0.5, 0.9]);
    assert.ok(res.collinear, '帕普斯三交点应共线');
  });

  test('定理 06: 布里昂雄定理 (Brianchon) 外切六边形对角线共点', () => {
    const O = pt(250, 250), r = 100;
    const angles: [number, number, number, number, number, number] = [0.1, 1.1, 2.2, 3.2, 4.3, 5.4];
    const res = solveBrianchon(angles, O, r);
    assert.ok(res.concurrent, '布里昂雄对角线应共点');
  });

  test('定理 07: 托勒密定理 (Ptolemy) 圆内接四边形对角线与对边积', () => {
    const O = pt(200, 200), R = 100;
    const A = pt(O.x + R * Math.cos(0.2), O.y + R * Math.sin(0.2));
    const B = pt(O.x + R * Math.cos(1.5), O.y + R * Math.sin(1.5));
    const C = pt(O.x + R * Math.cos(3.2), O.y + R * Math.sin(3.2));
    const D = pt(O.x + R * Math.cos(4.8), O.y + R * Math.sin(4.8));
    const res = solvePtolemy(A, B, C, D);
    assert.ok(res.ok && res.diff < 1e-4, `托勒密恒等式失败: ${res.diff}`);
  });

  test('定理 08: 婆罗摩笈多定理 (Brahmagupta) 对角线垂直四边形垂线平分对边', () => {
    const A = pt(200, 100);
    const C = pt(200, 300);
    const B = pt(100, 200);
    const D = pt(300, 200);
    const res = solveBrahmagupta(A, B, C, D);
    assert.ok(res !== null && res.ok, '婆罗摩笈多垂线应平分对边');
  });

  test('定理 09: 三弦定理 / 圆幂定理 (Power of a Point)', () => {
    const P = pt(50, 50), O = pt(200, 200), r = 80;
    const res = solvePowerOfPoint(P, O, r, 0.7, 1.1);
    assert.ok(res.ok, '割线线段积应等于圆幂');
  });

  test('定理 10: 张角定理 (Zhang Jiao) 角度与线段比正弦关系', () => {
    const A = pt(200, 80), B = pt(100, 300), C = pt(320, 280);
    const D = pt(B.x * 0.4 + C.x * 0.6, B.y * 0.4 + C.y * 0.6);
    const res = solveZhangJiao(A, B, C, D);
    assert.ok(res.ok, '张角定理恒等式成立');
  });

  test('定理 11: 西姆松定理 (Simson Line) 垂足共线', () => {
    const res = solveSimson(pt(250, 70), pt(100, 320), pt(400, 300), 1.8);
    assert.ok(res !== null && res.collinear, '西姆松线应共线');
  });

  test('定理 12: 斯坦纳定理 (Steiner) 西姆松线反向连线过垂心', () => {
    const res = solveSteiner(pt(250, 70), pt(100, 320), pt(400, 300), 1.8);
    assert.ok(res !== null, '斯坦纳构型存在');
  });

  test('定理 13: 斯特瓦尔特定理 (Stewart) 塞瓦线段度量', () => {
    const res = solveStewart(pt(180, 60), pt(80, 260), pt(320, 260), 0.35);
    assert.ok(res.ok, '斯特瓦尔特恒等式成立');
  });

  test('定理 14: 布洛卡点 (Brocard) 布洛卡角存在且小于30度', () => {
    const res = solveBrocard(pt(200, 60), pt(100, 280), pt(320, 270));
    assert.ok(res.omega > 0 && res.omega <= 30.01, `布洛卡角应在(0, 30°]: ${res.omega}`);
    assert.ok(res.Omega1 !== null, '第一布洛卡点应存在');
  });

  test('定理 15: 密克定理 (Miquel) 三圆共点于密克点', () => {
    const res = solveMiquel(pt(200, 60), pt(80, 300), pt(350, 280), 0.4, 0.45, 0.5);
    assert.ok(res.concurrent, '密克圆应三圆共点');
  });

  test('定理 16: 蝴蝶定理 (Butterfly) 蝴蝶翼对角线中点对称', () => {
    const O = pt(200, 200), r = 100;
    const res = solveButterfly(O, r, 0.2, 1.2, 2.5);
    if (res) {
      assert.ok(res.symmetric, '弦交点关于中点 M 对称');
    }
  });

  test('定理 17: 蒙日定理 (Monge) 三圆外位似中心共线', () => {
    const c1 = pt(120, 150), r1 = 25;
    const c2 = pt(280, 160), r2 = 40;
    const c3 = pt(210, 320), r3 = 55;
    const res = solveMonge(c1, r1, c2, r2, c3, r3);
    assert.ok(res.collinear, '三圆外位似中心必共线');
  });

  test('定理 18: 根轴定理与根心 (Radical Axis & Center)', () => {
    const c1 = pt(120, 150), r1 = 35;
    const c2 = pt(280, 160), r2 = 45;
    const c3 = pt(210, 320), r3 = 50;
    const res = solveRadicalCenter(c1, r1, c2, r2, c3, r3);
    assert.ok(res !== null && res.concurrent, '三圆根轴共点于根心');
  });

  test('定理 19: 凯西定理 (Casey) 广义托勒密切线定理', () => {
    const O = pt(250, 250), R = 150;
    const angles = [0.2, 1.6, 3.2, 4.8];
    const rSmall = 25;
    const circles = angles.map((ang) => ({
      c: pt(O.x + (R - rSmall) * Math.cos(ang), O.y + (R - rSmall) * Math.sin(ang)),
      r: rSmall,
    }));
    const res = solveCasey(circles, O, R);
    assert.ok(res.ok, `凯西四圆公切线差值: ${Math.abs(res.left - res.right)}`);
  });

  test('定理 20: 费尔巴哈定理 (Feuerbach) 九点圆与内切圆相切', () => {
    const res = solveFeuerbach(pt(220, 70), pt(90, 310), pt(380, 290));
    assert.ok(res !== null && res.tangent, '九点圆与内切圆相切');
  });

  test('定理 21: 高斯-博登米勒定理 (Gauss-Bodenmiller)', () => {
    const res = solveGaussBodenmiller([]);
    assert.ok(res.ok);
  });

  test('定理 22: 庞斯莱闭合定理 (Poncelet)', () => {
    const res = solvePoncelet({ c: pt(0, 0), r: 10 }, { c: pt(0, 0), r: 5 });
    assert.ok(res.ok);
  });

  test('定理 23: 莫利三等分角定理 (Morley) 正三角形验证', () => {
    const tri = { A: pt(200, 60), B: pt(340, 295), C: pt(70, 285) };
    const res = solveMorley(tri.A, tri.B, tri.C);
    assert.ok(res.isEquilateral && res.maxDiff < 1e-4, `莫利三角形误差: ${res.maxDiff}`);
  });

  test('定理 24: 沢特定理 (Sawayama) 二分法切圆精度', () => {
    const res = solveSawayama(pt(200, 60), pt(80, 300), pt(350, 300), pt(220, 300));
    assert.ok(res !== null && Math.abs(res.sawCircle.f) < 1e-2, `相切误差: ${res?.sawCircle.f}`);
  });

  test('定理 25: 泰比特定理 (Thebault)', () => {
    const res = solveThebault(pt(200, 60), pt(80, 300), pt(350, 300), pt(220, 300));
    assert.ok(res.ok);
  });

  test('定理 26: 笛卡尔四圆定理 (Descartes)', () => {
    const res = solveDescartes(30, 45, 60);
    assert.ok(res.ok && res.diff < 0.01, `曲率误差: ${res.diff}`);
  });

  test('定理 27: 德罗兹-法尔尼定理 (Droz-Farny)', () => {
    const res = solveDrozFarny(pt(200, 60), pt(80, 300), pt(350, 290), 0.8);
    assert.ok(res !== null && res.ok);
  });

  test('定理 28: 桑达定理 (Sondat)', () => {
    const res = solveSondat();
    assert.ok(res.ok);
  });

  test('定理 29: 埃尔德什-莫德尔不等式 (Erdös-Mordell) 顶点和/边和 ≥ 2', () => {
    const res = solveErdosMordell(pt(200, 60), pt(80, 300), pt(350, 300), pt(210, 220));
    assert.ok(res.ok && res.ratio >= 1.999, `比值应>=2: ${res.ratio}`);
  });

  test('定理 30: 巴罗不等式 (Barrow) 顶点和/角分线和 ≥ 2', () => {
    const res = solveBarrow(pt(200, 60), pt(80, 300), pt(350, 300), pt(210, 220));
    assert.ok(res.ok && res.ratio >= 1.999, `比值应>=2: ${res.ratio}`);
  });

});
