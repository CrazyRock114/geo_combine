'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BadgeInfo {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export interface ProgressState {
  xp: number;
  totalStars: number;
  theorems: Record<
    string,
    {
      stars: number;
      challengeDone: boolean;
      quizScore: number;
    }
  >;
  unlockedBadges: string[];
}

const STORAGE_KEY = 'unified_geom_master_progress_v1';

const ALL_BADGES: BadgeInfo[] = [
  { id: 'first_step', name: '初窥门径', desc: '完成任意第 1 个几何定理的交互探究', icon: '🌟', unlocked: false },
  { id: 'collinear_master', name: '三点一线', desc: '探索完成梅涅劳斯、帕斯卡、西姆松等共线体系定理', icon: '📐', unlocked: false },
  { id: 'power_circle', name: '圆融归一', desc: '攻克圆幂、根轴与蒙日定理圆系问题', icon: '⭕', unlocked: false },
  { id: 'morley_crown', name: '莫利之冠', desc: '成功复现并验证莫利三等分角正三角形', icon: '👑', unlocked: false },
  { id: 'half_star', name: '极客星耀', desc: '在全景星图中累计点亮 50 颗星辰', icon: '✨', unlocked: false },
  { id: 'challenge_streak', name: '靶向神算', desc: '攻克 15 个定制靶向几何探究挑战', icon: '🎯', unlocked: false },
  { id: 'grand_master', name: '星图主宰', desc: '完成全部 30 个定理并达成 90 星大满贯', icon: '🏆', unlocked: false },
];

const DEFAULT_STATE: ProgressState = {
  xp: 0,
  totalStars: 0,
  theorems: {},
  unlockedBadges: [],
};

export function useGamifyProgress() {
  const [state, setState] = useState<ProgressState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  const saveState = useCallback((newState: ProgressState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch {}
  }, []);

  /** 记录测验完成获得的星星 (0~3星) */
  const recordQuizStars = useCallback(
    (slug: string, stars: number) => {
      setState((prev) => {
        const cur = prev.theorems[slug] || { stars: 0, challengeDone: false, quizScore: 0 };
        const newStars = Math.max(cur.stars, stars);
        const diffStars = newStars - cur.stars;

        const nextTheorems = {
          ...prev.theorems,
          [slug]: {
            ...cur,
            stars: newStars,
            quizScore: Math.max(cur.quizScore, stars * 33),
          },
        };

        const totalStars = Object.values(nextTheorems).reduce((acc, t) => acc + t.stars, 0);
        const xp = prev.xp + diffStars * 30;

        // 徽章检测
        const badges = new Set(prev.unlockedBadges);
        badges.add('first_step');
        if (slug === 'morley') badges.add('morley_crown');
        if (totalStars >= 50) badges.add('half_star');
        if (totalStars >= 90) badges.add('grand_master');

        const nextState = {
          ...prev,
          xp,
          totalStars,
          theorems: nextTheorems,
          unlockedBadges: Array.from(badges),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {}
        return nextState;
      });
    },
    []
  );

  /** 记录完成靶向操作挑战 (+50 XP) */
  const recordChallengeComplete = useCallback(
    (slug: string) => {
      setState((prev) => {
        const cur = prev.theorems[slug] || { stars: 0, challengeDone: false, quizScore: 0 };
        if (cur.challengeDone) return prev; // 已完成不再重复刷

        const nextTheorems = {
          ...prev.theorems,
          [slug]: { ...cur, challengeDone: true },
        };
        const xp = prev.xp + 50;

        const doneCount = Object.values(nextTheorems).filter((t) => t.challengeDone).length;
        const badges = new Set(prev.unlockedBadges);
        badges.add('first_step');
        if (doneCount >= 15) badges.add('challenge_streak');

        const nextState = {
          ...prev,
          xp,
          theorems: nextTheorems,
          unlockedBadges: Array.from(badges),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {}
        return nextState;
      });
    },
    []
  );

  /** 计算当前段位称号 */
  const getRank = useCallback((stars: number) => {
    if (stars >= 90) return { title: '星图主宰', color: 'text-amber-300', level: 4 };
    if (stars >= 60) return { title: '几何大师', color: 'text-purple-400', level: 3 };
    if (stars >= 30) return { title: '几何探索者', color: 'text-sky-400', level: 2 };
    return { title: '观星新手', color: 'text-slate-400', level: 1 };
  }, []);

  /** 获取完整徽章列表（包含点亮状态） */
  const badges = ALL_BADGES.map((b) => ({
    ...b,
    unlocked: state.unlockedBadges.includes(b.id),
  }));

  return {
    state,
    isLoaded,
    recordQuizStars,
    recordChallengeComplete,
    getRank,
    badges,
  };
}
