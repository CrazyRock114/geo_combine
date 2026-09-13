const fs = require('fs');
const path = require('path');

// 1. Load Gemini Theorems Data
const geminiData = require('../geo_gemini3.8Flash/assets/js/theorems-data.js');

// 2. Load GLM-5.3 Theorems Data
function stripTS(code) {
  return code
    .replace(/^import\s+.*$/gm, '')
    .replace(/:\s*Theorem\[\]/g, '')
    .replace(/:\s*QuizMap/g, '')
    .replace(/export\s+const\s+/g, 'const ');
}

const t1 = fs.readFileSync(path.join(__dirname, '../geo_GLM5.3/src/lib/theorems/theorems-1.ts'), 'utf8');
const t2 = fs.readFileSync(path.join(__dirname, '../geo_GLM5.3/src/lib/theorems/theorems-2.ts'), 'utf8');
const t3 = fs.readFileSync(path.join(__dirname, '../geo_GLM5.3/src/lib/theorems/theorems-3.ts'), 'utf8');
const combinedTheorems = stripTS(t1) + '\n' + stripTS(t2) + '\n' + stripTS(t3) + '\nmodule.exports = [...theorems1, ...theorems2, ...theorems3];';

const tempTheoremsPath = path.join(__dirname, 'temp-theorems.cjs');
fs.writeFileSync(tempTheoremsPath, combinedTheorems);
const glmTheorems = require(tempTheoremsPath);
fs.unlinkSync(tempTheoremsPath);

// 3. Load GLM-5.3 Quizzes
const q1 = fs.readFileSync(path.join(__dirname, '../geo_GLM5.3/src/lib/quiz/quiz-1.ts'), 'utf8');
const q2 = fs.readFileSync(path.join(__dirname, '../geo_GLM5.3/src/lib/quiz/quiz-2.ts'), 'utf8');
const q3 = fs.readFileSync(path.join(__dirname, '../geo_GLM5.3/src/lib/quiz/quiz-3.ts'), 'utf8');
const combinedQuizzes = stripTS(q1) + '\n' + stripTS(q2) + '\n' + stripTS(q3) + '\nmodule.exports = { ...quiz1, ...quiz2, ...quiz3 };';

const tempQuizzesPath = path.join(__dirname, 'temp-quizzes.cjs');
fs.writeFileSync(tempQuizzesPath, combinedQuizzes);
const glmQuizzes = require(tempQuizzesPath);
fs.unlinkSync(tempQuizzesPath);

console.log(`Loaded ${geminiData.length} Gemini theorems, ${glmTheorems.length} GLM theorems, and ${Object.keys(glmQuizzes).length} GLM quiz sets.`);

// 4. Merge Data for all 30 Theorems
const merged = geminiData.map((g, idx) => {
  const cleanSlug = g.slug.replace(/^[0-9]+-/, '');
  const glm = glmTheorems.find((t) => t.slug === cleanSlug || t.id === g.num) || glmTheorems[idx];
  const glmQuizList = glmQuizzes[cleanSlug] || [];

  // 提取 GLM sections
  const secMap = {};
  if (glm && glm.sections) {
    glm.sections.forEach((s) => {
      secMap[s.title] = s.body;
    });
  }

  // 组装测验题目：融合 GLM 概念辨析题 + Gemini 奥数真题计算
  const questions = [];
  // 放入 GLM 的前 2~3 道概念辨析题
  glmQuizList.slice(0, 3).forEach((q) => {
    questions.push({
      question: q.q,
      options: q.options,
      answer: q.answer,
      hint: '关注定理成立的充要条件与基本代数性质。',
      solution: q.explain,
    });
  });

  // 放入 Gemini 的高阶奥数计算题
  if (g.quiz) {
    questions.push({
      question: g.quiz.question,
      options: g.quiz.options,
      answer: g.quiz.answer,
      hint: g.quiz.hint || '运用定理列出对应线段或角度的比例恒等式。',
      solution: g.quiz.solution || '根据定理公式代入计算即可求解。',
    });
  }

  return {
    num: g.num,
    id: g.num,
    slug: cleanSlug,
    name: g.name,
    enName: g.enName || (glm ? glm.en : ''),
    category: g.category,
    categoryKey: g.categoryKey,
    formula: g.formula,
    formulaShort: glm ? glm.formulaShort : g.formula,
    summary: g.summary,
    statement: glm ? glm.statement : g.detailedDescription,
    intuition: secMap['直观理解'] || '观察几何不变量随顶点的连续变化规律。',
    proofSketch: secMap['证明思路'] || g.proofSketch,
    olympiadTips: secMap['竞赛应用'] || g.olympiadTips,
    extension: secMap['延伸拓展'] || '可进一步推广至多边形连乘形式或空间几何构型。',
    challenge: g.challenge || {
      title: '不变量探索挑战',
      desc: '拖动顶点验证定理成立。',
      targetMetric: 'ok',
      targetVal: 1,
      tolerance: 0.05,
    },
    quizzes: questions,
  };
});

// 5. Output Unified Types and Dataset
const typesContent = `/**
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
`;

const dataContent = `import type { UnifiedTheorem } from './types.ts';

export const UNIFIED_THEOREMS: UnifiedTheorem[] = ${JSON.stringify(merged, null, 2)};

export const THEOREMS_BY_SLUG: Record<string, UnifiedTheorem> = UNIFIED_THEOREMS.reduce(
  (acc, t) => {
    acc[t.slug] = t;
    return acc;
  },
  {} as Record<string, UnifiedTheorem>
);

export const THEOREMS_BY_NUM: Record<number, UnifiedTheorem> = UNIFIED_THEOREMS.reduce(
  (acc, t) => {
    acc[t.num] = t;
    return acc;
  },
  {} as Record<number, UnifiedTheorem>
);
`;

fs.writeFileSync(path.join(__dirname, '../src/data/theorems/types.ts'), typesContent);
fs.writeFileSync(path.join(__dirname, '../src/data/theorems/theorems-data.ts'), dataContent);
console.log('Successfully generated unified theorems dataset at src/data/theorems/theorems-data.ts!');
