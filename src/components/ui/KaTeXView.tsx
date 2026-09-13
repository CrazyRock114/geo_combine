'use client';

import React, { useMemo } from 'react';

export function TeX({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => {
    try {
      // 优先调用全局或打包的 katex
      // @ts-ignore
      const katexModule = typeof window !== 'undefined' && (window as any).katex
        ? (window as any).katex
        // @ts-ignore
        : typeof require !== 'undefined' ? require('katex') : null;

      if (katexModule && typeof katexModule.renderToString === 'function') {
        return katexModule.renderToString(tex, { displayMode: display, throwOnError: false, strict: false });
      }
    } catch {}
    return `<span class="font-mono text-amber-300/90 font-medium px-1">${tex}</span>`;
  }, [tex, display]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** 渲染含 $...$ 内联公式的文本 */
export function MathText({ text }: { text: string }) {
  const parts = useMemo(() => text.split(/\$([^$]+)\$/g), [text]);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <TeX key={i} tex={p} /> : <span key={i}>{p}</span>
      )}
    </>
  );
}
