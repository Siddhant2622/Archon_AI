"use client";

import { useEffect, useState, useRef } from "react";

// Hook to animate numbers
function useCountUp(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current && startOnView) {
      observer.observe(ref.current);
    } else {
      setHasStarted(true);
    }

    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // easeOutExpo
      const easing = progress === duration ? 1 : 1 - Math.pow(2, -10 * progress / duration);
      const current = Math.min(Math.floor(easing * end), end);
      
      setCount(current);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure exact finish
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, hasStarted]);

  return { count, ref };
}

export default function ImpactMetrics() {
  const linesFixed = useCountUp(847293);
  const securityPatches = useCountUp(12847);
  const usersCount = useCountUp(67);
  
  // Ticker items
  const tickerItems = [
    "Developer in Bangalore fixed SQL injection in 32s · 2 min ago",
    "Team at TechCorp resolved 14 circular dependencies · 5 min ago",
    "Startup in Berlin generated docs for 3,200-line codebase · 8 min ago",
    "Engineer in SF traced memory leak across 4 files · 12 min ago",
    "Agency in London secured 5 Lambda functions · 15 min ago"
  ];

  // Random active dots for map
  const [dots, setDots] = useState<Array<{id: number, x: number, y: number}>>([]);
  
  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      // Add a dot in general landmass areas (simplified coordinates)
      const x = 20 + Math.random() * 60; // Longitude roughly
      const y = 20 + Math.random() * 40; // Latitude roughly
      
      const newDot = { id: id++, x, y };
      setDots(prev => [...prev.slice(-10), newDot]); // Keep last 10
      
      // Remove after 3 seconds
      setTimeout(() => {
        setDots(prev => prev.filter(d => d.id !== newDot.id));
      }, 3000);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 relative overflow-hidden bg-[#0a0e17]">
      <div className="absolute inset-0 bg-grid-animated opacity-10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-bold text-accent-cyan uppercase tracking-widest mb-3">Real Developer Impact</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Archon AI is actively improving codebases right now
          </h2>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="card-glass p-8 text-center" ref={linesFixed.ref}>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-blue-500 mb-2">
              {linesFixed.count.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Lines of bugs fixed today</div>
          </div>
          
          <div className="card-glass p-8 text-center" ref={securityPatches.ref}>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-violet to-purple-500 mb-2">
              {securityPatches.count.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Security vulnerabilities patched</div>
          </div>

          <div className="card-glass p-8 text-center">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-green-500 mb-2">
              4.2 min
            </div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Average time saved per analysis</div>
          </div>

          <div className="card-glass p-8 text-center lg:col-span-2 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20">
              {/* Very simple abstract world map SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-accent-cyan">
                <path d="M20,30 Q30,20 40,30 T60,30 T80,40 T70,60 T40,70 T20,50 Z" />
                <path d="M70,20 Q80,10 90,30 T80,50 Z" />
                {dots.map(dot => (
                  <circle 
                    key={dot.id} 
                    cx={dot.x} 
                    cy={dot.y} 
                    r="2" 
                    className="fill-white animate-pulse-glow" 
                  />
                ))}
              </svg>
            </div>
            <div className="relative z-10 text-left">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2" ref={usersCount.ref}>
                {usersCount.count}
              </div>
              <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Countries with active users</div>
            </div>
          </div>

          <div className="card-glass p-8 text-center">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500 mb-2">
              99.2%
            </div>
            <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Fix Accuracy Rate</div>
          </div>
        </div>

        {/* Live Feed Ticker */}
        <div className="relative h-12 overflow-hidden rounded-xl border border-white/[0.06] bg-black/50 backdrop-blur-md flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/50 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/50 to-transparent z-10" />
          
          <div className="flex animate-[ticker_20s_linear_infinite] whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2 mx-8 text-sm text-text-secondary">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                {item}
              </div>
            ))}
          </div>
        </div>
        
        {/* Ticker Animation using style tag so we don't need tailwind config change */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
      </div>
    </section>
  );
}
