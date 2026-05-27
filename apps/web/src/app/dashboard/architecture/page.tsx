"use client";

import { useState, useEffect, type ReactNode, Suspense } from "react";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useArchitectureStore } from "@/stores/useArchitectureStore";
import ArchitectureGraph, { sampleArchitectureData } from "@/components/dashboard/ArchitectureGraph";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function ArchitecturePage() {
  const { description, result, setDescription, setResult } = useArchitectureStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data.data.architecture);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="code-block p-4 overflow-x-auto text-sm my-4">
              <code>{codeLines.join("\n")}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Table rows
      if (line.startsWith("| ")) {
        const cells = line.split("|").filter((c) => c.trim()).map((c) => c.trim());
        if (!line.includes("---")) {
          elements.push(
            <div key={i} className="flex border-b border-white/[0.06] text-sm">
              {cells.map((cell, ci) => (
                <div key={ci} className="flex-1 px-3 py-2 text-text-secondary font-mono text-xs">
                  {cell}
                </div>
              ))}
            </div>
          );
        }
        return;
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-base font-bold text-accent-cyan mt-6 mb-2">
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-text-primary mt-8 mb-3 pb-2 border-b border-white/[0.06]">
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-text-primary mt-6 mb-4">
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("> ")) {
        elements.push(
          <blockquote key={i} className="border-l-2 border-accent-cyan/30 pl-4 py-1 my-3 text-sm text-text-secondary italic">
            {line.replace("> ", "")}
          </blockquote>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={i} className="text-sm text-text-secondary ml-4 mb-1 list-disc">
            {line.replace(/^[-*] /, "")}
          </li>
        );
      } else if (line.match(/^\d+\. /)) {
        elements.push(
          <li key={i} className="text-sm text-text-secondary ml-4 mb-1 list-decimal">
            {line.replace(/^\d+\. /, "")}
          </li>
        );
      } else if (line.startsWith("**") && line.endsWith("**")) {
        elements.push(
          <p key={i} className="text-sm font-bold text-text-primary mt-3 mb-1">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      } else if (line.trim()) {
        elements.push(
          <p key={i} className="text-sm text-text-secondary leading-relaxed mb-2">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent-cyan/10 to-accent-violet/10 p-8 border border-white/5">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <Suspense fallback={null}>
              <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            </Suspense>
          </Canvas>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-text-primary">Architecture Visualizer</h1>
          <p className="text-sm text-text-secondary mt-2">
            Describe your project and let AI generate a comprehensive architecture blueprint in 3D space.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="card p-6">
        <Textarea
          label="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="!min-h-[120px]"
          placeholder="Describe your project requirements, scale, and key features..."
          hint="Be specific about scale, tech preferences, integrations, and deployment targets."
        />
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            loading={loading}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          >
            {loading ? "Generating..." : "Generate Architecture"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="card p-4 border-l-4 border-accent-rose">
          <p className="text-sm text-accent-rose font-semibold">⚠️ {error}</p>
        </div>
      )}

      {loading && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <div className="loading-spinner w-16 h-16" />
          <div className="text-center space-y-2">
            <p className="text-sm text-text-secondary font-medium">
              AI is designing your architecture...
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Analyzing requirements", "Designing services", "Planning infrastructure", "Writing blueprint"].map((step, i) => (
                <span key={step} className="text-xs px-3 py-1 rounded-full bg-accent-violet/10 text-accent-violet font-mono animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6">
          <div className="card p-1 border-white/[0.06]">
            <ArchitectureGraph data={sampleArchitectureData} />
          </div>
          <div className="card p-8">
            <h3 className="text-lg font-bold text-text-primary mb-4 border-b border-white/[0.06] pb-2">AI Analysis Report</h3>
            <div className="prose max-w-none">{renderMarkdown(result)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
