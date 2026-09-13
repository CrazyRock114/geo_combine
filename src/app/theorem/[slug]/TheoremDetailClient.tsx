'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { UNIFIED_THEOREMS } from '../../../data/theorems/theorems-data.ts';
import type { UnifiedTheorem } from '../../../data/theorems/types.ts';
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

function NavArrow({ t, dir }: { t: UnifiedTheorem; dir: 'prev' | 'next' }) {
  return (
    <Link
      href={`/theorem/${t.slug}`}
      className="group flex flex-1 items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition hover:-translate-y-0.5 hover:border-amber-500/50 hover:bg-slate-900 hover:shadow-xl"
    >
      <span className="text-2xl text-slate-500 transition group-hover:text-amber-400">
        {dir === 'prev' ? '‹' : '›'}
      </span>
      <div className={`min-w-0 ${dir === 'next' ? 'ml-auto text-right' : ''}`}>
        <span className="block text-xs font-mono text-slate-400">
          {dir === 'prev' ? '上一条定理' : '下一条定理'} · No.{String(t.num).padStart(2, '0')}
        </span>
        <span className="block truncate font-serif-sc text-sm font-bold text-slate-100 group-hover:text-amber-300">
          {t.name}
        </span>
      </div>
    </Link>
  );
}

export default function TheoremDetailClient({ slug }: Props) {
  const { playSuccessChime } = useWebAudio();
  const { state, recordQuizStars, recordChallengeComplete } = useGamifyProgress();

  const [rightTab, setRightTab] = useState<'proof' | 'extension' | 'challenge'>('proof');
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
    <div className="relative min-h-screen pb-20">
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
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-amber-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
                定理 #{theorem.num}
              </span>
              <h1 className="font-serif-sc text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {theorem.name}
              </h1>
              <span className="text-sm font-medium text-slate-400">
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

      {/* ========================================================= */}
      {/* ① Kimi K3 经典浅色羊皮纸手稿精讲卡 (Parchment Knowledge Card) */}
      {/* ========================================================= */}
      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#d9cfae] bg-[#f7f2e7] text-[#1f2937] shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          {/* 卡片头部 */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#1f29371f] px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="font-serif-sc text-xl font-bold tracking-tight text-[#1f2937]">
                🏛️ 知识点精讲
              </span>
              <span className="text-xs text-[#6b7280]">Theorem Statement & Core Foundations</span>
            </div>
            <span className="rounded-full border border-[#b9802a44] bg-[#f4b94220] px-3 py-1 font-mono text-xs font-semibold text-[#8a6d1d]">
              {theorem.category} · No.{String(theorem.num).padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            {/* 1. 定理严格陈述 */}
            <div>
              <div className="mb-2 font-serif-sc text-sm font-bold text-[#8a6d1d]">
                【 定理严谨表述 】
              </div>
              <div className="text-[15px] sm:text-base leading-relaxed text-[#1f2937]">
                <MathText text={theorem.statement} />
              </div>
            </div>

            {/* 2. 核心公式卡 (高对比度代数公式) */}
            <div className="overflow-x-auto rounded-xl border border-[#d9cfae] bg-[#fbf8ef] p-4 text-center shadow-inner">
              <div className="text-xs font-bold text-[#8a6d1d]">
                【 核心恒等式 / 代数关系 】
              </div>
              <div className="mt-2 text-lg sm:text-xl font-serif text-[#111827]">
                <TeX tex={theorem.formulaShort || theorem.formula} display />
              </div>
            </div>

            {/* 3. 直观物理与几何图景 */}
            <div className="rounded-xl border border-[#e2d7bc] bg-[#faf6ec] p-4 sm:p-5">
              <div className="flex items-center gap-2 font-serif-sc text-sm font-bold text-[#8a6d1d]">
                <span>💡</span>
                <span>直观物理与几何图景</span>
              </div>
              <div className="mt-2 text-sm leading-relaxed text-[#374151]">
                <MathText text={theorem.intuition} />
              </div>
            </div>

            {/* 4. 要点笔记与记忆法则 */}
            {theorem.points && theorem.points.length > 0 && (
              <div>
                <div className="mb-2.5 font-serif-sc text-sm font-bold text-[#8a6d1d]">
                  📌 要点笔记与几何特征
                </div>
                <ul className="space-y-2 text-sm leading-relaxed text-[#374151]">
                  {theorem.points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rotate-45 rounded-[1px] bg-[#b9802a]" />
                      <span>
                        <MathText text={p} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. 实验交互指南与观察要点（解决“不知道怎么互动”的关键说明） */}
            <div className="rounded-xl border border-[#b9802a44] bg-[#fdfaf3] p-4 sm:p-5">
              <div className="flex items-center gap-2 font-serif-sc text-sm font-bold text-[#92400e]">
                <span>🎮</span>
                <span>实验交互指南与观察要点（如何进行探索）</span>
              </div>
              <div className="mt-2.5 space-y-2 text-sm leading-relaxed text-[#4b5563]">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#b9802a]">▶ 交互操作：</span>
                  <span>{theorem.taskGuide || theorem.challenge.desc}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#b9802a]">▶ 观察不变量：</span>
                  <span>
                    在下方实验室中拖动彩色圆圈控制手柄（支持任意三角形形变或截线平移旋转）。注意观察：当截线或辅助线与边延长线相交时（如梅涅劳斯定理中边 AB 延长线与截线的交点 F 及线段 BF、西姆松线垂足延长线等），系统均已用连续实线完整连接；无论几何构型如何变动，核心代数度量与比值乘积始终严格守恒！
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-[#b9802a]">▶ 探究目标：</span>
                  <span className="font-medium text-[#1f2937]">
                    完成下方探究任务「{theorem.challenge.title}」即可获得 50 XP 经验并点亮挑战星级！
                  </span>
                </p>
              </div>
            </div>

            {/* 6. 联赛实战技巧与避坑指南 */}
            <div className="rounded-xl border-l-4 border-[#b9802a] bg-[#f4b94218] p-4 text-sm leading-relaxed text-[#374151]">
              <span className="font-bold text-[#8a6d1d]">⚠️ 联赛实战技巧与避坑指南：</span>
              <div className="mt-1">
                <MathText text={theorem.olympiadTips} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ② 动态几何交互实验室与奥数高阶研讨 (Interactive Lab) */}
      {/* ========================================================= */}
      <main className="mx-auto mt-8 max-w-7xl px-4 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
            <h2 className="font-serif-sc text-xl font-bold text-white sm:text-2xl">
              ② 动态几何交互实验室
            </h2>
            <span className="text-xs text-slate-400">Interactive Lab</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs text-amber-300">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>几何不变量引擎在线 · 拖动手柄实时求解</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 左栏：动态交互画布与挑战条 (占据 7 列) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200">交互视口</span>
                  <span className="text-slate-500">（支持触控与鼠标拖拽）</span>
                </div>
                <span className="text-[11px] text-amber-400/90">
                  🎯 提示：关注边延长线与连结交点
                </span>
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

          {/* 右栏：三维深度教研面板 (占据 5 列) */}
          <div className="space-y-4 lg:col-span-5">
            {/* 选项卡切换头 */}
            <div className="flex rounded-xl border border-slate-800 bg-slate-900/90 p-1 backdrop-blur-md">
              <button
                onClick={() => setRightTab('proof')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  rightTab === 'proof'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📐 证明思路精解
              </button>
              <button
                onClick={() => setRightTab('extension')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  rightTab === 'extension'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🌐 射影拓扑推广
              </button>
              <button
                onClick={() => setRightTab('challenge')}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  rightTab === 'challenge'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎯 挑战攻关秘籍
              </button>
            </div>

            {/* 选项卡内容 1: 证明思路 */}
            {rightTab === 'proof' && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <span>📐</span>
                  <span>竞赛证明思路精解 (Proof Sketch)</span>
                </div>
                <div className="text-xs leading-relaxed text-slate-300">
                  <MathText text={theorem.proofSketch} />
                </div>
              </div>
            )}

            {/* 选项卡内容 2: 射影拓扑推广 */}
            {rightTab === 'extension' && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <span>🌐</span>
                  <span>高维拓扑与射影推广 (Extensions)</span>
                </div>
                <div className="text-xs leading-relaxed text-slate-300">
                  <MathText text={theorem.extension} />
                </div>
              </div>
            )}

            {/* 选项卡内容 3: 挑战攻关秘籍 */}
            {rightTab === 'challenge' && (
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <span>🎯</span>
                  <span>靶向挑战通关指南</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="font-semibold text-amber-400 text-xs">
                    {theorem.challenge.title}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    {theorem.challenge.desc}
                  </p>
                </div>
                <div className="text-xs leading-relaxed text-slate-400">
                  拖动控制手柄微调几何构型。系统将以毫秒级刷新代数指标，达标即可点亮满格进度条并收获 50 XP 经验值！
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* ③ 联赛闯关测试 (Olympiad Quiz) */}
      {/* ========================================================= */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_#fbbf24]" />
            <h2 className="font-serif-sc text-xl font-bold text-white sm:text-2xl">
              ③ 竞赛闯关测试
            </h2>
            <span className="text-xs text-slate-400">答对题目点亮星星与收集勋章</span>
          </div>
          <span className="font-mono text-xs text-amber-400">
            共 {theorem.quizzes.length} 道全国联赛典型试题
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md">
          <QuizSection
            slug={theorem.slug}
            questions={theorem.quizzes}
            savedStars={savedRecord.stars}
            onComplete={(stars) => recordQuizStars(theorem.slug, stars)}
            triggerConfetti={triggerCelebration}
          />
        </div>
      </section>

      {/* ========================================================= */}
      {/* ④ 底部定理前后快速导航卡 (Bottom Navigation) */}
      {/* ========================================================= */}
      <footer className="mx-auto mt-12 max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row">
          <NavArrow t={prevTheorem} dir="prev" />
          <NavArrow t={nextTheorem} dir="next" />
        </div>
      </footer>
    </div>
  );
}
