'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  vr: number;
  opacity: number;
}

export function Confetti({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#38bdf8', '#f43f5e', '#fbbf24', '#34d399', '#a855f7', '#ec4899', '#f97316'];
    const particles: Particle[] = [];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 120,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 6,
        w: Math.random() * 8 + 6,
        h: Math.random() * 14 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        opacity: 1,
      });
    }

    let animId: number;
    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.42; // 重力加速度
        p.vx *= 0.985; // 空气阻力
        p.rotation += p.vr;
        if (frame > 35) {
          p.opacity -= 0.016;
        }

        if (p.opacity > 0 && p.y < canvas.height + 40) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      frame++;
      if (aliveCount > 0 && frame < 120) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete?.();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
