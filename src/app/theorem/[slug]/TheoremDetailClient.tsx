'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { UNIFIED_THEOREMS } from '../../../data/theorems/theorems-data.ts';
import { EXPERIMENT_REGISTRY } from '../../../components/experiments/index.tsx';
import { ChallengeMeter } from '../../../components/ui/ChallengeMeter.tsx';
import { QuizSection } from '../../../components/ui/QuizSection.tsx';
import { TeX, MathText } from '../../../components/ui/KaTeXView.tsx';
import { Confetti } from '../../../components/effects/Confetti.tsx';
import { useGamifyProgress } from '../../../hooks/useGamifyProgress.ts';
import { useWebAudio } from '../../../hooks/useWebAudio.ts';

interface Props {
  slug: string;
}

export default function TheoremDetailClient({ slug }: Props) {
  const { playSuccessChime } = useWebAudio();
  const { state, recordQuizStars, recordChallengeComplete } = useGamifyProgress();

  const [activeTab, setActiveTab] = useState<'experiment' | 'theory' | 'quiz'>('experiment');
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // 匹配当前定理
  const currentIdx = useMemo(() => {
    return UNIFIED_THEOREMS.findIndex((t) => t.slug === slug);
  }, [slug]);

  const theorem = currentIdx >= 0 ? UNIFIED_THEOREMS[currentIdx] : null;

  // 上一个与下一个定理
  const prevTheorem = currentIdx > 0 ? UNIFIED_THEOREMS[currentIdx - 1] : UNIFIED_THEOREMS[UNIFIED_THEOREMS.length - 1];
  const nextTheorem = currentIdx < UNIFIED_THEOREMS.length - 1 ? UNIFIED_THEOREMS[currentIdx + 1] : UNIFIED_THEOREMS[0];

  const ExperimentComponent = theorem ? EXPERIMENT_REGISTRY[theorem.slug] : null;

  // 当前定理持久化数据
  const savedRecord = state.theorems[slug] || { stars: 0, challengeDone: false, quizScore: 0 };
  const isDonePersisted = savedRecord.challengeDone || challengeCompleted;

  // 处理挑战进度通知
  const handleChallengeProgress = useCallback(
    (progress: number, completed: boolean) => {
      setChallengeProgress(progress);
      if (completed && !challengeCompleted) {
        setChallengeCompleted(true);
        recordChallengeComplete(slug);
        playSuccessChime();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    },
    [challengeCompleted, playSuccessChime, recordChallengeComplete, slug]
  );

  const triggerCelebration = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  }, []);

  if (!theorem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif-sc text-3xl font-bold text-white">未找到对应定理</h2>
        <p className="mt-2 text-slate-400">该定理编号或别名尚未录入星图数据库。</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950 transition hover:bg-amber-400"
        >
          返回星图全景
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      {/* 粒子礼花全局图层 */}
      <Confetti active={showConfetti} />

      {/* 顶部导航与状态栏 */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-amber-400/50 hover:bg-slate-800 hover:text-white"
            >
              <span>←</span>
              <span>星图主厅</span>
            </Link>
            <span className="hidden h-4 w-px bg-slate-800 sm:inline-block" />
            <span className="hidden rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-400 sm:inline-block">
              {theorem.category}
            </span>
          </div>

          {/* 定理快速翻页 */}
          <div className="flex items-center gap-2">
            <Link
              href={`/theorem/${prevTheorem.slug}`}
              className="group flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
              title={prevTheorem.name}
            >
              <span>‹</span>
              <span className="hidden md:inline">{prevTheorem.name}</span>
            </Link>

            <span className="font-mono text-xs font-bold text-amber-400 px-1">
              No.{String(theorem.num).padStart(2, '0')} / 30
            </span>

            <Link
              href={`/theorem/${nextTheorem.slug}`}
              className="group flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
              title={nextTheorem.name}
            >
              <span className="hidden md:inline">{nextTheorem.name}</span>
              <span>›</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 页面主标题区 */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-amber-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
                定理 #{theorem.num}
              </span>
              <h1 className="font-serif-sc text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {theorem.name}
              </h1>
              <span className="hidden text-sm font-medium text-slate-400 sm:inline">
                {theorem.enName}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              {theorem.summary}
            </p>
          </div>

          {/* 星星收集状态卡 */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">本定理收集</div>
              <div className="font-mono text-sm font-bold text-amber-400">
                {savedRecord.stars} / 3 ⭐
              </div>
            </div>
            <div className="flex gap-1 text-base">
              <span className={savedRecord.stars >= 1 ? 'text-amber-400' : 'text-slate-700'}>★</span>
              <span className={savedRecord.stars >= 2 ? 'text-amber-400' : 'text-slate-700'}>★</span>
              <span className={savedRecord.stars >= 3 ? 'text-amber-400' : 'text-slate-700'}>★</span>
            </div>
          </div>
        </div>
      </section>

      {/* 主体交互与讲义两栏排版 */}
      <main className="mx-auto mt-6 max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 左栏：动态交互实验室 (占据 7 列) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="font-medium text-slate-200">交互操作区 · 几何不变量引擎在线</span>
                </div>
                <span className="text-[11px] text-slate-500">拖动圆圈手柄微调几何构型</span>
              </div>

              {/* 实验组件挂载 */}
              <div className="min-h-[460px]">
                {ExperimentComponent ? (
                  <ExperimentComponent onChallengeProgress={handleChallengeProgress} />
                ) : (
                  <div className="flex h-96 items-center justify-center text-slate-500">
                    该定理交互组件正在接入中...
                  </div>
                )}
              </div>
            </div>

            {/* 靶向探究任务挑战条 */}
            <ChallengeMeter
              title={theorem.challenge.title}
              desc={theorem.challenge.desc}
              progress={challengeProgress}
              completed={isDonePersisted}
              rewardXp={50}
            />
          </div>

          {/* 右栏：三维教研与测验面板 (占据 5 列) */}
          <div className="space-y-4 lg:col-span-5">
            {/* 选项卡切换头 */}
            <div className="flex rounded-xl border border-slate-800 bg-slate-900/90 p-1 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('experiment')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === 'experiment'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎮 靶向实验
              </button>
              <button
                onClick={() => setActiveTab('theory')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === 'theory'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📚 奥数精讲
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === 'quiz'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏆 闯关测试
              </button>
            </div>

            {/* 选项卡 1: 靶向实验导引 */}
            {activeTab === 'experiment' && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
                {/* 核心公式卡 */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <span className="text-[11px] font-semibold text-amber-300">核心代数公式 / 恒等式</span>
                  <div className="mt-2 overflow-x-auto py-1 text-slate-100">
                    <TeX math={theorem.formulaShort || theorem.formula} block />
                  </div>
                </div>

                {/* 定理严格陈述 */}
                <div>
                  <h3 className="text-xs font-bold text-slate-300">【定理精确表述】</h3>
                  <div className="mt-2 text-xs leading-relaxed text-slate-300">
                    <MathText text={theorem.statement} />
                  </div>
                </div>

                {/* 实验操作攻略 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h3 className="text-xs font-bold text-sky-400">💡 动态验证指引</h3>
                  <ul className="mt-2 space-y-2 text-xs text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400">•</span>
                      <span>
                        观察上方数据仪表盘，拖动任意控制手柄改变三角形形状（甚至钝角或退化），验证比值是否严格锁定在不变常量。
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400">•</span>
                      <span>
                        完成下方「{theorem.challenge.title}」即可获得 50 XP 经验值并点亮专属徽章进度。
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 选项卡 2: 奥数深度精讲 (GLM-5.3 4-Tier Masterclass) */}
            {activeTab === 'theory' && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
                {/* 1. 直观理解 */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <span>💡</span>
                    <span>直观物理/几何图景</span>
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-slate-300">
                    <MathText text={theorem.intuition} />
                  </div>
                </div>

                {/* 2. 证明思路精解 */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <span>📐</span>
                    <span>竞赛证明思路精解</span>
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-slate-300">
                    <MathText text={theorem.proofSketch} />
                  </div>
                </div>

                {/* 3. 联赛实战与避坑指南 */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <span>⚠️</span>
                    <span>联赛实战技巧与避坑指南</span>
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-slate-300">
                    <MathText text={theorem.olympiadTips} />
                  </div>
                </div>

                {/* 4. 推广与延伸 */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                    <span>🌐</span>
                    <span>高维拓扑与射影推广</span>
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-slate-300">
                    <MathText text={theorem.extension} />
                  </div>
                </div>
              </div>
            )}

            {/* 选项卡 3: 竞赛闯关测试 */}
            {activeTab === 'quiz' && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
                <QuizSection
                  slug={theorem.slug}
                  questions={theorem.quizzes}
                  savedStars={savedRecord.stars}
                  onComplete={(stars) => recordQuizStars(theorem.slug, stars)}
                  triggerConfetti={triggerCelebration}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
