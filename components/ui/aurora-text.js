"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export function AuroraText({ className, children, as: Component = "span", ...props }) {
  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      className={cn(
        "relative inline-flex bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--color-1))] via-[hsl(var(--color-2))] to-[hsl(var(--color-4))]",
        "animate-gradient-x",
        className
      )}
      {...props}
    >
      {children}
    </MotionComponent>
  );
} 