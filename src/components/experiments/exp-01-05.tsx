'use client';

import React, { useState, useEffect } from 'react';
import type { Pt } from '../../lib/geom/types.ts';
import { pt, dist, fmt } from '../../lib/geom/vector.ts';
import {
  solveMenelaus, solveCeva, solveDesargues, solvePascal, solvePappus
} from '../../lib/geom/theorems-algo.ts';
import { Stage } from '../canvas/Stage.tsx';
import { Seg, LineAB, Dot, Circ, Poly, Handle } from '../canvas/Primitives.tsx';
import { Readout } from '../canvas/Readout.tsx';

interface ExpProps {
  onChallengeProgress?: (p: number, done: boolean) => void;
}

// ==========================================
// 1. 梅涅劳斯定理 (Menelaus)
// ==========================================
export function MenelausExp({ onChallengeProgress }: ExpProps) {
  const [pts, setPts] = useState<{ [k: string]: Pt }>({
    A: pt(110, 60),
    B: pt(350, 130),
    C: pt(190, 315),
    G1: pt(35, 215),
    G2: pt(395, 190),
  });

  const { A, B, C, G1, G2 } = pts;
  const res = solveMenelaus(A, B, C, G1, G2);

  // 计算边延长线段（当截点位于三角形边外部时，将边延长连接至该交点，如 BF 延长线）
  const extF = res.F ? (dist(A, res.F) > dist(A, B) + 0.5 ? { from: B, to: res.F } : dist(B, res.F) > dist(A, B) + 0.5 ? { from: A, to: res.F } : null) : null;
  const extD = res.D ? (dist(B, res.D) > dist(B, C) + 0.5 ? { from: C, to: res.D } : dist(C, res.D) > dist(B, C) + 0.5 ? { from: B, to: res.D } : null) : null;
  const extE = res.E ? (dist(C, res.E) > dist(C, A) + 0.5 ? { from: A, to: res.E } : dist(A, res.E) > dist(C, A) + 0.5 ? { from: C, to: res.E } : null) : null;

  // 靶向挑战：调整截线使截点 F 将边 AB 分成 1:2 (r1 ≈ 0.5)
  useEffect(() => {
    if (!Number.isFinite(res.r1)) return;
    const diff = Math.abs(res.r1 - 0.5);
    const progress = Math.max(0, Math.min(100, (1 - diff / 0.5) * 100));
    const done = diff < 0.05 && res.ok;
    onChallengeProgress?.(progress, done);
  }, [res.r1, res.ok, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56, 189, 248, 0.06)" w={2.2} />
        <LineAB a={G1} b={G2} stroke="#fb7185" w={2} dash="6 4" />

        {/* 边延长线（确保外部交点如 BF、CD、AE 严格连结完整，实线高对比度展示） */}
        {extF && <Seg a={extF.from} b={extF.to} stroke="#38bdf8" w={2.2} opacity={0.95} />}
        {extD && <Seg a={extD.from} b={extD.to} stroke="#38bdf8" w={2.2} opacity={0.95} />}
        {extE && <Seg a={extE.from} b={extE.to} stroke="#38bdf8" w={2.2} opacity={0.95} />}

        {/* 截线交点 */}
        {res.F && <Dot p={res.F} color="#fb7185" label="F" />}
        {res.D && <Dot p={res.D} color="#fb7185" label="D" />}
        {res.E && <Dot p={res.E} color="#fb7185" label="E" />}

        {/* 顶点控制 */}
        <Handle p={A} label="A" onMove={(p) => setPts((s) => ({ ...s, A: p }))} />
        <Handle p={B} label="B" onMove={(p) => setPts((s) => ({ ...s, B: p }))} />
        <Handle p={C} label="C" onMove={(p) => setPts((s) => ({ ...s, C: p }))} />

        {/* 截线双手柄控制 */}
        <Handle p={G1} label="截线" color="#fb7185" onMove={(p) => setPts((s) => ({ ...s, G1: p }))} />
        <Handle p={G2} color="#fb7185" onMove={(p) => setPts((s) => ({ ...s, G2: p }))} />
      </Stage>

      <Readout
        items={[
          { label: 'AF / FB', value: fmt(res.r1), tone: 'teal' },
          { label: 'BD / DC', value: fmt(res.r2), tone: 'teal' },
          { label: 'CE / EA', value: fmt(res.r3), tone: 'teal' },
          { label: '三个比值乘积', value: fmt(res.prod, 4), tone: 'gold', ok: res.ok },
        ]}
        verified={res.ok}
        onReset={() =>
          setPts({
            A: pt(110, 60),
            B: pt(350, 130),
            C: pt(190, 315),
            G1: pt(35, 215),
            G2: pt(395, 190),
          })
        }
      />
    </div>
  );
}

// ==========================================
// 2. 塞瓦定理 (Ceva)
// ==========================================
export function CevaExp({ onChallengeProgress }: ExpProps) {
  const [pts, setPts] = useState<{ [k: string]: Pt }>({
    A: pt(200, 50),
    B: pt(80, 320),
    C: pt(370, 300),
    P: pt(210, 220),
  });

  const { A, B, C, P } = pts;
  const res = solveCeva(A, B, C, P);

  // 挑战：塞瓦点靠近重心 (r1 ≈ 1)
  useEffect(() => {
    if (!Number.isFinite(res.r1)) return;
    const diff = Math.abs(res.r1 - 1.0) + Math.abs(res.r2 - 1.0) + Math.abs(res.r3 - 1.0);
    const progress = Math.max(0, Math.min(100, (1 - diff / 1.5) * 100));
    onChallengeProgress?.(progress, diff < 0.15 && res.ok);
  }, [res.r1, res.r2, res.r3, res.ok, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Poly pts={[A, B, C]} stroke="#38bdf8" fill="rgba(56, 189, 248, 0.06)" w={2.2} />

        {/* 塞瓦线 */}
        {res.D && <Seg a={A} b={res.D} stroke="#94a3b8" dash="4 3" w={1.8} />}
        {res.E && <Seg a={B} b={res.E} stroke="#94a3b8" dash="4 3" w={1.8} />}
        {res.F && <Seg a={C} b={res.F} stroke="#94a3b8" dash="4 3" w={1.8} />}

        {res.D && <Dot p={res.D} color="#34d399" label="D" />}
        {res.E && <Dot p={res.E} color="#34d399" label="E" />}
        {res.F && <Dot p={res.F} color="#34d399" label="F" />}

        <Handle p={A} label="A" onMove={(p) => setPts((s) => ({ ...s, A: p }))} />
        <Handle p={B} label="B" onMove={(p) => setPts((s) => ({ ...s, B: p }))} />
        <Handle p={C} label="C" onMove={(p) => setPts((s) => ({ ...s, C: p }))} />
        <Handle p={P} label="P" color="#34d399" onMove={(p) => setPts((s) => ({ ...s, P: p }))} />
      </Stage>

      <Readout
        items={[
          { label: 'AF / FB', value: fmt(res.r1), tone: 'teal' },
          { label: 'BD / DC', value: fmt(res.r2), tone: 'teal' },
          { label: 'CE / EA', value: fmt(res.r3), tone: 'teal' },
          { label: '塞瓦比值乘积', value: fmt(res.prod, 4), tone: 'gold', ok: res.ok },
        ]}
        verified={res.ok}
        onReset={() =>
          setPts({
            A: pt(200, 50),
            B: pt(80, 320),
            C: pt(370, 300),
            P: pt(210, 220),
          })
        }
      />
    </div>
  );
}

// ==========================================
// 3. 迪沙格定理 (Desargues)
// ==========================================
export function DesarguesExp({ onChallengeProgress }: ExpProps) {
  const [pts, setPts] = useState({
    S: pt(90, 80),
    A1: pt(170, 140),
    B1: pt(140, 270),
    C1: pt(270, 210),
  });

  const { S, A1, B1, C1 } = pts;
  const res = solveDesargues(S, A1, B1, C1, 1.9, 1.7, 1.85);

  useEffect(() => {
    onChallengeProgress?.(res.collinear ? 100 : 60, res.collinear);
  }, [res.collinear, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        {/* 透视中心连线 */}
        <LineAB a={S} b={A1} stroke="#64748b" dash="3 3" opacity={0.4} />
        <LineAB a={S} b={B1} stroke="#64748b" dash="3 3" opacity={0.4} />
        <LineAB a={S} b={C1} stroke="#64748b" dash="3 3" opacity={0.4} />

        {/* 两透视三角形 */}
        <Poly pts={[A1, B1, C1]} stroke="#38bdf8" fill="rgba(56, 189, 248, 0.08)" w={2} />
        <Poly pts={[res.A2, res.B2, res.C2]} stroke="#818cf8" fill="rgba(129, 140, 248, 0.08)" w={2} />

        {/* 对应边延长线交于 P, Q, R */}
        {res.P && (
          <>
            <Seg a={B1} b={res.P} stroke="#38bdf8" dash="3 3" opacity={0.6} />
            <Seg a={res.B2} b={res.P} stroke="#818cf8" dash="3 3" opacity={0.6} />
          </>
        )}
        {res.Q && (
          <>
            <Seg a={C1} b={res.Q} stroke="#38bdf8" dash="3 3" opacity={0.6} />
            <Seg a={res.C2} b={res.Q} stroke="#818cf8" dash="3 3" opacity={0.6} />
          </>
        )}
        {res.R && (
          <>
            <Seg a={A1} b={res.R} stroke="#38bdf8" dash="3 3" opacity={0.6} />
            <Seg a={res.A2} b={res.R} stroke="#818cf8" dash="3 3" opacity={0.6} />
          </>
        )}

        {/* 迪沙格轴 */}
        {res.P && res.Q && <LineAB a={res.P} b={res.Q} stroke="#f43f5e" w={2.2} />}
        {res.P && <Dot p={res.P} color="#f43f5e" label="P" />}
        {res.Q && <Dot p={res.Q} color="#f43f5e" label="Q" />}
        {res.R && <Dot p={res.R} color="#f43f5e" label="R" />}

        <Handle p={S} label="S" color="#fbbf24" onMove={(p) => setPts((s) => ({ ...s, S: p }))} />
        <Handle p={A1} label="A1" onMove={(p) => setPts((s) => ({ ...s, A1: p }))} />
        <Handle p={B1} label="B1" onMove={(p) => setPts((s) => ({ ...s, B1: p }))} />
        <Handle p={C1} label="C1" onMove={(p) => setPts((s) => ({ ...s, C1: p }))} />
      </Stage>

      <Readout
        items={[
          { label: '透视中心 S', value: `(${Math.round(S.x)}, ${Math.round(S.y)})` },
          { label: '交点 P, Q, R', value: res.collinear ? '严格共线' : '未共线', tone: 'gold' },
          { label: '迪沙格轴状态', value: '唯一确定', tone: 'teal' },
          { label: '对偶射影关系', value: '成立', ok: res.collinear },
        ]}
        verified={res.collinear}
      />
    </div>
  );
}

// ==========================================
// 4. 帕斯卡定理 (Pascal)
// ==========================================
export function PascalExp({ onChallengeProgress }: ExpProps) {
  const [angles, setAngles] = useState<[number, number, number, number, number, number]>([
    0.2, 0.9, 2.1, 3.4, 4.2, 5.5,
  ]);
  const O = pt(250, 250);
  const r = 130;

  const res = solvePascal(angles, O, r);

  useEffect(() => {
    onChallengeProgress?.(res.collinear ? 100 : 70, res.collinear);
  }, [res.collinear, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <Circ c={O} r={r} stroke="#38bdf8" opacity={0.7} />
        <Poly pts={res.P} stroke="#94a3b8" fill="rgba(148, 163, 184, 0.05)" w={1.6} />

        {/* 对边延长线交于 X, Y, Z */}
        {res.X && res.P[1] && res.P[4] && (
          <>
            <Seg a={res.P[1]} b={res.X} stroke="#94a3b8" dash="3 3" opacity={0.5} />
            <Seg a={res.P[4]} b={res.X} stroke="#94a3b8" dash="3 3" opacity={0.5} />
          </>
        )}
        {res.Y && res.P[2] && res.P[5] && (
          <>
            <Seg a={res.P[2]} b={res.Y} stroke="#94a3b8" dash="3 3" opacity={0.5} />
            <Seg a={res.P[5]} b={res.Y} stroke="#94a3b8" dash="3 3" opacity={0.5} />
          </>
        )}
        {res.Z && res.P[3] && res.P[0] && (
          <>
            <Seg a={res.P[3]} b={res.Z} stroke="#94a3b8" dash="3 3" opacity={0.5} />
            <Seg a={res.P[0]} b={res.Z} stroke="#94a3b8" dash="3 3" opacity={0.5} />
          </>
        )}

        {/* 帕斯卡线 */}
        {res.X && res.Y && <LineAB a={res.X} b={res.Y} stroke="#f43f5e" w={2.2} />}
        {res.X && <Dot p={res.X} color="#f43f5e" label="X" />}
        {res.Y && <Dot p={res.Y} color="#f43f5e" label="Y" />}
        {res.Z && <Dot p={res.Z} color="#f43f5e" label="Z" />}

        {res.P.map((p, idx) => (
          <Handle
            key={idx}
            p={p}
            label={`P${idx + 1}`}
            color="#38bdf8"
            onMove={(np) => {
              const ang = Math.atan2(np.y - O.y, np.x - O.x);
              setAngles((prev) => {
                const next = [...prev] as [number, number, number, number, number, number];
                next[idx] = ang;
                return next;
              });
            }}
          />
        ))}
      </Stage>

      <Readout
        items={[
          { label: '圆内接六边形', value: 'P1~P6 顺次连结' },
          { label: '对边交点 X, Y, Z', value: res.collinear ? '三点共线' : '计算中', tone: 'gold' },
          { label: '帕斯卡线', value: '存在且唯一', tone: 'teal' },
          { label: '定理验证状态', value: '严格成立', ok: res.collinear },
        ]}
        verified={res.collinear}
      />
    </div>
  );
}

// ==========================================
// 5. 帕普斯定理 (Pappus)
// ==========================================
export function PappusExp({ onChallengeProgress }: ExpProps) {
  const [l1, setL1] = useState({ a: pt(50, 100), b: pt(420, 110) });
  const [l2, setL2] = useState({ a: pt(60, 320), b: pt(430, 310) });

  const res = solvePappus(l1.a, l1.b, l2.a, l2.b, [0.1, 0.45, 0.85], [0.15, 0.5, 0.9]);

  useEffect(() => {
    onChallengeProgress?.(res.collinear ? 100 : 70, res.collinear);
  }, [res.collinear, onChallengeProgress]);

  return (
    <div className="space-y-4">
      <Stage>
        <LineAB a={l1.a} b={l1.b} stroke="#64748b" w={2} />
        <LineAB a={l2.a} b={l2.b} stroke="#64748b" w={2} />

        {/* 交叉连线 */}
        <Seg a={res.A[0]} b={res.B[1]} stroke="#94a3b8" dash="4 3" />
        <Seg a={res.A[1]} b={res.B[0]} stroke="#94a3b8" dash="4 3" />
        <Seg a={res.A[1]} b={res.B[2]} stroke="#94a3b8" dash="4 3" />
        <Seg a={res.A[2]} b={res.B[1]} stroke="#94a3b8" dash="4 3" />
        <Seg a={res.A[2]} b={res.B[0]} stroke="#94a3b8" dash="4 3" />
        <Seg a={res.A[0]} b={res.B[2]} stroke="#94a3b8" dash="4 3" />

        {/* 帕普斯线 */}
        {res.X && res.Y && <LineAB a={res.X} b={res.Y} stroke="#f59e0b" w={2.2} />}
        {res.X && <Dot p={res.X} color="#f59e0b" label="X" />}
        {res.Y && <Dot p={res.Y} color="#f59e0b" label="Y" />}
        {res.Z && <Dot p={res.Z} color="#f59e0b" label="Z" />}

        {res.A.map((p, i) => (
          <Dot key={`a-${i}`} p={p} color="#38bdf8" label={`A${i + 1}`} />
        ))}
        {res.B.map((p, i) => (
          <Dot key={`b-${i}`} p={p} color="#38bdf8" label={`B${i + 1}`} />
        ))}

        <Handle p={l1.a} onMove={(p) => setL1((s) => ({ ...s, a: p }))} />
        <Handle p={l1.b} onMove={(s2) => setL1((s) => ({ ...s, b: s2 }))} />
        <Handle p={l2.a} onMove={(p) => setL2((s) => ({ ...s, a: p }))} />
        <Handle p={l2.b} onMove={(s2) => setL2((s) => ({ ...s, b: s2 }))} />
      </Stage>

      <Readout
        items={[
          { label: '直线 L1, L2', value: '任意两条' },
          { label: '对角交点 X, Y, Z', value: res.collinear ? '三点共线' : '计算中', tone: 'gold' },
          { label: '帕普斯线', value: '严格成立', tone: 'teal' },
          { label: '几何验证', value: '✅ 成立', ok: res.collinear },
        ]}
        verified={res.collinear}
      />
    </div>
  );
}
