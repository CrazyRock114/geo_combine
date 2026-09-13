'use client';

import React from 'react';
import type { MeasurementItem } from '../../lib/geom/types.ts';

interface ReadoutProps {
  title?: string;
  items: MeasurementItem[];
  verified?: boolean;
  statusText?: string;
  onReset?: () => void;
  className?: string;
}

export function Readout({
  title = '⚡ 实时几何不变量仪表盘',
  items,
  verified = true,
  statusText,
  onReset,
  className = '',
}: ReadoutProps) {
  return (
    <div className={`rounded-xl border border-slate-700/60 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md ${className}`}>
      {/* 顶部标题与验证徽章 */}
      <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-slate-200">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-700 hover:text-white"
            >
              🔄 重置
            </button>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${
              verified
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
          >
            {verified ? '✅ ' : '❌ '}
            {statusText || (verified ? '定理严格成立' : '存在几何偏差')}
          </span>
        </div>
      </div>

      {/* 读数栅格 */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {items.map((item, idx) => {
          let valColor = 'text-slate-100';
          if (item.tone === 'gold') valColor = 'text-amber-400';
          else if (item.tone === 'teal') valColor = 'text-teal-400';
          else if (item.tone === 'success' || item.ok === true) valColor = 'text-emerald-400';
          else if (item.tone === 'error' || item.ok === false) valColor = 'text-rose-400';

          return (
            <div
              key={idx}
              className="flex flex-col rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 transition-all hover:border-slate-700"
            >
              <span className="text-[11px] font-medium text-slate-400">{item.label}</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className={`font-mono text-base font-semibold tabular-nums ${valColor}`}>
                  {item.value}
                </span>
                {item.unit && <span className="text-xs text-slate-500">{item.unit}</span>}
              </div>
              {item.note && <span className="mt-0.5 text-[10px] text-slate-500">{item.note}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
