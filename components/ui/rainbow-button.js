import React from "react";
import { cn } from "@/lib/utils";

export const RainbowButton = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-white transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.12*1rem)_solid_transparent]",
        "shadow-[0_0_20px_rgba(255,255,255,0.3)]",
        "hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transform-gpu",
        "before:absolute before:bottom-[-40%] before:left-1/2 before:z-0 before:h-1/3 before:w-full before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(1.8*1rem))]",
        "bg-[linear-gradient(#000,#000),linear-gradient(#000_50%,rgba(0,0,0,0.8)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        "dark:bg-[linear-gradient(#000,#000),linear-gradient(#000_50%,rgba(0,0,0,0.8)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

RainbowButton.displayName = "RainbowButton"; 