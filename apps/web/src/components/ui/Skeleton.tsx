"use client";

import { ReactNode } from "react";

export function Skeleton({ 
  variant = 'card', 
  className = '' 
}: { 
  variant?: 'text' | 'card' | 'avatar' | 'chart' | 'table' | 'code',
  className?: string 
}) {
  const baseClass = "relative overflow-hidden bg-white/[0.02] border border-white/[0.04]";
  const shimmerClass = "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent";
  
  const variants = {
    text: "h-4 rounded",
    card: "h-48 rounded-2xl",
    avatar: "w-12 h-12 rounded-full",
    chart: "h-64 rounded-2xl",
    table: "h-12 rounded-lg mb-2",
    code: "h-96 rounded-xl font-mono p-4",
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${shimmerClass} ${className}`}>
      {variant === 'code' && (
        <div className="space-y-3 opacity-30">
          <div className="h-3 bg-white/[0.1] rounded w-1/3" />
          <div className="h-3 bg-white/[0.1] rounded w-1/2 ml-4" />
          <div className="h-3 bg-white/[0.1] rounded w-1/4 ml-4" />
          <div className="h-3 bg-white/[0.1] rounded w-1/5" />
        </div>
      )}
    </div>
  );
}
