/**
 * Unified Theorem Data Model for Olympiad Geometry Lab
 */

export interface QuizQuestionItem {
  question: string;
  options: string[];
  answer: number;
  hint: string;
  solution: string;
}

export interface TargetChallenge {
  title: string;
  desc: string;
  targetMetric: string;
  targetVal: number;
  tolerance: number;
}

export interface UnifiedTheorem {
  num: number;
  id: number;
  slug: string;
  name: string;
  enName: string;
  category: string;
  categoryKey: string;
  formula: string;
  formulaShort: string;
  summary: string;
  statement: string;
  intuition: string;
  proofSketch: string;
  olympiadTips: string;
  extension: string;
  challenge: TargetChallenge;
  quizzes: QuizQuestionItem[];
}
