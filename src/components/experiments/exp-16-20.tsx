'use client';

import React, { useState, useEffect } from 'react';
import type { Pt } from '../../lib/geom/types.ts';
import { pt, dist, fmt } from '../../lib/geom/vector.ts';
import {
  solveButterfly, solveMonge, solveRadicalCenter, solveCasey, solveFeuerbach
} from '../../lib/geom/theorems-algo.ts';
import { Stage } from '../canvas/Stage.tsx';
import { Seg, LineAB, Dot, Circ, Poly, Handle } from '../canvas/Primitives.tsx';
import { Readout } from '../canvas/Readout.tsx';

interface ExpProps {
  onChallengeProgress?: (p: number, done: boolean) => void;
}

// 16. 蝴蝶定理
export function ButterflyExp({ onChallengeProgress }: ExpProps) {
  const O = pt(250, 250);
  const r = 130;
  const res = solveButterfly(O, r, 0.2, 1.25, 2.45);

  useEffect(() => {
    onChallengeProgress?.(res?.symmetric ? 100 : 70, res?.symmetric ?? false);
  }, [res?.symmetric, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={O} r={r} stroke="#38bdf8" w={2} opacity={0.7} />
        {res && (
          <>
            <Seg a={res.X} b={res.Y} stroke="#64748b" w={2} />
            <Seg a={res.A} b={res.B} stroke="#f59e0b" w={1.8} />
            <Seg a={res.C} b={res.D} stroke="#f59e0b" w={1.8} />

            <Seg a={res.A} b={res.D} stroke="#818cf8" dash="3 3" />
            <Seg a={res.B} b={res.C} stroke="#818cf8" dash="3 3" />

            <Dot p={res.M} color="#fbbf24" label="M(中点)" />
            {res.P && <Dot p={res.P} color="#f43f5e" label="P" />}
            {res.Q && <Dot p={res.Q} color="#f43f5e" label="Q" />}
          </>
        )}
      </Stage>

      <Readout
        items={[
          { label: '主弦 XY 中点 M', value: '平分弦 XY' },
          { label: '交点对称性 PM = QM', value: res?.symmetric ? '严格相等' : '计算中', tone: 'gold' },
          { label: '蝴蝶构型', value: '自对称闭合', tone: 'teal' },
          { label: '定理状态', value: '✅ 成立', ok: res?.symmetric },
        ]}
        verified={res?.symmetric ?? false}
      />
    </div>
  );
}

// 17. 蒙日定理
export function MongeExp({ onChallengeProgress }: ExpProps) {
  const c1 = pt(120, 160), r1 = 30;
  const c2 = pt(280, 150), r2 = 45;
  const c3 = pt(220, 340), r3 = 60;
  const res = solveMonge(c1, r1, c2, r2, c3, r3);

  useEffect(() => {
    onChallengeProgress?.(res.collinear ? 100 : 70, res.collinear);
  }, [res.collinear, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={c1} r={r1} stroke="#38bdf8" />
        <Circ c={c2} r={r2} stroke="#38bdf8" />
        <Circ c={c3} r={r3} stroke="#38bdf8" />

        {res.P12 && res.P23 && <LineAB a={res.P12} b={res.P23} stroke="#f43f5e" w={2.2} />}
        {res.P12 && <Dot p={res.P12} color="#f43f5e" label="P12" />}
        {res.P23 && <Dot p={res.P23} color="#f43f5e" label="P23" />}
        {res.P31 && <Dot p={res.P31} color="#f43f5e" label="P31" />}
      </Stage>

      <Readout
        items={[
          { label: '三圆外位似中心', value: 'P12, P23, P31' },
          { label: '蒙日线状态', value: res.collinear ? '三点严格共线' : '计算中', tone: 'gold' },
          { label: '几何对偶', value: '德萨格对偶', tone: 'teal' },
          { label: '定理验证', value: '✅ 成立', ok: res.collinear },
        ]}
        verified={res.collinear}
      />
    </div>
  );
}

// 18. 根轴定理与根心
export function RadicalExp({ onChallengeProgress }: ExpProps) {
  const c1 = pt(140, 160), r1 = 40;
  const c2 = pt(290, 170), r2 = 50;
  const c3 = pt(210, 330), r3 = 55;
  const res = solveRadicalCenter(c1, r1, c2, r2, c3, r3);

  useEffect(() => {
    onChallengeProgress?.(res?.concurrent ? 100 : 70, res?.concurrent ?? false);
  }, [res?.concurrent, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={c1} r={r1} stroke="#38bdf8" />
        <Circ c={c2} r={r2} stroke="#38bdf8" />
        <Circ c={c3} r={r3} stroke="#38bdf8" />

        {res?.l12 && <LineAB a={res.l12.a} b={res.l12.b} stroke="#f59e0b" dash="4 3" />}
        {res?.l23 && <LineAB a={res.l23.a} b={res.l23.b} stroke="#f59e0b" dash="4 3" />}
        {res?.l31 && <LineAB a={res.l31.a} b={res.l31.b} stroke="#f59e0b" dash="4 3" />}

        {res?.K && <Dot p={res.K} color="#fbbf24" label="K(根心)" />}
      </Stage>

      <Readout
        items={[
          { label: '三圆两两根轴', value: '3 条等幂线' },
          { label: '根心交点 K', value: res?.concurrent ? '三线共点' : '计算中', tone: 'gold' },
          { label: '等圆幂性质', value: 'Power(K) 恒等', tone: 'teal' },
          { label: '定理验证', value: '✅ 成立', ok: res?.concurrent },
        ]}
        verified={res?.concurrent ?? false}
      />
    </div>
  );
}

// 19. 凯西定理
export function CaseyExp({ onChallengeProgress }: ExpProps) {
  const O = pt(250, 250), R = 140;
  const angles = [0.2, 1.6, 3.2, 4.8];
  const rSmall = 25;
  const circles = angles.map((ang) => ({
    c: pt(O.x + (R - rSmall) * Math.cos(ang), O.y + (R - rSmall) * Math.sin(ang)),
    r: rSmall,
  }));
  const res = solveCasey(circles, O, R);

  useEffect(() => {
    onChallengeProgress?.(res.ok ? 100 : 70, res.ok);
  }, [res.ok, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={O} r={R} stroke="#64748b" dash="4 3" />
        {circles.map((c, i) => (
          <Circ key={i} c={c.c} r={c.r} stroke="#38bdf8" />
        ))}
      </Stage>

      <Readout
        items={[
          { label: 't12·t34 + t14·t23', value: fmt(res.left, 0), tone: 'gold' },
          { label: 't13·t24', value: fmt(res.right, 0), tone: 'gold' },
          { label: '绝对差值', value: fmt(Math.abs(res.left - res.right), 2), tone: 'teal' },
          { label: '广义托勒密恒等式', value: res.ok ? '✅ 严格成立' : '偏差', ok: res.ok },
        ]}
        verified={res.ok}
      />
    </div>
  );
}

// 20. 费尔巴哈定理
export function FeuerbachExp({ onChallengeProgress }: ExpProps) {
  const [A, setA] = useState(pt(220, 60));
  const [B, setB] = useState(pt(90, 320));
  const [C, setC] = useState(pt(390, 300));

  const res = solveFeuerbach(A, B, C);

  useEffect(() => {
    onChallengeProgress?.(res?.tangent ? 100 : 70, res?.tangent ?? false);
  }, [res?.tangent, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />
        {res && (
          <>
            {/* 九点圆 */}
            <Circ c={res.npc.c} r={res.npc.r} stroke="#f59e0b" w={2} />
            {/* 内切圆 */}
            <Circ c={res.inc.c} r={res.inc.r} stroke="#34d399" w={2} />
            <Dot p={res.npc.c} color="#f59e0b" label="N(九点圆心)" />
            <Dot p={res.inc.c} color="#34d399" label="I(内心)" />
          </>
        )}
        <Handle p={A} label="A" onMove={setA} />
        <Handle p={B} label="B" onMove={setB} />
        <Handle p={C} label="C" onMove={setC} />
      </Stage>

      <Readout
        items={[
          { label: '圆心距 d(N, I)', value: fmt(res?.centerDist, 2), tone: 'gold' },
          { label: '半径差 |R_9 - r|', value: fmt(res?.radiusDiff, 2), tone: 'gold' },
          { label: '相切充要条件', value: 'd = R_9 - r', tone: 'teal' },
          { label: '费尔巴哈相切', value: res?.tangent ? '✅ 内切成立' : '计算中', ok: res?.tangent },
        ]}
        verified={res?.tangent ?? false}
      />
    </div>
  );
}
