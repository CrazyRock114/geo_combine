'use client';

import React, { useState, useEffect } from 'react';
import type { Pt } from '../../lib/geom/types.ts';
import { pt, dist, fmt } from '../../lib/geom/vector.ts';
import {
  solveBrianchon, solvePtolemy, solveBrahmagupta, solvePowerOfPoint, solveZhangJiao
} from '../../lib/geom/theorems-algo.ts';
import { Stage } from '../canvas/Stage.tsx';
import { Seg, LineAB, Dot, Circ, Poly, Handle } from '../canvas/Primitives.tsx';
import { Readout } from '../canvas/Readout.tsx';

interface ExpProps {
  onChallengeProgress?: (p: number, done: boolean) => void;
}

// 6. 布里昂雄定理
export function BrianchonExp({ onChallengeProgress }: ExpProps) {
  const [angles, setAngles] = useState<[number, number, number, number, number, number]>([
    0.1, 1.1, 2.2, 3.2, 4.3, 5.4,
  ]);
  const O = pt(250, 250);
  const r = 90;
  const res = solveBrianchon(angles, O, r);

  useEffect(() => {
    onChallengeProgress?.(res.concurrent ? 100 : 70, res.concurrent);
  }, [res.concurrent, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={O} r={r} stroke="#38bdf8" dash="4 3" opacity={0.6} />
        {res.V.length === 6 && <Poly pts={res.V} stroke="#818cf8" fill="rgba(129,140,248,0.06)" w={2} />}

        {/* 三条主对角线 */}
        {res.V.length === 6 && (
          <>
            <Seg a={res.V[0]} b={res.V[3]} stroke="#f43f5e" w={2} />
            <Seg a={res.V[1]} b={res.V[4]} stroke="#f43f5e" w={2} />
            <Seg a={res.V[2]} b={res.V[5]} stroke="#f43f5e" w={2} />
          </>
        )}
        {res.center && <Dot p={res.center} color="#fbbf24" label="布里昂雄点" />}
      </Stage>

      <Readout
        items={[
          { label: '圆外切六边形', value: '6 条切线围成' },
          { label: '主对角线交点', value: res.concurrent ? '三线严格共点' : '计算中', tone: 'gold' },
          { label: '对偶定理', value: '帕斯卡对偶', tone: 'teal' },
          { label: '几何状态', value: '✅ 成立', ok: res.concurrent },
        ]}
        verified={res.concurrent}
      />
    </div>
  );
}

// 7. 托勒密定理
export function PtolemyExp({ onChallengeProgress }: ExpProps) {
  const O = pt(250, 250);
  const R = 130;
  const [angles, setAngles] = useState([0.3, 1.6, 3.1, 4.8]);

  const A = pt(O.x + R * Math.cos(angles[0]), O.y + R * Math.sin(angles[0]));
  const B = pt(O.x + R * Math.cos(angles[1]), O.y + R * Math.sin(angles[1]));
  const C = pt(O.x + R * Math.cos(angles[2]), O.y + R * Math.sin(angles[2]));
  const D = pt(O.x + R * Math.cos(angles[3]), O.y + R * Math.sin(angles[3]));

  const res = solvePtolemy(A, B, C, D);

  useEffect(() => {
    onChallengeProgress?.(res.ok ? 100 : 70, res.ok);
  }, [res.ok, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={O} r={R} stroke="#64748b" dash="4 3" opacity={0.6} />
        <Poly pts={[A, B, C, D]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />

        {/* 对角线 */}
        <Seg a={A} b={C} stroke="#f59e0b" w={2.2} />
        <Seg a={B} b={D} stroke="#f59e0b" w={2.2} />

        {[A, B, C, D].map((p, i) => (
          <Handle
            key={i}
            p={p}
            label={['A', 'B', 'C', 'D'][i]}
            onMove={(np) => {
              const ang = Math.atan2(np.y - O.y, np.x - O.x);
              setAngles((prev) => {
                const next = [...prev];
                next[i] = ang;
                return next;
              });
            }}
          />
        ))}
      </Stage>

      <Readout
        items={[
          { label: '对角线之积 AC·BD', value: fmt(res.prodDiag, 1), tone: 'gold' },
          { label: '对边积之和 AB·CD+BC·DA', value: fmt(res.sumOpp, 1), tone: 'gold' },
          { label: '绝对偏差', value: fmt(res.diff, 4), tone: 'teal' },
          { label: '恒等式验证', value: res.ok ? '✅ 严格相等' : '偏差', ok: res.ok },
        ]}
        verified={res.ok}
      />
    </div>
  );
}

// 8. 婆罗摩笈多定理
export function BrahmaguptaExp({ onChallengeProgress }: ExpProps) {
  const O = pt(250, 250);
  const R = 120;
  const [A, setA] = useState(pt(250, 130));
  const [C, setC] = useState(pt(250, 370));
  const [B, setB] = useState(pt(130, 250));
  const [D, setD] = useState(pt(370, 250));

  const res = solveBrahmagupta(A, B, C, D);

  useEffect(() => {
    onChallengeProgress?.(res && res.ok ? 100 : 60, res?.ok ?? false);
  }, [res, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={O} r={R} stroke="#64748b" dash="4 3" opacity={0.6} />
        <Poly pts={[A, B, C, D]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />
        <Seg a={A} b={C} stroke="#94a3b8" w={1.6} />
        <Seg a={B} b={D} stroke="#94a3b8" w={1.6} />

        {res && (
          <>
            <Dot p={res.P} color="#fbbf24" label="P" />
            <Seg a={res.P} b={res.F} stroke="#f43f5e" w={2} />
            <Dot p={res.F} color="#f43f5e" label="F" />
            <Seg a={res.P} b={res.midAB} stroke="#34d399" dash="3 3" w={1.8} />
            <Dot p={res.midAB} color="#34d399" label="M(中点)" />
          </>
        )}

        <Handle p={A} label="A" onMove={setA} />
        <Handle p={B} label="B" onMove={setB} />
        <Handle p={C} label="C" onMove={setC} />
        <Handle p={D} label="D" onMove={setD} />
      </Stage>

      <Readout
        items={[
          { label: '对角线垂直', value: 'AC ⊥ BD' },
          { label: '垂线 PF', value: 'PF ⊥ CD' },
          { label: '反向延长线', value: '平分对边 AB', tone: 'gold' },
          { label: '几何性质', value: '✅ 严格成立', ok: res?.ok },
        ]}
        verified={res?.ok ?? false}
      />
    </div>
  );
}

// 9. 圆幂定理
export function PowerExp({ onChallengeProgress }: ExpProps) {
  const [P, setP] = useState(pt(70, 70));
  const O = pt(250, 250);
  const r = 90;
  const res = solvePowerOfPoint(P, O, r, 0.65, 1.15);

  useEffect(() => {
    onChallengeProgress?.(res.ok ? 100 : 70, res.ok);
  }, [res.ok, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={O} r={r} stroke="#38bdf8" w={2} />
        <Dot p={O} color="#38bdf8" label="O" />

        {/* 割线 1 */}
        {res.sec1.length === 2 && (
          <>
            <LineAB a={P} b={res.sec1[0]} stroke="#f59e0b" dash="4 3" />
            <Dot p={res.sec1[0]} color="#f59e0b" label="A" />
            <Dot p={res.sec1[1]} color="#f59e0b" label="B" />
          </>
        )}

        {/* 割线 2 */}
        {res.sec2.length === 2 && (
          <>
            <LineAB a={P} b={res.sec2[0]} stroke="#34d399" dash="4 3" />
            <Dot p={res.sec2[0]} color="#34d399" label="C" />
            <Dot p={res.sec2[1]} color="#34d399" label="D" />
          </>
        )}

        <Handle p={P} label="P" color="#f43f5e" onMove={setP} />
      </Stage>

      <Readout
        items={[
          { label: '割线乘积 PA·PB', value: fmt(res.prod1, 1), tone: 'gold' },
          { label: '割线乘积 PC·PD', value: fmt(res.prod2, 1), tone: 'gold' },
          { label: '点相对于圆的圆幂', value: fmt(res.power, 1), tone: 'teal' },
          { label: '圆幂相等性', value: res.ok ? '✅ 严格恒等' : '偏差', ok: res.ok },
        ]}
        verified={res.ok}
      />
    </div>
  );
}

// 10. 张角定理
export function ZhangjiaoExp({ onChallengeProgress }: ExpProps) {
  const [pts, setPts] = useState({
    A: pt(200, 70),
    B: pt(80, 310),
    C: pt(370, 290),
    tD: 0.45,
  });

  const { A, B, C, tD } = pts;
  const D = pt(B.x * (1 - tD) + C.x * tD, B.y * (1 - tD) + C.y * tD);
  const res = solveZhangJiao(A, B, C, D);

  useEffect(() => {
    onChallengeProgress?.(res.ok ? 100 : 70, res.ok);
  }, [res.ok, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56,189,248,0.06)" w={2} />
        <Seg a={A} b={D} stroke="#f59e0b" w={2.2} />
        <Dot p={D} color="#f59e0b" label="D" />

        <Handle p={A} label="A" onMove={(p) => setPts((s) => ({ ...s, A: p }))} />
        <Handle p={B} label="B" onMove={(p) => setPts((s) => ({ ...s, B: p }))} />
        <Handle p={C} label="C" onMove={(p) => setPts((s) => ({ ...s, C: p }))} />
        <Handle
          p={D}
          label="D(分点)"
          color="#f59e0b"
          onMove={(np) => {
            const bcLen = dist(B, C);
            const proj = ((np.x - B.x) * (C.x - B.x) + (np.y - B.y) * (C.y - B.y)) / (bcLen * bcLen);
            setPts((s) => ({ ...s, tD: Math.max(0.1, Math.min(0.9, proj)) }));
          }}
        />
      </Stage>

      <Readout
        items={[
          { label: '左边: sin(α+β)/AD', value: fmt(res.left, 4), tone: 'gold' },
          { label: '右边: sinβ/AB + sinα/AC', value: fmt(res.right, 4), tone: 'gold' },
          { label: '绝对差值', value: fmt(Math.abs(res.left - res.right), 5), tone: 'teal' },
          { label: '张角公式验证', value: res.ok ? '✅ 严格相等' : '偏差', ok: res.ok },
        ]}
        verified={res.ok}
      />
    </div>
  );
}
