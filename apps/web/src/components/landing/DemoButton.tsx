"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import ArchitectureGraph, { sampleArchitectureData } from "@/components/dashboard/ArchitectureGraph";
import SecurityShield from "@/components/3d/SecurityShield";

export default function DemoButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  const handleCopyCode = () => {
    const code = `function App() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`;
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="relative inline-flex h-12 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-bg-primary"
      >
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0a0e17_0%,#22d3ee_50%,#0a0e17_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-bg-secondary px-8 py-1 text-sm font-bold text-text-primary backdrop-blur-3xl transition-all hover:bg-bg-tertiary">
          🚀 Try Live Demo — No Login Needed
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 md:p-12">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0e17]/90 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Window */}
      <div className="relative w-full h-full max-w-6xl bg-bg-secondary border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-bg-tertiary">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <h2 className="font-bold text-text-primary text-lg">facebook/react</h2>
              <p className="text-xs text-text-muted">A declarative, efficient, and flexible JavaScript library for building user interfaces.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.1] text-text-muted hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex px-6 border-b border-white/[0.06] bg-bg-tertiary/50">
          {[
            { id: "analysis", label: "Analysis Results" },
            { id: "architecture", label: "Architecture" },
            { id: "docs", label: "Documentation" },
            { id: "security", label: "Security" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === t.id 
                  ? "border-accent-cyan text-accent-cyan" 
                  : "border-transparent text-text-muted hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-bg-primary">
          {activeTab === "analysis" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-24 h-24 rounded-full border-4 border-accent-emerald flex items-center justify-center text-3xl text-accent-emerald font-bold bg-accent-emerald/10 shadow-[0_0_20px_rgba(52,211,153,0.2)]">
                  89
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-1">Code Health Score</h3>
                  <p className="text-sm text-text-secondary">Overall architecture is solid. Found 12 warnings, 3 errors, and 45 suggestions across 14,203 files.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-text-primary">Key Findings</h4>
                
                <div className="card p-4 border-l-4 border-l-accent-rose">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-text-muted">packages/react-dom/src/client/ReactDOMComponent.js:1045</span>
                    <span className="text-[10px] uppercase px-2 py-1 rounded bg-accent-rose/10 text-accent-rose font-bold">Error</span>
                  </div>
                  <p className="text-sm text-text-primary mb-3">XSS vulnerability in attribute sanitization</p>
                  <p className="text-xs text-text-secondary mb-4">The attribute sanitizer fails to catch specifically crafted javascript: URIs when preceded by certain whitespace characters.</p>
                  <button className="btn-outline !py-1.5 !px-4 !text-xs">Apply AI Fix</button>
                </div>

                <div className="card p-4 border-l-4 border-l-accent-amber">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-text-muted">packages/react-reconciler/src/ReactFiberWorkLoop.js:421</span>
                    <span className="text-[10px] uppercase px-2 py-1 rounded bg-accent-amber/10 text-accent-amber font-bold">Warning</span>
                  </div>
                  <p className="text-sm text-text-primary mb-3">Potential memory leak in work loop closure</p>
                  <button className="btn-outline !py-1.5 !px-4 !text-xs">Apply AI Fix</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="h-full min-h-[500px]">
              <ArchitectureGraph data={sampleArchitectureData} />
            </div>
          )}

          {activeTab === "docs" && (
            <div className="prose max-w-none text-text-secondary">
              <h1 className="text-text-primary text-2xl font-bold mb-4">React - AI Generated Documentation</h1>
              <p>React is a library for building user interfaces. It uses a virtual DOM to efficiently update the browser DOM.</p>
              <h3 className="text-text-primary mt-6 mb-2 font-bold">Key Components</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Reconciler:</strong> The core algorithm that computes differences between trees.</li>
                <li><strong>Renderer (ReactDOM/ReactNative):</strong> Injects the computed changes into the host environment.</li>
                <li><strong>Scheduler:</strong> Manages priority of work to keep the main thread responsive.</li>
              </ul>
              <div className="relative group mt-6">
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Copy to clipboard"
                  aria-label="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                <pre className="bg-[#0f1724] p-4 rounded-lg text-sm overflow-x-auto border border-white/[0.06] pt-10">
                  <code className="text-accent-emerald">
{`function App() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h4 className="font-bold text-accent-emerald">Zero Critical Vulnerabilities</h4>
                    <p className="text-xs text-text-secondary">Passed OWASP Top 10 automated scan.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Injection Flaws",
                    "Broken Authentication",
                    "Sensitive Data Exposure",
                    "XML External Entities",
                    "Broken Access Control",
                    "Security Misconfiguration"
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 rounded-lg border border-white/[0.06] bg-white/[0.01]">
                      <span className="text-sm text-text-secondary">{item}</span>
                      <span className="text-accent-emerald">✅ Passed</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 3D Shield visualization */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#0f1724] border border-white/[0.06] rounded-xl relative overflow-hidden">
                <h4 className="text-sm font-bold text-text-primary z-10 relative">Real-time Defense Engine</h4>
                <p className="text-xs text-text-muted mb-4 z-10 relative">Continuous security monitoring active</p>
                <SecurityShield />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-bg-tertiary flex items-center justify-between">
          <p className="text-sm text-text-muted">Want to analyze your own repository?</p>
          <div className="flex gap-3">
            <button onClick={() => setIsOpen(false)} className="btn-ghost !py-2 !px-4">Close Demo</button>
            <Link href="/register" className="btn-primary !py-2 !px-4">Sign Up Free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
