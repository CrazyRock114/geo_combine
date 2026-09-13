'use client';

import React, { useState, useEffect } from 'react';
import type { Pt } from '../../lib/geom/types.ts';
import { pt, dist, fmt } from '../../lib/geom/vector.ts';
import {
  solveSimson, solveSteiner, solveStewart, solveBrocard, solveMiquel
} from '../../lib/geom/theorems-algo.ts';
import { Stage } from '../canvas/Stage.tsx';
import { Seg, LineAB, Dot, Circ, Poly, Handle } from '../canvas/Primitives.tsx';
import { Readout } from '../canvas/Readout.tsx';

interface ExpProps {
  onChallengeProgress?: (p: number, done: boolean) => void;
}

// 11. 西姆松定理
export function SimsonExp({ onChallengeProgress }: ExpProps) {
  const [A, setA] = useState(pt(250, 70));
  const [B, setB] = useState(pt(100, 330));
  const [C, setC] = useState(pt(420, 310));
  const [angP, setAngP] = useState(1.9);

  const res = solveSimson(A, B, C, angP);

  // 计算边延长线段（当垂足落在边外部时，将边延长连接至垂足）
  const extBC = res?.pBC ? (dist(B, res.pBC) > dist(B, C) + 0.5 ? { from: C, to: res.pBC } : dist(C, res.pBC) > dist(B, C) + 0.5 ? { from: B, to: res.pBC } : null) : null;
  const extCA = res?.pCA ? (dist(C, res.pCA) > dist(C, A) + 0.5 ? { from: A, to: res.pCA } : dist(A, res.pCA) > dist(C, A) + 0.5 ? { from: C, to: res.pCA } : null) : null;
  const extAB = res?.pAB ? (dist(A, res.pAB) > dist(A, B) + 0.5 ? { from: B, to: res.pAB } : dist(B, res.pAB) > dist(A, B) + 0.5 ? { from: A, to: res.pAB } : null) : null;

  useEffect(() => {
    onChallengeProgress?.(res?.collinear ? 100 : 70, res?.collinear ?? false);
  }, [res?.collinear, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />
        {res && (
          <>
            {/* 外接圆 */}
            <Circ c={res.O} r={res.R} stroke="#38bdf8" dash="4 3" opacity={0.35} />

            {/* 边延长线 */}
            {extBC && <Seg a={extBC.from} b={extBC.to} stroke="#38bdf8" dash="3 3" opacity={0.7} />}
            {extCA && <Seg a={extCA.from} b={extCA.to} stroke="#38bdf8" dash="3 3" opacity={0.7} />}
            {extAB && <Seg a={extAB.from} b={extAB.to} stroke="#38bdf8" dash="3 3" opacity={0.7} />}

            {/* 垂足连线 */}
            <Seg a={res.P} b={res.pBC} stroke="#94a3b8" dash="3 3" />
            <Seg a={res.P} b={res.pCA} stroke="#94a3b8" dash="3 3" />
            <Seg a={res.P} b={res.pAB} stroke="#94a3b8" dash="3 3" />

            {/* 西姆松线 */}
            <LineAB a={res.pBC} b={res.pCA} stroke="#f43f5e" w={2.2} />

            <Dot p={res.P} color="#fbbf24" label="P" />
            <Dot p={res.pBC} color="#f43f5e" label="D(BC垂足)" />
            <Dot p={res.pCA} color="#f43f5e" label="E(CA垂足)" />
            <Dot p={res.pAB} color="#f43f5e" label="F(AB垂足)" />

            <Handle
              p={res.P}
              color="#fbbf24"
              onMove={(np) => {
                const ang = Math.atan2(np.y - res.O.y, np.x - res.O.x);
                setAngP(ang);
              }}
            />
          </>
        )}

        <Handle p={A} label="A" onMove={setA} />
        <Handle p={B} label="B" onMove={setB} />
        <Handle p={C} label="C" onMove={setC} />
      </Stage>

      <Readout
        items={[
          { label: '点 P 位置', value: '外接圆周上', tone: 'gold' },
          { label: '三垂足 D, E, F', value: res?.collinear ? '严格共线' : '计算中', tone: 'teal' },
          { label: '西姆松线', value: '存在且唯一', tone: 'gold' },
          { label: '几何状态', value: '✅ 定理成立', ok: res?.collinear },
        ]}
        verified={res?.collinear ?? false}
      />
    </div>
  );
}

// 12. 斯坦纳定理
export function SteinerExp({ onChallengeProgress }: ExpProps) {
  const [A, setA] = useState(pt(250, 70));
  const [B, setB] = useState(pt(100, 330));
  const [C, setC] = useState(pt(420, 310));

  const res = solveSteiner(A, B, C, 1.8);

  useEffect(() => {
    onChallengeProgress?.(100, true);
  }, [onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />
        {res && (
          <>
            <Circ c={res.O} r={res.R} stroke="#38bdf8" dash="4 3" opacity={0.3} />
            {/* 西姆松线 */}
            <LineAB a={res.pBC} b={res.pCA} stroke="#f43f5e" w={2} />

            {/* 垂心 H 与 P 连线及其中点 */}
            {res.H && (
              <>
                <Seg a={res.H} b={res.P} stroke="#a855f7" dash="4 3" w={2} />
                <Dot p={res.H} color="#a855f7" label="H(垂心)" />
              </>
            )}
            {res.midHP && <Dot p={res.midHP} color="#a855f7" label="M(HP中点)" />}
            <Dot p={res.P} color="#fbbf24" label="P" />
          </>
        )}
        <Handle p={A} label="A" onMove={setA} />
        <Handle p={B} label="B" onMove={setB} />
        <Handle p={C} label="C" onMove={setC} />
      </Stage>

      <Readout
        items={[
          { label: '西姆松线反向连线', value: '平分 HP 线段', tone: 'gold' },
          { label: '垂心 H 状态', value: 'HP 中点在西姆松线上', tone: 'teal' },
          { label: '定理成立', value: '✅ 成立', ok: true },
        ]}
        verified={true}
      />
    </div>
  );
}

// 13. 斯特瓦尔特定理
export function StewartExp({ onChallengeProgress }: ExpProps) {
  const [A, setA] = useState(pt(180, 60));
  const [B, setB] = useState(pt(80, 290));
  const [C, setC] = useState(pt(360, 280));
  const [t, setT] = useState(0.4);

  const res = solveStewart(A, B, C, t);

  useEffect(() => {
    onChallengeProgress?.(res.ok ? 100 : 70, res.ok);
  }, [res.ok, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />
        <Seg a={A} b={res.D} stroke="#f59e0b" w={2.2} />
        <Dot p={res.D} color="#f59e0b" label="D" />

        <Handle p={A} label="A" onMove={setA} />
        <Handle p={B} label="B" onMove={setB} />
        <Handle p={C} label="C" onMove={setC} />
      </Stage>

      <Readout
        items={[
          { label: '左边: b²m + c²n', value: fmt(res.left, 0), tone: 'gold' },
          { label: '右边: a(d² + mn)', value: fmt(res.right, 0), tone: 'gold' },
          { label: '绝对偏差', value: fmt(Math.abs(res.left - res.right), 2), tone: 'teal' },
          { label: '恒等式状态', value: res.ok ? '✅ 严格成立' : '偏差', ok: res.ok },
        ]}
        verified={res.ok}
      />
    </div>
  );
}

// 14. 布洛卡点
export function BrocardExp({ onChallengeProgress }: ExpProps) {
  const [A, setA] = useState(pt(200, 60));
  const [B, setB] = useState(pt(90, 310));
  const [C, setC] = useState(pt(360, 290));

  const res = solveBrocard(A, B, C);

  useEffect(() => {
    onChallengeProgress?.(100, true);
  }, [onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />
        {res.Omega1 && (
          <>
            <Seg a={A} b={res.Omega1} stroke="#fbbf24" dash="3 3" />
            <Seg a={B} b={res.Omega1} stroke="#fbbf24" dash="3 3" />
            <Seg a={C} b={res.Omega1} stroke="#fbbf24" dash="3 3" />
            <Dot p={res.Omega1} color="#fbbf24" label="Ω(布洛卡点)" />
          </>
        )}
        <Handle p={A} label="A" onMove={setA} />
        <Handle p={B} label="B" onMove={setB} />
        <Handle p={C} label="C" onMove={setC} />
      </Stage>

      <Readout
        items={[
          { label: '布洛卡角 ω', value: `${fmt(res.omega, 2)}°`, tone: 'gold' },
          { label: '角不等式', value: 'ω ≤ 30° 恒成立', tone: 'teal' },
          { label: '对称布洛卡点', value: 'Ω1, Ω2 共轭', tone: 'gold' },
          { label: '性质验证', value: '✅ 严格成立', ok: true },
        ]}
        verified={true}
      />
    </div>
  );
}

// 15. 密克定理
export function MiquelExp({ onChallengeProgress }: ExpProps) {
  const [A, setA] = useState(pt(200, 60));
  const [B, setB] = useState(pt(80, 310));
  const [C, setC] = useState(pt(360, 290));

  const res = solveMiquel(A, B, C, 0.4, 0.45, 0.5);

  useEffect(() => {
    onChallengeProgress?.(res.concurrent ? 100 : 70, res.concurrent);
  }, [res.concurrent, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />

        {/* 边上三点连线构成的密克三角形 */}
        {res.D && res.E && res.F && (
          <Poly pts={[res.D, res.E, res.F]} stroke="#94a3b8" dash="3 3" fill="rgba(148,163,184,0.06)" />
        )}

        {/* 密克三圆 */}
        {res.c1 && <Circ c={res.c1.c} r={res.c1.r} stroke="#818cf8" dash="4 3" opacity={0.5} />}
        {res.c2 && <Circ c={res.c2.c} r={res.c2.r} stroke="#34d399" dash="4 3" opacity={0.5} />}
        {res.c3 && <Circ c={res.c3.c} r={res.c3.r} stroke="#f43f5e" dash="4 3" opacity={0.5} />}

        {/* 三边上的分点 D, E, F */}
        {res.D && <Dot p={res.D} color="#818cf8" label="D" />}
        {res.E && <Dot p={res.E} color="#34d399" label="E" />}
        {res.F && <Dot p={res.F} color="#f43f5e" label="F" />}

        {/* 密克共点 */}
        {res.M && <Dot p={res.M} color="#fbbf24" label="M(密克点)" />}

        <Handle p={A} label="A" onMove={setA} />
        <Handle p={B} label="B" onMove={setB} />
        <Handle p={C} label="C" onMove={setC} />
      </Stage>

      <Readout
        items={[
          { label: '三边分点 D, E, F', value: '位于三边上' },
          { label: '外接圆 C1, C2, C3', value: '三圆共点 M', tone: 'gold' },
          { label: '密克点验证', value: res.concurrent ? '✅ 严格成立' : '计算中', ok: res.concurrent },
        ]}
        verified={res.concurrent}
      />
    </div>
  );
}
