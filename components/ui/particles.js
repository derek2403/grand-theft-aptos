"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Particles({
  className,
  quantity = 100,
  staticity = 50,
  ease = 50,
  refresh = false,
  color = "#ffffff",
  size = 0.4,
  vx = 0,
  vy = 0
}) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const context = useRef(null);
  const circles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  const onMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

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

  const initCircles = useCallback(() => {
    circles.current = [...new Array(quantity)].map(() => ({
      x: Math.random() * canvasSize.current.w,
      y: Math.random() * canvasSize.current.h,
      translateX: 0,
      translateY: 0,
      size: Math.random() * size,
      alpha: 0,
      targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
    }));
  }, [quantity, size]);

  const drawCircles = useCallback(() => {
    circles.current.forEach((circle, i) => {
      const distance = {
        x: mouse.current.x - circle.x,
        y: mouse.current.y - circle.y,
      };
      
      circle.translateX +=
        (distance.x / (staticity / distance.x)) * ease + vx;
      circle.translateY +=
        (distance.y / (staticity / distance.y)) * ease + vy;
      
      circle.alpha += (circle.targetAlpha - circle.alpha) * 0.1;
      
      context.current.beginPath();
      context.current.fillStyle = color;
      context.current.globalAlpha = circle.alpha;
      context.current.arc(
        circle.x + circle.translateX,
        circle.y + circle.translateY,
        circle.size,
        0,
        2 * Math.PI
      );
      context.current.fill();
    });
  }, [color, ease, staticity, vx, vy]);

  const animate = useCallback(() => {
    context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    drawCircles();
    requestAnimationFrame(animate);
  }, [drawCircles]);

  useEffect(() => {
    initCanvas();
    initCircles();
    animate();

    window.addEventListener("resize", initCanvas);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("resize", initCanvas);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [animate, initCanvas, initCircles, onMouseMove]);

  useEffect(() => {
    if (refresh) {
      initCircles();
    }
  }, [refresh, initCircles]);

  return (
    <div ref={canvasContainerRef} className={cn("fixed inset-0", className)}>
      <canvas ref={canvasRef} />
    </div>
  );
} 