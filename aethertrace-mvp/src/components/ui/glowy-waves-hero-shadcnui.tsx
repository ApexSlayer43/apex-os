"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

interface WaveConfig {
  offset: number;
  amplitude: number;
  frequency: number;
  color: string;
  opacity: number;
}

export function SealWavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let animationId: number;
    let time = 0;

    // AetherTrace silver wave palette — hardcoded for brand consistency
    const wavePalette: WaveConfig[] = [
      { offset: 0, amplitude: 50, frequency: 0.003, color: "rgba(200,212,228,0.5)", opacity: 0.25 },
      { offset: Math.PI / 2, amplitude: 65, frequency: 0.0026, color: "rgba(184,212,255,0.4)", opacity: 0.18 },
      { offset: Math.PI, amplitude: 40, frequency: 0.0034, color: "rgba(200,212,228,0.35)", opacity: 0.15 },
      { offset: Math.PI * 1.5, amplitude: 55, frequency: 0.0022, color: "rgba(126,184,247,0.2)", opacity: 0.12 },
      { offset: Math.PI * 2, amplitude: 35, frequency: 0.004, color: "rgba(200,212,228,0.15)", opacity: 0.1 },
    ];

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseInfluence = prefersReducedMotion ? 10 : 50;
    const influenceRadius = prefersReducedMotion ? 160 : 320;
    const smoothing = prefersReducedMotion ? 0.04 : 0.08;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const recenterMouse = () => {
      const centerPoint = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = centerPoint;
      targetMouseRef.current = centerPoint;
    };

    const handleResize = () => { resizeCanvas(); recenterMouse(); };
    const handleMouseMove = (event: MouseEvent) => {
      targetMouseRef.current = { x: event.clientX, y: event.clientY };
    };
    const handleMouseLeave = () => { recenterMouse(); };

    resizeCanvas();
    recenterMouse();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const drawWave = (wave: WaveConfig) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height * 0.6 - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const mouseEffect = influence * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset);

        const y =
          canvas.height * 0.6 +
          Math.sin(x * wave.frequency + time * 0.0015 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.002) * (wave.amplitude * 0.35) +
          mouseEffect;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 25;
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      // Clear with void background
      ctx.fillStyle = "#02050B";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      wavePalette.forEach(drawWave);

      animationId = window.requestAnimationFrame(animate);
    };

    animationId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
