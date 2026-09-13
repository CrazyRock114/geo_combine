'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface TeXProps {
  tex?: string;
  math?: string;
  display?: boolean;
  block?: boolean;
  className?: string;
}

export function TeX({ tex, math, display = false, block = false, className = '' }: TeXProps) {
  const formula = (tex ?? math ?? '').trim();

  const html = useMemo(() => {
    if (!formula) return '';
    try {
      return katex.renderToString(formula, {
        displayMode: display || block,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return '';
    }
  }, [formula, display, block]);

  if (!formula) return null;

  if (!html) {
    return <span className={`font-mono text-amber-300/90 font-medium px-1 ${className}`}>{formula}</span>;
  }

  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** 渲染含 $...$ 内联公式的文本 */
export function MathText({ text, className = '' }: { text?: string; className?: string }) {
  if (!text) return null;

  const parts = text.split(/\$([^$]+)\$/g);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        i % 2 === 1 ? <TeX key={i} tex={p} /> : <span key={i}>{p}</span>
      )}
    </span>
  );
}
