'use client';

import React, { useContext, useCallback } from 'react';
import type { Pt } from '../../lib/geom/types.ts';
import { clipLineToBox } from '../../lib/geom/lines.ts';
import { StageContext } from './Stage.tsx';

// ==========================================
// 1. 线段 <Seg>
// ==========================================
export function Seg({
  a,
  b,
  stroke = '#64748b',
  w = 1.8,
  dash,
  opacity = 1,
}: {
  a: Pt;
  b: Pt;
  stroke?: string;
  w?: number;
  dash?: string;
  opacity?: number;
}) {
  if (!a || !b) return null;
  return (
    <line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke={stroke}
      strokeWidth={w}
      strokeDasharray={dash}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

// ==========================================
// 2. 无限直线 <LineAB>
// ==========================================
export function LineAB({
  a,
  b,
  stroke = '#f43f5e',
  w = 1.8,
  dash = '6 4',
  opacity = 0.9,
}: {
  a: Pt;
  b: Pt;
  stroke?: string;
  w?: number;
  dash?: string;
  opacity?: number;
}) {
  const { width, height } = useContext(StageContext);
  const clipped = clipLineToBox(a, b, width, height);
  if (!clipped) return null;
  return (
    <line
      x1={clipped[0].x}
      y1={clipped[0].y}
      x2={clipped[1].x}
      y2={clipped[1].y}
      stroke={stroke}
      strokeWidth={w}
      strokeDasharray={dash}
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

// ==========================================
// 3. 几何点 <Dot>
// ==========================================
export function Dot({
  p,
  color = '#f4b942',
  r = 4.5,
  label,
  labelOffset = { x: 8, y: -8 },
}: {
  p: Pt;
  color?: string;
  r?: number;
  label?: string;
  labelOffset?: { x: number; y: number };
}) {
  if (!p) return null;
  return (
    <g className="pointer-events-none">
      <circle cx={p.x} cy={p.y} r={r} fill={color} />
      <circle cx={p.x} cy={p.y} r={r + 3} fill={color} opacity={0.25} />
      {label && (
        <text
          x={p.x + labelOffset.x}
          y={p.y + labelOffset.y}
          fill="#f8fafc"
          fontSize="13"
          fontWeight="600"
          fontFamily="serif"
          className="select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        >
          {label}
        </text>
      )}
    </g>
  );
}

// ==========================================
// 4. 圆 <Circ>
// ==========================================
export function Circ({
  c,
  r,
  stroke = '#38bdf8',
  fill = 'none',
  w = 1.6,
  dash,
  opacity = 1,
}: {
  c: Pt;
  r: number;
  stroke?: string;
  fill?: string;
  w?: number;
  dash?: string;
  opacity?: number;
}) {
  if (!c || r <= 0 || !Number.isFinite(r)) return null;
  return (
    <circle
      cx={c.x}
      cy={c.y}
      r={r}
      stroke={stroke}
      fill={fill}
      strokeWidth={w}
      strokeDasharray={dash}
      opacity={opacity}
    />
  );
}

// ==========================================
// 5. 多边形 <Poly>
// ==========================================
export function Poly({
  pts,
  stroke = '#38bdf8',
  fill = 'rgba(56, 189, 248, 0.08)',
  w = 2,
  dash,
}: {
  pts: Pt[];
  stroke?: string;
  fill?: string;
  w?: number;
  dash?: string;
}) {
  if (!pts || pts.length < 3) return null;
  const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <polygon
      points={pointsStr}
      stroke={stroke}
      fill={fill}
      strokeWidth={w}
      strokeDasharray={dash}
      strokeLinejoin="round"
    />
  );
}

// ==========================================
// 6. 可拖拽手柄 <Handle>
// ==========================================
export function Handle({
  p,
  onMove,
  color = '#f59e0b',
  r = 8,
  label,
  labelOffset = { x: 10, y: -10 },
}: {
  p: Pt;
  onMove: (np: Pt) => void;
  color?: string;
  r?: number;
  label?: string;
  labelOffset?: { x: number; y: number };
}) {
  const { svgRef, width, height } = useContext(StageContext);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGCircleElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const onPointerMove = (ev: PointerEvent) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const rawX = ((ev.clientX - rect.left) / rect.width) * width;
        const rawY = ((ev.clientY - rect.top) / rect.height) * height;

        // 边界防溢出裁剪
        const clampedX = Math.max(15, Math.min(width - 15, rawX));
        const clampedY = Math.max(15, Math.min(height - 15, rawY));

        onMove({ x: clampedX, y: clampedY });
      };

      const onPointerUp = (ev: PointerEvent) => {
        target.releasePointerCapture(ev.pointerId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [svgRef, width, height, onMove]
  );

  if (!p) return null;

  return (
    <g className="cursor-grab active:cursor-grabbing">
      {/* 隐形扩展点击区域 */}
      <circle
        cx={p.x}
        cy={p.y}
        r={r + 14}
        fill="transparent"
        onPointerDown={handlePointerDown}
      />
      {/* 外部微光轮廓 */}
      <circle cx={p.x} cy={p.y} r={r + 5} fill={color} opacity={0.25} />
      {/* 核心可拖圆点 */}
      <circle
        cx={p.x}
        cy={p.y}
        r={r}
        fill={color}
        stroke="#ffffff"
        strokeWidth={2.5}
        className="transition-transform duration-75 hover:scale-125"
        onPointerDown={handlePointerDown}
      />
      {label && (
        <text
          x={p.x + labelOffset.x}
          y={p.y + labelOffset.y}
          fill="#ffffff"
          fontSize="14"
          fontWeight="700"
          fontFamily="serif"
          className="pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {label}
        </text>
      )}
    </g>
  );
}
