"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Hide after 1.5s
    const timer = setTimeout(() => {
      setShow(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[999] bg-bg-primary flex flex-col items-center justify-center transition-transform duration-700 ease-in-out ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Rotating dashed circle */}
        <div className="absolute inset-[-40px] border border-dashed border-white/[0.1] border-t-accent-cyan rounded-full animate-[spin_3s_linear_infinite]" />
        
        {/* Pulsing logo */}
        <div className="animate-pulse-glow">
          <Logo size="lg" />
        </div>
        
        {/* Typing text */}
        <div className="mt-12 flex flex-col items-center">
          <div className="overflow-hidden whitespace-nowrap animate-[typewriter_1s_steps(40,end)]">
            <span className="text-sm font-mono text-text-secondary tracking-widest uppercase">
              Initializing AI Engine...
            </span>
          </div>
          <div className="w-48 h-1 mt-4 bg-white/[0.05] rounded-full overflow-hidden">
            <div className="h-full bg-accent-cyan animate-[shimmer_1s_ease-in-out_infinite] w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
