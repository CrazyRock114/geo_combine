'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { Pt } from '../../lib/geom/types.ts';

interface StageContextValue {
  svgRef: React.RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
}

export const StageContext = React.createContext<StageContextValue>({
  svgRef: { current: null },
  width: 700,
  height: 520,
});

interface StageProps {
  width?: number;
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function Stage({
  width = 700,
  height = 520,
  className = '',
  children,
}: StageProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  return (
    <StageContext.Provider value={{ svgRef, width, height }}>
      <div className={`relative w-full overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/80 shadow-2xl backdrop-blur-md ${className}`}>
        {/* 微弱坐标网格背景 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="relative z-10 h-auto w-full touch-none select-none"
          style={{ maxHeight: '72vh' }}
        >
          {children}
        </svg>
      </div>
    </StageContext.Provider>
  );
}
