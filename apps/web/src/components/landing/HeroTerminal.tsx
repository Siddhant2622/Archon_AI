"use client";

import { useState, useEffect, useCallback } from "react";

const terminalLines = [
  { text: "$ archon scan ./my-project", type: "command" as const, delay: 0 },
  { text: "→ Scanning repository structure...", type: "info" as const, delay: 600 },
  { text: "→ Found 247 files across 18 directories", type: "info" as const, delay: 1200 },
  { text: "→ Building dependency graph...", type: "info" as const, delay: 1800 },
  { text: "→ Analyzing with AI engine...", type: "info" as const, delay: 2400 },
  { text: "", type: "blank" as const, delay: 3000 },
  { text: "  ✓ Architecture: Microservices (3 services detected)", type: "success" as const, delay: 3200 },
  { text: "  ✓ Stack: Next.js 15 + TypeScript + Prisma + Redis", type: "success" as const, delay: 3600 },
  { text: "  ✓ Test Coverage: 78% (above threshold)", type: "success" as const, delay: 4000 },
  { text: "", type: "blank" as const, delay: 4200 },
  { text: "  ⚠ WARN  Circular dependency: auth.ts → user.ts → auth.ts", type: "warning" as const, delay: 4400 },
  { text: "  ⚠ WARN  Unused export: formatCurrency() in utils/format.ts", type: "warning" as const, delay: 4800 },
  { text: "  ✗ ERROR SQL injection risk in api/users/[id]/route.ts:24", type: "error" as const, delay: 5200 },
  { text: "  ✗ ERROR Exposed secret in config/database.ts:8", type: "error" as const, delay: 5600 },
  { text: "", type: "blank" as const, delay: 5800 },
  { text: "  💡 TIP   Apply auto-fix: archon fix --all (2 patches ready)", type: "tip" as const, delay: 6000 },
  { text: "", type: "blank" as const, delay: 6200 },
  { text: "  Score: 73/100 | Issues: 4 | Fixable: 2 | Time: 3.2s", type: "result" as const, delay: 6400 },
];

const typeColors: Record<string, string> = {
  command: "text-accent-cyan",
  info: "text-text-secondary",
  success: "text-accent-emerald",
  warning: "text-accent-amber",
  error: "text-accent-rose",
  tip: "text-accent-violet",
  result: "text-text-primary font-medium",
  blank: "",
};

export default function HeroTerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  const runAnimation = useCallback(() => {
    setVisibleLines(0);
    setIsTyping(true);

    terminalLines.forEach((line, index) => {
      setTimeout(() => {
        setVisibleLines(index + 1);
        if (index === terminalLines.length - 1) {
          setIsTyping(false);
          // Restart after pause
          setTimeout(() => runAnimation(), 4000);
        }
      }, line.delay);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runAnimation(), 800);
    return () => clearTimeout(timer);
  }, [runAnimation]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
      {/* Terminal Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-bg-surface border-b border-white/[0.06]">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-rose/80" />
          <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
          <div className="w-3 h-3 rounded-full bg-accent-emerald/80" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[11px] text-text-muted font-mono">
            archon — ~/my-project
          </span>
        </div>
        <div className="w-14" /> {/* Balance spacer */}
      </div>

      {/* Terminal Body */}
      <div className="bg-[#0a0e14] p-5 font-mono text-[13px] leading-relaxed min-h-[340px] max-h-[400px] overflow-hidden">
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`${typeColors[line.type]} animate-fade-in`}
            style={{ animationDuration: "0.3s" }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}
        {/* Blinking cursor */}
        {isTyping && (
          <span className="inline-block w-2 h-4 bg-accent-cyan animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}
