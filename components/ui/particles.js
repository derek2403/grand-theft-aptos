"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Particles({
  className,
  quantity = 80,
  color = "#ffffff",
  lineColor = "#ffffff",
  speed = 6,
  size = 3,
  lineWidth = 1,
  lineDistance = 150,
}) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const context = useRef(null);
  const particles = useRef([]);
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  const initCanvas = useCallback(() => {
    if (!canvasContainerRef.current) return;
    
    canvasSize.current.w = canvasContainerRef.current.offsetWidth;
    canvasSize.current.h = canvasContainerRef.current.offsetHeight;
    
    canvasRef.current.width = canvasSize.current.w * dpr;
    canvasRef.current.height = canvasSize.current.h * dpr;
    
    canvasRef.current.style.width = `${canvasSize.current.w}px`;
    canvasRef.current.style.height = `${canvasSize.current.h}px`;
    
    context.current = canvasRef.current.getContext("2d");
    context.current.scale(dpr, dpr);
  }, [dpr]);

  const initParticles = useCallback(() => {
    particles.current = Array.from({ length: quantity }, () => ({
      x: Math.random() * canvasSize.current.w,
      y: Math.random() * canvasSize.current.h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * size + 1,
    }));
  }, [quantity, speed, size]);

  const drawParticles = useCallback(() => {
    context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    
    // Draw particles
    particles.current.forEach(particle => {
      context.current.beginPath();
      context.current.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.current.fillStyle = color;
      context.current.fill();

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Bounce off walls
      if (particle.x < 0 || particle.x > canvasSize.current.w) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvasSize.current.h) particle.vy *= -1;
    });

    // Draw connecting lines
    particles.current.forEach((p1, i) => {
      particles.current.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < lineDistance) {
          context.current.beginPath();
          context.current.strokeStyle = lineColor;
          context.current.globalAlpha = 1 - (distance / lineDistance);
          context.current.lineWidth = lineWidth;
          context.current.moveTo(p1.x, p1.y);
          context.current.lineTo(p2.x, p2.y);
          context.current.stroke();
          context.current.globalAlpha = 1;
        }
      });
    });
  }, [color, lineColor, lineDistance, lineWidth]);

  const animate = useCallback(() => {
    drawParticles();
    requestAnimationFrame(animate);
  }, [drawParticles]);

  useEffect(() => {
    initCanvas();
    initParticles();
    animate();

    window.addEventListener("resize", () => {
      initCanvas();
      initParticles();
    });

    return () => {
      window.removeEventListener("resize", initCanvas);
    };
  }, [animate, initCanvas, initParticles]);

  return (
    <div ref={canvasContainerRef} className={cn("absolute inset-0", className)}>
      <canvas ref={canvasRef} />
    </div>
  );
} 