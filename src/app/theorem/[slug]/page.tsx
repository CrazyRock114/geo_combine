import React from 'react';
import type { Metadata } from 'next';
import { UNIFIED_THEOREMS } from '../../../data/theorems/theorems-data.ts';
import TheoremDetailClient from './TheoremDetailClient.tsx';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return UNIFIED_THEOREMS.map((thm) => ({
    slug: thm.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const thm = UNIFIED_THEOREMS.find((t) => t.slug === slug);
  if (!thm) {
    return {
      title: '几何定理实验室 · 几何星图',
    };
  }

  return {
    title: `${thm.name} (${thm.enName}) - 几何星图 30 条著名定理交互殿堂`,
    description: `${thm.name}：${thm.summary}`,
  };
}

export default async function TheoremPage({ params }: PageProps) {
  const { slug } = await params;
  return <TheoremDetailClient slug={slug} />;
}
