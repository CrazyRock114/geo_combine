import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '几何星图 · 30条奥数著名定理交互实验殿堂',
    template: '%s | 几何星图',
  },
  description:
    '融合 Qwen、Kimi、GLM、DeepSeek 与 Gemini 顶尖成果的数学竞赛几何互动教学平台：零误差几何解析引擎、高难度靶向探究挑战、WebAudio 纯程序化和弦音效与 90 星奥数进阶体系。',
  keywords: ['数学竞赛', '平面几何', '射影几何', '梅涅劳斯', '塞瓦', '莫利定理', '奥林匹克数学', '动态几何'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased starfield min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
