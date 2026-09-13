'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { UNIFIED_THEOREMS } from '../data/theorems/theorems-data.ts';
import { useGamifyProgress } from '../hooks/useGamifyProgress.ts';
import { TeX } from '../components/ui/KaTeXView.tsx';

const CATEGORIES = [
  '全部',
  '经典共线与共点',
  '圆幂与根轴体系',
  '三角形度量与圆系',
  '射影几何与极点极线',
  '几何极值与不等式',
];

export default function HomePage() {
  const { state, isLoaded, getRank, badges } = useGamifyProgress();
  const [selectedCat, setSelectedCat] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  const rank = getRank(state.totalStars);

  const filteredTheorems = useMemo(() => {
    return UNIFIED_THEOREMS.filter((t) => {
      const matchCat = selectedCat === '全部' || t.category.includes(selectedCat) || selectedCat.includes(t.category);
      const matchSearch =
        !searchQuery ||
        t.name.includes(searchQuery) ||
        t.enName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(t.num) === searchQuery.trim() ||
        t.summary.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchQuery]);

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      {/* 顶部 Hero */}
      <header className="mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
          <span>✨ 融合 6 大模型顶尖成果 · 工业级几何交互教学平台</span>
        </div>

        <h1 className="mt-4 font-serif-sc text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          几何星图 · <span className="bg-gradient-to-r from-amber-300 via-sky-300 to-indigo-400 bg-clip-text text-transparent">30条奥数著名定理</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
          零误差解析几何数学内核 · 30项动态靶向探究挑战 · WebAudio 纯程序化和弦合成 · 90星奥数竞赛进阶殿堂
        </p>

        {/* 学习档案状态条 */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl backdrop-blur-md">
          {/* 星图收集进度 */}
          <div className="flex items-center gap-3.5 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-2xl text-amber-400 border border-amber-500/30 shadow-inner">
              ⭐
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">星图探索进度</div>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black text-amber-400">
                  {isLoaded ? state.totalStars : 0}
                </span>
                <span className="text-xs text-slate-500">/ 90 颗星</span>
              </div>
            </div>
          </div>

          {/* 段位 */}
          <div className="flex items-center gap-3.5 text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-2xl text-sky-400 border border-sky-500/30">
              🏅
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400">天象段位</div>
              <div className={`mt-0.5 text-lg font-bold ${rank.color}`}>
                {rank.title} (Lv.{rank.level})
              </div>
            </div>
          </div>

          {/* 经验值与徽章入口 */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-right">
              <div className="text-[11px] font-medium text-slate-400">累计奥数经验</div>
              <div className="font-mono text-base font-bold text-slate-100">
                {isLoaded ? state.xp : 0} <span className="text-xs text-amber-400">XP</span>
              </div>
            </div>

            <button
              onClick={() => setShowBadgesModal(true)}
              className="rounded-xl border border-indigo-500/40 bg-indigo-600/20 px-3.5 py-2.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-600/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            >
              🏆 勋章墙 ({badges.filter((b) => b.unlocked).length}/7)
            </button>
          </div>
        </div>
      </header>

      {/* 搜索与分类导航 */}
      <section className="mx-auto mt-12 max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 分类切换按钮 */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  selectedCat === cat
                    ? 'border border-sky-500/80 bg-sky-500/20 text-sky-200 shadow-md'
                    : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 搜索栏 */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="搜索定理名 / 序号 / 英文..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 30 定理卡片栅格 */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTheorems.map((th) => {
            const thProgress = state.theorems[th.slug] || { stars: 0, challengeDone: false };

            return (
              <div
                key={th.num}
                className="theorem-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-900/90 hover:shadow-2xl"
              >
                <div>
                  {/* 顶部标签 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-sky-400">
                        #{String(th.num).padStart(2, '0')}
                      </span>
                      <span className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        {th.category}
                      </span>
                    </div>

                    {/* 星级 */}
                    <div className="flex items-center gap-0.5 text-xs text-amber-400 font-mono">
                      {[1, 2, 3].map((star) => (
                        <span
                          key={star}
                          className={star <= thProgress.stars ? 'text-amber-400' : 'text-slate-700'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 标题 */}
                  <h2 className="mt-3 font-serif-sc text-lg font-bold text-white transition-colors group-hover:text-amber-300">
                    {th.name}
                  </h2>
                  <div className="text-xs font-medium text-slate-500">{th.enName}</div>

                  {/* 核心公式小标签 */}
                  <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-center text-xs">
                    <TeX tex={th.formulaShort || th.formula} />
                  </div>

                  {/* 一句话总结 */}
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 line-clamp-2">
                    {th.summary}
                  </p>
                </div>

                {/* 底部按钮与挑战状态 */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3.5">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {thProgress.challengeDone ? (
                      <span className="text-emerald-400 font-medium">🎯 靶向挑战已达成</span>
                    ) : (
                      <span className="text-slate-500">🎯 {th.challenge.title}</span>
                    )}
                  </div>

                  <Link
                    href={`/theorem/${th.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-500/10 px-3.5 py-1.5 text-xs font-semibold text-sky-300 transition-all hover:bg-sky-500 hover:text-white"
                  >
                    进入实验 →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 成就勋章 Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">🏆 奥林匹克几何成就勋章 (7 大专属荣耀)</h3>
              <button
                onClick={() => setShowBadgesModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`flex items-center gap-3.5 rounded-xl border p-3.5 transition-all ${
                    b.unlocked
                      ? 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'border-slate-800/80 bg-slate-950/40 opacity-50'
                  }`}
                >
                  <div className="text-3xl">{b.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{b.name}</span>
                      {b.unlocked && (
                        <span className="text-[10px] font-bold text-amber-400">已点亮</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-tight text-slate-400">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowBadgesModal(false)}
                className="rounded-lg bg-slate-800 px-6 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                返回星图
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
