"use client";

import { useRef, type ReactNode } from "react";
import { use3DTilt } from "@/hooks/use3DTilt";

interface Card3DProps {
  children: ReactNode;
  glowColor?: string;
  intensity?: number;
  className?: string;
}

export default function Card3D({
  children,
  glowColor = "#22d3ee",
  intensity = 0.6,
  className = "",
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  use3DTilt(cardRef, { maxTilt: 12, scale: 1.02 });

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl border border-white/[0.08] bg-[#0a0e17]/80 backdrop-blur-md overflow-hidden ${className}`}
      style={
        {
          "--glow-color": glowColor,
          "--glow-intensity": intensity,
          transformStyle: "preserve-3d",
        } as React.CSSProperties
      }
    >
      {/* Shine effect that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 40%)`,
          opacity: "var(--opacity, 0)",
          mixBlendMode: "overlay",
        }}
      />
      
      {/* Dynamic glow border */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 20px -5px var(--glow-color)`,
          opacity: `calc(var(--opacity, 0) * var(--glow-intensity))`
        }}
      />

      <div className="relative z-20 h-full">
        {children}
      </div>
    </div>
  );
}
