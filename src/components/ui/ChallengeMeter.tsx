'use client';

import React from 'react';

interface ChallengeMeterProps {
  title: string;
  desc: string;
  progress: number; // 0 ~ 100
  completed: boolean;
  rewardXp?: number;
  className?: string;
}

export function ChallengeMeter({
  title,
  desc,
  progress,
  completed,
  rewardXp = 50,
  className = '',
}: ChallengeMeterProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
        completed
          ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
          : 'border-slate-800 bg-slate-900/80 shadow-lg'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-slate-100">
              🎯 靶向探究任务：{title}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                completed
                  ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300'
                  : 'border border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              +{rewardXp} XP
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
        </div>

        {completed && (
          <span className="shrink-0 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300">
            🏆 挑战达成
          </span>
        )}
      </div>

      {/* 动态收敛刻度条 */}
      <div className="mt-3">
        <div className="flex justify-between text-[11px] font-medium text-slate-400">
          <span>收敛拟合度</span>
          <span className="font-mono font-bold text-slate-200">{Math.round(clampedProgress)}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              completed
                ? 'bg-gradient-to-r from-amber-500 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                : 'bg-gradient-to-r from-sky-500 to-cyan-400'
            }`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
