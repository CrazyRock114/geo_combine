'use client';

import React, { useState } from 'react';
import type { QuizQuestionItem } from '../../data/theorems/types.ts';
import { useWebAudio } from '../../hooks/useWebAudio.ts';
import { MathText } from './KaTeXView.tsx';

interface QuizSectionProps {
  slug: string;
  questions: QuizQuestionItem[];
  savedStars?: number;
  onComplete?: (stars: number) => void;
  triggerConfetti?: () => void;
}

export function QuizSection({
  slug,
  questions,
  savedStars = 0,
  onComplete,
  triggerConfetti,
}: QuizSectionProps) {
  const { playSuccessChime, playClickBeep, playErrorBuzz } = useWebAudio();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showSolutions, setShowSolutions] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    playClickBeep();
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.answer) correctCount++;
    });

    let stars = 0;
    if (correctCount >= 3) stars = 3;
    else if (correctCount === 2) stars = 2;
    else if (correctCount >= 1) stars = 1;

    if (stars >= 2) {
      playSuccessChime();
      if (stars === 3) triggerConfetti?.();
    } else {
      playErrorBuzz();
    }

    onComplete?.(stars);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowSolutions({});
    setSubmitted(false);
  };

  const score = Object.entries(selectedAnswers).filter(
    ([idx, val]) => questions[Number(idx)]?.answer === val
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold tracking-wide text-slate-100">
            🏆 奥林匹克竞赛闯关测试 ({questions.length} 题)
          </h3>
          <p className="text-xs text-slate-400">结合奥数概念辨析与名校真题计算，检验不变量掌握深度</p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1">
          <span className="text-xs font-semibold text-amber-300">当前最高：</span>
          <span className="text-amber-400 font-mono font-bold">{'★'.repeat(savedStars) || '未评星'}</span>
        </div>
      </div>

      {questions.map((q, qIdx) => {
        const selected = selectedAnswers[qIdx];
        const isAnswered = selected !== undefined;
        const isCorrect = selected === q.answer;
        const showSol = showSolutions[qIdx];

        return (
          <div
            key={qIdx}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold leading-relaxed text-slate-200">
                <span className="mr-2 text-sky-400">第 {qIdx + 1} 题.</span>
                <MathText text={q.question} />
              </h4>
            </div>

            {/* 选项列表 */}
            <div className="mt-4 space-y-2.5">
              {q.options.map((opt, optIdx) => {
                let btnStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900 text-slate-300';
                if (selected === optIdx) {
                  btnStyle = 'border-sky-500/80 bg-sky-950/40 text-sky-200 shadow-sm';
                }
                if (submitted) {
                  if (optIdx === q.answer) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-semibold';
                  } else if (selected === optIdx && !isCorrect) {
                    btnStyle = 'border-rose-500 bg-rose-950/50 text-rose-200 line-through';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    disabled={submitted}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-xs transition-all ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <MathText text={opt} />
                    </div>
                    {submitted && optIdx === q.answer && (
                      <span className="text-emerald-400 font-bold">✓ 正确答案</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 提示与分步解析折叠栏 */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
              <span className="text-[11px] text-slate-500">💡 提示：{q.hint}</span>
              <button
                onClick={() => setShowSolutions((s) => ({ ...s, [qIdx]: !s[qIdx] }))}
                className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
              >
                {showSol ? '收起名师解析 ▲' : '查看名师解析 ▼'}
              </button>
            </div>

            {showSol && (
              <div className="mt-3 rounded-lg border border-sky-900/40 bg-sky-950/20 p-3 text-xs leading-relaxed text-slate-300">
                <span className="font-bold text-sky-300">【名师详细推导】</span>
                <p className="mt-1">
                  <MathText text={q.solution} />
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* 底部提交与统计面板 */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length === 0}
            className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition-all hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50"
          >
            交卷并结算星级 (已答 {Object.keys(selectedAnswers).length}/{questions.length})
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-200">
              答对 <span className="text-emerald-400 font-mono text-base">{score}</span> / {questions.length} 题
            </span>
            <button
              onClick={handleReset}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700"
            >
              🔄 再次闯关
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
